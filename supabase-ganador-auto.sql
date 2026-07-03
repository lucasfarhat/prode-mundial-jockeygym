-- ============================================================
-- GANADOR SEMANAL AUTOMATICO
-- Calcula solo el ganador de cada semana TERMINADA (lunes a domingo, hora
-- Argentina) que todavia no este cargada, y lo agenda via pg_cron.
--
-- Convencion de semanas (elegida por Lucas):
--   Semana 1 = 11-18 jun (queda como esta, cargada a mano). NO se toca.
--   Semana 2 = lun 15 - dom 21 jun
--   Semana 3 = lun 22 - dom 28 jun
--   Semana 4 = lun 29 jun - dom 5 jul ... y asi.
-- Ejecutar en: Supabase -> SQL Editor (idempotente)
-- ============================================================

-- 1. Logica de calculo (SIN chequeo de admin, para poder correrla desde el
--    cron). Interna: no se expone a los usuarios.
create or replace function public._calc_ganadores_impl(
  p_semana int, p_inicio date, p_fin date
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cupos int;
  v_premio text;
begin
  select cantidad_ganadores, premio into v_cupos, v_premio
  from public.premios_semanales where semana = p_semana;
  if v_cupos is null then v_cupos := 1; end if;

  -- recalculo limpio de la semana
  delete from public.ganadores_semanales where semana = p_semana;

  with stats as (
    select
      pr.user_id,
      trim(p.nombre || ' ' || coalesce(p.apellido, '')) as nombre,
      sum(pr.puntos_obtenidos)::int as puntos,
      count(*) filter (where pr.puntos_obtenidos = 3)::int as exactos,
      coalesce(sum(
        abs(pr.goles_local - pa.resultado_local) +
        abs(pr.goles_visitante - pa.resultado_visitante)
      ), 0)::int as diferencia
    from public.pronosticos pr
    join public.partidos pa on pa.id = pr.partido_id
    join public.perfiles p on p.id = pr.user_id
    where pa.jugado = true
      and (pa.fecha at time zone 'America/Argentina/Buenos_Aires')::date
          between p_inicio and p_fin
    group by pr.user_id, p.nombre, p.apellido
  ),
  ranked as (
    select *,
      rank() over (order by puntos desc, exactos desc, diferencia asc) as pos,
      count(*) over (partition by puntos, exactos, diferencia) as grupo_size
    from stats
  )
  insert into public.ganadores_semanales
    (semana, fecha_inicio, fecha_fin, user_id, nombre_ganador,
     puntos_semana, exactos_semana, diferencia_semana, premio, empate_pendiente)
  select
    p_semana, p_inicio, p_fin, user_id, nombre,
    puntos, exactos, diferencia, v_premio,
    (pos + grupo_size - 1) > v_cupos
  from ranked
  where pos <= v_cupos;
end;
$$;

-- 2. Wrapper de admin (mantiene la firma que usa el front y el chequeo)
create or replace function public.calcular_ganadores_semana(
  p_semana int, p_fecha_inicio date, p_fecha_fin date
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cupos int;
  v_total int;
  v_empatados int;
begin
  if not public.is_admin() then
    raise exception 'Solo administradores pueden calcular ganadores';
  end if;

  perform public._calc_ganadores_impl(p_semana, p_fecha_inicio, p_fecha_fin);

  select coalesce((select cantidad_ganadores from public.premios_semanales where semana = p_semana), 1)
    into v_cupos;
  select count(*), count(*) filter (where empate_pendiente)
    into v_total, v_empatados
  from public.ganadores_semanales where semana = p_semana;

  return json_build_object(
    'semana', p_semana, 'cupos', v_cupos,
    'ganadores', v_total, 'empatados', v_empatados,
    'sorteo_pendiente', v_empatados > 0
  );
end;
$$;

-- 3. Auto: recorre las semanas terminadas y calcula las que falten
create or replace function public.calcular_ganadores_auto()
returns int
language plpgsql
security definer
set search_path = public
as $$
declare
  v_ref date := date '2026-06-15';  -- lunes de la Semana 2
  v_hoy date := (now() at time zone 'America/Argentina/Buenos_Aires')::date;
  v_lunes date := date '2026-06-15';
  v_domingo date;
  v_semana int;
  v_hechas int := 0;
begin
  while v_lunes <= v_hoy loop
    v_domingo := v_lunes + 6;
    v_semana := 2 + ((v_lunes - v_ref) / 7);

    if v_domingo < v_hoy                       -- semana ya terminada
       and not exists (select 1 from public.ganadores_semanales where semana = v_semana)
       and exists (
         select 1 from public.partidos pa
         where pa.jugado = true
           and (pa.fecha at time zone 'America/Argentina/Buenos_Aires')::date
               between v_lunes and v_domingo
       )
    then
      perform public._calc_ganadores_impl(v_semana, v_lunes, v_domingo);
      v_hechas := v_hechas + 1;
    end if;

    v_lunes := v_lunes + 7;
  end loop;
  return v_hechas;
end;
$$;

-- 4. Seguridad: estas dos NO se exponen a los usuarios (solo cron/owner)
revoke all on function public._calc_ganadores_impl(int, date, date) from public;
revoke all on function public.calcular_ganadores_auto() from public;

-- 5. Agendar cada 6 horas (idempotente: solo llena semanas terminadas y faltantes)
do $$ begin
  if exists (select 1 from cron.job where jobname = 'ganador-semanal') then
    perform cron.unschedule('ganador-semanal');
  end if;
end $$;
select cron.schedule('ganador-semanal', '0 */6 * * *', $$select public.calcular_ganadores_auto();$$);

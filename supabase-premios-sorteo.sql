-- ============================================================
-- PREMIOS SEMANALES + MULTIPLES GANADORES + SORTEO POR EMPATE
-- Ejecutar en: supabase.com → tu proyecto → SQL Editor
-- (correr DESPUES del schema base y de supabase-registro-sede.sql,
--  porque usa la columna perfiles.apellido; es idempotente)
-- ============================================================

-- 0. Funcion is_admin (ya existe en prod por el fix de RLS recursion;
--    se incluye aca para que el archivo sea autocontenido en clones nuevos)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (select es_admin from public.perfiles where id = auth.uid()),
    false
  );
$$;


-- 1. TABLA DE PREMIOS SEMANALES
-- El admin define, por semana, cual es el premio y cuantos ganadores hay.
create table if not exists public.premios_semanales (
  semana int primary key,
  premio text not null,
  cantidad_ganadores int not null default 1 check (cantidad_ganadores >= 1),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.premios_semanales enable row level security;

drop policy if exists "Todos ven premios" on public.premios_semanales;
create policy "Todos ven premios"
  on public.premios_semanales for select
  to authenticated
  using (true);

drop policy if exists "Admins insertan premios" on public.premios_semanales;
create policy "Admins insertan premios"
  on public.premios_semanales for insert
  with check (public.is_admin());

drop policy if exists "Admins actualizan premios" on public.premios_semanales;
create policy "Admins actualizan premios"
  on public.premios_semanales for update
  using (public.is_admin());

drop policy if exists "Admins borran premios" on public.premios_semanales;
create policy "Admins borran premios"
  on public.premios_semanales for delete
  using (public.is_admin());


-- 2. COLUMNAS NUEVAS EN ganadores_semanales
alter table public.ganadores_semanales
  add column if not exists premio text,
  add column if not exists empate_pendiente boolean not null default false,
  add column if not exists definido_por_sorteo boolean not null default false;

create unique index if not exists ganadores_semanales_semana_user_uq
  on public.ganadores_semanales (semana, user_id);


-- 3. FUNCION: calcular ganadores de la semana
-- Soporta N ganadores (segun premios_semanales.cantidad_ganadores, default 1).
-- Si hay empate total en el corte (mismos puntos, exactos y diferencia y no
-- entran todos en los cupos), inserta a TODOS los empatados marcados con
-- empate_pendiente = true para que el admin lo defina por sorteo.
-- Se puede re-correr: borra y recalcula la semana.
create or replace function public.calcular_ganadores_semana(
  p_semana int,
  p_fecha_inicio date,
  p_fecha_fin date
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cupos int;
  v_premio text;
  v_total int;
  v_empatados int;
begin
  if not public.is_admin() then
    raise exception 'Solo administradores pueden calcular ganadores';
  end if;

  select cantidad_ganadores, premio
    into v_cupos, v_premio
  from public.premios_semanales
  where semana = p_semana;

  if v_cupos is null then
    v_cupos := 1;
  end if;

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
    where pa.fecha::date between p_fecha_inicio and p_fecha_fin
      and pa.jugado = true
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
    p_semana, p_fecha_inicio, p_fecha_fin, user_id, nombre,
    puntos, exactos, diferencia, v_premio,
    -- el grupo empatado no entra completo en los cupos => sorteo pendiente
    (pos + grupo_size - 1) > v_cupos
  from ranked
  where pos <= v_cupos;

  select count(*), count(*) filter (where empate_pendiente)
    into v_total, v_empatados
  from public.ganadores_semanales
  where semana = p_semana;

  return json_build_object(
    'semana', p_semana,
    'cupos', v_cupos,
    'ganadores', v_total,
    'empatados', v_empatados,
    'sorteo_pendiente', v_empatados > 0
  );
end;
$$;


-- 4. FUNCION: sorteo entre empatados
-- Elige al azar los cupos que faltan entre los marcados con
-- empate_pendiente y elimina al resto. Los sorteados quedan con
-- definido_por_sorteo = true.
create or replace function public.sortear_ganadores_semana(p_semana int)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_cupos int;
  v_confirmados int;
  v_a_sortear int;
  v_eliminados int;
begin
  if not public.is_admin() then
    raise exception 'Solo administradores pueden sortear';
  end if;

  select coalesce(
    (select cantidad_ganadores from public.premios_semanales where semana = p_semana),
    1
  ) into v_cupos;

  select count(*) into v_confirmados
  from public.ganadores_semanales
  where semana = p_semana and empate_pendiente = false;

  v_a_sortear := v_cupos - v_confirmados;

  if v_a_sortear <= 0 then
    raise exception 'No hay cupos pendientes de sorteo en la semana %', p_semana;
  end if;

  if not exists (
    select 1 from public.ganadores_semanales
    where semana = p_semana and empate_pendiente = true
  ) then
    raise exception 'No hay empate pendiente en la semana %', p_semana;
  end if;

  with elegidos as (
    select id from public.ganadores_semanales
    where semana = p_semana and empate_pendiente = true
    order by random()
    limit v_a_sortear
  )
  update public.ganadores_semanales g
  set empate_pendiente = false,
      definido_por_sorteo = true
  where g.id in (select id from elegidos);

  delete from public.ganadores_semanales
  where semana = p_semana and empate_pendiente = true;

  get diagnostics v_eliminados = row_count;

  return json_build_object(
    'semana', p_semana,
    'sorteados', v_a_sortear,
    'eliminados', v_eliminados
  );
end;
$$;

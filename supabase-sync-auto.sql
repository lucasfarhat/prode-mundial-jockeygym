-- ============================================================
-- SYNC AUTOMATICO DE RESULTADOS — Mundial 2026
-- Ya aplicado en la base. Este archivo documenta como esta armado.
--
-- Como funciona:
--   1. Cada partido de public.partidos tiene un external_id = id del
--      partido en football-data.org (se vincula una vez, por nombre de equipo).
--   2. pg_cron ejecuta public.sync_mundial() cada 10 minutos.
--   3. La funcion consulta football-data.org via la extension http (sincronica),
--      trae los partidos TERMINADOS y carga el resultado en los que falten.
--   4. El trigger trg_calcular_puntos reparte los puntos automaticamente.
--
-- La API key NO esta en este archivo: se guarda en private.secrets
-- (esquema no expuesto por la API publica). Para setearla/rotarla:
--   insert into private.secrets(name, value) values ('footballdata_key', 'TU_KEY')
--   on conflict (name) do update set value = excluded.value;
-- ============================================================

-- Extensiones
create extension if not exists pg_cron;
create extension if not exists http with schema extensions;

-- Columna de vinculo con la API
alter table public.partidos add column if not exists external_id text;
create index if not exists idx_partidos_external_id on public.partidos(external_id);

-- Esquema privado para la API key (no accesible desde el cliente)
create schema if not exists private;
create table if not exists private.secrets (name text primary key, value text not null);

-- Asegura que el serial de id quede por encima de los partidos ya cargados,
-- para que el sync pueda insertar las fases eliminatorias nuevas sin chocar.
select setval(pg_get_serial_sequence('public.partidos', 'id'),
              greatest((select coalesce(max(id), 1) from public.partidos), 1));

-- Funcion de sincronizacion (v4: ademas de resultados y fechas, CREA y
-- completa todas las fases eliminatorias a medida que la API las publica)
create or replace function public.sync_mundial()
returns int
language plpgsql
security definer
set search_path = public, extensions
as $fn$
declare
  v_key text;
  v_resp extensions.http_response;
  v_m jsonb;
  v_updated int := 0;
  v_pending int;
  v_fase text;
  v_local text;
  v_visit text;
  v_home int;
  v_away int;
begin
  -- Corre si hay partidos en los proximos 7 dias, o si todavia no estan
  -- los 104 partidos del torneo (para ir creando las fases eliminatorias).
  select count(*) into v_pending
  from public.partidos
  where jugado = false and external_id is not null
    and fecha < now() + interval '7 days';
  if v_pending = 0 and (select count(*) from public.partidos) >= 104 then
    return 0;
  end if;

  select value into v_key from private.secrets where name = 'footballdata_key';
  if v_key is null then return 0; end if;

  select * into v_resp from extensions.http((
    'GET',
    'https://api.football-data.org/v4/competitions/2000/matches',
    array[extensions.http_header('X-Auth-Token', v_key)],
    null, null
  )::extensions.http_request);

  if v_resp.status <> 200 then
    raise notice 'football-data status %', v_resp.status;
    return 0;
  end if;

  for v_m in select value from jsonb_array_elements((v_resp.content::jsonb) -> 'matches')
  loop
    -- Mapea la etapa de la API a nuestra fase
    v_fase := case v_m->>'stage'
      when 'LAST_32' then 'R32'
      when 'LAST_16' then 'R16'
      when 'QUARTER_FINALS' then 'QF'
      when 'SEMI_FINALS' then 'SF'
      when 'THIRD_PLACE' then '3P'
      when 'FINAL' then 'F'
      else null
    end;

    if (v_m->>'status') = 'FINISHED' and (v_m #>> '{score,fullTime,home}') is not null then
      -- Resultado final = al terminar la prorroga, SIN penales (regla del
      -- prode). OJO: si el partido fue a penales, football-data SUMA los
      -- penales dentro de fullTime (ej: 1-1 + 4-2 pen => fullTime 5-3),
      -- asi que se los restamos. Sin penales, penalties es null y no resta.
      -- Autocorrige aunque el partido ya estuviera cargado, si el oficial
      -- cambio (evita resultados "trabados"). El trigger recalcula puntos.
      v_home := (v_m #>> '{score,fullTime,home}')::int
                - coalesce((v_m #>> '{score,penalties,home}')::int, 0);
      v_away := (v_m #>> '{score,fullTime,away}')::int
                - coalesce((v_m #>> '{score,penalties,away}')::int, 0);

      update public.partidos p
      set resultado_local = v_home,
          resultado_visitante = v_away,
          jugado = true
      where p.external_id = (v_m ->> 'id')
        and (p.jugado = false
             or p.resultado_local is distinct from v_home
             or p.resultado_visitante is distinct from v_away);
      if found then v_updated := v_updated + 1; end if;

    elsif v_fase is not null then
      -- Fase eliminatoria no jugada: crear o actualizar el partido.
      -- Traduce los equipos ingles->español (con tildes para las banderas);
      -- si la API aun no los definio, quedan / se mantienen en 'Por definir'.
      v_local := coalesce((select es from private.team_es where en = v_m #>> '{homeTeam,name}'), 'Por definir');
      v_visit := coalesce((select es from private.team_es where en = v_m #>> '{awayTeam,name}'), 'Por definir');

      if exists (select 1 from public.partidos where external_id = v_m->>'id') then
        update public.partidos p
        set fecha = (v_m->>'utcDate')::timestamptz,
            equipo_local = case when v_local <> 'Por definir' then v_local else p.equipo_local end,
            equipo_visitante = case when v_visit <> 'Por definir' then v_visit else p.equipo_visitante end
        where p.external_id = v_m->>'id' and p.jugado = false;
      else
        insert into public.partidos
          (fase, equipo_local, flag_local, equipo_visitante, flag_visitante, fecha, jugado, external_id)
        values
          (v_fase, v_local, '🏳️', v_visit, '🏳️', (v_m->>'utcDate')::timestamptz, false, v_m->>'id');
      end if;

    elsif (v_m->>'status') in ('SCHEDULED', 'TIMED', 'IN_PLAY', 'PAUSED') then
      -- Fase de grupos no jugada: solo refresca el horario oficial
      update public.partidos p
      set fecha = (v_m ->> 'utcDate')::timestamptz
      where p.external_id = (v_m ->> 'id')
        and p.jugado = false
        and p.fecha is distinct from (v_m ->> 'utcDate')::timestamptz;
    end if;
  end loop;
  return v_updated;
end;
$fn$;

-- Programar cada 10 minutos
do $$ begin
  if exists (select 1 from cron.job where jobname = 'sync-mundial') then
    perform cron.unschedule('sync-mundial');
  end if;
end $$;
select cron.schedule('sync-mundial', '*/10 * * * *', $$select public.sync_mundial();$$);

-- Util: para correrlo a mano ->  select public.sync_mundial();
-- Util: para apagarlo        ->  select cron.unschedule('sync-mundial');

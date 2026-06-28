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

-- Funcion de sincronizacion
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
begin
  -- Llama a la API si hay resultados pendientes O partidos en las proximas
  -- 48 horas (asi tambien refresca horarios que la FIFA pueda mover).
  select count(*) into v_pending
  from public.partidos
  where jugado = false and external_id is not null
    and fecha < now() + interval '48 hours';
  if v_pending = 0 then return 0; end if;

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
    if (v_m->>'status') = 'FINISHED' and (v_m #>> '{score,fullTime,home}') is not null then
      update public.partidos p
      set resultado_local = (v_m #>> '{score,fullTime,home}')::int,
          resultado_visitante = (v_m #>> '{score,fullTime,away}')::int,
          jugado = true
      where p.external_id = (v_m ->> 'id') and p.jugado = false;
      if found then v_updated := v_updated + 1; end if;
    elsif (v_m->>'status') in ('SCHEDULED', 'TIMED', 'IN_PLAY', 'PAUSED') then
      -- Actualiza horario oficial (la FIFA mueve partidos) y, en
      -- eliminatorias, completa los equipos que la API va definiendo.
      -- Los nombres se traducen ingles->español con private.team_es para
      -- que coincidan con las banderas. Si la API aun no definio el equipo
      -- (homeTeam.name null), coalesce mantiene el 'Por definir' actual.
      update public.partidos p
      set fecha = (v_m ->> 'utcDate')::timestamptz,
          equipo_local = coalesce(
            (select es from private.team_es where en = v_m #>> '{homeTeam,name}'),
            p.equipo_local),
          equipo_visitante = coalesce(
            (select es from private.team_es where en = v_m #>> '{awayTeam,name}'),
            p.equipo_visitante)
      where p.external_id = (v_m ->> 'id')
        and p.jugado = false;
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

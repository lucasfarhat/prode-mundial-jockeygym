-- ============================================================
-- VISTA: tabla_semana_actual
-- Tabla de posiciones contando SOLO los partidos de la semana
-- en curso (lunes a domingo, hora Argentina). Mismo formato que
-- tabla_posiciones (con nombre + apellido).
-- Ejecutar en: Supabase -> SQL Editor (idempotente)
-- ============================================================

create or replace view public.tabla_semana_actual as
with semana as (
  select date_trunc('week', (now() at time zone 'America/Argentina/Buenos_Aires')) as inicio
)
select
  p.id as user_id,
  trim(p.nombre || ' ' || coalesce(p.apellido, '')) as nombre,
  count(case when pr.puntos_obtenidos = 3 then 1 end)::int as exactos,
  count(case when pr.puntos_obtenidos = 1 then 1 end)::int as ganadores,
  coalesce(sum(pr.puntos_obtenidos), 0)::int as puntos,
  coalesce(sum(
    abs(pr.goles_local - pa.resultado_local) +
    abs(pr.goles_visitante - pa.resultado_visitante)
  ) filter (where pa.jugado), 0)::int as diferencia_total
from public.perfiles p
cross join semana s
left join public.partidos pa
  on pa.jugado = true
  and (pa.fecha at time zone 'America/Argentina/Buenos_Aires') >= s.inicio
  and (pa.fecha at time zone 'America/Argentina/Buenos_Aires') < (s.inicio + interval '7 days')
left join public.pronosticos pr
  on pr.partido_id = pa.id and pr.user_id = p.id
group by p.id, p.nombre, p.apellido;

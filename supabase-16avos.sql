-- ============================================================
-- 16avos de final (Ronda de 32) + tabla de traduccion de nombres
-- para que el sync autocomplete los cruces que la API aun no publico.
-- Ejecutar en: Supabase -> SQL Editor (idempotente)
-- ============================================================

-- Mapa nombre-API (ingles) -> nombre en español con tildes (para flags)
create table if not exists private.team_es (en text primary key, es text not null);
insert into private.team_es (en, es) values
  ('Switzerland', 'Suiza'),
  ('Brazil', 'Brasil'),
  ('Portugal', 'Portugal'),
  ('Argentina', 'Argentina'),
  ('Sweden', 'Suecia'),
  ('Haiti', 'Haití'),
  ('Scotland', 'Escocia'),
  ('Canada', 'Canadá'),
  ('Algeria', 'Argelia'),
  ('Iraq', 'Irak'),
  ('Panama', 'Panamá'),
  ('Morocco', 'Marruecos'),
  ('Saudi Arabia', 'Arabia Saudita'),
  ('Cape Verde Islands', 'Cabo Verde'),
  ('Bosnia-Herzegovina', 'Bosnia y Herzegovina'),
  ('Turkey', 'Turquía'),
  ('Senegal', 'Senegal'),
  ('Tunisia', 'Túnez'),
  ('Qatar', 'Qatar'),
  ('Egypt', 'Egipto'),
  ('Jordan', 'Jordania'),
  ('Ecuador', 'Ecuador'),
  ('Australia', 'Australia'),
  ('Netherlands', 'Países Bajos'),
  ('Colombia', 'Colombia'),
  ('Iran', 'Irán'),
  ('Croatia', 'Croacia'),
  ('France', 'Francia'),
  ('Japan', 'Japón'),
  ('Czechia', 'República Checa'),
  ('Curaçao', 'Curazao'),
  ('Paraguay', 'Paraguay'),
  ('Norway', 'Noruega'),
  ('Austria', 'Austria'),
  ('Spain', 'España'),
  ('Uzbekistan', 'Uzbekistán'),
  ('New Zealand', 'Nueva Zelanda'),
  ('United States', 'EE.UU.'),
  ('Germany', 'Alemania'),
  ('Mexico', 'México'),
  ('Ivory Coast', 'Costa de Marfil'),
  ('Ghana', 'Ghana'),
  ('South Korea', 'Corea del Sur'),
  ('England', 'Inglaterra'),
  ('Belgium', 'Bélgica'),
  ('Uruguay', 'Uruguay'),
  ('South Africa', 'Sudáfrica'),
  ('Congo DR', 'RD Congo')
on conflict (en) do update set es = excluded.es;

-- Partidos de 16avos (ids 73-88). external_id = id de football-data.
insert into public.partidos
  (id, fase, equipo_local, flag_local, equipo_visitante, flag_visitante, fecha, jugado, external_id)
values
  (73, 'R32', 'Sudáfrica', '🏳️', 'Canadá', '🏳️', '2026-06-28T19:00:00Z'::timestamptz, false, '537417'),
  (74, 'R32', 'Brasil', '🏳️', 'Japón', '🏳️', '2026-06-29T17:00:00Z'::timestamptz, false, '537423'),
  (75, 'R32', 'Alemania', '🏳️', 'Por definir', '🏳️', '2026-06-29T20:30:00Z'::timestamptz, false, '537415'),
  (76, 'R32', 'Países Bajos', '🏳️', 'Marruecos', '🏳️', '2026-06-30T01:00:00Z'::timestamptz, false, '537418'),
  (77, 'R32', 'Costa de Marfil', '🏳️', 'Por definir', '🏳️', '2026-06-30T17:00:00Z'::timestamptz, false, '537424'),
  (78, 'R32', 'Por definir', '🏳️', 'Por definir', '🏳️', '2026-06-30T21:00:00Z'::timestamptz, false, '537416'),
  (79, 'R32', 'México', '🏳️', 'Por definir', '🏳️', '2026-07-01T01:00:00Z'::timestamptz, false, '537425'),
  (80, 'R32', 'Por definir', '🏳️', 'Por definir', '🏳️', '2026-07-01T16:00:00Z'::timestamptz, false, '537426'),
  (81, 'R32', 'Por definir', '🏳️', 'Por definir', '🏳️', '2026-07-01T20:00:00Z'::timestamptz, false, '537422'),
  (82, 'R32', 'EE.UU.', '🏳️', 'Bosnia y Herzegovina', '🏳️', '2026-07-02T00:00:00Z'::timestamptz, false, '537421'),
  (83, 'R32', 'Por definir', '🏳️', 'Por definir', '🏳️', '2026-07-02T19:00:00Z'::timestamptz, false, '537420'),
  (84, 'R32', 'Por definir', '🏳️', 'Por definir', '🏳️', '2026-07-02T23:00:00Z'::timestamptz, false, '537419'),
  (85, 'R32', 'Suiza', '🏳️', 'Por definir', '🏳️', '2026-07-03T03:00:00Z'::timestamptz, false, '537429'),
  (86, 'R32', 'Australia', '🏳️', 'Por definir', '🏳️', '2026-07-03T18:00:00Z'::timestamptz, false, '537428'),
  (87, 'R32', 'Argentina', '🏳️', 'Por definir', '🏳️', '2026-07-03T22:00:00Z'::timestamptz, false, '537427'),
  (88, 'R32', 'Por definir', '🏳️', 'Por definir', '🏳️', '2026-07-04T01:30:00Z'::timestamptz, false, '537430')
on conflict (id) do update set
  fecha = excluded.fecha,
  external_id = excluded.external_id,
  equipo_local = excluded.equipo_local,
  equipo_visitante = excluded.equipo_visitante;

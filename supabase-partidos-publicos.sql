-- ============================================================
-- Partidos visibles tambien para visitantes sin loguear.
-- Las eliminatorias se leen desde la base (no del fixture estatico),
-- asi que un visitante deslogueado tiene que poder ver el fixture.
-- partidos no tiene datos sensibles (solo equipos, fechas, resultados).
-- Ejecutar en: Supabase -> SQL Editor (idempotente)
-- ============================================================

drop policy if exists "Anon ve partidos" on public.partidos;
create policy "Anon ve partidos"
  on public.partidos for select
  to anon
  using (true);

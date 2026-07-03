-- ============================================================
-- Ganadores semanales y premios visibles para visitantes sin loguear.
-- Son datos publicos (se anuncian igual). Mismo criterio que partidos.
-- Ejecutar en: Supabase -> SQL Editor (idempotente)
-- ============================================================

drop policy if exists "Anon ve ganadores" on public.ganadores_semanales;
create policy "Anon ve ganadores"
  on public.ganadores_semanales for select
  to anon
  using (true);

drop policy if exists "Anon ve premios" on public.premios_semanales;
create policy "Anon ve premios"
  on public.premios_semanales for select
  to anon
  using (true);

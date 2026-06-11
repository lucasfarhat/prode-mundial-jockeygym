-- ============================================================
-- CIERRE DE PRONOSTICOS: 1 minuto antes del partido
-- (antes era 1 hora; el frontend muestra lo mismo en Fixture.jsx)
-- Ejecutar en: Supabase -> SQL Editor (idempotente)
-- ============================================================

drop policy if exists "Usuarios cargan sus pronósticos" on public.pronosticos;
create policy "Usuarios cargan sus pronósticos"
  on public.pronosticos for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.partidos p
      where p.id = partido_id
      and p.jugado = false
      and p.fecha > now() + interval '1 minute'
    )
  );

drop policy if exists "Usuarios modifican sus pronósticos (solo si no cerró)" on public.pronosticos;
create policy "Usuarios modifican sus pronósticos (solo si no cerró)"
  on public.pronosticos for update
  using (
    auth.uid() = user_id
    and exists (
      select 1 from public.partidos p
      where p.id = partido_id
      and p.jugado = false
      and p.fecha > now() + interval '1 minute'
    )
  );

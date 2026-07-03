-- ============================================================
-- Recalcular puntos también cuando se CORRIGE un resultado ya cargado
-- (antes el trigger solo se disparaba al pasar de no-jugado a jugado, así
-- que un resultado mal cargado dejaba los puntos mal para siempre).
-- Ejecutar en: Supabase -> SQL Editor (idempotente)
-- ============================================================

drop trigger if exists trg_calcular_puntos on public.partidos;

create trigger trg_calcular_puntos
  after update on public.partidos
  for each row
  when (
    NEW.jugado = true and (
      OLD.jugado = false
      or NEW.resultado_local is distinct from OLD.resultado_local
      or NEW.resultado_visitante is distinct from OLD.resultado_visitante
    )
  )
  execute function public.calcular_puntos_partido();

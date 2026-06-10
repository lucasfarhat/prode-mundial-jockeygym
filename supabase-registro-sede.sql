-- ============================================================
-- REGISTRO: apellido y sede en perfiles
-- Agrega las columnas y actualiza el trigger que crea el perfil
-- al registrarse (los datos viajan en raw_user_meta_data).
-- Ejecutar en: Supabase -> SQL Editor (idempotente)
-- ============================================================

alter table public.perfiles
  add column if not exists apellido text,
  add column if not exists sede text;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfiles (id, nombre, apellido, email, telefono, sede)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'apellido',
    new.email,
    new.raw_user_meta_data->>'telefono',
    new.raw_user_meta_data->>'sede'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();


-- ============================================================
-- TABLA DE POSICIONES: mostrar nombre y apellido
-- (misma vista del schema base, solo cambia la columna nombre)
-- ============================================================
create or replace view public.tabla_posiciones as
select
  p.id as user_id,
  trim(p.nombre || ' ' || coalesce(p.apellido, '')) as nombre,
  count(case when pr.puntos_obtenidos = 3 then 1 end) as exactos,
  count(case when pr.puntos_obtenidos = 1 then 1 end) as ganadores,
  coalesce(sum(pr.puntos_obtenidos), 0) as puntos,
  coalesce(sum(
    abs(pr.goles_local - pa.resultado_local) +
    abs(pr.goles_visitante - pa.resultado_visitante)
  ) filter (where pa.jugado = true), 0) as diferencia_total
from public.perfiles p
left join public.pronosticos pr on pr.user_id = p.id
left join public.partidos pa on pa.id = pr.partido_id
group by p.id, p.nombre, p.apellido;

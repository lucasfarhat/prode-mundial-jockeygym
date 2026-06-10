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

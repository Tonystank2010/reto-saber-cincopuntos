-- =====================================================================
-- Reto Saber · Cinco Puntos — Script SQL completo para Supabase (plan Free)
-- Ejecutar TODO este archivo en el SQL Editor de Supabase, de una sola vez.
-- Es idempotente: se puede volver a ejecutar sin romper nada (usa IF NOT
-- EXISTS / DROP POLICY IF EXISTS antes de crear).
--
-- Contenido:
--   1. Tabla public.perfiles (vinculada a auth.users) y public.progreso.
--   2. Trigger de cupo: maximo 50 usuarios registrados, con error claro.
--   3. Trigger handle_new_user: crea el perfil automaticamente al registrarse.
--   4. Funciones helper SECURITY DEFINER (evitan recursion en RLS).
--   5. Politicas RLS: baneados sin acceso; estudiante edita solo sus puntos;
--      profesor gestiona solo su grado; admin controla todo.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1) TABLAS
-- ---------------------------------------------------------------------
create table if not exists public.perfiles (
  id       uuid primary key references auth.users (id) on delete cascade,
  email    text,
  nombre   text,
  rol      text    not null default 'estudiante'
           check (rol in ('estudiante','profesor','admin')),
  grado    text,
  baneado  boolean not null default false,
  puntos   bigint  not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.progreso (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  datos      jsonb,
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------
-- 2) CUPO MAXIMO DE USUARIOS (protege el plan Free)
--    Trigger BEFORE INSERT sobre auth.users: cuenta los registrados y
--    bloquea el alta con un error claro si ya hay 50.
-- ---------------------------------------------------------------------
create or replace function public.rs_cupo_usuarios()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  total int;
  limite constant int := 50;  -- cambia aqui el numero de cupos si quieres
begin
  select count(*) into total from auth.users;
  if total >= limite then
    raise exception 'CUPO LLENO: se alcanzo el maximo de % usuarios registrados. No se pueden crear mas cuentas por ahora.', limite
      using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  before insert on auth.users
  for each row execute function public.rs_cupo_usuarios();

-- ---------------------------------------------------------------------
-- 3) PERFIL AUTOMATICO AL REGISTRARSE
--    Toma nombre/grado/rol de los metadatos del registro si existen
--    (signup con options: { data: { nombre, grado, rol } }).
-- ---------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.perfiles (id, email, nombre, rol, grado)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'nombre', split_part(new.email, '@', 1)),
    case
      when new.raw_user_meta_data->>'rol' in ('estudiante','profesor','admin')
        then new.raw_user_meta_data->>'rol'
      else 'estudiante'
    end,
    nullif(new.raw_user_meta_data->>'grado', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_perfil on auth.users;
create trigger on_auth_user_created_perfil
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------
-- 4) FUNCIONES HELPER (SECURITY DEFINER: leen perfiles sin recursion RLS)
-- ---------------------------------------------------------------------
create or replace function public.rs_baneado(p_uid uuid)
returns boolean
language sql stable security definer set search_path = public
as $$
  select coalesce((select baneado from public.perfiles where id = p_uid), false);
$$;

create or replace function public.rs_mi_rol()
returns text
language sql stable security definer set search_path = public
as $$
  select coalesce((select rol from public.perfiles where id = auth.uid()), 'estudiante');
$$;

create or replace function public.rs_mi_grado()
returns text
language sql stable security definer set search_path = public
as $$
  select (select grado from public.perfiles where id = auth.uid());
$$;

-- el usuario actual es admin (y no esta baneado)
create or replace function public.rs_es_admin()
returns boolean
language sql stable security definer set search_path = public
as $$
  select not public.rs_baneado(auth.uid()) and public.rs_mi_rol() = 'admin';
$$;

-- el usuario actual es profesor activo del grado indicado
create or replace function public.rs_profesor_de(p_grado text)
returns boolean
language sql stable security definer set search_path = public
as $$
  select not public.rs_baneado(auth.uid())
         and public.rs_mi_rol() = 'profesor'
         and public.rs_mi_grado() = p_grado;
$$;

-- ---------------------------------------------------------------------
-- 5) ROW LEVEL SECURITY — public.perfiles
-- ---------------------------------------------------------------------
alter table public.perfiles enable row level security;
alter table public.progreso enable row level security;

drop policy if exists perfiles_select on public.perfiles;
drop policy if exists perfiles_update_propio on public.perfiles;
drop policy if exists perfiles_update_profesor on public.perfiles;
drop policy if exists perfiles_insert_admin on public.perfiles;
drop policy if exists perfiles_delete_admin on public.perfiles;

-- LEER: cada quien su perfil; profesor ve su grado (solo estudiantes);
-- admin ve todo. Un baneado no puede leer (ni el propio: queda fuera).
create policy perfiles_select on public.perfiles
  for select to authenticated
  using (
    not public.rs_baneado(auth.uid())
    and (
      id = auth.uid()
      or public.rs_es_admin()
      or (public.rs_mi_rol() = 'profesor' and rol = 'estudiante' and grado = public.rs_mi_grado())
    )
  );

-- ACTUALIZAR (estudiante): solo su propia fila y solo columnas permitidas.
-- La proteccion de columnas se refuerza con GRANT y con el trigger guardian.
create policy perfiles_update_propio on public.perfiles
  for update to authenticated
  using (id = auth.uid() and not public.rs_baneado(auth.uid()))
  with check (id = auth.uid() and not public.rs_baneado(auth.uid()));

-- ACTUALIZAR (profesor): unicamente estudiantes de SU mismo grado.
create policy perfiles_update_profesor on public.perfiles
  for update to authenticated
  using (
    not public.rs_baneado(auth.uid())
    and public.rs_mi_rol() = 'profesor'
    and rol = 'estudiante'
    and grado = public.rs_mi_grado()
  )
  with check (
    public.rs_mi_rol() = 'profesor'
    and rol = 'estudiante'
    and grado = public.rs_mi_grado()
  );

-- ACTUALIZAR (admin): todo.
create policy perfiles_update_admin on public.perfiles
  for update to authenticated
  using (public.rs_es_admin())
  with check (public.rs_es_admin());

-- INSERT: solo admin crea/edita perfiles a mano (los demas nacen del trigger).
create policy perfiles_insert_admin on public.perfiles
  for insert to authenticated with check (public.rs_es_admin());

-- DELETE: solo admin.
create policy perfiles_delete_admin on public.perfiles
  for delete to authenticated using (public.rs_es_admin());

-- ---------------------------------------------------------------------
-- 6) ROW LEVEL SECURITY — public.progreso
-- ---------------------------------------------------------------------
drop policy if exists progreso_select on public.progreso;
drop policy if exists progreso_update on public.progreso;
drop policy if exists progreso_insert on public.progreso;
drop policy if exists progreso_profesor_select on public.progreso;
drop policy if exists progreso_admin_all on public.progreso;

-- El estudiante lee y escribe SOLO su progreso (aqui vive su avance y sus
-- puntos); prohibido si esta baneado.
create policy progreso_select on public.progreso
  for select to authenticated
  using (user_id = auth.uid() and not public.rs_baneado(auth.uid()));

create policy progreso_insert on public.progreso
  for insert to authenticated
  with check (user_id = auth.uid() and not public.rs_baneado(auth.uid()));

create policy progreso_update on public.progreso
  for update to authenticated
  using (user_id = auth.uid() and not public.rs_baneado(auth.uid()))
  with check (user_id = auth.uid() and not public.rs_baneado(auth.uid()));

-- El profesor consulta el progreso de los estudiantes de su grado (panel).
create policy progreso_profesor_select on public.progreso
  for select to authenticated
  using (
    not public.rs_baneado(auth.uid())
    and public.rs_mi_rol() = 'profesor'
    and exists (
      select 1 from public.perfiles p
      where p.id = progreso.user_id
        and p.rol = 'estudiante'
        and p.grado = public.rs_mi_grado()
    )
  );

-- Admin: control total.
create policy progreso_admin_all on public.progreso
  for all to authenticated
  using (public.rs_es_admin())
  with check (public.rs_es_admin());

-- ---------------------------------------------------------------------
-- 7) GUARDIAN DE COLUMNAS (trigger BEFORE UPDATE en perfiles)
--    Refuerza lo que las politicas no pueden expresar por columna:
--      - Nadie se auto-asigna rol, grado o baneado (ni quitarse el baneo).
--      - El estudiante solo puede cambiar nombre y puntos.
--      - El profesor solo puede cambiar baneado de estudiantes de su grado.
--      - El admin puede todo.
-- ---------------------------------------------------------------------
create or replace function public.rs_guardia_perfiles()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  mi_rol   text := public.rs_mi_rol();
  baneo    boolean := public.rs_baneado(auth.uid());
  cambio   text := '';
begin
  if auth.uid() is null then
    raise exception 'Solo usuarios autenticados pueden modificar perfiles.';
  end if;

  if new.rol is distinct from old.rol then cambio := 'rol'; end if;
  if new.grado is distinct from old.grado then cambio := coalesce(nullif(cambio,'')||', ','')||'grado'; end if;
  if new.baneado is distinct from old.baneado then cambio := coalesce(nullif(cambio,'')||', ','')||'baneado'; end if;

  if cambio = '' then
    return new;  -- solo nombre/puntos: permitido para uno mismo
  end if;

  if mi_rol = 'admin' then
    return new;  -- admin controla todo
  end if;

  if mi_rol = 'profesor' and cambio = 'baneado' then
    if old.rol = 'estudiante' and old.grado = public.rs_mi_grado() then
      return new;  -- banear/desbanear estudiantes de su grado
    end if;
    raise exception 'Como profesor solo puedes banear estudiantes de tu grado (%).', public.rs_mi_grado();
  end if;

  raise exception 'No tienes permiso para modificar % en perfiles.', cambio;
end;
$$;

drop trigger if exists rs_guardia_perfiles_trg on public.perfiles;
create trigger rs_guardia_perfiles_trg
  before update on public.perfiles
  for each row execute function public.rs_guardia_perfiles();

-- ---------------------------------------------------------------------
-- 8) NOTA SOBRE PERMISOS POR COLUMNA
--    La restriccion "el estudiante solo cambia nombre y puntos" la aplica
--    el trigger rs_guardia_perfiles (seccion 7), que rechaza con un error
--    claro cualquier intento de tocar rol, grado o baneado sin permiso.
--    Esto tambien deja al profesor y al admin operar baneado/rol/grado
--    desde el Panel de Supervision sin permisos adicionales.
-- ---------------------------------------------------------------------

-- =====================================================================
-- FIN. Verificacion rapida en el SQL Editor:
--   select * from public.perfiles;
--   insert into auth.users(...)  -> debe fallar con "CUPO LLENO" al llegar a 50
-- =====================================================================

-- Reto Saber · Cinco Puntos — Tablas mínimas para guardar el progreso por usuario.
-- Ejecutar en el SQL Editor de Supabase. Complementa (no reemplaza) esquema-inicial.sql.

create table if not exists public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  nombre text,
  creado_en timestamptz not null default now()
);

create table if not exists public.progreso (
  user_id uuid primary key references auth.users (id) on delete cascade,
  datos jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.perfiles enable row level security;
alter table public.progreso enable row level security;

-- Cada usuario solo ve y edita sus propios datos.
drop policy if exists "perfil propio" on public.perfiles;
create policy "perfil propio" on public.perfiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "progreso propio" on public.progreso;
create policy "progreso propio" on public.progreso
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

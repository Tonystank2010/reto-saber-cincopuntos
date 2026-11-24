-- Reto Saber · Cinco Puntos — Ligas y duelos con personas reales (v41).
-- Ejecutar en el SQL Editor de Supabase DESPUES de progreso.sql.
-- Crea la vista liga_publica: expone SOLO lo minimo para las ligas y duelos
-- (nombre visible, liga, semana y XP/aciertos agregados) de cada cuenta guardada
-- en progreso.datos. No expone correos, respuestas ni historiales.

create or replace view public.liga_publica as
select
  p.user_id,
  coalesce(nullif(trim(pf.nombre), ''), nullif(trim(j.usuario->>'name'), ''), 'Estudiante') as nombre,
  coalesce((j.usuario->>'liga')::int, 0)          as liga,
  coalesce((j.usuario->>'wk')::int, 0)            as wk,
  coalesce((j.usuario->>'wxp')::int, 0)           as wxp,
  coalesce((j.usuario->>'xp')::int, 0)            as xp,
  coalesce((j.usuario->>'ok')::int, 0)            as ok,
  coalesce((j.usuario->>'tot')::int, 0)           as tot,
  p.updated_at
from public.progreso p
cross join lateral jsonb_each(p.datos->'users') as j(clave, usuario)
left join public.perfiles pf on pf.id = p.user_id;

-- Lectura publica de solo-escala: las ligas deben mostrar a los demas.
grant select on public.liga_publica to anon, authenticated;

-- Nota de privacidad: esta vista hace publicos nombre, liga y XP de la semana
-- de las cuentas que usen la nube. Si tu proyecto es de uso privado, limitala:
--   revoke select on public.liga_publica from anon;
-- y crea politicas por institucion segun tu modelo de acudientes/docentes.

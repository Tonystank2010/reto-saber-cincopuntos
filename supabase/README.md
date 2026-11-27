# Supabase

- `esquema-inicial.sql` — propuesta de esquema general (núcleo, auditoría, reportes). Opcional.
- `progreso.sql` — tablas mínimas que la app React usa hoy: `perfiles` y `progreso` con RLS.
- `ligas.sql` — vista pública `liga_publica` para ligas y duelos con personas reales (v41). Ejecutar después de `progreso.sql`.
- `schema.sql` — **v59**: esquema completo para el juego (HTML/JS puro). `perfiles` + `progreso` vinculados a `auth.users`, trigger de cupo de 50 usuarios, RLS estricta (baneado bloqueado; estudiante solo su fila y sin tocar rol/grado/baneado; profesor solo estudiantes de su grado; admin total) y trigger guardián de columnas. **Sustituye a `progreso.sql`** si usas la variante sin React: ejecutar en el SQL Editor y luego poner `SUPABASE_URL` y `SUPABASE_ANON_KEY` en el juego.

Ejecutar en el SQL Editor en ese orden.

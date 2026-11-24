# Supabase

- `esquema-inicial.sql` — propuesta de esquema general (núcleo, auditoría, reportes). Opcional.
- `progreso.sql` — tablas mínimas que la app React usa hoy: `perfiles` y `progreso` con RLS.
- `ligas.sql` — vista pública `liga_publica` para ligas y duelos con personas reales (v41). Ejecutar después de `progreso.sql`.

Ejecutar en el SQL Editor en ese orden.

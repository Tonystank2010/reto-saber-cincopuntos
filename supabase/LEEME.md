# Supabase — configuración rápida

1. Crea un proyecto en [supabase.com](https://supabase.com) (región cerca de tus usuarios).
2. Abre **SQL Editor** y ejecuta primero `esquema-inicial.sql` (propuesta general, opcional).
3. Ejecuta después `progreso.sql`: crea `perfiles` y `progreso` con RLS (cada usuario solo accede a sus datos).
4. En **Authentication → Providers** deja activo el acceso con correo/contraseña.
5. Copia la URL y la clave **anon** de **Settings → API** a tus variables de entorno
   (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) en Vercel (y en `.env` para desarrollo).
   Nunca uses la clave `service_role` en el navegador.

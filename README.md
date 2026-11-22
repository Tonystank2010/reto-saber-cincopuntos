# Reto Saber · Cinco Puntos

Juego de práctica para las pruebas **Saber 11, Saber Pro y TyT**, con lecciones, simulacros,
duelos, misiones diarias, insignias, ligas y más. Este repositorio adapta el clásico
demo de un solo archivo a una arquitectura moderna lista para desplegar:

- **React + Vite** — envoltura con inicio de sesión y sincronización de progreso.
- **Vercel** — despliegue estático con `vercel.json` (SPA rewrites + cabeceras no-cache).
- **Supabase** — autenticación y guardado del progreso en la nube (RLS por usuario).
- **PWA** — instalable y con respaldo sin conexión (`service worker`).

## Estructura

```
├── index.html                  # raíz de la app React
├── src/                        # App, Login, Game (iframe) y supabase
├── public/
│   ├── demo/Reto-Saber-Demo.html   # el juego completo (archivo único, con puente v19)
│   ├── icon.svg · manifest.webmanifest · sw.js
├── demo-html/                  # historial del demo (versión anterior incluida) + LEEME
│   └── historial/              # 7 prototipos congelados (repos históricos)
├── base-de-datos/              # generador y herramientas SQLite del banco de preguntas
│   └── contenido/              # preguntas originales del equipo + plantilla de autoría
├── supabase/                   # SQL: progreso.sql (usar) y esquema-inicial.sql (propuesta)
├── pwa/                        # copia de apoyo del service worker e icono
├── piloto/                     # material del piloto con docentes
├── docs/
│   ├── ARQUITECTURA.md
│   └── planeacion/             # IDEAS, TAREAS, DECISIONES, PROYECTO, REVISION-MATERIALES
├── marketing/                  # textos para redes sociales
└── .github/workflows/banco.yml # CI: valida el banco y genera con el contenido original
```

## Modo local vs. modo nube

| | Modo local (sin configurar) | Modo nube (con Supabase) |
|---|---|---|
| Entrar | Sin cuenta, directo a jugar | Correo + contraseña (Supabase Auth) |
| Progreso | `localStorage` de este navegador | Tabla `progreso` + respaldo local |
| Instalación | Cero pasos | `supabase/progreso.sql` + variables de entorno |

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # salida en dist/
```

Para el modo nube, copia `.env.example` a `.env` y define la URL y la clave anon de Supabase.

## Despliegue en Vercel

1. Importa este repositorio en [vercel.com/new](https://vercel.com/new) (detecta Vite).
2. Si quieres modo nube, añade `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` en
   *Settings → Environment Variables*.
3. Despliega. El `vercel.json` ya trae las rutas SPA y las cabeceras de caché.

## El juego (demo de archivo único)

`public/demo/Reto-Saber-Demo.html` funciona también **solo y sin servidor** (ábrelo directo
en el navegador). El «puente v19» al final del archivo solo se activa dentro de un iframe
de la app: sincroniza el progreso con Supabase y nunca altera el juego como tal.
El módulo «v20» corrige un defecto de la v18: la tarjeta **★ Preguntas marcadas**
(estaba definida pero no se montaba en el Perfil) ahora aparece con sus notas y
«Practicar marcadas» funcionando.

Más detalles en `docs/ARQUITECTURA.md` y en `docs/planeacion/`.

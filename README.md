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

## Banco rotativo de 10.000 preguntas (v21)

El módulo «v21» aumenta la práctica a un banco de **10.000 preguntas** que rotan
**sin repetirse** cada vez que se entra a una lección, se repite, se hace un
simulacro, diagnóstico, repaso o duelo. Distribución por área:

| Área | Cuota |
|---|---|
| Matemáticas | 2200 |
| Razonamiento Cuantitativo | 2200 |
| Ciencias Naturales | 2164 |
| Sociales y Ciudadanas | 1000 |
| Lectura Crítica | 900 |
| Inglés | 936 |
| Comunicación Escrita | 600 |
| **Total** | **10.000** |

- Cada usuario/área lleva un ciclo sembrado (`u.b10k[area]={s,p}`) con PRNG
  determinista (mulberry32): preguntas nuevas hasta agotar el ciclo; al agotarlo,
  se vuelve a sembrar (mezcla nueva).
- Las áreas textuales (Sociales, Lectura Crítica, Inglés, Comunicación Escrita)
  están dimensionadas exactamente a su espacio único; las numéricas usan
  familias paramétricas verificadas sin colisiones (test de 10.000 enunciados
  únicos, 0 repetidos).
- Las preguntas fijas del banco original (`saber11`/`saberPro`) se intercalan en
  el ciclo (≈20 %) y también rotan sin repetirse dentro de él.
- Toda pregunta generada lleva el marcado
  «Generada por la aplicación como práctica · no oficial».

Más detalles en `docs/ARQUITECTURA.md` y en `docs/planeacion/`.

## Traspasar progreso con un código (v22)

Además del respaldo por archivo (Descargar mi copia / Cargar una copia), el Perfil
incluye **«Traspasar progreso con un código»**: el método práctico para llevar tu
progreso a otro dispositivo o navegador.

1. **Generar mi código** — produce un código `RS1.<cuerpo>.<verificación>` que comprime la cuenta completa (progreso, racha, insignias, errores para repasar y ajustes) con un algoritmo LZW incorporado + verificación de integridad. En cuentas normales mide menos de ~1.000 caracteres.
2. **Copiar código** o **Copiar enlace** — el enlace lleva `#rstr=<código>`, listo para mandar por WhatsApp o correo.
3. En el otro dispositivo: pegar el código en Perfil → *Aplicar el código*, o simplemente abrir el enlace y confirmar. La app valida y muestra el mismo aviso que el archivo de copia.

Nota de privacidad: el código contiene el correo y el progreso — se recomienda
mandarlo solo a uno mismo. Se comporta como la copia por archivo, con las mismas
validaciones (estructura, campos numéricos, sanitización del repaso). Si el
progreso es demasiado grande para un código, la app sugiere usar el archivo.

## Recordar contraseña y sesión en otro dispositivo (v23)

- Al crear tu cuenta o entrar, tu contraseña queda **guardada solo en este dispositivo**: en la pantalla «Entrar» verás el botón **«Entrar como …»** para no volver a escribirla, y «Olvidar contraseña guardada» para borrarla.
- La contraseña **nunca viaja**: ni en el código de traspaso (v22), ni en la copia por archivo, ni por el puente.
- Para usar la **misma contraseña en otro dispositivo**: allí aplica primero tu código de traspaso (Perfil → «Generar mi código»); la cuenta llega con su hash y ese correo + esa contraseña entran normalmente.

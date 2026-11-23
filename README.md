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
| Instalación | Cero pasos | `supabase/progreso.sql` + `demo-html/actualizar_nube.py` |

## Desarrollo

La app publicada es **el demo de archivo único, sin React** (v27). Para verla en local no hace falta instalar nada:

```bash
# opción 1: abrir directo
doble clic en public/demo/Reto-Saber-Demo.html

# opción 2: servidor local
python3 -m http.server 8000 --directory public
# → http://localhost:8000/demo/Reto-Saber-Demo.html
```

Los `src/` y `package.json` conservan la **variante React** (opcional, ver más abajo); el despliegue por defecto NO la usa.

## Nube sin React (v27): Supabase dentro del demo

Opcional. Sin configurar, el juego es 100% local (como siempre). Para activar el **modo nube**:

1. Crea el proyecto en [supabase.com](https://supabase.com) y ejecuta `supabase/progreso.sql` en el SQL Editor (tablas `perfiles` y `progreso` con RLS).
2. En **Authentication → Providers → Email**: habilitado. Y desactiva «Confirm email» para que el alta desde el juego no exija verificar el correo.
3. Copia **Project URL** y la clave **anon** (Settings → API).
4. Escribe esas credenciales dentro del demo:
   ```bash
   python3 demo-html/actualizar_nube.py --url https://xxxx.supabase.co --clave eyJ...
   ```
   (edita las 3 copias del demo; `--limpiar` vuelve al modo local).
5. Ya en el juego: al crear la cuenta o entrar, v27 registra/valida en Supabase Auth y sincroniza el progreso (`progreso.datos`) cada 30 s, al ocultar la pestaña y al cerrar.
6. **Otro dispositivo**: con la misma URL/clave, entra con ese correo y contraseña → recupera su progreso. Lo mismo vale para el código de traspaso (v22) y la clave guardada (v23): mismo correo + contraseña.

### Panel de nube en el Perfil (v28)

El área de **Perfil** incluye la tarjeta «☁️ Nube (Supabase)» con el estado real de la sincronización (conectado / sin sesión / modo local) y dos botones manuales:

- **Subir ahora**: envía inmediatamente tu progreso a la nube (upsert en `progreso` + `perfiles`), sin esperar el ciclo automático de 30 s.
- **Bajar de la nube**: pide tu progreso guardado y lo fusiona (gana el mayor XP); solo recarga si algo cambió.

Para depuración desde consola: `window.RS27.estado()` y también `window.RS27.subir()` / `window.RS27.bajar()` / `window.RS27.salir()`.

### Cuenta regresiva para el examen (v29)

Camino incluye la tarjeta «🎯 Mi examen»: guardas la fecha de tu citación (el ICFES publica fechas oficiales) y ves los días restantes con una sugerencia de estudio. La fecha vive en tu usuario, así que se sincroniza con la nube como el resto del progreso.

### Pulido visual (v30)

Estética sin cambios de lógica: transiciones suaves en tarjetas, chips, opciones y barra de progreso; micro-animación al acertar; estados `:focus-visible` para navegación por teclado; sombras sutiles en tarjetas y barra inferior. Todo respeta `prefers-reduced-motion` (si tu sistema pide menos movimiento, no se anima nada).

### Seguridad y privacidad (v31)

- **Content-Security-Policy** en el HTML: limita scripts al propio origen + CDN oficial (`https://cdn.jsdelivr.net`), conexiones solo a tu proyecto Supabase, y bloquea objetos/frames externos.
- **Opt-out de «recordar mi contraseña»**: casilla visible en el formulario de entrada/creación (marcada por defecto para no cambiar la comodidad actual). Si la desmarcas, la clave no quedará guardada en ese dispositivo.
- **Tarjeta «🛡️ Privacidad, fuentes y legal»** en el Perfil: donde viven tus datos (dispositivo local + tu propia base Supabase), ausencia de rastreadores, atribución al ICFES y aviso de no afiliación.
- **«Olvidar este dispositivo»**: borra la contraseña recordada y cierra la sesión de nube en ese dispositivo, sin tocar tu progreso local.

> Nota de seguridad: esta es una herramienta de estudio sin datos sensibles. No insertes contraseñas que uses en servicios reales.

### Cambiar contraseña (v32)

En **Perfil → 🔑 Cambiar contraseña**: valida tu clave actual, actualiza el hash local y la clave recordada, y si tienes sesión de nube la cambia también en Supabase Auth (`auth.updateUser`). Punto único de verdad para la misma cuenta en todos los dispositivos.

La conexión usa la clave anon (pública por diseño); la protección real son las políticas RLS del SQL del punto 1. Sin red, el script de Supabase no carga y el juego queda local, sin errores.

## Despliegue en Vercel (estático, sin React)

1. Fusiona el PR a `main` y entra a [vercel.com/new](https://vercel.com/new).
2. `Sign in with GitHub` → **Import** el repo `Tonystank2010/reto-saber-cincopuntos`.
3. La configuración sales de `vercel.json`: sin build real, sirve la carpeta **`public/`** y la ruta `/` abre el demo. Variables de entorno: **ninguna necesaria** (las credenciales del modo nube van dentro del HTML con `actualizar_nube.py`, paso 4 del modo nube).
4. `Deploy`. La app queda en `https://<proyecto>.vercel.app` y el demo directo en `/demo/Reto-Saber-Demo.html`.
5. Cada `git push` a `main` redespliega solo. Las URLs de vista previa aparecen en cada PR.

### Variante React (opcional)

`src/` mantiene la envoltura React con Supabase (puente v19). Para desplegar esa variante cambia `vercel.json`:
```json
{ "buildCommand": "npm run build", "outputDirectory": "dist",
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [ ... los mismos de arriba ... ] }
```
y define `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` en *Environment Variables* (mismo `progreso.sql`; no hace falta `actualizar_nube.py`).

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

## Tecla Enter (v24)

- En la pantalla de entrar/crear cuenta, la tecla **Enter** envía el formulario (con anti-doble-envío de 0,8 s; Shift/Ctrl+Enter no envían).
- En el textarea del código de traspaso, **Ctrl/Cmd + Enter** aplica el código.

## Descargar el juego y ejecutarlo sin navegador (v25 + desktop)

**Opción 1 · archivo único (recomendado):**
- En el juego: **Perfil → «💾 Descargar el juego» → «Descargar el juego (un solo archivo)»**.
- Descarga `Reto-Saber-Demo.html` (~0,9 MB). Se abre con **doble clic**, sin internet; el progreso se guarda en el navegador del archivo (en Chromium/Edge, cada archivo local comparte almacenamiento; en Firefox, por ruta).
- Alternativa sin abrir el juego: descargar el archivo directamente desde el [demo en línea](https://tonystank2010.github.io/reto-saber-cincopuntos/public/demo/Reto-Saber-Demo.html) (Ctrl/Cmd+S o botón derecho → Guardar como).

**Opción 2 · app de escritorio (Electron):**
```bash
cd desktop
npm install
npm run sincronizar   # copia el demo de public/demo a desktop/app
npm start             # ventana propia del juego
npm run dist          # instaladores: Windows (.exe NSIS), macOS (.dmg), Linux (.AppImage)
```
El progreso persiste en la app entre sesiones y funciona el traspaso con código (v22) y la contraseña guardada (v23). Detalles en `desktop/LEEME.md`.

## Diseño responsive refinado (v26)

Mejoras en pantallas **móviles y tabletas pequeñas** (ancho ≤ 767 px), sin tocar la lógica del juego:

- **Navegación legible**: los botones de la barra inferior ya no bajan a ~10,5 px; ahora mínimo **12 px** y área táctil de 46 px.
- **Botones que se reordenan**: en filas `.row`, si los botones no caben, se parten en varias filas (ancho mínimo 112 px) en vez de quedar apretados en una sola línea y cortarse.
- **Etiquetas y chips**: la fila «¿Qué tan seguro estás?» (Seguro/Dudo/Adivino/No lo sé) usa `flex-wrap` para no desbordarse.
- **Textos largos con corte limpio**: los párrafos (enunciados, explicaciones) rompen palabras largas con `overflow-wrap:anywhere` — ya no aparecen trucos de texto saliéndose de la tarjeta en móvil.
- **Controles al ancho completo**: `select`, `textarea` y campos de texto/contraseña/correo ocupan todo el ancho en móvil (p. ej., las notas de cuentos y los menús desplegables).
- **Textareas del traspaso (v22) y clave guardada (v23)** suben de 11 px a **12 px** para más legibilidad.
- **Títulos compactos**: `h1` a 20 px con interlineado ajustado en pantallas pequeñas.

En tabletas y escritorio (≥ 768 px) nada cambia. El archivo es autocontenido: los ajustes viajan dentro del propio HTML (style `#v26-resp`), así que la versión descargada (v25: «Descargar el juego») también incluye el modo responsive.

**Módulos fuente:** `demo-html/modulos/v26-responsive-general.js` — inyectado igual que v20–v25.

### v33 — Ojo de contraseña + aviso de autocompletado

Problema detectado en la prueba multi-dispositivo: el gestor de contraseñas del celular (Google/Chrome) rellena solito una **clave antigua guardada** de este sitio y el acceso falla con «correo o contraseña incorrectos», aunque la clave real sea correcta.

La app no puede borrar la memoria del navegador, pero ahora ayuda a resolverlo en segundos:

- **Botón «👁 Ver clave»** junto al campo de contraseña (pantalla de acceso): muestra/oculta la clave para revisar qué autocompletó el navegador y corregirla a mano.
- **Aviso visible** bajo el campo: explica que si el navegador completó la clave y da error, puede tratarse de una clave antigua guardada; se puede borrar y escribirla a mano.
- No cambia nada del flujo de acceso ni de la nube; solo añade el botón y el aviso cuando se ve `S.view==='auth'`.

**Módulo fuente:** `demo-html/modulos/v33-clave.js` — inyectado como bloque `<script>` independiente (patrón v20–v32). Caché PWA a `rscp-v19` / `reto-saber-v17` para forzar la actualización en dispositivos con el demo ya instalado.

**Consejo del lado del celular:** al entrar por primera vez desde un dispositivo, si el gestor ofrece una clave y falla, usa «Ver clave», bórrala y escribe la correcta; luego el navegador ofrecerá actualizar la clave guardada — acepta y quedará sincronizada para la próxima.

### v34 — Diseño ed-tech moderno (lección y examen) con modo oscuro incluido

Dirección elegida: **ed-tech moderno** con foco en las pantallas donde vive el 80 % del tiempo de estudio (Camino → pregunta → resultado), y modo oscuro rediseñado junto al claro.

- **Design tokens**: acento dual índigo→violeta (`--grad`), sombras de profundidad sutil (`--shC`/`--shA`), radios ampliados (tarjetas 20 px).
- **Pregunta**: opciones `.opt` táctiles (radios 14 px, hover con borde acento, anillo al seleccionar, `:active` que «hunde» la opción), retroalimentación con barra lateral verde/roja.
- **Botones primarios**: gradiente índigo→violeta con elevación; chips activos con tinte suave; barra de progreso CN con gradiente.
- **Nodos del Camino**: hover con leve zoom (respeta `prefers-reduced-motion`).
- **Modo oscuro**: superficies elevadas diferenciadas (`--cd2`) para opciones y campos, sombras recalibradas, acento más luminoso — funciona tanto con el interruptor del demo (`data-th`) como con el tema del sistema operativo.
- Todo CSS puro, sin animaciones nuevas que rompan la accesibilidad; respeta el mecanismo original de tokens.

**Módulo fuente:** `demo-html/modulos/v34-diseno.css` — inyectado como `<style>` estático (patrón v30). Caché PWA a `rscp-v20` / `reto-saber-v18`.

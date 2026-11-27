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
│   ├── juego/Reto-Saber.html       # el juego completo (archivo único, con puente v19)
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
doble clic en public/juego/Reto-Saber.html

# opción 2: servidor local
python3 -m http.server 8000 --directory public
# → http://localhost:8000/juego/Reto-Saber.html
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
3. La configuración sales de `vercel.json`: sin build real, sirve la carpeta **`public/`** y la ruta `/` abre el juego. Variables de entorno: **ninguna necesaria** (las credenciales del modo nube van dentro del HTML con `actualizar_nube.py`, paso 4 del modo nube).
4. `Deploy`. La app queda en `https://<proyecto>.vercel.app` y el juego directo en `/juego/Reto-Saber.html` (la ruta antigua `/demo/Reto-Saber-Demo.html` redirige a la nueva).
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

`public/juego/Reto-Saber.html` funciona también **solo y sin servidor** (ábrelo directo
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
- Descarga `Reto-Saber.html` (~1,1 MB). Se abre con **doble clic**, sin internet; el progreso se guarda en el navegador del archivo (en Chromium/Edge, cada archivo local comparte almacenamiento; en Firefox, por ruta).
- Alternativa sin abrir el juego: descargar el archivo directamente desde la [app en línea](https://reto-saber-cincopuntos.vercel.app/juego/Reto-Saber.html) (Ctrl/Cmd+S o botón derecho → Guardar como).

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

### v34.1 — Selector de paleta de colores (el usuario elige)

Las 5 paletas del preview quedaron **dentro de la app**: en **Perfil → Accesibilidad**, junto al modo claro/oscuro, aparece una fila de chips con miniatura de cada paleta:

- **Índigo** (de fábrica) · **Azul océano** · **Esmeralda** · **Coral** · **Magenta**
- Se aplica al instante (custom properties en `:root`), **se guarda en `DB.pref.pal`** y viaja con la nube porque `DB.pref` se sincroniza completo (v27) — el color te acompaña a cualquier dispositivo.
- Cada paleta tiene **variante clara y luminosa para modo oscuro**; al cambiar el tema se re-aplica sola (también si el sistema operativo cambia el tema con «Automático»).
- Un id desconocido (dispositivo viejo o dato corrupto) cae sin ruido a la paleta de fábrica.
- El modo del demo sigue intacto: reusamos `--ac`/`--grad` que ya ocupaba el CSS de v34/v27 para chips, opciones, barras y botones.

**Módulo fuente:** `demo-html/modulos/v341-paletas.js` — bloque `<script>` (patrón v20+). Caché PWA a `rscp-v21` / `reto-saber-v19`.

**Preview para elegir a ojo:** `public/preview-paletas.html` — abierto cerca del demo muestra las 5 paletas maquetadas (claro/oscuro).

### v35 — Iconos propios (SVG) + colores por área

Adiós a los emoji genéricos del sistema, que se ven distintos en cada teléfono:

- **32 iconos SVG únicos** diseñados en la propia app (trazo redondeado, 24×24, `currentColor`): Camino (ruta con paradas), Cuentos (libro), Repaso (flechas), Carreras (birrete), Liga (trofeo), Perfil, corazón, llama, estrellas de lección, diana de misiones, pin, plan, cuaderno, bombilla de pista, candado, altavoz, nube sube/baja, calendario, alerta, check, corazón roto, duelo, medalla, gema, móvil, ojo… Cambian de color con el tema y **se escalan con la paleta que el usuario elija** (v34.1), porque usan `currentColor`.
- **Reemplazo automático post-render** (árbol de texto del body, sin tocar las plantillas del juego): sobrevive a los re-renders y a las nuevas tarjetas de versiones futuras. Detalle curioso: el botón «Tarjetas» usaba un pushpin con codepoint no estándar (U+1F0CD) — también mapeado.
- **Colores por área**: cada nodo del Camino y cada chip de área toma su color — Lectura **azul** `#2563eb`, Matemáticas/Razonamiento **naranja** `#ea580c`, Sociales/Ciudadanas **violeta** `#7c3aed`, Ciencias **verde** `#059669`, Inglés **magenta** `#db2777`, Comunicación Escrita **cian** `#0891b2`; las áreas de carrera de Saber Pro reciben un color estable derivado de su nombre. El nodo muestra el área en su `title` (accesible).
- **Micro-interacción amable**: iconos que crecen sutilmente al pasar el dedo/cursor, el corazón de las vidas late y la llama de la racha flamea — todo dentro de `@media (prefers-reduced-motion: no-preference)`.
- Los `::before` con ✓/✗ de aciertos y errores se conservan (gauges semánticos, no decoración).

**Módulo fuente:** `demo-html/modulos/v35-area-iconos.js` — bloque `<script>` (patrón v20+) con CSS inyectado por el propio módulo (`#rs35css`). Caché PWA a `rscp-v22` / `reto-saber-v20`.

### v36 — Avatar personalizable (primera versión)

Primera mascota editable: 4 formas (Punto, Chigüiro, Zorro, Robot), color, ojos, boca y accesorios, con botón «Sorpréndeme», reacciones en la retroalimentación y persistencia en `DB.pref.av`.

**Módulo:** `demo-html/modulos/v36-avatar.js` (bloque `<script>`, patrón v20+). Caché PWA `rscp-v23` / `reto-saber-v21`.

> Sustituido en v37: menos opciones, arte plano y un bug que desactivaba el avatar fuera de un iframe (en GitHub Pages standalone no aparecía). Conservado aquí solo como hito; el módulo ya no está en el repo.

### v37 — Mascota rediseñada: arte con volumen, 8 formas y movimiento

Rediseño integral del ecosistema de mascota, por las 4 líneas a la vez:

- **Arte pulido en SVG**: cada forma tiene sombra inferior, brillo superior, contorno suave y una **escena propia** (sombra de piso; destello de confeti al acertar). Nada de formas planas pegadas.
- **8 formas**: Punto, **Chigüiro**, Zorro, Robot, **Tucán**, **Perezoso**, Gato y **Búho** — todas dibujadas a mano, cada una con su silueta y detalles (pico naranja del tucán, parches alrededor de los ojos del perezoso, orejas del gato, alas del búho…).
- **Más personalización**: 13 colores + 4 ojos + 4 bocas + 6 accesorios (gorra, gafas, moño, corona, lentes de sol y auriculares), anclados a la cabeza de cada forma.
- **Vida y movimiento**: la mascota **respira y saluda** en la vista previa, **parpadea** cada pocos segundos y **celebra en grande** cuando aciertas (aparece con rebote y confeti). Todo dentro de `prefers-reduced-motion: no-preference`.
- **Editor nuevo en Perfil**: vista previa grande con escena (170 px), chips agrupados y descripción viva («tu Chigüiro con gorra»), más «Sorpréndeme» destacado.
- **Corrección clave**: v36 tenía un guard que apagaba todo el avatar cuando el demo se abre **fuera de un iframe** (o sea, en GitHub Pages standalone). Eliminado: la mascota funciona en cualquier contexto.
- **Compatibilidad**: los datos guardados de v36 (y de versiones indexadas numéricamente) se leen igual; los datos corruptos caen a valores de fábrica.
- **Adiós al emoji restante**: el catálogo de iconos propios se amplía de 32 a **62 iconos SVG** (nuevos: reloj, reloj de arena, pausa, bandera de reporte, cerrar, casilla, trébol, dado, dedo, disquete, gráfica, llave, impresora, escudo, brújula y reproducir) y se mapean los 26 caracteres que aún se veían como emoji (⏱⏳⏸⚑✓✔✕✖▶⬜🍀🎲👉💾📊📲🔐🔑🕘🖨🛡🧭...). Verificado con prueba automática: **cero emojis visibles** en Perfil/Camino/Liga (en v38 se elimina también la última excepción, ver abajo).
- **Guard eliminado en v35** también: los iconos y colores por área ya no dependen del contexto del documento.
- **Preview del arte**: nueva página `preview-mascota.html` con las 16 tarjetas (8 formas × normal/celebrando) para evaluar el diseño de un vistazo.

**Módulo:** `demo-html/modulos/v37-mascota.js` — bloque `<script>` (patrón v20+) con CSS propio (`#rs37css`) y API `window.RS37`; catálogo extendido en `v35-area-iconos.js`. Caché PWA a `rscp-v24` / `reto-saber-v22`.

### v39 — Consola de estudio: barra lateral ed-tech propia (inspirada, no copiada)

Rediseño de la navegacion y del encabezado de seccion inspirado en las consolas de estudio modernas, con identidad 100% propia para no imitar a ninguna marca:

- **Marca propia en la barra lateral**: glifo geometrico de cinco puntos + wordmark CINCO PUNTOS. Ni búhos, ni verdes ajenos, ni logotipos de terceros.
- **Tiles de icono**: cada seccion (Camino, Cuentos, Repaso, Carreras, Liga, Perfil) lleva su icono del catalogo propio en un tile redondeado; el activo queda resaltado con el acento de la paleta del usuario.
- **Banner de seccion**: tarjeta de color con el nombre de la seccion y su subtitulo descriptivo, sobre el contenido (se oculta dentro de lecciones y evaluaciones).
- **Escritorio y movil**: barra lateral ancha en pantallas grandes (icono + etiqueta en fila); en movil se mantiene la barra inferior compacta y la marca se oculta por CSS.
- Inyeccion idempotente tras cada render con observador ligero (mismo patron v35/v38).

**Modulo:** `demo-html/modulos/v39-consola.js` (nuevo). Sin emojis.

### v40 — Editor de mascota rediseñado: consola de creacion a dos columnas

El editor del avatar adopta el patron de los editores de caricatura: todo en una tarjeta, dos columnas:

- **Izquierda**: panel de vista previa grande (radial sutil sobre el fondo de tarjeta) con la mascota viva (respira/parpadea), el nombre descriptivo ("Chigüiro con gorra") y el boton "Sorpréndeme" con icono SVG de dado.
- **Derecha**: columna de **categorias con icono** (forma, color, ojos, boca, accesorio — 4 iconos nuevos en el catalogo v35: `forma`, `paleta`, `boca`, `gorra`) + **rejilla de opciones** de la categoria activa.
- **Cada tile de opcion muestra la mascota con esa opcion aplicada** (no un texto): la forma, los ojos, la boca y el accesorio se ven de verdad antes de tocarlos; el color va como rejilla de swatches redondos con anillo de seleccion.
- **Accesible**: `aria-pressed` en tiles y categorias, `aria-label` con nombre de la opcion, foco de boton nativo.
- En movil la consola se apila: preview arriba, categorias de fila, rejilla debajo. Respeta `prefers-reduced-motion`.
- **Compatibilidad intacta**: mismas acciones `rs37v`/`rs37r`, mismos datos guardados (f/c/o/b/a), misma API `RS37`/`RS36`.

**Modulo:** `demo-html/modulos/v37-mascota.js` (editor dentro del bloque v37; nuevo `css40`). Catalogo v35 ahora con 68 iconos. `preview-mascota.html` actualizada con stub de iconos. Cache PWA a `rscp-v26` / `reto-saber-v24`.

### v38 — Cero emojis, sin ninguna excepción

La regla visual del juego es estricta: **ni un solo emoji en pantalla**, tampoco en los casos que se veían como tipografía.

- **Flechas → ← sustituidas por iconos SVG propios** (`flecha-der`, `flecha-izq`): desaparecen de la meta semanal, dominio, glosario, rutas y textos de navegación, porque el reemplazo es automático en cada render.
- **Marcadores ✔ / ✖ del CSS eliminados**: las opciones correcta/errónea ya no usan `content:'✔'`; ahora el `::before` dibuja el icono con una máscara SVG (`mask`) en `currentColor`, a tono con el catálogo propio.
- **Iconificador a prueba de todo**: v35 instala un observador ligero (MutationObserver con filtro anti-bucle) que repinta también las vistas que se re-renderizan sin pasar por `render()` (formularios de entrar/crear cuenta, avisos, etc.). Antes esas pantallas quedaban con emojis.
- **Página de preview limpia**: `preview-mascota.html` ya no tiene emoji ninguno (el dado de «Sorpréndeme» es SVG).
- **Verificado con pruebas automáticas**: cero emojis y cero flechas en login, registro, app sembrada y Perfil (texto visible y atributos); navegación Cuentos/Repaso/Carreras/Perfil/Camino y flujo de pregunta sin errores de runtime.

**Módulo:** `demo-html/modulos/v35-area-iconos.js` (catálogo 64 iconos). Caché PWA a `rscp-v25` / `reto-saber-v23`.

### v41 — Perfil por pestañas, texto que encaja, auriculares y ligas con personas reales

- **Pestañas internas del Perfil**: la vista Perfil se divide en tres pestañas con chips propios: **Personalizar** (solo el editor de mascota), **Progreso** (resumen, dominio, metas, evolución, ideas, historial de sesiones y marcadores) y **Ajustes** (voz, ficha imprimible, piloto, panel de acompañamiento, copia de seguridad, banco de preguntas, accesibilidad y tiempo por pregunta). La pestaña se recuerda durante la sesión (`S.ptab`), el editor de mascota solo aparece en Personalizar y la navegación sigue siendo accesible por teclado (`aria-pressed`).
- **Auriculares de la mascota rediseñados**: diadema acolchada con línea de brillo, copas ovaladas con interior, brillo lateral y horquilla hacia la cabeza, ancladas a la línea de ojos de cada forma. Se ve en la galería de `preview-mascota.html` (accesorio 6).
- **El texto encaja en su caja en móvil vertical**: reglas de encaje para botones, chips, filas `.lg`, opciones y el editor (`min-width:0`, `overflow-wrap:anywhere`, elipsis/ajuste), más una capa de compactación bajo 480 px (chips y filas más pequeños, tiles del editor a 56 px). Nada se sale de los cuadros en pantallas estrechas.
- **Ligas y duelos con personas reales**: nueva vista pública `liga_publica` en Supabase (`supabase/ligas.sql` — ejecútala en el SQL Editor) que expone solo nombre, liga, semana y XP/aciertos agregados. Mientras la nube esté activa, el tablero de liga mezcla tus cuentas locales con **cuentas reales sincronizadas** (marcadas con «nube»), y cada fila tiene el botón **Duelar** para retarla en un duelo de 10 preguntas donde el rival responde según su precisión real registrada. Sin nube configurada, todo funciona como antes (cuentas del dispositivo). La lectura anónima expone únicamente el nombre visible y métricas de juego; los correos y los datos privados nunca salen de la fila propia.

**Módulos:** parche base (`perfil`, `liga`, duelos) + `demo-html/modulos/v41-ligas.js`. SQL nuevo `supabase/ligas.sql`. Caché PWA a `rscp-v27` / `reto-saber-v25`.

### v42 — Monedas, tienda y topbar interactivo (estilo kit de estudio)

- **Monedas**: cada punto de XP que ganas te da una moneda. La cartera visible es XP menos gastos (`u.gasto`), así la liga y la temporada siguen midiendo XP puro: la cartera es de compras, el ranking es de competencia. Todo lo visible del bolsillo dice «monedas» (perfil, lección, desafío, simulacro, duelo, tarjetas, contrarreloj, historial y misiones).
- **Topbar interactivo**: en el Camino, junto al nombre, hay tres pastillas tocables — **Vidas**, **Racha** y **Monedas** — que abren sus ventanas propias (estilo kit de estudio, con iconos SVG propios, sin emojis).
  - *Vidas*: tus 5 corazones, «Siguiente vida en…» con cuenta real, recuperar todas por 800 monedas y acceso a modo práctica.
  - *Racha*: número grande de días, barra semanal de los últimos 7 días con los activos marcados, protectores disponibles y compra de protector por 500 monedas.
  - *Monedas*: abre la tienda.
- **Tienda en el Camino**: tarjeta propia con seis artículos — Protector de racha (500, máximo 3), Recuperar todas las vidas (800, se oculta si estás lleno), colores premium Oro real / Cian hielo / Lila neón (900 c/u), Bigote (1200) y Diadema de estrella (1000). Los artículos comprados muestran la etiqueta «Comprado».
- **Candados que compran de verdad**: los candados del editor de avatar (colores premium, bigote, diadema de estrella) ahora compran directamente con tus monedas; si no te alcanzan, abren la tienda con un aviso. Lo comprado viaja con tus preferencias en la nube.
- **Botón «Duelo»**: el reto contra cualquier fila de la liga (bot o persona real) se llama ahora **Duelo**.
- **Cambiar contraseña solo en Ajustes**: la tarjeta aparece únicamente en la pestaña Ajustes del Perfil, no en Progreso ni en Personalizar.

**Módulos:** parche base (topbar, monedas en textos, `touch` con protector, contraseña) + `demo-html/modulos/v42-tienda.js` (nuevo) + icono «moneda» en v35 + artículos premium en v37. Caché PWA a `rscp-v28` / `reto-saber-v26`.

**Corrección (v42.1)**: la ventana emergente ahora es **singleton**: se elimina cualquier capa previa antes de dibujarse (nada de ventanas superpuestas tras un doble toque), se cierra sola al entrar a una lección o cuento, la tarjeta de la tienda se refresca en cada render (la cartera y los precios deshabilitados nunca quedan viejos) y un seguro adicional deja una sola capa al primer click del usuario. Caché PWA a `rscp-v29` / `reto-saber-v27`.

### v43 — Cuentos dentro del mapa del Camino, pestaña Tienda y narración con pesos colombianos

- **Cuentos hace parte del Camino**: la tarjeta de Cuentos (madurez lectora + 4 etapas) ahora se muestra dentro del Camino, y el mapa de puntos termina con un **nodo Cuento** propio — un punto rojo coral con el libro (SVG propio), que abre directamente la etapa actual del lector. Un solo mapa para todo el estudio diario.
- **La pestaña Cuentos ahora es Tienda**: en la barra inferior donde estaba Cuentos vive ahora el botón Tienda (icono de escaparate SVG propio). No es una pestaña: abre la ventana de la tienda v42 sobre la vista actual y se marca como activa mientras está abierta. Los Cuentos seguían accesibles desde la tarjeta y el nodo del mapa.
- **Narración con pesos colombianos**: al escuchar un cuento, todo lo que en la voz suene a dinero se dice en pesos colombianos — `$5.000` se lee «cinco mil pesos colombianos», «moneda(s)» y «COP» se leen «peso(s) colombiano(s)», y los «pesos» ya dichos no se duplican. El texto en pantalla no cambia; es solo el audio. Vía `window.RS43.vozPesos`.
- Botón nuevo de icono «tienda» en v35.

**Módulos:** parche base (nav Tienda, nodo Cuento en el mapa, tarjeta en el Camino, `vozPesos` + su uso en el audio) + `demo-html/modulos/v43-camino-cuentos.js` (color del nodo, API RS43) + sprite «tienda» en v35. Caché PWA a `rscp-v30` / `reto-saber-v28`.

**Corrección (v43.1) — contraste e identidad de ventanas**: la ventana emergente usaba `background:var(--cv)`, una variable **que nunca fue definida** — el fondo quedaba transparente y todo se mezclaba con la app detrás. Ahora: fondo real de tarjeta (`--cd`), franja superior e icono de color **distinto por ventana** (Vidas rosa carmín, Racha naranja ámbar, Tienda con el acento de tu paleta), telón más oscuro detrás, sombra más profunda y filas de tienda diferenciadas. Además se crea la variable `--ac-tx`: el texto sobre botones de acento es blanco en tema claro y **navy oscuro en tema oscuro** (antes era blanco sobre acentos claros como el índigo, azul cielo o esmeralda claro — por eso todo se veía «lavado»). El nodo Cuento sube su coral para legibilidad en ambos temas.

### v44 — Plan nocturno: el estudio del día siguiente, listo desde la noche

- **Se prepara de noche**: al abrir la app después de las 19:00, la app arma tu **Plan nocturno para mañana** (aparece al tope del Camino, en tarjeta propia con barra de avance). Si abres de día, el plan se arma para ese mismo día. Cuando cambia la fecha, se rehace con tus datos más recientes.
- **Todas las áreas, siempre**: 7 bloques — Repaso de tus errores, una lección por **cada área del examen** (5) y un cuento de lectura crítica. Nadie se queda fuera.
- **Énfasis en lo débil**: tus 2 áreas más débiles —según tu evaluación de admisión y los errores guardados en Repaso— van primero y marcadas con la etiqueta **Profundizar**; el resto, con **Reforzar**. El nivel recomendado de cada lección sale de tu puntaje por área. Las áreas sin diagnóstico cuentan como "por medir", no como débiles.
- **Todo es tachable**: cada bloque se marca listo con un toque (el Repaso se marca solo cuando no tienes errores pendientes). Al completar el plan del día ganas **60 monedas** (una sola vez por plan). Botón «Rehacer el plan con lo último» si cambian tus datos.
- Sin emojis: iconos propios (reloj, bandera, cuaderno, libro) del catálogo v35.

**Módulos:** `demo-html/modulos/v44-plan-nocturno.js` (nuevo; plan, CSS y recompensa; `window.RS44` para pruebas, `window.RS44HORA` para fijar la hora en tests). Caché PWA a `rscp-v31` / `reto-saber-v29`.

**Mejora (v44.1) — cajones con aire y ventanas funcionales**: los chips/cajones (carreras, áreas, exámenes) ya no recortan su texto ni quedan apretados en horizontal: las filas **envuelven** en varias líneas con espacio uniforme y cada caja muestra su nombre completo. La ventana emergente (Vidas/Racha) gana aire: más padding y separación (20 px/14 px), corazones más grandes y **botones al ancho completo** en las ventanas centradas — los precios de la Tienda no se tocan, siguen en su fila.

**Corrección (v44.2) — adiós al bucle de recargas de la nube**: el juego se recargaba solo en un bucle infinito para quienes tienen sesión de nube. Causa raíz: al fusionar los datos de la nube con el local, un **empate de XP elegía siempre la copia de la nube**; como el Plan nocturno (v44) regenera el plan y guarda al arrancar, cada carga terminaba con diferencia entre lo local y lo fusionado, y `restaurar()` disparaba `location.reload()` — una y otra vez, sin fin. Ahora: en empate de XP **gana lo local** (no hay diferencia, no hay recarga), y si la nube gana por XP de verdad, se conserva el **plan nocturno más reciente** en lugar de borrarlo. Corregido en las dos rutas de fusión (nube e iframe). Verificado con el test nuevo `test-v442` (6 aserciones vía `RS27.fusionar`: empate idéntico sin recarga, plan sobrevive al empate, nube con más XP conserva el plan local, XP local mayor se mantiene) + batería completa de regresión (v39–v44, bat1–4, cero-emoji, preview, fuzz ×400 secuencias sin violaciones). Caché PWA a `rscp-v33` / `reto-saber-v31`.

### v45 — Evolución de la mascota con el XP

- **Tu mascota crece contigo**: 5 etapas que llegan solas por el **XP total de tu cuenta** (el mismo que alimenta la Liga y la temporada): **Destello** (0 XP) → **Chispa** (150) → **Cometa** (400) → **Estrella** (900) → **Constelación** (1800).
- **Visibles en todas partes**: la capa de evolución se dibuja sobre el avatar del topbar, del Perfil, de la Liga y de las reacciones. Cada etapa suma la anterior: chispa compañera, estela de cometa, insignia de estrella en el pecho y, al final, halo con constelación de dos destellos unidos por una línea punteada.
- **Sin estado extra**: la etapa NO se guarda — se deduce del XP. Así sobrevive intacta a cualquier fusión con la nube y no puede desincronizarse.
- **Tarjeta de progreso en el Perfil**: dentro del editor de la mascota verás tu etapa actual (pill dorada + icono de estrella SVG propio), cuánto llevas dentro de la etapa y **cuántos XP faltan** para la siguiente. En Constelación, la barra se llena del todo.
- Sin emojis: todo es SVG dibujado a mano; el gancho vive en el `avatarSVG` de v37, así que si v45 no está el avatar queda exactamente igual.

**Módulos:** gancho en `demo-html/modulos/v37-mascota.js` + `demo-html/modulos/v45-evolucion.js` (nuevo; etapas, capas SVG, tarjeta de progreso y CSS; API `window.RS45`). Caché PWA a `rscp-v34` / `reto-saber-v32`.

### v46 — Rival sugerido y marcador de duelos entre personas reales

- **Rival sugerido en la Liga**: una tarjeta nueva propone hasta 3 rivales de tu semana y liga — reales de la nube o cuentas de tu dispositivo — ordenados por **cuánto se parecen tus XP semanales** (el primero lleva la marca «tu nivel de XP ahora mismo»). Se reta con el botón **Duelo** de siempre: 10 preguntas y el rival responde con su **precisión real**; sin rivales disponibles, la tarjeta lo explica y sugiere cómo crearlos.
- **Marcador contra cada rival**: al terminar cada duelo se guarda tu registro personal por rival (victorias · derrotas · empates, `u.riv`) y la tarjeta lo muestra («marcador 2V · 1D»). Sobrevive a la nube porque viaja dentro del usuario. La estadística global de duelos de la base (`u.duel`) queda igual: la suma exacta la sigue haciendo la mecánica original.
- Sin duplicados: la tarjeta se refresca en cada render y vive una sola vez por Liga.

**Módulos:** `demo-html/modulos/v46-rivales.js` (nuevo; candidatos, sugerencia por XP semanal, marcador y CSS; API `window.RS46`). 

### v47 — Dos artículos nuevos para la mascota: Sombrero vueltiao y Bufanda sabia

- **Sombrero vueltiao** (9): copa crema con bandas negras y ala ancha — identidad colombiana en tu mascota. **1500 monedas**.
- **Bufanda sabia** (10): bufanda turquesa con cola colgando y flecos, para las noches de estudio. **1300 monedas**.
- Ambos: premium (candado en el editor que compra directo), catálogo de la Tienda con icono SVG propio (vueltiao y bufanda van al sprite v35), y una vez comprados se seleccionan como cualquier accesorio. El catálogo de accesorios del editor pasa de 9 a 11 opciones; Sorpréndeme sigue eligiendo solo entre los 7 gratuitos.
- La calibración de tests existentes se ajustó al catálogo grande (test-v42: máximo de botones de compra; test-bat3: 11 opciones).

**Módulos:** sprites «vueltiao» y «bufanda» en `v35-area-iconos.js`; `ACCS=11`, nombres, anclas y dibujo en `v37-mascota.js`; precios/catálogo/compra en `v42-tienda.js`.

### v48 — Recordatorio del plan nocturno con la app abierta

- Si la aplicación queda abierta, ahora avisa sin que tengas que refrescar: **desde las 19:00** te invita a armar el plan de mañana si aún no existe, y **desde las 20:00** recuerda los bloques pendientes del plan de mañana (una sola vez por día en cada caso; aviso por voz-tirón `say`, sin impedir nada).
- Sin estado nuevo en el usuario: el aviso vive en la sesión. En lección o repaso se calla; con la pestaña quieta lo revisa cada minuto. `window.RS48HORA` permite fijar la hora en pruebas; API `window.RS48`.

**Módulos:** `demo-html/modulos/v48-recordatorio.js` (nuevo; `window.RS48`). Cache PWA a `rscp-v35` / `reto-saber-v33`.

### v49 — Ventanas con aire, precios acordes a las ganancias, icono de objetivos y tienda solo en su pestaña

- **Espacio entre botones en las ventanas (vidas y racha)**: los botones y textos de los cajones ahora quedan en columna con un aire de 10px entre cada elemento (`display:flex` + `gap`), y en móvil ya no se ven pegados ni encimados.
- **Precios de la tienda ajustados a las ganancias**: con una ganancia típica de 100–250 monedas diarias, ahora quedan así: protector de racha **250**, recuperar vidas **350**, colores premium **600** cada uno, bigote **900**, diadema **800**; el Sombrero vueltiao subió a **2500** y la Bufanda sabia a **2000** como artículos de lujo de largo plazo.
- **Icono de objetivos en la cartera**: donde estaba el icono de la moneda ahora está la **diana de objetivos**, dibujada en SVG propio y tocable (abre la tienda) exactamente igual que los iconos de vidas y racha del topbar. El encabezado de la tienda también usa la diana.
- **La tienda vive solo en su pestaña**: se quitó la tarjeta de tienda que estaba incrustada en el Camino (ahora el camino queda limpio). La ventana de la tienda ganó la línea «Tienes N monedas», así que es autosuficiente.
- **Pruebas**: test-v42 reescrito para el flujo nuevo (comprar desde la ventana, nada inyectado en el camino, precios v49), test-v47 recalibrado a 2500/2000. Batería completa en verde; las 3 copias del demo idénticas.

**Módulos:** `demo-html/modulos/v42-tienda.js` (CSS de ventanas, precios, cartera en el modal, inyección reducida) y sprite diana en el MAP del topbar (`v35-area-iconos.js`). Caché PWA a `rscp-v36` / `reto-saber-v34`.

### v50 — La voz lee pesos colombianos en toda la app

- La narración de cuentos ya decía el dinero en pesos colombianos (`$5.000` se leía «cinco mil pesos colombianos», «monedas» se leía «pesos colombianos»); ahora **toda la voz de la app** hace lo mismo: los enunciados narrados, las explicaciones al responder y cualquier aviso hablado en español convierten el dinero a pesos colombianos en el audio.
- Se hace con un envoltorio sobre `speechSynthesis.speak` (vía `RS43.vozPesos`, que es idempotente: un texto ya convertido nunca se vuelve a tocar). El **audio en inglés** (escuchar preguntas) no se toca; en pantalla el texto sigue igual — es solo la voz.
- Re-auditoría «cero emojis» de fondo: 0 emojis en atributos (`title`/`aria-label`/`value`) y 0 emojis sueltos fuera del mapa de iconos — todo lo que podía verse está cubierto.

**Módulos:** `demo-html/modulos/v50-voz-pesos.js` (nuevo; envoltorio de TTS; API `window.RS50`).

### v51 — Dos artículos nuevos para la mascota: Mochila escolar y Corbata de honor

- **Mochila escolar** (11): correas sobre el bloque y maleta naranja al hombro — para llevar la PKM de estudio a todos lados. **1250 monedas**.
- **Corbata de honor** (12): nudo azul con pica y línea de brillo, para los días grandes. **1600 monedas**.
- Ambos: premium (candado en el editor que compra directo), catálogo de la Tienda con icono SVG propio (`mochila` y `corbata` van al sprite v35) y dibujo en `v37` anclado a las guías de cada forma. El catálogo de accesorios del editor pasa de 11 a **13** opciones; Sorpréndeme sigue eligiendo solo entre los 7 gratuitos.

**Módulos:** sprites «mochila» y «corbata» en `v35-area-iconos.js`; `ACCS=13`, nombres, `esPremium` (llaves `b` y `t`), tiles `0..12` y dibujo en `v37-mascota.js`; precios/catálogo/compra en `v42-tienda.js`.

### v52 — Tutorial de bienvenida en 6 mini tarjetas

- **Al registrarse** (tuto 0), el juego abre una guía de **6 mini tarjetas** que explica en texto breve cómo funciona todo al 100%: el Camino y los niveles, las **vidas**, las **monedas y la Tienda**, la **racha**, las **ligas y duelos**, y los **cuentos + el plan nocturno**. Cada tarjeta trae dos botones: **Siguiente** para avanzar y **Saltar** para salir y empezar a jugar (también hay «Empezar a jugar» en la última).
- Cierra definitivamente al saltar o terminar (`tuto 1`, guardado) y **no vuelve a molestar**: ni dentro de lecciones ni repasos. Se puede **reabrir desde Perfil > Ajustes** con «Ver el tutorial de nuevo». Los usuarios antiguos la ven una sola vez y ya.
- Ventana con puntos de progreso, aria-completa, iconos SVG propios del catálogo v35 y **cero emojis** verificado con el recorrido del DOM.

**Módulos:** `demo-html/modulos/v52-tutorial.js` (nuevo; API `window.RS52`). 22/22 pruebas.

### v53 — Banco rotativo ampliado: 10.003 preguntas, 1.429 exactas por área (Saber 11, TyT y Pro)

- Verificación completa del banco rotativo y ampliación hasta **10.003 preguntas únicas**, con **la misma cantidad por área (1.429 × 7)**: Matemáticas, Razonamiento Cuantitativo, Ciencias Naturales, Sociales y Ciudadanas, Lectura Crítica, Inglés y Comunicación Escrita — **en los tres exámenes** (Saber 11, Saber TyT, Saber Pro).
- Espacios combinatorios ampliados en los generadores para sostener la cuota sin repetir: personas y escenarios de Sociales y Ciudadanas (20 nuevos perfiles), pares persona/tiempo de Lectura Crítica (12 × 12), sujetos de Inglés (12) y 4 plantillas nuevas de Comunicación Escrita (no obstante, también, hasta que, de modo que).
- Rotación verificada por usuario: 200 tomas de 5 preguntas sin repetición dentro de cada toma; 0 preguntas malformadas en las 7 áreas.

**Módulos:** `demo-html/modulos/v21-banco-rotativo.js` (ampliado). Pruebas 14/14 + sonda del banco 10.003/10.003.

### v54 — 15 cuentos con etapas, progreso por cuento y audio en inglés

- La biblioteca de cuentos pasa de 1 a **15 historias originales** (biblioteca sin reloj, chigüiro del recreo, bicicleta naranja, mercado de las flores, Sal y luz en Manaure, silbo del cañón, alfombra de aserrín, buque de los atardeceres, fábrica de velas, buque de papel, cancha de los domingos, cartas del Pacífico, niña del acordeón, bus de las siete, campeona callada).
- Cada cuento tiene **4 etapas** (de Lector Acompañado a Lector Autónomo, con cada vez menos ayudas) y **4 preguntas de comprensión**; el progreso se guarda **por cuento** (`cuf`) y la **Madurez lectora** es el total de etapas superadas sobre las 60 posibles.
- Los usuarios viejos se migran solos (el avance de antes pasa al cuento 1). El nodo «Cuento» del mapa y la fila del plan nocturno abren siempre el **cuento actual**.
- **Audio en inglés**: en el lector hay una casilla «Escuchar en inglés» que narra las 6 oraciones en en-US (visibles en la pantalla, con nota de modo bilingüe); en español sigue la voz con pesos colombianos.
- La tarjeta de cuentas se integró al **Camino**: 15 bloques con progreso, etapas bloqueadas/desbloqueadas y accesos directos.

**Módulos:** `demo-html/modulos/v54-cuentos.js` (nuevo; API `window.RS54`). Pruebas 26/26 + batería regresiva completa en verde; las 3 copias del demo idénticas.

### v55 — Camino por etapas, mapa interactivo, Tienda con pestaña propia, 12 paletas y 9 fondos

- **Fin de los módulos de dificultad**: el camino de cada área pasa de 3 niveles (Básico/Intermedio/Avanzado) a **etapas continuas** (Despegue, Fundamentos, Práctica, Constancia, Avance, Reto, Nivel fuerte, Maestría, Élite, Cima, Dominio; 26 lecciones por etapa). Cada área es **un solo camino que se alarga lo necesario** para usar **todas las preguntas del banco** (286 lecciones por área con la cuota v21); las lecciones ya no filtran por nivel, así que el 100 % del banco rota por el camino.
- **Mapa más interactivo**: tarjetas de área con etapa actual y barra de progreso, chips de las 11 etapas, línea de ruta punteada entre nodos, la siguiente lección marcada con un **anillo pulsante** (respeta `prefers-reduced-motion`), botón «Ir a mi etapa» y scroll automático al nodo pendiente.
- **Tienda con pestaña propia** (igual que Camino/Repaso/Carreras, ya no es una capa sobre otras pestañas) y **catálogo ampliado**: protector de racha, recuperar vidas, doble de monedas, 6 colores premium de avatar y 6 artículos nuevos (bigote, diadema de estrella, sombrero vueltiao, bufanda sabia, mochila escolar, corbata de honor).
- **Variedad visual**: las paletas pasan de 5 a **12 combinaciones de color** (todas con contraste AA verificado) y se suman **9 fondos de pantalla** (Clásico, Aurora, Atardecer, Océano, Bosque, Noche estrellada, Dunas, Malla, Puntos) elegibles en Perfil > Accesibilidad y guardados en `DB.pref.fondo`.

**Módulos:** `demo-html/modulos/v55-apariencia.js` (nuevo; API `window.RS55`), `v21-banco-rotativo.js` (reutilizado sin filtro de nivel), `v40-avatars.js` y `v42-tienda.js` (ampliados). 

### v56 — Material oficial del Icfes dentro del juego

- Nueva tarjeta **«Material oficial · Icfes»** en la pestaña Repaso: práctica con **82 preguntas oficiales** extraídas de los cuadernillos y guías Saber 11 que el equipo sube al repositorio `material` (Matemáticas, Lectura Crítica, Ciencias Naturales y Sociales y Ciudadanas, con la clave oficial de respuestas). Se practican de a 10 al azar, sin vidas ni límite de tiempo, y cada acierto da 5 monedas.
- Cada pregunta conserva su **afirmación/evidencia evaluada** como retroalimentación («Clave oficial: B. Esta pregunta evalúa: …») y las de las guías traen la **explicación oficial completa**.
- Catálogo de los **20 temas explicados de muestra** (PDFs del repositorio `material`) agrupados por área.
- El dataset completo (137 preguntas normalizadas al esquema de la Tarea 2, con fuentes, URL y licencia) queda en `docs/material-oficial/preguntas-oficiales.json`, validado con `validar_preguntas.py`. Las preguntas que dependen de figuras/tablas no reconstruibles en texto quedan marcadas con `requiere_imagen` y se excluyen del juego hasta disponer de sus imágenes.
- Pendiente para próximas cargas del repo `material`: respuestas del Mini Test 2027, más cuadernillos (Inglés) y los cuentos.

**Módulos:** `demo-html/modulos/v56-material-oficial.js` (nuevo; API `window.RS56`).

### v57 — Cuentos alineados al material oficial de Lectura Crítica

- Las 4 etapas de los 15 cuentos ya no son solo niveles de asistencia: cada una entrena una **competencia oficial de Lectura Crítica del Icfes**, tomando los temas del repositorio `material`: **Contenidos locales · Información explícita** (tema 03), **Palabras en contexto** (vocabulario), **Inferencias** (tema 07) y **Reflexión y propósito · Sentido global** (tema 09).
- Cada etapa evalúa **primero la pregunta de su competencia** (las otras tres completan la ronda de 4, con umbral de 2 aciertos para superar la etapa).
- El lector muestra en cada etapa «Esta etapa entrena: Tema NN · <competencia>» y las preguntas se etiquetan con los nombres oficiales (Información explícita, Palabras en contexto, Inferencias, Reflexión y propósito).

**Cambios en el núcleo del demo** (constante `ET`, acción `rq` y ensamblaje de `window.RS54`).

**Caché PWA** subida a `rscp-v38` / `reto-saber-v36`.

### v58 — Sesión blindada, cuentos intercalados y nuevo nombre sin «demo»

**Bugs corregidos (la app ya no se reinicia al recargar):**
- Persistencia blindada: `save()` reintenta con una copia recortada (diario/repaso/historial con tope) si el almacenamiento se llena, y además guarda una **copia espejo mínima** (`retosaber.sesion`) con la sesión y las preferencias. Si el bloque grande se corrompe o no cabe, al abrir de nuevo la app recupera el tema elegido y la sesión activa desde el espejo.
- Se pide `navigator.storage.persist()` para que el navegador no evacue los datos del juego.
- El service worker se registra ahora desde el propio juego (antes nadie lo registraba en producción) y pasa a `rscp-v40` con estrategia **network-first para navegaciones**: cada actualización llega de verdad al usuario y sin conexión sigue abriendo la app.

**Cuentos intercalados en el camino:** el nodo suelto del final desaparece; ahora después de **cada 5 lecciones** aparece el siguiente cuento (rotan los 15) con su etapa de comprensión lectora; los completados se marcan con ✓ verde. La pestaña Cuentos sigue disponible en el Perfil.

**Nombre y URL sin «demo»:** el archivo canónico pasa a `public/juego/Reto-Saber.html`, la URL pública es `/` (y `/juego/Reto-Saber.html`); la ruta antigua `/demo/Reto-Saber-Demo.html` redirige a la nueva. Todos los textos de la app ya no dicen «demo» (título, pantallas de cuenta, privacidad, descarga, panel parental). Actualizadas las copias (`demo-html/`, `desktop/`), los scripts (`sincronizar.js`, `actualizar_nube.py`, `actualizar_demo.py`), el iframe de la variante React y los tests.

**Caché PWA** subida a `rscp-v40` / `reto-saber-v37`.

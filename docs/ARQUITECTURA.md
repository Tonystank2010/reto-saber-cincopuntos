# Arquitectura técnica · PROPUESTA de Claude

> **Estado:** propuesta para revisar con Danny y el equipo; no es una decisión confirmada. El demo actual (`demo-html/`) no usa servidor ni base de datos en ejecución: sus preguntas vienen de `base-de-datos/` y se copian dentro del HTML. Nace de las notas de la "Reunión Danny" (18 de octubre) y se complementa con el plan de Copilot (`PROYECTO.md`, `DECISIONES.md`, `TAREAS.md`).

## 1. Qué entendí de las notas

| Nota de la reunión | Cómo la interpreto | Propuesta |
|---|---|---|
| Crear esquemas separados | Separar la base de datos por áreas (y, a futuro, por cliente) | Esquemas `core`, `auditoria` y `reportes` (ver `base-de-datos/esquema-inicial.sql`) |
| BD solo guarda datos | Sin reglas de negocio dentro de la base de datos | Sin triggers ni procedimientos con lógica; la lógica va en la aplicación |
| Generar de SQL, exportar a Excel | Reportes salen de consultas SQL | Esquema `reportes` con vistas de solo cifras, exportables a CSV/Excel |
| A futuro montarlo en Postgres | El destino es PostgreSQL | Escribir el SQL compatible con PostgreSQL 15+ desde el inicio |
| Prender o apagar módulos y de ahí poder cobrar | Cada cliente tiene módulos activos; el cobro se apoyará en eso más adelante | Tabla `organizacion_modulo`. **Sin planes, precios ni cobros por ahora** (decisión vigente) |
| Parámetros: seguro, backup fácil, rápido, miles de usuarios, concurrencia, escalable | Requisitos no funcionales | Ver sección 3 |
| Primer módulo: registro de datos; orden de los módulos | Definir qué se construye primero | Ver sección 4 |
| Crear la empresa y activar sus módulos | Alta de una organización con sus módulos | Tablas `organizacion` y `organizacion_modulo` |
| Separación de datos y auditoría por cliente | Cada cliente solo ve lo suyo, con su propia traza | `organizacion_id` en todas las tablas, Row Level Security y `auditoria.evento` |
| Pruebas unitarias | Código probado desde el principio | Ver sección 5 |
| Responsive | Funciona bien en celular | Diseño pensado primero para celular |
| GitHub o GitLab | Dónde vive el código | Seguir con GitHub, donde ya está el repositorio y trabaja Copilot |
| Configurar los "arneses" para que la IA lo tenga más definido | Reglas e instrucciones fijas para las IA | Ver sección 6 |
| Danny trabaja en JavaScript | Stack alineado con quien lo va a mantener | Node.js con TypeScript y PostgreSQL |

**Supuesto a confirmar:** interpreté "empresa/cliente" como una **organización** (puede ser la propia Empresa 5., un colegio o un grupo piloto). Si en realidad las notas hablan de otro proyecto, hay que ajustar esta propuesta.

## 2. Idea general

```
Celular / navegador  →  API (Node.js + TypeScript)  →  PostgreSQL
                                                         ├─ core       (organizaciones, módulos, usuarios)
                                                         ├─ auditoria  (eventos por cliente)
                                                         └─ reportes   (vistas para Excel)
```

## 3. Requisitos no funcionales

- **Seguro:** datos mínimos de personas (apodo, grado, correo); nada de documento, dirección ni fotos; consentimiento del acudiente para menores; claves fuera del repositorio.
- **Backup fácil:** una sola base PostgreSQL con copias automáticas y una prueba de restauración antes de abrir a usuarios reales.
- **Rápido y concurrente:** índices por `organizacion_id`; conexiones agrupadas; consultas pequeñas.
- **Miles de usuarios y escalable:** una sola base compartida con aislamiento por `organizacion_id` escala mejor que un esquema por cliente cuando hay muchos clientes.

## 4. Orden propuesto de los módulos

1. **Registro de datos:** organizaciones, usuarios, consentimientos y auditoría.
2. **Banco de preguntas:** preguntas originales con la plantilla de `contenido/`.
3. **Práctica y retos.**
4. **Progreso y repaso de errores.**
5. **Simulacro** cronometrado.
6. *(Fuera de alcance hasta autorización)* Planes y cobros.

## 5. Pruebas

- Pruebas unitarias de la lógica (por ejemplo, reglas de activación de módulos y de consentimiento).
- Pruebas de aislamiento: un cliente nunca debe ver datos de otro.
- Datos ficticios en todas las pruebas.

## 6. Arneses para las IA (reglas fijas)

Complementan `.github/copilot-instructions.md`:
1. La base de datos solo guarda datos; sin lógica de negocio en SQL.
2. Todo dato de cliente lleva `organizacion_id`.
3. Ningún dato personal fuera del mínimo definido.
4. Sin pantallas, botones ni tablas de planes pagos mientras no haya autorización.
5. Toda función nueva lleva su prueba.
6. Preguntas propias; nunca copiadas del ICFES.
7. Las ideas de una IA no son decisiones hasta que el equipo las apruebe.

## 7. Decisiones abiertas (para Danny y el equipo)

1. ¿Aislamiento por **filas** (una base compartida, recomendado) o por **esquema por cliente**?
2. ¿Qué es exactamente un "cliente" en la primera versión?
3. ¿Dónde se aloja la base de datos y quién paga el servicio?
4. ¿PostgreSQL desde el primer día, o algo más sencillo mientras se prototipa?
5. ¿Cómo y quién autoriza el paso a desarrollo (P07)?

## Autenticación y datos al pasar a un servidor

El demo guarda cuentas y contraseñas (con hash) en el navegador. No debe usarse como base de un servicio real. Al contratar el hosting:

- **Inicio de sesión del proveedor.** Usar la identidad administrada del servicio en lugar de guardar contraseñas propias. Si se guardan, usar un algoritmo de hash lento con sal (por ejemplo, argon2 o bcrypt), no un hash simple.
- **Verificación de correo y recuperación de contraseña**, que el demo no tiene.
- **Menores.** Autorización verificable del acudiente antes de activar la cuenta, datos mínimos y sin documento de identidad.
- **Roles y aislamiento.** Estudiante, docente o acudiente y administrador, con separación por organización (ver `base-de-datos/esquema-inicial.sql`).
- **Sesiones y transporte.** Sesiones con expiración y HTTPS obligatorio.
- **Respaldo.** Copias automáticas y una prueba de restauración antes de abrir a usuarios reales.
- **Eliminación.** Borrar la cuenta elimina el progreso, las estadísticas ligadas a ella y los consentimientos.
- **Panel de acompañamiento real.** Permisos por relación (acudiente con estudiante, docente con grupo) y consentimiento registrado. El panel del demo es solo local.
- **Revisión legal** (Ley 1581 y normas de protección de menores) antes de abrir a usuarios reales.

## Módulo v21 — banco rotativo de 10.000 preguntas

Los flujos de práctica (lección, repetición, simulacro, diagnóstico, repaso,
duelo, cuadernillo) pasan por una única puerta: la función `draw(área, nivel, k)`.
El módulo v21 envuelve esa puerta y entrega preguntas desde ciclos por usuario y
área (`u.b10k[area]={s,p}`), con mezcla determinista (PRNG mulberry32) del espacio
del área: sin repeticiones hasta agotar el ciclo; al agotar se vuelve a sembrar.
Las preguntas fijas del banco original se intercalan en el ciclo (≈20 % del ciclo).

- Cuotas: Matemáticas 2200 · Razonamiento Cuantitativo 2200 · Ciencias 2164 ·
  Sociales 1000 · Lectura Crítica 900 · Inglés 936 · Comunicación Escrita 600
  (total 10.000).
- Áreas fuera de la cuota (p. ej. Competencias Ciudadanas) caen al `draw` original.
- Verificación automática en CI: `tests/v21-unicidad.cjs` (unicidad por espacio,
  integridad ABCD y rotación completa sin repetición).

## Módulo v22 — traspaso de progreso con código

> **v22.1 (corrección):** el compresor LZW solo tiene literales de la tabla U+0000–U+00FF; los caracteres mayores («−» U+2212 de Matemáticas, comillas tipográficas, emojis) ahora se escapan como `\uXXXX` antes de comprimir. Con esto el código generado nunca queda alterado y el checksum  coincide siempre. Cachés PWA subidas a `rscp-v5` / `reto-saber-v3`.

Método práctico de portabilidad además del respaldo por archivo:

- **Generación** (`RS22.generar()`): serializa la cuenta con la misma lista `KP` del respaldo (cbx), la comprime con **LZW** (diccionarios codificador/decodificador separados, límite 65000 entradas) y la empaqueta en base64 URL-safe. Formato `RS1.<payload>.<4 caracteres de checksum>` (checksum aritmético mod 1679616 del JSON original).
- **Interfaz** (`RS22.tarjeta()`): tarjeta inyectada en el Perfil, después de «Copia de seguridad de mi cuenta», con patrón DOM-injection de v20 (wrapper seguro de `render`, guard `data-v22`). Acciones nuevas `t22g / t22cc / t22ec / t22a` añadidas con `Object.assign(A, …)`.
- **Aplicación** (`RS22.aplicar()`): valida formato, descomprime, verifica el checksum y reutiliza **`impCuenta()`** del demo (misma sanitización y confirmaciones que el respaldo por archivo).
- **Enlace directo** (`RS22.enlace()`): construye `URL-actual#rstr=<código>`; al abrirlo, el módulo detecta el hash, limpia la URL y ofrece aplicar el traspaso.
- **Errores amables**: código cortado, prefijo ajeno, base64 inválido, descompresión fallida o checksum incorrecto producen mensajes accionables sin tocar datos.
- **Caché PWA**: `rscp-v4` (public/sw.js) y `reto-saber-v2` (pwa/sw.js).
- **API de pruebas**: `window.RS22 = { generar, decodificar, aplicar, enlace, tarjeta, lzwC, lzwD }`.


## Módulo v23 — recordar contraseña en el dispositivo

- Guarda `DB.rec={em,pw}` en localStorage del dispositivo al crear cuenta o entrar (nunca se exporta: no está en `KP`, ni en el puente, ni en la copia por archivo).
- Pantalla «Entrar»: tarjeta «Entrar como <nombre>» (un clic, `A.rcl`) y «Olividar contraseña guardada» (`A.rol`).
- Traspaso v22: la cuenta viaja con `salt`+`ph` (hash SHA-256), así el mismo correo+contraseña entran en el otro dispositivo.
- Aviso del login actualizado. Cachés PWA: `rscp-v6` / `reto-saber-v4`.

## Módulo v24 — tecla Enter

- Único listener global `keydown` (el demo no tenía ninguno): Enter en `#nm`/`#em`/`#pw` con `S.view==='auth'` hace clic en `A.in`/`A.new` (según `S.at`); anti-doble-envío 800 ms; Shift/Alt/Ctrl+Enter no envían.
- Ctrl/Cmd+Enter en `#t22v`/`#v23t` aplica el código de traspaso (`A.t22a` / `A.rap`).
- Cachés PWA: `rscp-v7` / `reto-saber-v5`.

# Demo HTML de Reto Saber

Un solo archivo, `Reto-Saber.html`. Se abre con doble clic en un navegador reciente, sin internet, sin terminal y sin instalar nada. Es independiente del demo con React de `src/`.

## Qué incluye
- **Cuentas locales** con usuario, correo y contraseña (guardada como hash), confirmación de 18 años o autorización del acudiente, onboarding de tres pantallas y una versión corta de la política de privacidad en el pie de página.
- **Tres exámenes:** Saber 11 (Matemáticas, Lectura Crítica, Ciencias Naturales, Sociales y Ciudadanas, Inglés) y Saber Pro y TyT (Razonamiento Cuantitativo, Lectura Crítica, Comunicación Escrita, Competencias Ciudadanas, Inglés).
- **Evaluación de admisión** por bloques con pausa, puntaje por área, total sobre 500, pentágono, ruta recomendada y dificultad recomendada.
- **Mapa horizontal** de 50 niveles por dificultad y una introducción de conceptos antes de cada lección.
- **Reglas:** 45 s por pregunta, 5 vidas (recuperables con una evaluación, hasta 3), «No lo sé» sin penalización y «¿Qué tan seguro estás?».
- **Repaso:** variantes con números nuevos, errores por tipo y por tema, errores con mucha seguridad, fichas de estudio, glosario por área, estrategias de examen y una explicación alternativa tras tres fallos seguidos en un tema.
- **Preguntas con gráficos** y de **comprensión auditiva** en Inglés; botón para leer cualquier pregunta en voz alta (usa la voz del navegador).
- **Plan:** metas semanales, fecha del examen, simulacro de 40 preguntas con cronómetro, desafío semanal, insignias y evolución del pentágono.
- **Cuentos:** un cuento de muestra con cuatro etapas, diario privado y resumen con rúbrica.
- **Liga** con rivales ficticios y **panel de acompañamiento** local, con permiso de cada cuenta.
- **Piloto:** botón para reportar preguntas, exportación anónima (estadísticas, tiempos, opciones elegidas y días de uso), validación del puntaje estimado, carga de un banco `.json` y copia de seguridad de la cuenta.
- **Accesibilidad:** tamaño de letra, tema claro u oscuro, lectura fácil, ✔ y ✖ además del color, anuncios para lectores de pantalla y navegación con teclado.
- **Carreras:** las 8 áreas de educación superior con una ruta de cuatro etapas (propuesta de referencia).

## Límites
- El progreso se guarda **solo en el navegador** donde se usa, y se pierde si se borran los datos, salvo que se descargue la copia de la cuenta.
- Es un demo con **datos ficticios**. No usarlo con datos de menores reales hasta cerrar la privacidad (P05) y la revisión legal.
- Las preguntas son **borradores originales sin revisión humana**, no oficiales y no afiliadas al ICFES.
- El audio y la lectura en voz alta dependen de la voz del navegador; no se han escuchado en todos los dispositivos.
- Las gemelas y los gráficos solo existen para preguntas generadas al vuelo. Cuentos tiene un solo cuento.
- Instalarlo en el celular y usarlo sin conexión requiere hosting con HTTPS: ver `../pwa/LEEME.md` (preparado, no probado).
- Los ajustes de accesibilidad no se han probado con personas reales: ver `../piloto/pruebas-accesibilidad.md`.

## Cambiar las preguntas
Viven en `../base-de-datos/`. Mira su `README.md`.

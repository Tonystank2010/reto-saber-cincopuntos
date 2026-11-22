# Edición de contenido del demo

Edita `preguntas.json` y `preguntas-niveles.json` para crear preguntas originales de ejemplo. Sigue los campos descritos en `PLANTILLA-PREGUNTA.md`; cada objeto debe incluir examen, área, competencia, nivel, enunciado, cuatro opciones con IDs únicos, respuesta, explicación, autor, dos revisores, estado, fuente y `original: true`. Usa `estado: "ejemplo-demo"` y deja explícito que los revisores están pendientes hasta que se realice una revisión humana.

Cada pregunta mostrada se marca en la interfaz como **pregunta de práctica, no oficial**. No copies ni adaptes preguntas oficiales. El contenido actual es ilustrativo y no está aprobado curricularmente.

Edita `catalogo.json` para cambiar pruebas, áreas o los niveles Base, Intermedio y Avanzado que consume la interfaz. Usa IDs de área que coincidan exactamente con el campo `area` de las preguntas. Cada área de Saber 11 requiere cinco preguntas por nivel: cada lección usa las cinco preguntas de ese nivel y el diagnóstico selecciona dos básicas, dos intermedias y una avanzada. Antes de declarar disponible un examen, incorpora contenido original para las áreas correspondientes; la aplicación no fabrica contenido faltante.

El validador de este demo requiere 75 preguntas ilustrativas para Saber 11 (5 áreas × 3 niveles × 5 preguntas). Comprueba campos obligatorios, niveles y cobertura, IDs y enunciados duplicados, cuatro opciones, coincidencia con una única opción como respuesta correcta, marca de originalidad y estado de ejemplo. Ejecuta `npm run content:validate`. La validación automática no sustituye revisión factual, editorial, de accesibilidad ni curricular por dos personas.

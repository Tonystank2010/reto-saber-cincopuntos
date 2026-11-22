# Tarea 8 — Riesgos legales, técnicos y pedagógicos

## Legales

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Reproducir contenido © ICFES sin atribución o con uso comercial sin autorización | Media | Alto | Política de atribución (Tarea 7); contenido generado propio como prioridad; autorización expresa antes de monetizar |
| Percibirse como app oficial del ICFES | Media | Alto | Aviso visible permanente en créditos y en toda pregunta generada |
| Reutilización de preguntas oficiales modificadas sin señalarlo | Media | Medio | Regla de no alterar enunciados; campo `explicacion_generada` y marcado de transcripciones |
| Alojar PDFs oficiales como redistribución | Media | Medio | Preferir enlaces a icfes.gov.co; alojar solo con verificación de términos (pendiente de verificación con ICFES) |
| Privacidad de menores de edad | Baja | Alto | No pedir datos sensibles; borrado de cuenta; mínimos datos (nombre, correo) |

## Técnicos

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Preguntas oficiales dependientes de imágenes difíciles de transcribir | Alta | Medio | Almacenamiento de objetos + `recursos_requeridos` por id; accesibilidad (texto alternativo) |
| Sitio ICFES bloquea automatización (403 observado) | Alta | Medio | Descarga manual por navegador; registro de fuentes con verificación humana |
| Demo single-file alcanza límites de rendimiento (875 KB) | Media | Medio | Migración incremental a React + backend para el banco |
| Duplicación demo vs. React desincronizada | Alta | Medio | Fuente única de verdad para el banco (Tarea 2) y tests en CI para ambos |
| Colisiones al expandir familias del generador v21 | Baja | Medio | Test de unicidad v21 en CI ya vigila; validar nuevos parámetros por fuerza bruta |

## Pedagógicos

| Riesgo | Probabilidad | Impacto | Mitigación |
|---|---|---|---|
| Preguntas generadas desalineadas del marco oficial | Media | Alto | Taxonomías (Tarea 3) como parámetro de los generadores; revisión por competencia y evidencia |
| Explicaciones automáticas imprecisas | Media | Medio | Marcarlas como generadas; revisión periódica de las más falladas |
| Estudiantes creen que la app predice puntajes oficiales | Alta | Medio | Aviso claro: «la práctica no constituye puntaje oficial» |
| Fatiga por gamificación (XP sin aprendizaje real) | Baja | Medio | Estadísticas por competencia (no solo XP) y plan de estudio dirigido a fallas |

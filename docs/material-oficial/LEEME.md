# Material oficial · Preguntas del Icfes

`preguntas-oficiales.json` contiene **137 preguntas oficiales** del Icfes (Saber 11.º)
normalizadas al esquema de la Tarea 2 (`docs/investigacion/02-estructura-preguntas/`),
extraídas automáticamente del texto de los PDF que el equipo sube al repositorio
[material](https://github.com/Tonystank2010/material).

## Fuentes (todas con licencia de uso académico, sin fines de lucro)

| Módulo | Fuente | Preguntas | Usables en el juego |
|---|---|---|---|
| Matemáticas | Cuadernillo de preguntas Saber 11.º 2026 | 45 | 36 |
| Lectura Crítica | Cuadernillo de preguntas Saber 11.º 2026 | 49 | 27 |
| Ciencias Naturales | Cuadernillo de preguntas Saber 11.º 2026 | 40 | 24 |
| Lectura Crítica | Guía de orientación · ejemplos explicados | 3 | 3 |
| Sociales y Ciudadanas | Guía de orientación · ejemplos explicados | 2 | 2 |
| **Total** | | **137** (1 se descartó por opciones ilegibles) | **82** |

## Cómo leer cada registro

- `requiere_imagen: true` → la pregunta depende de una figura, tabla, gráfica,
  historieta o mapa que no se puede reconstruir en texto; **no se usa en el juego**
  hasta que se disponga de la imagen.
- `usable_en_juego: true` → está incluida en el módulo v56 del demo
  (tarjeta «Material oficial · Icfes» en la pestaña Repaso).
- `respuesta_correcta` viene de la **tabla de respuestas correctas** del propio
  cuadernillo; `competencia` conserva la afirmación/evidencia evaluada.
- `fuente: "ICFES"` + `url_fuente` + `licencia` documentan el origen.

## Validación

```bash
cd docs/investigacion/02-estructura-preguntas
python3 validar_preguntas.py ../../material-oficial/preguntas-oficiales.json
```

## Pendientes (a medida que se suba más material al repo `material`)

- Claves del «Mini Test Diagnóstico 2027» (las respuestas están en otro PDF).
- Cuadernillo de Inglés 2024 (2 exámenes; sus partes de relacionar requieren un
  formato distinto) y cuadernillos nuevos por área.
- Los cuentos: en el repo `material` todavía no hay cuentos; cuando se suban se
  integran a la biblioteca v54 (`window.RS54.DATOS`).

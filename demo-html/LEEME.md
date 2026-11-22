# Banco de preguntas

## Archivos
- `banco-preguntas.db`: base SQLite con la tabla `preguntas` (la fuente de las preguntas) y la vista `v_cobertura`.
- `banco-preguntas.json`: las preguntas generadas, en JSON.
- `generar_banco.py`: genera el banco con plantillas y datos variados, sin repetir preguntas dentro de un examen.
- `actualizar_demo.py`: copia las preguntas de la base al HTML del demo (guarda una copia `.bak`).
- `exportar_json.py`: exporta la base a `banco-exportado.json`, que se carga en el juego (Perfil > Cargar banco) sin tocar el HTML.
- `importar_datos_piloto.py`: recibe los `datos-piloto.json` que exporta el juego. Acumula estadísticas, tiempos y opciones elegidas; marca como `revisar` las preguntas reportadas; informa preguntas difíciles, lentas o con una opción incorrecta que atrae más que la correcta; resume retención y validación del puntaje; y sugiere cambios de nivel (`recalibracion-sugerida.csv`, que solo se aplican con `--aplicar-niveles`).
- `comprobar_similitud.py`: compara el banco con PDF de referencia y avisa de coincidencias casi literales. En la última comprobación, con los 8 PDF de consulta del proyecto, no hubo coincidencias. Solo detecta copias casi literales, no paráfrasis, y algunos PDF tienen poco texto extraíble.
- `probar_banco.py`: verifica la base (opciones válidas, explicaciones, ids únicos, sin preguntas repetidas y un mínimo por examen, área y nivel). La ejecuta GitHub en cada cambio (`.github/workflows/banco.yml`).
- `esquema-inicial.sql`: borrador de esquema para un servidor futuro (PostgreSQL). Es una propuesta; no se ha ejecutado.

## Contenido
La base tiene 1.095 preguntas: 1.020 generadas (34 por cada combinación de examen, área y dificultad) y 75 del repositorio (`contenido/`). **Las generadas son borradores** (`estado = 'borrador'`, `revisores = 0`) y requieren doble revisión humana antes de publicarse. Todas deben ser originales: no se copia material del ICFES ni de terceros.

Estados: `borrador`, `aprobada`, `revisar`, `descartada` y `repositorio`.

## Flujo de trabajo
1. Revisar y editar la tabla con cualquier programa de SQLite.
2. Marcar lo revisado por dos personas: `UPDATE preguntas SET estado='aprobada', revisores=2 WHERE id='S11CIE-B001';`
3. Descartar lo que no sirva: `UPDATE preguntas SET estado='descartada' WHERE id='...';`
4. Verificar: `python3 probar_banco.py`
5. Actualizar el demo: `python3 actualizar_demo.py`. Con `--solo-aprobadas` usa solo lo aprobado y las 75 del repositorio. Otra forma: `python3 exportar_json.py` y cargar el archivo desde el juego.
6. Ver la cobertura: `SELECT * FROM v_cobertura;`

## Piloto
Cada participante exporta sus datos desde Perfil > Datos del piloto. Luego: `python3 importar_datos_piloto.py datos-piloto-1.json datos-piloto-2.json`. Los umbrales del informe (10 intentos, 30 % de acierto, 40 s, niveles por acierto) son una propuesta que debe calibrarse con el piloto.

## Ojo
- `generar_banco.py` no reemplaza una base existente, porque se perderían los estados de revisión. Para regenerar desde cero: `python3 generar_banco.py --forzar` (guarda una copia `.bak`).
- Las preguntas escritas a mano dentro del HTML (Cuentos y 10 de Pro/TyT) no están en la base.

# Brief de Reto Saber

## Propósito

Diseñar una experiencia lúdica de práctica que ayude a estudiantes a estudiar para pruebas Saber mediante sesiones cortas, explicaciones y retroalimentación. El concepto contempla tres públicos/exámenes: Saber 11, Saber Pro y Saber TyT.

## Público y necesidad

- Saber 11: estudiantes de 9.º, 10.º y 11.º.
- Saber Pro: estudiantes de programas universitarios profesionales.
- Saber TyT: estudiantes de programas técnicos profesionales y tecnológicos.
- Necesidad propuesta: ofrecer práctica más atractiva y accesible, con contenido organizado por competencias y retroalimentación comprensible.

La definición de cuál público atender primero y si las pruebas se lanzarán juntas está **pendiente de validación** con el equipo y posibles usuarios.

## Propuesta de experiencia

El demo web actual explora retos de opción múltiple, repaso y progreso. Es una página estática con datos locales, no una plataforma operativa.

## Etapa actual

Planeación e ideación. Copilot organiza decisiones y tareas; Claude aporta ideas que la persona usuaria comparte entre herramientas; el equipo humano toma las decisiones finales. No existe sincronización directa entre ambas IA.

### Entregables de la fase

1. Repositorio privado con los materiales organizados.
2. Brief único con hechos, supuestos y preguntas pendientes.
3. Propuesta que contemple Saber 11, Saber Pro y TyT, con fases/prioridad por decidir.
4. Criterios y protocolo para probar los prototipos con usuarios.
5. Decisiones registradas antes de empezar desarrollo.

## Límites confirmados

- No desarrollar el producto durante la planeación. La preparación solicitada para desplegar el demo estático en Vercel es acotada; no autoriza desarrollar el producto, infraestructura de cuentas ni un piloto.
- Cuando el equipo autorice la fase de desarrollo, ocultar de la interfaz todos los botones, precios, enlaces y pantallas que promocionan planes pagos.
- No implementar pagos, cobros ni funciones premium hasta que la persona responsable lo autorice expresamente.
- No presentar los prototipos, sus puntajes ni sus pantallas de pago como un producto publicado o una oferta vigente.
- Escribir preguntas y explicaciones originales; no reproducir ni vender contenido oficial del ICFES.
- Usar datos ficticios en pruebas. Antes de un piloto con menores, definir minimización, tratamiento, autorización y eliminación de datos.

## Supuestos por validar

- Qué propuesta de aprendizaje es valiosa para estudiantes de cada examen.
- Si el MVP/piloto debe enfocarse en un examen o probar los tres en grupos separados.
- Qué módulos, formatos y cantidad de contenido son necesarios por público.
- Cómo medir aprendizaje, facilidad de uso, regreso al producto e intención de pago sin prometer resultados.
- Qué modelo de sostenibilidad tendría sentido tras la validación y revisión de costos.
- Qué permisos y salvaguardas se necesitan para cualquier beta con menores.

## Criterios de calidad

- Las preguntas son originales, correctas, explicadas y alineadas con las competencias vigentes de la prueba correspondiente.
- La experiencia distingue claramente contenido de práctica de resultados oficiales.
- El producto es usable en móvil, accesible y comprensible para el nivel de edad/estudio previsto.
- La recogida de datos se limita a lo necesario y protege especialmente a menores.
- Toda decisión del equipo se registra en `DECISIONES.md`; las ideas de Claude o Copilot no son decisiones hasta su aprobación.

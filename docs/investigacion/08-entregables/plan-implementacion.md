# Tarea 8 — Plan de implementación por fases

## Fase 0 — Línea de base (✅ CUMPLIDA)
- Demo single-file con 17 funcionalidades (Duelo, Contrarreloj, marcadores v20, etc.).
- Banco rotativo de 10.000 preguntas generadas por la app (v21), sin repetición por usuario/área.
- Adaptación React + Vercel + Supabase (login, iframe + puente postMessage, sync 30 s, PWA).
- CI: validación del banco, generador y módulo v21.

## Fase 1 — Contenido oficial (próximo paso)
1. Re-verificar en navegador las URLs del inventario (Tarea 1).
2. Transcribir cuadernillos oficiales al esquema de la Tarea 2 (con imágenes a almacenamiento de objetos, identificadas por recurso).
3. Extraer taxonomías exactas (evidencias, acciones mentales, cortes) de los PDFs y cerrar los «pendiente de verificación» de la Tarea 3.
4. Construir el pipeline de carga: JSON validado → `preguntas`/`opciones` en PostgreSQL con flujo borrador → revisión → publicado.

## Fase 2 — Web de producción
- Selección de examen (11.°/TyT/Pro) y de módulo en React (más allá del demo).
- Contenido teórico por módulo (resúmenes de marcos, glosario, estrategias).
- Simulacro completo con temporizador por sesión y resultados por competencia.
- Repaso inteligente con repetición espaciada completa.
- Panel admin básico (v1: tabla editable en Supabase Studio; v2: panel propio).

## Fase 3 — App móvil
- React Native reutilizando la API y el modelo de datos.
- Modo offline robusto: paquetes de módulos descargables + cola de sync.
- Notificaciones de racha/plan de estudio.

## Fase 4 — Escala y analítica
- Dashboard de eventos (fallas por competencia, preguntas más falladas, tiempo medio).
- Generadores v21 migrados a backend (menos memoria en el cliente).
- Social: ligas reales (transportar el modo Duelo con bots a retos entre usuarios).

## Criterios de salida por fase
- F1: ≥ 1 cuadernillo completo por examen, transcrito y validado con `validar_preguntas.py`.
- F2: web desplegada en Vercel con login, práctica y simulacro por competencias.
- F3: app móvil publicada (advisor: revisión de tiendas).
- F4: dashboard de analítica operativo.

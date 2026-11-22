# Tareas 4 y 5 — Funcionalidades y experiencia de usuario

Estado: **implementadas en el demo** (single-file HTML, versiones v18–v21).
Este documento mapea lo pedido en el prompt con lo que ya existe, y lista las
pantallas con su descripción (wireframes en texto).

## 1. Funciones del prompt vs. estado en el demo

| Función pedida | Estado en el demo | Dónde |
|---|---|---|
| 1. Selección de examen (11.°/TyT/Pro) | ✅ Estructura de áreas común; falta selector explícito en UI | Camino |
| 2. Selección de módulo | ✅ 8 áreas: LC, Mat, Sociales, CN, Inglés + CE, RC, CC | menú de lecciones |
| 3. Modo práctica (1 a 1, retroalimentación, repetir falladas) | ✅ Retroalimentación inmediata + repaso de falladas | flujo `les` |
| 4. Simulacro (por módulo, completo, temporizador, navegación, marcar, resultado) | ✅ 40 preguntas con temporizador + revisión; marcadores v20 | flujos `sim`/`simc` |
| 5. Diagnóstico inicial | ✅ Diagnóstico de 50 preguntas al onboarding | flujo `diag` |
| 6. Plan de estudio (racha, recordatorios, progreso) | ✅ Racha diaria, misiones de hoy, temporadas, XP/niveles | Camino/Perfil |
| 7. Estadísticas | ✅ Precisión por área, historial, dominio por área, ficha imprimible | Perfil |
| 8. Repaso inteligente | ✅ Cola de falladas con pesos (SRS simplificado) | flujo `rev` |
| 9. Contenido teórico | ⚠️ Parcial: explicaciones por pregunta; faltan resúmenes por marco | — |
| 10. Accesibilidad | ✅ Modo oscuro, tamaño de fuente, TTS (voz + velocidad), teclado | Ajustes |
| Extra: banco rotativo v21 | ✅ 10.000 preguntas sin repetición por usuario/área, generadas por la app | módulo v21 |
| Extra: gamificación | ✅ Duelo (bots), Contrarreloj, Tarjetas, Cuadernillo, insignias, ligas | pestañas |

## 2. Pantallas (wireframes en texto)

1. **Onboarding** — registro por nombre, correo y clave; check de aceptación; guardado local (`retosaber.v3`). Sin nube obligatoria.
2. **Inicio/Camino** — mapa de áreas con progreso, misiones de hoy, racha, accesos a lección, simulacro, repaso.
3. **Práctica (lección)** — pregunta a pregunta: enunciado (con soporte TTS), opciones A–D, feedback inmediato con explicación, barra de progreso.
4. **Simulacro** — temporizador, navegación, marcar para revisar (v20), entrega y resumen.
5. **Resultados** — aciertos, precisión, XP ganada, sugerencia de repaso, ficha imprimible.
6. **Estadísticas/Perfil** — dominio por área, historial, insignias, marcadores, ligas, Contrarreloj, Duelo.
7. **Ajustes** — modo oscuro, tamaño de letra, velocidad TTS, exportar/importar progreso (puente v19 con React/Supabase).
8. **Créditos/Fuentes** — aviso legal: «Esta aplicación es una herramienta de estudio independiente. No está afiliada, respaldada ni administrada por el ICFES…».

## 3. Pendiente para producción (React)

- **Login con Supabase** (ya existe en `src/components/Login.jsx`) y **selección de examen** explícita (Saber 11 / TyT / Pro).
- **Contenido teórico por módulo** (resúmenes basados en los marcos — ver `03-taxonomias/`).
- Sincronización del banco v21 con la base de preguntas normalizada (Tarea 2).

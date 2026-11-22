# Investigación ICFES — Reto Saber · Cinco Puntos

Carpeta de trabajo para la propuesta de investigación y construcción de la app,
basada **exclusivamente en material oficial, gratuito y verificable del ICFES**.

## Estado de las tareas

| # | Tarea | Estado |
|---|-------|--------|
| 1 | Inventario de recursos oficiales (CSV + JSON) | ✅ Base creada (`01-inventario-*`), ampliable |
| 2 | Estructura de preguntas (esquema JSON normalizado) | ✅ Base creada (`02-estructura-preguntas/`) |
| 3 | Taxonomías desde marcos de referencia | ✅ Base creada (`03-taxonomias/`, 8 módulos) |
| 4 | Funcionalidades de la aplicación | ✅ ya implementadas en el demo (v18–v21); falta mapa en docs |
| 5 | Experiencia de usuario | ⏳ Pendiente |
| 6 | Arquitectura técnica | ✅ parcial (docs/ARQUITECTURA.md); falta modelo de datos completo |
| 7 | Licencias y uso legal | ✅ parcial (aviso en el demo); falta documento completo |
| 8 | Entregables (plan por fases, riesgos, textos legales) | ⏳ Pendiente |

## Nota metodológica importante

Durante esta investigación, `icfes.gov.co` devolvió **403 a agentes automáticos**
(protección anti-bot del sitio). Las URLs del inventario se verificaron mediante
índices de búsqueda con fragmentos de los propios documentos oficiales.
Todo dato no confirmable está marcado **«pendiente de verificación»**.
Antes de extraer contenido (Tarea 2), verificar cada URL en un navegador normal.

## Hallazgo clave para la Tarea 7 (legal)

Los cuadernillos oficiales declaran en su página legal: **«© Icfes. Todos los
derechos de autor reservados»** y exigen que, al hacer uso parcial o total de los
contenidos, el usuario consigne los créditos institucionales del ICFES. No es
contenido Creative Commons ni de dominio público. Consecuencia práctica: la app
debe priorizar **contenido original generado por la aplicación** (como el banco
v21 de 10.000 preguntas, marcado «Generada por la aplicación como práctica · no
oficial»), usar lo oficial con atribución y nunca presentarse como app oficial.

## Regeneración del inventario

```bash
python3 generar_inventario.py
```

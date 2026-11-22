#!/usr/bin/env python3
"""Tarea 1 — Inventario de recursos oficiales ICFES (CSV + JSON).

Reglas del proyecto:
- Solo fuentes primarias de icfes.gov.co (o páginas oficiales del ICFES/MEN).
- Todo dato no confirmable se marca "pendiente de verificación".
- NOTA DE VERIFICACIÓN: durante la investigación, las páginas de icfes.gov.co
  devolvieron 403 a agentes automáticos (protección anti-bot). Las URLs fueron
  verificadas mediante índices de búsqueda, y los datos de título/año/número de
  preguntas provienen de los fragmentos indexados de los propios documentos
  oficiales. Antes de iniciar la extracción de contenido, re-verificar cada URL
  desde un navegador normal.
"""
import csv
import json
import os

NOTA = ("URL verificada mediante índice de búsqueda; acceso directo bloqueado por "
        "protección anti-bot del sitio ICFES. Re-verificar en navegador antes de extraer contenido.")

# campos: titulo, examen, modulo, tipo, url, anno, num_preguntas, resumen, uso_app
R = [
    # ---- Saber 11: cuadernillos ----
    ("Prueba Lectura Crítica, Cuadernillo de preguntas Saber 11.º", "SABER_11", "Lectura Crítica",
     "cuadernillo", "https://www.icfes.gov.co/wp-content/uploads/2026/03/16-feb-cuadernillo-de-preguntas-lectura-critica-saber-11-2026.pdf",
     "2026", "49 preguntas",
     "Preguntas de selección múltiple con única respuesta; contextos continuos y discontinuos; incluye respuestas correctas y afirmaciones al final.",
     "Fuente primaria para extraer preguntas reales y estructura de contexto+enunciado."),
    ("Prueba Matemáticas, Cuadernillo de preguntas Saber 11.º", "SABER_11", "Matemáticas",
     "cuadernillo", "https://www.icfes.gov.co/wp-content/uploads/2026/04/09-Marzo_Cuadernillo-de-Preguntas-Matematicas-Saber-11-2026.pdf",
     "2026", "50 preguntas",
     "Preguntas utilizadas en aplicaciones anteriores; al final incluye respuestas correctas y afirmaciones por pregunta.",
     "Fuente primaria de preguntas reales de Matemáticas."),
    ("Prueba Ciencias Naturales, Cuadernillo de preguntas Saber 11.º", "SABER_11", "Ciencias Naturales",
     "cuadernillo", "https://www.icfes.gov.co/wp-content/uploads/2026/03/24-feb-cuadernillo-preguntas-ciencias-naturales-saber-11-2026.pdf",
     "2026", "pendiente de verificación",
     "Cuadernillo oficial de la prueba de Ciencias Naturales con preguntas de aplicaciones anteriores.",
     "Fuente primaria de preguntas reales de Ciencias Naturales."),
    ("Prueba Inglés, Cuadernillo de preguntas Saber 11.º", "SABER_11", "Inglés",
     "cuadernillo", "https://www.icfes.gov.co/wp-content/uploads/2025/12/16-octubre-cuadernillo-ingles-saber-11-2024.pdf",
     "2024", "50 preguntas (25 Examen 1 + 25 Examen 2)",
     "Incluye respuestas correctas y nivel de dificultad por pregunta del Examen 1 y Examen 2; consigna respuestas A, B o C en algunas partes.",
     "Fuente primaria de preguntas reales de Inglés (modelo MC de 3 opciones en algunas partes)."),
    ("Cuadernillo de preguntas Sociales y Ciudadanas Saber 11", "SABER_11", "Sociales y Ciudadanas",
     "cuadernillo", "https://www.icfes.gov.co/documents/20143/1713188/Cuadernillo+de+preguntas+Sociales+y+Ciudadanas+Saber+11-2021.pdf",
     "2021", "pendiente de verificación",
     "Cuadernillo oficial de la prueba de Sociales y Ciudadanas (versión 2021, alojada en el portal de documentos del ICFES).",
     "Fuente primaria de preguntas reales de Sociales y Ciudadanas."),
    # ---- Saber TyT: cuadernillos ----
    ("Módulo Competencias Ciudadanas, Cuadernillo de preguntas Saber TyT", "SABER_TYT", "Competencias Ciudadanas",
     "cuadernillo", "https://www.icfes.gov.co/wp-content/uploads/2026/03/24-feb-cuadernillo-competencias-ciudadanas-saber-tyt-2026.pdf",
     "2026", "pendiente de verificación",
     "Cuadernillo oficial actualizado del módulo de Competencias Ciudadanas para Saber TyT.",
     "Fuente primaria de preguntas reales del módulo (también útil para Saber Pro, módulo genérico homólogo)."),
    ("Módulo de Razonamiento Cuantitativo, Cuadernillo de preguntas Saber TyT", "SABER_TYT", "Razonamiento Cuantitativo",
     "cuadernillo", "https://www.icfes.gov.co/wp-content/uploads/2025/07/cuadernillo_de_Preguntas_Razonamiento_Cuantitativo_Saber_TyT.pdf",
     "pendiente de verificación", "pendiente de verificación",
     "Cuadernillo oficial del módulo de Razonamiento Cuantitativo con problemas en contexto (ventas por redes, etc.).",
     "Fuente primaria de preguntas reales de Razonamiento Cuantitativo."),
    ("Módulo Inglés, Cuadernillo de preguntas Saber TyT", "SABER_TYT", "Inglés",
     "cuadernillo", "https://www.icfes.gov.co/wp-content/uploads/2025/12/27-septiembre-cuadernillo-ingles-saber-tyt-2024.pdf",
     "2024", "pendiente de verificación",
     "Cuadernillo oficial del módulo de Inglés para Saber TyT.",
     "Fuente primaria de preguntas reales de Inglés TyT."),
    # ---- Saber Pro: cuadernillos ----
    ("Módulo de Lectura Crítica, Cuadernillo de preguntas Saber Pro", "SABER_PRO", "Lectura Crítica",
     "cuadernillo", "https://www.icfes.gov.co/wp-content/uploads/2024/12/01_02_Cuadernillo_de_preguntas_Lectura_Critica-_Saber-Pro.pdf",
     "pendiente de verificación", "pendiente de verificación",
     "Cuadernillo oficial del módulo genérico de Lectura Crítica para Saber Pro.",
     "Fuente primaria de preguntas reales de Lectura Crítica Pro."),
    ("Módulo Inglés, Cuadernillo de preguntas Saber Pro", "SABER_PRO", "Inglés",
     "cuadernillo", "https://www.icfes.gov.co/wp-content/uploads/2025/12/27-septiembre-ingles-saber-pro-2024.pdf",
     "2024", "pendiente de verificación",
     "Cuadernillo oficial del módulo de Inglés para Saber Pro.",
     "Fuente primaria de preguntas reales de Inglés Pro."),
    # ---- Marcos de referencia ----
    ("Marco de referencia de Lectura Crítica — Saber 11.º, Saber TyT y Saber Pro", "SABER_11",
     "Lectura Crítica", "marco de referencia",
     "https://www.icfes.gov.co/wp-content/uploads/2025/03/MR-Lectura-Cri%CC%81tica-Saber-11.%C2%B0-Saber-TyT-y-Saber-Pro.pdf",
     "2025", "No aplica",
     "Marco único para los tres exámenes: competencias, evidencias, acciones mentales y tipos de texto.",
     "Base de la taxonomía de Lectura Crítica (Tarea 3)."),
    ("Marcos de referencia de Inglés — Saber 11, TyT y Pro", "SABER_13",
     "Inglés", "marco de referencia",
     "https://www.icfes.gov.co/wp-content/uploads/2025/03/Marcos-de-referencia-ingle%CC%81s-saber-11-tyt-pro-1.pdf",
     "2025", "No aplica",
     "Marcos del módulo de Inglés para los tres exámenes, alineados con niveles del MCER.",
     "Base de la taxonomía de Inglés y de los niveles de desempeño."),
    ("Marco de referencia del Módulo Razonamiento Cuantitativo — Saber TyT", "SABER_TYT",
     "Razonamiento Cuantitativo", "marco de referencia",
     "https://www.icfes.gov.co/wp-content/uploads/2024/11/Marco-de-referencia-Modulo-Razonamiento-Cuantitativo-Saber-TyT.pdf",
     "2024", "No aplica",
     "Marco del módulo de Razonamiento Cuantitativo (común a TyT y Pro según guías de orientación).",
     "Base de la taxonomía de Razonamiento Cuantitativo."),
    ("Marcos de referencia (colección de documentos técnicos y metodológicos)", "SABER_14",
     "Todos", "marco de referencia",
     "https://www.icfes.gov.co/publicaciones-icfes/documentos-tecnicos-y-metodologicos/marcos-de-referencia/",
     "pendiente de verificación", "No aplica",
     "Página de la colección de marcos de referencia del ICFES (índice para localizar los PDF por módulo).",
     "Punto de partida para completar marcos faltantes (Sociales, Ciencias, Matemáticas, CE, CC)."),
    # ---- Guías de orientación ----
    ("Guía de orientación del Examen Saber 11.º 2026-2", "SABER_11", "Todos", "guía",
     "https://www.icfes.gov.co/wp-content/uploads/2026/03/17-marzo-guia-de-orientacion-saber-11-2026-2.pdf",
     "2026", "No aplica",
     "Estructura del examen, sesiones, distribución de preguntas por afirmación, hoja de respuestas, resultados.",
     "Definir estructura de simulacros y balance de la app."),
    ("Guía de orientación del Examen Saber 11.º 2026-1 (Calendario B)", "SABER_11", "Todos", "guía",
     "https://www.icfes.gov.co/wp-content/uploads/2025/12/02-diciembre-guia-de-orientacion-saber-11-2026.pdf",
     "2025", "No aplica",
     "Guía 2026-1 calendario B: seis pruebas + cuestionario sociodemográfico; tablas de estructura de cuadernillos.",
     "Complemento de la anterior; versión alternativa con tablas de distribución."),
    ("Guía de orientación del Examen Saber TyT — Aplicación 2025-1 (Módulos Genéricos)", "SABER_TYT", "Todos", "guía",
     "https://www.icfes.gov.co/wp-content/uploads/2025/01/02-Diciembre_Guia-de-Orientacion-Modulos-Genericos-Saber-TyT-2025-1.pdf",
     "2024", "No aplica",
     "Estructura de los módulos genéricos de TyT; hace énfasis en textos discontinuos e informativos en Lectura Crítica.",
     "Definir simulacros TyT y diferencias frente a Saber 11."),
    ("Guía de orientación del Examen Saber Pro — Aplicación 2024-2 (Módulos Genéricos)", "SABER_PRO", "Todos", "guía",
     "https://www.icfes.gov.co/wp-content/uploads/2024/11/10-Mayo_GDO-Mo%CC%81dulos-Gen%C3%A9ricos-Saber-Pro-2024-2-1.pdf",
     "2024", "No aplica",
     "Estructura de los módulos genéricos de Saber Pro, distribución por competencias y partes del módulo.",
     "Definir simulacros Pro y módulos específicos."),
    ("Guía de orientación de Módulos Genéricos Saber Pro 2020", "SABER_PRO", "Todos", "guía",
     "https://www.icfes.gov.co/wp-content/uploads/2024/11/Guia-de-orientacion-de-Modulos-genericos-Saber-Pro-2020.pdf",
     "2020", "No aplica",
     "Guía clásica de módulos genéricos Saber Pro citada por el usuario.",
     "Referencia histórica; verificar vigencia frente a la guía 2024-2."),
    # ---- Páginas oficiales / hub ----
    ("ABC del Saber", "SABER_15", "Todos", "página oficial",
     "https://www.icfes.gov.co/abc-del-saber/", "pendiente de verificación", "No aplica",
     "Portal de divulgación del ICFES sobre las pruebas Saber (11.º, TyT, Pro).",
     "Punto de partida oficial; no contiene preguntas por sí misma."),
    ("Familiarízate con el Saber", "SABER_15", "Todos", "página oficial",
     "https://www.icfes.gov.co/abc-del-saber/familiarizate-con-el-saber/", "pendiente de verificación", "No aplica",
     "Página oficial para familiarizarse con las preguntas de las pruebas Saber.",
     "Localizar simuladores y demos interactivos oficiales."),
    ("Caja de herramientas Saber 11", "SABER_11", "Todos", "caja de herramientas",
     "https://www.icfes.gov.co/caja-de-herramientas-saber-11/", "pendiente de verificación", "No aplica",
     "Ejemplos de preguntas explicadas para las cinco pruebas; cómo interpretar resultados.",
     "Fuente de ejemplos explicados oficiales (prioridad 1 del proyecto)."),
    ("Caja de herramientas Saber Pro", "SABER_PRO", "Todos", "caja de herramientas",
     "https://www.icfes.gov.co/caja-de-herramientas-saber-pro/", "pendiente de verificación", "No aplica",
     "Materiales para familiarizarse con Saber Pro y sus tipos de pregunta.",
     "Fuente de ejemplos explicados oficiales Saber Pro."),
    ("Caja de herramientas Saber TyT", "SABER_TYT", "Todos", "caja de herramientas",
     "https://www.icfes.gov.co/evaluaciones-icfes/examen-saber-tyt/caja-de-herramientas-saber-tyt/",
     "pendiente de verificación", "No aplica",
     "Materiales para familiarizarse con Saber TyT y sus tipos de pregunta.",
     "Fuente de ejemplos explicados oficiales Saber TyT."),
    ("Familiarízate con el examen Saber Pro (página de la evaluación)", "SABER_PRO", "Todos", "página oficial",
     "https://www.icfes.gov.co/evaluaciones-icfes/acerca-del-examen-saber-pro/familiarizate-con-el-examen-saber-pro/",
     "pendiente de verificación", "No aplica",
     "Describe la caja de herramientas virtual y gratuita de Saber Pro con cuadernillos y ejemplos explicados.",
     "Entrada adicional confirmada por índice de búsqueda."),
    # ---- Infografías ----
    ("Infografía Generalidades Saber TyT", "SABER_TYT", "Todos", "infografía",
     "https://www.icfes.gov.co/wp-content/uploads/2025/06/Infografia-Generalidades-Saber-TyT.pdf",
     "2025", "No aplica",
     "Infografía oficial: dónde está la caja de herramientas de TyT, guías de orientación e infografías.",
     "Contenido teórico tipo resumen para la app."),
]

EXAMEN_NOMBRE = {"SABER_11": "Saber 11", "SABER_TYT": "Saber TyT", "SABER_PRO": "Saber Pro",
                 "SABER_13": "Saber 11, TyT y Pro", "SABER_14": "Varios", "SABER_15": "Varios"}

def fila(indice, r):
    t, ex, mod, tipo, url, anno, nq, resumen, uso = r
    return {
        "id": f"inv-{indice:03d}",
        "titulo": t,
        "examen": EXAMEN_NOMBRE[ex],
        "modulo": mod,
        "tipo_recurso": tipo,
        "url": url,
        "anno_publicacion": anno,
        "numero_preguntas": nq,
        "licencia": ("© ICFES — todos los derechos de autor reservados. Los cuadernillos oficiales lo declaran en su "
                     "página legal y exigen consignar los créditos institucionales al reutilizar contenido; no es "
                     "contenido Creative Commons ni de dominio público. Ver Tarea 7 (licencias y aviso legal).") if tipo == "cuadernillo" else "Revisar aviso legal ICFES",
        "resumen": resumen,
        "uso_aplicacion": uso,
        "verificacion": NOTA,
    }

def lic_corta(r):
    return ("© ICFES - todos los derechos reservados; requiere atribución"
            if r[3] in ("cuadernillo", "marco de referencia", "guía", "infografía")
            else "Revisar aviso legal ICFES")

DIR = os.path.dirname(os.path.abspath(__file__))
regs = [fila(i + 1, r) for i, r in enumerate(R)]

with open(os.path.join(DIR, "01-inventario-recursos-oficiales.json"), "w", encoding="utf-8") as f:
    json.dump({
        "proyecto": "Reto Saber · Cinco Puntos",
        "tarea": "Tarea 1 — Inventario de recursos oficiales ICFES",
        "nota_metodologica": ("Durante la sesión de investigación, icfes.gov.co devolvió 403 a agentes "
                              "automáticos (protección anti-bot). Las URLs se verificaron mediante índices de "
                              "búsqueda; los campos título/año/número de preguntas provienen de fragmentos "
                              "indexados de los documentos oficiales. Campos no confirmables: 'pendiente de "
                              "verificación'. Re-verificar en navegador antes de extraer contenido."),
        "aviso": ("Esta aplicación es una herramienta de estudio independiente. No está afiliada, respaldada "
                  "ni administrada por el ICFES. El contenido oficial proviene de publicaciones públicas del ICFES."),
        "total_recursos": len(regs),
        "recursos": regs,
    }, f, ensure_ascii=False, indent=2)

campos = list(regs[0].keys())
with open(os.path.join(DIR, "01-inventario-recursos-oficiales.csv"), "w", encoding="utf-8", newline="") as f:
    w = csv.DictWriter(f, fieldnames=campos)
    w.writeheader()
    for reg in regs:
        reg_csv = dict(reg)
        reg_csv["licencia"] = lic_corta(R[int(reg["id"][-3:]) - 1])
        w.writerow(reg_csv)

print(f"OK: {len(regs)} recursos escritos en CSV y JSON")
for reg in regs:
    print(f"  {reg['id']} | {reg['examen']:<18} | {reg['tipo_recurso']:<20} | {reg['titulo'][:60]}")

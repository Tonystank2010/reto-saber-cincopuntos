#!/usr/bin/env python3
"""Tarea 3 — Taxonomía de competencias y niveles de desempeño (JSON por examen/módulo).

Basada en los marcos de referencia del ICFES. IMPORTANTE: como icfes.gov.co
bloqueó el acceso directo durante esta sesión (403 anti-bot), la estructura
sigue el conocimiento público consolidado de los marcos, pero los textos
exactos (evidencias, acciones mentales, cortes de niveles) quedan marcados
«pendiente de verificación» contra cada PDF oficial antes de usarlos en producción.
"""
import json
import os

PV = "pendiente de verificación"
URL_MARCOS = "https://www.icfes.gov.co/publicaciones-icfes/documentos-tecnicos-y-metodologicos/marcos-de-referencia/"
FUENTE_MR = f"ICFES — marcos de referencia ({URL_MARCOS})"


def tax(examen, modulo, competencias, evidencias, accion, temas, niveles, tipos,
        url, diferencia=None):
    return {
        "examen": examen,
        "modulo": modulo,
        "verificacion": ("Competencias y procesos: estructura consolidada del marco oficial; "
                         f"textos exactos: {PV} contra el PDF (URL registrada en el inventario)."),
        "competencias": competencias,
        "evidencias": evidencias,
        "acciones_mentales": accion,
        "temas": temas,
        "niveles_desempeno": niveles,
        "tipos_pregunta": tipos,
        "diferencias_entre_examenes": diferencia or [],
        "fuente": FUENTE_MR,
        "url_fuente": url,
    }


T = [
    tax("SABER_11", "Lectura Critica",
        ["Comunicación (comprensión de textos)",
         "Interpretación y análisis de textos",
         "Pensamiento crítico"],
        [f"Construir significados a nivel global y local; reconocer la intención del autor; "
         f"evaluar argumentos y las formas como se construyen (textos exactos: {PV})"],
        [f"Inferir, sintetizar, jerarquizar, establecer relaciones intra e intertextuales, "
         f"evaluar usos del lenguaje y estrategias persuasivas ({PV})"],
        [f"Textos continuos y discontinuos: informativos, argumentativos, narrativos, "
         f"expositivos, mixtos y gráficos ({PV})"],
        [{"nombre": "Insuficiente / Mínimo / Satisfactorio / Avanzado",
          "corte": f"puntajes de corte oficiales: {PV}"}],
        ["opcion_multiple_unica"],
        "https://www.icfes.gov.co/wp-content/uploads/2025/03/MR-Lectura-Cri%CC%81tica-Saber-11.%C2%B0-Saber-TyT-y-Saber-Pro.pdf",
        ["Saber TyT hace énfasis en textos discontinuos e informativos (ver guía TyT 2025-1).",
         "Saber Pro mantiene el mismo marco genérico con textos más complejos."]
    ),
    tax("SABER_11", "Matematicas",
        ["Interpretación y representación (IR)",
         "Formulación y ejecución (FE)",
         "Argumentación (AR)"],
        [f"Comprender y transformar información en distintas representaciones; resolver problemas "
         f"en contextos; validar procedimientos y afirmaciones (textos exactos: {PV})"],
        [f"Establecer relaciones espacio-geométricas, usar proporcionalidad, razonar "
         f"probabilísticamente, modelar procesos de cambio ({PV})"],
        [f"Pensamiento aleatorio/estadístico, numérico-variacional, métrico-espacial, "
         f"geométrico, conectados a escenarios cotidianos ({PV})"],
        [{"nombre": "Insuficiente / Mínimo / Satisfactorio / Avanzado",
          "corte": f"puntajes de corte: {PV}"}],
        ["opcion_multiple_unica"],
        URL_MARCOS
    ),
    tax("SABER_11", "Ciencias Naturales",
        ["Uso del conocimiento científico",
         "Uso del entendimiento de las ciencias",
         "Indagación"],
        [f"Aplicar conceptos a situaciones cotidianas; distinguir evidencia y explicación; "
         f"formular preguntas y diseñar indagaciones (textos exactos: {PV})"],
        [f"Identificar regularidades, contrastar hipótesis, interpretar tablas y gráficos "
         f"de experimentos ({PV})"],
        [f"Biología, Física y Química en contextos de vida cotidiana y ambiente ({PV})"],
        [{"nombre": "Insuficiente / Mínimo / Satisfactorio / Avanzado",
          "corte": f"puntajes de corte: {PV}"}],
        ["opcion_multiple_unica"],
        URL_MARCOS
    ),
    tax("SABER_11", "Sociales y Ciudadanas",
        ["Lectura de documentos y análisis en contextos histórico-sociales",
         "Pensamiento social y espacial",
         "Comprensión de la pluralidad y del conflicto",
         "Ejercicio de la ciudadanía"],
        [f"Interpretar fuentes primarias y secundarias; leer datos y mapas; analizar conflictos "
         f"y decisiones; evaluar acciones ciudadanas (textos exactos: {PV})"],
        [f"Contextualizar, contrastar perspectivas, juzgar implicaciones éticas y políticas ({PV})"],
        [f"Historia de Colombia, geografía, democracia y derecho, cultura y diversidad ({PV})"],
        [{"nombre": "Insuficiente / Mínimo / Satisfactorio / Avanzado",
          "corte": f"puntajes de corte: {PV}"}],
        ["opcion_multiple_unica"],
        URL_MARCOS
    ),
    tax("SABER_11", "Ingles",
        [f"Niveles MCER evaluados: A2, B1 y B1+ (distribución exacta: {PV})"],
        [f"Leer textos descriptivos y narrativos cortos; completar conversaciones; responder "
         f"textos informativos y argumentativos simples (textos exactos: {PV})"],
        [f"Comprensión lectora con vocabulario funcional; gramática y léxico evaluados "
         f"integrados en lectura ({PV})"],
        [f"Partes 1 a 7 del examen: conversaciones, textos completados, lectura ({PV})"],
        [{"nombre": "A1 / A2 / B1 / B1+", "corte": f"tabla oficial MCER: {PV}"}],
        ["ingles_parte_1", "ingles_parte_2", "ingles_parte_3", "ingles_parte_4",
         "ingles_parte_5", "ingles_parte_6", "ingles_parte_7"],
        "https://www.icfes.gov.co/wp-content/uploads/2025/03/Marcos-de-referencia-ingle%CC%81s-saber-11-tyt-pro-1.pdf"
    ),
    tax("SABER_TYT", "Razonamiento Cuantitativo",
        ["Interpretación y representación de información",
         "Comprensión y ejecución de procedimientos",
         "Formulación y resolución de problemas",
         "Razonamiento matemático"],
        [f"Extraer y transformar datos; aplicar procedimientos en contexto; plantear y resolver "
         f"problemas; justificar razonamientos (textos exactos: {PV})"],
        [f"Cuantificar, modelar, estimar, vincular representaciones ({PV})"],
        [f"Números y medida; geometría y espacial; variacional y algebraico; "
         f"aleatorio/probabilístico — en situaciones cotidianas y laborales ({PV})"],
        [{"nombre": "Niveles de desempeño TyT", "corte": f"cortes oficiales: {PV}"}],
        ["opcion_multiple_unica"],
        "https://www.icfes.gov.co/wp-content/uploads/2024/11/Marco-de-referencia-Modulo-Razonamiento-Cuantitativo-Saber-TyT.pdf",
        ["El mismo marco sirve para el módulo genérico de Saber Pro (común a ambos exámenes "
         "según las guías de orientación 2024-2)."]
    ),
    tax("SABER_TYT", "Comunicacion Escrita",
        ["Composición de textos escritos",
         "Uso de la lengua en contextos dados",
         f"Coherencia y cohesión textuales ({PV})"],
        [f"Planear, redactar y revisar textos; elegir la versión más clara y cohesiva de un "
         f"párrafo; corregir errores (textos exactos: {PV})"],
        [f"Organizar ideas, conectar enunciados, ajustar registro y propósito ({PV})"],
        [f"Tipos de textos: informativos, argumentativos, literarios; textos mixtos con "
         f"imágenes ({PV})"],
        [{"nombre": "Niveles de desempeño TyT", "corte": f"cortes oficiales: {PV}"}],
        ["opcion_multiple_unica", "respuesta_abierta"],
        URL_MARCOS
    ),
    tax("SABER_TYT", "Competencias Ciudadanas",
        ["Pensamiento social",
         "Ciudadanía y diversidad",
         "Diálogo y participación",
         "Uso de la ley y de la información",
         f"Resolución pacífica de conflictos ({PV})"],
        [f"Analizar situaciones de conflicto y alternativas no violentas; evaluar decisiones "
         f"usando la ley; participar en lo público (textos exactos: {PV})"],
        [f"Adoptar perspectivas, contrastar información, deliberar sobre dilemas cotidianos ({PV})"],
        [f"Democracia, derechos humanos, acuerdo y conflicto, diversidad y participación ({PV})"],
        [{"nombre": "Niveles de desempeño TyT", "corte": f"cortes oficiales: {PV}"}],
        ["opcion_multiple_unica"],
        "https://www.icfes.gov.co/wp-content/uploads/2026/03/24-feb-cuadernillo-competencias-ciudadanas-saber-tyt-2026.pdf"
    ),
]

DIR = os.path.dirname(os.path.abspath(__file__))
SALIDA = os.path.join(DIR, "taxonomias")
os.makedirs(SALIDA, exist_ok=True)

SLUG = {"Lectura Critica": "lectura-critica", "Matematicas": "matematicas",
        "Sociales y Ciudadanas": "sociales-y-ciudadanas", "Ciencias Naturales": "ciencias-naturales",
        "Ingles": "ingles", "Razonamiento Cuantitativo": "razonamiento-cuantitativo",
        "Comunicacion Escrita": "comunicacion-escrita", "Competencias Ciudadanas": "competencias-ciudadanas"}
EX = {"SABER_11": "saber11", "SABER_TYT": "tyt", "SABER_PRO": "pro"}

for t in T:
    ruta = os.path.join(SALIDA, f"{EX[t['examen']]}-{SLUG[t['modulo']]}.json")
    with open(ruta, "w", encoding="utf-8") as f:
        json.dump(t, f, ensure_ascii=False, indent=2)
    print("OK", os.path.basename(ruta))

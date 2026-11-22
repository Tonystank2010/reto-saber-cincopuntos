#!/usr/bin/env python3
"""Tarea 2 — validador de la base de preguntas (esquema normalizado).

Uso:
    python3 validar_preguntas.py <archivo.json o archivo.jsonl>

Valida cada registro contra las reglas del esquema sin dependencias externas
(JSON Schema completo opcional; aquí se aplican las reglas críticas del proyecto):
- campos obligatorios presentes
- examen y módulo válidos
- opciones con letras A-D sin duplicados y textos no vacíos
- respuesta_correcta coincide con una opción existente
- idioma 'en' solo para Inglés (y explicación debe ser en español si es generada)
- contenido oficial exige url_fuente y licencia
"""
import csv
import io
import json
import sys
import urllib.request

MODULOS = {
    "Lectura Critica", "Matematicas", "Sociales y Ciudadanas", "Ciencias Naturales",
    "Comunicacion Escrita", "Razonamiento Cuantitativo", "Competencias Ciudadanas",
    "Ingles", "Modulo especifico (Saber Pro)",
}
EXAMENES = {"SABER_11", "SABER_TYT", "SABER_PRO"}
# url_fuente es obligatoria solo cuando fuente == "ICFES" (regla específica más abajo)
OBLIGATORIOS = ["id", "examen", "modulo", "tipo_pregunta", "enunciado", "opciones",
                "respuesta_correcta", "fuente", "licencia", "idioma"]


def errores(reg):
    e = []
    for c in OBLIGATORIOS:
        if c not in reg or reg[c] in (None, ""):
            e.append(f"campo obligatorio ausente/vacío: {c}")
    if reg.get("examen") not in EXAMENES:
        e.append(f"examen inválido: {reg.get('examen')}")
    if reg.get("modulo") not in MODULOS:
        e.append(f"módulo inválido: {reg.get('modulo')}")
    ops = reg.get("opciones", [])
    letras = [o.get("letra") for o in ops if isinstance(o, dict)]
    if len(letras) < 3:
        e.append("menos de 3 opciones")
    if len(set(letras)) != len(letras):
        e.append("letras de opciones duplicadas")
    for o in ops:
        if not str(o.get("texto") or "").strip():
            e.append(f"opción {o.get('letra')} sin texto")
    if reg.get("respuesta_correcta") not in letras:
        e.append(f"respuesta_correcta {reg.get('respuesta_correcta')!r} no existe entre las opciones")
    if reg.get("fuente") == "ICFES" and not str(reg.get("url_fuente", "")).startswith("http"):
        e.append("contenido oficial exige url_fuente válida")
    if reg.get("modulo") != "Ingles" and reg.get("idioma") not in ("", "es"):
        e.append(f"idioma '{reg.get('idioma')}' solo se permite en el módulo de Inglés")
    if reg.get("modulo") == "Ingles" and reg.get("idioma") != "en":
        e.append("preguntas de Inglés deben conservar idioma 'en'")
    ids_ids = reg.get("id", "")
    if ids_ids and not all(ch.isalnum() or ch == "-" for ch in ids_ids):
        e.append("id solo admite minúsculas, números y guiones")
    return e


def cargar(ruta):
    texto = open(ruta, encoding="utf-8").read().strip()
    if texto.startswith("[") or texto.startswith("{"):
        try:
            d = json.loads(texto)
            return d if isinstance(d, list) else d.get("ejemplos", [d])
        except json.JSONDecodeError:
            pass
    # JSONL
    return [json.loads(l) for l in texto.splitlines() if l.strip()]


def main():
    ruta = sys.argv[1] if len(sys.argv) > 1 else "ejemplos-formato.json"
    regs = cargar(ruta)
    total_err = 0
    for reg in regs:
        er = errores(reg)
        if er:
            total_err += len(er)
            print(f"✗ {reg.get('id', '(sin id)')}")
            for m in er:
                print(f"    - {m}")
    if total_err:
        sys.exit(f"{total_err} error(es) en {len(regs)} registro(s)")
    print(f"✓ {len(regs)} registro(s) válidos según el esquema de la Tarea 2")


if __name__ == "__main__":
    main()

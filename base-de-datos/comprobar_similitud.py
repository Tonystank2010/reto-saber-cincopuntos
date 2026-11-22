#!/usr/bin/env python3
"""Detecta coincidencias textuales entre las preguntas del banco y PDF de referencia (por ejemplo, cuadernillos oficiales).

Uso:   python3 comprobar_similitud.py carpeta_con_pdfs [--db banco-preguntas.db] [--n 8] [--marcar]

- Extrae el texto de los PDF (pdftotext, o pypdf si no está) y compara secuencias de N palabras seguidas (por defecto 8).
- Escribe similitud.csv con id, coincidencias y archivo PDF. NO copia texto de los PDF.
- Con --marcar, las preguntas con coincidencias quedan con estado 'revisar'.
Solo detecta coincidencias casi literales: una paráfrasis cercana no aparecería. Las frases comunes pueden dar falsos positivos;
una persona debe revisar cada caso. Los PDF son material con derechos reservados: se usan solo para comparar, no se copian.
"""
import sys,os,re,glob,json,sqlite3,subprocess,unicodedata,csv
args=sys.argv[1:];marcar='--marcar' in args;N=8
if '--n' in args:i=args.index('--n');N=int(args[i+1]);del args[i:i+2]
aqui=os.path.dirname(os.path.abspath(__file__));db=os.path.join(aqui,'banco-preguntas.db')
if '--db' in args:i=args.index('--db');db=args[i+1];del args[i:i+2]
carpeta=[a for a in args if not a.startswith('--')]
if not carpeta:sys.exit('Indica la carpeta con los PDF.')
pdfs=sorted(glob.glob(os.path.join(carpeta[0],'**','*.pdf'),recursive=True))
if not pdfs:sys.exit('No encontré PDF en esa carpeta.')
def texto(p):
    try:return subprocess.run(['pdftotext','-layout',p,'-'],capture_output=True,text=True,check=True).stdout
    except Exception:
        from pypdf import PdfReader
        return '\n'.join((pg.extract_text() or '') for pg in PdfReader(p).pages)
def palabras(t):
    t=unicodedata.normalize('NFD',t.lower());t=''.join(ch for ch in t if unicodedata.category(ch)!='Mn')
    return re.findall(r'[a-z0-9]+',t)
def grams(w):return {hash(' '.join(w[i:i+N])) for i in range(len(w)-N+1)}
ref={}
for p in pdfs:
    g=grams(palabras(texto(p)));ref[os.path.basename(p)]=g;print(f'{os.path.basename(p)}: {len(g)} secuencias')
c=sqlite3.connect(db);hall=[]
for pid,en,ops,estado in c.execute("SELECT id,enunciado,opciones_json,estado FROM preguntas WHERE estado!='descartada'").fetchall():
    t=en+' '+' '.join(o['texto'] for o in json.loads(ops));w=palabras(t)
    if len(w)<N:continue
    g=grams(w)
    for nom,rg in ref.items():
        k=len(g&rg)
        if k:hall.append((pid,nom,k,round(k/len(g)*100)))
print(f'\nPreguntas revisadas: comparadas contra {len(pdfs)} PDF con secuencias de {N} palabras.')
print(f'Preguntas con alguna coincidencia: {len({h[0] for h in hall})}')
if hall:
    dest=os.path.join(aqui,'similitud.csv')
    with open(dest,'w',encoding='utf-8-sig',newline='') as fh:
        w=csv.writer(fh,delimiter=';');w.writerow(['id','pdf','secuencias_coincidentes','porcentaje_de_la_pregunta']);w.writerows(sorted(hall,key=lambda x:-x[2]))
    print('Archivo:',dest)
    for r in sorted(hall,key=lambda x:-x[2])[:10]:print(f'  {r[0]} ~ {r[1]}: {r[2]} secuencia(s), {r[3]} % de la pregunta')
    if marcar:
        for pid in {h[0] for h in hall}:c.execute("UPDATE preguntas SET estado='revisar' WHERE id=? AND estado NOT IN ('descartada')",(pid,))
        c.commit();print("Marcadas con estado 'revisar'.")

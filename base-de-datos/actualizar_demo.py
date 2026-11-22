#!/usr/bin/env python3
"""Actualiza las preguntas del demo a partir de la base de datos.

Uso:   python3 actualizar_demo.py [Reto-Saber-Demo.html] [banco-preguntas.db] [--solo-aprobadas]

- Lee la tabla `preguntas` de la base y reescribe las preguntas dentro del HTML del demo.
- Guarda una copia de seguridad del HTML (.bak) antes de cambiarlo.
- No incluye las preguntas con estado 'descartada'.
- Con --solo-aprobadas incluye solo las que tienen estado 'aprobada' (revisadas) y las del repositorio.
- Si alguna pregunta es inválida (opciones repetidas, respuesta inexistente, sin explicación), no escribe nada y lista los problemas.
"""
import sys,re,json,sqlite3,shutil,os,collections
args=[a for a in sys.argv[1:] if not a.startswith('--')];solo='--solo-aprobadas' in sys.argv
aqui=os.path.dirname(os.path.abspath(__file__))
cands=[os.path.join(aqui,'..','demo-html','Reto-Saber-Demo.html'),os.path.join(aqui,'..','Reto-Saber-Demo.html')]
html=args[0] if args else next((c for c in cands if os.path.exists(c)),cands[0])
db=args[1] if len(args)>1 else os.path.join(aqui,'banco-preguntas.db')
AREAS={'Saber 11':['Matemáticas','Lectura Crítica','Ciencias Naturales','Sociales y Ciudadanas','Inglés'],'Saber Pro / TyT':['Razonamiento Cuantitativo','Lectura Crítica','Comunicación Escrita','Competencias Ciudadanas','Inglés']}
NIV=['Básico','Intermedio','Avanzado']
def salir(m):print('ERROR:',m);sys.exit(1)
for p in(html,db):
    if not os.path.exists(p):salir(f'no encuentro {p}')
c=sqlite3.connect(db);c.row_factory=sqlite3.Row
sql="SELECT * FROM preguntas WHERE estado!='descartada'"+(" AND estado IN ('aprobada','repositorio')" if solo else '')
s11,pro,malas=[],[],[]
for r in c.execute(sql):
    try:op=json.loads(r['opciones_json'])
    except Exception:malas.append((r['id'],'opciones_json no es JSON válido'));continue
    t=[o.get('texto') for o in op];ids=[o.get('id') for o in op]
    if len(op)!=4 or len(set(t))!=4 or ids!=list('ABCD'):malas.append((r['id'],'debe tener 4 opciones distintas con ids A, B, C y D'))
    elif r['respuesta'] not in ids:malas.append((r['id'],'la respuesta no coincide con ninguna opción'))
    elif not (r['explicacion'] or '').strip() or not (r['enunciado'] or '').strip():malas.append((r['id'],'falta enunciado o explicación'))
    elif r['examen'] not in AREAS or r['area'] not in AREAS[r['examen']] or r['nivel'] not in NIV:malas.append((r['id'],f"examen, área o nivel desconocido: {r['examen']} / {r['area']} / {r['nivel']}"))
    else:
        q=dict(id=r['id'],examen=r['examen'],area=r['area'],nivel=r['nivel'],competencia=r['competencia'] or r['area'],enunciado=r['enunciado'],opciones=op,respuesta=r['respuesta'],explicacion=r['explicacion'],marcaContenido='Pregunta de práctica, no oficial')
        (s11 if r['examen']=='Saber 11' else pro).append(q)
if malas:
    print('No se escribió nada. Preguntas con problemas:')
    for i,m in malas[:30]:print(' -',i,':',m)
    salir(f'{len(malas)} pregunta(s) inválida(s)')
h=open(html,encoding='utf-8').read()
m1=re.search(r"const BANK=(\[.*?\]),CAT=",h,re.S);m2=re.search(r"const GENPRO=(\[.*?\]);XQ\.push",h,re.S)
if not m1 or not m2:salir('este HTML no tiene el formato esperado del demo (no encuentro BANK o GENPRO)')
j=lambda o:json.dumps(o,ensure_ascii=False,separators=(',',':')).replace('</','<\\/')
shutil.copy(html,html+'.bak')
h=h[:m2.start(1)]+j(pro)+h[m2.end(1):]
m1=re.search(r"const BANK=(\[.*?\]),CAT=",h,re.S);h=h[:m1.start(1)]+j(s11)+h[m1.end(1):]
open(html,'w',encoding='utf-8').write(h)
cnt=collections.Counter((q['examen'],q['area'],q['nivel']) for q in s11+pro)
print(f'Listo: {len(s11)} preguntas de Saber 11 y {len(pro)} de Saber Pro / TyT en {html}')
print('Copia de seguridad:',html+'.bak')
for ex,ars in AREAS.items():
    for a in ars:
        for n in NIV:
            k=cnt.get((ex,a,n),0)
            if k<5:print(f'AVISO: {ex} · {a} · {n} tiene solo {k} pregunta(s) en la base; las lecciones necesitan al menos 5 (el demo completa con otras si puede).')
print('Mínimo por grupo:',min([cnt.get((ex,a,n),0) for ex,ars in AREAS.items() for a in ars for n in NIV]))

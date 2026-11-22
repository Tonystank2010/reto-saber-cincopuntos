#!/usr/bin/env python3
"""Verifica la base de preguntas. Termina con error (código 1) si algo está mal.
Uso: python3 probar_banco.py [banco-preguntas.db] [--minimo 5]
Comprueba: opciones válidas (4, distintas, ids A-D), respuesta existente, explicación en cada opción incorrecta (en las preguntas nuevas), ids únicos,
enunciados no repetidos por examen y un mínimo de preguntas activas por examen, área y nivel."""
import sys,os,json,sqlite3,collections
args=sys.argv[1:];minimo=5
if '--minimo' in args:i=args.index('--minimo');minimo=int(args[i+1]);del args[i:i+2]
aqui=os.path.dirname(os.path.abspath(__file__));db=args[0] if args else os.path.join(aqui,'banco-preguntas.db')
if not os.path.exists(db):sys.exit(f'ERROR: no encuentro {db}')
sin_why=0
c=sqlite3.connect(db);c.row_factory=sqlite3.Row;err=[];ids=set();en=collections.Counter();gr=collections.Counter()
AREAS={'Saber 11':{'Matemáticas','Lectura Crítica','Ciencias Naturales','Sociales y Ciudadanas','Inglés'},'Saber Pro / TyT':{'Razonamiento Cuantitativo','Lectura Crítica','Comunicación Escrita','Competencias Ciudadanas','Inglés'}}
for r in c.execute("SELECT * FROM preguntas WHERE estado!='descartada'"):
    try:op=json.loads(r['opciones_json'])
    except Exception:err.append(f"{r['id']}: opciones_json inválido");continue
    t=[o.get('texto') for o in op]
    if len(op)!=4 or len(set(t))!=4 or [o.get('id') for o in op]!=list('ABCD'):err.append(f"{r['id']}: debe tener 4 opciones distintas con ids A-D")
    elif r['respuesta'] not in 'ABCD':err.append(f"{r['id']}: respuesta inválida")
    elif r['estado']!='repositorio' and any(not (o.get('why') or '').strip() for o in op if o.get('id')!=r['respuesta']):err.append(f"{r['id']}: cada opción incorrecta debe traer su explicación (campo why)")
    elif r['estado']=='repositorio' and any(not (o.get('why') or '').strip() for o in op if o.get('id')!=r['respuesta']):sin_why+=1
    if not (r['explicacion'] or '').strip():err.append(f"{r['id']}: sin explicación")
    if r['id'] in ids:err.append(f"{r['id']}: id repetido")
    ids.add(r['id']);en[(r['examen'],r['enunciado'],tuple(sorted(t)))]+=1
    if r['examen'] not in AREAS or r['area'] not in AREAS[r['examen']] or r['nivel'] not in('Básico','Intermedio','Avanzado'):err.append(f"{r['id']}: examen, área o nivel desconocido")
    else:gr[(r['examen'],r['area'],r['nivel'])]+=1
err+= [f"pregunta repetida en {k[0]}: {k[1][:50]}…" for k,v in en.items() if v>1]
for ex,ars in AREAS.items():
    for a in ars:
        for n in('Básico','Intermedio','Avanzado'):
            if gr[(ex,a,n)]<minimo:err.append(f"{ex} · {a} · {n}: solo {gr[(ex,a,n)]} (mínimo {minimo})")
print(f'{len(ids)} preguntas activas revisadas.')
if sin_why:print(f'AVISO: {sin_why} pregunta(s) del repositorio no traen explicación por cada opción incorrecta (para ellas es opcional).')
if err:
    print('PROBLEMAS:');[print(' -',e) for e in err[:40]];sys.exit(1)
print('Todo en orden.')

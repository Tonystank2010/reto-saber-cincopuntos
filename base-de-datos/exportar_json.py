#!/usr/bin/env python3
"""Exporta las preguntas de la base a un JSON para cargarlo desde el juego (Perfil > Cargar banco).

Uso:   python3 exportar_json.py [banco-preguntas.db] [--solo-aprobadas]

- Escribe banco-exportado.json junto al script.
- No exporta las 75 preguntas del repositorio (ya vienen dentro del juego) ni las 'descartada'.
- Con --solo-aprobadas exporta solo las de estado 'aprobada'.
"""
import sys,json,sqlite3,os
args=[a for a in sys.argv[1:] if not a.startswith('--')];solo='--solo-aprobadas' in sys.argv
aqui=os.path.dirname(os.path.abspath(__file__));db=args[0] if args else os.path.join(aqui,'banco-preguntas.db')
if not os.path.exists(db):sys.exit(f'ERROR: no encuentro {db}')
c=sqlite3.connect(db);c.row_factory=sqlite3.Row
sql="SELECT * FROM preguntas WHERE estado NOT IN ('descartada','repositorio')"+(" AND estado='aprobada'" if solo else '')
out={'saber11':[],'saberPro':[]}
for r in c.execute(sql):
    q=dict(id=r['id'],examen=r['examen'],area=r['area'],nivel=r['nivel'],competencia=r['competencia'] or r['area'],enunciado=r['enunciado'],opciones=json.loads(r['opciones_json']),respuesta=r['respuesta'],explicacion=r['explicacion'],marcaContenido='Pregunta de práctica, no oficial')
    out['saber11' if r['examen']=='Saber 11' else 'saberPro'].append(q)
dest=os.path.join(aqui,'banco-exportado.json');json.dump(out,open(dest,'w',encoding='utf-8'),ensure_ascii=False)
print('Exportadas',len(out['saber11']),'de Saber 11 y',len(out['saberPro']),'de Saber Pro / TyT ->',dest)

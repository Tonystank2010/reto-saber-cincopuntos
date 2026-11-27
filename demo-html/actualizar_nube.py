#!/usr/bin/env python3
"""Escribe o borra las credenciales de Supabase dentro del demo (v27).

Las credenciales van DENTRO del HTML porque el demo es un archivo unico
autocontenido. Solo se usan la URL del proyecto y la clave ANON (publica
por diseno: la seguridad la dan las politicas RLS de supabase/progreso.sql).

Uso:
    python3 demo-html/actualizar_nube.py --url https://xxxx.supabase.co --clave eyJhbGci...
    python3 demo-html/actualizar_nube.py --limpiar    # vuelve al modo local

Tambien puedes editar a mano: busca "RS_NUBE" en el HTML y rellena url/clave.
"""
import argparse, io, os, sys

DEMOS = []
RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
for rel in (
    os.path.join('public', 'juego', 'Reto-Saber.html'),
    os.path.join('demo-html', 'Reto-Saber.html'),
    os.path.join('desktop', 'app', 'Reto-Saber.html'),
):
    p = os.path.join(RAIZ, rel)
    if os.path.exists(p):
        DEMOS.append(p)

def linea_config(url, clave):
    return f'window.RS_NUBE={{url:\'{url}\',clave:\'{clave}\'}};/*RS-NUBE-CONFIG*/'

def main():
    ap = argparse.ArgumentParser(description='Credenciales Supabase del demo')
    ap.add_argument('--url', default='', help='URL del proyecto Supabase')
    ap.add_argument('--clave', default='', help='clave anon public')
    ap.add_argument('--limpiar', action='store_true', help='borrar credenciales (modo local)')
    ap.add_argument('--solo', help='editar solo una ruta (p. ej. public/demo)')
    args = ap.parse_args()

    if args.limpiar:
        url, clave = '', ''
    else:
        url, clave = args.url.strip(), args.clave.strip()
        if not ((url and clave) or args.limpiar):
            sys.exit('Pasa --url y --clave, o usa --limpiar')
        if url and not url.startswith('https://'):
            sys.exit('La URL debe empezar por https:// (ej.: https://xxxx.supabase.co)')

    nueva = linea_config(url, clave)
    for p in DEMOS:
        if args.solo and args.solo not in p:
            continue
        s = io.open(p, encoding='utf-8').read()
        i = s.find('/*RS-NUBE-CONFIG*/')
        if i < 0:
            print(f'AVISO: sin marcador RS_NUBE en {p} (v27 no inyectado)')
            continue
        j = s.rfind('<script>', 0, i)
        k = s.find('</script>', i)
        viejo = s[j:k + len('</script>')]
        s = s.replace(viejo, f'<script>{nueva}</script>')
        io.open(p, 'w', encoding='utf-8').write(s)
        estado = 'MODO LOCAL' if args.limpiar else 'MODO NUBE'
        print(f'{estado}: {p}')

if __name__ == '__main__':
    main()

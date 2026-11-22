# App de escritorio (sin navegador) — Reto Saber · Cinco Puntos

El demo es un único archivo HTML autocontenido; esta carpeta lo empaqueta como
aplicación de escritorio con **Electron** para Windows, macOS y Linux.

## Uso rápido (desarrollador)

```bash
cd desktop
npm install          # descarga Electron (~100 MB, solo la primera vez)
npm run sincronizar  # copia el demo canónico de public/demo a app/
npm start            # abre la ventana del juego
```

## Instaladores (distribución)

```bash
npm run dist         # genera installer en desktop/dist
```

- **Windows:** `dist/Reto Saber Cinco Puntos Setup .exe` (NSIS)
- **macOS:** `dist/*.dmg`
- **Linux:** `dist/*.AppImage`

## Progreso

El progreso (cuentas, XP, rachas, errores para repasar) se guarda en el
almacenamiento de la ventana (userData de Electron) y **persiste entre sesiones**.
También puedes usar el traspaso con código (Perfil → «Generar mi código») para
llevar el progreso entre la app de escritorio, el juego en línea y otros
dispositivos. La contraseña guardada en el dispositivo (v23) funciona igual aquí.

## Importante

- `app/Reto-Saber-Demo.html` es una **copia**: al actualizar el demo
  (`public/demo/Reto-Saber-Demo.html`), vuelve a ejecutar `npm run sincronizar`.
- Esta carpeta tiene su propio `package.json`: el desarrollo web (raíz del
  repositorio) no descarga Electron.
- Seguridad: `contextIsolation` activado y `nodeIntegration` desactivado; la
  ventana solo carga archivos locales.

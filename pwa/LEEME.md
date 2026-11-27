# Instalar el juego en el celular y usarlo sin conexión (PWA)

**Estado: preparado, no activado ni probado.** Solo funciona cuando el juego está publicado en una dirección con HTTPS (por ejemplo, el hosting que contrates). Desde un archivo local o `http://` no funciona.

## Pasos cuando tengas hosting
1. Sube `Reto-Saber.html`, `manifest.webmanifest`, `icon.svg` y `sw.js` a la misma carpeta del servidor.
2. En el `<head>` del HTML agrega: `<link rel="manifest" href="manifest.webmanifest">`
3. Antes de `</body>` agrega: `<script>if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js')</script>`
4. Abre el juego en el celular con HTTPS. El navegador ofrecerá «Instalar» o «Añadir a la pantalla de inicio».
5. Cada vez que cambies el HTML, cambia el número de versión `V` en `sw.js` para que los celulares descarguen la nueva versión.

## Pendiente de verificar
- Iconos en PNG de 192 y 512 px si algún navegador no acepta el icono SVG.
- Que las copias de seguridad y el almacenamiento local sigan funcionando dentro de la app instalada.
- Recordatorios de estudio: requieren notificaciones y un servidor; no están incluidos.

## Nota: cuál service worker es el canónico

- **`public/sw.js`** es el canónico: es el que se despliega en Vercel y el que registra la app React (`src/main.jsx`). Cualquier cambio de caché o de versión se hace ahí.
- **`pwa/sw.js`** es la variante para el alojamiento manual de archivo único (la carpeta `pwa/` con `Reto-Saber.html`, `manifest.webmanifest`, `icon.svg` y `sw.js` juntos, sin React ni Vercel). Si cambias uno, cambia también el otro y mantén el número de versión `V` igual en ambos para no desincronizar las versiones instaladas.
- Los íconos PNG de 192 y 512 px (`public/icon-192.png`, `public/icon-512.png`) ya existen para navegadores que no aceptan el SVG; si usas la variante manual, cópialos también a esa carpeta y agrégalos al `manifest.webmanifest`.

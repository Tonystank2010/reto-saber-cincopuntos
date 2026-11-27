// Service worker de Reto Saber · Cinco Puntos: guarda la app para abrirla sin conexión.
// Requiere HTTPS (Vercel lo provee) y se actualiza al cambiar el cache name.
// skipWaiting + clients.claim: la versión nueva toma el control al recargar una sola vez.
const V = 'rscp-v39'
const ARCH = ['/', '/demo/Reto-Saber-Demo.html', '/manifest.webmanifest', '/icon.svg', '/icon-192.png', '/icon-512.png']
self.addEventListener('install', e => e.waitUntil(
  caches.open(V).then(c => c.addAll(ARCH)).then(() => self.skipWaiting())
))
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())
))
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request)))
})

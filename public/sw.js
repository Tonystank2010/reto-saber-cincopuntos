// Service worker de Reto Saber · Cinco Puntos: guarda la app para abrirla sin conexión.
// Requiere HTTPS (Vercel lo provee) y se actualiza al cambiar el cache name.
// skipWaiting + clients.claim: la versión nueva toma el control al recargar una sola vez.
// Las navegaciones son network-first: el usuario siempre recibe la versión nueva si hay internet.
const V = 'rscp-v41'
const ARCH = ['/', '/juego/Reto-Saber.html', '/manifest.json', '/manifest.webmanifest', '/icon.svg', '/icon-192.png', '/icon-512.png']
self.addEventListener('install', e => e.waitUntil(
  caches.open(V).then(c => c.addAll(ARCH)).then(() => self.skipWaiting())
))
self.addEventListener('activate', e => e.waitUntil(
  caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim())
))
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return
  const req = e.request
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req).then(res => {
      const copia = res.clone()
      caches.open(V).then(c => c.put('/', copia)).catch(() => {})
      return res
    }).catch(() => caches.match('/').then(x => x || caches.match(req))))
    return
  }
  e.respondWith(caches.match(req).then(x => x || fetch(req).then(res => {
    if (res.ok && new URL(req.url).origin === self.location.origin) {
      const copia = res.clone()
      caches.open(V).then(c => c.put(req, copia)).catch(() => {})
    }
    return res
  })))
})

// Vaihda versio aina kun tiedostoja päivitetään, jotta puhelin hakee uudet
const VERSIO = 'kelaus-v2';
const TIEDOSTOT = ['./', 'index.html', 'manifest.webmanifest', 'icon.svg', 'icon-180.png', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSIO).then(c => c.addAll(TIEDOSTOT)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(avaimet => Promise.all(avaimet.filter(a => a !== VERSIO).map(a => caches.delete(a))))
      .then(() => self.clients.claim())
  );
});

// Verkko ensin, välimuisti varalla: päivitykset tulevat heti kun netti toimii
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(
    fetch(e.request)
      .then(vastaus => {
        const kopio = vastaus.clone();
        caches.open(VERSIO).then(c => c.put(e.request, kopio));
        return vastaus;
      })
      .catch(() => caches.match(e.request, { ignoreSearch: true }).then(v => v || caches.match('index.html')))
  );
});

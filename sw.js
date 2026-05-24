// Service Worker: cache shell offline. Network-first for data, cache-first for assets.

const VERSION = 'v2';
const SHELL_CACHE = `lamola-tv-shell-${VERSION}`;
const DATA_CACHE = `lamola-tv-data-${VERSION}`;

const SHELL_ASSETS = [
  './',
  './index.html',
  './css/tokens.css',
  './css/tv.css',
  './js/tv/main.js',
  './js/tv/carousel.js',
  './js/tv/data-loader.js',
  './js/tv/slide-intro.js',
  './js/tv/slide-pro-intro.js',
  './js/tv/slide-pro.js',
  './js/tv/slide-merch.js',
  './js/tv/clock.js',
  './js/tv/qr.js',
  './js/tv/vendor/qrcode.min.js',
  './fonts/montserrat-latin-400-normal.woff2',
  './fonts/montserrat-latin-500-normal.woff2',
  './fonts/montserrat-latin-500-italic.woff2',
  './fonts/montserrat-latin-600-normal.woff2',
  './fonts/montserrat-latin-800-normal.woff2',
  './media/brand/logo-short.png',
  './manifest.webmanifest'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(SHELL_CACHE)
      .then(c => c.addAll(SHELL_ASSETS).catch(err => console.warn('[sw] precache partial:', err)))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(k => k !== SHELL_CACHE && k !== DATA_CACHE).map(k => caches.delete(k))
    )).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  const sameOrigin = url.origin === self.location.origin;
  if (!sameOrigin) return; // let cross-origin (Spline, etc.) go to network

  const isData = url.pathname.endsWith('/services.json') || url.pathname.endsWith('/config.json');

  if (isData) {
    // Network-first, fallback to cache
    event.respondWith(
      fetch(req)
        .then(res => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(DATA_CACHE).then(c => c.put(req, copy));
          }
          return res;
        })
        .catch(() => caches.match(req).then(r => r || new Response('{}', { headers: { 'Content-Type': 'application/json' } })))
    );
  } else {
    // Cache-first for shell + media
    event.respondWith(
      caches.match(req).then(cached => {
        if (cached) {
          // Refresh in background
          fetch(req).then(res => {
            if (res && res.ok) caches.open(SHELL_CACHE).then(c => c.put(req, res));
          }).catch(() => {});
          return cached;
        }
        return fetch(req).then(res => {
          if (res && res.ok && res.type === 'basic') {
            const copy = res.clone();
            caches.open(SHELL_CACHE).then(c => c.put(req, copy));
          }
          return res;
        });
      })
    );
  }
});

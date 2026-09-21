/* ============================================================
   ReflexTester — Service Worker
   Offline shell with network-first application code
   ============================================================ */

const CACHE_NAME = 'reflextester-2026-v3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/src/styles/base.css',
  '/src/styles/site.css',
  '/src/styles/tool.css',
  '/src/styles/article.css',
  '/src/styles/assets.css',
  '/src/app/shell.js',
  '/src/app/static-page.js',
  '/src/app/visual-assets.js',
  '/src/app/home.js',
  '/src/app/catalog.js',
  '/src/app/dashboard.js',
  '/src/app/tool-page.js',
  '/src/data/tools.js',
  '/src/core/store.js',
  '/manifest.json',
  '/tools.html',
  '/dashboard.html',
  '/blog.html',
  '/about.html',
  '/contact.html',
  '/404.html',
  '/assets/brand/reflextester-mark.svg',
  '/assets/photos/performance-workspace.webp',
  '/favicon.ico',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/apple-touch-icon.png'
];

// Install — cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch — Stale-While-Revalidate for HTML, Cache-First for assets
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin requests
  if (url.origin !== location.origin) return;

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // HTML pages: Network-first with cache fallback
  if (request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('/404.html')))
    );
    return;
  }

  // CSS and JS: network-first so a release never keeps running stale game code.
  if (request.destination === 'style' || request.destination === 'script') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Images and fonts: stale-while-revalidate for fast repeat visits.
  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) {
        // Revalidate in background
        fetch(request)
          .then((response) => {
            caches.open(CACHE_NAME).then((cache) => cache.put(request, response));
          })
          .catch(() => {});
        return cached;
      }
      return fetch(request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      });
    })
  );
});

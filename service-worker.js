// Registered from pdfupload.html, so this runs at root scope. Precache only the
// PDF splitter's own assets: caching '/' or '/index.html' here would pin a stale
// copy of the homepage for every visitor who has opened the splitter.
const CACHE_NAME = 'pdf-splitter-cache-v2';
const urlsToCache = [
  '/pdfupload.html',
  '/manifest.json',
  '/split192.png',
  '/split512.png',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Drop earlier caches, otherwise the v1 copy of '/' keeps being served: the
// fetch handler below matches against every cache, not just the current one.
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

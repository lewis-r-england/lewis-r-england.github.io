const CACHE_NAME = "daad-travel-costs-cache-v1";
const urlsToCache = [
  "./daadside/uploader.html",
  "./daadside/manifest.json",
  "./daadside/DAADtravel192.png",
  "./daadside/DAADtravel512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
});

self.addEventListener("fileopen", (event) => {
  const file = event.file;
  if (file.name.endsWith(".daadtravelcosts")) {
    event.waitUntil(
      clients.matchAll().then((clientsList) => {
        if (clientsList.length > 0) {
          clientsList[0].postMessage({ action: "openFile", file });
        }
      })
    );
  }
});

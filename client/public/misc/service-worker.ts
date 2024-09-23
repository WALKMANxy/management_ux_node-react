/// <reference lib="webworker" />

const CACHE_NAME = 'my-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/static/js/bundle.js',
  '/static/js/main.chunk.js',
  '/static/js/0.chunk.js',
  'https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;500;600;700;800;900&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css',
];

self.addEventListener('install', (event: Event) => {
  const extendableEvent = event as ExtendableEvent;
  extendableEvent.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', (event: Event) => {
  const fetchEvent = event as FetchEvent;
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then(response => {
      if (response) {
        return response;
      }

      return fetch(fetchEvent.request).then(networkResponse => {
        // Add fetched files to the cache
        return caches.open(CACHE_NAME).then(cache => {
          // Only cache successful responses
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            cache.put(fetchEvent.request, networkResponse.clone());
          }
          return networkResponse;
        });
      });
    })
  );
});

self.addEventListener('activate', (event: Event) => {
  const extendableEvent = event as ExtendableEvent;
  const cacheWhitelist = [CACHE_NAME];
  extendableEvent.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(cacheName => cacheWhitelist.indexOf(cacheName) === -1)
          .map(cacheName => caches.delete(cacheName))
      );
    })
  );
});

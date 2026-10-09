/* SoftMart keeps cart state in localStorage. The service worker deliberately
   does not cache pages or assets, so HTML/CSS/JS updates are always fetched. */
const CACHE_VERSION = 'softmart-no-page-cache-v2';

self.addEventListener('install', event => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) return;
  event.respondWith(fetch(new Request(event.request, { cache: 'no-store' })));
});

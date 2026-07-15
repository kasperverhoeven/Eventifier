const CACHE = 'odd-firebase-v1';
const ASSETS = ['/', '/index.html', '/manifest.json', '/icons/icon-new-192.png', '/icons/icon-new-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  const url = e.request.url;

  // Ignore Firebase requests completely
  if (
    url.includes('firestore.googleapis.com') ||
    url.includes('firebaseio.com') ||
    url.includes('firebasedatabase.app') ||
    url.includes('googleapis.com')
  ) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then(cached => {
      return (
        cached ||
        fetch(e.request).catch(() => caches.match('/index.html'))
      );
    })
  );
});

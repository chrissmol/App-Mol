const CACHE_VERSION = 'mol-app-shell-v3';
const SHELL_URLS = [
  '/',
  '/index.html',
  '/pages/login.html',
  '/css/style.css',
  '/css/tailwind.css',
  '/theme-bootstrap.js',
  '/assets/mol-mark.svg'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then(cache => Promise.allSettled(SHELL_URLS.map(url => cache.add(url))))
      .catch(() => undefined)
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    Promise.all([
      caches.keys().then(names => Promise.all(names.filter(name => name !== CACHE_VERSION).map(name => caches.delete(name)))),
      self.clients.claim()
    ])
  );
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(CACHE_VERSION);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirstNavigation(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_VERSION);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return caches.match(request)
      .then(response => response || caches.match('/index.html'));
  }
}

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(networkFirstNavigation(request));
    return;
  }
  if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/css/') || url.pathname.startsWith('/vendor/') || url.pathname.endsWith('.js') || url.pathname.endsWith('.svg')) {
    event.respondWith(cacheFirst(request));
  }
});

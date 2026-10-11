const CACHE_VERSION = 'mol-app-shell-v7';
const SHELL_URLS = [
  '/',
  '/index.html',
  '/pages/login.html',
  '/pages/treino.html',
  '/pages/dieta.html',
  '/pages/marmitas.html',
  '/pages/perfil.html',
  '/pages/historico.html',
  '/pages/progresso.html',
  '/pages/evolucao.html',
  '/pages/configuracoes.html',
  '/pages/dados-pessoais.html',
  '/pages/boas-vindas.html',
  '/pages/assistente.html',
  '/assets/pets/moldrian/feliz-avatar.webp',
  '/assets/pets/marlo/feliz-avatar.webp',
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

// Abre na hora com a página em cache e atualiza a cópia em segundo plano (vale na próxima abertura).
async function staleWhileRevalidateNavigation(request, event) {
  const cached = await caches.match(request);
  const refresh = fetch(request).then(async response => {
    if (response.ok) (await caches.open(CACHE_VERSION)).put(request, response.clone());
    return response;
  });
  if (!cached) return refresh.catch(() => caches.match('/index.html'));
  event.waitUntil(refresh.catch(() => undefined));
  return cached;
}

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== location.origin) return;
  if (request.mode === 'navigate') {
    event.respondWith(staleWhileRevalidateNavigation(request, event));
    return;
  }
  if (url.pathname.startsWith('/assets/') || url.pathname.startsWith('/css/') || url.pathname.startsWith('/vendor/') || url.pathname.endsWith('.js') || url.pathname.endsWith('.svg')) {
    event.respondWith(cacheFirst(request));
  }
});

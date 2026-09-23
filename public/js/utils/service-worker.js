export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  // Nunca registra em `npm run dev`: o sw.js faz cache.addAll do CSS na
  // instalação e prende essa versão (sem bust de nome), o que trava o app
  // com estilos velhos toda vez que o Vite serve um build diferente.
  if (import.meta.env.DEV) return;
  const allowed = location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1';
  if (!allowed || window.__molServiceWorkerListener) return;
  window.__molServiceWorkerListener = true;
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then(registration => {
        window.__molServiceWorkerRegistration = registration;
        registration.update().catch(() => undefined);
      })
      .catch(error => console.warn('Service worker não registrado:', error.message));
  }, { once: true });
}

export function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
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

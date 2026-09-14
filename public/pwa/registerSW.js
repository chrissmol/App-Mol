(() => {
  async function clearAppCaches() {
    if (!('caches' in window)) return;
    const names = await caches.keys();
    await Promise.all(names.map(name => caches.delete(name)));
  }

  async function unregisterServiceWorkers() {
    if (!('serviceWorker' in navigator)) return;
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map(registration => registration.unregister()));
  }

  window.addEventListener('load', () => {
    Promise.allSettled([clearAppCaches(), unregisterServiceWorkers()]).then(() => {
      if (navigator.serviceWorker?.controller && !sessionStorage.getItem('mol-sw-cleared-v1')) {
        sessionStorage.setItem('mol-sw-cleared-v1', 'true');
        window.location.reload();
      }
    });
  });
})();

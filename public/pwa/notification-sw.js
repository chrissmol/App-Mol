self.addEventListener('notificationclick', event => {
  event.notification.close();
  const requested = event.notification.data?.url;
  const target = new URL(typeof requested === 'string' && requested.startsWith('/') ? requested : '/', self.location.origin).href;
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(windows => {
    const openApp = windows.find(client => new URL(client.url).origin === self.location.origin);
    if (openApp) {
      return openApp.navigate(target).then(client => (client || openApp).focus());
    }
    return self.clients.openWindow(target);
  }));
});

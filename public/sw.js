/**
 * Baby John - Service Worker
 * Suporte a notificações locais em segundo plano, cliques de alerta e ciclo PWA.
 */

const CACHE_NAME = 'babyjohn-v1';

self.addEventListener('install', (event) => {
  // Ativação imediata do novo Service Worker
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Listener de mensagens do frontend (React)
self.addEventListener('message', (event) => {
  if (!event.data) return;

  if (event.data.type === 'SHOW_NOTIFICATION') {
    const { title, options } = event.data;
    const notificationOptions = {
      icon: '/icon.svg',
      badge: '/icon.svg',
      vibrate: [200, 100, 200, 100, 300],
      tag: options?.tag || 'babyjohn-alert',
      renotify: true,
      requireInteraction: false,
      data: {
        url: '/',
        dateOfArrival: Date.now(),
        ...options?.data,
      },
      ...options,
    };

    self.registration.showNotification(title || 'Baby John', notificationOptions);
  }
});

// Clique na notificação na tela de bloqueio ou central de notificações
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Se já existe uma janela aberta, foca nela
      for (const client of windowClients) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      // Se não, abre uma nova janela com a rota do app
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

// Evento de fechamento voluntário da notificação
self.addEventListener('notificationclose', (event) => {
  // Registra ou limpa se necessário
});

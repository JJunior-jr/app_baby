/**
 * Baby John - Service Worker (PWA & TWA Compliance)
 * Cache de assets estáticos offline, notificações em segundo plano e ciclo de vida.
 */

const CACHE_NAME = 'babyjohn-v2';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon.svg',
];

// Instalação do SW: pré-cache de assets essenciais para funcionamento offline
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Aviso no pré-cache de assets offline:', err);
      });
    })
  );
  self.skipWaiting();
});

// Ativação do SW: limpeza de caches antigos
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

// Estratégia de Fetch: Stale-While-Revalidate para navegação offline fluida
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Ignorar requisições do Vite Dev Server HMR ou APIs externas dinâmicas
  if (url.pathname.startsWith('/@vite') || url.pathname.startsWith('/@react-refresh')) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchPromise = fetch(event.request)
          .then((networkResponse) => {
            if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
              cache.put(event.request, networkResponse.clone());
            }
            return networkResponse;
          })
          .catch(() => {
            // Se estiver offline e sem rede, retorna resposta cached ou o index.html da SPA
            return cachedResponse || caches.match('/index.html') || caches.match('/');
          });

        return cachedResponse || fetchPromise;
      });
    })
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
      for (const client of windowClients) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});

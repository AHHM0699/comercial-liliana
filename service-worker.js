/**
 * SERVICE WORKER - COMERCIAL LILIANA
 *
 * Proporciona funcionalidad PWA:
 * - Caché de assets estáticos
 * - Modo offline básico
 * - Actualizaciones automáticas
 */

const CACHE_NAME = 'comercial-liliana-v1.0.0';
const CACHE_URLS = [
  '/',
  '/index.html',
  '/css/styles.css',
  '/css/catalog.css',
  '/js/config.js',
  '/js/supabase-client.js',
  '/js/catalog.js',
  '/assets/LOGO_LILIANA_NUEVO_2026.png',
  '/manifest.json'
];

// ========== INSTALACIÓN ==========
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');

  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Cacheando archivos estáticos');
      return cache.addAll(CACHE_URLS);
    })
  );

  // Forzar activación inmediata
  self.skipWaiting();
});

// ========== ACTIVACIÓN ==========
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando Service Worker...');

  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Eliminando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );

  // Tomar control de todas las páginas inmediatamente
  self.clients.claim();
});

// ========== FETCH ==========
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar peticiones que no sean GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorar peticiones a Supabase y R2 (siempre ir a la red)
  if (
    url.hostname.includes('supabase.co') ||
    url.hostname.includes('r2.dev') ||
    url.hostname.includes('workers.dev')
  ) {
    return;
  }

  // Estrategia: Network First, fallback a Cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Si la respuesta es válida, clonarla y guardarla en caché
        if (response && response.status === 200) {
          const responseClone = response.clone();

          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }

        return response;
      })
      .catch(() => {
        // Si falla la red, intentar servir desde caché
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          // Si no hay caché, mostrar página offline
          if (request.destination === 'document') {
            return caches.match('/index.html');
          }

          // Para otros recursos, devolver una respuesta vacía
          return new Response('Recurso no disponible offline', {
            status: 503,
            statusText: 'Service Unavailable',
            headers: new Headers({
              'Content-Type': 'text/plain'
            })
          });
        });
      })
  );
});

// ========== MENSAJES ==========
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    caches.delete(CACHE_NAME).then(() => {
      console.log('[SW] Caché limpiada');
      event.ports[0].postMessage({ success: true });
    });
  }
});

// ========== NOTIFICACIONES PUSH (OPCIONAL) ==========
// Descomentar si quieres implementar notificaciones push en el futuro

/*
self.addEventListener('push', (event) => {
  const data = event.data.json();

  const options = {
    body: data.body,
    icon: '/assets/LOGO_LILIANA_NUEVO_2026.png',
    badge: '/assets/LOGO_LILIANA_NUEVO_2026.png',
    vibrate: [200, 100, 200],
    data: {
      url: data.url
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    clients.openWindow(event.notification.data.url)
  );
});
*/

console.log('[SW] Service Worker cargado correctamente');

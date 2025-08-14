/**
 * Tokei - Service Worker
 * Responsável por caching e funcionalidade offline (PWA).
 */

const CACHE_NAME = "tokei-cache-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/styles/main.css",
  "/scripts/main.js",
  "/scripts/clock.js",
  "/scripts/dialogs.js",
  "/scripts/exportImport.js",
  "/scripts/notifications.js",
  "/scripts/taskManager.js",
  "/assets/icons/icon-192x192.png",
  "/assets/icons/icon-512x512.png",
  "https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap",
  "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200",
];

// Evento de Instalação: Adiciona os arquivos essenciais ao cache.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Cache aberto");
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting();
});

// Evento de Ativação: Limpa caches antigos.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log("Service Worker: limpando cache antigo", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Evento de Fetch: Responde com o cache se disponível (Cache-First).
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Retorna do cache se encontrar, senão busca na rede.
      return response || fetch(event.request);
    })
  );
});

// Evento de clique na notificação: Foca na janela do app ou abre uma nova.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        if (clientList.length > 0) {
          let client = clientList[0];
          for (let i = 0; i < clientList.length; i++) {
            if (clientList[i].focused) {
              client = clientList[i];
            }
          }
          return client.focus();
        }
        return clients.openWindow("/");
      })
  );
});

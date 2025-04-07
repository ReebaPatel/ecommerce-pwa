const CACHE_NAME = 'ecommerce-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/images/icon-192.png',
  '/images/smartwatch.png',
  '/images/headphone.png',
  '/images/backpack.png',
];

// Install: Cache essential files
self.addEventListener('install', event => {
  self.skipWaiting(); // activate immediately
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
});

// Activate: Remove old caches
self.addEventListener('activate', event => {
  self.clients.claim(); // take control immediately
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

// Fetch: Serve from cache or fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});

// Background Sync: Triggered when connection returns
self.addEventListener('sync', event => {
  if (event.tag === 'sync-cart') {
    event.waitUntil(syncCartData());
  }
});

// Handles getting cart from client and syncing
async function syncCartData() {
  const cart = await getCart();
  console.log('📤 Syncing cart data to server:', cart);
  await new Promise(res => setTimeout(res, 1000)); // simulate delay
  clearCart();
  console.log('✅ Cart synced and cleared');
}

// Get cart via postMessage from client
function getCart() {
  return new Promise(resolve => {
    self.clients.matchAll().then(clients => {
      if (!clients || clients.length === 0) return resolve([]);
      clients[0].postMessage({ type: 'get-cart' });

      const handler = event => {
        if (event.data && event.data.type === 'return-cart') {
          resolve(event.data.cart);
          self.removeEventListener('message', handler);
        }
      };

      self.addEventListener('message', handler);
    });
  });
}

// Clear cart via postMessage
function clearCart() {
  self.clients.matchAll().then(clients => {
    if (clients && clients.length > 0) {
      clients[0].postMessage({ type: 'clear-cart' });
    }
  });
}

// Push Notification Event
self.addEventListener('push', event => {
  const data = event.data ? event.data.text() : 'New product alert!';
  const options = {
    body: data,
    icon: '/images/logo.png',
    badge: '/images/badge.png'
  };
  event.waitUntil(
    self.registration.showNotification('Ecommerce PWA', options)
  );
});

// Simulated push via message from app.js
self.addEventListener('message', event => {
  if (event.data.type === 'trigger-push') {
    const options = {
      body: event.data.message || '🔔 Notification triggered manually!',
      icon: '/images/logo.png',
    };
    self.registration.showNotification('🛒 Demo Push', options);
  }
});

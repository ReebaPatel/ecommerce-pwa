const CACHE_NAME = 'ecommerce-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/images/logo.png',
  // Add other assets here
];

// Install Event: Caches static assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate Event: Cleans up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keyList => {
      return Promise.all(
        keyList.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
});

// Fetch Event: Responds with cached data or fetches from network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

// Background Sync Event (needs registration in main JS)
self.addEventListener('sync', event => {
  if (event.tag === 'sync-cart') {
    event.waitUntil(syncCartData());
  }
});

async function syncCartData() {
  // Example: Send locally saved cart data to server
  const cartData = await localforage.getItem('cart');
  if (cartData) {
    await fetch('/sync-cart', {
      method: 'POST',
      body: JSON.stringify(cartData),
      headers: { 'Content-Type': 'application/json' }
    });
  }
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

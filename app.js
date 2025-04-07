// Register service worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('/service-worker.js')
      .then(sw => console.log('Service Worker registered:', sw))
      .catch(err => console.error('SW registration failed:', err));
  }
  
  // Register background sync
  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready.then(registration => {
      return registration.sync.register('sync-cart');
    });
  }
  
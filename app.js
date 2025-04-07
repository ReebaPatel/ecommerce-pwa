let cart = [];

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => {
        console.log('✅ Service Worker registered', reg);
      })
      .catch(err => {
        console.error('❌ Service Worker registration failed', err);
      });
  });
}

// Request Notification Permission on load
if ('Notification' in window && Notification.permission !== 'granted') {
  Notification.requestPermission().then(permission => {
    if (permission === 'granted') {
      console.log("✅ Notification permission granted");
    } else {
      console.warn("❌ Notification permission denied");
    }
  });
}

// Add item to cart and register sync
function addToCart() {
  cart.push({ id: Date.now(), name: "Smartwatch" });
  alert("🛒 Item added to cart!");

  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready.then(sw => {
      sw.sync.register('sync-cart');
      console.log("🔁 Sync registered");
    });
  } else {
    console.log("⚠️ Sync not supported");
  }
}

// Simulate push by messaging service worker
function simulatePush() {
  if ('Notification' in window && Notification.permission === 'granted') {
    navigator.serviceWorker.ready.then(reg => {
      if (reg.active) {
        reg.active.postMessage({
          type: 'trigger-push',
          message: '🎉 Special offer! Flat 30% off today!'
        });
        console.log("📩 Push message sent");
      } else {
        console.log("⚠️ No active service worker to send push");
      }
    });
  } else {
    console.warn("❌ Notification permission not granted");
  }
}

// Respond to service worker messages
navigator.serviceWorker.addEventListener('message', event => {
  if (event.data.type === 'get-cart') {
    event.source.postMessage({ type: 'return-cart', cart });
  }

  if (event.data.type === 'clear-cart') {
    cart = [];
    alert("✅ Cart cleared after syncing");
  }
});

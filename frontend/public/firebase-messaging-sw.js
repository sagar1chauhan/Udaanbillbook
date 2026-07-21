// Firebase Cloud Messaging Service Worker
// This runs in the background to handle push notifications when the app is not in focus

// Import Firebase scripts (compat version for service worker context)
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// Initialize Firebase in the service worker
firebase.initializeApp({
  apiKey: 'AIzaSyB1KZwrJ5yBCN8iavqpFCtPgRFFMRU8WRA',
  authDomain: 'udaanbillbook-74ded.firebaseapp.com',
  projectId: 'udaanbillbook-74ded',
  storageBucket: 'udaanbillbook-74ded.firebasestorage.app',
  messagingSenderId: '419857787958',
  appId: '1:419857787958:web:aa6bfcda0adf006470fc97',
  measurementId: 'G-0K9M50H3TB',
});

const messaging = firebase.messaging();

// Layer 3 (Background): Set-based dedup to prevent duplicate notifications
const shownNotifications = new Set();

// Handle background messages (when app tab is not focused)
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received:', payload);

  const notificationId = payload.data?.notificationId;

  // Dedup check
  if (notificationId && shownNotifications.has(notificationId)) {
    console.log('[SW] Duplicate notification skipped:', notificationId);
    return;
  }

  if (notificationId) {
    shownNotifications.add(notificationId);
    // Cleanup old entries to prevent memory leak (keep last 100)
    if (shownNotifications.size > 100) {
      const iterator = shownNotifications.values();
      shownNotifications.delete(iterator.next().value);
    }
  }

  const notificationTitle = payload.notification?.title || 'Udaan BillBook';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a new notification',
    icon: '/udaan-logo-removebg-preview.png',
    badge: '/udaan-logo-removebg-preview.png',
    tag: notificationId || `udaan-${Date.now()}`,
    data: {
      ...payload.data,
      link: payload.data?.link || payload.data?.click_action || '/',
    },
    vibrate: [200, 100, 200],
    requireInteraction: false,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click — navigate to the correct page
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.notification.data);
  event.notification.close();

  const link = event.notification.data?.link || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it and navigate
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          client.navigate(link);
          return;
        }
      }
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow(link);
      }
    })
  );
});

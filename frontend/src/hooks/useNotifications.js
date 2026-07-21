import { useEffect, useRef, useCallback } from 'react';
import { getToken, onMessage } from 'firebase/messaging';
import { getFirebaseMessaging } from '../lib/firebase';
import { useMockAuth } from '../lib/auth-store';
import api from '../lib/api';
import { toast } from 'sonner';

// Layer 3 (Foreground): Set-based dedup to prevent duplicate notifications
const shownNotifications = new Set();

/**
 * Custom hook to manage push notifications.
 * - Requests permission on mount (after login)
 * - Gets FCM token and saves to backend
 * - Handles foreground messages with dedup
 */
export function useNotifications() {
  const { user, isAuthenticated } = useMockAuth();
  const initialized = useRef(false);
  const unsubscribeRef = useRef(null);

  const registerToken = useCallback(async () => {
    try {
      const messaging = await getFirebaseMessaging();
      if (!messaging) {
        console.warn('⚠️ Firebase Messaging not available');
        return;
      }

      // Request notification permission
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('⚠️ Notification permission denied');
        return;
      }

      // Register service worker
      const swRegistration = await navigator.serviceWorker.register(
        '/firebase-messaging-sw.js'
      );
      console.log('✅ Service Worker registered:', swRegistration.scope);

      // Get FCM token
      const vapidKey = import.meta.env.VITE_FIREBASE_VAPID_KEY;
      const token = await getToken(messaging, {
        vapidKey,
        serviceWorkerRegistration: swRegistration,
      });

      if (token) {
        console.log('✅ FCM Token obtained:', token.slice(0, 20) + '...');

        // Save token to backend
        try {
          await api.post('/notifications/save-token', {
            token,
            platform: 'web',
          });
          console.log('✅ FCM Token saved to backend');
        } catch (err) {
          console.error('❌ Failed to save FCM token to backend:', err.message);
        }
      } else {
        console.warn('⚠️ No FCM token generated');
      }

      // Setup foreground message handler
      const unsubscribe = onMessage(messaging, (payload) => {
        console.log('📬 Foreground message received:', payload);

        const notificationId = payload.data?.notificationId;

        // Dedup check (Layer 3)
        if (notificationId && shownNotifications.has(notificationId)) {
          console.log('⏭️ Duplicate foreground notification skipped:', notificationId);
          return;
        }

        if (notificationId) {
          shownNotifications.add(notificationId);
          // Cleanup old entries to prevent memory leak
          if (shownNotifications.size > 100) {
            const iterator = shownNotifications.values();
            shownNotifications.delete(iterator.next().value);
          }
        }

        // Read from notification field first, fall back to data field
        const title = payload.notification?.title || payload.data?.title || 'Udaan BillBook';
        const body = payload.notification?.body || payload.data?.body || 'You have a new notification';
        const link = payload.data?.link || payload.data?.click_action || '/';

        console.log('🔔 Showing notification toast:', { title, body, link });

        // Use setTimeout to avoid toast being swallowed by concurrent toasts
        setTimeout(() => {
          toast.info(title, {
            description: body,
            duration: 6000,
            action: link !== '/'
              ? {
                  label: 'View',
                  onClick: () => {
                    window.location.href = link;
                  },
                }
              : undefined,
          });
        }, 300);

        // Also show native browser notification
        if (Notification.permission === 'granted') {
          try {
            const notification = new Notification(title, {
              body,
              icon: '/udaan-logo-removebg-preview.png',
              tag: notificationId || `udaan-fg-${Date.now()}`,
            });
            notification.onclick = () => {
              window.focus();
              if (link !== '/') {
                window.location.href = link;
              }
            };
          } catch (e) {
            console.warn('⚠️ Browser notification failed:', e.message);
          }
        }
      });

      unsubscribeRef.current = unsubscribe;
    } catch (error) {
      console.error('❌ Notification registration error:', error);
    }
  }, []);

  useEffect(() => {
    // Only register if user is authenticated and not already initialized
    if (!isAuthenticated || initialized.current) return;

    // Check if notifications API is available
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      console.warn('⚠️ Notifications or Service Workers not supported');
      return;
    }

    initialized.current = true;
    registerToken();

    // Cleanup on unmount
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
      initialized.current = false;
    };
  }, [isAuthenticated, registerToken]);

  return null;
}

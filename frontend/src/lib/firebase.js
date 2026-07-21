import { initializeApp } from 'firebase/app';
import { getMessaging, isSupported } from 'firebase/messaging';

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Messaging (only if supported by the browser)
let messaging = null;

async function getFirebaseMessaging() {
  if (messaging) return messaging;

  const supported = await isSupported();
  if (supported) {
    messaging = getMessaging(app);
    console.log('✅ Firebase Messaging initialized');
  } else {
    console.warn('⚠️ Firebase Messaging is not supported in this browser');
  }

  return messaging;
}

export { app, getFirebaseMessaging };
export default app;

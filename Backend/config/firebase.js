const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');
const path = require('path');

// Load service account from the path specified in env, or default config path
const serviceAccountPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH
  ? path.resolve(__dirname, '..', process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
  : path.resolve(__dirname, 'udaanbillbook-74ded-firebase-adminsdk-fbsvc-2d80632f2a.json');

let serviceAccount;
try {
  serviceAccount = require(serviceAccountPath);
} catch (err) {
  console.error('❌ Firebase service account file not found at:', serviceAccountPath);
  console.error('   Push notifications will NOT work.');
}

let app;
if (serviceAccount && getApps().length === 0) {
  app = initializeApp({
    credential: cert(serviceAccount),
  });
  console.log('✅ Firebase Admin SDK initialized successfully');
} else if (getApps().length > 0) {
  app = getApps()[0];
}

// Export messaging instance
const messaging = app ? getMessaging(app) : null;

module.exports = { app, messaging };

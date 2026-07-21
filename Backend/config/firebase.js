const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin once
if (!admin.apps || !admin.apps.length) {
  const serviceAccount = require(path.join(__dirname, '../config/udaanbillbook-74ded-firebase-adminsdk-fbsvc-2d80632f2a.json'));
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

module.exports = admin;

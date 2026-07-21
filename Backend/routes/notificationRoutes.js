const express = require('express');
const router = express.Router();
const {
  registerToken,
  removeToken,
  sendSelfNotification,
  sendNotificationToUser,
  broadcastNotification,
  getSubscribers,
  verifyToken
} = require('../controllers/notificationController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// ── User Routes (any logged-in user) ──────────────────────────────────────────
router.post('/register-token', protect, registerToken);       // Save FCM token
router.delete('/register-token', protect, removeToken);       // Remove FCM token
router.post('/send-self', protect, sendSelfNotification);     // Test: send to yourself
router.post('/verify-token', protect, verifyToken);           // Verify any FCM token (dry-run)

// ── Admin Only Routes ──────────────────────────────────────────────────────────
router.get('/subscribers', protect, restrictTo('admin'), getSubscribers);               // List all subscribers
router.post('/send-to-user', protect, restrictTo('admin'), sendNotificationToUser);     // Send to one user
router.post('/broadcast', protect, restrictTo('admin'), broadcastNotification);         // Send to all

module.exports = router;

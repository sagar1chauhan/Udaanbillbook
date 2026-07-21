const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  saveToken,
  removeToken,
  testNotification,
  getNotificationHistory,
} = require('../controllers/notificationController');

// All routes require authentication
router.use(protect);

// Token management
router.post('/save-token', saveToken);
router.delete('/remove-token', removeToken);

// Test notification (useful for debugging)
router.post('/test', testNotification);

// Notification history
router.get('/history', getNotificationHistory);

module.exports = router;

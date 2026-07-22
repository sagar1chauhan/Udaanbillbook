const { messaging } = require('../config/firebase');
const notificationService = require('../services/notificationService');
const User = require('../models/User');

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/notifications/register-token
// Body: { fcmToken: "xyz...", platform?: "web"|"mobile" }
// Auth: Bearer
// ─────────────────────────────────────────────────────────────────────────────
const registerToken = async (req, res) => {
  try {
    const { fcmToken, platform = 'web' } = req.body;
    if (!fcmToken) return res.status(400).json({ message: 'fcmToken is required.', fcmTokenStored: false });

    const field = platform === 'mobile' ? 'fcmTokenMobile' : 'fcmTokens';

    // Add token to array if not already present
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { $addToSet: { [field]: fcmToken } },
      { new: true }
    );

    // Verify token is actually in the array
    const storedTokens = platform === 'mobile' ? updatedUser.fcmTokenMobile : updatedUser.fcmTokens;
    const fcmTokenStored = storedTokens && storedTokens.includes(fcmToken);

    res.json({
      message: `FCM token registered (${platform}).`,
      fcmTokenStored,
      userId: req.user._id,
      platform,
      totalTokens: storedTokens ? storedTokens.length : 0,
    });
  } catch (err) {
    res.status(500).json({ message: err.message, fcmTokenStored: false });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/notifications/register-token
// Body: { fcmToken: "xyz..." }
// Auth: Bearer
// ─────────────────────────────────────────────────────────────────────────────
const removeToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    if (fcmToken) {
      await User.findByIdAndUpdate(req.user._id, {
        $pull: { fcmTokens: fcmToken, fcmTokenMobile: fcmToken }
      });
    } else {
      // Remove all tokens (full logout)
      await User.findByIdAndUpdate(req.user._id, { fcmTokens: [], fcmTokenMobile: [] });
    }
    res.json({ message: 'FCM token(s) removed.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/notifications/verify-token
// Body: { fcmToken: "xyz..." }
// Auth: Bearer — Dry-run verify any token without sending
// ─────────────────────────────────────────────────────────────────────────────
const verifyToken = async (req, res) => {
  try {
    if (!messaging) return res.status(503).json({ message: 'Firebase not initialized. Check service account JSON.' });

    const { fcmToken } = req.body;
    if (!fcmToken) return res.status(400).json({ message: 'fcmToken is required.' });

    const message = { token: fcmToken, notification: { title: 'Verify', body: 'Token check' } };
    await messaging.send(message, true); // dry-run = true

    res.json({ valid: true, message: '✅ FCM token is valid and reachable!' });
  } catch (err) {
    if (err.code === 'messaging/registration-token-not-registered') {
      return res.status(400).json({ valid: false, message: 'Token is expired or unregistered.', code: err.code });
    }
    if (err.code === 'messaging/invalid-registration-token') {
      return res.status(400).json({ valid: false, message: 'Token format is invalid.', code: err.code });
    }
    res.status(500).json({ valid: false, message: err.message, code: err.code });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/notifications/send-self
// Body: { title, body, data? }
// Auth: Bearer — Send test notification to yourself
// ─────────────────────────────────────────────────────────────────────────────
const sendSelfNotification = async (req, res) => {
  try {
    const { title = 'Udaan BillBook', body = 'Test Notification!', data } = req.body;

    const result = await notificationService.sendNotificationToUser(req.user._id, {
      title, body, data: data || { type: 'test', id: Date.now().toString() }
    });

    if (!result.success && result.reason === 'no_tokens') {
      return res.status(400).json({
        message: 'No FCM tokens registered for your account. First call POST /api/notifications/register-token'
      });
    }

    res.json({ message: 'Notification sent!', ...result });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/notifications/test  [any auth]
// Body: { title, body }
// Used by frontend dashboard test button — broadcasts to all fcm token users
// ─────────────────────────────────────────────────────────────────────────────
const testBroadcast = async (req, res) => {
  try {
    if (!messaging) return res.status(503).json({ message: 'Firebase not initialized.' });

    const { title = 'Udaan BillBook', body = 'Test from Dashboard!' } = req.body;

    const users = await User.find({
      $or: [{ fcmTokens: { $exists: true, $not: { $size: 0 } } }, { fcmTokenMobile: { $exists: true, $not: { $size: 0 } } }]
    }, 'fcmTokens fcmTokenMobile');

    const allTokens = [];
    users.forEach(u => {
      (u.fcmTokens || []).forEach(t => t && allTokens.push(t));
      (u.fcmTokenMobile || []).forEach(t => t && allTokens.push(t));
    });

    const uniqueTokens = [...new Set(allTokens)];
    if (!uniqueTokens.length) {
      return res.json({ successCount: 0, failureCount: 0, message: 'No subscribers found.' });
    }

    const response = await messaging.sendEachForMulticast({
      tokens: uniqueTokens,
      notification: { title, body },
      webpush: { notification: { icon: '/udaan-logo-removebg-preview.png' } }
    });

    res.json({ successCount: response.successCount, failureCount: response.failureCount });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/notifications/send-to-user  [ADMIN]
// Body: { userId, title, body, data? }
// ─────────────────────────────────────────────────────────────────────────────
const sendNotificationToUser = async (req, res) => {
  try {
    const { userId, title = 'Udaan BillBook', body = 'New Notification', data } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId is required.' });

    const result = await notificationService.sendNotificationToUser(userId, {
      title, body, data: data || { type: 'admin_message', id: Date.now().toString() }
    });

    res.json(result);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/notifications/broadcast  [ADMIN]
// Body: { title, body, data? }
// ─────────────────────────────────────────────────────────────────────────────
const broadcastNotification = async (req, res) => {
  try {
    const { title = 'Udaan BillBook', body = 'New Announcement!', data } = req.body;

    const users = await User.find({}, '_id');
    const userIds = users.map(u => u._id.toString());

    const results = await notificationService.sendNotificationToMultipleUsers(userIds, {
      title, body, data: data || { type: 'broadcast', id: Date.now().toString() }
    });

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    res.json({ message: 'Broadcast complete', successCount, failureCount, total: userIds.length });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/notifications/subscribers  [ADMIN]
// ─────────────────────────────────────────────────────────────────────────────
const getSubscribers = async (req, res) => {
  try {
    const subscribers = await User.find(
      { $or: [{ fcmTokens: { $exists: true, $not: { $size: 0 } } }, { fcmTokenMobile: { $exists: true, $not: { $size: 0 } } }] },
      'name phone email businessName subscription.plan fcmTokens fcmTokenMobile createdAt'
    );
    res.json({ total: subscribers.length, subscribers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  registerToken,
  removeToken,
  verifyToken,
  sendSelfNotification,
  testBroadcast,
  sendNotificationToUser,
  broadcastNotification,
  getSubscribers,
};

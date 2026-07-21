const admin = require('../config/firebase');
const User = require('../models/User');

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/notifications/register-token
// Body: { fcmToken: "xyz..." }
// Auth: Bearer (any logged-in user)
// Purpose: Browser/App se FCM token save karo DB mein
// ─────────────────────────────────────────────────────────────────────────────
const registerToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) {
      return res.status(400).json({ message: 'fcmToken is required in body.' });
    }

    await User.findByIdAndUpdate(req.user._id, { fcmToken });
    res.json({ message: 'FCM token registered successfully.', userId: req.user._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/notifications/register-token
// Auth: Bearer
// Purpose: Logout pe token remove karo (unsubscribe)
// ─────────────────────────────────────────────────────────────────────────────
const removeToken = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { fcmToken: null });
    res.json({ message: 'FCM token removed.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/notifications/send-self
// Body: { title, body, imageUrl? }
// Auth: Bearer
// Purpose: Apne aap ko test notification bhejo (verify FCM working)
// ─────────────────────────────────────────────────────────────────────────────
const sendSelfNotification = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user.fcmToken) {
      return res.status(400).json({
        message: 'No FCM token registered for your account. First call POST /api/notifications/register-token with your FCM token.'
      });
    }

    const { title = 'Udaan BillBook', body = 'Test Notification!', imageUrl } = req.body;

    const message = {
      token: user.fcmToken,
      notification: { title, body, ...(imageUrl && { imageUrl }) },
      android: { priority: 'high' },
      apns: { payload: { aps: { sound: 'default' } } },
      webpush: {
        notification: { title, body, icon: '/logo.png' },
        fcmOptions: { link: 'http://localhost:5173' }
      }
    };

    const response = await admin.messaging().send(message);
    res.json({ message: 'Notification sent successfully!', messageId: response });
  } catch (err) {
    console.error('FCM send-self error:', err);
    if (err.code === 'messaging/registration-token-not-registered') {
      await User.findByIdAndUpdate(req.user._id, { fcmToken: null });
      return res.status(410).json({ message: 'FCM token expired or invalid. Please re-register your token.' });
    }
    res.status(500).json({ message: err.message, code: err.code });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/notifications/send-to-user  [ADMIN ONLY]
// Body: { userId, title, body, imageUrl? }
// Auth: Bearer (Admin)
// Purpose: Admin ek specific user ko notification bheje
// ─────────────────────────────────────────────────────────────────────────────
const sendNotificationToUser = async (req, res) => {
  try {
    const { userId, title = 'Udaan BillBook', body = 'New Notification', imageUrl } = req.body;

    if (!userId) return res.status(400).json({ message: 'userId is required.' });

    const targetUser = await User.findById(userId);
    if (!targetUser) return res.status(404).json({ message: 'User not found.' });

    if (!targetUser.fcmToken) {
      return res.status(400).json({ message: `User ${targetUser.name || targetUser.phone} has no FCM token registered.` });
    }

    const message = {
      token: targetUser.fcmToken,
      notification: { title, body, ...(imageUrl && { imageUrl }) },
      android: { priority: 'high' },
      webpush: {
        notification: { title, body, icon: '/logo.png' }
      }
    };

    const response = await admin.messaging().send(message);
    res.json({
      message: `Notification sent to ${targetUser.name || targetUser.phone}`,
      messageId: response
    });
  } catch (err) {
    console.error('FCM send-to-user error:', err);
    if (err.code === 'messaging/registration-token-not-registered') {
      return res.status(410).json({ message: 'FCM token for this user is expired or invalid.' });
    }
    res.status(500).json({ message: err.message, code: err.code });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/notifications/broadcast  [ADMIN ONLY]
// Body: { title, body, imageUrl? }
// Auth: Bearer (Admin)
// Purpose: Sab registered users ko ek saath notification bhejo
// ─────────────────────────────────────────────────────────────────────────────
const broadcastNotification = async (req, res) => {
  try {
    const { title = 'Udaan BillBook', body = 'New Announcement!', imageUrl } = req.body;

    const users = await User.find({ fcmToken: { $ne: null } }, 'name phone fcmToken');
    if (users.length === 0) {
      return res.status(400).json({ message: 'No users with FCM tokens found. Ask users to register their token first.' });
    }

    const tokens = users.map(u => u.fcmToken);

    const multicastMessage = {
      tokens,
      notification: { title, body, ...(imageUrl && { imageUrl }) },
      android: { priority: 'high' },
      webpush: {
        notification: { title, body, icon: '/logo.png' }
      }
    };

    const response = await admin.messaging().sendEachForMulticast(multicastMessage);

    // Clean up invalid tokens
    const expiredTokens = [];
    response.responses.forEach((r, idx) => {
      if (!r.success && r.error?.code === 'messaging/registration-token-not-registered') {
        expiredTokens.push(users[idx]._id);
      }
    });
    if (expiredTokens.length > 0) {
      await User.updateMany({ _id: { $in: expiredTokens } }, { fcmToken: null });
    }

    res.json({
      message: 'Broadcast complete',
      totalTargeted: tokens.length,
      successCount: response.successCount,
      failureCount: response.failureCount,
      expiredTokensCleaned: expiredTokens.length
    });
  } catch (err) {
    console.error('FCM broadcast error:', err);
    res.status(500).json({ message: err.message, code: err.code });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/notifications/subscribers  [ADMIN ONLY]
// Auth: Bearer (Admin)
// Purpose: Dekho kitne users ke paas FCM token registered hai
// ─────────────────────────────────────────────────────────────────────────────
const getSubscribers = async (req, res) => {
  try {
    const subscribers = await User.find(
      { fcmToken: { $ne: null } },
      'name phone email businessName subscription.plan createdAt'
    );
    res.json({ total: subscribers.length, subscribers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/notifications/verify-token
// Body: { fcmToken: "xyz..." }
// Auth: Bearer
// Purpose: Postman pe kisi bhi FCM token ko dry-run se verify karo
// ─────────────────────────────────────────────────────────────────────────────
const verifyToken = async (req, res) => {
  try {
    const { fcmToken } = req.body;
    if (!fcmToken) return res.status(400).json({ message: 'fcmToken is required.' });

    // Dry-run: Firebase validates token without actually sending
    const message = {
      token: fcmToken,
      notification: { title: 'Verify', body: 'Token check' }
    };

    await admin.messaging().send(message, true); // true = dry run
    res.json({ valid: true, message: 'FCM token is valid and reachable!' });
  } catch (err) {
    if (err.code === 'messaging/registration-token-not-registered') {
      return res.status(400).json({ valid: false, message: 'Token is invalid or device unregistered.', code: err.code });
    }
    if (err.code === 'messaging/invalid-registration-token') {
      return res.status(400).json({ valid: false, message: 'Token format is invalid.', code: err.code });
    }
    res.status(500).json({ valid: false, message: err.message, code: err.code });
  }
};

module.exports = {
  registerToken,
  removeToken,
  sendSelfNotification,
  sendNotificationToUser,
  broadcastNotification,
  getSubscribers,
  verifyToken
};

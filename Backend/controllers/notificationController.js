const User = require('../models/User');
const { sendNotificationToUser } = require('../services/notificationService');

/**
 * Save FCM token for the authenticated user
 * POST /api/notifications/save-token
 * Body: { token: string, platform: 'web' | 'mobile' }
 */
const saveToken = async (req, res) => {
  try {
    const { token, platform = 'web' } = req.body;
    const userId = req.user._id;

    if (!token) {
      return res.status(400).json({ message: 'FCM token is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const field = platform === 'mobile' ? 'fcmTokenMobile' : 'fcmTokens';

    // Initialize array if not exists
    if (!user[field]) {
      user[field] = [];
    }

    // Check if token already exists (avoid duplicates)
    if (user[field].includes(token)) {
      return res.status(200).json({ message: 'Token already registered', tokenCount: user[field].length });
    }

    // Add token, keeping max 10 per platform
    user[field].push(token);
    if (user[field].length > 10) {
      user[field] = user[field].slice(-10); // Keep the 10 most recent
    }

    await user.save();

    console.log(`✅ FCM token saved for user ${userId} (${platform}), total: ${user[field].length}`);
    res.status(200).json({
      message: 'Token saved successfully',
      platform,
      tokenCount: user[field].length,
    });
  } catch (error) {
    console.error('❌ Save token error:', error.message);
    res.status(500).json({ message: 'Failed to save token', error: error.message });
  }
};

/**
 * Remove FCM token (e.g., on logout)
 * DELETE /api/notifications/remove-token
 * Body: { token: string }
 */
const removeToken = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user._id;

    if (!token) {
      return res.status(400).json({ message: 'FCM token is required' });
    }

    await User.findByIdAndUpdate(userId, {
      $pull: {
        fcmTokens: token,
        fcmTokenMobile: token,
      },
    });

    console.log(`🗑️ FCM token removed for user ${userId}`);
    res.status(200).json({ message: 'Token removed successfully' });
  } catch (error) {
    console.error('❌ Remove token error:', error.message);
    res.status(500).json({ message: 'Failed to remove token', error: error.message });
  }
};

/**
 * Send a test notification to the authenticated user
 * POST /api/notifications/test
 */
const testNotification = async (req, res) => {
  try {
    const userId = req.user._id;
    const { title, body } = req.body;

    const result = await sendNotificationToUser(userId, {
      title: title || '🔔 Test Notification',
      body: body || 'Push notifications are working! — Udaan BillBook',
      data: {
        type: 'test',
        id: Date.now().toString(),
        link: '/vendor/dashboard',
      },
    });

    if (result.success) {
      res.status(200).json({
        message: 'Test notification sent successfully',
        ...result,
      });
    } else {
      res.status(400).json({
        message: 'Failed to send test notification',
        reason: result.reason,
      });
    }
  } catch (error) {
    console.error('❌ Test notification error:', error.message);
    res.status(500).json({ message: 'Failed to send test notification', error: error.message });
  }
};

/**
 * Get notification history for the authenticated user
 * GET /api/notifications/history
 */
const getNotificationHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const NotificationLog = require('../models/NotificationLog');

    const notifications = await NotificationLog.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .select('notificationId title body type status createdAt');

    res.status(200).json({ notifications });
  } catch (error) {
    console.error('❌ Get notification history error:', error.message);
    res.status(500).json({ message: 'Failed to get notification history', error: error.message });
  }
};

module.exports = {
  saveToken,
  removeToken,
  testNotification,
  getNotificationHistory,
};

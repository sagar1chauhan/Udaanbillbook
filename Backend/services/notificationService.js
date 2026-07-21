const { messaging } = require('../config/firebase');
const NotificationLog = require('../models/NotificationLog');
const User = require('../models/User');

/**
 * Send a push notification to a specific user (all their devices).
 * Includes 3-layer duplicate prevention.
 *
 * @param {string} userId - The user's MongoDB _id
 * @param {object} payload - Notification payload
 * @param {string} payload.title - Notification title
 * @param {string} payload.body - Notification body
 * @param {object} [payload.data] - Additional data (type, id, link, etc.)
 */
async function sendNotificationToUser(userId, payload) {
  try {
    // Generate a unique notification ID for dedup
    const type = payload.data?.type || 'general';
    const entityId = payload.data?.id || Date.now().toString();
    const notificationId = `${userId}_${type}_${entityId}`;

    // Layer 1: Check if notification was already sent (DB lookup)
    const exists = await NotificationLog.findOne({ notificationId });
    if (exists) {
      console.log(`⏭️ Notification already sent: ${notificationId}`);
      return { success: false, reason: 'duplicate' };
    }

    // Get user's FCM tokens
    const user = await User.findById(userId);
    if (!user) {
      console.error(`❌ User not found: ${userId}`);
      return { success: false, reason: 'user_not_found' };
    }

    // Merge web + mobile tokens and deduplicate
    let tokens = [
      ...(user.fcmTokens || []),
      ...(user.fcmTokenMobile || []),
    ];
    tokens = [...new Set(tokens)].filter(Boolean);

    if (!tokens.length) {
      console.log(`⚠️ No FCM tokens found for user: ${userId}`);
      return { success: false, reason: 'no_tokens' };
    }

    // Prepare the FCM message
    // IMPORTANT: Include title/body in data field too, because in foreground
    // mode the 'notification' field may be consumed by the SDK
    const message = {
      tokens,
      notification: {
        title: payload.title,
        body: payload.body,
      },
      data: {
        ...(payload.data || {}),
        notificationId,
        title: payload.title || '',
        body: payload.body || '',
        click_action: payload.data?.link || '/',
      },
      webpush: {
        fcmOptions: {
          link: payload.data?.link || '/',
        },
        notification: {
          icon: '/udaan-logo-removebg-preview.png',
          badge: '/udaan-logo-removebg-preview.png',
        },
      },
    };

    // Send via FCM
    const response = await messaging.sendEachForMulticast(message);

    // Handle invalid/expired tokens — remove them from user
    const invalidTokens = [];
    response.responses.forEach((resp, idx) => {
      if (!resp.success) {
        const errorCode = resp.error?.code;
        if (
          errorCode === 'messaging/invalid-registration-token' ||
          errorCode === 'messaging/registration-token-not-registered'
        ) {
          invalidTokens.push(tokens[idx]);
        }
        console.error(`❌ FCM send error for token ${idx}:`, resp.error?.message);
      }
    });

    // Clean up invalid tokens from user document
    if (invalidTokens.length > 0) {
      await User.findByIdAndUpdate(userId, {
        $pull: {
          fcmTokens: { $in: invalidTokens },
          fcmTokenMobile: { $in: invalidTokens },
        },
      });
      console.log(`🧹 Removed ${invalidTokens.length} invalid token(s) for user: ${userId}`);
    }

    // Layer 2: Save to NotificationLog (unique constraint prevents duplicates)
    const status = response.failureCount === 0
      ? 'sent'
      : response.successCount === 0
        ? 'failed'
        : 'partial';

    try {
      await NotificationLog.create({
        notificationId,
        userId,
        tokens,
        title: payload.title,
        body: payload.body,
        type,
        data: payload.data,
        status,
      });
    } catch (logErr) {
      // If duplicate key error, it means another request already logged it
      if (logErr.code === 11000) {
        console.log(`⏭️ Notification log duplicate (race condition handled): ${notificationId}`);
      } else {
        console.error('❌ Failed to save notification log:', logErr.message);
      }
    }

    console.log(`✅ Notification sent: ${notificationId} (success: ${response.successCount}, failed: ${response.failureCount})`);

    return {
      success: true,
      notificationId,
      successCount: response.successCount,
      failureCount: response.failureCount,
    };
  } catch (error) {
    console.error('❌ sendNotificationToUser error:', error.message);
    return { success: false, reason: 'error', error: error.message };
  }
}

/**
 * Send notification to multiple users
 * @param {string[]} userIds - Array of user MongoDB _ids
 * @param {object} payload - Same as sendNotificationToUser payload
 */
async function sendNotificationToMultipleUsers(userIds, payload) {
  const results = await Promise.allSettled(
    userIds.map((uid) => sendNotificationToUser(uid, payload))
  );
  return results.map((r, i) => ({
    userId: userIds[i],
    ...(r.status === 'fulfilled' ? r.value : { success: false, reason: 'error', error: r.reason?.message }),
  }));
}

module.exports = {
  sendNotificationToUser,
  sendNotificationToMultipleUsers,
};

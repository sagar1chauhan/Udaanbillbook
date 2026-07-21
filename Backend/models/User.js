const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
  },
  password: {
    type: String,
  },
  businessName: {
    type: String,
  },
  businessAddress: {
    type: String,
  },
  businessType: {
    type: String,
  },
  otp: {
    type: String,
  },
  otpExpires: {
    type: Date,
  },
  lastLogin: {
    type: Date,
  },
  device: {
    type: String,
  },
  role: {
    type: String,
    enum: ['user', 'vendor', 'admin', 'staff'],
    default: 'vendor'
  },
  status: {
    type: String,
    enum: ['Active', 'Banned'],
    default: 'Active'
  },
  permissions: [{
    type: String
  }],
  showAds: {
    type: Boolean,
    default: false
  },
  billLimit: {
    type: Number,
    default: -1
  },
  billsGenerated: {
    type: Number,
    default: 0
  },
  fcmTokens: [{
    type: String,
  }],
  fcmTokenMobile: [{
    type: String,
  }],
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  subscription: {
    plan: {
      type: String,
      default: 'Free'
    },
    status: {
      type: String,
      default: 'active'
    },
    validUntil: {
      type: Date
    }
  },
  // FCM push notification token from client device/browser
  fcmToken: {
    type: String,
    default: null
  },
  // Web-push VAPID subscription (legacy, kept for backward compat)
  pushSubscription: {
    endpoint: { type: String },
    keys: {
      p256dh: { type: String },
      auth: { type: String }
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);

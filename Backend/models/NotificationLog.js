const mongoose = require('mongoose');

const notificationLogSchema = new mongoose.Schema({
  notificationId: {
    type: String,
    unique: true,
    required: true,
    index: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  tokens: [{
    type: String,
  }],
  title: {
    type: String,
  },
  body: {
    type: String,
  },
  type: {
    type: String,
  },
  data: {
    type: mongoose.Schema.Types.Mixed,
  },
  status: {
    type: String,
    enum: ['sent', 'failed', 'partial'],
    default: 'sent',
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 86400, // Auto-delete after 24 hours (TTL index)
  },
});

module.exports = mongoose.model('NotificationLog', notificationLogSchema);

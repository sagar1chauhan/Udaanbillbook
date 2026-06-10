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
  role: {
    type: String,
    enum: ['user', 'vendor', 'admin'],
    default: 'vendor'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);

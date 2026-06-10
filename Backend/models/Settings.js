const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
    unique: true, // One settings document per user
  },
  gstSettings: {
    enableGst: { type: Boolean, default: true },
    enableHsn: { type: Boolean, default: true },
    cessOnItem: { type: Boolean, default: false },
    reverseCharge: { type: Boolean, default: false },
    placeOfSupply: { type: Boolean, default: true },
  },
  printSettings: {
    themeName: { type: String, default: 'Advanced' },
    themeColor: { type: String, default: '#a855f7' },
    printCompanyName: { type: Boolean, default: true },
    printCompanyLogo: { type: Boolean, default: false },
    extraSpaceTop: { type: Number, default: 0 },
    printCompanyAddress: { type: Boolean, default: true },
    printMobile: { type: Boolean, default: true },
  },
  invoiceSettings: {
    prefix: { type: String, default: 'INV-' },
    nextNumber: { type: Number, default: 1 },
    termsAndConditions: { type: String, default: 'Thanks for doing business with us!' },
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Settings', settingsSchema);

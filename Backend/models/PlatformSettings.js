const mongoose = require('mongoose');

const platformSettingsSchema = new mongoose.Schema({
  platformName: { type: String, default: "Udaan My BillBook" },
  platformUrl: { type: String, default: "https://udaan.mybillbook.com" },
  supportEmail: { type: String, default: "support@udaan.com" },
  maintenance: { type: Boolean, default: false },
  smtpHost: { type: String, default: "smtp.gmail.com" },
  smtpPort: { type: String, default: "587" },
  senderEmail: { type: String, default: "noreply@udaan.com" },
  emailEnabled: { type: Boolean, default: true },
  gateway: { type: String, default: "Razorpay" },
  gatewayKey: { type: String, default: "rzp_live_xxxxxxxxxxxx" },
  webhook: { type: String, default: "https://api.udaan.com/webhooks/razorpay" },
  testMode: { type: Boolean, default: false },
  businessTypes: {
    type: [String],
    default: [
      "Retail Shop",
      "Wholesale / Distribution",
      "Manufacturing",
      "Services",
      "Restaurant / Cafe",
      "Other"
    ]
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PlatformSettings', platformSettingsSchema);

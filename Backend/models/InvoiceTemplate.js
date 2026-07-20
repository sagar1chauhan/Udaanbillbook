const mongoose = require('mongoose');

const invoiceTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  componentKey: {
    type: String,
    required: true,
    trim: true
  },
  planTier: {
    type: String,
    enum: ['Free', 'Silver', 'Gold', 'Enterprise'],
    default: 'Free'
  },
  previewColor: {
    type: String,
    default: 'bg-slate-800'
  },
  previewStyle: {
    type: String,
    enum: ['boxed', 'header-bar', 'minimal', 'double-border', 'center-header'],
    default: 'header-bar'
  },
  isCustom: {
    type: Boolean,
    default: false
  },
  customHtml: {
    type: String,
    default: ''
  },
  isActive: {
    type: Boolean,
    default: true
  },
  sortOrder: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('InvoiceTemplate', invoiceTemplateSchema);

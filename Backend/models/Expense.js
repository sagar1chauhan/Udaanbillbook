const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  category: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  paymentMode: {
    type: String,
    enum: ['Cash', 'Bank', 'UPI', 'Cheque', 'Other'],
    default: 'Cash',
  },
  referenceNumber: {
    type: String,
  },
  description: {
    type: String,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Expense', expenseSchema);

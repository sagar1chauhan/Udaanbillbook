const mongoose = require('mongoose');

const expenseCategorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  name: {
    type: String,
    required: true,
  }
}, {
  timestamps: true
});

// Ensure uniqueness of expense category name per user
expenseCategorySchema.index({ user: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('ExpenseCategory', expenseCategorySchema);

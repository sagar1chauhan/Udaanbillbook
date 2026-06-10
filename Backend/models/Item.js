const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  name: {
    type: String,
    required: true,
  },
  itemCode: {
    type: String,
  },
  hsnSac: {
    type: String,
  },
  category: {
    type: String,
  },
  unit: {
    type: String,
    default: 'PCS',
  },
  salePrice: {
    type: Number,
    required: true,
    default: 0,
  },
  purchasePrice: {
    type: Number,
    required: true,
    default: 0,
  },
  taxRate: {
    type: Number,
    default: 0, // e.g. 18 for 18% GST
  },
  stockQty: {
    type: Number,
    default: 0,
  },
  lowStockWarning: {
    type: Number,
    default: 0,
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Item', itemSchema);

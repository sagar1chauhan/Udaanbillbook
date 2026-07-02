const Item = require('../models/Item');

// @desc    Get all items for the user
// @route   GET /api/items
// @access  Private
const getItems = async (req, res) => {
  try {
    const ownerId = req.user.role === 'staff' ? req.user.ownerId : req.user.id;

    const items = await Item.find({ user: ownerId }).sort({ createdAt: -1 });
    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new item
// @route   POST /api/items
// @access  Private
const createItem = async (req, res) => {
  try {
    const ownerId = req.user.role === 'staff' ? req.user.ownerId : req.user.id;

    const { name, itemCode, hsnSac, category, unit, salePrice, purchasePrice, taxRate, stockQty, lowStockWarning, batchNumber, expiryDate } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Item name is required' });
    }

    const item = await Item.create({
      user: ownerId,
      name,
      itemCode,
      hsnSac,
      category,
      unit,
      salePrice,
      purchasePrice,
      taxRate,
      stockQty,
      lowStockWarning,
      batchNumber,
      expiryDate
    });

    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update an item
// @route   PUT /api/items/:id
// @access  Private
const updateItem = async (req, res) => {
  try {
    const ownerId = req.user.role === 'staff' ? req.user.ownerId : req.user.id;

    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.user.toString() !== ownerId) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    const updatedItem = await Item.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json(updatedItem);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an item
// @route   DELETE /api/items/:id
// @access  Private
const deleteItem = async (req, res) => {
  try {
    const ownerId = req.user.role === 'staff' ? req.user.ownerId : req.user.id;

    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.user.toString() !== ownerId) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await item.deleteOne();
    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Bulk create items
// @route   POST /api/items/bulk
// @access  Private
const bulkCreateItems = async (req, res) => {
  try {
    const ownerId = req.user.role === 'staff' ? req.user.ownerId : req.user.id;

    const { items } = req.body;
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ message: 'Items array is required' });
    }

    const preparedItems = items.map(item => ({
      user: ownerId,
      name: item.name,
      itemCode: item.itemCode || `SKU-${Math.floor(100 + Math.random() * 900)}`,
      category: item.category || 'General',
      unit: item.unit || 'PCS',
      salePrice: item.salePrice || 0,
      purchasePrice: item.purchasePrice || 0,
      taxRate: item.taxRate || 0,
      stockQty: item.stockQty || 0,
      lowStockWarning: item.lowStockWarning || 10,
      batchNumber: item.batchNumber,
      expiryDate: item.expiryDate
    }));

    const insertedItems = await Item.insertMany(preparedItems);
    res.status(201).json(insertedItems);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getItems,
  createItem,
  updateItem,
  deleteItem,
  bulkCreateItems
};

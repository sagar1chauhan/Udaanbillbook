const Item = require('../models/Item');

// @desc    Get all items for the user
// @route   GET /api/items
// @access  Private
const getItems = async (req, res) => {
  try {
    const items = await Item.find({ user: req.user.id }).sort({ createdAt: -1 });
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
    const { name, itemCode, hsnSac, category, unit, salePrice, purchasePrice, taxRate, stockQty, lowStockWarning } = req.body;

    if (!name) {
      return res.status(400).json({ message: 'Item name is required' });
    }

    const item = await Item.create({
      user: req.user.id,
      name,
      itemCode,
      hsnSac,
      category,
      unit,
      salePrice,
      purchasePrice,
      taxRate,
      stockQty,
      lowStockWarning
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
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.user.toString() !== req.user.id) {
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
    const item = await Item.findById(req.params.id);

    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }

    if (item.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await item.deleteOne();
    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getItems,
  createItem,
  updateItem,
  deleteItem
};

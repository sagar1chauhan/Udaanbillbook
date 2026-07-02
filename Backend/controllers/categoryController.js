const Category = require('../models/Category');

// @desc    Get all categories for authenticated user
// @route   GET /api/categories
// @access  Private
const getCategories = async (req, res) => {
  try {
    let categories = await Category.find({ user: req.user.id }).sort({ name: 1 });
    
    // Seed default categories if none exist for user
    if (categories.length === 0) {
      const defaults = ['Grocery', 'Bakery', 'Dairy', 'Packaged'];
      const promises = defaults.map(name => 
        Category.create({ user: req.user.id, name })
      );
      await Promise.all(promises);
      categories = await Category.find({ user: req.user.id }).sort({ name: 1 });
    }

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new category
// @route   POST /api/categories
// @access  Private
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const trimmedName = name.trim();

    // Check if category already exists for this user
    const exists = await Category.findOne({ user: req.user.id, name: { $regex: new RegExp(`^${trimmedName}$`, 'i') } });
    if (exists) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await Category.create({
      user: req.user.id,
      name: trimmedName
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCategories,
  createCategory
};

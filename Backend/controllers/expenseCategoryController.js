const ExpenseCategory = require('../models/ExpenseCategory');

// @desc    Get all expense categories for authenticated user
// @route   GET /api/expense-categories
// @access  Private
const getExpenseCategories = async (req, res) => {
  try {
    let categories = await ExpenseCategory.find({ user: req.user.id }).sort({ name: 1 });
    
    // Seed default categories if none exist for user
    if (categories.length === 0) {
      const defaults = ['Fuel', 'Utilities', 'Logistics', 'Supplies', 'Payroll'];
      const promises = defaults.map(name => 
        ExpenseCategory.create({ user: req.user.id, name })
      );
      await Promise.all(promises);
      categories = await ExpenseCategory.find({ user: req.user.id }).sort({ name: 1 });
    }

    res.status(200).json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new expense category
// @route   POST /api/expense-categories
// @access  Private
const createExpenseCategory = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ message: 'Category name is required' });
    }

    const trimmedName = name.trim();

    // Check if category already exists for this user
    const exists = await ExpenseCategory.findOne({ 
      user: req.user.id, 
      name: { $regex: new RegExp(`^${trimmedName}$`, 'i') } 
    });
    if (exists) {
      return res.status(400).json({ message: 'Category already exists' });
    }

    const category = await ExpenseCategory.create({
      user: req.user.id,
      name: trimmedName
    });

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getExpenseCategories,
  createExpenseCategory
};

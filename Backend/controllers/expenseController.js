const Expense = require('../models/Expense');

// @desc    Get all expenses
// @route   GET /api/expenses
// @access  Private
const getExpenses = async (req, res) => {
  try {
    const ownerId = req.user.role === 'staff' ? req.user.ownerId : req.user.id;

    const expenses = await Expense.find({ user: ownerId }).sort({ date: -1 });
    res.status(200).json(expenses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create an expense
// @route   POST /api/expenses
// @access  Private
const createExpense = async (req, res) => {
  try {
    const ownerId = req.user.role === 'staff' ? req.user.ownerId : req.user.id;

    const { category, amount, date, paymentMode, referenceNumber, description } = req.body;

    if (!category || !amount) {
      return res.status(400).json({ message: 'Category and amount are required' });
    }

    const expense = await Expense.create({
      user: ownerId,
      category,
      amount,
      date,
      paymentMode,
      referenceNumber,
      description
    });

    res.status(201).json(expense);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getExpenses,
  createExpense
};

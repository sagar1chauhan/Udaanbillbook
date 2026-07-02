const express = require('express');
const router = express.Router();
const { getExpenses, createExpense } = require('../controllers/expenseController');
const { protect, requirePermission } = require('../middleware/authMiddleware');

router.route('/').get(protect, getExpenses).post(protect, requirePermission('manage_expenses'), createExpense);

module.exports = router;

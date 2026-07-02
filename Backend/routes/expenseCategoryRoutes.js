const express = require('express');
const router = express.Router();
const { getExpenseCategories, createExpenseCategory } = require('../controllers/expenseCategoryController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getExpenseCategories).post(protect, createExpenseCategory);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getPayments, createPayment } = require('../controllers/paymentController');
const { protect, requirePermission } = require('../middleware/authMiddleware');

router.route('/').get(protect, getPayments).post(protect, requirePermission('manage_payments'), createPayment);

module.exports = router;

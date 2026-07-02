const express = require('express');
const router = express.Router();
const { getInvoices, createInvoice, getInvoiceById, deleteInvoice } = require('../controllers/invoiceController');
const { protect, requirePermission } = require('../middleware/authMiddleware');

router.route('/').get(protect, getInvoices).post(protect, requirePermission('create_invoice'), createInvoice);
router.route('/:id').get(protect, getInvoiceById).delete(protect, requirePermission('create_invoice'), deleteInvoice);

module.exports = router;

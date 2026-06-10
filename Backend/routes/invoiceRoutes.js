const express = require('express');
const router = express.Router();
const { getInvoices, createInvoice, getInvoiceById, deleteInvoice } = require('../controllers/invoiceController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getInvoices).post(protect, createInvoice);
router.route('/:id').get(protect, getInvoiceById).delete(protect, deleteInvoice);

module.exports = router;

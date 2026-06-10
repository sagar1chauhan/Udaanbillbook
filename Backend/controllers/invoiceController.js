const Invoice = require('../models/Invoice');
const Party = require('../models/Party');
const Item = require('../models/Item');

// @desc    Get all invoices for user
// @route   GET /api/invoices
// @access  Private
const getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ user: req.user.id })
      .populate('party', 'name phone')
      .sort({ createdAt: -1 });
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new invoice
// @route   POST /api/invoices
// @access  Private
const createInvoice = async (req, res) => {
  try {
    const { 
      invoiceNumber, party, partyName, type, date, items, 
      subtotal, discountAmount, taxableAmount, gstAmount, 
      roundOff, grandTotal, status, receivedAmount 
    } = req.body;

    if (!invoiceNumber || !type || !items || items.length === 0) {
      return res.status(400).json({ message: 'Missing required fields or items' });
    }

    const invoice = await Invoice.create({
      user: req.user.id,
      invoiceNumber,
      party,
      partyName,
      type,
      date,
      items,
      subtotal,
      discountAmount,
      taxableAmount,
      gstAmount,
      roundOff,
      grandTotal,
      status,
      receivedAmount
    });

    // TODO: Add logic to update Item stock and Party balance

    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single invoice by ID
// @route   GET /api/invoices/:id
// @access  Private
const getInvoiceById = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('party');
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (invoice.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    res.status(200).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete an invoice
// @route   DELETE /api/invoices/:id
// @access  Private
const deleteInvoice = async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (invoice.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await invoice.deleteOne();
    
    // TODO: Revert Item stock and Party balance changes

    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getInvoices,
  createInvoice,
  getInvoiceById,
  deleteInvoice
};

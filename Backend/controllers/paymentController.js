const Payment = require('../models/Payment');
const Party = require('../models/Party');
const Invoice = require('../models/Invoice');

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private
const getPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ user: req.user.id })
      .populate('party', 'name phone')
      .sort({ date: -1 });
    res.status(200).json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a payment
// @route   POST /api/payments
// @access  Private
const createPayment = async (req, res) => {
  try {
    const { party, partyName, type, amount, paymentMode, date, referenceNumber, description, associatedInvoices } = req.body;

    if (!type || !amount) {
      return res.status(400).json({ message: 'Type and amount are required' });
    }

    const payment = await Payment.create({
      user: req.user.id,
      party,
      partyName,
      type,
      amount,
      paymentMode,
      date,
      referenceNumber,
      description,
      associatedInvoices
    });

    // TODO: Update associated invoices status and Party balance based on payment

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getPayments,
  createPayment
};

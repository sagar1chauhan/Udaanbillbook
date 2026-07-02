const Invoice = require('../models/Invoice');
const Party = require('../models/Party');
const Item = require('../models/Item');
const Payment = require('../models/Payment');

// @desc    Get all invoices for user
// @route   GET /api/invoices
// @access  Private
// @desc    Get all invoices for user
const getInvoices = async (req, res) => {
  try {
    const ownerId = req.user.role === 'staff' ? req.user.ownerId : req.user.id;

    const invoices = await Invoice.find({ user: ownerId })
      .populate('party', 'name phone')
      .sort({ createdAt: -1 });

    const SentInvoice = require('../models/SentInvoice');
    const sentInvoices = await SentInvoice.find({ user: req.user.id })
      .populate('party', 'name phone')
      .sort({ createdAt: -1 });

    const combined = [...invoices, ...sentInvoices].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.status(200).json(combined);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new invoice
// @route   POST /api/invoices
// @access  Private
const createInvoice = async (req, res) => {
  try {
    const ownerId = req.user.role === 'staff' ? req.user.ownerId : req.user.id;

    const { 
      invoiceNumber, party, partyName, type, date, items, 
      subtotal, discountAmount, taxableAmount, gstAmount, 
      roundOff, grandTotal, status, receivedAmount 
    } = req.body;

    if (!invoiceNumber || !type || !items || items.length === 0) {
      return res.status(400).json({ message: 'Missing required fields or items' });
    }

    const invoice = await Invoice.create({
      user: ownerId,
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

    // Update Item stock
    for (const item of items) {
      const dbItem = await Item.findById(item.item);
      if (dbItem) {
        if (type === 'Sale' || type === 'Delivery Challan' || type === 'Purchase Return' || type === 'Debit Note') {
          dbItem.stockQty -= item.qty;
        } else if (type === 'Purchase' || type === 'Sale Return' || type === 'Credit Note') {
          dbItem.stockQty += item.qty;
        }
        await dbItem.save();
      }
    }

    // Update Party balance
    if (party) {
      const dbParty = await Party.findById(party);
      if (dbParty) {
        let currentMathBalance = dbParty.balanceType === 'To Receive' ? dbParty.balance : -dbParty.balance;
        const netAmount = (grandTotal || 0) - (receivedAmount || 0);
        
        let amountChange = 0;
        if (type === 'Sale') {
          amountChange = netAmount;
        } else if (type === 'Purchase') {
          amountChange = -netAmount;
        } else if (type === 'Sale Return') {
          amountChange = -netAmount;
        } else if (type === 'Purchase Return') {
          amountChange = netAmount;
        }

        const newMathBalance = currentMathBalance + amountChange;
        dbParty.balance = Math.abs(newMathBalance);
        dbParty.balanceType = newMathBalance >= 0 ? 'To Receive' : 'To Pay';
        await dbParty.save();
      }
    }

    // Automatically create Payment record if receivedAmount > 0
    if (receivedAmount > 0 && party) {
       await Payment.create({
         user: ownerId,
         party: party,
         partyName: partyName,
         type: (type === 'Sale' || type === 'Purchase Return') ? 'Payment In' : 'Payment Out',
         amount: receivedAmount,
         paymentMode: 'Cash',
         date: date,
         referenceNumber: invoiceNumber,
         description: `Payment for Invoice ${invoiceNumber}`,
         associatedInvoices: [invoice._id]
       });
    }

    res.status(201).json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new sent invoice (saved in SentInvoice collection)
// @route   POST /api/invoices/send
// @access  Private
const createSentInvoice = async (req, res) => {
  try {
    const SentInvoice = require('../models/SentInvoice');
    const { 
      invoiceNumber, party, partyName, type, date, items, 
      subtotal, discountAmount, taxableAmount, gstAmount, 
      roundOff, grandTotal, status, receivedAmount 
    } = req.body;

    if (!invoiceNumber || !type || !items || items.length === 0) {
      return res.status(400).json({ message: 'Missing required fields or items' });
    }

    const sentInvoice = await SentInvoice.create({
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
      receivedAmount,
      isSent: true
    });

    res.status(201).json(sentInvoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single invoice by ID
// @route   GET /api/invoices/:id
// @access  Private
const getInvoiceById = async (req, res) => {
  try {
    const ownerId = req.user.role === 'staff' ? req.user.ownerId : req.user.id;

    const invoice = await Invoice.findById(req.params.id).populate('party');
    
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (invoice.user.toString() !== ownerId) {
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
    const ownerId = req.user.role === 'staff' ? req.user.ownerId : req.user.id;

    const invoice = await Invoice.findById(req.params.id);

    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }

    if (invoice.user.toString() !== ownerId) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await invoice.deleteOne();
    
    // Revert Item stock
    for (const item of invoice.items) {
      const dbItem = await Item.findById(item.item);
      if (dbItem) {
        if (invoice.type === 'Sale' || invoice.type === 'Delivery Challan' || invoice.type === 'Purchase Return' || invoice.type === 'Debit Note') {
          dbItem.stockQty += item.qty;
        } else if (invoice.type === 'Purchase' || invoice.type === 'Sale Return' || invoice.type === 'Credit Note') {
          dbItem.stockQty -= item.qty;
        }
        await dbItem.save();
      }
    }

    // Revert Party balance
    if (invoice.party) {
      const dbParty = await Party.findById(invoice.party);
      if (dbParty) {
        let currentMathBalance = dbParty.balanceType === 'To Receive' ? dbParty.balance : -dbParty.balance;
        const netAmount = (invoice.grandTotal || 0) - (invoice.receivedAmount || 0);
        
        let amountChange = 0;
        if (invoice.type === 'Sale') {
          amountChange = -netAmount;
        } else if (invoice.type === 'Purchase') {
          amountChange = netAmount;
        } else if (invoice.type === 'Sale Return') {
          amountChange = netAmount;
        } else if (invoice.type === 'Purchase Return') {
          amountChange = -netAmount;
        }

        const newMathBalance = currentMathBalance + amountChange;
        dbParty.balance = Math.abs(newMathBalance);
        dbParty.balanceType = newMathBalance >= 0 ? 'To Receive' : 'To Pay';
        await dbParty.save();
      }
    }

    // Revert Payment if it was auto-created
    if (invoice.receivedAmount > 0 && invoice.party) {
       await Payment.deleteMany({ referenceNumber: invoice.invoiceNumber });
    }

    res.status(200).json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getInvoices,
  createInvoice,
  createSentInvoice,
  getInvoiceById,
  deleteInvoice
};

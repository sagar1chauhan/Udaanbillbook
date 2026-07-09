require('dotenv').config();
const jwt = require('jsonwebtoken');
const axios = require('axios');

async function test() {
  // Generate a mock token for Sagar (user ID 6a4635af67aaddc3a6929fa1)
  const token = jwt.sign(
    { id: '6a4635af67aaddc3a6929fa1', role: 'staff' },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '1d' }
  );

  const payload = {
    invoiceNumber: "INV-" + Math.floor(1000 + Math.random() * 9000),
    party: null,
    partyName: "Walk-in Customer",
    type: "Sale",
    date: new Date().toISOString(),
    items: [
      {
        name: "Cap",
        hsnSac: "66",
        qty: 1,
        rate: 125,
        discount: 0,
        gst: 18
      }
    ],
    subtotal: 125,
    discountAmount: 0,
    taxableAmount: 105.93,
    gstAmount: 19.07,
    roundOff: 0,
    grandTotal: 125,
    status: "Paid",
    receivedAmount: 125,
    paymentMethod: "Cash",
    paymentDetails: {
      transactionId: "",
      utr: "",
      bankName: "",
      accountNumber: "",
      ifsc: ""
    }
  };

  try {
    const res = await axios.post('http://localhost:5000/api/invoices', payload, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    console.log('API Response status:', res.status);
    console.log('API Response data:', res.data);
  } catch (error) {
    if (error.response) {
      console.log('API Error status:', error.response.status);
      console.log('API Error data:', error.response.data);
    } else {
      console.error('Network/request error:', error.message);
    }
  }
}

test();

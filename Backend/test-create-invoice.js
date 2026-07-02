require('dotenv').config();
const connectDB = require('./config/db');
const { createInvoice } = require('./controllers/invoiceController');

async function test() {
  await connectDB();
  
  const req = {
    user: {
      id: '6a460f6d27dfba3d1c34b913', // Hp vendor ID from logs
      role: 'vendor'
    },
    body: {
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
    }
  };

  const res = {
    status: function(code) {
      console.log('Status code:', code);
      return this;
    },
    json: function(data) {
      console.log('Response JSON:', JSON.stringify(data, null, 2));
      process.exit(0);
    }
  };

  try {
    await createInvoice(req, res);
  } catch (error) {
    console.error('Caught error during createInvoice:', error);
    process.exit(1);
  }
}

test();

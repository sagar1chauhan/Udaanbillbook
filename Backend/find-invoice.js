require('dotenv').config();
const connectDB = require('./config/db');
const Invoice = require('./models/Invoice');
const SentInvoice = require('./models/SentInvoice');

async function test() {
  await connectDB();
  const inv = await Invoice.findOne({ invoiceNumber: 'INV-8523' });
  console.log('In main Invoice collection:', JSON.stringify(inv, null, 2));

  const sentInv = await SentInvoice.findOne({ invoiceNumber: 'INV-8523' });
  console.log('In SentInvoice collection:', JSON.stringify(sentInv, null, 2));
  process.exit(0);
}

test();

require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const InvoiceTemplate = require('./models/InvoiceTemplate');
const fs = require('fs');

connectDB().then(async () => {
  const template = await InvoiceTemplate.findOne({ name: 'E way bill' });
  if (template) {
    const html = fs.readFileSync('eway_bill_dynamic.html', 'utf8');
    template.customHtml = html;
    await template.save();
    console.log('Successfully updated E way bill template with dynamic placeholders.');
  } else {
    console.log('Template not found');
  }
  process.exit(0);
}).catch(console.error);

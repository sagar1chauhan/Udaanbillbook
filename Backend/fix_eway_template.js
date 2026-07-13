require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const InvoiceTemplate = require('./models/InvoiceTemplate');

connectDB().then(async () => {
  const template = await InvoiceTemplate.findOne({ name: 'E way bill' });
  if (template) {
    let html = template.customHtml;
    if (!html.includes('<style id="dynamic-theme">')) {
       html = '<style id="dynamic-theme"> .custom-html-template-wrapper td[style*="font-weight: bold"] { color: var(--theme-color) !important; border-color: var(--theme-color) !important; } .custom-html-template-wrapper table, .custom-html-template-wrapper td { border-color: var(--theme-color) !important; } </style>' + html;
       template.customHtml = html;
       await template.save();
       console.log('Updated E way bill template with dynamic theme styles.');
    } else {
       console.log('Already updated');
    }
  } else {
    console.log('Template not found');
  }
  process.exit(0);
}).catch(console.error);

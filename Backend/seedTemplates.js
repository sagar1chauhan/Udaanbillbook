/**
 * Seed script to populate InvoiceTemplate collection with the 10 existing hardcoded templates.
 * Run once: node seedTemplates.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const InvoiceTemplate = require('./models/InvoiceTemplate');

const templates = [
  {
    name: 'GST Boxed',
    description: 'Classic Tally Grid',
    componentKey: 'GSTBoxed',
    planTier: 'Free',
    previewColor: 'bg-slate-800',
    previewStyle: 'boxed',
    isActive: true,
    sortOrder: 1
  },
  {
    name: 'Classic White',
    description: 'Clean Minimal',
    componentKey: 'Classic',
    planTier: 'Free',
    previewColor: 'bg-slate-400',
    previewStyle: 'center-header',
    isActive: true,
    sortOrder: 2
  },
  {
    name: 'Modern Green',
    description: 'Emerald Solid',
    componentKey: 'Modern',
    planTier: 'Silver',
    previewColor: 'bg-emerald-600',
    previewStyle: 'header-bar',
    isActive: true,
    sortOrder: 3
  },
  {
    name: 'Stylish Blue',
    description: 'Navy Corporate',
    componentKey: 'Modern',
    planTier: 'Gold',
    previewColor: 'bg-slate-900',
    previewStyle: 'header-bar',
    isActive: true,
    sortOrder: 4
  },
  {
    name: 'Minimalist',
    description: 'Compact Mono',
    componentKey: 'Minimal',
    planTier: 'Gold',
    previewColor: 'bg-slate-400',
    previewStyle: 'minimal',
    isActive: true,
    sortOrder: 5
  },
  {
    name: 'Crimson Rose',
    description: 'Red Highlight',
    componentKey: 'Business',
    planTier: 'Gold',
    previewColor: 'bg-rose-600',
    previewStyle: 'header-bar',
    isActive: true,
    sortOrder: 6
  },
  {
    name: 'Warm Amber',
    description: 'Amber Gold',
    componentKey: 'Corporate',
    planTier: 'Enterprise',
    previewColor: 'bg-amber-500',
    previewStyle: 'header-bar',
    isActive: true,
    sortOrder: 7
  },
  {
    name: 'Royal Purple',
    description: 'Royal Violet',
    componentKey: 'Professional',
    planTier: 'Enterprise',
    previewColor: 'bg-purple-600',
    previewStyle: 'header-bar',
    isActive: true,
    sortOrder: 8
  },
  {
    name: 'Charcoal Dark',
    description: 'Sleek Dark',
    componentKey: 'Modern',
    planTier: 'Enterprise',
    previewColor: 'bg-slate-800',
    previewStyle: 'header-bar',
    isActive: true,
    sortOrder: 9
  },
  {
    name: 'Tally Classic',
    description: 'Retro Monochrome',
    componentKey: 'Retail',
    planTier: 'Enterprise',
    previewColor: 'bg-slate-700',
    previewStyle: 'double-border',
    isActive: true,
    sortOrder: 10
  }
];

async function seed() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Upsert each template (don't duplicate if already exists)
    for (const tpl of templates) {
      const existing = await InvoiceTemplate.findOne({ name: tpl.name });
      if (existing) {
        console.log(`Template "${tpl.name}" already exists, skipping.`);
      } else {
        await InvoiceTemplate.create(tpl);
        console.log(`Created template: "${tpl.name}"`);
      }
    }

    console.log('\nSeed complete!');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();

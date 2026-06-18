const Invoice = require('../models/Invoice');
const Expense = require('../models/Expense');
const Payment = require('../models/Payment');
const Item = require('../models/Item');
const Party = require('../models/Party');

const getDashboardSummary = async (userId) => {
  const currentDate = new Date();
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const startOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

  // 1. Sales metrics
  const salesResult = await Invoice.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId), type: 'Sale' } },
    { 
      $group: { 
        _id: null, 
        totalSales: { $sum: '$grandTotal' },
        invoiceCount: { $sum: 1 },
        todaySales: { 
          $sum: { 
            $cond: [ { $gte: ['$date', startOfDay] }, '$grandTotal', 0 ] 
          } 
        },
        monthSales: { 
          $sum: { 
            $cond: [ { $gte: ['$date', startOfMonth] }, '$grandTotal', 0 ] 
          } 
        }
      } 
    }
  ]);

  // 2. Purchases
  const purchaseResult = await Invoice.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId), type: 'Purchase' } },
    { $group: { _id: null, totalPurchases: { $sum: '$grandTotal' } } }
  ]);

  // 3. Expenses
  const expenseResult = await Expense.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId) } },
    { $group: { _id: null, totalExpenses: { $sum: '$amount' } } }
  ]);

  // 4. Receivables & Payables (from Party collection)
  const receivablesResult = await Party.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId), balanceType: 'To Receive' } },
    { $group: { _id: null, total: { $sum: '$balance' } } }
  ]);

  const payablesResult = await Party.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId), balanceType: 'To Pay' } },
    { $group: { _id: null, total: { $sum: '$balance' } } }
  ]);

  // 5. Low stock alerts count
  const lowStockItems = await Item.find({ 
    user: userId, 
    $expr: { $lte: ['$stockQty', '$lowStockWarning'] },
    lowStockWarning: { $gt: 0 }
  }).countDocuments();

  // 6. Pending payments list (Unpaid/Partial Invoices of type 'Sale')
  const pendingInvoices = await Invoice.find({
    user: userId,
    type: 'Sale',
    status: { $in: ['Unpaid', 'Partial'] }
  })
  .populate('party', 'name')
  .sort({ date: 1 })
  .limit(10);

  // 7. Top 5 sold products
  const topProducts = await Invoice.aggregate([
    { $match: { user: new mongoose.Types.ObjectId(userId), type: 'Sale' } },
    { $unwind: '$items' },
    { 
      $group: { 
        _id: '$items.name',
        sold: { $sum: '$items.qty' },
        revenue: { $sum: { $multiply: ['$items.qty', '$items.rate'] } }
      } 
    },
    { $sort: { sold: -1 } },
    { $limit: 5 }
  ]);

  // 8. Last 6 months Sales and Expenses Chart Data
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
  sixMonthsAgo.setDate(1);

  const monthlySales = await Invoice.aggregate([
    { 
      $match: { 
        user: new mongoose.Types.ObjectId(userId), 
        type: 'Sale',
        date: { $gte: sixMonthsAgo }
      } 
    },
    {
      $group: {
        _id: { $month: '$date' },
        sales: { $sum: '$grandTotal' }
      }
    }
  ]);

  const monthlyExpenses = await Expense.aggregate([
    { 
      $match: { 
        user: new mongoose.Types.ObjectId(userId),
        date: { $gte: sixMonthsAgo }
      } 
    },
    {
      $group: {
        _id: { $month: '$date' },
        expense: { $sum: '$amount' }
      }
    }
  ]);

  // Merge monthly chart data
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const chartData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const mNum = d.getMonth() + 1;
    const mName = monthNames[d.getMonth()];
    
    const saleVal = monthlySales.find(s => s._id === mNum)?.sales || 0;
    const expVal = monthlyExpenses.find(e => e._id === mNum)?.expense || 0;
    
    chartData.push({
      d: mName,
      sales: saleVal,
      expense: expVal
    });
  }

  const sales = salesResult[0] || { totalSales: 0, todaySales: 0, monthSales: 0, invoiceCount: 0 };
  const totalPurchases = purchaseResult[0]?.totalPurchases || 0;
  const totalExpenses = expenseResult[0]?.totalExpenses || 0;

  return {
    sales: {
      totalSales: sales.totalSales || 0,
      todaySales: sales.todaySales || 0,
      monthSales: sales.monthSales || 0,
      invoiceCount: sales.invoiceCount || 0
    },
    purchases: totalPurchases,
    expenses: totalExpenses,
    receivables: receivablesResult[0]?.total || 0,
    payables: payablesResult[0]?.total || 0,
    netProfit: (sales.totalSales || 0) - totalPurchases - totalExpenses,
    lowStockAlerts: lowStockItems,
    pendingPayments: pendingInvoices.map(inv => ({
      name: inv.partyName || inv.party?.name || 'Walk-in Customer',
      amount: inv.grandTotal - (inv.receivedAmount || 0),
      date: inv.date,
      status: inv.status.toLowerCase()
    })),
    topProducts: topProducts.map(p => ({
      name: p._id,
      sold: p.sold,
      revenue: p.revenue
    })),
    chartData
  };
};

const mongoose = require('mongoose');

const getAccountingData = async (userId) => {
  const objectId = new mongoose.Types.ObjectId(userId);

  // Get Payments
  const payments = await Payment.find({ user: objectId }).populate('party', 'name').lean();
  
  // Get Expenses
  const expenses = await Expense.find({ user: objectId }).lean();
  
  // Get Invoices
  const invoices = await Invoice.find({ user: objectId }).populate('party', 'name').lean();

  let cashInHand = 0;
  let bankBalance = 0;
  let entries = [];

  // Process Payments
  payments.forEach(p => {
    const isBank = ['Bank', 'UPI', 'Cheque'].includes(p.paymentMode);
    const amount = p.amount;
    
    if (p.type === 'Payment In') {
      if (isBank) bankBalance += amount; else cashInHand += amount;
    } else {
      if (isBank) bankBalance -= amount; else cashInHand -= amount;
    }

    entries.push({
      desc: p.description || p.type,
      date: p.date,
      amount: amount,
      type: p.type === 'Payment In' ? 'IN' : 'OUT',
      party: p.partyName || p.party?.name || 'General',
      mode: p.paymentMode
    });
  });

  // Process Expenses
  expenses.forEach(e => {
    const isBank = ['Bank', 'UPI', 'Cheque'].includes(e.paymentMode);
    if (isBank) bankBalance -= e.amount; else cashInHand -= e.amount;
    
    entries.push({
      desc: e.category || 'Expense',
      date: e.date,
      amount: e.amount,
      type: 'OUT',
      party: e.merchant || 'General',
      mode: e.paymentMode || 'Cash'
    });
  });

  // Sort entries by date descending
  entries.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Format dates for frontend
  entries = entries.map(e => ({
    ...e,
    date: new Date(e.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
  }));

  // Receivables & Payables
  const receivablesResult = await Party.aggregate([
    { $match: { user: objectId, balanceType: 'To Receive' } },
    { $group: { _id: null, total: { $sum: '$balance' } } }
  ]);

  const payablesResult = await Party.aggregate([
    { $match: { user: objectId, balanceType: 'To Pay' } },
    { $group: { _id: null, total: { $sum: '$balance' } } }
  ]);

  // P&L
  let totalRevenue = 0;
  let cogs = 0; // Simplified
  invoices.filter(i => i.type === 'Sale').forEach(i => totalRevenue += i.grandTotal);
  invoices.filter(i => i.type === 'Purchase').forEach(i => cogs += i.grandTotal);
  
  const totalOpExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return {
    cashInHand,
    bankBalance,
    receivables: receivablesResult[0]?.total || 0,
    payables: payablesResult[0]?.total || 0,
    entries,
    pnl: {
      totalRevenue,
      cogs,
      grossProfit: totalRevenue - cogs,
      operatingExpenses: totalOpExpenses,
      netProfit: (totalRevenue - cogs) - totalOpExpenses
    }
  };
};

module.exports = {
  getDashboardSummary,
  getAccountingData
};


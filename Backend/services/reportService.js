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

module.exports = {
  getDashboardSummary
};


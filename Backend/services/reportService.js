const Invoice = require('../models/Invoice');
const Expense = require('../models/Expense');
const Payment = require('../models/Payment');
const Item = require('../models/Item');

const getDashboardSummary = async (userId) => {
  const currentDate = new Date();
  const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
  const startOfDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());

  // Aggregate Sales (Invoices of type 'Sale')
  const salesResult = await Invoice.aggregate([
    { $match: { user: userId, type: 'Sale' } },
    { 
      $group: { 
        _id: null, 
        totalSales: { $sum: '$grandTotal' },
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

  // Aggregate Purchases
  const purchaseResult = await Invoice.aggregate([
    { $match: { user: userId, type: 'Purchase' } },
    { $group: { _id: null, totalPurchases: { $sum: '$grandTotal' } } }
  ]);

  // Aggregate Expenses
  const expenseResult = await Expense.aggregate([
    { $match: { user: userId } },
    { $group: { _id: null, totalExpenses: { $sum: '$amount' } } }
  ]);

  // Low Stock Items
  const lowStockItems = await Item.find({ 
    user: userId, 
    $expr: { $lte: ['$stockQty', '$lowStockWarning'] },
    lowStockWarning: { $gt: 0 }
  }).countDocuments();

  return {
    sales: salesResult[0] || { totalSales: 0, todaySales: 0, monthSales: 0 },
    purchases: purchaseResult[0]?.totalPurchases || 0,
    expenses: expenseResult[0]?.totalExpenses || 0,
    lowStockAlerts: lowStockItems
  };
};

module.exports = {
  getDashboardSummary
};

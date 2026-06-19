const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  updateUserStatus,
  getAdminDashboardData,
  getAdminAnalyticsData,
  getAdminBusinesses,
  getAdminSubscriptions,
  impersonateUser,
  getAdminRevenueData,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  getAdminSecurityData,
  getAdminTickets,
  updateAdminTicketStatus,
  getAdminActivityData,
  getPlatformSettingsData,
  updatePlatformSettingsData
} = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Force protection and role restriction to admin for all routes in this file
router.use(protect);
router.use(restrictTo('admin'));

router.get('/users', getAllUsers);
router.put('/users/:id/status', updateUserStatus);
router.get('/dashboard', getAdminDashboardData);
router.get('/analytics', getAdminAnalyticsData);
router.get('/businesses', getAdminBusinesses);
router.get('/subscriptions', getAdminSubscriptions);
router.post('/subscriptions', createSubscriptionPlan);
router.put('/subscriptions/:id', updateSubscriptionPlan);
router.delete('/subscriptions/:id', deleteSubscriptionPlan);
router.post('/impersonate/:id', impersonateUser);
router.get('/revenue', getAdminRevenueData);
router.get('/security', getAdminSecurityData);
router.get('/tickets', getAdminTickets);
router.put('/tickets/:id', updateAdminTicketStatus);
router.get('/activity', getAdminActivityData);
router.get('/settings', getPlatformSettingsData);
router.put('/settings', updatePlatformSettingsData);

module.exports = router;

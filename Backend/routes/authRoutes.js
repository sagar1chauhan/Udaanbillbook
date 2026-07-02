const express = require('express');
const router = express.Router();
const { sendOtp, verifyOtp, getMe, loginEmail, getStaff, addStaff, updateStaff, deleteStaff } = require('../controllers/authController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/login-email', loginEmail);
router.get('/me', protect, getMe);
router.get('/plans', getPlans);
router.post('/subscribe', protect, subscribeUser);
router.get('/settings', getPublicSettings);

router.route('/tickets')
  .get(protect, getUserTickets)
  .post(protect, createUserTicket);

// Staff management routes
router.route('/staff')
  .get(protect, restrictTo('admin', 'vendor'), getStaff)
  .post(protect, restrictTo('admin', 'vendor'), addStaff);
  
router.route('/staff/:id')
  .put(protect, restrictTo('admin', 'vendor'), updateStaff)
  .delete(protect, restrictTo('admin', 'vendor'), deleteStaff);

module.exports = router;

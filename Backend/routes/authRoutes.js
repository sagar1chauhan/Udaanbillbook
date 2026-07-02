const express = require('express');
const router = express.Router();
const { sendOtp, verifyOtp, getMe, loginEmail, getStaff, addStaff, updateStaff, deleteStaff, getPlans, subscribeUser, getUserTickets, createUserTicket, getPublicSettings } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

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
  .get(protect, getStaff)
  .post(protect, addStaff);
  
router.route('/staff/:id')
  .put(protect, updateStaff)
  .delete(protect, deleteStaff);

module.exports = router;

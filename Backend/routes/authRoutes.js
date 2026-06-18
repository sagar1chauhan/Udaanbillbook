const express = require('express');
const router = express.Router();
const { sendOtp, verifyOtp, getMe, loginEmail, getStaff, addStaff, updateStaff, deleteStaff } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/login-email', loginEmail);
router.get('/me', protect, getMe);

// Staff management routes
router.route('/staff')
  .get(protect, getStaff)
  .post(protect, addStaff);
  
router.route('/staff/:id')
  .put(protect, updateStaff)
  .delete(protect, deleteStaff);

module.exports = router;

const express = require('express');
const router = express.Router();
const { sendOtp, verifyOtp, getMe, loginEmail } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);
router.post('/login-email', loginEmail);
router.get('/me', protect, getMe);

module.exports = router;

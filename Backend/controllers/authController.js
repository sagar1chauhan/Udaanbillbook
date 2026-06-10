const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @desc    Send OTP
// @route   POST /api/auth/send-otp
// @access  Public
const sendOtp = async (req, res) => {
  try {
    const { phone, mode } = req.body;

    if (!phone) {
      return res.status(400).json({ message: 'Please provide a mobile number' });
    }

    const user = await User.findOne({ phone });

    if (mode === 'register' && user) {
      return res.status(400).json({ message: 'User already exists. Please login instead.' });
    }

    if (mode === 'login' && !user) {
      return res.status(404).json({ message: 'User not found. Please register first.' });
    }

    // In a real app, integrate SMS API here
    const otp = "123456"; // Fixed for demo

    res.status(200).json({ message: `OTP sent to ${phone}`, success: true });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP and Login/Register
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
  try {
    const { phone, otp, mode, name, business, address, email } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required' });
    }

    // Validate OTP (Hardcoded for demo)
    if (otp !== "123456" && otp !== "000000") { // allow 000000 or 123456 for demo
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    let user = await User.findOne({ phone });

    if (mode === 'register') {
      if (user) {
        // If user already exists but trying to register, just update them or login
        user.name = name || user.name;
        user.businessName = business || user.businessName;
        user.businessAddress = address || user.businessAddress;
        user.email = email || user.email;
        await user.save();
      } else {
        // Create new user
        user = await User.create({
          phone,
          name: name || "User",
          businessName: business,
          businessAddress: address,
          email,
          role: phone === "9876543210" ? "admin" : "vendor"
        });
      }
    } else {
      // Login mode
      if (!user) {
        return res.status(404).json({ message: 'User not found. Please register first.' });
      }
    }

    res.json({
      _id: user.id,
      name: user.name,
      phone: user.phone,
      email: user.email,
      businessName: user.businessName,
      role: user.role,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res) => {
  try {
    const user = {
      _id: req.user.id,
      name: req.user.name,
      phone: req.user.phone,
      email: req.user.email,
      businessName: req.user.businessName,
      role: req.user.role
    };
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
  getMe,
};

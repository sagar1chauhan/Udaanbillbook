const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');


// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

const otpStore = new Map();

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

    // Generate simulated dynamic 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otpStore.set(phone, otp);

    console.log(`\n========================================\n[DEMO OTP SERVICE] Generated OTP for +91 ${phone}: ${otp}\n========================================\n`);

    res.status(200).json({ message: `OTP sent to ${phone}`, success: true, otp });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify OTP and Login/Register
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
  try {
    const { phone, otp, mode, name, business, address, email, role } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone and OTP are required' });
    }

    const savedOtp = otpStore.get(phone);

    // Validate OTP (allow 000000 or 123456 as fallbacks for tests/demos)
    if (otp !== "123456" && otp !== "000000" && otp !== savedOtp) {
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
        if (role) user.role = role;
        await user.save();
      } else {
        // Create new user
        user = await User.create({
          phone,
          name: name || "User",
          businessName: business,
          businessAddress: address,
          email,
          role: role || (phone === "9876543210" ? "admin" : "vendor")
        });
      }
    } else {
      // Login mode
      if (!user) {
        return res.status(404).json({ message: 'User not found. Please register first.' });
      }
      if (role) {
        user.role = role;
        await user.save();
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

// @desc    Login with email and password
// @route   POST /api/auth/login-email
// @access  Public
const loginEmail = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    let user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      // Auto-create demo users if email matches preset admin/staff
      if (email.toLowerCase() === 'admin@udaan.com') {
        const hashedPassword = await bcrypt.hash(password, 10);
        const existingPhoneUser = await User.findOne({ phone: '9876543210' });
        if (existingPhoneUser) {
          existingPhoneUser.email = 'admin@udaan.com';
          existingPhoneUser.password = hashedPassword;
          existingPhoneUser.role = 'admin';
          await existingPhoneUser.save();
          user = existingPhoneUser;
        } else {
          user = await User.create({
            name: 'Demo Admin',
            phone: '9876543210',
            email: 'admin@udaan.com',
            password: hashedPassword,
            businessName: 'Demo Business',
            role: 'admin'
          });
        }
      } else if (email.toLowerCase() === 'staff@udaan.com') {
        const hashedPassword = await bcrypt.hash(password, 10);
        const existingPhoneUser = await User.findOne({ phone: '9123456789' });
        if (existingPhoneUser) {
          existingPhoneUser.email = 'staff@udaan.com';
          existingPhoneUser.password = hashedPassword;
          existingPhoneUser.role = 'staff';
          await existingPhoneUser.save();
          user = existingPhoneUser;
        } else {
          user = await User.create({
            name: 'Demo Staff',
            phone: '9123456789',
            email: 'staff@udaan.com',
            password: hashedPassword,
            businessName: 'Demo Business',
            role: 'staff'
          });
        }
      } else {
        return res.status(404).json({ message: 'User not found. Use demo accounts or register first.' });
      }
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      if (user.password !== password) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
    }

    if (role && user.role !== role) {
      user.role = role;
      await user.save();
    }

    res.status(200).json({
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

module.exports = {
  sendOtp,
  verifyOtp,
  getMe,
  loginEmail
};

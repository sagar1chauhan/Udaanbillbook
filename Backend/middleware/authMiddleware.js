const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from the token
      req.user = await User.findById(decoded.id).select('-password');

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }


};

// Middleware to restrict routes to specific roles
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'You do not have permission to perform this action' });
    }
    next();
  };
};

// Middleware to check if staff has specific permission
const requirePermission = (permission) => {
  return (req, res, next) => {
    if (req.user.role === 'admin' || req.user.role === 'vendor' || req.user.role === 'superadmin') {
      return next(); // Admins bypass permission checks
    }
    
    if (req.user.role === 'staff' && req.user.permissions && req.user.permissions.includes(permission)) {
      return next();
    }
    
    return res.status(403).json({ message: `Access denied. Requires '${permission}' permission.` });
  };
};

module.exports = { protect, restrictTo, requirePermission };

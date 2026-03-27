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

      if (!req.user) {
        return res.status(401).json({ message: 'User not found, Not authorized' });
      }

      if (req.user.isSuspended) {
        return res.status(403).json({ message: 'Your account has been suspended. Please contact support.' });
      }

      // Update lastActive without triggering pre-save hooks or version errors
      await User.findByIdAndUpdate(req.user._id, { 
        $set: { lastActive: Date.now() } 
      });

      next();
      return;
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Grant access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authorized, no user found' });
    }

    const userRole = req.user.role.toLowerCase();
    const authorizedRoles = roles.map(role => role.toLowerCase());

    if (!authorizedRoles.includes(userRole)) {
      return res.status(403).json({
        message: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };

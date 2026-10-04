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

      // Resolve effective vendor ID (if Vendor-Staff or Staff, resolve parent Vendor ID from managedBy)
      const userRole = (req.user.role || '').toLowerCase();
      if ((userRole === 'vendor-staff' || userRole === 'staff') && req.user.managedBy) {
        req.user.effectiveVendorId = req.user.managedBy.toString();
      } else {
        req.user.effectiveVendorId = (req.user._id || req.user.id).toString();
      }

      // Update activity and online status
      const lastActive = req.user.lastActive;
      const now = new Date();
      const diffMs = now - lastActive;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      
      const today = now.toISOString().split('T')[0];
      
      // Calculate active session increment (max 30 mins to avoid idle time inflation)
      const timeIncrement = (diffMins > 0 && diffMins < 30) ? diffMins : 0.5;

      const userUpdate = {
        $set: { 
          lastActive: now,
          isOnline: true 
        },
        $inc: { totalTimeSpent: timeIncrement }
      };

      // Handle daily activity count
      const activityIndex = req.user.activityLog.findIndex(a => a.date === today);
      if (activityIndex > -1) {
        userUpdate['$inc'][`activityLog.${activityIndex}.count`] = 1;
      } else {
        // Keep logs for the last 5 years
        if (req.user.activityLog.length > 1825) {
          userUpdate['$pop'] = { activityLog: -1 };
        }
        userUpdate['$push'] = { activityLog: { date: today, count: 1 } };
      }

      await User.findByIdAndUpdate(req.user._id, userUpdate);

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

// Optional authentication middleware: populates req.user if Bearer token present, but does not block if absent
const optionalProtect = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');

      if (req.user) {
        const userRole = (req.user.role || '').toLowerCase();
        if ((userRole === 'vendor-staff' || userRole === 'staff') && req.user.managedBy) {
          req.user.effectiveVendorId = req.user.managedBy.toString();
        } else {
          req.user.effectiveVendorId = (req.user._id || req.user.id).toString();
        }
      }
    } catch (error) {
      // Token invalid or expired, proceed without req.user
    }
  }
  next();
};

module.exports = { protect, authorize, optionalProtect };


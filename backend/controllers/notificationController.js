const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res, next) => {
  let filter = {};

  if (req.user && (req.user.role === 'Admin' || req.user.role === 'Sub-Admin')) {
    filter = {
      $or: [
        { user: req.user.id },
        { user: null },
        { recipientRole: 'Admin' },
        { recipientRole: 'All' },
        { user: { $exists: false } }
      ]
    };
  } else if (req.user && ['Vendor', 'Vendor-Staff', 'Staff', 'Sub Vendor', 'vendor-staff', 'staff'].includes(req.user.role)) {
    const targetVendorId = req.user.effectiveVendorId || req.user.vendor || req.user.vendorId || req.user.id;
    filter = {
      $or: [
        { user: req.user.id },
        { user: targetVendorId },
        { recipientRole: 'Vendor' },
        { recipientRole: 'All' }
      ]
    };
  } else if (req.user) {
    filter = {
      $or: [
        { user: req.user.id },
        { recipientRole: { $in: ['Customer', 'All'] } }
      ]
    };
  } else {
    // Guest visitor browsing the public website - only public customer/all announcements
    filter = {
      recipientRole: { $in: ['Customer', 'All'] }
    };
  }

  const notifications = await Notification.find(filter)
    .sort({ createdAt: -1 })
    .limit(50);

  res.json({
    success: true,
    count: notifications.length,
    unreadCount: notifications.filter(n => !n.isRead).length,
    data: notifications
  });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private / Public Guest
const markAsRead = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return res.json({
      success: true,
      message: 'Notification marked as read'
    });
  }

  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new ErrorResponse('Notification not found', 404));
  }

  // Authorize: check if user matches or user is Admin/Vendor
  const isAdmin = req.user && (req.user.role === 'Admin' || req.user.role === 'Sub-Admin');
  const isOwner = notification.user && notification.user.toString() === req.user.id;
  const isRoleTarget = !notification.user || (notification.recipientRole === req.user.role) || (notification.recipientRole === 'All');

  if (!isAdmin && !isOwner && !isRoleTarget) {
    return next(new ErrorResponse('Not authorized to access this notification', 401));
  }

  notification.isRead = true;
  await notification.save();

  res.json({
    success: true,
    data: notification
  });
});

// @desc    Mark all notifications as read
// @route   PUT /api/notifications/mark-all-read
// @access  Private / Public Guest
const markAllRead = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  }

  let filter = { user: req.user.id, isRead: false };

  if (req.user && (req.user.role === 'Admin' || req.user.role === 'Sub-Admin')) {
    filter = {
      $or: [
        { user: req.user.id },
        { user: null },
        { recipientRole: 'Admin' },
        { recipientRole: 'All' },
        { user: { $exists: false } }
      ],
      isRead: false
    };
  } else if (req.user && ['Vendor', 'Vendor-Staff', 'Staff'].includes(req.user.role)) {
    const targetVendorId = req.user.effectiveVendorId || req.user.id;
    filter = {
      $or: [
        { user: req.user.id },
        { user: targetVendorId },
        { recipientRole: 'Vendor' },
        { recipientRole: 'All' }
      ],
      isRead: false
    };
  }

  await Notification.updateMany(filter, { isRead: true });

  res.json({
    success: true,
    message: 'All notifications marked as read'
  });
});

// @desc    Clear all notifications
// @route   DELETE /api/notifications
// @access  Private / Public Guest
const clearNotifications = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    return res.json({
      success: true,
      message: 'Notifications cleared'
    });
  }

  let filter = { user: req.user.id };

  if (req.user && (req.user.role === 'Admin' || req.user.role === 'Sub-Admin')) {
    filter = {
      $or: [
        { user: req.user.id },
        { user: null },
        { recipientRole: 'Admin' },
        { recipientRole: 'All' },
        { user: { $exists: false } }
      ]
    };
  }

  await Notification.deleteMany(filter);

  res.json({
    success: true,
    message: 'Notifications cleared'
  });
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllRead,
  clearNotifications
};

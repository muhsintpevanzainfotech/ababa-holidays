const Notification = require('../models/Notification');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
const getNotifications = asyncHandler(async (req, res, next) => {
  const notifications = await Notification.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .limit(20);

  res.json({
    success: true,
    count: notifications.length,
    data: notifications
  });
});

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
const markAsRead = asyncHandler(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new ErrorResponse('Notification not found', 404));
  }

  // Make sure notification belongs to user
  if (notification.user.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized', 401));
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
// @access  Private
const markAllRead = asyncHandler(async (req, res, next) => {
  await Notification.updateMany(
    { user: req.user.id, isRead: false },
    { isRead: true }
  );

  res.json({
    success: true,
    message: 'All notifications marked as read'
  });
});

// @desc    Clear all notifications
// @route   DELETE /api/notifications
// @access  Private
const clearNotifications = asyncHandler(async (req, res, next) => {
  await Notification.deleteMany({ user: req.user.id });

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

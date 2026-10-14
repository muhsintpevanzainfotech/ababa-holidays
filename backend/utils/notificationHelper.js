const Notification = require('../models/Notification');

/**
 * Creates and logs a system notification
 * @param {Object} options
 * @param {string} [options.user] - Target user ID (optional)
 * @param {string} [options.recipientRole] - 'Admin' | 'Vendor' | 'Customer' | 'All'
 * @param {string} options.title - Notification title
 * @param {string} options.message - Notification message content
 * @param {string} [options.category] - 'contact' | 'enquiry' | 'booking' | 'request' | 'review' | 'payment' | 'system'
 * @param {string} [options.type] - 'info' | 'success' | 'warning' | 'error'
 * @param {string} [options.link] - Target dashboard route for quick action
 * @param {Object} [options.metadata] - Extra contextual information
 */
const sendNotification = async ({
  user = null,
  recipientRole = 'Admin',
  title,
  message,
  category = 'system',
  type = 'info',
  link = '',
  metadata = {}
}) => {
  try {
    const allowedCategories = ['contact', 'enquiry', 'booking', 'request', 'review', 'payment', 'system', 'vendor', 'package', 'auth', 'user'];
    const safeCategory = allowedCategories.includes(category) ? category : 'system';

    const notification = await Notification.create({
      user,
      recipientRole,
      title,
      message,
      category: safeCategory,
      type,
      link,
      metadata,
      isRead: false
    });
    return notification;
  } catch (error) {
    console.error('Failed to create system notification:', error.message);
    return null;
  }
};

const notifyAdmin = async ({ title, message, category = 'system', type = 'info', link = '', metadata = {} }) => {
  return sendNotification({
    recipientRole: 'Admin',
    title,
    message,
    category,
    type,
    link,
    metadata
  });
};

const notifyVendor = async (vendorId, { title, message, category = 'system', type = 'info', link = '', metadata = {} }) => {
  return sendNotification({
    user: vendorId,
    recipientRole: 'Vendor',
    title,
    message,
    category,
    type,
    link,
    metadata
  });
};

const notifyCustomer = async (userId, { title, message, category = 'system', type = 'info', link = '', metadata = {} }) => {
  return sendNotification({
    user: userId,
    recipientRole: 'Customer',
    title,
    message,
    category,
    type,
    link,
    metadata
  });
};

module.exports = {
  sendNotification,
  notifyAdmin,
  notifyVendor,
  notifyCustomer
};

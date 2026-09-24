const express = require('express');
const {
  getSettings,
  updateSettings,
  testConnection,
  getPublicSettings,
  createOrder,
  verifyPayment,
  handleWebhook,
  getPayments,
  getPaymentById,
  getPaymentByBookingId,
  processRefund,
  createPaymentIntent,
  stripeWebhook
} = require('../controllers/paymentController');

const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Public checkout endpoints
router.get('/public-settings', getPublicSettings);
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

// Protected customer endpoints
router.post('/create-order', protect, createOrder);
router.post('/create-intent', protect, createPaymentIntent); // Legacy route support
router.post('/verify', protect, verifyPayment);
router.get('/booking/:bookingId', protect, getPaymentByBookingId);

// Admin-only management endpoints
router.get('/settings', protect, authorize('Admin', 'Sub-Admin'), getSettings);
router.put('/settings', protect, authorize('Admin'), updateSettings);
router.post('/test-connection', protect, authorize('Admin'), testConnection);

router.get('/', protect, authorize('Admin', 'Sub-Admin'), getPayments);
router.get('/:id', protect, authorize('Admin', 'Sub-Admin'), getPaymentById);
router.post('/:id/refund', protect, authorize('Admin'), processRefund);

module.exports = router;

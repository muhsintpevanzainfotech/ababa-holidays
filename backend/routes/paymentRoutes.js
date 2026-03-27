const express = require('express');
const {
  createPaymentIntent,
  stripeWebhook
} = require('../controllers/paymentController');

const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/create-intent', protect, createPaymentIntent);

// Stripe webhook needs raw body, we'll handle this in app.js
router.post('/webhook', express.raw({ type: 'application/json' }), stripeWebhook);

module.exports = router;

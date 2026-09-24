const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Booking',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderId: {
    type: String,
    required: true,
    index: true
  },
  paymentId: {
    type: String,
    index: true,
    default: ''
  },
  signature: {
    type: String,
    default: ''
  },
  gateway: {
    type: String,
    default: 'razorpay'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'upiQr', 'netbanking', 'wallet', 'other'],
    default: 'card'
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['CREATED', 'PENDING', 'AUTHORIZED', 'CAPTURED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED'],
    default: 'CREATED'
  },
  refundAmount: {
    type: Number,
    default: 0
  },
  refunds: [{
    refundId: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, default: 'processed' },
    reason: { type: String, default: '' },
    createdAt: { type: Date, default: Date.now }
  }],
  metadata: {
    type: Object,
    default: {}
  },
  logs: [{
    event: { type: String },
    status: { type: String },
    message: { type: String },
    timestamp: { type: Date, default: Date.now }
  }],
  // Backward compatibility field
  stripePaymentIntentId: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for performance
paymentSchema.index({ booking: 1 });
paymentSchema.index({ user: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);

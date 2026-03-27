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
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['Pending', 'Succeeded', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  stripePaymentIntentId: {
    type: String
  },
  paymentMethod: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Payment', paymentSchema);

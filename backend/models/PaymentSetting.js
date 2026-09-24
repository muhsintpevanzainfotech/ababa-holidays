const mongoose = require('mongoose');

const paymentSettingSchema = new mongoose.Schema({
  gateway: {
    type: String,
    default: 'razorpay',
    required: true
  },
  environment: {
    type: String,
    enum: ['test', 'live'],
    default: 'test'
  },
  status: {
    type: Boolean,
    default: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  apiKey: {
    type: String,
    default: ''
  },
  apiSecret: {
    type: String,
    default: ''
  },
  webhookSecret: {
    type: String,
    default: ''
  },
  methods: {
    card: {
      type: Boolean,
      default: true
    },
    upi: {
      type: Boolean,
      default: true
    },
    upiQr: {
      type: Boolean,
      default: true
    },
    netbanking: {
      type: Boolean,
      default: true
    }
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PaymentSetting', paymentSettingSchema);

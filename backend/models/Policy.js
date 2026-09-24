const mongoose = require('mongoose');

const policySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a policy title'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Please add policy content']
  },
  type: {
    type: String,
    required: true,
    enum: ['Terms & Conditions', 'Refund & Cancellation', 'Privacy Policy']
  },
  target: {
    type: String,
    required: true,
    enum: ['User', 'Vendor'],
    default: 'User'
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isGlobal: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for faster lookups
policySchema.index({ type: 1, target: 1, vendor: 1 });

module.exports = mongoose.model('Policy', policySchema);

const mongoose = require('mongoose');

const Counter = require('./Counter');

const subscriptionSchema = new mongoose.Schema({
  customId: {
    type: String,
    unique: true
  },
  plan: {
    type: String, // 'Starter', 'Professional', 'Enterprise', 'Custom', 'Free'
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  features: [{
    type: String
  }],
  userLimit: {
    type: Number,
    default: 0 // Use -1 for unlimited
  },
  packageLimit: {
    type: Number,
    default: 0 // Use -1 for unlimited
  },
  staffLimit: {
    type: Number,
    default: 0 // Use -1 for unlimited
  },
  images: [{
    type: String
  }],
  price: {
    type: Number,
    required: true
  },
  crmEnabled: {
    type: Boolean,
    default: false
  },
  websiteEnabled: {
    type: Boolean,
    default: false
  },
  testimonialEnabled: {
    type: Boolean,
    default: false
  },
  contactUsEnabled: {
    type: Boolean,
    default: false
  },
  enquiriesFollowupEnabled: {
    type: Boolean,
    default: false
  },
  instagramReelsEnabled: {
    type: Boolean,
    default: false
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Pending'
  },
  accessSections: [{
    type: String // E.g., ['Tourist Bus Booking', 'Hotel Booking']
  }],
  stripePaymentIntentId: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Generate Custom ID
subscriptionSchema.pre('save', async function () {
  if (this.isNew && !this.customId) {
    const year = new Date().getFullYear();
    const prefix = 'SUB';
    const counterId = `${prefix}_${year}`;

    const counter = await Counter.findOneAndUpdate(
      { id: counterId },
      { $inc: { seq: 1 } },
      { returnDocument: 'after', upsert: true }
    );

    const seqString = counter.seq.toString().padStart(5, '0');
    this.customId = `${prefix}${year}${seqString}`;
  }
});

module.exports = mongoose.model('Subscription', subscriptionSchema);

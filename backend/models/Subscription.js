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
    default: -1 // Use -1 for unlimited
  },
  packageLimit: {
    type: Number,
    default: -1 // Use -1 for unlimited
  },
  staffLimit: {
    type: Number,
    default: -1 // Use -1 for unlimited
  },
  bookingLimit: {
    type: Number,
    default: -1 // Use -1 for unlimited
  },
  bannerLimit: {
    type: Number,
    default: -1 // Use -1 for unlimited
  },
  blogLimit: {
    type: Number,
    default: -1 // Use -1 for unlimited
  },
  testimonialLimit: {
    type: Number,
    default: -1
  },
  enquiryLimit: {
    type: Number,
    default: -1
  },
  contactUsLimit: {
    type: Number,
    default: -1
  },
  availabilityLimit: {
    type: Number,
    default: -1
  },
  crmLimit: {
    type: Number,
    default: -1
  },
  websiteLimit: {
    type: Number,
    default: -1
  },
  apiDocLimit: {
    type: Number,
    default: -1
  },
  staffEnabled: {
    type: Boolean,
    default: true
  },
  userEnabled: {
    type: Boolean,
    default: true
  },
  apiDocEnabled: {
    type: Boolean,
    default: true
  },
  images: [{
    type: String
  }],
  price: {
    type: Number,
    required: true
  },
  durationInDays: {
    type: Number,
    default: 365 // Use -1 for unlimited
  },
  crmEnabled: {
    type: Boolean,
    default: true
  },
  websiteEnabled: {
    type: Boolean,
    default: true
  },
  bannerEnabled: {
    type: Boolean,
    default: true
  },
  blogsNewsEnabled: {
    type: Boolean,
    default: true
  },
  testimonialEnabled: {
    type: Boolean,
    default: true
  },
  contactUsEnabled: {
    type: Boolean,
    default: true
  },
  enquiriesFollowupEnabled: {
    type: Boolean,
    default: true
  },
  bookingEnabled: {
    type: Boolean,
    default: true
  },
  packagesEnabled: {
    type: Boolean,
    default: true
  },
  availabilityEnabled: {
    type: Boolean,
    default: true
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
  },
  isVisible: {
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

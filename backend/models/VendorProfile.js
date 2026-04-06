const mongoose = require('mongoose');

const vendorProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vendorType: {
    type: String,
    enum: ['Individual', 'Company', 'Business'],
    default: 'Individual'
  },
  companyName: {
    type: String,
    required: [true, 'Please add a company name']
  },
  businessLicense: {
    type: String
  },
  idCard: {
    type: String // Identity card upload path
  },
  location: {
    type: String
  },
  address: {
    street: String,
    city: String,
    state: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'State'
    },
    country: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Country'
    },
    zipCode: String,
    fullAddress: String,
    mapLink: String,
    latitude: Number,
    longitude: Number
  },
  zone: {
    type: String
  },
  spoc: {
    name: String,
    email: String,
    phone: String
  },
  tin: {
    number: String,
    issueDate: Date,
    expireDate: Date,
    issuingAuthority: String,
    upload: String
  },
  gst: {
    number: String,
    issueDate: Date,
    expireDate: Date,
    issuingAuthority: String,
    upload: String
  },
  companylogos: {
    small: { type: String, default: '/public/defaults/default_travel.png' },
    medium: { type: String, default: '/public/defaults/default_travel.png' },
    large: { type: String, default: '/public/defaults/default_travel.png' }
  },
  socialMedia: [{
    title: { type: String },
    icon: { type: String },
    link: { type: String }
  }],
  bankDetails: {
    accountName: String,
    accountNumber: String,
    bankName: String,
    ifscCode: String,
    branch: String,
    upload: String
  },
  kycStatus: {
    type: String,
    enum: ['Pending', 'Verified', 'Rejected'],
    default: 'Pending'
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  subscriptionPlan: {
    type: String,
    default: 'Free'
  },
  subscription: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subscription'
  },
  paymentDetails: {
    type: String
  },
  seo: {
    title: { type: String },
    description: { type: String },
    keywords: [{ type: String }]
  },
  selectedServices: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  }]
}, {
  timestamps: true
});

// Index for faster lookups
vendorProfileSchema.index({ user: 1 });

module.exports = mongoose.model('VendorProfile', vendorProfileSchema);

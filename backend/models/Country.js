const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a country name'],
    unique: true,
    trim: true
  },
  code: {
    type: String,
    trim: true,
    uppercase: true
  },
  slug: {
    type: String,
    trim: true,
    lowercase: true
  },
  currency: {
    type: String,
    trim: true,
    default: 'INR'
  },
  currencySymbol: {
    type: String,
    trim: true,
    default: '₹'
  },
  phoneCode: {
    type: String,
    trim: true,
    default: '+91'
  },
  dialCode: {
    type: String,
    trim: true
  },
  flag: {
    type: String,
    trim: true,
    default: '🇮🇳'
  },
  coverImage: {
    type: String,
    default: 'default-country.jpg'
  },
  image: {
    type: String,
    default: 'default-country.jpg'
  },
  description: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Pre-save hook to ensure slug, dialCode & image field backward compatibility
countrySchema.pre('save', function(next) {
  if (this.name && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }
  if (this.phoneCode && !this.dialCode) {
    this.dialCode = this.phoneCode;
  } else if (this.dialCode && !this.phoneCode) {
    this.phoneCode = this.dialCode;
  }
  if (this.coverImage && (!this.image || this.image === 'default-country.jpg')) {
    this.image = this.coverImage;
  } else if (this.image && (!this.coverImage || this.coverImage === 'default-country.jpg')) {
    this.coverImage = this.image;
  }
  next();
});

module.exports = mongoose.model('Country', countrySchema);

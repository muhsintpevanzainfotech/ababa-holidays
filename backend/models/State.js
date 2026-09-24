const mongoose = require('mongoose');

const stateSchema = new mongoose.Schema({
  country: {
    type: mongoose.Schema.ObjectId,
    ref: 'Country',
    required: [true, 'Please select a country']
  },
  countryId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Country'
  },
  name: {
    type: String,
    required: [true, 'Please add a state name'],
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
  description: {
    type: String
  },
  coverImage: {
    type: String,
    default: 'default-state.jpg'
  },
  image: {
    type: String,
    default: 'default-state.jpg'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Pre-save hook to generate slug and ensure field backward compatibility
stateSchema.pre('save', function(next) {
  if (this.name && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }
  if (this.country && !this.countryId) {
    this.countryId = this.country;
  } else if (this.countryId && !this.country) {
    this.country = this.countryId;
  }
  if (this.coverImage && (!this.image || this.image === 'default-state.jpg')) {
    this.image = this.coverImage;
  } else if (this.image && (!this.coverImage || this.coverImage === 'default-state.jpg')) {
    this.coverImage = this.image;
  }
  next();
});

// Avoid duplicate state names in the same country
stateSchema.index({ name: 1, country: 1 }, { unique: true });

module.exports = mongoose.model('State', stateSchema);

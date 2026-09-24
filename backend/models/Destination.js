const mongoose = require('mongoose');

const DESTINATION_CATEGORIES = [
  'Hill Station',
  'Beach',
  'Waterfall',
  'Wildlife',
  'Historical',
  'Adventure',
  'Religious',
  'City',
  'Island',
  'Nature'
];

const destinationSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: [true, 'Please add a destination name'],
    trim: true
  },
  slug: {
    type: String,
    trim: true,
    lowercase: true
  },
  country: {
    type: mongoose.Schema.ObjectId,
    ref: 'Country'
  },
  countryId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Country'
  },
  state: {
    type: mongoose.Schema.ObjectId,
    ref: 'State',
    required: [true, 'Please select a state']
  },
  stateId: {
    type: mongoose.Schema.ObjectId,
    ref: 'State'
  },
  shortDescription: {
    type: String,
    trim: true
  },
  description: {
    type: String
  },
  thumbnail: {
    type: String,
    default: 'default-destination.jpg'
  },
  coverImage: {
    type: String,
    default: 'default-destination.jpg'
  },
  image: {
    type: String,
    default: 'default-destination.jpg'
  },
  gallery: [{
    type: String
  }],

  // Map / Location Details
  latitude: {
    type: Number
  },
  longitude: {
    type: Number
  },
  address: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    trim: true
  },
  pincode: {
    type: String,
    trim: true
  },
  googlePlaceId: {
    type: String,
    trim: true
  },
  mapZoom: {
    type: Number,
    default: 12
  },
  locationName: {
    type: String,
    trim: true
  },

  // Categories
  categories: [{
    type: String,
    enum: DESTINATION_CATEGORIES
  }],
  category: {
    type: String,
    default: 'Hill Station'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Pre-save hook to generate slug and sync fields for backward compatibility
destinationSchema.pre('save', function(next) {
  if (this.name && !this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  }
  if (this.state && !this.stateId) {
    this.stateId = this.state;
  } else if (this.stateId && !this.state) {
    this.state = this.stateId;
  }
  if (this.country && !this.countryId) {
    this.countryId = this.country;
  } else if (this.countryId && !this.country) {
    this.country = this.countryId;
  }
  if (this.coverImage && (!this.image || this.image === 'default-destination.jpg')) {
    this.image = this.coverImage;
  } else if (this.image && (!this.coverImage || this.coverImage === 'default-destination.jpg')) {
    this.coverImage = this.image;
  }
  if (this.categories && this.categories.length > 0) {
    this.category = this.categories[0];
  } else if (this.category) {
    this.categories = [this.category];
  }
  next();
});

// Avoid duplicate destination names in the same state
destinationSchema.index({ name: 1, state: 1 }, { unique: true });

module.exports = mongoose.model('Destination', destinationSchema);
module.exports.DESTINATION_CATEGORIES = DESTINATION_CATEGORIES;

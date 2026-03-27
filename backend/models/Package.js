const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a package title'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a short description'],
    maxlength: [2000, 'Description cannot be more than 2000 characters']
  },
  itinerary: {
    type: String,
    default: ''
  },
  exclusions: {
    type: [String],
    default: []
  },
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  duration: {
    type: String,
    required: [true, 'Please add a duration (e.g., 3 Days, 2 Nights)']
  },
  location: {
    type: String,
    required: [true, 'Please add a location']
  },
  images: {
    type: [String],
    default: ['/public/defaults/default_travel.png']
  },
  includedServices: {
    type: [String],
    default: []
  },
  availabilityDates: {
    type: [Date],
    required: [true, 'Please add available dates']
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  addedByStaff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  serviceCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  averageRating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5']
  },
  seoTitle: String,
  seoDescription: String,
  seoKeywords: String
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
packageSchema.index({ vendor: 1 });
packageSchema.index({ serviceCategory: 1 });

// Cascade delete reviews when a package is deleted
packageSchema.pre('remove', async function(next) {
  await this.model('Review').deleteMany({ package: this._id });
  next();
});

module.exports = mongoose.model('Package', packageSchema);

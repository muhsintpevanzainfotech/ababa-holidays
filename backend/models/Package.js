const mongoose = require('mongoose');
const Counter = require('./Counter');

const packageSchema = new mongoose.Schema({
  customId: {
    type: String,
    unique: true
  },
  title: {
    type: String,
    required: [true, 'Please add a package title'],
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Please add a package description']
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  subService: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubService'
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  duration: {
    type: String,
    required: [true, 'Please add a duration (e.g., 3 Days / 2 Nights)']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  location: {
    type: String,
    required: [true, 'Please add a location']
  },
  images: {
    type: [String],
    default: ['/public/defaults/default_travel.png']
  },
  itinerary: [{
    day: Number,
    title: String,
    description: String
  }],
  inclusions: {
    type: [String],
    default: []
  },
  exclusions: {
    type: [String],
    default: []
  },
  availabilityDates: {
    type: [Date],
    default: []
  },
  isActive: {
    type: Boolean,
    default: true
  },
  seo: {
    title: { type: String },
    description: { type: String },
    keywords: [{ type: String }]
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  averageRating: {
    type: Number,
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot be more than 5'],
    default: 5
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
packageSchema.index({ vendor: 1 });
packageSchema.index({ service: 1 });
packageSchema.index({ subService: 1 });
packageSchema.index({ category: 1 });

// Generate Custom ID and text capitalization
packageSchema.pre('save', async function () {
  if (this.isNew && !this.customId) {
    const year = new Date().getFullYear();
    const prefix = 'PKG';
    const counterId = `${prefix}_${year}`;

    // If this is the very first record, reset the counter
    const count = await this.constructor.countDocuments();
    if (count === 0) {
       await Counter.findOneAndUpdate({ id: counterId }, { seq: 0 });
    }

    const counter = await Counter.findOneAndUpdate(
      { id: counterId },
      { $inc: { seq: 1 } },
      { returnDocument: 'after', upsert: true }
    );

    const seqString = counter.seq.toString().padStart(5, '0');
    this.customId = `${prefix}${year}${seqString}`;
  }

  // Capitalize title
  if (this.title) {
    this.title = this.title.trim().charAt(0).toUpperCase() + this.title.trim().slice(1);
  }
});

// Cascade delete reviews when a package is deleted
packageSchema.pre('remove', async function(next) {
  await this.model('Review').deleteMany({ package: this._id });
  next();
});

module.exports = mongoose.model('Package', packageSchema);

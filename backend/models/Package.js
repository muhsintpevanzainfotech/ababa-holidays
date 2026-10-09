const mongoose = require('mongoose');
const Counter = require('./Counter');

const packageSchema = new mongoose.Schema({
  customId: {
    type: String,
    unique: true
  },
  // Core Service Category connection to Package Setup & Form Setup
  serviceCategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Please select a service category']
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service'
  },
  subService: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SubService'
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive', 'Draft', 'Pending', 'Correction', 'Archived'],
    default: 'Active'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Dynamic Form Setup data container (stores all custom fields configured in Form Setup)
  customData: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  // Optional standard fields (no strict required constraints to allow Form Setup flexibility)
  packageName: {
    type: String,
    trim: true,
    maxlength: [200, 'Package name cannot be more than 200 characters']
  },
  title: {
    type: String,
    trim: true,
    maxlength: [200, 'Title cannot be more than 200 characters']
  },
  packageDescription: {
    type: String
  },
  description: {
    type: String
  },
  duration: {
    type: String
  },
  price: {
    type: Number,
    default: 0
  },
  originalPrice: {
    type: Number,
    default: 0
  },
  discountPrice: {
    type: Number,
    default: 0
  },
  priceType: {
    type: String,
    default: 'Per Person'
  },
  currency: {
    type: String,
    default: 'INR'
  },
  taxPercentage: {
    type: Number,
    default: 0
  },
  isTaxIncluded: {
    type: Boolean,
    default: true
  },
  priceNotes: {
    type: String,
    default: ''
  },
  location: {
    type: String
  },
  destination: {
    type: String
  },
  isFeatured: {
    type: Boolean,
    default: true
  },
  isTopPick: {
    type: Boolean,
    default: false
  },
  topRated: {
    type: Boolean,
    default: true
  },
  badge: {
    type: String,
    default: ''
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
  seo: {
    title: { type: String },
    description: { type: String },
    keywords: [{ type: String }]
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

// Indexes for query performance
packageSchema.index({ vendor: 1 });
packageSchema.index({ serviceCategory: 1 });
packageSchema.index({ service: 1 });
packageSchema.index({ subService: 1 });
packageSchema.index({ category: 1 });

// Pre-validate middleware: Clean up empty string ObjectIds to prevent CastError
packageSchema.pre('validate', function() {
  ['subService', 'category', 'service', 'serviceCategory', 'vendor', 'createdBy'].forEach(field => {
    if (this[field] === '' || this[field] === 'null' || this[field] === 'undefined') {
      this[field] = null;
    }
  });
});

// Pre-save middleware: Auto-generate Custom ID, Sync service & serviceCategory, Sync status & isActive
packageSchema.pre('save', async function () {
  ['subService', 'category', 'service', 'serviceCategory', 'vendor', 'createdBy'].forEach(field => {
    if (this[field] === '' || this[field] === 'null' || this[field] === 'undefined') {
      this[field] = null;
    }
  });

  // Sync serviceCategory and service references
  if (this.serviceCategory && !this.service) {
    this.service = this.serviceCategory;
  } else if (this.service && !this.serviceCategory) {
    this.serviceCategory = this.service;
  }

  // Default createdBy to vendor if not provided
  if (!this.createdBy && this.vendor) {
    this.createdBy = this.vendor;
  }

  if (this.isNew && !this.customId) {
    const year = new Date().getFullYear();
    const prefix = 'PKG';
    const counterId = `${prefix}_${year}`;

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

  // Synchronize packageName <-> title and packageDescription <-> description
  if (this.packageName && !this.title) {
    this.title = this.packageName;
  } else if (this.title && !this.packageName) {
    this.packageName = this.title;
  }

  if (this.packageDescription && !this.description) {
    this.description = this.packageDescription;
  } else if (this.description && !this.packageDescription) {
    this.packageDescription = this.description;
  }

  // Capitalize title and packageName if present
  if (this.packageName) {
    this.packageName = this.packageName.trim().charAt(0).toUpperCase() + this.packageName.trim().slice(1);
  }
  if (this.title) {
    this.title = this.title.trim().charAt(0).toUpperCase() + this.title.trim().slice(1);
  }

  // Synchronize status and isActive
  if (this.status) {
    this.isActive = (this.status === 'Active');
  } else if (this.isActive !== undefined) {
    this.status = this.isActive ? 'Active' : 'Inactive';
  }
});

// Cascade delete reviews when a package is deleted
packageSchema.pre('remove', async function(next) {
  await this.model('Review').deleteMany({ package: this._id });
  next();
});

module.exports = mongoose.model('Package', packageSchema);

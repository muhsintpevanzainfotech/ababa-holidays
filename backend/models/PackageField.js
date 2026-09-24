const mongoose = require('mongoose');

const packageFieldSchema = new mongoose.Schema({
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },

  // Field Set / Section Grouping
  setId: {
    type: String,
    trim: true,
    default: null
  },
  setTitle: {
    type: String,
    trim: true,
    default: null
  },
  setOrder: {
    type: Number,
    default: 0
  },

  label: {
    type: String,
    required: [true, 'Label is required'],
    trim: true
  },
  fieldName: {
    type: String,
    required: [true, 'Field name is required'],
    trim: true
  },
  fieldType: {
    type: String,
    required: [true, 'Field type is required'],
    enum: ['text', 'number', 'textarea', 'password', 'checkbox', 'radio', 'switch', 'select', 'upload', 'tag', 'map', 'date', 'datetime', 'time', 'month', 'week', 'email', 'phone', 'url', 'search', 'otp', 'location', 'payment', 'image', 'rating', 'editor', 'feature', 'section_header', 'hero', 'features', 'pricing', 'testimonials']
  },
  isRequired: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  },
  secondaryLabel: {
    type: String,
    trim: true
  },
  colSm: {
    type: Number,
    default: 12
  },
  colMd: {
    type: Number,
    default: 6
  },
  colLg: {
    type: Number,
    default: 6
  },
  colXl: {
    type: Number,
    default: 6
  },
  colSpan: {
    type: Number,
    default: 6
  },
  showInCard: {
    type: Boolean,
    default: false
  },
  config: {
    // Text/Textarea
    minLength: { type: Number },
    maxLength: { type: Number },
    rows: { type: Number },
    
    // Select
    options: [{
      label: { type: String },
      value: { type: String },
      image: { type: String }
    }],
    searchable: { type: Boolean, default: false },
    multiple: { type: Boolean, default: false },
    withImage: { type: Boolean, default: false },
    
    // Upload
    minFiles: { type: Number, default: 1 },
    maxFiles: { type: Number, default: 5 },
    accept: [{ type: String, enum: ['image', 'video', 'pdf', 'zip'] }],

    // Switch
    activeLabel: { type: String },
    inactiveLabel: { type: String },

    // Date
    pastLimit: { type: Number },
    futureLimit: { type: Number },
    disableWeekends: { type: Boolean },

    // Map
    mapMode: { type: String },
    withSatellite: { type: Boolean },

    // Tag
    allowCustom: { type: Boolean }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Pre-save hook to auto-generate setId if setTitle is provided but setId is missing
packageFieldSchema.pre('save', function (next) {
  if (this.setTitle && !this.setId) {
    const slug = this.setTitle
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/(^_|_$)/g, '');
    this.setId = `set_${slug || 'group'}_${Date.now().toString(36)}`;
  }
  next();
});

// Unique fieldName per service
packageFieldSchema.index({ service: 1, fieldName: 1 }, { unique: true });

module.exports = mongoose.model('PackageField', packageFieldSchema);

const mongoose = require('mongoose');

const brandSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  logos: {
    small: { type: String, default: '/public/defaults/default_travel.png' },
    medium: { type: String, default: '/public/defaults/default_travel.png' },
    large: { type: String, default: '/public/defaults/default_travel.png' }
  },
  seo: {
    title: { type: String },
    description: { type: String },
    keywords: [{ type: String }]
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Brand', brandSchema);

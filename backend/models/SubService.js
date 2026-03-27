const mongoose = require('mongoose');

const subServiceSchema = new mongoose.Schema({
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please add a sub-service title'],
    trim: true
  },
  description: {
    type: String
  },
  icon: {
    type: String,
    default: '/public/defaults/default_travel.png'
  },
  image: {
    type: String,
    default: '/public/defaults/default_travel.png'
  },
  seo: {
    title: { type: String },
    description: { type: String },
    keywords: [{ type: String }]
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SubService', subServiceSchema);

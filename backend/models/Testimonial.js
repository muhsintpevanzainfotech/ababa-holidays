const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Null if global/admin testimonial
  },
  customerName: {
    type: String,
    required: true
  },
  customerDesignation: {
    type: String
  },
  content: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: 'https://ui-avatars.com/api/?name=Customer&background=random'
  },
  video: {
    type: String
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  isTopPick: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Testimonial', testimonialSchema);

const mongoose = require('mongoose');

const destinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a destination name'],
    trim: true
  },
  state: {
    type: mongoose.Schema.ObjectId,
    ref: 'State',
    required: true
  },
  image: {
    type: String,
    default: 'default-destination.jpg'
  },
  description: {
    type: String
  },
  category: {
    type: String,
    enum: ['City', 'Beach', 'Mountain', 'Historical', 'Desert', 'Other'],
    default: 'Other'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  latitude: {
    type: Number
  },
  longitude: {
    type: Number
  }
}, {
  timestamps: true
});

// Avoid duplicate destination names in the same state
destinationSchema.index({ name: 1, state: 1 }, { unique: true });

module.exports = mongoose.model('Destination', destinationSchema);

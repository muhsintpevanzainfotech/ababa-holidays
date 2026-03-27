const mongoose = require('mongoose');

const stateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a state name'],
    trim: true
  },
  country: {
    type: mongoose.Schema.ObjectId,
    ref: 'Country',
    required: true
  },
  image: {
    type: String,
    default: 'default-state.jpg'
  },
  description: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Avoid duplicate state names in the same country
stateSchema.index({ name: 1, country: 1 }, { unique: true });

module.exports = mongoose.model('State', stateSchema);

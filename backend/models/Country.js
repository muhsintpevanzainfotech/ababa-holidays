const mongoose = require('mongoose');

const countrySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a country name'],
    unique: true,
    trim: true
  },
  code: {
    type: String,
    trim: true
  },
  dialCode: {
    type: String,
    trim: true
  },
  image: {
    type: String,
    default: 'default-country.jpg'
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

module.exports = mongoose.model('Country', countrySchema);

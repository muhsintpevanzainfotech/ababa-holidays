const mongoose = require('mongoose');

const aboutUsSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null // null for global/admin About Us
  },
  title: {
    type: String,
    required: [true, 'Please add a title'],
    default: 'About Us'
  },
  content: {
    type: String,
    required: [true, 'Please add content']
  },
  mission: {
    type: String
  },
  vision: {
    type: String
  },
  image: {
    type: String
  },
  seo: {
    title: { type: String },
    description: { type: String },
    keywords: [{ type: String }]
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AboutUs', aboutUsSchema);

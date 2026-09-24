const mongoose = require('mongoose');

const contactUsSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // If global contact us, it can be null; if vendor-specific, it will have vendor ID
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String
  },
  subject: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  file: {
    type: String
  },
  status: {
    type: String,
    enum: ['Unread', 'Read', 'Replied'],
    default: 'Unread'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('ContactUs', contactUsSchema);

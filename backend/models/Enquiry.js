const mongoose = require('mongoose');

const followupSchema = new mongoose.Schema({
  note: {
    type: String,
    required: true
  },
  followedUpBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const enquirySchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
  serviceOfInterest: {
    type: String
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
    enum: ['New', 'In Progress', 'Closed'],
    default: 'New'
  },
  followUps: [followupSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Enquiry', enquirySchema);

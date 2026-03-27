const mongoose = require('mongoose');

const instagramReelSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reelUrl: {
    type: String,
    required: [false] // Making it optional if video is uploaded
  },
  video: {
    type: String
  },
  caption: {
    type: String
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

module.exports = mongoose.model('InstagramReel', instagramReelSchema);

const mongoose = require('mongoose');
const Counter = require('./Counter');

const offerBannerSchema = new mongoose.Schema({
  customId: {
    type: String,
    unique: true
  },
  title: {
    type: String,
    required: [true, 'Please add a title']
  },
  description: {
    type: String
  },
  image: {
    type: String,
    required: [true, 'Please add an image']
  },
  link: {
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
  },
  userRole: {
    type: String,
    enum: ['Admin', 'Vendor'],
    required: true
  }
}, {
  timestamps: true
});

// Generate Custom ID
offerBannerSchema.pre('save', async function () {
  if (this.isNew && !this.customId) {
    const year = new Date().getFullYear();
    const prefix = 'BAN';
    const counterId = `${prefix}_${year}`;

    const counter = await Counter.findOneAndUpdate(
      { id: counterId },
      { $inc: { seq: 1 } },
      { returnDocument: 'after', upsert: true }
    );

    const seqString = counter.seq.toString().padStart(5, '0');
    this.customId = `${prefix}${year}${seqString}`;
  }
});

module.exports = mongoose.model('OfferBanner', offerBannerSchema);

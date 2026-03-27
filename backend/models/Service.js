const mongoose = require('mongoose');

const Counter = require('./Counter');

const serviceSchema = new mongoose.Schema({
  customId: {
    type: String,
    unique: true
  },
  title: {
    type: String,
    required: [true, 'Please add a service title'],
    trim: true
  },
  description: {
    type: String
  },
  icon: {
    type: String
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

// Generate Custom ID
serviceSchema.pre('save', async function () {
  if (this.isNew && !this.customId) {
    const year = new Date().getFullYear();
    const prefix = 'SER';
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

module.exports = mongoose.model('Service', serviceSchema);

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

    // If this is the very first record, reset the counter
    const count = await this.constructor.countDocuments();
    if (count === 0) {
       await Counter.findOneAndUpdate({ id: counterId }, { seq: 0 });
    }

    const counter = await Counter.findOneAndUpdate(
      { id: counterId },
      { $inc: { seq: 1 } },
      { returnDocument: 'after', upsert: true }
    );

    const seqString = counter.seq.toString().padStart(5, '0');
    this.customId = `${prefix}${year}${seqString}`;
  }

  // Capitalize title and description
  if (this.title) {
    this.title = this.title.trim().charAt(0).toUpperCase() + this.title.trim().slice(1);
  }
  if (this.description) {
    this.description = this.description.trim().charAt(0).toUpperCase() + this.description.trim().slice(1);
  }
});

module.exports = mongoose.model('Service', serviceSchema);

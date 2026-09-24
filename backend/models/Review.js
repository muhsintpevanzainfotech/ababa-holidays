const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Please add a rating between 1 and 5']
  },
  comment: {
    type: String,
    required: [true, 'Please add a comment']
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  package: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    required: true
  }
}, {
  timestamps: true
});

// Prevent user from submitting more than one review per package
reviewSchema.index({ package: 1, user: 1 }, { unique: true });

// Static method to get avg rating and save
reviewSchema.statics.getAverageRating = async function(packageId) {
  const obj = await this.aggregate([
    {
      $match: { package: packageId }
    },
    {
      $group: {
        _id: '$package',
        averageRating: { $avg: '$rating' }
      }
    }
  ]);

  try {
    await this.model('Package').findByIdAndUpdate(packageId, {
      averageRating: obj[0] ? Math.round(obj[0].averageRating * 10) / 10 : undefined
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageRating after save
reviewSchema.post('save', function() {
  this.constructor.getAverageRating(this.package);
});

// Call getAverageRating before remove
reviewSchema.pre('remove', function() {
  this.constructor.getAverageRating(this.package);
});

module.exports = mongoose.model('Review', reviewSchema);

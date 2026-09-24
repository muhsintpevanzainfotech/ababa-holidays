const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  package: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    required: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  travelDate: {
    type: Date,
    required: [true, 'Please add a travel date']
  },
  passengerDetails: [{
    name: String,
    age: Number,
    gender: String
  }],
  contactDetails: {
    email: String,
    phone: String,
    address: String
  },
  totalPrice: {
    type: Number,
    required: true
  },
  bookingStatus: {
    type: String,
    enum: ['Pending', 'Confirmed', 'Cancelled', 'Completed'],
    default: 'Pending'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'Refunded'],
    default: 'Pending'
  }
}, {
  timestamps: true
});

// Indexes for performance
bookingSchema.index({ user: 1 });
bookingSchema.index({ vendor: 1 });
bookingSchema.index({ package: 1 });

module.exports = mongoose.model('Booking', bookingSchema);

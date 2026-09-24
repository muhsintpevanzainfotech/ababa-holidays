const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['Admin', 'Sub-Admin', 'Staff'],
    required: true,
    default: 'Staff'
  },
  department: {
    type: String,
    default: 'Operations & Management'
  },
  designation: {
    type: String,
    default: 'Admin Staff Member'
  },
  permissions: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['Active', 'Suspended', 'Inactive'],
    default: 'Active'
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Admin', adminSchema);

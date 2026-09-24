const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a role name'],
    unique: true,
    trim: true
  },
  badge: {
    type: String,
    default: 'CUSTOM ROLE'
  },
  color: {
    type: String,
    default: '#4f46e5'
  },
  description: {
    type: String,
    default: ''
  },
  isSystem: {
    type: Boolean,
    default: false
  },
  permissions: [{
    type: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Role', roleSchema);

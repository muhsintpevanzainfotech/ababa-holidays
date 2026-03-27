const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Counter = require('./Counter');

const userSchema = new mongoose.Schema({
  customId: {
    type: String,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Please add a name']
  },
  email: {
    type: String,
    required: [true, 'Please add an email'],
    unique: true,
    match: [
      /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
      'Please add a valid email'
    ]
  },
  password: {
    type: String,
    required: function () {
      // Password is required only if not using Google login
      return !this.googleId;
    },
    select: false // Do not return password by default
  },
  googleId: {
    type: String
  },
  role: {
    type: String,
    enum: ['Admin', 'Sub-Admin', 'Vendor', 'Vendor-Staff', 'User'],
    default: 'User'
  },
  managedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Refers to the Vendor (if Vendor-Staff) or Admin (if Sub-Admin)
    default: null
  },
  permissions: [{
    type: String // e.g., 'manage_packages', 'manage_bookings', 'manage_users'
  }],
  avatar: {
    type: String,
    default: 'https://ui-avatars.com/api/?name=User&background=random'
  },
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  phone: {
    type: String,
    unique: true,
    sparse: true // Allow nulls for unique index
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: String,
  otpExpire: Date,
  refreshToken: String,

  // Saved Packages for Users
  savedPackages: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package'
  }],
  isSuspended: {
    type: Boolean,
    default: false
  },
  lastActive: {
    type: Date,
    default: Date.now
  },
  isOnline: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for Vendor Profile
userSchema.virtual('profile', {
  ref: 'VendorProfile',
  localField: '_id',
  foreignField: 'user',
  justOne: true
});

// Encrypt password and generate Custom ID
userSchema.pre('save', async function () {
  // Generate Custom ID for new users
  if (this.isNew && !this.customId) {
    const year = new Date().getFullYear();
    const prefixes = {
      'Admin': 'ADM',
      'Sub-Admin': 'SAD',
      'Vendor': 'VEN',
      'Vendor-Staff': 'VNS',
      'User': 'USE'
    };

    const prefix = prefixes[this.role] || 'USR';
    const counterId = `${prefix}_${year}`;

    // Increment counter atomically
    const counter = await Counter.findOneAndUpdate(
      { id: counterId },
      { $inc: { seq: 1 } },
      { returnDocument: 'after', upsert: true }
    );

    // Format: PREFIX + YEAR + 5-digit SEQ (e.g., SAD202600001)
    const seqString = counter.seq.toString().padStart(5, '0');
    this.customId = `${prefix}${year}${seqString}`;
  }

  if (!this.isModified('password') || !this.password) {
    return;
  }

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

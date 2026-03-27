const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const bcrypt = require('bcryptjs');

// Load env from current folder
dotenv.config();

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, default: 'Admin' },
  name: { type: String, default: 'Muhsin Admin' },
  isVerified: { type: Boolean, default: true }
}, { timestamps: true });

// Pre-save hook for password hashing (simplified for script)
UserSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model('User', UserSchema);

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const email = 'muhsinadmin@gmail.com';
    const password = 'Admin@123';

    // Delete existing if any to ensure fresh password
    await User.deleteOne({ email });

    const admin = new User({
      email,
      password,
      role: 'Admin',
      name: 'Muhsin Admin',
      isVerified: true
    });

    await admin.save();
    console.log('Admin user created successfully');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

createAdmin();

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');

dotenv.config();

async function createAdmin() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI is missing in .env');
    process.exit(1);
  }
  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 20000,
    });
    console.log(`Connected to MongoDB: ${conn.connection.host}`);

    const email = 'muhsinadmin@gmail.com';
    const password = 'Admin@123';

    await User.deleteOne({ email });

    const admin = new User({
      name: 'Muhsin Admin',
      email,
      password,
      role: 'Admin',
      phone: '+919876543210',
      isVerified: true,
      isSuspended: false
    });

    await admin.save();
    console.log('====================================');
    console.log('Admin account created successfully!');
    console.log(`Email:    ${email}`);
    console.log(`Password: ${password}`);
    console.log(`Role:     Admin`);
    console.log(`CustomId: ${admin.customId}`);
    console.log('====================================');

    process.exit(0);
  } catch (err) {
    console.error('Failed to create admin user:', err.message);
    process.exit(1);
  }
}

createAdmin();

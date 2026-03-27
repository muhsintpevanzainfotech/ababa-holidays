const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Counter = require('./models/Counter');

dotenv.config();

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected...');

    const adminEmail = 'admin@example.com'; // Change this to your desired admin email
    const adminPassword = 'adminpassword123'; // Change this to a strong password

    const existingAdmin = await User.findOne({ email: adminEmail });

    if (existingAdmin) {
      console.log('Admin already exists!');
      process.exit(0);
    }

    // Role is explicitly set to Admin here
    const admin = new User({
      name: 'System Admin',
      email: adminEmail,
      password: adminPassword,
      role: 'Admin',
      isVerified: true
    });

    await admin.save();

    console.log('====================================');
    console.log('Admin Created Successfully!');
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log('====================================');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();

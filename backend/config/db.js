const mongoose = require('mongoose');
const dns = require('dns');

// Fix for Node.js / Windows DNS SRV lookup failures (querySrv ECONNREFUSED) with MongoDB Atlas
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
  if (dns.setDefaultResultOrder) {
    dns.setDefaultResultOrder('ipv4first');
  }
} catch (err) {
  console.warn('DNS server override warning:', err.message);
}

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('CRITICAL ERROR: MONGO_URI is not defined in environment variables.');
    process.exit(1);
  }

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      family: 4,
    });
    console.log(`MongoDB Connected (Atlas): ${conn.connection.host} / Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`MongoDB Atlas Connection Error: ${error.message}`);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Waiting for network reconnection...');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected successfully.');
});

module.exports = connectDB;


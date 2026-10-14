const mongoose = require('mongoose');
const dns = require('dns');

// Fix for Node.js / Windows DNS SRV lookup failures with MongoDB Atlas while preserving system DNS
try {
  const currentServers = dns.getServers() || [];
  const fallbackServers = ['8.8.8.8', '1.1.1.1', '8.8.4.4'];
  const mergedServers = Array.from(new Set([...currentServers, ...fallbackServers])).filter(Boolean);
  if (mergedServers.length > 0) {
    dns.setServers(mergedServers);
  }
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
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 1,
      retryWrites: true,
      w: 'majority'
    });
    console.log(`MongoDB Connected (Atlas): ${conn.connection.host} / Database: ${conn.connection.name}`);
  } catch (error) {
    console.error(`MongoDB Atlas Connection Error: ${error.message}`);
  }
};

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Waiting for network reconnection...');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected successfully.');
});

module.exports = connectDB;


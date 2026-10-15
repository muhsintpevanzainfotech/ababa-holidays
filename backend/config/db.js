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

let cachedPromise = null;

const connectDB = async () => {
  // If already connected, reuse existing connection
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // If connection is in progress, wait for it
  if (cachedPromise) {
    return cachedPromise;
  }

  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error('CRITICAL ERROR: MONGO_URI is not defined in environment variables.');
    return null;
  }

  try {
    cachedPromise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      connectTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 1,
      retryWrites: true,
      w: 'majority'
    }).then((conn) => {
      console.log(`MongoDB Connected (Atlas): ${conn.connection.host} / Database: ${conn.connection.name}`);
      return conn;
    }).catch((err) => {
      cachedPromise = null;
      console.error(`MongoDB Atlas Connection Error: ${err.message}`);
      throw err;
    });

    return await cachedPromise;
  } catch (error) {
    cachedPromise = null;
    console.error(`MongoDB connection failed: ${error.message}`);
    throw error;
  }
};

mongoose.connection.on('error', (err) => {
  console.error('MongoDB connection error:', err.message);
});

mongoose.connection.on('disconnected', () => {
  cachedPromise = null;
  console.warn('MongoDB disconnected. Waiting for reconnection...');
});

mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected successfully.');
});

module.exports = connectDB;


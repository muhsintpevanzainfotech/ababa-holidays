require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');

// Connect to Database immediately
connectDB().catch((err) => console.warn('Initial DB connection attempt warning:', err.message));

const app = express();

// Security Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors());

// Ensure Database is connected for every request (essential for Vercel Serverless Functions)
app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch (err) {
    console.warn('DB connection middleware warning:', err.message);
  }
  next();
});

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10000, // Increased for development
});
app.use('/api', limiter);

const path = require('path');

// Body Parser Middleware (Exclude Stripe Webhook)
app.use((req, res, next) => {
  if (req.originalUrl === '/api/payments/webhook') {
    next();
  } else {
    express.json()(req, res, (err) => {
      if (err) return next(err);
      express.urlencoded({ extended: true })(req, res, next);
    });
  }
});

// Set Static Folders
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Default Route
app.get('/', (req, res) => {
  res.send('Travel Booking Platform API is running...');
});

// Import Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/notifications', require('./routes/notificationRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/vendors', require('./routes/vendorRoutes'));
app.use('/api/brands', require('./routes/brandRoutes'));
app.use('/api/services', require('./routes/serviceRoutes'));
app.use('/api/subscriptions', require('./routes/subscriptionRoutes'));
app.use('/api/packages', require('./routes/packageRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/reviews', require('./routes/reviewRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/sub-services', require('./routes/subServiceRoutes'));
app.use('/api/blogs', require('./routes/blogRoutes'));
app.use('/api/aboutus', require('./routes/aboutUsRoutes'));
app.use('/api/instagram-reels', require('./routes/instagramReelRoutes'));
app.use('/api/countries', require('./routes/countryRoutes'));
app.use('/api/states', require('./routes/stateRoutes'));
app.use('/api/destinations', require('./routes/destinationRoutes'));

// CRM Routes
app.use('/api/testimonials', require('./routes/testimonialRoutes'));
app.use('/api/contact-us', require('./routes/contactUsRoutes'));
app.use('/api/enquiries', require('./routes/enquiryRoutes'));
app.use('/api/banners', require('./routes/offerBannerRoutes'));
app.use('/api/policies', require('./routes/policyRoutes'));

app.use('/api/complaints', require('./routes/complaintRoutes'));
app.use('/api/settings', require('./routes/settingRoutes'));
app.use('/api/package-fields', require('./routes/packageFieldRoutes'));
app.use('/api/coupons', require('./routes/couponRoutes'));
app.use('/api/roles', require('./routes/roleRoutes'));

// External Public API for Vendor Website Integration
app.use('/api/v1/external', require('./routes/externalApiRoutes'));

// Global Error Handler Middleware
const { errorHandler } = require('./middleware/errorMiddleware');
app.use(errorHandler);

module.exports = app;

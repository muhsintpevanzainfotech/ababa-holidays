const express = require('express');
const {
  getVendorExternalProfile,
  getVendorExternalPackages,
  getVendorExternalPackageById,
  checkVendorPackageAvailability,
  createVendorExternalBooking,
  getVendorExternalServices,
  getVendorExternalBanners,
  getVendorExternalBlogs,
  getVendorExternalBlogById,
  getVendorExternalTestimonials,
  createVendorExternalEnquiry,
  createVendorExternalContactUs,
  getVendorExternalPolicies
} = require('../controllers/externalApiController');
const apiKeyAuth = require('../middleware/apiKeyAuth');

const router = express.Router();

// Apply API Key security authentication middleware to all external API routes
router.use(apiKeyAuth);

router.get('/profile', getVendorExternalProfile);
router.get('/services', getVendorExternalServices);
router.get('/packages', getVendorExternalPackages);
router.get('/packages/:id', getVendorExternalPackageById);
router.get('/availability', checkVendorPackageAvailability);
router.post('/bookings', createVendorExternalBooking);
router.get('/banners', getVendorExternalBanners);
router.get('/blogs', getVendorExternalBlogs);
router.get('/blogs/:id', getVendorExternalBlogById);
router.get('/testimonials', getVendorExternalTestimonials);
router.post('/enquiries', createVendorExternalEnquiry);
router.post('/contact-us', createVendorExternalContactUs);
router.get('/policies', getVendorExternalPolicies);

module.exports = router;

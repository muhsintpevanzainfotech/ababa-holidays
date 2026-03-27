const express = require('express');
const {
  createTestimonial,
  getTestimonials,
  updateTestimonial,
  deleteTestimonial
} = require('../controllers/testimonialController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { createUpload } = upload;
const testimonialUpload = createUpload('testimonials');

const router = express.Router();

// Public route for customers to submit testimonials
router.post('/submit', testimonialUpload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), createTestimonial);

// Protected routes for management
router.post('/', protect, testimonialUpload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), createTestimonial);
router.get('/', protect, getTestimonials);

// Vendor/Admin routes
router.put('/:id', protect, authorize('Vendor', 'Admin', 'Sub-Admin'), testimonialUpload.fields([{ name: 'image', maxCount: 1 }, { name: 'video', maxCount: 1 }]), updateTestimonial);
router.delete('/:id', protect, authorize('Vendor', 'Admin', 'Sub-Admin'), deleteTestimonial);

module.exports = router;

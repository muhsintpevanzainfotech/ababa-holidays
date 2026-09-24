const express = require('express');
const {
  createEnquiry,
  getEnquiries,
  updateEnquiry,
  addFollowUp,
  deleteEnquiry
} = require('../controllers/enquiryController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Public route for customers
router.post('/', upload.single('file'), createEnquiry);

// Protected routes for managing enquiries
router.get('/', protect, authorize('Vendor', 'Admin', 'Sub-Admin'), getEnquiries);
router.put('/:id', protect, authorize('Vendor', 'Admin', 'Sub-Admin'), updateEnquiry);
router.post('/:id/followup', protect, authorize('Vendor', 'Admin', 'Sub-Admin'), addFollowUp);
router.delete('/:id', protect, authorize('Vendor', 'Admin', 'Sub-Admin'), deleteEnquiry);

module.exports = router;

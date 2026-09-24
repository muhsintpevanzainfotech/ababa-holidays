const express = require('express');
const {
  createContactMessage,
  getContactMessages,
  updateContactMessage,
  deleteContactMessage
} = require('../controllers/contactUsController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// Public route for customers to submit a contact message
router.post('/', upload.single('file'), createContactMessage);

// Protected routes for managing messages
router.get('/', protect, authorize('Vendor', 'Admin', 'Sub-Admin'), getContactMessages);
router.put('/:id', protect, authorize('Vendor', 'Admin', 'Sub-Admin'), updateContactMessage);
router.delete('/:id', protect, authorize('Vendor', 'Admin', 'Sub-Admin'), deleteContactMessage);

module.exports = router;

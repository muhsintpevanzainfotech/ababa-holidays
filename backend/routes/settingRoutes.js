const express = require('express');
const router = express.Router();
const { 
  generatePasskey, 
  verifyPasskey, 
  getPasskeyStatus, 
  togglePasskeyStatus,
  getSocialLinks,
  updateSocialLinks,
  getContactDetails,
  updateContactDetails
} = require('../controllers/settingsController');
const { protect } = require('../middleware/authMiddleware');

router.get('/passkey-status', protect, getPasskeyStatus);
router.post('/toggle-passkey', protect, togglePasskeyStatus);
router.post('/generate-passkey', protect, generatePasskey);
router.post('/verify-passkey', protect, verifyPasskey);

// System Social Media Links Routes
router.get('/social-links', getSocialLinks);
router.post('/social-links', protect, updateSocialLinks);

// System Contact & Support Information Routes
router.get('/contact-details', getContactDetails);
router.post('/contact-details', protect, updateContactDetails);

module.exports = router;



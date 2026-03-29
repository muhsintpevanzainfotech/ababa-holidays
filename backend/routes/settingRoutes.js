const express = require('express');
const router = express.Router();
const { generatePasskey, verifyPasskey } = require('../controllers/settingsController');
const { protect } = require('../middleware/authMiddleware');

router.post('/generate-passkey', protect, generatePasskey);
router.post('/verify-passkey', protect, verifyPasskey);

module.exports = router;

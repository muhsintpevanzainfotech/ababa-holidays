const express = require('express');
const { getAboutUs, updateAboutUs } = require('../controllers/aboutUsController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

router.get('/', getAboutUs);

router.put('/', protect, authorize('Admin', 'Sub-Admin', 'Vendor'), upload.single('image'), updateAboutUs);

module.exports = router;

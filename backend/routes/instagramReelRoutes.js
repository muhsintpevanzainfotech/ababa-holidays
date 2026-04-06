const express = require('express');
const {
  createReel,
  getReels,
  getReel,
  updateReel,
  deleteReel
} = require('../controllers/instagramReelController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { createUpload } = require('../middleware/uploadMiddleware');
const upload = createUpload('reels');

const router = express.Router();

// Public routes (Internal dashboard uses auth context to see all/own)
router.get('/', (req, res, next) => {
  if (req.headers.authorization) {
    return protect(req, res, next);
  }
  next();
}, getReels);
router.get('/:id', getReel);

// Protected routes (Admin/Sub-Admin/Vendor)
router.post('/', protect, authorize('Admin', 'Sub-Admin', 'Vendor'), upload.single('video'), createReel);
router.put('/:id', protect, authorize('Admin', 'Sub-Admin', 'Vendor'), upload.single('video'), updateReel);
router.delete('/:id', protect, authorize('Admin', 'Sub-Admin', 'Vendor'), deleteReel);

module.exports = router;

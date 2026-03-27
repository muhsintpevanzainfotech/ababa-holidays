const express = require('express');
const {
  createReel,
  getReels,
  getReel,
  updateReel,
  deleteReel
} = require('../controllers/instagramReelController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', getReels);
router.get('/:id', getReel);

// Protected routes (Admin/Sub-Admin/Vendor)
router.post('/', protect, authorize('Admin', 'Sub-Admin', 'Vendor'), createReel);
router.put('/:id', protect, authorize('Admin', 'Sub-Admin', 'Vendor'), updateReel);
router.delete('/:id', protect, authorize('Admin', 'Sub-Admin', 'Vendor'), deleteReel);

module.exports = router;

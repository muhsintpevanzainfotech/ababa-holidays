const express = require('express');
const {
  createBrand,
  getBrands,
  getBrand,
  updateBrand,
  deleteBrand
} = require('../controllers/brandController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { createUpload } = upload;
const brandUpload = createUpload('brands');

const router = express.Router();

// Public routes
router.get('/', getBrands);
router.get('/:id', getBrand);

// Protected routes (Vendor/Admin)
router.post('/', protect, authorize('Vendor', 'Admin', 'Sub-Admin'), brandUpload.fields([
  { name: 'small', maxCount: 1 },
  { name: 'medium', maxCount: 1 },
  { name: 'large', maxCount: 1 }
]), createBrand);

router.put('/:id', protect, authorize('Vendor', 'Admin', 'Sub-Admin'), brandUpload.fields([
  { name: 'small', maxCount: 1 },
  { name: 'medium', maxCount: 1 },
  { name: 'large', maxCount: 1 }
]), updateBrand);

router.delete('/:id', protect, authorize('Vendor', 'Admin', 'Sub-Admin'), deleteBrand);

module.exports = router;

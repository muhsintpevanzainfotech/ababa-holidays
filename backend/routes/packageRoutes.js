const express = require('express');
const {
  getPackages,
  getPackage,
  createPackage,
  updatePackage,
  deletePackage
} = require('../controllers/packageController');

const { protect, authorize } = require('../middleware/authMiddleware');
const { createUpload } = require('../middleware/uploadMiddleware');
const upload = createUpload('packages');

const router = express.Router();

router.route('/')
  .get(getPackages)
  .post(protect, authorize('Vendor', 'Vendor-Staff', 'Admin'), upload.array('images', 5), createPackage);

router.route('/:id')
  .get(getPackage)
  .put(protect, authorize('Vendor', 'Vendor-Staff', 'Admin'), upload.array('images', 5), updatePackage)
  .delete(protect, authorize('Vendor', 'Vendor-Staff', 'Admin'), deletePackage);

module.exports = router;

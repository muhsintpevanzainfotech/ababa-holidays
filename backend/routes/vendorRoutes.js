const express = require('express');
const {
  getVendors,
  deleteVendor,
  createVendor,
  approveVendor,
  updateSubscription,
  updateVendorProfile,
  getVendor
} = require('../controllers/vendorController');
const { register, login } = require('../controllers/authController');

const { protect, authorize } = require('../middleware/authMiddleware');
const { createUpload } = require('../middleware/uploadMiddleware');
const upload = createUpload('vendors');

const router = express.Router();

const vendorUploadFields = [
  { name: 'avatar', maxCount: 1 },
  { name: 'idCard', maxCount: 1 },
  { name: 'tinUpload', maxCount: 1 },
  { name: 'gstUpload', maxCount: 1 },
  { name: 'bankUpload', maxCount: 1 },
  { name: 'logoS', maxCount: 1 },
  { name: 'logoM', maxCount: 1 },
  { name: 'logoL', maxCount: 1 }
];

// Public routes to register and login vendor
router.post('/register', upload.fields(vendorUploadFields), register);
router.post('/login', upload.none(), login);

// Profile Update route (Vendor only)
router.put('/profile', protect, authorize('Vendor'), upload.fields(vendorUploadFields), updateVendorProfile);

// Admin routes
router.put('/:id/approve', protect, authorize('Admin', 'Sub-Admin'), approveVendor);
router.get('/:id', protect, authorize('Admin', 'Sub-Admin'), getVendor);
router.route('/')
  .get(protect, authorize('Admin', 'Sub-Admin'), getVendors)
  .post(protect, authorize('Admin'), upload.fields(vendorUploadFields), createVendor);

router.delete('/:id', protect, authorize('Admin'), deleteVendor);

// Vendor & Admin route
router.put('/:id/subscription', protect, authorize('Admin', 'Vendor'), updateSubscription);


module.exports = router;

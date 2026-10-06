const express = require('express');
const {
  getVendors,
  deleteVendor,
  createVendor,
  approveVendor,
  updateSubscription,
  updateVendorProfile,
  getVendorProfile,
  getVendor,
  updateVendor,
  getVendorStaff,
  createVendorStaff,
  updateVendorStaff,
  deleteVendorStaff,
  getVendorWallet,
  requestVendorPayout,
  getVendorApiKey,
  generateVendorApiKey,
  revokeVendorApiKey
} = require('../controllers/vendorController');
const { register, login } = require('../controllers/authController');

const { protect, authorize } = require('../middleware/authMiddleware');
const { createUpload } = require('../middleware/uploadMiddleware');
const upload = createUpload('vendors');

const router = express.Router();

const vendorUploadFields = [
  { name: 'avatar', maxCount: 1 },
  { name: 'coverBanner', maxCount: 1 },
  { name: 'idCard', maxCount: 1 },
  { name: 'idCardFile', maxCount: 1 },
  { name: 'tinUpload', maxCount: 1 },
  { name: 'tinFile', maxCount: 1 },
  { name: 'panUpload', maxCount: 1 },
  { name: 'panFile', maxCount: 1 },
  { name: 'gstUpload', maxCount: 1 },
  { name: 'gstFile', maxCount: 1 },
  { name: 'bankUpload', maxCount: 1 },
  { name: 'bankFile', maxCount: 1 },
  { name: 'passbookUpload', maxCount: 1 },
  { name: 'passbookFile', maxCount: 1 },
  { name: 'tradeLicenseUpload', maxCount: 1 },
  { name: 'tradeLicenseFile', maxCount: 1 },
  { name: 'logoS', maxCount: 1 },
  { name: 'logoM', maxCount: 1 },
  { name: 'logoL', maxCount: 1 }
];

// Public routes to register and login vendor
router.post('/register', upload.fields(vendorUploadFields), register);
router.post('/login', upload.none(), login);

// Profile routes (Vendor or Vendor-Staff)
router.get('/profile', protect, authorize('Vendor', 'Vendor-Staff', 'Staff'), getVendorProfile);
router.put('/profile', protect, authorize('Vendor', 'Vendor-Staff', 'Staff'), upload.fields(vendorUploadFields), updateVendorProfile);

// Vendor API Key Management routes
router.get('/api-key', protect, authorize('Vendor', 'Vendor-Staff', 'Staff', 'Admin'), getVendorApiKey);
router.post('/api-key/generate', protect, authorize('Vendor', 'Admin'), generateVendorApiKey);
router.delete('/api-key', protect, authorize('Vendor', 'Admin'), revokeVendorApiKey);

// Wallet & Financial Payout routes
router.get('/wallet', protect, authorize('Vendor', 'Vendor-Staff', 'Staff', 'Admin'), getVendorWallet);
router.post('/wallet/payout', protect, authorize('Vendor', 'Admin'), requestVendorPayout);

// Vendor Staff Management routes (Vendor or Admin)
router.route('/staff')
  .get(protect, authorize('Vendor', 'Admin'), getVendorStaff)
  .post(protect, authorize('Vendor', 'Admin'), createVendorStaff);

router.route('/staff/:id')
  .put(protect, authorize('Vendor', 'Admin'), updateVendorStaff)
  .delete(protect, authorize('Vendor', 'Admin'), deleteVendorStaff);

// Admin routes
router.put('/:id/approve', protect, authorize('Admin', 'Sub-Admin'), approveVendor);
router.route('/:id')
  .get(protect, authorize('Admin', 'Sub-Admin'), getVendor)
  .put(protect, authorize('Admin'), upload.fields(vendorUploadFields), updateVendor)
  .delete(protect, authorize('Admin'), deleteVendor);

router.route('/')
  .get(protect, authorize('Admin', 'Sub-Admin'), getVendors)
  .post(protect, authorize('Admin'), upload.fields(vendorUploadFields), createVendor);

// Vendor & Admin route
router.put('/:id/subscription', protect, authorize('Admin', 'Vendor'), updateSubscription);

module.exports = router;

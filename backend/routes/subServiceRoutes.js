const express = require('express');
const {
  createSubService,
  getSubServices,
  getSubService,
  updateSubService,
  deleteSubService
} = require('../controllers/subServiceController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { createUpload } = upload;
const subServiceUpload = createUpload('sub-services');

const router = express.Router();

// Public routes
router.get('/', getSubServices);
router.get('/:id', getSubService);

// Protected routes (Admin/Sub-Admin)
router.post('/', protect, authorize('Admin', 'Sub-Admin'), subServiceUpload.fields([
  { name: 'icon', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]), createSubService);

router.put('/:id', protect, authorize('Admin', 'Sub-Admin'), subServiceUpload.fields([
  { name: 'icon', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]), updateSubService);

router.delete('/:id', protect, authorize('Admin', 'Sub-Admin'), deleteSubService);

module.exports = router;

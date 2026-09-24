const express = require('express');
const {
  getServices,
  getService,
  createService,
  updateService,
  deleteService
} = require('../controllers/serviceController');

const { protect, authorize } = require('../middleware/authMiddleware');
const { createUpload } = require('../middleware/uploadMiddleware');
const upload = createUpload('services');

const router = express.Router();

router.route('/')
  .get(getServices)
  .post(protect, authorize('Admin', 'Sub-Admin'), upload.fields([
    { name: 'icon', maxCount: 1 },
    { name: 'image', maxCount: 1 }
  ]), createService);

router.route('/:id')
  .get(getService)
  .put(protect, authorize('Admin', 'Sub-Admin'), upload.fields([
    { name: 'icon', maxCount: 1 },
    { name: 'image', maxCount: 1 }
  ]), updateService)
  .delete(protect, authorize('Admin', 'Sub-Admin'), deleteService);

module.exports = router;

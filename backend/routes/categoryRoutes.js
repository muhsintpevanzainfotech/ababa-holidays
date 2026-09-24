const express = require('express');
const {
  createCategory,
  getCategories,
  getCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categoryController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { createUpload } = upload;
const categoryUpload = createUpload('categories');

const router = express.Router();

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategory);

// Protected routes (Admin/Sub-Admin)
router.post('/', protect, authorize('Admin', 'Sub-Admin'), categoryUpload.fields([
  { name: 'icon', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]), createCategory);

router.put('/:id', protect, authorize('Admin', 'Sub-Admin'), categoryUpload.fields([
  { name: 'icon', maxCount: 1 },
  { name: 'image', maxCount: 1 }
]), updateCategory);

router.delete('/:id', protect, authorize('Admin', 'Sub-Admin'), deleteCategory);

module.exports = router;

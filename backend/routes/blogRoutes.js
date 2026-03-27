const express = require('express');
const {
  createBlog,
  getBlogs,
  getBlog,
  updateBlog,
  deleteBlog
} = require('../controllers/blogController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { createUpload } = require('../middleware/uploadMiddleware');
const upload = createUpload('blogs');

const router = express.Router();

// Public routes
router.get('/', getBlogs);
router.get('/:id', getBlog);

// Protected routes (Admin/Sub-Admin/Vendor)
router.post('/', protect, authorize('Admin', 'Sub-Admin', 'Vendor'), upload.single('image'), createBlog);
router.put('/:id', protect, authorize('Admin', 'Sub-Admin', 'Vendor'), upload.single('image'), updateBlog);
router.delete('/:id', protect, authorize('Admin', 'Sub-Admin', 'Vendor'), deleteBlog);

module.exports = router;

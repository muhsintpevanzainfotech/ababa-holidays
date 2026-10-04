const express = require('express');
const {
  createBlog,
  getBlogs,
  getBlog,
  updateBlog,
  deleteBlog,
  getAdminBlogs,
  getVendorBlogs,
  getMyBlogs
} = require('../controllers/blogController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { createUpload } = require('../middleware/uploadMiddleware');
const upload = createUpload('blogs');

const router = express.Router();

// Public / Protected fetch routes
router.get('/', getBlogs);
router.get('/my-blogs', protect, getMyBlogs);
router.get('/admin', getAdminBlogs);
router.get('/vendor', getVendorBlogs);
router.get('/vendor/:id', getVendorBlogs);
router.get('/:id', getBlog);

// Protected routes (Admin/Sub-Admin/Vendor/Vendor-Staff)
router.post('/', protect, authorize('Admin', 'Sub-Admin', 'Vendor', 'Vendor-Staff'), upload.single('image'), createBlog);
router.put('/:id', protect, authorize('Admin', 'Sub-Admin', 'Vendor', 'Vendor-Staff'), upload.single('image'), updateBlog);
router.delete('/:id', protect, authorize('Admin', 'Sub-Admin', 'Vendor', 'Vendor-Staff'), deleteBlog);

module.exports = router;

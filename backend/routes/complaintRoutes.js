const express = require('express');
const {
  createComplaint,
  getComplaints,
  getUserComplaints,
  updateComplaint,
  deleteComplaint
} = require('../controllers/complaintController');
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

const router = express.Router();

// All routes are protected
router.use(protect);

router.post('/', upload.array('images', 5), createComplaint);
router.get('/', getComplaints);
router.get('/user/:userId', getUserComplaints);

// Update/Delete actions restricted to Admins
router.put('/:id', authorize('Admin', 'Sub-Admin'), updateComplaint);
router.delete('/:id', authorize('Admin'), deleteComplaint);

module.exports = router;

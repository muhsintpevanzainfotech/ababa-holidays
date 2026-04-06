const express = require('express');
const {
  getUserProfile,
  updateUserProfile,
  requestOTP,
  getUserBookings,
  savePackage,
  removeSavedPackage,
  getUsers,
  createUser,
  updateUser,
  deleteUser
} = require('../controllers/userController');

const { protect, authorize } = require('../middleware/authMiddleware');
const { createUpload } = require('../middleware/uploadMiddleware');
const upload = createUpload('avatars');

const router = express.Router();

router.post('/request-otp', protect, requestOTP);

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, upload.single('avatar'), updateUserProfile);

router.route('/bookings')
  .get(protect, getUserBookings);

router.route('/saved-packages/:packageId')
  .post(protect, savePackage)
  .delete(protect, removeSavedPackage);

// Admin only routes
router.route('/')
  .get(protect, authorize('Admin', 'Sub-Admin'), getUsers)
  .post(protect, authorize('Admin'), upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'idCard', maxCount: 1 },
    { name: 'tinUpload', maxCount: 1 },
    { name: 'gstUpload', maxCount: 1 },
    { name: 'bankUpload', maxCount: 1 },
    { name: 'logoS', maxCount: 1 },
    { name: 'logoM', maxCount: 1 },
    { name: 'logoL', maxCount: 1 }
  ]), createUser);

router.route('/:id')
  .put(protect, authorize('Admin', 'Sub-Admin'), upload.fields([
    { name: 'avatar', maxCount: 1 },
    { name: 'idCard', maxCount: 1 },
    { name: 'tinUpload', maxCount: 1 },
    { name: 'gstUpload', maxCount: 1 },
    { name: 'bankUpload', maxCount: 1 },
    { name: 'logoS', maxCount: 1 },
    { name: 'logoM', maxCount: 1 },
    { name: 'logoL', maxCount: 1 }
  ]), updateUser)
  .delete(protect, authorize('Admin', 'Sub-Admin'), deleteUser);

module.exports = router;

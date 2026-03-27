const express = require('express');
const {
  createBooking,
  getBookings,
  updateBookingStatus
} = require('../controllers/bookingController');

const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, createBooking)
  .get(protect, authorize('Vendor', 'Vendor-Staff', 'Admin'), getBookings);

router.route('/:id/status')
  .put(protect, authorize('Vendor', 'Vendor-Staff', 'Admin'), updateBookingStatus);

module.exports = router;

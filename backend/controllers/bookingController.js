const Booking = require('../models/Booking');
const Package = require('../models/Package');
const sendEmail = require('../services/emailService');

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private
const createBooking = async (req, res, next) => {
  try {
    const {
      packageId,
      travelDate,
      passengerDetails,
      contactDetails,
      totalPrice
    } = req.body;

    const pkg = await Package.findById(packageId);

    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    const booking = await Booking.create({
      user: req.user.id,
      package: packageId,
      vendor: pkg.vendor,
      travelDate,
      passengerDetails,
      contactDetails,
      totalPrice
    });

    // Send confirmation email to user
    try {
      await sendEmail({
        email: req.user.email,
        subject: 'Booking Confirmation - ABABA Travels',
        message: `Your booking for ${pkg.title} on ${new Date(travelDate).toDateString()} has been received. Status: Pending.`
      });
    } catch (err) {
      console.error('Email not sent', err);
    }

    // Send notification to vendor
    // (In a real app, fetch vendor email and send a similar notification)

    res.status(201).json({
      success: true,
      data: booking
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all bookings (Vendor or Admin)
// @route   GET /api/bookings
// @access  Private/(Vendor/Admin)
const getBookings = async (req, res, next) => {
  try {
    let query = {};

    // If Vendor, only show their bookings
    if (req.user.role === 'Vendor' || req.user.role === 'Sub Vendor') {
      query.vendor = req.user.id;
    }

    const bookings = await Booking.find(query)
      .populate('user', 'name email')
      .populate('package', 'title price');

    res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status
// @route   PUT /api/bookings/:id/status
// @access  Private/(Vendor/Admin)
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Ensure only the vendor who owns this booking or an Admin can update
    if (booking.vendor.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this booking' });
    }

    booking.bookingStatus = status;
    await booking.save();

    res.status(200).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBooking,
  getBookings,
  updateBookingStatus
};

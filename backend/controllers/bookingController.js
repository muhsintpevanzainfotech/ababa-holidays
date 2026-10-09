const Booking = require('../models/Booking');
const Package = require('../models/Package');
const sendEmail = require('../services/emailService');
const { notifyAdmin, notifyVendor, notifyCustomer } = require('../utils/notificationHelper');

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

    // 1. Notify Admin
    await notifyAdmin({
      title: 'New Booking Placed',
      message: `${req.user.name || 'A customer'} booked "${pkg.title}" for ${new Date(travelDate).toLocaleDateString()}. Total: ₹${totalPrice || pkg.price}`,
      category: 'booking',
      type: 'success',
      link: '/bookings',
      metadata: { bookingId: booking._id, packageId: pkg._id, packageTitle: pkg.title, totalPrice }
    });

    // 2. Notify Vendor (if package belongs to a vendor)
    if (pkg.vendor) {
      await notifyVendor(pkg.vendor, {
        title: 'New Customer Booking Order',
        message: `${req.user.name || 'A customer'} placed a booking for "${pkg.title}".`,
        category: 'booking',
        type: 'success',
        link: '/bookings',
        metadata: { bookingId: booking._id, packageId: pkg._id }
      });
    }

    // 3. Notify Customer
    await notifyCustomer(req.user.id, {
      title: 'Booking Order Received',
      message: `Your booking for "${pkg.title}" has been placed successfully. Awaiting confirmation.`,
      category: 'booking',
      type: 'success',
      link: '/dashboard',
      metadata: { bookingId: booking._id, packageId: pkg._id }
    });

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

    // If Vendor/Vendor-Staff/Staff, only show their vendor's bookings
    const isVendorRole = req.user && ['Vendor', 'Vendor-Staff', 'Staff', 'Sub Vendor', 'vendor-staff', 'staff'].includes(req.user.role);
    if (isVendorRole && req.user.role !== 'Admin' && req.user.role !== 'Sub-Admin') {
      const targetVendorId = req.user.effectiveVendorId || req.user.id;
      query.vendor = targetVendorId;
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
    let booking = await Booking.findById(req.params.id).populate('package', 'title');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Ensure only the vendor or staff who owns this booking or an Admin can update
    const targetVendorId = req.user.effectiveVendorId || req.user.id;
    if (booking.vendor.toString() !== req.user.id && booking.vendor.toString() !== targetVendorId && req.user.role !== 'Admin' && req.user.role !== 'Sub-Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this booking' });
    }

    booking.bookingStatus = status;
    await booking.save();

    // Notify Customer about status change
    const pkgTitle = booking.package?.title || 'your trip';
    await notifyCustomer(booking.user, {
      title: `Booking Status: ${status}`,
      message: `Your booking for "${pkgTitle}" is now ${status}.`,
      category: 'booking',
      type: status === 'Confirmed' ? 'success' : (status === 'Cancelled' ? 'error' : 'info'),
      link: '/dashboard',
      metadata: { bookingId: booking._id, status }
    });

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

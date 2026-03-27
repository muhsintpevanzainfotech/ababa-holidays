const User = require('../models/User');
const VendorProfile = require('../models/VendorProfile');
const Service = require('../models/Service');
const Category = require('../models/Category');
const SubService = require('../models/SubService');
const Package = require('../models/Package');
const Booking = require('../models/Booking');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private/Admin
const getStats = asyncHandler(async (req, res, next) => {
  const [
    totalUsers,
    totalVendors,
    totalServices,
    totalCategories,
    totalSubServices,
    totalPackages,
    totalBookings
  ] = await Promise.all([
    User.countDocuments(),
    VendorProfile.countDocuments(),
    Service.countDocuments({ isActive: true }),
    Category.countDocuments({ isActive: true }),
    SubService.countDocuments({ isActive: true }),
    Package.countDocuments({ isActive: true }),
    Booking.countDocuments()
  ]);

  res.status(200).json({
    success: true,
    data: {
      users: totalUsers,
      vendors: totalVendors,
      services: totalServices,
      categories: totalCategories,
      subServices: totalSubServices,
      packages: totalPackages,
      bookings: totalBookings
    }
  });
});

module.exports = {
  getStats
};

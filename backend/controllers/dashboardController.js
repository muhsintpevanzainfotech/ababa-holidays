const User = require('../models/User');
const VendorProfile = require('../models/VendorProfile');
const Service = require('../models/Service');
const Category = require('../models/Category');
const SubService = require('../models/SubService');
const Package = require('../models/Package');
const Booking = require('../models/Booking');
const Destination = require('../models/Destination');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private/Admin
// @desc    Get dashboard statistics
// @route   GET /api/dashboard/stats
// @access  Private (Admin, Sub-Admin, Vendor)
const getStats = asyncHandler(async (req, res, next) => {
  const isVendor = req.user && req.user.role === 'Vendor';
  const vendorId = req.user ? req.user._id : null;

  let totalUsers = 0;
  let totalVendors = 0;
  let totalServices = 0;
  let totalCategories = 0;
  let totalSubServices = 0;
  let totalPackages = 0;
  let totalBookings = 0;
  let totalDestinations = 0;
  let totalRevenue = 0;
  let recentItems = [];

  if (isVendor && vendorId) {
    const [
      vendorPkgCount,
      vendorBookingCount,
      vendorUniqueUsers,
      servicesCount,
      categoriesCount,
      subServicesCount,
      destinationsCount
    ] = await Promise.all([
      Package.countDocuments({ vendor: vendorId }),
      Booking.countDocuments({ vendor: vendorId }),
      Booking.distinct('user', { vendor: vendorId }),
      Service.countDocuments({ isActive: true }),
      Category.countDocuments({ isActive: true }),
      SubService.countDocuments({ isActive: true }),
      Destination.countDocuments()
    ]);

    totalPackages = vendorPkgCount;
    totalBookings = vendorBookingCount;
    totalUsers = vendorUniqueUsers ? vendorUniqueUsers.length : 0;
    totalVendors = 1;
    totalServices = servicesCount;
    totalCategories = categoriesCount;
    totalSubServices = subServicesCount;
    totalDestinations = destinationsCount;

    // Vendor Revenue
    const revenueResult = await Booking.aggregate([
      { $match: { vendor: vendorId, paymentStatus: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Vendor Recent Packages & Bookings
    const recentPkgs = await Package.find({ vendor: vendorId })
      .sort({ createdAt: -1 })
      .limit(4);

    const recentBookings = await Booking.find({ vendor: vendorId })
      .sort({ createdAt: -1 })
      .limit(4)
      .populate('package')
      .populate('user');

    const recentActivity = [];
    recentPkgs.forEach(pkg => {
      recentActivity.push({
        _id: pkg._id,
        title: pkg.title,
        type: 'Package',
        status: pkg.isActive ? 'Active' : 'Inactive',
        price: pkg.price,
        location: pkg.location || 'India',
        createdAt: pkg.createdAt
      });
    });

    recentBookings.forEach(b => {
      recentActivity.push({
        _id: b._id,
        title: b.package?.title ? `Booking: ${b.package.title}` : 'Customer Booking',
        type: 'Booking',
        status: b.bookingStatus || 'Confirmed',
        price: b.totalPrice,
        location: b.contactDetails?.phone || 'Direct',
        createdAt: b.createdAt
      });
    });

    recentActivity.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    recentItems = recentActivity.slice(0, 4);

  } else {
    // Admin / Sub-Admin Global Stats
    const [
      usersCount,
      vendorsCount,
      servicesCount,
      categoriesCount,
      subServicesCount,
      pkgsCount,
      bookingsCount,
      destinationsCount
    ] = await Promise.all([
      User.countDocuments({ role: 'User' }),
      User.countDocuments({ role: 'Vendor' }),
      Service.countDocuments({ isActive: true }),
      Category.countDocuments({ isActive: true }),
      SubService.countDocuments({ isActive: true }),
      Package.countDocuments({ isActive: true }),
      Booking.countDocuments(),
      Destination.countDocuments()
    ]);

    totalUsers = usersCount;
    totalVendors = vendorsCount;
    totalServices = servicesCount;
    totalCategories = categoriesCount;
    totalSubServices = subServicesCount;
    totalPackages = pkgsCount;
    totalBookings = bookingsCount;
    totalDestinations = destinationsCount;

    // Calculate live global revenue from Completed bookings
    const revenueResult = await Booking.aggregate([
      { $match: { paymentStatus: 'Completed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } }
    ]);
    totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

    // Combine and format recent packages and vendors for Recent Activity
    const recentPkgs = await Package.find()
      .sort({ createdAt: -1 })
      .limit(4)
      .populate('vendor')
      .populate('serviceCategory');

    const recentVendors = await User.find({ role: 'Vendor' })
      .sort({ createdAt: -1 })
      .limit(4)
      .populate('profile');

    const recentActivity = [];
    recentPkgs.forEach(pkg => {
      recentActivity.push({
        _id: pkg._id,
        title: pkg.title,
        type: 'Package',
        status: pkg.isActive ? 'Active' : 'Inactive',
        price: pkg.price,
        location: pkg.location || 'Global',
        createdAt: pkg.createdAt
      });
    });

    recentVendors.forEach(vendor => {
      recentActivity.push({
        _id: vendor._id,
        title: vendor.profile?.companyName || vendor.name,
        type: 'Vendor',
        status: vendor.profile?.isApproved ? 'Verified' : 'Pending',
        price: '-',
        location: vendor.profile?.location || 'India',
        createdAt: vendor.createdAt
      });
    });

    recentActivity.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    recentItems = recentActivity.slice(0, 4);
  }

  res.status(200).json({
    success: true,
    data: {
      users: totalUsers,
      vendors: totalVendors,
      services: totalServices,
      categories: totalCategories,
      subServices: totalSubServices,
      packages: totalPackages,
      bookings: totalBookings,
      destinations: totalDestinations,
      revenue: totalRevenue,
      recentItems
    }
  });
});

module.exports = {
  getStats
};


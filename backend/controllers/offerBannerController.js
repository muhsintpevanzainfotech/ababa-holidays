const OfferBanner = require('../models/OfferBanner');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { deleteFile } = require('../utils/fileHelpers');

// @desc    Create new banner
// @route   POST /api/banners
// @access  Private (Admin or Vendor)
exports.createBanner = asyncHandler(async (req, res, next) => {
  req.body.createdBy = req.user.id;
  
  // Normalize role to 'Admin' or 'Vendor' for filtering
  if (req.user.role === 'Admin' || req.user.role === 'Sub-Admin') {
    req.body.userRole = 'Admin';
  } else if (req.user.role === 'Vendor' || req.user.role === 'Vendor-Staff') {
    req.body.userRole = 'Vendor';
  } else {
    return next(new ErrorResponse('Not authorized to create banners', 403));
  }

  if (req.file) {
    req.body.image = req.file.path;
  }

  const banner = await OfferBanner.create(req.body);

  res.status(201).json({
    success: true,
    data: banner
  });
});

// @desc    Get all banners
// @route   GET /api/banners
// @access  Public
exports.getBanners = asyncHandler(async (req, res, next) => {
  const banners = await OfferBanner.find({ isActive: true }).populate('createdBy', 'name email');
  res.status(200).json({ success: true, count: banners.length, data: banners });
});

// @desc    Get Admin banners
// @route   GET /api/banners/admin
// @access  Public
exports.getAdminBanners = asyncHandler(async (req, res, next) => {
  const banners = await OfferBanner.find({ userRole: 'Admin', isActive: true }).populate('createdBy', 'name email');
  res.status(200).json({ success: true, count: banners.length, data: banners });
});

// @desc    Get All Vendor banners
// @route   GET /api/banners/vendor
// @access  Public
exports.getVendorBanners = asyncHandler(async (req, res, next) => {
  const banners = await OfferBanner.find({ userRole: 'Vendor', isActive: true }).populate('createdBy', 'name email');
  res.status(200).json({ success: true, count: banners.length, data: banners });
});

// @desc    Get Specific Vendor banners
// @route   GET /api/banners/vendor/:vendorId
// @access  Public
exports.getSpecificVendorBanners = asyncHandler(async (req, res, next) => {
  const banners = await OfferBanner.find({ 
    createdBy: req.params.vendorId, 
    userRole: 'Vendor', 
    isActive: true 
  }).populate('createdBy', 'name email');

  res.status(200).json({ success: true, count: banners.length, data: banners });
});

// @desc    Get My Banners (Self)
// @route   GET /api/banners/my-banners
// @access  Private
exports.getMyBanners = asyncHandler(async (req, res, next) => {
  const banners = await OfferBanner.find({ createdBy: req.user.id }).populate('createdBy', 'name email');
  res.status(200).json({ success: true, count: banners.length, data: banners });
});

// @desc    Get Single Banner
// @route   GET /api/banners/:id
// @access  Public
exports.getBanner = asyncHandler(async (req, res, next) => {
  const banner = await OfferBanner.findById(req.params.id).populate('createdBy', 'name email');

  if (!banner) {
    return next(new ErrorResponse('Banner not found', 404));
  }

  res.status(200).json({ success: true, data: banner });
});

// @desc    Update banner
// @route   PUT /api/banners/:id
// @access  Private
exports.updateBanner = asyncHandler(async (req, res, next) => {
  let banner = await OfferBanner.findById(req.params.id);

  if (!banner) {
    return next(new ErrorResponse('Banner not found', 404));
  }

  // Authorize
  if (banner.createdBy.toString() !== req.user.id && req.user.role !== 'Admin') {
    return next(new ErrorResponse('Not authorized to update this banner', 403));
  }

  if (req.file) {
    // Delete old image if it exists
    if (banner.image) {
      deleteFile(banner.image);
    }
    req.body.image = req.file.path;
  }

  banner = await OfferBanner.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, data: banner });
});

// @desc    Delete banner
// @route   DELETE /api/banners/:id
// @access  Private
exports.deleteBanner = asyncHandler(async (req, res, next) => {
  const banner = await OfferBanner.findById(req.params.id);

  if (!banner) {
    return next(new ErrorResponse('Banner not found', 404));
  }

  // Authorize
  if (banner.createdBy.toString() !== req.user.id && req.user.role !== 'Admin') {
    return next(new ErrorResponse('Not authorized to delete this banner', 403));
  }

  // Delete image file before deleting record
  if (banner.image) {
    deleteFile(banner.image);
  }

  await banner.deleteOne();

  res.status(200).json({ success: true, data: {} });
});

// @desc    Toggle Banner Status
// @route   PUT /api/banners/:id/toggle
// @access  Private
exports.toggleBannerStatus = asyncHandler(async (req, res, next) => {
  let banner = await OfferBanner.findById(req.params.id);

  if (!banner) {
    return next(new ErrorResponse('Banner not found', 404));
  }

  // Authorize
  if (banner.createdBy.toString() !== req.user.id && req.user.role !== 'Admin') {
    return next(new ErrorResponse('Not authorized to update this banner', 403));
  }

  banner.isActive = !banner.isActive;
  await banner.save();

  res.status(200).json({
    success: true,
    message: `Banner status changed to ${banner.isActive ? 'Active' : 'Inactive'}`,
    data: banner
  });
});

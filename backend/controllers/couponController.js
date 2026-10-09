const Coupon = require('../models/Coupon');
const Package = require('../models/Package');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get all coupons
// @route   GET /api/coupons
// @access  Private (Admin/Sub-Admin/Vendor)
const getCoupons = asyncHandler(async (req, res, next) => {
  const coupons = await Coupon.find()
    .populate('package', 'title customId price images')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: coupons.length,
    data: coupons
  });
});

// @desc    Get single coupon
// @route   GET /api/coupons/:id
// @access  Private
const getCouponById = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id).populate('package', 'title customId price');

  if (!coupon) {
    return next(new ErrorResponse(`Coupon not found with id of ${req.params.id}`, 404));
  }

  res.status(200).json({
    success: true,
    data: coupon
  });
});

// @desc    Create new coupon
// @route   POST /api/coupons
// @access  Private (Admin)
const createCoupon = asyncHandler(async (req, res, next) => {
  const {
    code,
    discountType,
    discountValue,
    scope,
    package: packageId,
    minBookingAmount,
    maxDiscount,
    startDate,
    expiryDate,
    usageLimit,
    isActive
  } = req.body;

  // Validate Code uniqueness
  const existingCode = await Coupon.findOne({ code: code.toUpperCase().trim() });
  if (existingCode) {
    return next(new ErrorResponse(`Coupon code '${code.toUpperCase()}' already exists`, 400));
  }

  // Validate Single Package Scope
  if (scope === 'single_package' && !packageId) {
    return next(new ErrorResponse('Please select a package for single package coupon', 400));
  }

  const coupon = await Coupon.create({
    code: code.toUpperCase().trim(),
    discountType: discountType || 'percentage',
    discountValue,
    scope: scope || 'all_packages',
    package: scope === 'single_package' ? packageId : null,
    minBookingAmount: minBookingAmount || 0,
    maxDiscount: maxDiscount || null,
    startDate: startDate || Date.now(),
    expiryDate,
    usageLimit: usageLimit || null,
    isActive: isActive !== undefined ? isActive : true
  });

  const populatedCoupon = await Coupon.findById(coupon._id).populate('package', 'title customId price');

  res.status(201).json({
    success: true,
    data: populatedCoupon
  });
});

// @desc    Update coupon
// @route   PUT /api/coupons/:id
// @access  Private (Admin)
const updateCoupon = asyncHandler(async (req, res, next) => {
  let coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return next(new ErrorResponse(`Coupon not found with id of ${req.params.id}`, 404));
  }

  if (req.body.code) {
    req.body.code = req.body.code.toUpperCase().trim();
    const existingCode = await Coupon.findOne({ code: req.body.code, _id: { $ne: req.params.id } });
    if (existingCode) {
      return next(new ErrorResponse(`Coupon code '${req.body.code}' is already used by another coupon`, 400));
    }
  }

  if (req.body.scope === 'all_packages') {
    req.body.package = null;
  }

  coupon = await Coupon.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true
  }).populate('package', 'title customId price');

  res.status(200).json({
    success: true,
    data: coupon
  });
});

// @desc    Delete coupon
// @route   DELETE /api/coupons/:id
// @access  Private (Admin)
const deleteCoupon = asyncHandler(async (req, res, next) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    return next(new ErrorResponse(`Coupon not found with id of ${req.params.id}`, 404));
  }

  await coupon.deleteOne();

  res.status(200).json({
    success: true,
    data: {}
  });
});

// @desc    Validate & Apply Coupon Code
// @route   POST /api/coupons/validate
// @access  Public/Private
const validateCoupon = asyncHandler(async (req, res, next) => {
  const { code, packageId, bookingAmount } = req.body;

  if (!code) {
    return next(new ErrorResponse('Coupon code is required', 400));
  }

  const coupon = await Coupon.findOne({ code: code.toUpperCase().trim(), isActive: true });

  if (!coupon) {
    return next(new ErrorResponse('Invalid or expired coupon code', 404));
  }

  // Check Expiry Date
  if (new Date() > new Date(coupon.expiryDate)) {
    return next(new ErrorResponse('This coupon code has expired', 400));
  }

  // Check Usage Limit
  if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
    return next(new ErrorResponse('This coupon code usage limit has been reached', 400));
  }

  // Check Scope
  if (coupon.scope === 'single_package') {
    if (!packageId || coupon.package.toString() !== packageId.toString()) {
      return next(new ErrorResponse('This coupon code is not applicable for the selected package', 400));
    }
  }

  // Check Minimum Booking Amount
  const amount = Number(bookingAmount) || 0;
  if (coupon.minBookingAmount && amount < coupon.minBookingAmount) {
    return next(new ErrorResponse(`Minimum booking amount for this coupon is ₹${coupon.minBookingAmount}`, 400));
  }

  // Calculate Discount Amount
  let discountAmount = 0;
  if (coupon.discountType === 'percentage') {
    discountAmount = (amount * coupon.discountValue) / 100;
    if (coupon.maxDiscount && discountAmount > coupon.maxDiscount) {
      discountAmount = coupon.maxDiscount;
    }
  } else {
    discountAmount = coupon.discountValue;
  }

  if (discountAmount > amount) {
    discountAmount = amount;
  }

  res.status(200).json({
    success: true,
    message: 'Coupon code applied successfully',
    data: {
      couponId: coupon._id,
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount,
      finalAmount: Math.max(0, amount - discountAmount)
    }
  });
});

// @desc    Get public active coupons
// @route   GET /api/coupons/public
// @access  Public
const getPublicCoupons = asyncHandler(async (req, res, next) => {
  const coupons = await Coupon.find({ isActive: true })
    .populate('package', 'title customId price images')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: coupons.length,
    data: coupons
  });
});

module.exports = {
  getCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  getPublicCoupons
};

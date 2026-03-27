const VendorProfile = require('../models/VendorProfile');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const sendEmail = require('../services/emailService');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const { generateOTP, hashOTP, hashToken } = require('../utils/authHelpers');
const { deleteFile } = require('../utils/fileHelpers');

// Registration and Login for Vendors are now handled by authController.js

// @desc    Approve Vendor (Admin Only)
// @route   PUT /api/vendors/:id/approve
// @access  Private/Admin
const approveVendor = asyncHandler(async (req, res, next) => {
  const profile = await VendorProfile.findOne({ user: req.params.id });

  if (!profile) {
    return next(new ErrorResponse('Vendor profile not found', 404));
  }

  profile.isApproved = true;
  await profile.save();

  res.status(200).json({
    success: true,
    message: 'Vendor approved successfully',
    data: profile
  });
});

// @desc    Update Vendor Subscription (Vendor or Admin)
// @route   PUT /api/vendors/:id/subscription
// @access  Private/(Vendor/Admin)
const updateSubscription = asyncHandler(async (req, res, next) => {
  const { plan, subscriptionId } = req.body;

  const profile = await VendorProfile.findOne({ user: req.params.id });

  if (!profile) {
    return next(new ErrorResponse('Vendor profile not found', 404));
  }

  // Checking if the requester is the vendor themselves or an Admin
  if (req.user.role !== 'Admin' && req.user.id !== profile.user.toString()) {
    return next(new ErrorResponse('Unauthorized action', 403));
  }

  if (plan) profile.subscriptionPlan = plan;
  if (subscriptionId) profile.subscription = subscriptionId;
  
  await profile.save();

  res.status(200).json({
    success: true,
    message: `Subscription updated to ${plan}`,
    data: profile
  });
});

// @desc    Get all vendors (Admin only)
// @route   GET /api/vendors
// @access  Private/Admin
const getVendors = asyncHandler(async (req, res, next) => {
  const vendors = await User.find({ role: 'Vendor' })
    .select('-password');
  
  // Attach profiles
  const data = await Promise.all(vendors.map(async (v) => {
    const profile = await VendorProfile.findOne({ user: v._id })
      .populate('selectedServices', 'title description image')
      .populate('subscription');
    return { ...v.toObject(), profile };
  }));

  res.json({ success: true, count: data.length, data });
});

// @desc    Update Vendor Profile
// @route   PUT /api/vendors/profile
// @access  Private/Vendor
const updateVendorProfile = asyncHandler(async (req, res, next) => {
  let profile = await VendorProfile.findOne({ user: req.user.id });

  if (!profile) {
    profile = new VendorProfile({ user: req.user.id });
  }

  const details = { ...profile.toObject(), ...req.body };

  // Handle files
  if (req.files) {
    if (req.files.idCard) {
      if (profile.idCard) deleteFile(profile.idCard);
      details.idCard = req.files.idCard[0].path;
    }
    if (req.files.tinUpload) {
      if (profile.tin && profile.tin.upload) deleteFile(profile.tin.upload);
      details.tin = { ...details.tin, upload: req.files.tinUpload[0].path };
    }
    if (req.files.gstUpload) {
      if (profile.gst && profile.gst.upload) deleteFile(profile.gst.upload);
      details.gst = { ...details.gst, upload: req.files.gstUpload[0].path };
    }
  }

  // Parse nested objects
  ['spoc', 'tin', 'gst', 'bankDetails', 'seo', 'address', 'selectedServices'].forEach(key => {
    if (typeof req.body[key] === 'string') {
      try {
        details[key] = JSON.parse(req.body[key]);
      } catch (e) {}
    }
  });

  // Update profile document
  Object.assign(profile, details);
  await profile.save();

  // Populate services for response
  await profile.populate('selectedServices', 'title description image');

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    data: profile
  });
});

// @desc    Delete Vendor (Admin only)
// @route   DELETE /api/vendors/:id
// @access  Private/Admin
const deleteVendor = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user || user.role !== 'Vendor') {
    return next(new ErrorResponse('Vendor not found', 404));
  }

  const profile = await VendorProfile.findOne({ user: user._id });
  if (profile) {
    if (profile.idCard) deleteFile(profile.idCard);
    if (profile.tin && profile.tin.upload) deleteFile(profile.tin.upload);
    if (profile.gst && profile.gst.upload) deleteFile(profile.gst.upload);
    await profile.deleteOne();
  }

  // Delete user
  await user.deleteOne();

  res.json({ success: true, message: 'Vendor removed' });
});

// @desc    Create Vendor (Admin only)
// @route   POST /api/vendors
// @access  Private/Admin
const createVendor = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone, companyName, businessLicense } = req.body;

  if (!name || !email || !password) {
    return next(new ErrorResponse('Please provide name, email and password', 400));
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new ErrorResponse('User already exists', 400));
  }

  const user = await User.create({
    name,
    email,
    password,
    phone,
    role: 'Vendor',
    isVerified: true // Admin-created vendors are pre-verified
  });

  await VendorProfile.create({
    user: user._id,
    companyName: companyName || 'New Vendor',
    businessLicense: businessLicense || '',
    isApproved: true // Admin-created vendors are pre-approved
  });

  res.status(201).json({
    success: true,
    message: 'Vendor created successfully',
    data: user
  });
});

// @desc    Get single vendor by ID
// @route   GET /api/vendors/:id
// @access  Private/Admin
const getVendor = asyncHandler(async (req, res, next) => {
  const vendor = await User.findById(req.params.id).select('-password');

  if (!vendor || vendor.role !== 'Vendor') {
    return next(new ErrorResponse('Vendor not found', 404));
  }

  const profile = await VendorProfile.findOne({ user: vendor._id })
    .populate('selectedServices', 'title description image')
    .populate('subscription');

  res.status(200).json({
    success: true,
    data: { ...vendor.toObject(), profile }
  });
});

module.exports = {
  getVendor,
  approveVendor,
  updateSubscription,
  updateVendorProfile,
  getVendors,
  deleteVendor,
  createVendor
};

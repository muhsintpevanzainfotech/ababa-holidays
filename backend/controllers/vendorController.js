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

  // Parse nested objects if they are strings (from multipart/form-data)
  ['spoc', 'tin', 'gst', 'bankDetails', 'seo', 'address', 'selectedServices', 'socialMedia'].forEach(key => {
    if (typeof req.body[key] === 'string') {
      try {
        req.body[key] = JSON.parse(req.body[key]);
      } catch (e) { }
    }
  });

  const details = { ...req.body };

  // Handle files
  if (req.files) {
    if (req.files.avatar) {
      const user = await User.findById(req.user.id);
      if (user && user.avatar && !user.avatar.startsWith('http')) deleteFile(user.avatar);
      await User.findByIdAndUpdate(req.user.id, { avatar: req.files.avatar[0].path }, { returnDocument: 'after' });
    }
    if (req.files.idCard) {
      if (profile.idCard) deleteFile(profile.idCard);
      details.idCard = req.files.idCard[0].path;
    }
    if (req.files.tinUpload) {
      const existingTin = details.tin || {};
      if (profile.tin && profile.tin.upload) deleteFile(profile.tin.upload);
      details.tin = { ...existingTin, upload: req.files.tinUpload[0].path };
    }
    if (req.files.gstUpload) {
      const existingGst = details.gst || {};
      if (profile.gst && profile.gst.upload) deleteFile(profile.gst.upload);
      details.gst = { ...existingGst, upload: req.files.gstUpload[0].path };
    }
    if (req.files.bankUpload) {
      const existingBank = details.bankDetails || {};
      if (profile.bankDetails && profile.bankDetails.upload) deleteFile(profile.bankDetails.upload);
      details.bankDetails = { ...existingBank, upload: req.files.bankUpload[0].path };
    }
    if (req.files.logoS) {
      const existingLogos = details.companylogos || profile.companylogos || {};
      if (profile.companylogos?.small && !profile.companylogos.small.includes('default')) deleteFile(profile.companylogos.small);
      details.companylogos = { ...existingLogos, small: req.files.logoS[0].path };
    }
    if (req.files.logoM) {
      const existingLogos = details.companylogos || profile.companylogos || {};
      if (profile.companylogos?.medium && !profile.companylogos.medium.includes('default')) deleteFile(profile.companylogos.medium);
      details.companylogos = { ...existingLogos, medium: req.files.logoM[0].path };
    }
    if (req.files.logoL) {
      const existingLogos = details.companylogos || profile.companylogos || {};
      if (profile.companylogos?.large && !profile.companylogos.large.includes('default')) deleteFile(profile.companylogos.large);
      details.companylogos = { ...existingLogos, large: req.files.logoL[0].path };
    }
  }

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

  // Create user first
  const userPayload = {
    name,
    email,
    password,
    phone,
    role: 'Vendor',
    isVerified: true
  };

  if (req.files && req.files.avatar) {
    userPayload.avatar = req.files.avatar[0].path;
  }

  const user = await User.create(userPayload);

  // Profile data from multipart profile field (JSON string) or direct body
  let profileData = {};
  if (req.body.profile) {
    try {
      profileData = JSON.parse(req.body.profile);
    } catch (e) { }
  } else {
    profileData = { ...req.body };
  }

  const profilePayload = {
    user: user._id,
    companyName: profileData.companyName || companyName || 'New Vendor',
    businessLicense: profileData.businessLicense || businessLicense || '',
    isApproved: true,
    ...profileData
  };

  // Handle files for new profile
  if (req.files) {
    if (req.files.idCard) profilePayload.idCard = req.files.idCard[0].path;
    if (req.files.tinUpload) profilePayload.tin = { ...(profilePayload.tin || {}), upload: req.files.tinUpload[0].path };
    if (req.files.gstUpload) profilePayload.gst = { ...(profilePayload.gst || {}), upload: req.files.gstUpload[0].path };
    if (req.files.bankUpload) profilePayload.bankDetails = { ...(profilePayload.bankDetails || {}), upload: req.files.bankUpload[0].path };
    if (req.files.logoS || req.files.logoM || req.files.logoL) {
      profilePayload.companylogos = {
        small: req.files.logoS ? req.files.logoS[0].path : undefined,
        medium: req.files.logoM ? req.files.logoM[0].path : undefined,
        large: req.files.logoL ? req.files.logoL[0].path : undefined
      };
    }
  }

  await VendorProfile.create(profilePayload);

  // Send Email with credentials to the newly created vendor
  try {
    const loginUrl = process.env.VENDOR_LOGIN_URL || 'https://ababa-holidays-vendor.vercel.app/login'; // Adjust this URL as needed for production/dev
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #2c3e50; text-align: center;">Welcome to ABABA Holidays!</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>Your vendor account has been successfully created by our administrator. You can now log in to the vendor dashboard to manage your services.</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin-top: 0; color: #34495e;">Your Login Credentials:</h3>
          <p style="margin-bottom: 5px;"><strong>Email:</strong> ${email}</p>
          <p style="margin-top: 0;"><strong>Password:</strong> ${password}</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" style="background-color: #3498db; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Dashboard</a>
        </div>

        <p style="color: #7f8c8d; font-size: 14px;">For security reasons, we recommend changing your password after your first login.</p>
        
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        <p style="color: #95a5a6; font-size: 12px; text-align: center;">&copy; 2026 ABABA Holidays. All rights reserved.</p>
      </div>
    `;

    await sendEmail({
      email,
      subject: 'Welcome to ABABA Holidays - Your Vendor account is ready',
      html
    });
  } catch (error) {
    console.error('Error sending registration email:', error);
    // Continue without error since account is already created
  }

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
  const vendor = await User.findById(req.params.id)
    .select('-password');

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

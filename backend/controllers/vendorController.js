const VendorProfile = require('../models/VendorProfile');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const sendEmail = require('../services/emailService');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const Booking = require('../models/Booking');
const { generateOTP, hashOTP, hashToken } = require('../utils/authHelpers');
const { deleteFile } = require('../utils/fileHelpers');

// Registration and Login for Vendors are now handled by authController.js

const resolveAddressIds = async (address) => {
  if (!address) return address;
  const mongoose = require('mongoose');

  // Resolve Country
  let countryId = address.country;
  if (countryId && typeof countryId === 'object' && countryId._id) {
    countryId = countryId._id;
  }

  if (!countryId || !mongoose.Types.ObjectId.isValid(countryId)) {
    const Country = require('../models/Country');
    const countryName = countryId ? String(countryId).trim() : 'India';
    let countryObj = await Country.findOne({ name: { $regex: new RegExp(`^${countryName}$`, 'i') } });
    if (!countryObj) {
      countryObj = await Country.findOne({ name: { $regex: /^india$/i } });
      if (!countryObj) {
        countryObj = await Country.create({ name: 'India', code: 'IN', dialCode: '+91' });
      }
    }
    address.country = countryObj._id;
  } else {
    address.country = countryId;
  }

  // Resolve State
  let stateId = address.state;
  if (stateId && typeof stateId === 'object' && stateId._id) {
    stateId = stateId._id;
  }

  if (stateId && !mongoose.Types.ObjectId.isValid(stateId)) {
    const State = require('../models/State');
    const stateName = String(stateId).trim();
    let stateObj = await State.findOne({ 
      name: { $regex: new RegExp(`^${stateName}$`, 'i') },
      country: address.country
    });
    if (!stateObj) {
      stateObj = await State.create({ 
        name: stateName, 
        country: address.country 
      });
    }
    address.state = stateObj._id;
  } else if (stateId) {
    address.state = stateId;
  }

  return address;
};

// @desc    Approve Vendor (Admin Only)
// @route   PUT /api/vendors/:id/approve
// @access  Private/Admin
const approveVendor = asyncHandler(async (req, res, next) => {
  const mongoose = require('mongoose');
  if (!req.params.id || req.params.id === 'undefined' || !mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new ErrorResponse('Invalid Vendor ID parameter', 400));
  }

  const profile = await VendorProfile.findOne({ user: req.params.id });

  if (!profile) {
    return next(new ErrorResponse('Vendor profile not found', 404));
  }

  profile.isApproved = true;
  await profile.save();

  // Send Welcome & Account Activation Email to Vendor
  const user = await User.findById(req.params.id);
  if (user && user.email) {
    try {
      const loginUrl = process.env.VENDOR_LOGIN_URL || 'https://ababa-holidays-vendor.vercel.app/login';
      const welcomeHtml = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #1e293b; margin: 0; font-size: 26px; font-weight: 800;">ABABA Holidays</h1>
            <div style="width: 48px; height: 4px; background: #3b82f6; margin: 12px auto; border-radius: 2px;"></div>
          </div>
          
          <h2 style="color: #0f172a; font-size: 20px; font-weight: 700; margin-bottom: 16px;">🎉 Congratulations! Your Vendor Account is Approved</h2>
          
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">Hello <strong>${user.name}</strong>,</p>
          <p style="color: #475569; font-size: 15px; line-height: 1.6;">Great news! Your vendor agency profile for <strong>${profile.companyName || 'your business'}</strong> has been reviewed and officially approved by the ABABA Holidays Admin team.</p>
          
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 12px; margin: 24px 0;">
            <h3 style="margin-top: 0; color: #166534; font-size: 15px; font-weight: 700;">Account Status: Active & Operational</h3>
            <p style="margin: 6px 0 0 0; color: #15803d; font-size: 13.5px; line-height: 1.5;">You can now log in to your Vendor Dashboard to create travel packages, manage bookings, and access full platform features.</p>
          </div>

          <div style="text-align: center; margin: 32px 0;">
            <a href="${loginUrl}" style="background-color: #2563eb; color: white; padding: 14px 32px; text-decoration: none; border-radius: 10px; font-weight: 700; font-size: 15px; display: inline-block; box-shadow: 0 4px 12px rgba(37,99,235,0.25);">Login to Vendor Dashboard</a>
          </div>

          <p style="color: #64748b; font-size: 13.5px; line-height: 1.5;">If you have any questions or need onboarding assistance, please reach out to our support team.</p>
          
          <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 32px; text-align: center;">
            <p style="margin: 0; color: #94a3b8; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">
              &copy; 2026 ABABA Holidays &bull; Vendor Platform
            </p>
          </div>
        </div>
      `;

      await sendEmail({
        email: user.email,
        subject: '🎉 ABABA Holidays: Vendor Account Approved & Activated!',
        html: welcomeHtml
      });
    } catch (err) {
      console.error('Failed to send vendor approval email:', err);
    }
  }

  res.status(200).json({
    success: true,
    message: 'Vendor approved successfully and welcome email sent.',
    data: profile
  });
});

// @desc    Update Vendor Subscription (Vendor or Admin)
// @route   PUT /api/vendors/:id/subscription
// @access  Private/(Vendor/Admin)
const updateSubscription = asyncHandler(async (req, res, next) => {
  const mongoose = require('mongoose');
  if (!req.params.id || req.params.id === 'undefined' || !mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new ErrorResponse('Invalid Vendor ID parameter', 400));
  }

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

// @desc    Get Current Vendor Profile (Vendor or Vendor-Staff)
// @route   GET /api/vendors/profile
// @access  Private/Vendor
const getVendorProfile = asyncHandler(async (req, res, next) => {
  const targetVendorId = req.user.effectiveVendorId || req.user.id;
  const user = await User.findById(targetVendorId).select('-password');

  if (!user) {
    return next(new ErrorResponse('User account not found', 404));
  }

  let profile = await VendorProfile.findOne({ user: targetVendorId })
    .populate('selectedServices', 'title description image customId formSchema isActive')
    .populate('subscription');

  if (!profile) {
    profile = await VendorProfile.create({ user: targetVendorId, companyName: user.name || 'Vendor Partner' });
  }

  res.status(200).json({
    success: true,
    data: { ...user.toObject(), profile }
  });
});

// @desc    Update Vendor Profile
// @route   PUT /api/vendors/profile
// @access  Private/Vendor
const updateVendorProfile = asyncHandler(async (req, res, next) => {
  const targetVendorId = req.user.effectiveVendorId || req.user.id;
  let profile = await VendorProfile.findOne({ user: targetVendorId });

  if (!profile) {
    profile = new VendorProfile({ user: targetVendorId });
  }

  // Update User model fields if provided
  if (req.body.name || req.body.phone) {
    const userUpdates = {};
    if (req.body.name) userUpdates.name = req.body.name;
    if (req.body.phone) userUpdates.phone = req.body.phone;
    await User.findByIdAndUpdate(req.user.id, userUpdates);
  }

  // Parse nested objects if they are strings (from multipart/form-data)
  ['spoc', 'tin', 'gst', 'bankDetails', 'seo', 'address', 'selectedServices', 'socialLinks'].forEach(key => {
    if (typeof req.body[key] === 'string') {
      try {
        req.body[key] = JSON.parse(req.body[key]);
      } catch (e) { }
    }
  });

  if (req.body.address) {
    req.body.address = await resolveAddressIds(req.body.address);
  }

  const details = { ...req.body };

  // Handle files
  if (req.files) {
    if (req.files.avatar) {
      const user = await User.findById(req.user.id);
      if (user && user.avatar && !user.avatar.startsWith('http')) deleteFile(user.avatar);
      await User.findByIdAndUpdate(req.user.id, { avatar: req.files.avatar[0].path }, { returnDocument: 'after' });
    }
    if (req.files.coverBanner) {
      if (profile.coverBanner) deleteFile(profile.coverBanner);
      details.coverBanner = req.files.coverBanner[0].path;
    }
    if (req.files.tradeLicenseUpload || req.files.tradeLicenseFile) {
      const file = req.files.tradeLicenseUpload ? req.files.tradeLicenseUpload[0] : req.files.tradeLicenseFile[0];
      if (profile.tradeLicenseDoc) deleteFile(profile.tradeLicenseDoc);
      details.tradeLicenseDoc = file.path;
    }
    if (req.files.panUpload || req.files.panFile || req.files.tinUpload || req.files.tinFile) {
      const file = (req.files.panUpload || req.files.panFile || req.files.tinUpload || req.files.tinFile)[0];
      if (profile.panDoc) deleteFile(profile.panDoc);
      details.panDoc = file.path;
      const existingTin = details.tin || profile.tin || {};
      details.tin = { ...existingTin, upload: file.path };
    }
    if (req.files.gstUpload || req.files.gstFile) {
      const file = req.files.gstUpload ? req.files.gstUpload[0] : req.files.gstFile[0];
      if (profile.gstDoc) deleteFile(profile.gstDoc);
      details.gstDoc = file.path;
      const existingGst = details.gst || profile.gst || {};
      details.gst = { ...existingGst, upload: file.path };
    }
    if (req.files.passbookUpload || req.files.passbookFile || req.files.bankUpload || req.files.bankFile) {
      const file = (req.files.passbookUpload || req.files.passbookFile || req.files.bankUpload || req.files.bankFile)[0];
      if (profile.passbookDoc) deleteFile(profile.passbookDoc);
      details.passbookDoc = file.path;
      const existingBank = details.bankDetails || profile.bankDetails || {};
      details.bankDetails = { ...existingBank, upload: file.path };
    }
    if (req.files.idCard || req.files.idCardFile) {
      const file = (req.files.idCard || req.files.idCardFile)[0];
      if (profile.idCard) deleteFile(profile.idCard);
      details.idCard = file.path;
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
  const mongoose = require('mongoose');
  if (!req.params.id || req.params.id === 'undefined' || !mongoose.Types.ObjectId.isValid(req.params.id)) {
    return next(new ErrorResponse('Invalid Vendor ID parameter', 400));
  }

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

  if (profileData.address) {
    profileData.address = await resolveAddressIds(profileData.address);
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
  let vendor = null;
  if (req.params.id && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    vendor = await User.findById(req.params.id).select('-password');
  }

  let profile = null;
  if (!vendor || vendor.role !== 'Vendor') {
    if (req.params.id && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      profile = await VendorProfile.findById(req.params.id)
        .populate('selectedServices', 'title description image')
        .populate('subscription');
      if (profile) {
        vendor = await User.findById(profile.user).select('-password');
      }
    }
  }

  if (!vendor || vendor.role !== 'Vendor') {
    return next(new ErrorResponse('Vendor not found', 404));
  }

  if (!profile) {
    profile = await VendorProfile.findOne({ user: vendor._id })
      .populate('selectedServices', 'title description image')
      .populate('subscription');
  }

  res.status(200).json({
    success: true,
    data: { ...vendor.toObject(), profile }
  });
});

// @desc    Update Vendor by ID (Admin)
// @route   PUT /api/vendors/:id
// @access  Private/Admin
const updateVendor = asyncHandler(async (req, res, next) => {
  let user = null;
  if (req.params.id && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    user = await User.findById(req.params.id);
  }

  let profile = null;
  if (!user) {
    if (req.params.id && req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      profile = await VendorProfile.findById(req.params.id);
      if (profile) {
        user = await User.findById(profile.user);
      }
    }
  }

  if (!user || user.role !== 'Vendor') {
    return next(new ErrorResponse('Vendor not found', 404));
  }

  if (!profile) {
    profile = await VendorProfile.findOne({ user: user._id });
    if (!profile) {
      profile = new VendorProfile({ user: user._id });
    }
  }

  // Update user fields
  const { name, email, phone, password, isVerified, isSuspended } = req.body;
  if (name) user.name = name;
  if (email) user.email = email;
  if (phone) user.phone = phone;
  if (isVerified !== undefined) user.isVerified = isVerified;
  if (isSuspended !== undefined) user.isSuspended = isSuspended;
  if (password && password.trim() !== '') user.password = password;

  if (req.files && req.files.avatar) {
    user.avatar = req.files.avatar[0].path;
  }
  await user.save();

  // Parse nested JSON fields if present
  ['spoc', 'tin', 'gst', 'bankDetails', 'seo', 'address', 'selectedServices', 'socialLinks'].forEach(key => {
    if (typeof req.body[key] === 'string') {
      try {
        req.body[key] = JSON.parse(req.body[key]);
      } catch (e) { }
    }
  });

  if (req.body.address) {
    req.body.address = await resolveAddressIds(req.body.address);
  }

  const profileUpdates = { ...req.body };
  delete profileUpdates.password;

  // Handle uploaded files for profile
  if (req.files) {
    if (req.files.idCard || req.files.idCardFile) {
      const file = req.files.idCard ? req.files.idCard[0] : req.files.idCardFile[0];
      profileUpdates.idCard = file.path;
    }
    if (req.files.tinUpload || req.files.tinFile) {
      const file = req.files.tinUpload ? req.files.tinUpload[0] : req.files.tinFile[0];
      const existingTin = profileUpdates.tin || profile.tin || {};
      profileUpdates.tin = { ...existingTin, upload: file.path };
    }
    if (req.files.gstUpload || req.files.gstFile) {
      const file = req.files.gstUpload ? req.files.gstUpload[0] : req.files.gstFile[0];
      const existingGst = profileUpdates.gst || profile.gst || {};
      profileUpdates.gst = { ...existingGst, upload: file.path };
    }
    if (req.files.bankUpload || req.files.bankFile) {
      const file = req.files.bankUpload ? req.files.bankUpload[0] : req.files.bankFile[0];
      const existingBank = profileUpdates.bankDetails || profile.bankDetails || {};
      profileUpdates.bankDetails = { ...existingBank, upload: file.path };
    }
    if (req.files.logoS || req.files.logoM || req.files.logoL) {
      const existingLogos = profileUpdates.companylogos || profile.companylogos || {};
      profileUpdates.companylogos = {
        small: req.files.logoS ? req.files.logoS[0].path : existingLogos.small,
        medium: req.files.logoM ? req.files.logoM[0].path : existingLogos.medium,
        large: req.files.logoL ? req.files.logoL[0].path : existingLogos.large
      };
    }
  }

  Object.assign(profile, profileUpdates);
  await profile.save();

  res.status(200).json({
    success: true,
    message: 'Vendor updated successfully',
    data: { ...user.toObject(), profile }
  });
});

// @desc    Get all staff members for current vendor
// @route   GET /api/vendors/staff
// @access  Private (Vendor or Admin)
const getVendorStaff = asyncHandler(async (req, res, next) => {
  const targetVendorId = req.user.effectiveVendorId || req.user.id;
  const staff = await User.find({
    managedBy: targetVendorId,
    role: { $in: ['Vendor-Staff', 'Staff'] }
  }).select('-password').sort('-createdAt');

  res.status(200).json({
    success: true,
    count: staff.length,
    data: staff
  });
});

// @desc    Create new staff member for vendor
// @route   POST /api/vendors/staff
// @access  Private (Vendor or Admin)
const createVendorStaff = asyncHandler(async (req, res, next) => {
  const { name, email, password, phone, permissions } = req.body;
  const targetVendorId = req.user.effectiveVendorId || req.user.id;

  if (!name || !email || !password) {
    return next(new ErrorResponse('Please provide name, email, and password', 400));
  }

  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new ErrorResponse('User already exists with this email', 400));
  }

  if (phone) {
    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      return next(new ErrorResponse('User already exists with this phone number', 400));
    }
  }

  let parsedPermissions = [];
  if (permissions) {
    parsedPermissions = typeof permissions === 'string' ? JSON.parse(permissions) : permissions;
  }

  const staffUser = await User.create({
    name,
    email,
    password,
    phone,
    role: 'Vendor-Staff',
    managedBy: targetVendorId,
    isVerified: true,
    permissions: parsedPermissions
  });

  try {
    const loginUrl = process.env.VENDOR_LOGIN_URL || 'https://ababa-holidays-vendor.vercel.app/login';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #2c3e50; text-align: center;">Welcome to ABABA Holidays!</h2>
        <p>Hello <strong>${name}</strong>,</p>
        <p>You have been added as a Vendor Staff member for your agency. You can log in using the credentials below:</p>
        
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p style="margin-bottom: 5px;"><strong>Email:</strong> ${email}</p>
          <p style="margin-top: 0;"><strong>Password:</strong> ${password}</p>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${loginUrl}" style="background-color: #2563eb; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold;">Login to Vendor Portal</a>
        </div>
      </div>
    `;

    await sendEmail({
      email,
      subject: 'Welcome to ABABA Holidays - Vendor Staff Account Ready',
      html
    });
  } catch (err) {
    console.error('Failed to send email to vendor staff:', err);
  }

  res.status(201).json({
    success: true,
    message: 'Vendor staff member created successfully',
    data: staffUser
  });
});

// @desc    Update staff member for vendor
// @route   PUT /api/vendors/staff/:id
// @access  Private (Vendor or Admin)
const updateVendorStaff = asyncHandler(async (req, res, next) => {
  const targetVendorId = req.user.effectiveVendorId || req.user.id;
  const staff = await User.findById(req.params.id);

  if (!staff) {
    return next(new ErrorResponse('Staff member not found', 404));
  }

  if (staff.managedBy?.toString() !== targetVendorId && req.user.role !== 'Admin') {
    return next(new ErrorResponse('Not authorized to manage this staff member', 403));
  }

  const { name, email, phone, password, permissions, isSuspended } = req.body;

  if (email && email !== staff.email) {
    const existing = await User.findOne({ email });
    if (existing) return next(new ErrorResponse('Email already registered', 400));
    staff.email = email;
  }

  if (phone && phone !== staff.phone) {
    const existing = await User.findOne({ phone });
    if (existing) return next(new ErrorResponse('Phone number already registered', 400));
    staff.phone = phone;
  }

  if (name) staff.name = name;
  if (password && password.trim() !== '') staff.password = password;
  if (isSuspended !== undefined) staff.isSuspended = isSuspended === true || isSuspended === 'true';

  if (permissions) {
    staff.permissions = typeof permissions === 'string' ? JSON.parse(permissions) : permissions;
  }

  await staff.save();

  res.status(200).json({
    success: true,
    message: 'Staff member updated successfully',
    data: staff
  });
});

// @desc    Delete staff member for vendor
// @route   DELETE /api/vendors/staff/:id
// @access  Private (Vendor or Admin)
const deleteVendorStaff = asyncHandler(async (req, res, next) => {
  const targetVendorId = req.user.effectiveVendorId || req.user.id;
  const staff = await User.findById(req.params.id);

  if (!staff) {
    return next(new ErrorResponse('Staff member not found', 404));
  }

  if (staff.managedBy?.toString() !== targetVendorId && req.user.role !== 'Admin') {
    return next(new ErrorResponse('Not authorized to delete this staff member', 403));
  }

  await staff.deleteOne();

  res.status(200).json({
    success: true,
    message: 'Staff member removed successfully'
  });
});

// @desc    Get Vendor Wallet Summary & Financials
// @route   GET /api/vendors/wallet
// @access  Private (Vendor or Vendor-Staff)
const getVendorWallet = asyncHandler(async (req, res, next) => {
  const targetVendorId = req.user.effectiveVendorId || req.user.id;
  
  const bookings = await Booking.find({ vendor: targetVendorId })
    .populate('package', 'title price')
    .sort('-createdAt');

  const totalBookings = bookings.length;
  let grossEarnings = 0;
  let completedEarnings = 0;
  let pendingEarnings = 0;

  bookings.forEach(b => {
    const price = b.totalPrice || 0;
    if (b.bookingStatus === 'Completed') {
      grossEarnings += price;
      completedEarnings += price;
    } else if (b.bookingStatus === 'Confirmed') {
      grossEarnings += price;
      pendingEarnings += price;
    } else if (b.bookingStatus === 'Pending') {
      pendingEarnings += price;
    }
  });

  const platformFeePercentage = 10; // 10% platform fee
  const netEarnings = Math.round(grossEarnings * (1 - platformFeePercentage / 100));

  const profile = await VendorProfile.findOne({ user: targetVendorId });
  const payouts = profile?.payoutHistory || [];

  const totalWithdrawn = payouts
    .filter(p => p.status === 'Completed' || p.status === 'Approved' || p.status === 'Pending')
    .reduce((sum, p) => sum + (p.amount || 0), 0);

  const walletBalance = Math.max(0, netEarnings - totalWithdrawn);

  res.status(200).json({
    success: true,
    data: {
      walletBalance,
      grossEarnings,
      netEarnings,
      completedEarnings,
      pendingEarnings,
      totalBookings,
      platformFeePercentage,
      bankDetails: profile?.bankDetails || {},
      payouts,
      recentTransactions: bookings.slice(0, 10).map(b => ({
        id: b._id,
        customId: b.customId || b._id,
        customerName: b.contactDetails?.name || b.user?.name || 'Customer',
        packageTitle: b.package?.title || 'Tour Booking',
        amount: b.totalPrice || 0,
        netAmount: Math.round((b.totalPrice || 0) * 0.9),
        status: b.bookingStatus,
        date: b.createdAt
      }))
    }
  });
});

// @desc    Request Vendor Payout Withdrawal
// @route   POST /api/vendors/wallet/payout
// @access  Private (Vendor)
const requestVendorPayout = asyncHandler(async (req, res, next) => {
  const targetVendorId = req.user.effectiveVendorId || req.user.id;
  const { amount, notes } = req.body;

  if (!amount || amount <= 0) {
    return next(new ErrorResponse('Please specify a valid payout withdrawal amount', 400));
  }

  let profile = await VendorProfile.findOne({ user: targetVendorId });
  if (!profile) {
    return next(new ErrorResponse('Vendor profile not found', 404));
  }

  const payoutItem = {
    payoutId: 'PO-' + Date.now().toString().slice(-6),
    amount: Number(amount),
    status: 'Pending',
    notes: notes || 'Withdrawal request to bank account',
    requestedAt: new Date(),
    bankAccount: profile.bankDetails?.accountNumber ? `...${String(profile.bankDetails.accountNumber).slice(-4)}` : 'Default Bank'
  };

  if (!profile.payoutHistory) {
    profile.payoutHistory = [];
  }

  profile.payoutHistory.unshift(payoutItem);
  await profile.save();

  res.status(201).json({
    success: true,
    message: 'Payout withdrawal request submitted successfully',
    data: payoutItem
  });
});

module.exports = {
  getVendor,
  getVendorProfile,
  updateVendor,
  approveVendor,
  updateSubscription,
  updateVendorProfile,
  getVendors,
  deleteVendor,
  createVendor,
  getVendorStaff,
  createVendorStaff,
  updateVendorStaff,
  deleteVendorStaff,
  getVendorWallet,
  requestVendorPayout
};

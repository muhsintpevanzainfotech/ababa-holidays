const User = require('../models/User');
const VendorProfile = require('../models/VendorProfile');
const Booking = require('../models/Booking');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { deleteFile } = require('../utils/fileHelpers');
const { generateOTP, hashOTP } = require('../utils/authHelpers');
const sendEmail = require('../services/emailService');

// @desc    Get user profile (Self)
// @route   GET /api/users/profile
// @access  Private
const getUserProfile = asyncHandler(async (req, res, next) => {
  let user = await User.findById(req.user.id)
    .select('-password');
  
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  let profile = null;
  if (user.role === 'Vendor') {
    profile = await VendorProfile.findOne({ user: user._id })
      .populate('selectedServices', 'title description image')
      .populate('subscription');
  }

  res.json({
    success: true,
    data: {
      ...user.toObject(),
      profile
    }
  });
});

// @desc    Request OTP for profile/password update
// @route   POST /api/users/request-otp
// @access  Private
const requestOTP = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  const otp = generateOTP();
  console.log(`OTP generated for update by ${user.email}: ${otp}`);

  user.otp = hashOTP(otp);
  user.otpExpire = Date.now() + 10 * 60 * 1000; // 10 minutes

  await user.save({ validateBeforeSave: false });

  await sendEmail({
    email: user.email,
    subject: 'Security Verification Code',
    message: `Your account update verification code is: ${otp}. This code will expire in 10 minutes.`
  });

  res.json({
    success: true,
    message: 'OTP sent to email'
  });
});

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
const updateUserProfile = asyncHandler(async (req, res, next) => {
  if (!req.body) {
    return next(new ErrorResponse('Request body is missing', 400));
  }

  const user = await User.findById(req.user.id).select('+password');

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  // Verify OTP
  const { otp } = req.body;
  if (!otp) {
    return next(new ErrorResponse('OTP verification required for profile updates', 400));
  }

  if (user.otp !== hashOTP(otp)) {
    return next(new ErrorResponse('Invalid OTP', 400));
  }

  if (user.otpExpire < Date.now()) {
    return next(new ErrorResponse('OTP expired', 400));
  }

  // Clear OTP after successful verification
  user.otp = undefined;
  user.otpExpire = undefined;

  user.name = req.body.name || user.name;
  user.phone = req.body.phone || user.phone;
  
  if (req.file) {
    if (user.avatar) {
      deleteFile(user.avatar);
    }
    user.avatar = req.file.path;
  }
  
  if (req.body.password) {
    user.password = req.body.password;
  }

  const updatedUser = await user.save();

  res.json({
    success: true,
    data: {
      _id: updatedUser._id,
      customId: updatedUser.customId,
      name: updatedUser.name,
      email: updatedUser.email,
      phone: updatedUser.phone,
      role: updatedUser.role,
      avatar: updatedUser.avatar,
      isVerified: updatedUser.isVerified,
      lastActive: updatedUser.lastActive,
      isOnline: updatedUser.isOnline
    }
  });
});

// @desc    Get user bookings
// @route   GET /api/users/bookings
// @access  Private
const getUserBookings = asyncHandler(async (req, res, next) => {
  const bookings = await Booking.find({ user: req.user.id }).populate('package');
  
  res.json({
    success: true,
    count: bookings.length,
    data: bookings
  });
});

// @desc    Save a package
// @route   POST /api/users/saved-packages/:packageId
// @access  Private
const savePackage = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  if (user.savedPackages.includes(req.params.packageId)) {
    return next(new ErrorResponse('Package already saved', 400));
  }

  user.savedPackages.push(req.params.packageId);
  await user.save();

  res.status(200).json({ 
    success: true, 
    message: 'Package saved successfully', 
    data: user.savedPackages 
  });
});

// @desc    Remove saved package
// @route   DELETE /api/users/saved-packages/:packageId
// @access  Private
const removeSavedPackage = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  
  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  user.savedPackages = user.savedPackages.filter(
    pkg => pkg.toString() !== req.params.packageId
  );
  
  await user.save();
  
  res.status(200).json({ 
    success: true, 
    message: 'Package removed successfully', 
    data: user.savedPackages 
  });
});

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
const getUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find({}).populate({
    path: 'profile',
    populate: { path: 'subscription' }
  });
  res.json({ success: true, count: users.length, data: users });
});

// @desc    Create user (Admin only)
// @route   POST /api/users
// @access  Private/Admin
const createUser = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, phone } = req.body;

  // Check if user exists by email
  const userExists = await User.findOne({ email });
  if (userExists) {
    return next(new ErrorResponse('Email already exists: Already user have', 400));
  }
  
  // Check if user exists by phone
  if (phone) {
    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      return next(new ErrorResponse('Phone number already exists: Already user have', 400));
    }
  }

  const avatar = req.files && req.files.avatar ? req.files.avatar[0].path : undefined;

  const user = await User.create({
    name,
    email,
    password,
    role,
    phone,
    avatar,
    isVerified: true,
    isSuspended: req.body.isSuspended === 'true' || req.body.isSuspended === true,
    permissions: req.body.permissions ? (typeof req.body.permissions === 'string' ? JSON.parse(req.body.permissions) : req.body.permissions) : []
  });

  if (role === 'Vendor' && req.body.profile) {
    try {
      const profileData = JSON.parse(req.body.profile);
      profileData.user = user._id;
      if (!profileData.companyName) profileData.companyName = name;

      // Handle vendor-specific files
      if (req.files) {
        if (req.files.idCard) profileData.idCard = req.files.idCard[0].path;
        if (req.files.tinUpload) profileData.tin = { ...profileData.tin, upload: req.files.tinUpload[0].path };
        if (req.files.gstUpload) profileData.gst = { ...profileData.gst, upload: req.files.gstUpload[0].path };
        if (req.files.bankUpload) profileData.bankDetails = { ...profileData.bankDetails, upload: req.files.bankUpload[0].path };
      }

      await VendorProfile.create(profileData);
    } catch (err) {
      console.error('Profile parsing error:', err);
    }
  }

  res.status(201).json({ success: true, data: user });
});

// @desc    Update user (Admin only)
// @route   PUT /api/users/:id
// @access  Private/Admin
const updateUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  const { email, phone } = req.body;

  if (email && email !== user.email) {
    if (await User.findOne({ email })) return next(new ErrorResponse('Email already registered: Already user have', 400));
  }
  if (phone && phone !== user.phone) {
    if (await User.findOne({ phone })) return next(new ErrorResponse('Phone number already registered: Already user have', 400));
  }

  if (req.files && req.files.avatar) {
    if (user.avatar && !user.avatar.startsWith('http')) {
      deleteFile(user.avatar);
    }
    user.avatar = req.files.avatar[0].path;
  }

  user.name = req.body.name || user.name;
  user.email = req.body.email || user.email;
  user.role = req.body.role || user.role;
  user.phone = req.body.phone || user.phone;
  if (req.body.isVerified !== undefined) user.isVerified = req.body.isVerified;
  
  if (req.body.isSuspended !== undefined) {
    const isSuspendedVal = req.body.isSuspended === true || req.body.isSuspended === 'true';
    // Prevent self-suspension
    if (user._id.toString() === req.user.id && isSuspendedVal === true) {
      return next(new ErrorResponse('You cannot suspend your own account', 400));
    }
    user.isSuspended = isSuspendedVal;
  }

  if (req.body.password) {
    user.password = req.body.password;
  }

  if (req.body.permissions) {
    user.permissions = typeof req.body.permissions === 'string' ? JSON.parse(req.body.permissions) : req.body.permissions;
  }

  const updatedUser = await user.save();

  if (updatedUser.role === 'Vendor' && req.body.profile) {
    try {
      const profileData = JSON.parse(req.body.profile);
      const profile = await VendorProfile.findOne({ user: updatedUser._id });

      // Handle vendor-specific files in update
      if (req.files) {
        if (req.files.idCard) {
          if (profile?.idCard) deleteFile(profile.idCard);
          profileData.idCard = req.files.idCard[0].path;
        }
        if (req.files.tinUpload) {
          if (profile?.tin?.upload) deleteFile(profile.tin.upload);
          profileData.tin = { ...profileData.tin, upload: req.files.tinUpload[0].path };
        }
        if (req.files.gstUpload) {
          if (profile?.gst?.upload) deleteFile(profile.gst.upload);
          profileData.gst = { ...profileData.gst, upload: req.files.gstUpload[0].path };
        }
        if (req.files.bankUpload) {
          if (profile?.bankDetails?.upload) deleteFile(profile.bankDetails.upload);
          profileData.bankDetails = { ...profileData.bankDetails, upload: req.files.bankUpload[0].path };
        }
      }

      if (profile) {
        Object.assign(profile, profileData);
        await profile.save();
      } else {
        profileData.user = updatedUser._id;
        if (!profileData.companyName) profileData.companyName = updatedUser.name;
        await VendorProfile.create(profileData);
      }
    } catch (err) {
      console.error('Profile parsing error:', err);
    }
  }

  res.json({ success: true, data: updatedUser });
});

// @desc    Delete user (Admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
const deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  // If user is a vendor, delete their profile and files
  if (user.role === 'Vendor') {
    const profile = await VendorProfile.findOne({ user: user._id });
    if (profile) {
      if (profile.idCard) deleteFile(profile.idCard);
      if (profile.tin && profile.tin.upload) deleteFile(profile.tin.upload);
      if (profile.gst && profile.gst.upload) deleteFile(profile.gst.upload);
      await profile.deleteOne();
    }
  }

  if (user.avatar) {
    deleteFile(user.avatar);
  }

  await user.deleteOne();

  res.json({ success: true, message: 'User removed' });
});

module.exports = {
  getUserProfile,
  updateUserProfile,
  requestOTP,
  getUserBookings,
  savePackage,
  removeSavedPackage,
  getUsers,
  createUser,
  updateUser,
  deleteUser
};

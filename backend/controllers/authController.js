const VendorProfile = require('../models/VendorProfile');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const sendEmail = require('../services/emailService');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const jwt = require('jsonwebtoken');
const { generateOTP, hashOTP, hashToken } = require('../utils/authHelpers');

// ================= REGISTER =================
// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
const register = asyncHandler(async (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return next(new ErrorResponse('Request body missing. Use JSON format.', 400));
  }

  const { name, email, password, phone, role, managedBy, subscriptionId, selectedServices, companyName, businessLicense } = req.body;

  if (!name || !email || !password) {
    return next(new ErrorResponse('Name, email and password are required', 400));
  }

  let user = await User.findOne({ email });

  // Existing user logic
  if (user) {
    if (user.isVerified) {
      return next(new ErrorResponse('User already exists', 400));
    }

    // Resend OTP for unverified user
    const otp = generateOTP();
    console.log(`OTP generated for ${user.email}: ${otp}`);
    user.otp = hashOTP(otp);
    user.otpExpire = Date.now() + 10 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    await sendEmail({
      email: user.email,
      subject: 'Verification Code',
      message: `Your OTP is ${otp}`
    });

    return res.json({
      success: true,
      message: 'OTP resent successfully',
      userId: user._id
    });
  }

  // Phone check
  if (phone) {
    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      return next(new ErrorResponse('Phone already exists', 400));
    }
  }

  const otp = generateOTP();
  console.log(`OTP generated for ${email}: ${otp}`);

  user = await User.create({
    name,
    email,
    password,
    phone,
    otp: hashOTP(otp),
    otpExpire: Date.now() + 10 * 60 * 1000,
    isVerified: false,
    role: role || 'User',
    managedBy: managedBy || null,
    subscription: subscriptionId || null
  });

  // Create Vendor Profile if role is Vendor
  if (user.role === 'Vendor') {
    let planTitle = 'Free';
    if (subscriptionId) {
      const sub = await Subscription.findById(subscriptionId);
      if (sub) {
        planTitle = sub.plan;
      }
    }

    await VendorProfile.create({
      user: user._id,
      companyName: companyName || 'My Company',
      businessLicense: businessLicense || '',
      selectedServices: selectedServices || [],
      subscription: subscriptionId || null,
      subscriptionPlan: planTitle,
      isApproved: false
    });
  }

  await sendEmail({
    email: user.email,
    subject: 'Account Verification',
    message: `Your OTP is ${otp}`
  });

  res.status(201).json({
    success: true,
    message: 'Registered successfully. Verify OTP.',
    userId: user._id
  });
});

// ================= VERIFY OTP =================
// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = asyncHandler(async (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return next(new ErrorResponse('Request body missing.', 400));
  }

  const { email, otp } = req.body;

  if (!email || !otp) {
    return next(new ErrorResponse('Email and OTP required', 400));
  }

  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  if (user.otp !== hashOTP(otp)) {
    return next(new ErrorResponse('Invalid OTP', 400));
  }

  if (user.otpExpire < Date.now()) {
    return next(new ErrorResponse('OTP expired', 400));
  }

  user.isVerified = true;
  user.otp = undefined;
  user.otpExpire = undefined;
  await user.save();

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = hashToken(refreshToken);
  user.isOnline = true;
  await user.save();

  res.json({
    success: true,
    message: 'Account verified',
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    lastActive: user.lastActive,
    isOnline: user.isOnline,
    accessToken,
    refreshToken
  });
});

// ================= LOGIN =================
// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const login = asyncHandler(async (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return next(new ErrorResponse('Request body missing.', 400));
  }

  const { email, password } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse('Email and password required', 400));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    return next(new ErrorResponse('User matching this email not found', 401));
  }

  if (user.isSuspended) {
    return next(new ErrorResponse('Your account has been suspended. Please contact support.', 403));
  }

  // Only Admin and Sub-Admin can access this dashboard
  if (user.role !== 'Admin' && user.role !== 'Sub-Admin') {
    return next(new ErrorResponse('Access denied. This dashboard is for Admins and Sub-Admins only.', 401));
  }

  if (!(await user.matchPassword(password))) {
    return next(new ErrorResponse('Incorrect password, please try again', 401));
  }

  if (!user.isVerified) {
    return next(new ErrorResponse('Verify your account first', 401));
  }

  // If Vendor, check approval
  if (user.role === 'Vendor') {
    const profile = await VendorProfile.findOne({ user: user._id });
    if (!profile || !profile.isApproved) {
      return next(new ErrorResponse('Vendor account not approved yet by Admin', 401));
    }
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = hashToken(refreshToken);
  user.isOnline = true;
  await user.save();

  res.json({
    success: true,
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    lastActive: user.lastActive,
    isOnline: user.isOnline,
    accessToken,
    refreshToken
  });
});

// ================= REFRESH TOKEN =================
// @desc    Refresh Access Token
// @route   POST /api/auth/refresh-token
// @access  Public
const refreshAccessToken = asyncHandler(async (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return next(new ErrorResponse('Request body missing.', 400));
  }

  const { refreshToken } = req.body;

  if (!refreshToken) {
    return next(new ErrorResponse('Refresh token required', 401));
  }

  const hashedToken = hashToken(refreshToken);
  const user = await User.findOne({ refreshToken: hashedToken });

  if (!user) {
    return next(new ErrorResponse('Invalid refresh token', 403));
  }

  jwt.verify(refreshToken, process.env.JWT_SECRET, (err) => {
    if (err) {
      return next(new ErrorResponse('Token expired', 403));
    }

    const newAccessToken = generateAccessToken(user._id);

    return res.json({
      success: true,
      accessToken: newAccessToken
    });
  });
});

// ================= GOOGLE LOGIN =================
// @desc    Google Login
// @route   POST /api/auth/google-login
// @access  Public
const googleLogin = asyncHandler(async (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return next(new ErrorResponse('Request body missing.', 400));
  }

  const { googleId, email, name, avatar, role, subscriptionId, selectedServices, companyName, businessLicense } = req.body;

  if (!email || !googleId) {
    return next(new ErrorResponse('Google login failed', 400));
  }

  let user = await User.findOne({ email });

  if (user) {
    if (user.isSuspended) {
      return next(new ErrorResponse('Your account has been suspended. Please contact support.', 403));
    }
    if (!user.googleId) {
      user.googleId = googleId;
      user.isVerified = true;
      await user.save();
    }
  } else {
    user = await User.create({
      name,
      email,
      googleId,
      avatar,
      role: role || 'User',
      isVerified: true,
      subscription: subscriptionId || null
    });

    // Create Vendor Profile if role is Vendor
    if (user.role === 'Vendor') {
      await VendorProfile.create({
        user: user._id,
        companyName: companyName || 'My Company',
        businessLicense: businessLicense || '',
        selectedServices: selectedServices || []
      });
    }
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = hashToken(refreshToken);
  await user.save();

  res.json({
    success: true,
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    lastActive: user.lastActive,
    isOnline: user.isOnline,
    accessToken,
    refreshToken
  });
});

// ================= FORGOT PASSWORD =================
// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
// @access  Public
const forgotPassword = asyncHandler(async (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return next(new ErrorResponse('Request body missing.', 400));
  }

  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    return next(new ErrorResponse('User not found', 404));
  }

  const otp = generateOTP();
  console.log(`OTP generated for password reset for ${user.email}: ${otp}`);

  user.otp = hashOTP(otp);
  user.otpExpire = Date.now() + 10 * 60 * 1000;

  await user.save({ validateBeforeSave: false });

  await sendEmail({
    email: user.email,
    subject: 'Password Reset OTP',
    message: `Your OTP is ${otp}`
  });

  res.json({
    success: true,
    message: 'OTP sent to email'
  });
});

// ================= RESET PASSWORD =================
// @desc    Reset Password
// @route   PUT /api/auth/resetpassword
// @access  Public
const resetPassword = asyncHandler(async (req, res, next) => {
  if (!req.body || Object.keys(req.body).length === 0) {
    return next(new ErrorResponse('Request body missing.', 400));
  }

  const { email, otp, password } = req.body;

  const user = await User.findOne({
    email,
    otp: hashOTP(otp),
    otpExpire: { $gt: Date.now() }
  });

  if (!user) {
    return next(new ErrorResponse('Invalid or expired OTP', 400));
  }

  user.password = password;
  user.otp = undefined;
  user.otpExpire = undefined;

  await user.save();

  res.json({
    success: true,
    message: 'Password reset successful'
  });
});

// ================= LOGOUT =================
// @desc    Logout User
// @route   POST /api/auth/logout
// @access  Private
const logout = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.refreshToken = undefined;
    user.isOnline = false;
    await user.save();
  }

  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// ================= EXPORT =================
module.exports = {
  register,
  verifyOTP,
  login,
  refreshAccessToken,
  googleLogin,
  forgotPassword,
  resetPassword,
  logout
};

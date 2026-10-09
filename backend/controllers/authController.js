const VendorProfile = require('../models/VendorProfile');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const sendEmail = require('../services/emailService');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const jwt = require('jsonwebtoken');
const { generateOTP, hashOTP, hashToken } = require('../utils/authHelpers');
const { deleteFile } = require('../utils/fileHelpers');

// ================= HELPERS =================
const getOtpTemplate = (otp, title, description, name = '') => {
  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px; border: 1px solid #f0f0f0; border-radius: 16px; background-color: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.05);">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50; margin: 0; font-size: 28px; font-weight: 800;">ABABA Holidays</h1>
            <div style="width: 50px; height: 4px; background: #3498db; margin: 15px auto; border-radius: 2px;"></div>
        </div>
        
        <h2 style="color: #34495e; font-size: 20px; font-weight: 700; margin-bottom: 20px;">${title}</h2>
        
        ${name ? `<p style="color: #7f8c8d; font-size: 16px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>` : ''}
        
        <p style="color: #7f8c8d; font-size: 16px; line-height: 1.6;">${description}</p>
        
        <div style="background: linear-gradient(135deg, #f1c40f 0%, #f39c12 100%); padding: 30px; border-radius: 12px; margin: 30px 0; text-align: center; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);">
            <div style="font-family: 'Courier New', Courier, monospace; font-size: 42px; font-weight: 900; color: #2c3e50; letter-spacing: 12px; text-shadow: 0 1px 0 rgba(255,255,255,0.5);">
                ${otp}
            </div>
            <p style="margin-top: 15px; color: #2c3e50; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 2px; opacity: 0.8;">
                Verification Code (Expires in 10 min)
            </p>
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 12px; border-left: 4px solid #3498db; margin-bottom: 30px;">
            <p style="margin: 0; color: #34495e; font-size: 14px; font-weight: 600;">Security Note:</p>
            <p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 13px; line-height: 1.4;">If you did not request this code, please ignore this email or contact support if you suspect unauthorized access.</p>
        </div>
        
        <div style="border-top: 1px solid #f0f0f0; padding-top: 25px; text-align: center;">
            <p style="margin: 0; color: #bdc3c7; font-size: 11px; text-transform: uppercase; letter-spacing: 1px;">
                &copy; 2026 ABABA Holidays &bull; Global Event Management
            </p>
        </div>
    </div>
  `;
};

const sendCorrectionEmail = async (user, otp, password, name) => {
  if (user.role === 'Vendor') {
    await sendEmail({
      email: user.email,
      subject: 'ABABA Holidays: Registration Details Updated',
      html: getOtpTemplate(otp, 'Registration Updated', 'Your vendor registration details have been updated. Please use the verification code below to activate your account.', name || user.name)
    });
  } else {
    await sendEmail({
      email: user.email,
      subject: 'Account Verification - Updated',
      html: getOtpTemplate(otp, 'Account Verification - Updated', 'Your updated verification code is ready.')
    });
  }
};

const resolveAddressIds = async (address) => {
  if (!address) return address;
  const mongoose = require('mongoose');

  // Resolve Country
  if (address.country && String(address.country).trim()) {
    if (!mongoose.Types.ObjectId.isValid(address.country)) {
      const Country = require('../models/Country');
      const countryName = String(address.country).trim();
      let countryObj = await Country.findOne({ name: { $regex: new RegExp(`^${countryName}$`, 'i') } });
      if (!countryObj) {
        countryObj = await Country.findOne({ name: { $regex: /^india$/i } });
        if (!countryObj) {
          countryObj = await Country.create({ name: countryName || 'India', code: 'IN', dialCode: '+91' });
        }
      }
      address.country = countryObj._id;
    }
  } else {
    delete address.country;
  }

  // Resolve State
  if (address.state && String(address.state).trim()) {
    if (!mongoose.Types.ObjectId.isValid(address.state)) {
      const State = require('../models/State');
      const stateName = String(address.state).trim();
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
    }
  } else {
    delete address.state;
  }

  return address;
};

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

    // --- CORRECTION WORKFLOW ---
    // If user exists but not verified, allow "correction" (updating info and resending OTP)
    user.name = name || user.name;
    user.phone = phone || user.phone;
    if (password) user.password = password;
    user.managedBy = managedBy || user.managedBy;
    user.subscription = subscriptionId || user.subscription;

    const otp = generateOTP();
    console.log(`OTP generated for correction/resend to ${user.email}: ${otp}`);
    user.otp = hashOTP(otp);
    user.otpExpire = Date.now() + 10 * 60 * 1000;

    // Update Vendor Profile if role is Vendor
    if (user.role === 'Vendor' || role === 'Vendor') {
      user.role = 'Vendor'; // Ensure role is Vendor if updated to it
      
      let profile = await VendorProfile.findOne({ user: user._id });
      
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

      let planTitle = 'Free';
      if (subscriptionId) {
        const sub = await Subscription.findById(subscriptionId);
        if (sub) planTitle = sub.plan;
      }

      const profilePayload = {
        companyName: companyName || req.body.companyName || (profile ? profile.companyName : 'New Vendor'),
        businessLicense: businessLicense || req.body.businessLicense || (profile ? profile.businessLicense : ''),
        selectedServices: req.body.selectedServices || (profile ? profile.selectedServices : []),
        subscription: subscriptionId || (profile ? profile.subscription : null),
        subscriptionPlan: planTitle,
        vendorType: req.body.vendorType || (profile ? profile.vendorType : 'Individual'),
        address: req.body.address || (profile ? profile.address : undefined),
        spoc: req.body.spoc || (profile ? profile.spoc : undefined),
        bankDetails: req.body.bankDetails || (profile ? profile.bankDetails : undefined),
        seo: req.body.seo || (profile ? profile.seo : undefined),
        tin: req.body.tin || (profile ? profile.tin : undefined),
        gst: req.body.gst || (profile ? profile.gst : undefined)
      };

      // Handle files for vendor profile
      if (req.files) {
        if (req.files.idCard || req.files.idCardFile) {
            const file = (req.files.idCard || req.files.idCardFile)[0];
            if (profile?.idCard) deleteFile(profile.idCard);
            profilePayload.idCard = file.path;
        }
        if (req.files.tinUpload || req.files.tinFile || req.files.panUpload || req.files.panFile) {
            const file = (req.files.tinUpload || req.files.tinFile || req.files.panUpload || req.files.panFile)[0];
            if (profile?.tin?.upload) deleteFile(profile.tin.upload);
            profilePayload.tin = { ...(profilePayload.tin || {}), upload: file.path };
        }
        if (req.files.gstUpload || req.files.gstFile) {
            const file = (req.files.gstUpload || req.files.gstFile)[0];
            if (profile?.gst?.upload) deleteFile(profile.gst.upload);
            profilePayload.gst = { ...(profilePayload.gst || {}), upload: file.path };
        }
        if (req.files.bankUpload || req.files.bankFile || req.files.passbookUpload || req.files.passbookFile) {
            const file = (req.files.bankUpload || req.files.bankFile || req.files.passbookUpload || req.files.passbookFile)[0];
            if (profile?.bankDetails?.upload) deleteFile(profile.bankDetails.upload);
            profilePayload.bankDetails = { ...(profilePayload.bankDetails || {}), upload: file.path };
        }
        if (req.files.tradeLicenseUpload || req.files.tradeLicenseFile) {
            const file = (req.files.tradeLicenseUpload || req.files.tradeLicenseFile)[0];
            if (profile?.tradeLicenseDoc) deleteFile(profile.tradeLicenseDoc);
            profilePayload.tradeLicenseDoc = file.path;
        }
        
        if (req.files.logoS || req.files.logoM || req.files.logoL) {
          profilePayload.companylogos = {
            small: req.files.logoS ? (deleteFile(profile?.companylogos?.small), req.files.logoS[0].path) : (profile?.companylogos?.small),
            medium: req.files.logoM ? (deleteFile(profile?.companylogos?.medium), req.files.logoM[0].path) : (profile?.companylogos?.medium),
            large: req.files.logoL ? (deleteFile(profile?.companylogos?.large), req.files.logoL[0].path) : (profile?.companylogos?.large)
          };
        }
      }

      if (profile) {
        Object.assign(profile, profilePayload);
        await profile.save();
      } else {
        profilePayload.user = user._id;
        await VendorProfile.create(profilePayload);
      }
    }

    // Handle files for user avatar if provided
    if (req.files && req.files.avatar) {
      if (user.avatar && !user.avatar.startsWith('http')) deleteFile(user.avatar);
      user.avatar = req.files.avatar[0].path;
    }

    await user.save({ validateBeforeSave: false });

    // Send Email
    await sendCorrectionEmail(user, otp, password, name);

    return res.json({
      success: true,
      message: 'Registration details updated. Verification OTP sent.',
      userId: user._id,
      email: user.email,
      isCorrection: true
    });
  }

  // Phone check
  if (phone) {
    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      return next(new ErrorResponse('Phone already exists', 400));
    }
  }

  const isStaffRole = ['Admin', 'Sub-Admin', 'Vendor-Staff', 'Staff'].includes(role) || req.body.isVerified === true || req.body.skipVerification === true || !!req.user;

  const otp = isStaffRole ? undefined : generateOTP();
  if (otp) console.log(`OTP generated for ${email}: ${otp}`);

  user = await User.create({
    name,
    email,
    password,
    phone,
    otp: otp ? hashOTP(otp) : undefined,
    otpExpire: otp ? (Date.now() + 10 * 60 * 1000) : undefined,
    isVerified: isStaffRole ? true : false,
    role: role || 'User',
    managedBy: managedBy || (req.user ? req.user._id : null),
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

    let packageCommissionObj = { rate: 0, type: 'Percentage' };
    if (req.body.packageCommission) {
      if (typeof req.body.packageCommission === 'string') {
        try { packageCommissionObj = JSON.parse(req.body.packageCommission); } catch (e) {}
      } else {
        packageCommissionObj = req.body.packageCommission;
      }
    } else if (req.body.packageCommissionRate !== undefined) {
      packageCommissionObj = {
        rate: Number(req.body.packageCommissionRate) || 0,
        type: req.body.packageCommissionType || 'Percentage'
      };
    }

    const profilePayload = {
      user: user._id,
      companyName: companyName || req.body.companyName || 'New Vendor',
      businessLicense: businessLicense || req.body.businessLicense || '',
      selectedServices: req.body.selectedServices || [],
      subscription: subscriptionId || null,
      subscriptionPlan: planTitle,
      packageCommission: packageCommissionObj,
      isApproved: false,
      vendorType: req.body.vendorType || 'Individual',
      address: req.body.address,
      spoc: req.body.spoc,
      bankDetails: req.body.bankDetails,
      seo: req.body.seo,
      tin: req.body.tin,
      gst: req.body.gst
    };

    // Handle files for user avatar if provided
    if (req.files && req.files.avatar) {
      user.avatar = req.files.avatar[0].path;
      await user.save({ validateBeforeSave: false });
    }

    // Handle files for vendor profile
    if (req.files) {
      if (req.files.idCard || req.files.idCardFile) {
        const file = (req.files.idCard || req.files.idCardFile)[0];
        profilePayload.idCard = file.path;
      }
      if (req.files.tinUpload || req.files.tinFile || req.files.panUpload || req.files.panFile) {
        const file = (req.files.tinUpload || req.files.tinFile || req.files.panUpload || req.files.panFile)[0];
        profilePayload.tin = { ...(profilePayload.tin || {}), upload: file.path };
      }
      if (req.files.gstUpload || req.files.gstFile) {
        const file = (req.files.gstUpload || req.files.gstFile)[0];
        profilePayload.gst = { ...(profilePayload.gst || {}), upload: file.path };
      }
      if (req.files.bankUpload || req.files.bankFile || req.files.passbookUpload || req.files.passbookFile) {
        const file = (req.files.bankUpload || req.files.bankFile || req.files.passbookUpload || req.files.passbookFile)[0];
        profilePayload.bankDetails = { ...(profilePayload.bankDetails || {}), upload: file.path };
      }
      if (req.files.tradeLicenseUpload || req.files.tradeLicenseFile) {
        const file = (req.files.tradeLicenseUpload || req.files.tradeLicenseFile)[0];
        profilePayload.tradeLicenseDoc = file.path;
      }
      
      if (req.files.logoS || req.files.logoM || req.files.logoL) {
        profilePayload.companylogos = {
          small: req.files.logoS ? req.files.logoS[0].path : undefined,
          medium: req.files.logoM ? req.files.logoM[0].path : undefined,
          large: req.files.logoL ? req.files.logoL[0].path : undefined
        };
      }
    }

    // Create Profile
    await VendorProfile.create(profilePayload);
  }

  // Send Email for account verification
  if (user.role === 'Vendor') {
    const emailHtml = getOtpTemplate(otp, 'ABABA Holidays: Vendor Account Details & Verification', 'Your vendor account has been registered successfully. Please use the verification code below to activate your account.', name);
    
    // Add credentials to the template
    const finalHtml = emailHtml.replace('</div>\n        \n        <div style="border-top', `
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 30px;">
            <h3 style="margin-top: 0; color: #34495e; font-size: 15px;">Your Business Credentials:</h3>
            <p style="margin-bottom: 8px; color: #7f8c8d; font-size: 14px;"><strong>Email:</strong> ${email}</p>
            <p style="margin-top: 0; color: #7f8c8d; font-size: 14px;"><strong>Password:</strong> ${password}</p>
        </div>
        ` + '</div>\n        \n        <div style="border-top');

    await sendEmail({
      email: user.email,
      subject: 'ABABA Holidays: Vendor Account Details & Verification',
      html: finalHtml
    });
  } else {
    await sendEmail({
      email: user.email,
      subject: 'Account Verification',
      html: getOtpTemplate(otp, 'Account Verification', 'Please use the verification code below to complete your registration.')
    });
  }

  res.status(201).json({
    success: true,
    message: 'Registered successfully. Verify OTP.',
    userId: user._id,
    email: user.email
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

  if (user.role === 'Vendor') {
    const profile = await VendorProfile.findOne({ user: user._id });
    if (!profile || !profile.isApproved) {
      return res.json({
        success: true,
        isApproved: false,
        message: 'Account verified successfully! Your profile is currently under review by the ABABA Holidays Admin team. You will be notified once activated.',
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      });
    }
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = hashToken(refreshToken);
  user.isOnline = true;
  user.lastActive = new Date();
  await user.save();

  res.json({
    success: true,
    isApproved: true,
    message: 'Account verified',
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    permissions: user.permissions || [],
    managedBy: user.managedBy || null,
    isVerified: user.isVerified,
    lastActive: user.lastActive,
    isOnline: user.isOnline,
    accessToken,
    refreshToken,
    user: {
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    }
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

  const { email, password, appType } = req.body;

  if (!email || !password) {
    return next(new ErrorResponse('Email and password required', 400));
  }

  console.log(`Login attempt for ${email} with appType: ${appType}`);

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    console.log(`User not found for email: ${email}`);
    return next(new ErrorResponse('User matching this email not found', 401));
  }

  if (user.isSuspended) {
    console.log(`User ${email} is suspended`);
    return next(new ErrorResponse('Your account has been suspended. Please contact support.', 403));
  }

  // App-specific Role check
  if (appType === 'admin') {
    if (user.role !== 'Admin' && user.role !== 'Sub-Admin' && user.role !== 'Staff') {
      console.log(`Admin portal access denied for ${email} (Role: ${user.role})`);
      return next(new ErrorResponse('Access denied. Admin portal is for Admins, Sub-Admins, and Staff only.', 401));
    }
  } else if (appType === 'vendor') {
    if (user.role !== 'Vendor' && user.role !== 'Vendor-Staff') {
      console.log(`Vendor portal access denied for ${email} (Role: ${user.role})`);
      return next(new ErrorResponse('Access denied. Vendor portal is for Vendors and Vendor Staff only.', 401));
    }
  } else if (appType === 'user' || appType === 'website') {
    // Website / User portal access
    if (!['User', 'Admin', 'Sub-Admin', 'Staff', 'Vendor'].includes(user.role)) {
      console.log(`Website portal access denied for ${email} (Role: ${user.role})`);
      return next(new ErrorResponse('Access denied. Unauthorized role.', 401));
    }
  } else {
    // Default fallback or shared login (if any)
    if (!['User', 'Admin', 'Sub-Admin', 'Staff', 'Vendor', 'Vendor-Staff'].includes(user.role)) {
      console.log(`Unauthorized role access attempt for ${email} (Role: ${user.role})`);
      return next(new ErrorResponse('Access denied. Unauthorized role.', 401));
    }
  }

  if (!(await user.matchPassword(password))) {
    console.log(`Incorrect password attempt for ${email}`);
    return next(new ErrorResponse('Incorrect password, please try again', 401));
  }

  if (!user.isVerified) {
    if (['Admin', 'Sub-Admin', 'Vendor-Staff', 'Staff'].includes(user.role)) {
      user.isVerified = true;
      await user.save({ validateBeforeSave: false });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Verify your account first',
        userId: user._id
      });
    }
  }

  // If Vendor or Vendor-Staff, check approval
  if (user.role === 'Vendor') {
    const profile = await VendorProfile.findOne({ user: user._id });
    if (!profile || !profile.isApproved) {
      return next(new ErrorResponse('Your vendor account is awaiting approval from the ABABA Holidays Admin team. You will be notified once activated.', 401));
    }
  } else if (user.role === 'Vendor-Staff') {
    if (user.managedBy) {
      const parentVendor = await User.findById(user.managedBy);
      if (!parentVendor || parentVendor.isSuspended) {
        return next(new ErrorResponse('Parent vendor account is inactive or suspended. Access denied.', 403));
      }
      const parentProfile = await VendorProfile.findOne({ user: user.managedBy });
      if (!parentProfile || !parentProfile.isApproved) {
        return next(new ErrorResponse('Parent vendor account is awaiting approval from the ABABA Holidays Admin team.', 401));
      }
    }
  }

  if (user.role === 'Vendor' || user.role === 'Vendor-Staff') {
    // MANDATORY OTP FOR VENDOR & VENDOR-STAFF LOGIN
    const otp = generateOTP();
    console.log(`Login OTP generated for ${user.email}: ${otp}`);
    user.otp = hashOTP(otp);
    user.otpExpire = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    await sendEmail({
      email: user.email,
      subject: 'Login Verification Code',
      html: getOtpTemplate(otp, 'Login Verification', 'A login attempt was made for your ABABA Holidays vendor staff account. Please use the code below to complete your sign-in.', user.name)
    });

    return res.status(200).json({
      success: true,
      message: 'OTP sent to your email for verification',
      needsOTP: true,
      email: user.email
    });
  }

  const accessToken = generateAccessToken(user._id);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = hashToken(refreshToken);
  user.isOnline = true;
  user.lastActive = new Date();
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
    refreshToken,
    user: {
      _id: user._id,
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role
    }
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
    html: getOtpTemplate(otp, 'Password Reset Request', 'We received a request to reset your password. Please use the code below to proceed.', user.name)
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

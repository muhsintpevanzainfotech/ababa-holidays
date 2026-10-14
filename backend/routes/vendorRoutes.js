const express = require('express');
const {
  getVendors,
  deleteVendor,
  createVendor,
  approveVendor,
  updateSubscription,
  updateVendorProfile,
  getVendorProfile,
  getVendor,
  updateVendor,
  getVendorStaff,
  createVendorStaff,
  updateVendorStaff,
  deleteVendorStaff,
  getVendorWallet,
  requestVendorPayout,
  getVendorApiKey,
  generateVendorApiKey,
  revokeVendorApiKey
} = require('../controllers/vendorController');
const { register, login } = require('../controllers/authController');

const { protect, authorize } = require('../middleware/authMiddleware');
const { createUpload } = require('../middleware/uploadMiddleware');
const upload = createUpload('vendors');

const router = express.Router();

const vendorUploadFields = [
  { name: 'avatar', maxCount: 1 },
  { name: 'coverBanner', maxCount: 1 },
  { name: 'coverBannerFile', maxCount: 1 },
  { name: 'coverImage', maxCount: 1 },
  { name: 'banner', maxCount: 1 },
  { name: 'idCard', maxCount: 1 },
  { name: 'idCardFile', maxCount: 1 },
  { name: 'tinUpload', maxCount: 1 },
  { name: 'tinFile', maxCount: 1 },
  { name: 'panUpload', maxCount: 1 },
  { name: 'panFile', maxCount: 1 },
  { name: 'gstUpload', maxCount: 1 },
  { name: 'gstFile', maxCount: 1 },
  { name: 'bankUpload', maxCount: 1 },
  { name: 'bankFile', maxCount: 1 },
  { name: 'passbookUpload', maxCount: 1 },
  { name: 'passbookFile', maxCount: 1 },
  { name: 'tradeLicenseUpload', maxCount: 1 },
  { name: 'tradeLicenseFile', maxCount: 1 },
  { name: 'logo', maxCount: 1 },
  { name: 'logoFile', maxCount: 1 },
  { name: 'companyLogo', maxCount: 1 },
  { name: 'logoS', maxCount: 1 },
  { name: 'logoM', maxCount: 1 },
  { name: 'logoL', maxCount: 1 }
];

const asyncHandler = require('../utils/asyncHandler');
const User = require('../models/User');
const VendorProfile = require('../models/VendorProfile');

// Public routes for vendor
router.post('/register', upload.fields(vendorUploadFields), register);
router.post('/login', upload.none(), login);

// Public route to fetch approved vendors for website display
router.get('/public', asyncHandler(async (req, res) => {
  const sanitizeField = (val) => {
    if (!val) return '';
    if (typeof val === 'object' && val !== null) return val.name || val.title || '';
    const str = String(val).trim();
    if (/^[0-9a-fA-F]{24}$/.test(str)) return '';
    return str;
  };

  const vendors = await User.find({ role: 'Vendor' }).select('-password');
  const data = await Promise.all(
    vendors.map(async (v) => {
      const profile = await VendorProfile.findOne({ user: v._id })
        .populate('selectedServices', 'title description image icon');
      const services = (profile?.selectedServices || []).map(s => typeof s === 'object' ? s.title : s);
      const isVerified = Boolean(v.isVerified);
      const isSuspended = Boolean(v.isSuspended);
      const isApproved = Boolean(profile?.isApproved);

      const city = sanitizeField(profile?.address?.city);
      const state = sanitizeField(profile?.address?.state);
      const country = sanitizeField(profile?.address?.country) || "India";
      const fullAddress = sanitizeField(profile?.address?.fullAddress);
      const location = city && state ? `${city}, ${state}` : (city || state || "South India");

      const rawDesc = profile?.description?.trim() || "";
      const description = rawDesc.length >= 15 && !/^(text|test|asdf|qwerty)/i.test(rawDesc)
        ? rawDesc
        : "Authorized verified travel partner offering customized tour packages, hotel reservations, and curated travel experiences.";

      return {
        id: v._id,
        _id: v._id,
        name: profile?.companyName || v.name,
        companyName: profile?.companyName || v.name,
        contactName: v.name,
        email: v.email,
        phone: v.phone,
        avatar: v.avatar,
        logo: profile?.companylogos?.large || profile?.companylogos?.medium || profile?.companylogos?.small || (v.avatar && !v.avatar.includes('ui-avatars') ? v.avatar : null),
        coverImage: profile?.coverBanner || (profile?.banner && !profile?.banner.includes('ui-avatars') ? profile.banner : null),
        rating: profile?.rating || 4.9,
        sold: profile?.totalTours || 120,
        priceLevel: profile?.priceLevel || "$$",
        location: location,
        city: city,
        state: state,
        country: country,
        fullAddress: fullAddress,
        verified: isVerified,
        isVerified: isVerified,
        isSuspended: isSuspended,
        isApproved: isApproved,
        category: profile?.vendorType || profile?.businessType || "Tour Operator",
        vendorType: profile?.vendorType || "Tour Operator",
        description: description,
        services: services,
        selectedServices: profile?.selectedServices || [],
        specialties: services.length > 0 ? services : ['Tour Packages', 'Custom Itineraries', 'Local Guides'],
        socialMedia: profile?.socialMedia || [],
        createdAt: v.createdAt
      };
    })
  );
  res.json({ success: true, count: data.length, data });
}));

// Public route to fetch single vendor by ID or Slug for website storefront
router.get('/public/:id', asyncHandler(async (req, res) => {
  const sanitizeField = (val) => {
    if (!val) return '';
    if (typeof val === 'object' && val !== null) return val.name || val.title || '';
    const str = String(val).trim();
    if (/^[0-9a-fA-F]{24}$/.test(str)) return '';
    return str;
  };

  const mongoose = require('mongoose');
  let vendor = null;
  let profile = null;
  const param = String(req.params.id || '').trim();

  // 1. Try ObjectId match on User._id
  if (param && mongoose.Types.ObjectId.isValid(param)) {
    vendor = await User.findOne({ _id: param, role: 'Vendor' }).select('-password');
  }

  // 2. Try ObjectId match on VendorProfile._id
  if (!vendor && param && mongoose.Types.ObjectId.isValid(param)) {
    profile = await VendorProfile.findById(param)
      .populate('selectedServices', 'title description image icon');
    if (profile && profile.user) {
      vendor = await User.findById(profile.user).select('-password');
    }
  }

  // 3. Try Slug / Company Name / User Name match
  if (!vendor && param) {
    const rawParam = decodeURIComponent(param).trim();
    const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const slugPattern = escapeRegex(rawParam).replace(/[-_]+/g, '[ -_]?');
    const slugRegex = new RegExp('^' + slugPattern + '$', 'i');

    // Find VendorProfile by companyName
    profile = await VendorProfile.findOne({ companyName: slugRegex })
      .populate('selectedServices', 'title description image icon');

    if (profile && profile.user) {
      vendor = await User.findById(profile.user).select('-password');
    }

    // If still not found, search User by name
    if (!vendor) {
      vendor = await User.findOne({ name: slugRegex, role: 'Vendor' }).select('-password');
      if (vendor && !profile) {
        profile = await VendorProfile.findOne({ user: vendor._id })
          .populate('selectedServices', 'title description image icon');
      }
    }
  }

  if (!vendor) {
    return res.status(404).json({ success: false, message: 'Vendor not found' });
  }

  if (!profile) {
    profile = await VendorProfile.findOne({ user: vendor._id })
      .populate('selectedServices', 'title description image icon');
  }

  const services = (profile?.selectedServices || []).map(s => typeof s === 'object' ? s.title : s);
  const isVerified = Boolean(vendor.isVerified);

  const city = sanitizeField(profile?.address?.city);
  const state = sanitizeField(profile?.address?.state);
  const country = sanitizeField(profile?.address?.country) || "India";
  const fullAddress = sanitizeField(profile?.address?.fullAddress);
  const location = city && state ? `${city}, ${state}` : (city || state || "South India");

  const rawDesc = profile?.description?.trim() || "";
  const description = rawDesc.length >= 15 && !/^(text|test|asdf|qwerty)/i.test(rawDesc)
    ? rawDesc
    : "Authorized verified travel partner offering customized tour packages, hotel reservations, and curated travel experiences.";

  const data = {
    id: vendor._id,
    _id: vendor._id,
    name: profile?.companyName || vendor.name,
    companyName: profile?.companyName || vendor.name,
    contactName: vendor.name,
    email: vendor.email,
    phone: vendor.phone,
    avatar: vendor.avatar,
    logo: profile?.companylogos?.large || profile?.companylogos?.medium || profile?.companylogos?.small || (vendor.avatar && !vendor.avatar.includes('ui-avatars') ? vendor.avatar : null),
    coverImage: profile?.coverBanner || (profile?.banner && !profile?.banner.includes('ui-avatars') ? profile.banner : null),
    rating: profile?.rating || 4.9,
    sold: profile?.totalTours || 120,
    priceLevel: profile?.priceLevel || "$$",
    location: location,
    city: city,
    state: state,
    country: country,
    fullAddress: fullAddress,
    verified: isVerified,
    isVerified: isVerified,
    category: profile?.vendorType || "Tour Operator",
    vendorType: profile?.vendorType || "Tour Operator",
    description: description,
    about: description,
    services: services,
    selectedServices: profile?.selectedServices || [],
    specialties: services.length > 0 ? services : ['Tour Packages', 'Custom Itineraries', 'Local Guides'],
    createdAt: vendor.createdAt
  };

  res.json({ success: true, data });
}));

// Profile routes (Vendor or Vendor-Staff)
router.get('/profile', protect, authorize('Vendor', 'Vendor-Staff', 'Staff'), getVendorProfile);
router.put('/profile', protect, authorize('Vendor', 'Vendor-Staff', 'Staff'), upload.fields(vendorUploadFields), updateVendorProfile);

// Vendor API Key Management routes
router.get('/api-key', protect, authorize('Vendor', 'Vendor-Staff', 'Staff', 'Admin'), getVendorApiKey);
router.post('/api-key/generate', protect, authorize('Vendor', 'Admin'), generateVendorApiKey);
router.delete('/api-key', protect, authorize('Vendor', 'Admin'), revokeVendorApiKey);

// Wallet & Financial Payout routes
router.get('/wallet', protect, authorize('Vendor', 'Vendor-Staff', 'Staff', 'Admin'), getVendorWallet);
router.post('/wallet/payout', protect, authorize('Vendor', 'Admin'), requestVendorPayout);

// Vendor Staff Management routes (Vendor or Admin)
router.route('/staff')
  .get(protect, authorize('Vendor', 'Admin'), getVendorStaff)
  .post(protect, authorize('Vendor', 'Admin'), createVendorStaff);

router.route('/staff/:id')
  .put(protect, authorize('Vendor', 'Admin'), updateVendorStaff)
  .delete(protect, authorize('Vendor', 'Admin'), deleteVendorStaff);

// Admin routes
router.put('/:id/approve', protect, authorize('Admin', 'Sub-Admin'), approveVendor);
router.route('/:id')
  .get(protect, authorize('Admin', 'Sub-Admin'), getVendor)
  .put(protect, authorize('Admin'), upload.fields(vendorUploadFields), updateVendor)
  .delete(protect, authorize('Admin'), deleteVendor);

router.route('/')
  .get(protect, authorize('Admin', 'Sub-Admin'), getVendors)
  .post(protect, authorize('Admin'), upload.fields(vendorUploadFields), createVendor);

// Vendor & Admin route
router.put('/:id/subscription', protect, authorize('Admin', 'Vendor'), updateSubscription);

module.exports = router;

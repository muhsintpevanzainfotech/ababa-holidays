const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const Package = require('../models/Package');
const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Enquiry = require('../models/Enquiry');
const ContactUs = require('../models/ContactUs');
const Blog = require('../models/Blog');
const Testimonial = require('../models/Testimonial');
const OfferBanner = require('../models/OfferBanner');
const Policy = require('../models/Policy');
const Review = require('../models/Review');

// Helper to calculate vendor subscription limits and quota status
const getSubscriptionMeta = (req, moduleName = 'api') => {
  const plan = req.subscriptionPlan || 'Professional';
  const sub = req.vendorSubscription;
  const isUnlimited = ['Unlimited', 'Enterprise'].includes(plan) || (sub && (sub.packageLimit === -1 || sub.userLimit === -1));

  const packageLimit = isUnlimited ? 'Unlimited' : (sub ? (sub.packageLimit || 10) : 20);
  const staffLimit = isUnlimited ? 'Unlimited' : (sub ? (sub.staffLimit || 5) : 10);

  return {
    plan,
    status: 'Active',
    accessType: isUnlimited ? 'Unlimited' : 'Limited Quota',
    packageLimit,
    staffLimit,
    bookingLimit: sub ? (sub.bookingLimit === -1 ? 'Unlimited' : (sub.bookingLimit || 'Unlimited')) : 'Unlimited',
    bannerLimit: sub ? (sub.bannerLimit === -1 ? 'Unlimited' : (sub.bannerLimit || 'Unlimited')) : 'Unlimited',
    blogLimit: sub ? (sub.blogLimit === -1 ? 'Unlimited' : (sub.blogLimit || 'Unlimited')) : 'Unlimited',
    features: {
      bannerEnabled: sub ? (sub.bannerEnabled !== false) : true,
      blogsNewsEnabled: sub ? (sub.blogsNewsEnabled !== false) : true,
      testimonialEnabled: sub ? (sub.testimonialEnabled !== false) : true,
      enquiriesFollowupEnabled: sub ? (sub.enquiriesFollowupEnabled !== false) : true,
      contactUsEnabled: sub ? (sub.contactUsEnabled !== false) : true,
      bookingEnabled: sub ? (sub.bookingEnabled !== false) : true,
      packagesEnabled: sub ? (sub.packagesEnabled !== false) : true,
      availabilityEnabled: sub ? (sub.availabilityEnabled !== false) : true,
      crmEnabled: sub ? (sub.crmEnabled !== false) : true,
      websiteEnabled: sub ? (sub.websiteEnabled !== false) : true
    }
  };
};

// 1. GET Vendor Profile Summary
// @route   GET /api/v1/external/profile
// @access  Public (via x-api-key header)
const getVendorExternalProfile = asyncHandler(async (req, res, next) => {
  const p = req.vendorProfile || {};
  const u = req.vendorUser || {};
  const subMeta = getSubscriptionMeta(req, 'profile');

  res.status(200).json({
    success: true,
    subscription: subMeta,
    data: {
      vendorId: req.effectiveVendorId,
      companyName: p.companyName || u.name || 'Ababa Travels & Holidays',
      description: p.description || '',
      businessType: p.vendorType || 'Travel Agency',
      email: p.primaryEmail || u.email,
      phone: u.phone || p.spoc?.phone || '',
      spoc: {
        name: p.spoc?.name || u.name || '',
        designation: p.spoc?.designation || 'Managing Director',
        email: p.spoc?.email || u.email,
        phone: p.spoc?.phone || u.phone || ''
      },
      contactNumbers: {
        primaryPhone: u.phone || '',
        customerHelpline: p.customerHelpline || '',
        emergencyHelpline: p.emergencyHelpline || ''
      },
      emails: {
        primaryEmail: p.primaryEmail || u.email,
        supportEmail: p.supportEmail || '',
        bookingEmail: p.bookingEmail || ''
      },
      operatingHours: p.operatingHours || 'Mon - Sat: 9:00 AM - 8:00 PM',
      logo: u.avatar || p.companylogos?.large || '',
      coverBanner: p.coverBanner || '',
      address: p.address || {},
      websiteUrl: p.websiteUrl || p.socialLinks?.website || '',
      socialLinks: p.socialLinks || {},
      bankDetails: {
        accountName: p.bankDetails?.accountName || p.bankDetails?.accountHolderName || '',
        accountNumber: p.bankDetails?.accountNumber || '',
        bankName: p.bankDetails?.bankName || '',
        ifscCode: p.bankDetails?.ifscCode || '',
        branch: p.bankDetails?.branch || p.bankDetails?.branchName || ''
      },
      kycStatus: p.kycStatus || 'Pending',
      isApproved: Boolean(p.isApproved),
      subscriptionPlan: subMeta.plan
    }
  });
});

// 2. GET Vendor Published Packages (Honoring Subscription Package Limit)
// @route   GET /api/v1/external/packages
// @access  Public (via x-api-key header)
const getVendorExternalPackages = asyncHandler(async (req, res, next) => {
  const vendorId = req.effectiveVendorId;
  const subMeta = getSubscriptionMeta(req, 'packages');

  let query = Package.find({
    $or: [{ vendor: vendorId }, { createdBy: vendorId }]
  }).populate('category', 'title name').sort('-createdAt');

  // Apply numeric package limit if subscription plan is limited
  if (typeof subMeta.packageLimit === 'number' && subMeta.packageLimit > 0) {
    query = query.limit(subMeta.packageLimit);
  }

  const packages = await query;

  res.status(200).json({
    success: true,
    subscription: subMeta,
    count: packages.length,
    data: packages
  });
});

// 3. GET Single Package Details
// @route   GET /api/v1/external/packages/:id
// @access  Public (via x-api-key header)
const getVendorExternalPackageById = asyncHandler(async (req, res, next) => {
  const vendorId = req.effectiveVendorId;
  const subMeta = getSubscriptionMeta(req, 'packageDetails');

  const pkg = await Package.findOne({
    _id: req.params.id,
    $or: [{ vendor: vendorId }, { createdBy: vendorId }]
  }).populate('category', 'title name');

  if (!pkg) {
    return next(new ErrorResponse('Package not found or unauthorized for this vendor API key', 404));
  }

  res.status(200).json({
    success: true,
    subscription: subMeta,
    data: pkg
  });
});

// 4. GET Package Availability & Slot Capacity
// @route   GET /api/v1/external/availability
// @access  Public (via x-api-key header)
const checkVendorPackageAvailability = asyncHandler(async (req, res, next) => {
  const vendorId = req.effectiveVendorId;
  const subMeta = getSubscriptionMeta(req, 'availability');
  const { packageId, date, travelers } = req.query;

  if (!packageId) {
    return next(new ErrorResponse('Please provide packageId query parameter', 400));
  }

  const pkg = await Package.findOne({
    _id: packageId,
    $or: [{ vendor: vendorId }, { createdBy: vendorId }]
  });

  if (!pkg) {
    return next(new ErrorResponse('Target package not found', 404));
  }

  const checkDate = date ? new Date(date) : new Date();
  const numTravelers = Number(travelers) || 1;

  // Check existing bookings for target date
  const startOfDay = new Date(checkDate.setHours(0, 0, 0, 0));
  const endOfDay = new Date(checkDate.setHours(23, 59, 59, 999));

  const existingBookings = await Booking.find({
    package: packageId,
    travelDate: { $gte: startOfDay, $lte: endOfDay },
    bookingStatus: { $ne: 'Cancelled' }
  });

  const totalBookedTravelers = existingBookings.reduce((sum, b) => sum + (b.numberOfTravelers || 1), 0);
  const maxCapacity = pkg.maxTravelers || pkg.maxCapacity || 30;
  const remainingSlots = Math.max(0, maxCapacity - totalBookedTravelers);
  const isAvailable = remainingSlots >= numTravelers && pkg.status !== 'Inactive';

  res.status(200).json({
    success: true,
    subscription: subMeta,
    data: {
      packageId: pkg._id,
      packageTitle: pkg.title,
      targetDate: startOfDay.toISOString().split('T')[0],
      requestedTravelers: numTravelers,
      isAvailable,
      maxCapacity,
      totalBookedSlots: totalBookedTravelers,
      remainingSlots,
      unitPrice: pkg.salePrice || pkg.regularPrice || pkg.price || 0,
      totalEstimatedPrice: (pkg.salePrice || pkg.regularPrice || pkg.price || 0) * numTravelers
    }
  });
});

// 5. POST Create Customer Booking
// @route   POST /api/v1/external/bookings
// @access  Public (via x-api-key header)
const createVendorExternalBooking = asyncHandler(async (req, res, next) => {
  const vendorId = req.effectiveVendorId;
  const subMeta = getSubscriptionMeta(req, 'bookings');
  const { packageId, customerName, customerEmail, customerPhone, travelDate, numberOfTravelers, notes } = req.body;

  if (!packageId || !customerName || !customerPhone) {
    return next(new ErrorResponse('Please provide packageId, customerName, and customerPhone', 400));
  }

  const pkg = await Package.findById(packageId);
  if (!pkg) {
    return next(new ErrorResponse('Target package not found', 404));
  }

  const numTravelers = Number(numberOfTravelers) || 1;
  const calculatedPrice = (pkg.salePrice || pkg.regularPrice || pkg.price || 0) * numTravelers;

  const booking = await Booking.create({
    vendor: vendorId,
    package: packageId,
    user: req.vendorUser._id,
    contactDetails: {
      name: customerName,
      email: customerEmail || '',
      phone: customerPhone
    },
    travelDate: travelDate ? new Date(travelDate) : new Date(),
    numberOfTravelers: numTravelers,
    totalPrice: calculatedPrice,
    bookingStatus: 'Pending',
    paymentStatus: 'Pending',
    notes: notes ? `Website API Integration: ${notes}` : 'Created via Vendor External Website API'
  });

  res.status(201).json({
    success: true,
    subscription: subMeta,
    message: 'Booking created successfully via Vendor API Key',
    data: booking
  });
});

// 6. GET Vendor Promotional Banners
// @route   GET /api/v1/external/banners
// @access  Public (via x-api-key header)
const getVendorExternalBanners = asyncHandler(async (req, res, next) => {
  const vendorId = req.effectiveVendorId;
  const subMeta = getSubscriptionMeta(req, 'banners');

  const banners = await OfferBanner.find({
    $or: [{ vendor: vendorId }, { createdBy: vendorId }, { vendor: null }]
  }).sort('-createdAt');

  res.status(200).json({
    success: true,
    subscription: subMeta,
    count: banners.length,
    data: banners
  });
});

// 7. GET Vendor Blogs & News Articles
// @route   GET /api/v1/external/blogs
// @access  Public (via x-api-key header)
const getVendorExternalBlogs = asyncHandler(async (req, res, next) => {
  const vendorId = req.effectiveVendorId;
  const subMeta = getSubscriptionMeta(req, 'blogs');

  const blogs = await Blog.find({
    $or: [{ vendor: vendorId }, { author: vendorId }]
  }).sort('-createdAt');

  res.status(200).json({
    success: true,
    subscription: subMeta,
    count: blogs.length,
    data: blogs
  });
});

// GET Single Blog Details
const getVendorExternalBlogById = asyncHandler(async (req, res, next) => {
  const subMeta = getSubscriptionMeta(req, 'blogDetails');
  const blog = await Blog.findById(req.params.id);

  if (!blog) {
    return next(new ErrorResponse('Blog article not found', 404));
  }

  res.status(200).json({
    success: true,
    subscription: subMeta,
    data: blog
  });
});

// 8. GET Vendor Client Testimonials
// @route   GET /api/v1/external/testimonials
// @access  Public (via x-api-key header)
const getVendorExternalTestimonials = asyncHandler(async (req, res, next) => {
  const vendorId = req.effectiveVendorId;
  const subMeta = getSubscriptionMeta(req, 'testimonials');

  const testimonials = await Testimonial.find({
    $or: [{ vendor: vendorId }, { createdBy: vendorId }]
  }).sort('-createdAt');

  res.status(200).json({
    success: true,
    subscription: subMeta,
    count: testimonials.length,
    data: testimonials
  });
});

// 9. POST Submit Lead Enquiry
// @route   POST /api/v1/external/enquiries
// @access  Public (via x-api-key header)
const createVendorExternalEnquiry = asyncHandler(async (req, res, next) => {
  const vendorId = req.effectiveVendorId;
  const subMeta = getSubscriptionMeta(req, 'enquiries');
  const { name, email, phone, subject, message, packageId } = req.body;

  if (!name || !phone) {
    return next(new ErrorResponse('Please provide name and phone for enquiry submission', 400));
  }

  const enquiry = await Enquiry.create({
    vendor: vendorId,
    name,
    email: email || '',
    phone,
    subject: subject || 'Website Contact Form Enquiry',
    message: message || '',
    package: packageId || null,
    status: 'New',
    source: 'External Website API'
  });

  res.status(201).json({
    success: true,
    subscription: subMeta,
    message: 'Enquiry lead submitted successfully',
    data: enquiry
  });
});

// 10. POST Submit Contact Us Form Message
// @route   POST /api/v1/external/contact-us
// @access  Public (via x-api-key header)
const createVendorExternalContactUs = asyncHandler(async (req, res, next) => {
  const vendorId = req.effectiveVendorId;
  const subMeta = getSubscriptionMeta(req, 'contactUs');
  const { name, email, phone, subject, message } = req.body;

  if (!name || !email || !message) {
    return next(new ErrorResponse('Please provide name, email, and message', 400));
  }

  const contact = await ContactUs.create({
    vendor: vendorId,
    name,
    email,
    phone: phone || '',
    subject: subject || 'General Website Enquiry',
    message,
    status: 'New'
  });

  res.status(201).json({
    success: true,
    subscription: subMeta,
    message: 'Contact form message submitted successfully',
    data: contact
  });
});

// 11. GET Vendor Agency Policies (Terms & Conditions, Privacy Policy)
// @route   GET /api/v1/external/policies
// @access  Public (via x-api-key header)
const getVendorExternalPolicies = asyncHandler(async (req, res, next) => {
  const vendorId = req.effectiveVendorId;
  const subMeta = getSubscriptionMeta(req, 'policies');

  const policies = await Policy.find({
    $or: [{ vendor: vendorId }, { createdBy: vendorId }]
  });

  res.status(200).json({
    success: true,
    subscription: subMeta,
    count: policies.length,
    data: policies
  });
});

// 12. GET Vendor Enabled Services & Categories
// @route   GET /api/v1/external/services
// @access  Public (via x-api-key header)
const getVendorExternalServices = asyncHandler(async (req, res, next) => {
  const vendorId = req.effectiveVendorId;
  const subMeta = getSubscriptionMeta(req, 'services');

  const services = await Service.find({
    $or: [{ vendor: vendorId }, { createdBy: vendorId }, { status: 'Active' }]
  }).select('title description icon customId status');

  res.status(200).json({
    success: true,
    subscription: subMeta,
    count: services.length,
    data: services
  });
});

module.exports = {
  getVendorExternalProfile,
  getVendorExternalPackages,
  getVendorExternalPackageById,
  checkVendorPackageAvailability,
  createVendorExternalBooking,
  getVendorExternalBanners,
  getVendorExternalBlogs,
  getVendorExternalBlogById,
  getVendorExternalTestimonials,
  createVendorExternalEnquiry,
  createVendorExternalContactUs,
  getVendorExternalPolicies,
  getVendorExternalServices
};

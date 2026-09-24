const Package = require('../models/Package');
const Service = require('../models/Service');
const VendorProfile = require('../models/VendorProfile');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { deleteFile } = require('../utils/fileHelpers');

// Helper to sanitize ObjectId fields from empty strings or 'null'/'undefined' strings
const sanitizeObjectIds = (obj) => {
  if (!obj || typeof obj !== 'object') return obj;
  ['subService', 'category', 'service', 'serviceCategory', 'vendor', 'createdBy'].forEach(field => {
    if (obj[field] === '' || obj[field] === 'null' || obj[field] === 'undefined') {
      obj[field] = null;
    }
  });
  return obj;
};

// @desc    Get all packages
// @route   GET /api/packages
// @access  Public
const getPackages = asyncHandler(async (req, res, next) => {
  let query;

  // Copy req.query
  const reqQuery = { ...req.query };

  // Fields to exclude
  const removeFields = ['select', 'sort', 'page', 'limit'];
  removeFields.forEach(param => delete reqQuery[param]);

  // Clean empty query values to prevent CastError
  Object.keys(reqQuery).forEach(key => {
    if (reqQuery[key] === '' || reqQuery[key] === 'null' || reqQuery[key] === 'undefined') {
      delete reqQuery[key];
    }
  });

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Finding resource
  query = Package.find(JSON.parse(queryStr))
    .populate('serviceCategory service', 'title name customId description')
    .populate('subService', 'title name customId description')
    .populate('category', 'title name customId description')
    .populate('vendor', 'name companyName email');

  // Select Fields
  if (req.query.select) {
    const fields = req.query.select.split(',').join(' ');
    query = query.select(fields);
  }

  // Sort
  if (req.query.sort) {
    const sortBy = req.query.sort.split(',').join(' ');
    query = query.sort(sortBy);
  } else {
    query = query.sort('-createdAt');
  }

  // Pagination
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const total = await Package.countDocuments();

  query = query.skip(startIndex).limit(limit);

  // Executing query
  const packages = await query;

  // Pagination result
  const pagination = {};

  if (endIndex < total) {
    pagination.next = {
      page: page + 1,
      limit
    };
  }

  if (startIndex > 0) {
    pagination.prev = {
      page: page - 1,
      limit
    };
  }

  res.status(200).json({
    success: true,
    count: packages.length,
    pagination,
    data: packages
  });
});

// @desc    Get single package
// @route   GET /api/packages/:id
// @access  Public
const getPackage = asyncHandler(async (req, res, next) => {
  const pkg = await Package.findById(req.params.id)
    .populate('serviceCategory service', 'title name customId description')
    .populate('subService', 'title name customId description')
    .populate('category', 'title name customId description')
    .populate('vendor', 'name companyName email');

  if (!pkg) {
    return next(new ErrorResponse('Package not found', 404));
  }

  res.status(200).json({ success: true, data: pkg });
});

// @desc    Create new package
// @route   POST /api/packages
// @access  Private/Vendor
const createPackage = asyncHandler(async (req, res, next) => {
  if (!req.body) {
    return next(new ErrorResponse('Request body is missing', 400));
  }
  // Add vendor to req.body
  req.body.vendor = req.user.id;

  // Fetch vendor profile to check approval status and entitlements
  const vendorProfile = await VendorProfile.findOne({ user: req.user.id });

  if (!vendorProfile) {
    return next(new ErrorResponse('Vendor profile not found for this user', 404));
  }

  // Check vendor approval status
  if (!vendorProfile.isApproved) {
    return next(new ErrorResponse('Vendor is not approved yet. Cannot create packages.', 403));
  }

  // Service entitlement check
  if (req.body.serviceCategory && !vendorProfile.selectedServices.includes(req.body.serviceCategory)) {
    return next(new ErrorResponse('Vendor is not authorized to offer services in this category.', 403));
  }

  if (req.files && req.files.length > 0) {
    const images = req.files.filter(f => f.fieldname === 'images').map(f => f.path);
    if (images.length > 0) req.body.images = images;

    // Handle customData files
    if (req.body.customData) {
      try {
        const customData = typeof req.body.customData === 'string' ? JSON.parse(req.body.customData) : req.body.customData;
        
        req.files.forEach(file => {
          if (file.fieldname.startsWith('customFile_')) {
            const fieldName = file.fieldname.replace('customFile_', '');
            if (!customData[fieldName]) customData[fieldName] = [];
            else if (!Array.isArray(customData[fieldName])) customData[fieldName] = [customData[fieldName]];
            
            customData[fieldName].push(file.path);
          }
        });
        
        req.body.customData = customData;
      } catch (e) {
        console.error('Error parsing customData:', e);
      }
    }
  } else if (req.body.customData && typeof req.body.customData === 'string') {
    try {
      req.body.customData = JSON.parse(req.body.customData);
    } catch (e) {}
  }

  sanitizeObjectIds(req.body);
  const pkg = await Package.create(req.body);

  res.status(201).json({
    success: true,
    data: pkg
  });
});

// @desc    Update package
// @route   PUT /api/packages/:id
// @access  Private/Vendor
const updatePackage = asyncHandler(async (req, res, next) => {
  if (!req.body) {
    return next(new ErrorResponse('Request body is missing', 400));
  }
  let pkg = await Package.findById(req.params.id);

  if (!pkg) {
    return next(new ErrorResponse('Package not found', 404));
  }

  // Make sure user is package owner or Admin
  if (pkg.vendor.toString() !== req.user.id && req.user.role !== 'Admin') {
    return next(new ErrorResponse('User not authorized to update this package', 403));
  }

  // If service category is changing, check entitlements
  if (req.body.serviceCategory && req.body.serviceCategory !== pkg.serviceCategory.toString()) {
     const vendorProfile = await VendorProfile.findOne({ user: req.user.id });
     if (!vendorProfile || !vendorProfile.selectedServices.includes(req.body.serviceCategory)) {
        return next(new ErrorResponse('Vendor is not authorized to offer services in this new category.', 403));
     }
  }

  if (req.files && req.files.length > 0) {
    const images = req.files.filter(f => f.fieldname === 'images').map(f => f.path);
    if (images.length > 0) {
      // Delete old images
      if (pkg.images && pkg.images.length > 0) {
        pkg.images.forEach(img => {
           if (!img.includes('default_travel.png')) deleteFile(img);
        });
      }
      req.body.images = images;
    }

    // Handle customData files
    if (req.body.customData) {
      try {
        const customData = typeof req.body.customData === 'string' ? JSON.parse(req.body.customData) : req.body.customData;
        
        req.files.forEach(file => {
          if (file.fieldname.startsWith('customFile_')) {
            const fieldName = file.fieldname.replace('customFile_', '');
            
            // Note: In update, we might want to keep existing files
            // Frontend should pass existing file paths in the array
            if (!customData[fieldName]) customData[fieldName] = [];
            else if (!Array.isArray(customData[fieldName])) customData[fieldName] = [customData[fieldName]];
            
            customData[fieldName].push(file.path);
          }
        });
        
        req.body.customData = customData;
      } catch (e) {
        console.error('Error parsing customData:', e);
      }
    }
  } else if (req.body.customData && typeof req.body.customData === 'string') {
    try {
      req.body.customData = JSON.parse(req.body.customData);
    } catch (e) {}
  }

  sanitizeObjectIds(req.body);
  pkg = await Package.findByIdAndUpdate(req.params.id, req.body, {
    returnDocument: 'after',
    runValidators: true
  });

  res.status(200).json({ success: true, data: pkg });
});

// @desc    Delete package
// @route   DELETE /api/packages/:id
// @access  Private/Vendor
const deletePackage = asyncHandler(async (req, res, next) => {
  const pkg = await Package.findById(req.params.id);

  if (!pkg) {
    return next(new ErrorResponse('Package not found', 404));
  }

  // Make sure user is package owner or Admin
  if (pkg.vendor.toString() !== req.user.id && req.user.role !== 'Admin') {
    return next(new ErrorResponse('User not authorized to delete this package', 403));
  }

  // Delete all associated image files
  if (pkg.images && pkg.images.length > 0) {
    pkg.images.forEach(img => deleteFile(img));
  }

  await pkg.deleteOne();

  res.status(200).json({ success: true, data: {} });
});

module.exports = {
  getPackages,
  getPackage,
  createPackage,
  updatePackage,
  deletePackage
};

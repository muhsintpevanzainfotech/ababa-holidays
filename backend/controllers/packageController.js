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
  if (Array.isArray(obj.subServices)) {
    obj.subServices = obj.subServices.filter(id => id && id !== '' && id !== 'null' && id !== 'undefined');
  }
  if (Array.isArray(obj.categories)) {
    obj.categories = obj.categories.filter(id => id && id !== '' && id !== 'null' && id !== 'undefined');
  }
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

  // Handle search parameter
  let searchCondition = null;
  if (reqQuery.search && reqQuery.search.trim()) {
    const searchRegex = { $regex: reqQuery.search.trim(), $options: 'i' };
    searchCondition = {
      $or: [
        { packageName: searchRegex },
        { title: searchRegex },
        { description: searchRegex },
        { packageDescription: searchRegex },
        { destination: searchRegex },
        { location: searchRegex }
      ]
    };
    delete reqQuery.search;
  }

  // Handle featured aliases & booleans
  if (reqQuery.featured !== undefined) {
    reqQuery.isFeatured = reqQuery.featured === 'true' || reqQuery.featured === true;
    delete reqQuery.featured;
  }
  if (reqQuery.isFeatured !== undefined) {
    reqQuery.isFeatured = reqQuery.isFeatured === 'true' || reqQuery.isFeatured === true;
  }
  if (reqQuery.isActive !== undefined) {
    reqQuery.isActive = reqQuery.isActive === 'true' || reqQuery.isActive === true;
  }

  // Create query string
  let queryStr = JSON.stringify(reqQuery);

  // Create operators ($gt, $gte, etc)
  queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

  // Finding resource
  let parsedQuery = JSON.parse(queryStr);

  // Merge search condition if present
  if (searchCondition) {
    parsedQuery = { $and: [parsedQuery, searchCondition] };
  }

  if (req.user && req.user.role !== 'Admin' && req.user.role !== 'Sub-Admin') {
    const targetVendorId = (req.user.effectiveVendorId || req.user.id).toString();
    const vendorCondition = {
      $or: [
        { createdBy: req.user.id },
        { vendor: targetVendorId }
      ]
    };
    parsedQuery = parsedQuery.$and ? { $and: [...parsedQuery.$and, vendorCondition] } : { ...parsedQuery, ...vendorCondition };
  }

  query = Package.find(parsedQuery)
    .populate('serviceCategory service', 'title name customId description')
    .populate('subService', 'title name customId description')
    .populate('category', 'title name customId description')
    .populate('subServices', 'title name customId description')
    .populate('categories', 'title name customId description')
    .populate('vendor', 'name companyName email logo phone')
    .populate('createdBy', 'name email role managedBy');

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
  const total = await Package.countDocuments(parsedQuery);

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
    .populate('subServices', 'title name customId description')
    .populate('categories', 'title name customId description')
    .populate('vendor', 'name companyName email logo phone')
    .populate('createdBy', 'name email role managedBy');

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

  const isSystemAdmin = req.user.role === 'Admin' || req.user.role === 'Sub-Admin';
  let targetVendorId;

  if (isSystemAdmin) {
    // If Admin, vendor can be explicitly assigned via req.body.vendor, or fallback to Admin ID
    targetVendorId = req.body.vendor || req.user.id;
    req.body.vendor = targetVendorId;
    req.body.createdBy = req.body.createdBy || req.user.id;
  } else {
    targetVendorId = req.user.effectiveVendorId || req.user.id;

    // Add vendor and createdBy to req.body
    req.body.vendor = targetVendorId;
    req.body.createdBy = req.body.createdBy || req.user.id;

    // Fetch vendor profile to check approval status and entitlements
    const vendorProfile = await VendorProfile.findOne({ user: targetVendorId });

    if (!vendorProfile) {
      return next(new ErrorResponse('Vendor profile not found for this user', 404));
    }

    // Check vendor approval status
    if (!vendorProfile.isApproved) {
      return next(new ErrorResponse('Vendor is not approved yet. Cannot create packages.', 403));
    }

    // Service entitlement check: Ensure vendor only creates packages for services they registered/handled
    if (req.body.serviceCategory && vendorProfile.selectedServices && vendorProfile.selectedServices.length > 0) {
      const allowedServiceIds = vendorProfile.selectedServices.map(s => (s._id ? s._id.toString() : s.toString()));
      if (!allowedServiceIds.includes(req.body.serviceCategory.toString())) {
        return next(new ErrorResponse('Vendor is only authorized to create packages for services they handle. Please update your handled services in Account Settings.', 403));
      }
    }
  }

  if (req.files && req.files.length > 0) {
    const uploadedImages = req.files.filter(f => f.fieldname === 'images' || f.fieldname.startsWith('image')).map(f => f.path);
    let existingImages = [];
    if (req.body.images) {
      if (Array.isArray(req.body.images)) existingImages = req.body.images;
      else if (typeof req.body.images === 'string') {
        try { existingImages = JSON.parse(req.body.images); }
        catch (e) { existingImages = req.body.images.split(',').map(s => s.trim()).filter(Boolean); }
      }
    }
    req.body.images = [...uploadedImages, ...existingImages];

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
  } else {
    if (typeof req.body.images === 'string') {
      try {
        req.body.images = JSON.parse(req.body.images);
      } catch (e) {
        req.body.images = req.body.images.split(',').map(s => s.trim()).filter(Boolean);
      }
    }
    if (req.body.customData && typeof req.body.customData === 'string') {
      try {
        req.body.customData = JSON.parse(req.body.customData);
      } catch (e) {}
    }
  }

  // Normalize array fields from FormData
  if (req.body.selectedSubServices) {
    if (Array.isArray(req.body.selectedSubServices)) {
      req.body.subServices = req.body.selectedSubServices;
    } else if (typeof req.body.selectedSubServices === 'string') {
      try { req.body.subServices = JSON.parse(req.body.selectedSubServices); }
      catch (e) { req.body.subServices = req.body.selectedSubServices.split(',').map(s => s.trim()).filter(Boolean); }
    }
  }
  if (req.body.selectedCategories) {
    if (Array.isArray(req.body.selectedCategories)) {
      req.body.categories = req.body.selectedCategories;
    } else if (typeof req.body.selectedCategories === 'string') {
      try { req.body.categories = JSON.parse(req.body.selectedCategories); }
      catch (e) { req.body.categories = req.body.selectedCategories.split(',').map(s => s.trim()).filter(Boolean); }
    }
  }
  if (typeof req.body.inclusions === 'string') {
    try { req.body.inclusions = JSON.parse(req.body.inclusions); }
    catch (e) { req.body.inclusions = req.body.inclusions.split(',').map(s => s.trim()).filter(Boolean); }
  }
  if (typeof req.body.exclusions === 'string') {
    try { req.body.exclusions = JSON.parse(req.body.exclusions); }
    catch (e) { req.body.exclusions = req.body.exclusions.split(',').map(s => s.trim()).filter(Boolean); }
  }
  const booleanFields = ['isFeatured', 'isTopPick', 'topRated', 'isTaxIncluded', 'isActive'];
  booleanFields.forEach(boolField => {
    if (req.body[boolField] !== undefined) {
      req.body[boolField] = req.body[boolField] === true || req.body[boolField] === 'true';
    }
  });

  if (typeof req.body.itinerary === 'string') {
    try { req.body.itinerary = JSON.parse(req.body.itinerary); }
    catch (e) {}
  }
  if (typeof req.body.seo === 'string') {
    try { req.body.seo = JSON.parse(req.body.seo); }
    catch (e) {}
  }
  if (typeof req.body.availabilityDates === 'string') {
    try { req.body.availabilityDates = JSON.parse(req.body.availabilityDates); }
    catch (e) { req.body.availabilityDates = req.body.availabilityDates.split(',').map(s => s.trim()).filter(Boolean); }
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

  const targetVendorId = (req.user.effectiveVendorId || req.user.id).toString();
  const isSystemAdmin = req.user.role === 'Admin' || req.user.role === 'Sub-Admin';
  
  const creatorId = pkg.createdBy ? (pkg.createdBy._id || pkg.createdBy).toString() : null;
  const pkgVendorId = pkg.vendor ? (pkg.vendor._id || pkg.vendor).toString() : null;
  const userId = req.user.id.toString();

  const isCreator = (creatorId && (creatorId === userId || creatorId === targetVendorId)) || 
                    (pkgVendorId && (pkgVendorId === userId || pkgVendorId === targetVendorId));

  // Only System Admin or package creator can update
  if (!isSystemAdmin && !isCreator) {
    return next(new ErrorResponse('Only the creator of this package is authorized to edit it.', 403));
  }

  // If service category is changing, check entitlements (for non-admins)
  if (!isSystemAdmin && req.body.serviceCategory && req.body.serviceCategory !== pkg.serviceCategory?.toString()) {
     const vendorProfile = await VendorProfile.findOne({ user: targetVendorId });
     if (vendorProfile && vendorProfile.selectedServices && vendorProfile.selectedServices.length > 0) {
        const allowedServiceIds = vendorProfile.selectedServices.map(s => (s._id ? s._id.toString() : s.toString()));
        if (!allowedServiceIds.includes(req.body.serviceCategory.toString())) {
           return next(new ErrorResponse('Vendor is not authorized to offer services in this new category.', 403));
        }
     }
  }

  if (req.files && req.files.length > 0) {
    const uploadedImages = req.files.filter(f => f.fieldname === 'images' || f.fieldname.startsWith('image')).map(f => f.path);
    let existingImages = [];
    if (req.body.images) {
      if (Array.isArray(req.body.images)) existingImages = req.body.images;
      else if (typeof req.body.images === 'string') {
        try { existingImages = JSON.parse(req.body.images); }
        catch (e) { existingImages = req.body.images.split(',').map(s => s.trim()).filter(Boolean); }
      }
    }
    req.body.images = [...uploadedImages, ...existingImages];

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
  } else {
    if (typeof req.body.images === 'string') {
      try {
        req.body.images = JSON.parse(req.body.images);
      } catch (e) {
        req.body.images = req.body.images.split(',').map(s => s.trim()).filter(Boolean);
      }
    }
    if (req.body.customData && typeof req.body.customData === 'string') {
      try {
        req.body.customData = JSON.parse(req.body.customData);
      } catch (e) {}
    }
  }

  // Normalize array fields from FormData
  if (req.body.selectedSubServices) {
    if (Array.isArray(req.body.selectedSubServices)) {
      req.body.subServices = req.body.selectedSubServices;
    } else if (typeof req.body.selectedSubServices === 'string') {
      try { req.body.subServices = JSON.parse(req.body.selectedSubServices); }
      catch (e) { req.body.subServices = req.body.selectedSubServices.split(',').map(s => s.trim()).filter(Boolean); }
    }
  }
  if (req.body.selectedCategories) {
    if (Array.isArray(req.body.selectedCategories)) {
      req.body.categories = req.body.selectedCategories;
    } else if (typeof req.body.selectedCategories === 'string') {
      try { req.body.categories = JSON.parse(req.body.selectedCategories); }
      catch (e) { req.body.categories = req.body.selectedCategories.split(',').map(s => s.trim()).filter(Boolean); }
    }
  }
  if (typeof req.body.inclusions === 'string') {
    try { req.body.inclusions = JSON.parse(req.body.inclusions); }
    catch (e) { req.body.inclusions = req.body.inclusions.split(',').map(s => s.trim()).filter(Boolean); }
  }
  if (typeof req.body.exclusions === 'string') {
    try { req.body.exclusions = JSON.parse(req.body.exclusions); }
    catch (e) { req.body.exclusions = req.body.exclusions.split(',').map(s => s.trim()).filter(Boolean); }
  }
  const booleanFields = ['isFeatured', 'isTopPick', 'topRated', 'isTaxIncluded', 'isActive'];
  booleanFields.forEach(boolField => {
    if (req.body[boolField] !== undefined) {
      req.body[boolField] = req.body[boolField] === true || req.body[boolField] === 'true';
    }
  });

  if (typeof req.body.itinerary === 'string') {
    try { req.body.itinerary = JSON.parse(req.body.itinerary); }
    catch (e) {}
  }
  if (typeof req.body.seo === 'string') {
    try { req.body.seo = JSON.parse(req.body.seo); }
    catch (e) {}
  }
  if (typeof req.body.availabilityDates === 'string') {
    try { req.body.availabilityDates = JSON.parse(req.body.availabilityDates); }
    catch (e) { req.body.availabilityDates = req.body.availabilityDates.split(',').map(s => s.trim()).filter(Boolean); }
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

  const targetVendorId = (req.user.effectiveVendorId || req.user.id).toString();
  const isSystemAdmin = req.user.role === 'Admin' || req.user.role === 'Sub-Admin';

  const creatorId = pkg.createdBy ? (pkg.createdBy._id || pkg.createdBy).toString() : null;
  const pkgVendorId = pkg.vendor ? (pkg.vendor._id || pkg.vendor).toString() : null;
  const userId = req.user.id.toString();

  const isCreator = (creatorId && (creatorId === userId || creatorId === targetVendorId)) || 
                    (pkgVendorId && (pkgVendorId === userId || pkgVendorId === targetVendorId));

  // Only System Admin or package creator can delete
  if (!isSystemAdmin && !isCreator) {
    return next(new ErrorResponse('Only the creator of this package is authorized to delete it.', 403));
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

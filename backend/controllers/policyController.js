const Policy = require('../models/Policy');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');

// @desc    Get Policies
// @route   GET /api/policies
// @access  Public
exports.getPolicies = asyncHandler(async (req, res, next) => {
  const { type, target, vendorId, isGlobal } = req.query;
  const query = {};
  
  if (type) query.type = type;
  if (target) query.target = target;
  
  const isValidVendorId = vendorId && vendorId !== 'undefined' && vendorId !== 'null' && Boolean(vendorId.match(/^[0-9a-fA-F]{24}$/));

  if (isValidVendorId) {
    query.$or = [
      { vendor: vendorId },
      { isGlobal: true }
    ];
  } else if (isGlobal === 'true') {
    query.vendor = null;
    query.isGlobal = true;
  } else if (isGlobal === 'false') {
    query.isGlobal = false;
  }

  const policies = await Policy.find(query).sort('-createdAt');
  res.status(200).json({ success: true, count: policies.length, data: policies });
});

// @desc    Get Single Policy
// @route   GET /api/policies/:id
// @access  Public
exports.getPolicy = asyncHandler(async (req, res, next) => {
  const policy = await Policy.findById(req.params.id);
  if (!policy) return next(new ErrorResponse('Policy not found', 404));
  res.status(200).json({ success: true, data: policy });
});

// @desc    Create/Update Policy (Upsert)
// @route   POST /api/policies
// @access  Private (Admin or Vendor)
exports.upsertPolicy = asyncHandler(async (req, res, next) => {
  const { type, target, title, content } = req.body;
  
  // Basic Validation
  if (!type || !target || !title || !content) {
    return next(new ErrorResponse('Please provide all required fields', 400));
  }

  // Vendors can only manage their own policies targeting 'User'
  const isVendorRole = ['Vendor', 'Vendor-Staff', 'Staff'].includes(req.user.role);
  const targetVendorId = req.user.effectiveVendorId || req.user.id;
  const vendorId = isVendorRole ? targetVendorId : (req.body.vendor || null);
  const isGlobal = vendorId === null;

  if (isVendorRole) {
    if (target !== 'User') {
      return next(new ErrorResponse('Vendors can only create policies for users', 403));
    }
  }

  const query = { type, target, vendor: vendorId };
  const payload = { title, content, type, target, vendor: vendorId, isGlobal };

  let policy = await Policy.findOneAndUpdate(query, payload, {
    returnDocument: 'after',
    runValidators: true,
    upsert: true
  });

  res.status(200).json({ success: true, data: policy });
});

// @desc    Update Policy
// @route   PUT /api/policies/:id
// @access  Private (Admin or Vendor)
exports.updatePolicy = asyncHandler(async (req, res, next) => {
  const { type, target, title, content } = req.body;
  
  let policy = await Policy.findById(req.params.id);

  if (!policy) {
    return next(new ErrorResponse('Policy not found', 404));
  }

  // Access check
  if (req.user.role !== 'Admin' && policy.vendor?.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to update this policy', 403));
  }

  // Vendors can only manage their own policies targeting 'User'
  if (req.user.role === 'Vendor') {
    if (target && target !== 'User') {
      return next(new ErrorResponse('Vendors can only create policies for users', 403));
    }
  }

  policy.title = title || policy.title;
  policy.content = content || policy.content;
  policy.type = type || policy.type;
  policy.target = target || policy.target;

  await policy.save();

  res.status(200).json({ success: true, data: policy });
});

// @desc    Delete Policy
// @route   DELETE /api/policies/:id
// @access  Private (Admin or Vendor)
exports.deletePolicy = asyncHandler(async (req, res, next) => {
  const policy = await Policy.findById(req.params.id);
  
  if (!policy) {
    return next(new ErrorResponse('Policy not found', 404));
  }

  // Access check
  if (req.user.role !== 'Admin' && policy.vendor?.toString() !== req.user.id) {
    return next(new ErrorResponse('Not authorized to delete this policy', 403));
  }

  await policy.deleteOne();
  
  res.status(200).json({ success: true, data: {} });
});

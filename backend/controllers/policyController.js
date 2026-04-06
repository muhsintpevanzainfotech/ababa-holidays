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
  
  if (vendorId) {
    query.vendor = vendorId;
    query.isGlobal = false;
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
  const vendorId = req.user.role === 'Vendor' ? req.user.id : (req.body.vendor || null);
  const isGlobal = vendorId === null;

  if (req.user.role === 'Vendor') {
    if (target !== 'User') {
      return next(new ErrorResponse('Vendors can only create policies for users', 403));
    }
  }

  const query = { type, target, vendor: vendorId };
  const payload = { title, content, type, target, vendor: vendorId, isGlobal };

  let policy = await Policy.findOneAndUpdate(query, payload, {
    new: true,
    runValidators: true,
    upsert: true
  });

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

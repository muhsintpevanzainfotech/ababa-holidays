const Service = require('../models/Service');
const asyncHandler = require('../utils/asyncHandler');
const ErrorResponse = require('../utils/errorResponse');
const { deleteFile } = require('../utils/fileHelpers');

// @desc    Get all services
// @route   GET /api/services
// @access  Public
const getServices = asyncHandler(async (req, res, next) => {
  const services = await Service.find({ isActive: true });
  res.json({ success: true, count: services.length, data: services });
});

// @desc    Get single service
// @route   GET /api/services/:id
// @access  Public
const getService = asyncHandler(async (req, res, next) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    return next(new ErrorResponse('Service not found', 404));
  }

  res.json({ success: true, data: service });
});

// @desc    Create new service
// @route   POST /api/services
// @access  Private/Admin
const createService = asyncHandler(async (req, res, next) => {
  if (!req.body) {
    return next(new ErrorResponse('Request body is missing', 400));
  }
  const payload = { ...req.body };
  payload.createdBy = req.user.id;

  if (req.files) {
    if (req.files.icon) payload.icon = req.files.icon[0].path;
    if (req.files.image) payload.image = req.files.image[0].path;
  }

  // Parse JSON strings if they come from multipart/form-data
  ['seo', 'subServices'].forEach(key => {
    if (typeof payload[key] === 'string') {
      try {
        payload[key] = JSON.parse(payload[key]);
      } catch (e) {}
    }
  });

  const service = await Service.create(payload);

  res.status(201).json({
    success: true,
    data: service
  });
});

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private/Admin
const updateService = asyncHandler(async (req, res, next) => {
  let service = await Service.findById(req.params.id);

  if (!service) {
    return next(new ErrorResponse('Service not found', 404));
  }

  if (req.files) {
    if (req.files.icon) {
      if (service.icon) deleteFile(service.icon);
      payload.icon = req.files.icon[0].path;
    }
    if (req.files.image) {
      if (service.image) deleteFile(service.image);
      payload.image = req.files.image[0].path;
    }
  }

  // Parse JSON strings if they come from multipart/form-data
  ['seo', 'subServices'].forEach(key => {
    if (typeof payload[key] === 'string') {
      try {
        payload[key] = JSON.parse(payload[key]);
      } catch (e) {}
    }
  });

  service = await Service.findByIdAndUpdate(req.params.id, payload, {
    new: true,
    runValidators: true
  });

  res.status(200).json({ success: true, data: service });
});

// @desc    Delete service
// @route   DELETE /api/services/:id
// @access  Private/Admin
const deleteService = asyncHandler(async (req, res, next) => {
  const service = await Service.findById(req.params.id);

  if (!service) {
    return next(new ErrorResponse('Service not found', 404));
  }

  // Delete files before soft delete or full delete
  if (service.icon) deleteFile(service.icon);
  if (service.image) deleteFile(service.image);

  service.isActive = false;
  await service.save();

  res.status(200).json({ success: true, data: {} });
});

module.exports = {
  getServices,
  getService,
  createService,
  updateService,
  deleteService
};

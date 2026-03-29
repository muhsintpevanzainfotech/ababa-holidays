const SubService = require('../models/SubService');
const { deleteFile } = require('../utils/fileHelpers');

exports.createSubService = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    payload.createdBy = req.user.id;

    if (req.files) {
      if (req.files.icon) payload.icon = req.files.icon[0].path;
      if (req.files.image) payload.image = req.files.image[0].path;
    }

    if (typeof payload.seo === 'string') {
      try {
        payload.seo = JSON.parse(payload.seo);
      } catch (e) {}
    }

    let subService = await SubService.create(payload);
    subService = await subService.populate('service');
    subService = await subService.populate('createdBy', 'name email');
    res.status(201).json({ success: true, data: subService });
  } catch (error) {
    next(error);
  }
};

exports.getSubServices = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Filter Build
    const filter = {};
    if (req.query.service && req.query.service !== 'all' && req.query.service !== '') {
      filter.service = req.query.service;
    }
    if (req.query.status && req.query.status !== 'all') {
      filter.isActive = req.query.status === 'active';
    }
    if (req.query.search) {
      filter.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    const total = await SubService.countDocuments(filter);
    const subServices = await SubService.find(filter)
      .sort({ createdAt: -1 })
      .populate('service')
      .populate('createdBy', 'name email')
      .skip(skip)
      .limit(limit);

    res.status(200).json({ 
      success: true, 
      count: subServices.length, 
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: subServices 
    });
  } catch (error) {
    next(error);
  }
};

exports.getSubService = async (req, res, next) => {
  try {
    const subService = await SubService.findById(req.params.id)
      .populate('service')
      .populate('createdBy', 'name email');
    if (!subService) {
      return res.status(404).json({ success: false, message: 'Sub-Service not found' });
    }
    res.status(200).json({ success: true, data: subService });
  } catch (error) {
    next(error);
  }
};

exports.updateSubService = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    let subService = await SubService.findById(req.params.id);

    if (!subService) {
      return res.status(404).json({ success: false, message: 'Sub-Service not found' });
    }

    if (req.files) {
      if (req.files.icon) {
        if (subService.icon) deleteFile(subService.icon);
        payload.icon = req.files.icon[0].path;
      }
      if (req.files.image) {
        if (subService.image) deleteFile(subService.image);
        payload.image = req.files.image[0].path;
      }
    }

    if (typeof payload.seo === 'string') {
      try {
        payload.seo = JSON.parse(payload.seo);
      } catch (e) {}
    }

    subService = await SubService.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true
    }).populate('service').populate('createdBy', 'name email');

    res.status(200).json({ success: true, data: subService });
  } catch (error) {
    next(error);
  }
};

exports.deleteSubService = async (req, res, next) => {
  try {
    const subService = await SubService.findById(req.params.id);
    if (!subService) {
      return res.status(404).json({ success: false, message: 'Sub-Service not found' });
    }

    if (subService.icon) deleteFile(subService.icon);
    if (subService.image) deleteFile(subService.image);

    await subService.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

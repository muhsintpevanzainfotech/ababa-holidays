const Category = require('../models/Category');
const { deleteFile } = require('../utils/fileHelpers');

exports.createCategory = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    payload.createdBy = req.user.id;

    if (payload.service === '' || payload.service === 'none' || payload.service === 'all') {
      payload.service = null;
    }
    if (payload.subService === '' || payload.subService === 'none' || payload.subService === 'all') {
      payload.subService = null;
    }

    if (req.files) {
      if (req.files.icon) payload.icon = req.files.icon[0].path;
      if (req.files.image) payload.image = req.files.image[0].path;
    }

    // Handle SEO JSON if passed as string
    if (typeof payload.seo === 'string') {
      try {
        payload.seo = JSON.parse(payload.seo);
      } catch (e) {
        // Fallback or ignore
      }
    }

    let category = await Category.create(payload);
    category = await Category.findById(category._id)
      .populate('service', 'title name customId')
      .populate('subService', 'title name customId')
      .populate('createdBy', 'name email');
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Auto-link legacy categories if service is missing or null
    const unlinkedCount = await Category.countDocuments({
      $or: [{ service: { $exists: false } }, { service: null }]
    });
    if (unlinkedCount > 0) {
      const defaultLinks = [
        { title: 'Adventure & Safari', service: '6aa3cf2829ecff83d4701772', subService: '6ac88f69c8218480bc463cd8' },
        { title: 'Flights & Visa Solutions', service: '6aa3cee929ecff83d470173b', subService: '6ac88f6cc8218480bc463cf6' },
        { title: 'Transport & Coach Fleet', service: '6aa3cf4b29ecff83d4701793', subService: '6ac88f5fc8218480bc463c97' },
        { title: 'Hajj & Umrah Pilgrimage', service: '6aa3cf0129ecff83d4701751', subService: '6ac88f6ac8218480bc463ce2' },
        { title: 'Luxury Resorts & Hotels', service: '6ac6fcb4c30c86ac64cd60de', subService: '6ac88f5dc8218480bc463c81' },
        { title: 'Honeymoon & Couples', service: '6aa3cf3929ecff83d4701787', subService: '6ac88f61c8218480bc463cab' },
        { title: 'International Tours', service: '6aa3cf2829ecff83d4701772', subService: '6ac88f69c8218480bc463cd3' },
        { title: 'Domestic Holidays', service: '6aa3cf2829ecff83d4701772', subService: '6ac88f69c8218480bc463cce' }
      ];
      for (const link of defaultLinks) {
        await Category.updateOne(
          { 
            title: link.title, 
            $or: [{ service: { $exists: false } }, { service: null }] 
          },
          { $set: { service: link.service, subService: link.subService } }
        );
      }
    }

    // Filter Build
    const filter = {};
    const serviceFilter = req.query.service || req.query.serviceId;
    if (serviceFilter && serviceFilter !== 'all' && serviceFilter !== '') {
      filter.service = serviceFilter;
    }
    const subServiceFilter = req.query.subService || req.query.subServiceId;
    if (subServiceFilter && subServiceFilter !== 'all' && subServiceFilter !== '') {
      filter.subService = subServiceFilter;
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

    const total = await Category.countDocuments(filter);
    const categories = await Category.find(filter)
      .sort({ createdAt: -1 })
      .populate('service', 'title name customId')
      .populate('subService', 'title name customId')
      .populate('createdBy', 'name email')
      .skip(skip)
      .limit(limit);

    res.status(200).json({ 
      success: true, 
      count: categories.length, 
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      data: categories 
    });
  } catch (error) {
    next(error);
  }
};

exports.getCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('service', 'title name customId')
      .populate('subService', 'title name customId')
      .populate('createdBy', 'name email');
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    res.status(200).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    let category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    if (payload.service === '' || payload.service === 'none' || payload.service === 'all') {
      payload.service = null;
    }
    if (payload.subService === '' || payload.subService === 'none' || payload.subService === 'all') {
      payload.subService = null;
    }

    if (req.files) {
      if (req.files.icon) {
        if (category.icon) deleteFile(category.icon);
        payload.icon = req.files.icon[0].path;
      }
      if (req.files.image) {
        if (category.image) deleteFile(category.image);
        payload.image = req.files.image[0].path;
      }
    }

    if (typeof payload.seo === 'string') {
      try {
        payload.seo = JSON.parse(payload.seo);
      } catch (e) {}
    }

    category = await Category.findByIdAndUpdate(req.params.id, payload, {
      returnDocument: 'after',
      runValidators: true
    })
      .populate('service', 'title name customId')
      .populate('subService', 'title name customId')
      .populate('createdBy', 'name email');

    res.status(200).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }

    if (category.icon) deleteFile(category.icon);
    if (category.image) deleteFile(category.image);

    await category.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

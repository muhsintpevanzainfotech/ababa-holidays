const Category = require('../models/Category');
const { deleteFile } = require('../utils/fileHelpers');

exports.createCategory = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    payload.createdBy = req.user.id;

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

    const category = await Category.create(payload);
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

    // Filter Build
    const filter = {};
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
    const category = await Category.findById(req.params.id).populate('createdBy', 'name email');
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
      new: true,
      runValidators: true
    });

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

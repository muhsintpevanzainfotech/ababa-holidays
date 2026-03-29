const Blog = require('../models/Blog');
const { deleteFile } = require('../utils/fileHelpers');

exports.createBlog = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    payload.createdBy = req.user.id;
    if (!payload.author) payload.author = req.user.id;

    if (req.file) {
      payload.image = req.file.path;
    }

    if (typeof payload.seo === 'string') {
      try {
        payload.seo = JSON.parse(payload.seo);
      } catch (e) {}
    }

    if (req.user.role === 'Admin' || req.user.role === 'Sub-Admin') {
      payload.userRole = 'Admin';
    } else if (req.user.role === 'Vendor' || req.user.role === 'Vendor-Staff') {
      payload.userRole = 'Vendor';
    }

    const blog = await Blog.create(payload);
    res.status(201).json({ success: true, data: blog });
  } catch (error) {
    next(error);
  }
};

exports.getBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find({ status: 'Published' }).populate('author', 'name email').sort('-createdAt');
    res.status(200).json({ success: true, count: blogs.length, data: blogs });
  } catch (error) {
    next(error);
  }
};

exports.getAdminBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find({ userRole: 'Admin', status: 'Published' }).populate('author', 'name email').sort('-createdAt');
    res.status(200).json({ success: true, count: blogs.length, data: blogs });
  } catch (error) {
    next(error);
  }
};

exports.getVendorBlogs = async (req, res, next) => {
  try {
    const query = { userRole: 'Vendor', status: 'Published' };
    if (req.params.id) query.createdBy = req.params.id; // Specific Vendor

    const blogs = await Blog.find(query).populate('author', 'name email').sort('-createdAt');
    res.status(200).json({ success: true, count: blogs.length, data: blogs });
  } catch (error) {
    next(error);
  }
};

exports.getBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findOne({ 
      $or: [{ _id: req.params.id }, { slug: req.params.id }] 
    }).populate('author', 'name email');
    
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }
    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    next(error);
  }
};

exports.updateBlog = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    let blog = await Blog.findById(req.params.id);

    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    if (req.file) {
      if (blog.image) deleteFile(blog.image);
      payload.image = req.file.path;
    }

    if (typeof payload.seo === 'string') {
      try {
        payload.seo = JSON.parse(payload.seo);
      } catch (e) {}
    }

    blog = await Blog.findByIdAndUpdate(req.params.id, payload, {
      returnDocument: 'after',
      runValidators: true
    });

    res.status(200).json({ success: true, data: blog });
  } catch (error) {
    next(error);
  }
};

exports.deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    if (blog.image) deleteFile(blog.image);

    await blog.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

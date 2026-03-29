const Testimonial = require('../models/Testimonial');
const User = require('../models/User');
const Subscription = require('../models/Subscription');
const { deleteFile } = require('../utils/fileHelpers');

exports.createTestimonial = async (req, res, next) => {
  try {
    // If Vendor, use their ID; If Admin, can be null or provided vendor
    const vendorId = (req.user && req.user.role === 'Vendor') ? req.user.id : (req.body.vendor || null);
    
    // Only check subscription/permission if it's a Vendor-specific testimonial
    if (vendorId) {
      const activeSub = await Subscription.findOne({ 
        vendor: vendorId, 
        isActive: true,
        endDate: { $gte: new Date() } 
      }).sort('-createdAt');

      if (!activeSub || !activeSub.testimonialEnable) {
        return res.status(403).json({ 
          success: false, 
          message: 'This vendor subcription plan does not support Testimonials' 
        });
      }
    }

    const payload = { ...req.body, vendor: vendorId };
    payload.createdBy = req.user.id;
    
    if (req.user.role === 'Admin' || req.user.role === 'Sub-Admin') {
      payload.userRole = 'Admin';
    } else {
      payload.userRole = 'Vendor';
    }

    if (req.files) {
      if (req.files.image) payload.image = req.files.image[0].path;
      if (req.files.video) payload.video = req.files.video[0].path;
    }

    const testimonial = await Testimonial.create(payload);

    res.status(201).json({ success: true, data: testimonial });
  } catch (error) {
    next(error);
  }
};

exports.getTestimonials = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.userRole) {
      filter.userRole = req.query.userRole;
    }

    if (req.query.vendor === 'global') {
      filter.vendor = null;
      filter.userRole = 'Admin';
    } else if (req.query.vendor) {
      filter.vendor = req.query.vendor;
    } else if (req.user && req.user.role === 'Vendor') {
      filter.vendor = req.user.id;
    }

    const testimonials = await Testimonial.find(filter).populate('vendor', 'name email').sort('-createdAt');
    res.status(200).json({ success: true, count: testimonials.length, data: testimonials });
  } catch (error) {
    next(error);
  }
};

exports.updateTestimonial = async (req, res, next) => {
  try {
    let testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }

    const payload = { ...req.body };
    if (req.files) {
      if (req.files.image) {
        if (testimonial.image) deleteFile(testimonial.image);
        payload.image = req.files.image[0].path;
      }
      if (req.files.video) {
        if (testimonial.video) deleteFile(testimonial.video);
        payload.video = req.files.video[0].path;
      }
    }

    testimonial = await Testimonial.findByIdAndUpdate(req.params.id, payload, {
      returnDocument: 'after', runValidators: true
    });
    
    res.status(200).json({ success: true, data: testimonial });
  } catch (error) {
    next(error);
  }
};

exports.deleteTestimonial = async (req, res, next) => {
  try {
    const testimonial = await Testimonial.findById(req.params.id);
    if (!testimonial) {
      return res.status(404).json({ success: false, message: 'Testimonial not found' });
    }

    if (testimonial.image) deleteFile(testimonial.image);
    if (testimonial.video) deleteFile(testimonial.video);

    await testimonial.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

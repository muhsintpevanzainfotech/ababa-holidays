const AboutUs = require('../models/AboutUs');

// @desc    Get About Us content
// @route   GET /api/aboutus
// @access  Public
exports.getAboutUs = async (req, res, next) => {
  try {
    const vendorId = req.query.vendor || null;
    let aboutUs = await AboutUs.findOne({ vendor: vendorId });
    
    if (!aboutUs) {
      return res.status(200).json({ success: true, data: {} });
    }

    res.status(200).json({ success: true, data: aboutUs });
  } catch (error) {
    next(error);
  }
};

// @desc    Update About Us content
// @route   PUT /api/aboutus
// @access  Private/Admin/Vendor
exports.updateAboutUs = async (req, res, next) => {
  try {
    // If Vendor, use their ID; If Admin, use null (Global) or provided vendor query
    const vendorId = req.user.role === 'Vendor' ? req.user.id : (req.body.vendor || null);

    let aboutUs = await AboutUs.findOne({ vendor: vendorId });

    const payload = { ...req.body, vendor: vendorId };
    payload.updatedBy = req.user.id;

    if (req.file) {
      payload.image = req.file.path;
    }

    if (typeof payload.seo === 'string') {
      try {
        payload.seo = JSON.parse(payload.seo);
      } catch (e) {}
    }

    if (!aboutUs) {
      aboutUs = await AboutUs.create(payload);
    } else {
      aboutUs = await AboutUs.findOneAndUpdate({ vendor: vendorId }, payload, {
        new: true,
        runValidators: true
      });
    }

    res.status(200).json({ success: true, data: aboutUs });
  } catch (error) {
    next(error);
  }
};

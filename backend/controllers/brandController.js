const Brand = require('../models/Brand');
const { deleteFile } = require('../utils/fileHelpers');

exports.createBrand = async (req, res) => {
  try {
    const vendorId = req.user ? req.user.id : req.body.vendor;
    if (!vendorId) {
      return res.status(400).json({ success: false, message: 'Vendor ID is required' });
    }

    const payload = { ...req.body, vendor: vendorId };

    if (req.files) {
      payload.logos = {};
      if (req.files.small) payload.logos.small = req.files.small[0].path;
      if (req.files.medium) payload.logos.medium = req.files.medium[0].path;
      if (req.files.large) payload.logos.large = req.files.large[0].path;
    }

    const brand = await Brand.create(payload);
    res.status(201).json({ success: true, data: brand });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBrands = async (req, res) => {
  try {
    const filter = {};
    if (req.user && req.user.role === 'Vendor') {
      filter.vendor = req.user.id;
    } else if (req.query.vendor) {
      filter.vendor = req.query.vendor;
    }

    const brands = await Brand.find(filter).populate('vendor', 'name email').sort('-createdAt');
    res.status(200).json({ success: true, count: brands.length, data: brands });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id).populate('vendor', 'name email');
    if (!brand) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }
    res.status(200).json({ success: true, data: brand });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateBrand = async (req, res) => {
  try {
    const payload = { ...req.body };
    let brand = await Brand.findById(req.params.id);

    if (!brand) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }

    if (req.files) {
      payload.logos = brand.logos || {};
      if (req.files.small) {
        if (brand.logos && brand.logos.small) deleteFile(brand.logos.small);
        payload.logos.small = req.files.small[0].path;
      }
      if (req.files.medium) {
        if (brand.logos && brand.logos.medium) deleteFile(brand.logos.medium);
        payload.logos.medium = req.files.medium[0].path;
      }
      if (req.files.large) {
        if (brand.logos && brand.logos.large) deleteFile(brand.logos.large);
        payload.logos.large = req.files.large[0].path;
      }
    }

    brand = await Brand.findByIdAndUpdate(req.params.id, payload, {
      new: true, runValidators: true
    });

    res.status(200).json({ success: true, data: brand });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteBrand = async (req, res) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) {
      return res.status(404).json({ success: false, message: 'Brand not found' });
    }

    // Delete associated logo files
    if (brand.logos) {
      if (brand.logos.small) deleteFile(brand.logos.small);
      if (brand.logos.medium) deleteFile(brand.logos.medium);
      if (brand.logos.large) deleteFile(brand.logos.large);
    }

    await brand.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

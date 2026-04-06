const InstagramReel = require('../models/InstagramReel');
const VendorProfile = require('../models/VendorProfile');
const Subscription = require('../models/Subscription');
const { deleteFile } = require('../utils/fileHelpers');

exports.createReel = async (req, res, next) => {
  if (!req.body) req.body = {};
  try {
    const vendorId = req.user.role === 'Vendor' ? req.user.id : (req.body && req.body.vendor ? req.body.vendor : null);

    // If it's a vendor, and no vendor ID was found (shouldn't happen with req.user), it's a 400.
    if (req.user.role === 'Vendor' && !vendorId) {
      return res.status(400).json({ success: false, message: 'Vendor context is missing' });
    }

    // Only check subscription if it's being assigned to a vendor
    if (vendorId) {
      const profile = await VendorProfile.findOne({ user: vendorId });
      if (!profile) {
        return res.status(404).json({ success: false, message: 'Vendor profile not found' });
      }

      const activeSub = await Subscription.findOne({ 
        vendor: vendorId, 
        isActive: true,
        endDate: { $gte: new Date() } 
      }).sort('-createdAt');

      if (!activeSub || !activeSub.instagramReelsEnabled) {
        return res.status(403).json({ 
          success: false, 
          message: 'This vendor’s current subscription plan does not support Instagram Reels' 
        });
      }
    }

    if (req.file) {
      req.body.video = req.file.path;
    }

    const reel = await InstagramReel.create({
      ...req.body,
      vendor: vendorId,
      createdBy: req.user.id
    });

    res.status(201).json({ success: true, data: reel });
  } catch (error) {
    next(error);
  }
};

exports.getReels = async (req, res, next) => {
  try {
    let filter = { isActive: true };

    // If authenticated, adjust filter
    if (req.user) {
      if (req.user.role === 'Admin' || req.user.role === 'Sub-Admin') {
        filter = {}; // Admins see all (even inactive)
      } else if (req.user.role === 'Vendor') {
        filter = { vendor: req.user.id }; // Vendors see their own (even inactive)
      }
    }

    // Manual override via query param
    if (req.query.vendor) {
      filter.vendor = req.query.vendor;
    }

    const reels = await InstagramReel.find(filter)
      .populate('vendor', 'name email')
      .sort('-createdAt');
    res.status(200).json({ success: true, count: reels.length, data: reels });
  } catch (error) {
    next(error);
  }
};

exports.getReel = async (req, res, next) => {
  try {
    const reel = await InstagramReel.findById(req.params.id).populate('vendor', 'name email');
    if (!reel) {
      return res.status(404).json({ success: false, message: 'Reel not found' });
    }
    res.status(200).json({ success: true, data: reel });
  } catch (error) {
    next(error);
  }
};

exports.updateReel = async (req, res, next) => {
  try {
    let reel = await InstagramReel.findById(req.params.id);

    if (!reel) {
      return res.status(404).json({ success: false, message: 'Reel not found' });
    }

    if (req.file) {
      if (reel.video) deleteFile(reel.video);
      if (!req.body) req.body = {};
      req.body.video = req.file.path;
    }

    reel = await InstagramReel.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({ success: true, data: reel });
  } catch (error) {
    next(error);
  }
};

exports.deleteReel = async (req, res, next) => {
  try {
    const reel = await InstagramReel.findById(req.params.id);
    if (!reel) {
      return res.status(404).json({ success: false, message: 'Reel not found' });
    }

    if (reel.video) deleteFile(reel.video);

    await reel.deleteOne();
    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

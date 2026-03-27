const InstagramReel = require('../models/InstagramReel');
const VendorProfile = require('../models/VendorProfile');
const Subscription = require('../models/Subscription');
const { deleteFile } = require('../utils/fileHelpers');

exports.createReel = async (req, res, next) => {
  try {
    const vendorId = req.user.role === 'Vendor' ? req.user.id : req.body.vendor;

    if (!vendorId) {
      return res.status(400).json({ success: false, message: 'Vendor ID is required' });
    }

    // Check if vendor has permission for Instagram Reels in their subscription
    const profile = await VendorProfile.findOne({ user: vendorId });
    if (!profile) {
      return res.status(404).json({ success: false, message: 'Vendor profile not found' });
    }

    // We can check the subscription plan string OR look up the latest active Subscription record
    // For now, let's look up the latest active subscription for this vendor
    const activeSub = await Subscription.findOne({ 
      vendor: vendorId, 
      isActive: true,
      endDate: { $gte: new Date() } 
    }).sort('-createdAt');

    if (!activeSub || !activeSub.instagramReelsEnable) {
      return res.status(403).json({ 
        success: false, 
        message: 'Your current subscription plan does not support Instagram Reels' 
      });
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
    const filter = { isActive: true };
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

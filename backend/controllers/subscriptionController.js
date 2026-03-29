const Subscription = require('../models/Subscription');
const VendorProfile = require('../models/VendorProfile');
const User = require('../models/User');

// @desc    Create a new subscription
// @route   POST /api/subscriptions
// @access  Private/Admin
const createSubscription = async (req, res, next) => {
  try {
    const payload = { ...req.body };
    
    if (!payload.plan) {
      return res.status(400).json({ success: false, message: 'Plan type is required' });
    }

    if (!payload.title) {
      payload.title = `${payload.plan} Plan`;
    }

    if (!payload.startDate) payload.startDate = new Date();
    
    if (!payload.endDate) {
      const duration = payload.durationInDays || 365;
      const endDate = new Date(payload.startDate);
      if (duration === -1) {
        // Set to 100 years from now for unlimited
        endDate.setFullYear(endDate.getFullYear() + 100);
      } else {
        endDate.setDate(endDate.getDate() + duration);
      }
      payload.endDate = endDate;
    }

    if (!payload.price) payload.price = 0;
    if (!payload.amountPaid) payload.amountPaid = 0;

    // Create Subscription Plan (Template)
    const subscription = await Subscription.create(payload);

    res.status(201).json({
      success: true,
      data: subscription
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged in vendor's active subscription
// @route   GET /api/subscriptions/my-subscriptions
// @access  Private/Vendor
const getMySubscriptions = async (req, res, next) => {
  try {
    const profile = await VendorProfile.findOne({ user: req.user.id }).populate('subscription');
    res.status(200).json({
      success: true,
      data: (profile && profile.subscription) ? [profile.subscription] : []
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all available subscription plans
// @route   GET /api/subscriptions
// @access  Public
const getAllSubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await Subscription.find().sort('-createdAt');
    
    res.status(200).json({
      success: true,
      count: subscriptions.length,
      data: subscriptions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update subscription
// @route   PUT /api/subscriptions/:id
// @access  Private/Admin
const updateSubscription = async (req, res, next) => {
  try {
    let subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    subscription = await Subscription.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: subscription
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete subscription
// @route   DELETE /api/subscriptions/:id
// @access  Private/Admin
const deleteSubscription = async (req, res, next) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    await subscription.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Subscription removed'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createSubscription,
  getMySubscriptions,
  getAllSubscriptions,
  updateSubscription,
  deleteSubscription
};

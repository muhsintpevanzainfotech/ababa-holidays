const VendorProfile = require('../models/VendorProfile');
const User = require('../models/User');
const Subscription = require('../models/Subscription');

const apiKeyAuth = async (req, res, next) => {
  let apiKey = req.headers['x-api-key'] || req.query.apiKey || req.query.api_key;

  if (!apiKey && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    const tokenStr = req.headers.authorization.split(' ')[1];
    if (tokenStr && tokenStr.startsWith('ababa_')) {
      apiKey = tokenStr;
    }
  }

  if (!apiKey) {
    return res.status(401).json({
      success: false,
      message: 'API Security Key missing. Please provide x-api-key header or apiKey query parameter.'
    });
  }

  try {
    const profile = await VendorProfile.findOne({ apiKey: apiKey.trim() }).populate('subscription');
    if (!profile) {
      return res.status(401).json({
        success: false,
        message: 'Invalid API Security Key. Access denied.'
      });
    }

    const vendorUser = await User.findById(profile.user);
    if (!vendorUser || vendorUser.isSuspended) {
      return res.status(403).json({
        success: false,
        message: 'Associated vendor account is inactive or suspended.'
      });
    }

    // 1. Subscription Acceptance Check ("frist accept")
    const activeSub = profile.subscription;
    const planName = profile.subscriptionPlan || (activeSub ? activeSub.plan : 'Starter');

    // Check if subscription has expired (if sub object exists and has endDate)
    const isExpired = activeSub && activeSub.endDate && new Date(activeSub.endDate) < new Date();
    const isActive = activeSub ? (activeSub.isActive !== false && !isExpired) : true;

    if (!isActive) {
      return res.status(403).json({
        success: false,
        message: `API Access Denied: Vendor subscription plan (${planName}) is expired or inactive. Please renew subscription to enable external website APIs.`
      });
    }

    req.vendorProfile = profile;
    req.vendorUser = vendorUser;
    req.vendorSubscription = activeSub;
    req.subscriptionPlan = planName;
    req.effectiveVendorId = profile.user.toString();
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error validating API Security Key and Subscription status',
      error: error.message
    });
  }
};

module.exports = apiKeyAuth;

const express = require('express');
const {
  createSubscription,
  getMySubscriptions,
  getAllSubscriptions,
  updateSubscription,
  deleteSubscription
} = require('../controllers/subscriptionController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

// Vendor Routes
router.post('/', protect, authorize('Admin', 'Sub-Admin'), createSubscription);
router.get('/my-subscriptions', protect, authorize('Vendor'), getMySubscriptions);

// Public / General Routes
router.get('/', getAllSubscriptions);
router.route('/:id')
  .put(protect, authorize('Admin', 'Sub-Admin'), updateSubscription)
  .delete(protect, authorize('Admin', 'Sub-Admin'), deleteSubscription);

module.exports = router;

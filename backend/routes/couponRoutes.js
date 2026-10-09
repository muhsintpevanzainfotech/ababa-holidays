const express = require('express');
const {
  getCoupons,
  getCouponById,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  getPublicCoupons
} = require('../controllers/couponController');

const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/public', getPublicCoupons);
router.post('/validate', validateCoupon);

router.use(protect);

router.route('/')
  .get(getCoupons)
  .post(authorize('Admin'), createCoupon);

router.route('/:id')
  .get(getCouponById)
  .put(authorize('Admin'), updateCoupon)
  .delete(authorize('Admin'), deleteCoupon);

module.exports = router;

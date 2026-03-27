const express = require('express');
const {
  createBanner,
  getBanners,
  getAdminBanners,
  getVendorBanners,
  getSpecificVendorBanners,
  getMyBanners,
  getBanner,
  updateBanner,
  deleteBanner,
  toggleBannerStatus
} = require('../controllers/offerBannerController');

const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
const { createUpload } = upload;
const bannerUpload = createUpload('banners');

const router = express.Router();

router.route('/')
  .get(getBanners)
  .post(protect, authorize('Admin', 'Sub-Admin', 'Vendor'), upload.single('image'), createBanner);

router.get('/my-banners', protect, getMyBanners);
router.get('/admin', getAdminBanners);
router.get('/vendor', getVendorBanners);
router.get('/vendor/:vendorId', getSpecificVendorBanners);

router.route('/:id')
  .get(getBanner)
  .put(protect, upload.single('image'), updateBanner)
  .delete(protect, deleteBanner);

router.put('/:id/toggle', protect, toggleBannerStatus);

module.exports = router;

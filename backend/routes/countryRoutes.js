const express = require('express');
const {
  getCountries,
  getCountry,
  createCountry,
  updateCountry,
  deleteCountry
} = require('../controllers/countryController');

const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
  .get(getCountries)
  .post(protect, authorize('Admin', 'Sub-Admin'), upload.single('image'), createCountry);

router.route('/:id')
  .get(getCountry)
  .put(protect, authorize('Admin', 'Sub-Admin'), upload.single('image'), updateCountry)
  .delete(protect, authorize('Admin', 'Sub-Admin'), deleteCountry);

module.exports = router;

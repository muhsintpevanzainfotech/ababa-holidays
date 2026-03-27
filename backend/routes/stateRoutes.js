const express = require('express');
const {
  getStates,
  getStatesByCountry,
  getState,
  createState,
  updateState,
  deleteState
} = require('../controllers/stateController');

const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
  .get(getStates)
  .post(protect, authorize('Admin', 'Sub-Admin'), upload.single('image'), createState);

router.route('/:id')
  .get(getState)
  .put(protect, authorize('Admin', 'Sub-Admin'), upload.single('image'), updateState)
  .delete(protect, authorize('Admin', 'Sub-Admin'), deleteState);

router.get('/country/:countryId', getStatesByCountry);

module.exports = router;

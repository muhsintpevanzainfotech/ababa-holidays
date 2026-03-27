const express = require('express');
const {
  getDestinations,
  getDestinationsByState,
  getDestination,
  createDestination,
  updateDestination,
  deleteDestination
} = require('../controllers/destinationController');

const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.route('/')
  .get(getDestinations)
  .post(protect, authorize('Admin', 'Sub-Admin'), upload.single('image'), createDestination);

router.route('/:id')
  .get(getDestination)
  .put(protect, authorize('Admin', 'Sub-Admin'), upload.single('image'), updateDestination)
  .delete(protect, authorize('Admin', 'Sub-Admin'), deleteDestination);

router.get('/state/:stateId', getDestinationsByState);

module.exports = router;

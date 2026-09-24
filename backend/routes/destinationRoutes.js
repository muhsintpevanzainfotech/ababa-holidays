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

const destinationUploads = upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'thumbnail', maxCount: 1 },
  { name: 'image', maxCount: 1 },
  { name: 'gallery', maxCount: 10 }
]);

router.route('/')
  .get(getDestinations)
  .post(protect, authorize('Admin', 'Sub-Admin'), destinationUploads, createDestination);

router.route('/:id')
  .get(getDestination)
  .put(protect, authorize('Admin', 'Sub-Admin'), destinationUploads, updateDestination)
  .delete(protect, authorize('Admin', 'Sub-Admin'), deleteDestination);

router.get('/state/:stateId', getDestinationsByState);

module.exports = router;

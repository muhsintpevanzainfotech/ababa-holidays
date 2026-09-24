const express = require('express');
const {
  addReview,
  getReviews,
  deleteReview
} = require('../controllers/reviewController');

const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .post(protect, addReview);

router.route('/package/:packageId')
  .get(getReviews);

router.route('/:id')
  .delete(protect, deleteReview);

module.exports = router;

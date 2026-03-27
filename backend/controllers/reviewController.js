const Review = require('../models/Review');
const Package = require('../models/Package');
const Booking = require('../models/Booking');

// @desc    Add review
// @route   POST /api/reviews
// @access  Private
const addReview = async (req, res, next) => {
  try {
    const { packageId, rating, comment } = req.body;

    // Check if package exists
    const pkg = await Package.findById(packageId);

    if (!pkg) {
      return res.status(404).json({ success: false, message: 'Package not found' });
    }

    // Check if user has booked this package and it's completed
    const hasBooked = await Booking.findOne({
      user: req.user.id,
      package: packageId,
      bookingStatus: 'Completed'
    });

    if (!hasBooked) {
      return res.status(400).json({ success: false, message: 'You must complete the trip before leaving a review' });
    }

    const review = await Review.create({
      package: packageId,
      user: req.user.id,
      rating,
      comment
    });

    res.status(201).json({
      success: true,
      data: review
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get reviews for a package
// @route   GET /api/reviews/package/:packageId
// @access  Public
const getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ package: req.params.packageId }).populate({
      path: 'user',
      select: 'name avatar'
    });

    res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete review
// @route   DELETE /api/reviews/:id
// @access  Private
const deleteReview = async (req, res, next) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Make sure review belongs to user or user is Admin
    if (review.user.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete review' });
    }

    await review.remove();

    res.status(200).json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};


module.exports = {
  addReview,
  getReviews,
  deleteReview
};

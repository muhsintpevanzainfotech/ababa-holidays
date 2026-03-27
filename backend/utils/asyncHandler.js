const asyncHandler = (fn) => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch((err) => {
    if (typeof next === 'function') {
      next(err);
    } else {
      // Emergency fallback if middleware chain is broken
      res.status(500).json({
        success: false,
        message: err.message || 'Server Error'
      });
    }
  });
};

module.exports = asyncHandler;

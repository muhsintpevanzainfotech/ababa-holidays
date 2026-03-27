const express = require('express');
const { getStats } = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/stats', protect, authorize('Admin', 'Sub-Admin'), getStats);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllRead,
  clearNotifications
} = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All notification routes are protected

router.get('/', getNotifications);
router.put('/mark-all-read', markAllRead);
router.put('/:id/read', markAsRead);
router.delete('/', clearNotifications);

module.exports = router;

const express = require('express');
const router = express.Router();
const {
  getNotifications,
  markAsRead,
  markAllRead,
  clearNotifications
} = require('../controllers/notificationController');
const { optionalProtect } = require('../middleware/authMiddleware');

router.get('/', optionalProtect, getNotifications);
router.put('/mark-all-read', optionalProtect, markAllRead);
router.put('/:id/read', optionalProtect, markAsRead);
router.delete('/', optionalProtect, clearNotifications);

module.exports = router;

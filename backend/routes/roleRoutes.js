const express = require('express');
const {
  getRoles,
  createRole,
  updateRole,
  deleteRole
} = require('../controllers/roleController');

const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getRoles)
  .post(protect, authorize('Admin'), createRole);

router.route('/:id')
  .put(protect, authorize('Admin'), updateRole)
  .delete(protect, authorize('Admin'), deleteRole);

module.exports = router;

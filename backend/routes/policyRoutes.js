const express = require('express');
const {
  getPolicies,
  getPolicy,
  upsertPolicy,
  deletePolicy
} = require('../controllers/policyController');

const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getPolicies);
router.get('/:id', getPolicy);

// All management routes are protected and restricted to Admin or Vendor
router.use(protect);
router.use(authorize('Admin', 'Vendor'));

router.post('/', upsertPolicy);
router.delete('/:id', deletePolicy);

module.exports = router;

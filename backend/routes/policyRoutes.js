const express = require('express');
const {
  getPolicies,
  getPolicy,
  upsertPolicy,
  updatePolicy,
  deletePolicy
} = require('../controllers/policyController');

const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', getPolicies);
router.get('/:id', getPolicy);

// All management routes are protected and restricted to Admin, Vendor or Vendor-Staff
router.use(protect);
router.use(authorize('Admin', 'Vendor', 'Vendor-Staff'));

router.post('/', upsertPolicy);
router.put('/:id', updatePolicy);
router.delete('/:id', deletePolicy);

module.exports = router;

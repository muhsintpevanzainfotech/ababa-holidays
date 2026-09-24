const express = require('express');
const {
  getFieldsByService,
  saveFieldsForService,
  createField,
  updateField,
  deleteField,
  reorderFields
} = require('../controllers/packageFieldController');

const router = express.Router();

const { protect, authorize } = require('../middleware/authMiddleware');

router.get('/setup/:serviceId', getFieldsByService);

// Admin routes
router.use(protect);
router.use(authorize('Admin'));

router.post('/setup/:serviceId', saveFieldsForService);
router.put('/setup/:serviceId', saveFieldsForService);
router.post('/', createField);
router.put('/reorder', reorderFields);
router.route('/:id')
  .put(updateField)
  .delete(deleteField);

module.exports = router;

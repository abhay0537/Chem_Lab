const express = require('express');
const router = express.Router();
const { getLabs, getLab, createLab, updateLab, deleteLab } = require('../controllers/labController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getLabs);
router.get('/:id', protect, getLab);
router.post('/', protect, authorize('admin', 'superadmin'), createLab);
router.put('/:id', protect, authorize('admin', 'superadmin'), updateLab);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteLab);

module.exports = router;

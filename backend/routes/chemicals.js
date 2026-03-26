const express = require('express');
const router = express.Router();
const {
  getChemicals, getChemical, createChemical,
  updateChemical, deleteChemical, restockChemical, getLowStockChemicals
} = require('../controllers/chemicalController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', protect, getChemicals);
router.get('/low-stock', protect, authorize('admin', 'superadmin'), getLowStockChemicals);
router.get('/:id', protect, getChemical);
router.post('/', protect, authorize('admin', 'superadmin'), createChemical);
router.put('/:id', protect, authorize('admin', 'superadmin'), updateChemical);
router.patch('/:id/restock', protect, authorize('admin', 'superadmin'), restockChemical);
router.delete('/:id', protect, authorize('admin', 'superadmin'), deleteChemical);

module.exports = router;

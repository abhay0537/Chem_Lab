const express = require('express');
const router = express.Router();
const {
  borrowChemical, returnChemical, getTransactions,
  getMyHistory, getTransaction
} = require('../controllers/transactionController');
const { protect, authorize } = require('../middleware/auth');

router.post('/borrow', protect, borrowChemical);
router.post('/return', protect, returnChemical);
router.get('/my-history', protect, getMyHistory);
router.get('/', protect, authorize('admin', 'superadmin'), getTransactions);
router.get('/:id', protect, getTransaction);

module.exports = router;

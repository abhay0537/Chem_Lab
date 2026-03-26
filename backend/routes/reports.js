const express = require('express');
const router = express.Router();
const {
  getDashboardStats, getMostBorrowed, getDailyTrend,
  getLabUsageStats, getStudentStats, getCategoryBreakdown, exportCSV
} = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.get('/dashboard-stats', protect, authorize('admin', 'superadmin'), getDashboardStats);
router.get('/most-borrowed', protect, authorize('admin', 'superadmin'), getMostBorrowed);
router.get('/daily-trend', protect, authorize('admin', 'superadmin'), getDailyTrend);
router.get('/lab-usage', protect, authorize('admin', 'superadmin'), getLabUsageStats);
router.get('/student-stats', protect, authorize('admin', 'superadmin'), getStudentStats);
router.get('/category-breakdown', protect, authorize('admin', 'superadmin'), getCategoryBreakdown);
router.get('/export/csv', protect, authorize('admin', 'superadmin'), exportCSV);

module.exports = router;

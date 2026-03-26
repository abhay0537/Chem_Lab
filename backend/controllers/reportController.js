/**
 * Reports Controller
 * Analytics, statistics, and export functionality
 */

const Transaction = require('../models/Transaction');
const Chemical = require('../models/Chemical');
const User = require('../models/User');
const Lab = require('../models/Lab');

// ─── Admin Dashboard Stats ────────────────────────────────────────────────────
exports.getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekAgo = new Date(today - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(today - 30 * 24 * 60 * 60 * 1000);

    const [
      totalChemicals, totalLabs, totalUsers,
      todayTransactions, weekTransactions, monthTransactions,
      lowStockCount, activeBorrows,
      totalBorrows, totalReturns
    ] = await Promise.all([
      Chemical.countDocuments({ isActive: true }),
      Lab.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: true, role: 'user' }),
      Transaction.countDocuments({ createdAt: { $gte: today } }),
      Transaction.countDocuments({ createdAt: { $gte: weekAgo } }),
      Transaction.countDocuments({ createdAt: { $gte: monthAgo } }),
      Chemical.countDocuments({
        isActive: true,
        $expr: { $lte: ['$quantity', '$lowStockThreshold'] }
      }),
      Transaction.countDocuments({ type: 'borrow', status: { $in: ['approved', 'pending'] } }),
      Transaction.countDocuments({ type: 'borrow' }),
      Transaction.countDocuments({ type: 'return' })
    ]);

    res.json({
      stats: {
        totalChemicals, totalLabs, totalUsers,
        todayTransactions, weekTransactions, monthTransactions,
        lowStockCount, activeBorrows, totalBorrows, totalReturns
      }
    });
  } catch (err) {
    console.error('DashboardStats error:', err);
    res.status(500).json({ error: 'Failed to fetch dashboard stats.' });
  }
};

// ─── Most Borrowed Chemicals ──────────────────────────────────────────────────
exports.getMostBorrowed = async (req, res) => {
  try {
    const { days = 30, limit = 10 } = req.query;
    const since = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

    const results = await Transaction.aggregate([
      { $match: { type: 'borrow', createdAt: { $gte: since } } },
      {
        $group: {
          _id: '$chemical',
          totalBorrows: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' },
          lastBorrowed: { $max: '$createdAt' }
        }
      },
      { $sort: { totalBorrows: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'chemicals',
          localField: '_id',
          foreignField: '_id',
          as: 'chemical'
        }
      },
      { $unwind: '$chemical' },
      {
        $lookup: {
          from: 'labs',
          localField: 'chemical.lab',
          foreignField: '_id',
          as: 'lab'
        }
      },
      { $unwind: '$lab' },
      {
        $project: {
          chemical: { name: 1, formula: 1, unit: 1, category: 1 },
          lab: { name: 1, code: 1 },
          totalBorrows: 1,
          totalQuantity: 1,
          lastBorrowed: 1
        }
      }
    ]);

    res.json({ results });
  } catch (err) {
    console.error('MostBorrowed error:', err);
    res.status(500).json({ error: 'Failed to fetch most borrowed data.' });
  }
};

// ─── Daily Transaction Trend (last 30 days) ───────────────────────────────────
exports.getDailyTrend = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const since = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

    const results = await Transaction.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            type: '$type'
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.date': 1 } }
    ]);

    // Pivot: transform to date-keyed object
    const trendMap = {};
    results.forEach(({ _id, count }) => {
      if (!trendMap[_id.date]) trendMap[_id.date] = { date: _id.date, borrows: 0, returns: 0 };
      if (_id.type === 'borrow') trendMap[_id.date].borrows = count;
      else trendMap[_id.date].returns = count;
    });

    const trend = Object.values(trendMap).sort((a, b) => a.date.localeCompare(b.date));

    res.json({ trend });
  } catch (err) {
    console.error('DailyTrend error:', err);
    res.status(500).json({ error: 'Failed to fetch trend data.' });
  }
};

// ─── Lab-wise Usage Stats ─────────────────────────────────────────────────────
exports.getLabUsageStats = async (req, res) => {
  try {
    const { days = 30 } = req.query;
    const since = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

    const results = await Transaction.aggregate([
      { $match: { type: 'borrow', createdAt: { $gte: since } } },
      {
        $group: {
          _id: '$lab',
          totalTransactions: { $sum: 1 },
          uniqueUsers: { $addToSet: '$user' }
        }
      },
      {
        $lookup: {
          from: 'labs',
          localField: '_id',
          foreignField: '_id',
          as: 'lab'
        }
      },
      { $unwind: '$lab' },
      {
        $project: {
          lab: { name: 1, code: 1, type: 1 },
          totalTransactions: 1,
          uniqueUserCount: { $size: '$uniqueUsers' }
        }
      },
      { $sort: { totalTransactions: -1 } }
    ]);

    res.json({ results });
  } catch (err) {
    console.error('LabUsageStats error:', err);
    res.status(500).json({ error: 'Failed to fetch lab usage stats.' });
  }
};

// ─── Student Usage Stats ──────────────────────────────────────────────────────
exports.getStudentStats = async (req, res) => {
  try {
    const { days = 30, limit = 10 } = req.query;
    const since = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

    const results = await Transaction.aggregate([
      { $match: { type: 'borrow', createdAt: { $gte: since } } },
      {
        $group: {
          _id: '$user',
          totalBorrows: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' }
        }
      },
      { $sort: { totalBorrows: -1 } },
      { $limit: parseInt(limit) },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          user: { name: 1, email: 1, studentId: 1, department: 1 },
          totalBorrows: 1,
          totalQuantity: 1
        }
      }
    ]);

    res.json({ results });
  } catch (err) {
    console.error('StudentStats error:', err);
    res.status(500).json({ error: 'Failed to fetch student stats.' });
  }
};

// ─── Category Breakdown ───────────────────────────────────────────────────────
exports.getCategoryBreakdown = async (req, res) => {
  try {
    const results = await Chemical.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalQuantity: { $sum: '$quantity' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({ results });
  } catch (err) {
    console.error('CategoryBreakdown error:', err);
    res.status(500).json({ error: 'Failed to fetch category breakdown.' });
  }
};

// ─── Export Transactions as CSV ───────────────────────────────────────────────
exports.exportCSV = async (req, res) => {
  try {
    const { startDate, endDate, type, lab } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (lab) filter.lab = lab;
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const transactions = await Transaction.find(filter)
      .populate('user', 'name email studentId department')
      .populate('chemical', 'name formula unit')
      .populate('lab', 'name code')
      .sort({ createdAt: -1 })
      .limit(5000);

    // Build CSV manually
    const headers = [
      'Date', 'Type', 'Student Name', 'Student ID', 'Department',
      'Chemical', 'Formula', 'Quantity', 'Unit', 'Lab', 'Status', 'Purpose'
    ];

    const rows = transactions.map(t => [
      new Date(t.createdAt).toLocaleDateString(),
      t.type,
      t.user?.name || '',
      t.user?.studentId || '',
      t.user?.department || '',
      t.chemical?.name || '',
      t.chemical?.formula || '',
      t.quantity,
      t.unit,
      t.lab?.name || '',
      t.status,
      t.purpose || ''
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=chemlab-transactions.csv');
    res.send(csv);
  } catch (err) {
    console.error('ExportCSV error:', err);
    res.status(500).json({ error: 'Failed to export data.' });
  }
};

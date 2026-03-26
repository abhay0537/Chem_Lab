/**
 * Transaction Controller
 * Handles borrow and return operations with inventory updates
 */

const Transaction = require('../models/Transaction');
const Chemical = require('../models/Chemical');
const User = require('../models/User');

// ─── Borrow Chemical ──────────────────────────────────────────────────────────
exports.borrowChemical = async (req, res) => {
  try {
    const { chemicalId, quantity, purpose, expectedReturnDate } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Quantity must be greater than 0.' });
    }

    // Fetch chemical with lock-like behavior
    const chemical = await Chemical.findById(chemicalId).populate('lab');
    if (!chemical || !chemical.isActive) {
      return res.status(404).json({ error: 'Chemical not found.' });
    }

    // Validate borrow limit
    if (quantity > chemical.maxBorrowLimit) {
      return res.status(400).json({
        error: `Borrow limit exceeded. Maximum allowed: ${chemical.maxBorrowLimit} ${chemical.unit}`
      });
    }

    // Validate availability
    if (quantity > chemical.quantity) {
      return res.status(400).json({
        error: `Insufficient stock. Available: ${chemical.quantity} ${chemical.unit}`
      });
    }

    const quantityBefore = chemical.quantity;

    // Deduct from inventory
    chemical.quantity -= parseFloat(quantity);
    await chemical.save();

    // Create transaction record
    const transaction = await Transaction.create({
      user: req.user._id,
      chemical: chemicalId,
      lab: chemical.lab._id,
      type: 'borrow',
      quantity: parseFloat(quantity),
      unit: chemical.unit,
      status: 'approved',
      purpose,
      expectedReturnDate: expectedReturnDate || null,
      quantityBefore,
      quantityAfter: chemical.quantity
    });

    await transaction.populate([
      { path: 'user', select: 'name email studentId' },
      { path: 'chemical', select: 'name formula unit' },
      { path: 'lab', select: 'name code' }
    ]);

    res.status(201).json({
      message: `Successfully borrowed ${quantity} ${chemical.unit} of ${chemical.name}`,
      transaction
    });
  } catch (err) {
    console.error('BorrowChemical error:', err);
    res.status(500).json({ error: 'Borrow operation failed.' });
  }
};

// ─── Return Chemical ──────────────────────────────────────────────────────────
exports.returnChemical = async (req, res) => {
  try {
    const { transactionId, quantity, notes } = req.body;

    // Find the original borrow transaction
    const borrowTransaction = await Transaction.findById(transactionId)
      .populate('chemical');

    if (!borrowTransaction) {
      return res.status(404).json({ error: 'Borrow record not found.' });
    }

    if (borrowTransaction.user.toString() !== req.user._id.toString() && req.user.role === 'user') {
      return res.status(403).json({ error: 'Cannot return someone else\'s borrowed chemical.' });
    }

    if (borrowTransaction.status === 'returned') {
      return res.status(400).json({ error: 'This chemical has already been returned.' });
    }

    const returnQty = parseFloat(quantity) || borrowTransaction.quantity;
    const chemical = await Chemical.findById(borrowTransaction.chemical._id);

    if (!chemical) return res.status(404).json({ error: 'Chemical not found.' });

    const quantityBefore = chemical.quantity;

    // Add back to inventory
    chemical.quantity += returnQty;
    // Don't exceed total capacity
    if (chemical.totalCapacity && chemical.quantity > chemical.totalCapacity) {
      chemical.quantity = chemical.totalCapacity;
    }
    await chemical.save();

    // Update original borrow transaction status
    borrowTransaction.status = 'returned';
    borrowTransaction.actualReturnDate = new Date();
    await borrowTransaction.save();

    // Create return transaction record
    const returnTransaction = await Transaction.create({
      user: req.user._id,
      chemical: chemical._id,
      lab: borrowTransaction.lab,
      type: 'return',
      quantity: returnQty,
      unit: chemical.unit,
      status: 'returned',
      borrowReference: transactionId,
      notes,
      actualReturnDate: new Date(),
      quantityBefore,
      quantityAfter: chemical.quantity
    });

    await returnTransaction.populate([
      { path: 'chemical', select: 'name formula unit' },
      { path: 'lab', select: 'name code' }
    ]);

    res.json({
      message: `Successfully returned ${returnQty} ${chemical.unit} of ${chemical.name}`,
      transaction: returnTransaction
    });
  } catch (err) {
    console.error('ReturnChemical error:', err);
    res.status(500).json({ error: 'Return operation failed.' });
  }
};

// ─── Get transactions (with filters) ─────────────────────────────────────────
exports.getTransactions = async (req, res) => {
  try {
    const {
      userId, labId, chemicalId, type, status,
      startDate, endDate, page = 1, limit = 20
    } = req.query;

    const filter = {};

    // Regular users can only see their own transactions
    if (req.user.role === 'user') {
      filter.user = req.user._id;
    } else {
      if (userId) filter.user = userId;
    }

    if (labId) filter.lab = labId;
    if (chemicalId) filter.chemical = chemicalId;
    if (type) filter.type = type;
    if (status) filter.status = status;

    // Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate('user', 'name email studentId department')
        .populate('chemical', 'name formula unit hazardLevel')
        .populate('lab', 'name code type')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Transaction.countDocuments(filter)
    ]);

    res.json({
      transactions,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('GetTransactions error:', err);
    res.status(500).json({ error: 'Failed to fetch transactions.' });
  }
};

// ─── Get user's own history ───────────────────────────────────────────────────
exports.getMyHistory = async (req, res) => {
  try {
    const { status, type, page = 1, limit = 20 } = req.query;
    const filter = { user: req.user._id };

    if (status) filter.status = status;
    if (type) filter.type = type;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [transactions, total] = await Promise.all([
      Transaction.find(filter)
        .populate('chemical', 'name formula unit hazardLevel category')
        .populate('lab', 'name code type')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Transaction.countDocuments(filter)
    ]);

    // Count active borrows (not yet returned)
    const activeBorrows = await Transaction.countDocuments({
      user: req.user._id,
      type: 'borrow',
      status: { $in: ['approved', 'pending'] }
    });

    res.json({
      transactions,
      activeBorrows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('GetMyHistory error:', err);
    res.status(500).json({ error: 'Failed to fetch history.' });
  }
};

// ─── Get single transaction ───────────────────────────────────────────────────
exports.getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('user', 'name email studentId department')
      .populate('chemical', 'name formula unit hazardLevel safetyNotes')
      .populate('lab', 'name code type building');

    if (!transaction) return res.status(404).json({ error: 'Transaction not found.' });

    // Users can only view their own transactions
    if (req.user.role === 'user' && transaction.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    res.json({ transaction });
  } catch (err) {
    console.error('GetTransaction error:', err);
    res.status(500).json({ error: 'Failed to fetch transaction.' });
  }
};

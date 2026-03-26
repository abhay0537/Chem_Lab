/**
 * Chemical Controller
 * CRUD operations for chemicals + QR code generation
 */

const Chemical = require('../models/Chemical');
const Lab = require('../models/Lab');
const QRCode = require('qrcode');

// ─── Get all chemicals (with filters) ────────────────────────────────────────
exports.getChemicals = async (req, res) => {
  try {
    const {
      lab, category, hazardLevel, search,
      lowStock, page = 1, limit = 50, sortBy = 'name', sortOrder = 'asc'
    } = req.query;

    const filter = { isActive: true };

    if (lab) filter.lab = lab;
    if (category) filter.category = category;
    if (hazardLevel) filter.hazardLevel = hazardLevel;

    // Low stock filter
    if (lowStock === 'true') {
      filter.$expr = { $lte: ['$quantity', '$lowStockThreshold'] };
    }

    // Text search using MongoDB $text index
    if (search) {
      filter.$text = { $search: search };
    }

    const sortObj = {};
    sortObj[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [chemicals, total] = await Promise.all([
      Chemical.find(filter)
        .populate('lab', 'name code type')
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit)),
      Chemical.countDocuments(filter)
    ]);

    res.json({
      chemicals,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (err) {
    console.error('GetChemicals error:', err);
    res.status(500).json({ error: 'Failed to fetch chemicals.' });
  }
};

// ─── Get single chemical ──────────────────────────────────────────────────────
exports.getChemical = async (req, res) => {
  try {
    const chemical = await Chemical.findById(req.params.id).populate('lab', 'name code type building floor');

    if (!chemical || !chemical.isActive) {
      return res.status(404).json({ error: 'Chemical not found.' });
    }

    res.json({ chemical });
  } catch (err) {
    console.error('GetChemical error:', err);
    res.status(500).json({ error: 'Failed to fetch chemical.' });
  }
};

// ─── Create chemical (Admin only) ─────────────────────────────────────────────
exports.createChemical = async (req, res) => {
  try {
    const labExists = await Lab.findById(req.body.lab);
    if (!labExists) return res.status(400).json({ error: 'Lab not found.' });

    // Set totalCapacity = quantity on first creation
    if (!req.body.totalCapacity) {
      req.body.totalCapacity = req.body.quantity;
    }

    const chemical = await Chemical.create(req.body);

    // Generate QR code containing chemical info URL
    const qrData = JSON.stringify({
      id: chemical._id,
      name: chemical.name,
      lab: labExists.name,
      formula: chemical.formula
    });
    const qrCode = await QRCode.toDataURL(qrData);
    chemical.qrCode = qrCode;
    await chemical.save();

    await chemical.populate('lab', 'name code type');

    res.status(201).json({ message: 'Chemical created successfully', chemical });
  } catch (err) {
    console.error('CreateChemical error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: Object.values(err.errors).map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: 'Failed to create chemical.' });
  }
};

// ─── Update chemical (Admin only) ─────────────────────────────────────────────
exports.updateChemical = async (req, res) => {
  try {
    const chemical = await Chemical.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    ).populate('lab', 'name code type');

    if (!chemical) return res.status(404).json({ error: 'Chemical not found.' });

    res.json({ message: 'Chemical updated successfully', chemical });
  } catch (err) {
    console.error('UpdateChemical error:', err);
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: Object.values(err.errors).map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: 'Failed to update chemical.' });
  }
};

// ─── Restock chemical ─────────────────────────────────────────────────────────
exports.restockChemical = async (req, res) => {
  try {
    const { quantity, notes } = req.body;

    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Restock quantity must be positive.' });
    }

    const chemical = await Chemical.findById(req.params.id);
    if (!chemical) return res.status(404).json({ error: 'Chemical not found.' });

    chemical.quantity += parseFloat(quantity);
    chemical.lastRestocked = new Date();
    if (chemical.quantity > (chemical.totalCapacity || 0)) {
      chemical.totalCapacity = chemical.quantity;
    }
    await chemical.save();

    await chemical.populate('lab', 'name code');

    res.json({ message: `Restocked ${quantity} ${chemical.unit} of ${chemical.name}`, chemical });
  } catch (err) {
    console.error('Restock error:', err);
    res.status(500).json({ error: 'Restock failed.' });
  }
};

// ─── Delete (soft delete) chemical ───────────────────────────────────────────
exports.deleteChemical = async (req, res) => {
  try {
    const chemical = await Chemical.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!chemical) return res.status(404).json({ error: 'Chemical not found.' });

    res.json({ message: 'Chemical removed from inventory.' });
  } catch (err) {
    console.error('DeleteChemical error:', err);
    res.status(500).json({ error: 'Failed to delete chemical.' });
  }
};

// ─── Get low stock chemicals ──────────────────────────────────────────────────
exports.getLowStockChemicals = async (req, res) => {
  try {
    const chemicals = await Chemical.find({
      isActive: true,
      $expr: { $lte: ['$quantity', '$lowStockThreshold'] }
    }).populate('lab', 'name code type').sort({ quantity: 1 });

    res.json({ chemicals, count: chemicals.length });
  } catch (err) {
    console.error('LowStock error:', err);
    res.status(500).json({ error: 'Failed to fetch low stock chemicals.' });
  }
};

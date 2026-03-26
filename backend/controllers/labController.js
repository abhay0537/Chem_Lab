/**
 * Lab Controller
 * CRUD operations for laboratories
 */

const Lab = require('../models/Lab');
const Chemical = require('../models/Chemical');

exports.getLabs = async (req, res) => {
  try {
    const labs = await Lab.find({ isActive: true }).sort({ name: 1 });
    res.json({ labs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch labs.' });
  }
};

exports.getLab = async (req, res) => {
  try {
    const lab = await Lab.findById(req.params.id);
    if (!lab || !lab.isActive) return res.status(404).json({ error: 'Lab not found.' });

    // Get chemical count for this lab
    const chemicalCount = await Chemical.countDocuments({ lab: lab._id, isActive: true });
    const lowStockCount = await Chemical.countDocuments({
      lab: lab._id, isActive: true,
      $expr: { $lte: ['$quantity', '$lowStockThreshold'] }
    });

    res.json({ lab, chemicalCount, lowStockCount });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch lab.' });
  }
};

exports.createLab = async (req, res) => {
  try {
    const lab = await Lab.create(req.body);
    res.status(201).json({ message: 'Lab created successfully', lab });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ error: 'Lab code already exists.' });
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: Object.values(err.errors).map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: 'Failed to create lab.' });
  }
};

exports.updateLab = async (req, res) => {
  try {
    const lab = await Lab.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!lab) return res.status(404).json({ error: 'Lab not found.' });
    res.json({ message: 'Lab updated', lab });
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: Object.values(err.errors).map(e => e.message).join(', ') });
    }
    res.status(500).json({ error: 'Failed to update lab.' });
  }
};

exports.deleteLab = async (req, res) => {
  try {
    const chemCount = await Chemical.countDocuments({ lab: req.params.id, isActive: true });
    if (chemCount > 0) {
      return res.status(400).json({
        error: `Cannot delete lab with ${chemCount} active chemicals. Remove chemicals first.`
      });
    }
    await Lab.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Lab deleted.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete lab.' });
  }
};

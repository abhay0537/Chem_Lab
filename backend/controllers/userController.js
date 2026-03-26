/**
 * User Controller
 * Admin management of users
 */

const User = require('../models/User');
const Transaction = require('../models/Transaction');

// Get all users (admin only)
exports.getUsers = async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [users, total] = await Promise.all([
      User.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      User.countDocuments(filter)
    ]);

    res.json({ users, pagination: { total, page: parseInt(page), limit: parseInt(limit), pages: Math.ceil(total / parseInt(limit)) } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
};

// Get single user
exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password').populate('managedLabs', 'name code type');
    if (!user) return res.status(404).json({ error: 'User not found.' });

    const stats = await Transaction.aggregate([
      { $match: { user: user._id } },
      { $group: { _id: '$type', count: { $sum: 1 } } }
    ]);

    res.json({ user, stats });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user.' });
  }
};

// Update user role (superadmin only)
exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found.' });
    res.json({ message: 'User role updated', user });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user role.' });
  }
};

// Toggle user active status
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found.' });

    user.isActive = !user.isActive;
    await user.save();

    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'}`, isActive: user.isActive });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user status.' });
  }
};

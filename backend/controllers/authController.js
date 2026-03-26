/**
 * Auth Controller
 * Handles user registration and login
 */

const { validationResult } = require('express-validator');
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

// ─── Register New User ────────────────────────────────────────────────────────
exports.register = async (req, res) => {
  try {
    // Validate request body
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, role, studentId, department, phone, college } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered.' });
    }

    // Prevent self-registration as admin (admin must be created by superadmin)
    const userRole = role === 'admin' || role === 'superadmin' ? 'user' : role || 'user';

    // Create new user
    const user = await User.create({
      name, email, password, role: userRole,
      studentId, department, phone,
      college: college || 'Shri GS Institute of Tech & Science Indore'
    });

    // Generate JWT
    const token = generateToken(user._id);

    res.status(201).json({
      message: 'Registration successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        department: user.department,
        college: user.college
      }
    });
  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ error: 'Registration failed. Please try again.' });
  }
};

// ─── Login ────────────────────────────────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // Find user and include password for comparison
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account deactivated. Contact administrator.' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
        department: user.department,
        college: user.college,
        lastLogin: user.lastLogin
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
};

// ─── Get Current User Profile ─────────────────────────────────────────────────
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('managedLabs', 'name code type');
    if (!user) return res.status(404).json({ error: 'User not found.' });

    res.json({ user });
  } catch (err) {
    console.error('GetMe error:', err);
    res.status(500).json({ error: 'Failed to fetch profile.' });
  }
};

// ─── Update Profile ───────────────────────────────────────────────────────────
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, department, studentId } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, department, studentId },
      { new: true, runValidators: true }
    );

    res.json({ message: 'Profile updated', user });
  } catch (err) {
    console.error('UpdateProfile error:', err);
    res.status(500).json({ error: 'Profile update failed.' });
  }
};

// ─── Change Password ──────────────────────────────────────────────────────────
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({ error: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    await user.save();

    const token = generateToken(user._id);
    res.json({ message: 'Password changed successfully', token });
  } catch (err) {
    console.error('ChangePassword error:', err);
    res.status(500).json({ error: 'Password change failed.' });
  }
};

/**
 * Authentication Middleware
 * Verifies JWT tokens and attaches user to request
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

// ─── Verify JWT Token ─────────────────────────────────────────────────────────
const protect = async (req, res, next) => {
  try {
    let token;

    // Extract token from Authorization header (Bearer <token>)
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    // Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');

    // Fetch user from DB to ensure they still exist and are active
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ error: 'User no longer exists.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'Account has been deactivated.' });
    }

    // Attach user to request object
    req.user = user;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token.' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired. Please log in again.' });
    }
    console.error('Auth middleware error:', err);
    res.status(500).json({ error: 'Authentication error.' });
  }
};

// ─── Role-Based Authorization ─────────────────────────────────────────────────
// Usage: authorize('admin', 'superadmin')
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: `Access denied. Role '${req.user.role}' is not authorized for this action.`
      });
    }
    next();
  };
};

// ─── Generate JWT Token ───────────────────────────────────────────────────────
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET || 'fallback_secret',
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

module.exports = { protect, authorize, generateToken };

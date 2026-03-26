/**
 * User Model
 * Defines the schema for students and admins in the system
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    minlength: [2, 'Name must be at least 2 characters'],
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'superadmin'],
    default: 'user'
  },
  studentId: {
    type: String,
    trim: true,
    sparse: true // Allows null/undefined but must be unique if present
  },
  department: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  // Labs this admin can manage (only for admin role)
  managedLabs: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lab'
  }],
  college: {
    type: String,
    default: 'Shri GS Institute of Tech & Science Indore',
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// ─── Pre-save Hook: Hash password before saving ───────────────────────────────
userSchema.pre('save', async function(next) {
  // Only hash if password was modified
  if (!this.isModified('password')) return next();

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// ─── Instance Method: Compare password ───────────────────────────────────────
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ─── Instance Method: Get public profile (no password) ───────────────────────
userSchema.methods.toPublicJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);

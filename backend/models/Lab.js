/**
 * Lab Model
 * Represents a laboratory within the college
 */

const mongoose = require('mongoose');

const labSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Lab name is required'],
    trim: true,
    maxlength: [100, 'Lab name cannot exceed 100 characters']
  },
  code: {
    type: String,
    required: [true, 'Lab code is required'],
    unique: true,
    uppercase: true,
    trim: true,
    maxlength: [10, 'Lab code cannot exceed 10 characters']
  },
  type: {
    type: String,
    enum: ['Organic', 'Inorganic', 'Physical', 'Analytical', 'Biochemistry', 'Microbiology', 'General', 'Research'],
    required: [true, 'Lab type is required']
  },
  college: {
    type: String,
    default: 'Shri GS Institute of Tech & Science Indore',
    trim: true
  },
  building: {
    type: String,
    trim: true
  },
  floor: {
    type: String,
    trim: true
  },
  capacity: {
    type: Number,
    min: [1, 'Capacity must be at least 1']
  },
  // Lab supervisor / incharge
  incharge: {
    name: String,
    email: String,
    phone: String
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  // Operating hours
  operatingHours: {
    weekdays: { open: String, close: String },
    weekends: { open: String, close: String, isClosed: Boolean }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual: total chemicals in this lab
labSchema.virtual('chemicalCount', {
  ref: 'Chemical',
  localField: '_id',
  foreignField: 'lab',
  count: true
});

module.exports = mongoose.model('Lab', labSchema);

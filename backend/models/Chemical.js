/**
 * Chemical Model
 * Represents a chemical stored in a lab
 */

const mongoose = require('mongoose');

const chemicalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Chemical name is required'],
    trim: true,
    maxlength: [100, 'Chemical name cannot exceed 100 characters']
  },
  // IUPAC or common name
  formula: {
    type: String,
    trim: true,
    maxlength: [50, 'Formula cannot exceed 50 characters']
  },
  casNumber: {
    type: String,
    trim: true,
    // CAS Registry Number format: xxxxxxx-xx-x
  },
  lab: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lab',
    required: [true, 'Lab reference is required']
  },
  category: {
    type: String,
    enum: ['Acid', 'Base', 'Solvent', 'Salt', 'Indicator', 'Reagent', 'Buffer', 'Standard', 'Gas', 'Other'],
    default: 'Other'
  },
  // Current available quantity
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative']
  },
  // Unit of measurement
  unit: {
    type: String,
    enum: ['ml', 'L', 'g', 'kg', 'mg', 'mol', 'mmol', 'drops', 'units'],
    required: [true, 'Unit is required']
  },
  // Maximum a student can borrow at once
  maxBorrowLimit: {
    type: Number,
    required: [true, 'Maximum borrow limit is required'],
    min: [1, 'Borrow limit must be at least 1']
  },
  // Low stock threshold - triggers alert
  lowStockThreshold: {
    type: Number,
    default: 10,
    min: [0, 'Threshold cannot be negative']
  },
  // Total capacity / initial stock
  totalCapacity: {
    type: Number,
    min: [0, 'Total capacity cannot be negative']
  },
  hazardLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Extreme'],
    default: 'Low'
  },
  // GHS Hazard symbols
  hazardSymbols: [{
    type: String,
    enum: ['Flammable', 'Corrosive', 'Toxic', 'Explosive', 'Oxidizer', 'Health Hazard', 'Environmental Hazard', 'Irritant', 'Compressed Gas']
  }],
  // Safety information
  safetyNotes: {
    type: String,
    maxlength: [500, 'Safety notes cannot exceed 500 characters']
  },
  // Supplier information
  supplier: {
    name: String,
    contact: String,
    catalogNo: String
  },
  // Restock information
  lastRestocked: {
    type: Date
  },
  nextRestockDate: {
    type: Date
  },
  expiryDate: {
    type: Date
  },
  // Storage conditions
  storageConditions: {
    type: String,
    trim: true
  },
  // QR code data (generated on creation)
  qrCode: {
    type: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual: stock percentage
chemicalSchema.virtual('stockPercentage').get(function() {
  if (!this.totalCapacity || this.totalCapacity === 0) return null;
  return Math.round((this.quantity / this.totalCapacity) * 100);
});

// Virtual: isLowStock
chemicalSchema.virtual('isLowStock').get(function() {
  return this.quantity <= this.lowStockThreshold;
});

// Index for faster searches
chemicalSchema.index({ name: 'text', formula: 'text', casNumber: 'text' });
chemicalSchema.index({ lab: 1, isActive: 1 });
chemicalSchema.index({ quantity: 1, lowStockThreshold: 1 });

module.exports = mongoose.model('Chemical', chemicalSchema);

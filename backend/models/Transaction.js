/**
 * Transaction Model
 * Logs every borrow and return event in the system
 */

const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  // Who borrowed
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User reference is required']
  },
  // Which chemical
  chemical: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chemical',
    required: [true, 'Chemical reference is required']
  },
  // Which lab
  lab: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Lab',
    required: [true, 'Lab reference is required']
  },
  type: {
    type: String,
    enum: ['borrow', 'return'],
    required: [true, 'Transaction type is required']
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0.001, 'Quantity must be greater than 0']
  },
  unit: {
    type: String,
    required: [true, 'Unit is required']
  },
  // Status of the borrow request
  status: {
    type: String,
    enum: ['pending', 'approved', 'returned', 'rejected', 'overdue'],
    default: 'approved' // Auto-approved for now; can add approval workflow
  },
  // Purpose / reason for borrowing
  purpose: {
    type: String,
    trim: true,
    maxlength: [200, 'Purpose cannot exceed 200 characters']
  },
  // Expected return date (for borrow transactions)
  expectedReturnDate: {
    type: Date
  },
  // Actual return date (filled when returned)
  actualReturnDate: {
    type: Date
  },
  // Reference to the original borrow transaction (for return transactions)
  borrowReference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  },
  // Admin who approved/processed (optional)
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  notes: {
    type: String,
    maxlength: [300, 'Notes cannot exceed 300 characters']
  },
  // Snapshot of quantity before this transaction (for audit trail)
  quantityBefore: {
    type: Number
  },
  quantityAfter: {
    type: Number
  }
}, {
  timestamps: true
});

// Index for efficient queries
transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ lab: 1, createdAt: -1 });
transactionSchema.index({ chemical: 1, createdAt: -1 });
transactionSchema.index({ status: 1, type: 1 });
transactionSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);

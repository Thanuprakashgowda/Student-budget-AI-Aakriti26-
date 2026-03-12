const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  category: {
    type: String,
    required: true,
    default: 'Food'
  },
  date: {
    type: Date,
    default: Date.now
  },
  aiConfidence: {
    type: Number,
    default: 0,
    min: 0,
    max: 1
  },
  userId: {
    type: String,
    default: 'demo-user'
  }
}, {
  timestamps: true
});

// Index for efficient queries
expenseSchema.index({ date: -1 });
expenseSchema.index({ category: 1 });

module.exports = mongoose.model('Expense', expenseSchema);

const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  amount: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  amount_encrypted: String,
  description_encrypted: String,
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
  phone: String,
  source: {
    type: String,
    default: 'web'
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

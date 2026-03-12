const express = require('express');
const router = express.Router();
const Expense = require('../models/Expense');
const auth = require('../middleware/auth');

// GET /api/expenses - List all expenses
router.get('/', auth, async (req, res) => {
  try {
    const { month, category, limit = 50 } = req.query;
    const filter = { userId: req.userId };

    if (month) {
      const [year, m] = month.split('-');
      filter.date = {
        $gte: new Date(year, m - 1, 1),
        $lt: new Date(year, m, 1)
      };
    }
    if (category) filter.category = category;

    const expenses = await Expense.find(filter)
      .sort({ date: -1 })
      .limit(parseInt(limit));

    // Calculate totals by category
    const allExpenses = await Expense.find({ userId: req.userId });
    const totals = {};
    allExpenses.forEach(e => {
      totals[e.category] = (totals[e.category] || 0) + e.amount;
    });

    res.json({ success: true, expenses, totals, count: allExpenses.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/expenses - Create expense
router.post('/', auth, async (req, res) => {
  try {
    const { amount, description, category, date, aiConfidence } = req.body;
    const expense = new Expense({
      amount: parseFloat(amount),
      description,
      category,
      date: date ? new Date(date) : new Date(),
      aiConfidence: aiConfidence || 0,
      userId: req.userId
    });
    await expense.save();

    // Emit real-time update
    const io = req.app.get('io');
    if (io) io.emit('expense:created', expense);

    res.status(201).json({ success: true, expense });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// PUT /api/expenses/:id - Update expense
router.put('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    if (!expense) return res.status(404).json({ success: false, error: 'Expense not found' });

    const io = req.app.get('io');
    if (io) io.emit('expense:updated', expense);

    res.json({ success: true, expense });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE /api/expenses/:id - Delete expense
router.delete('/:id', auth, async (req, res) => {
  try {
    const expense = await Expense.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!expense) return res.status(404).json({ success: false, error: 'Expense not found' });

    const io = req.app.get('io');
    if (io) io.emit('expense:deleted', { id: req.params.id });

    res.json({ success: true, message: 'Expense deleted' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/expenses/stats - Get stats
router.get('/stats', auth, async (req, res) => {
  try {
    const expenses = await Expense.find({ userId: req.userId });
    const now = new Date();
    const thisMonth = expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const stats = {
      totalExpenses: expenses.length,
      totalAmount: expenses.reduce((s, e) => s + e.amount, 0),
      thisMonthAmount: thisMonth.reduce((s, e) => s + e.amount, 0),
      byCategory: {}
    };

    ['Food', 'Transport', 'Study', 'Entertainment'].forEach(cat => {
      stats.byCategory[cat] = thisMonth
        .filter(e => e.category === cat)
        .reduce((s, e) => s + e.amount, 0);
    });

    res.json({ success: true, stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;

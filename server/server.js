require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ['http://localhost:3000', 'http://localhost:3001'],
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

// Middleware
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:3001'] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io accessible in routes
app.set('io', io);

// In-memory global state for demo mode
const dbState = {
  expenses: [],
  nextId: 1
};
app.set('dbState', dbState);

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/studentbudgetai';

mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => {
    console.warn('⚠️  MongoDB not connected, using in-memory fallback:', err.message);
    // Use in-memory mode for demo if MongoDB unavailable
    setupInMemoryMode();
  });

// Routes
const expensesRouter = require('./routes/expenses');
const categorizeRouter = require('./routes/categorize');
const authRouter = require('./routes/auth');
const chatRouter = require('./routes/chat');
const whatsappRoutes = require('./routes/whatsapp');

app.use('/api/auth', authRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/categorize', categorizeRouter);
app.use('/api/chat', chatRouter);
app.use('/whatsapp', whatsappRoutes);
app.use('/api/whatsapp', whatsappRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    message: 'StudentBudgetAI API running 🚀'
  });
});

// In-memory fallback for demo (no MongoDB required)
let inMemoryExpenses = [];
let nextId = 1;

function setupInMemoryMode() {
  const { CATEGORY_BUDGETS } = require('../shared/categories');

  // Pre-populate sample data
  const sampleData = [
    { amount: 20, description: 'Morning chai at canteen', category: 'Food', date: new Date('2026-03-12'), aiConfidence: 0.95 },
    { amount: 75, description: 'Auto to college', category: 'Transport', date: new Date('2026-03-12'), aiConfidence: 0.92 },
    { amount: 250, description: 'Photocopy notes for exam', category: 'Study', date: new Date('2026-03-12'), aiConfidence: 0.88 },
    { amount: 110, description: 'Mess food lunch', category: 'Food', date: new Date('2026-03-11'), aiConfidence: 0.9 },
    { amount: 60, description: 'Bus fare to tuition', category: 'Transport', date: new Date('2026-03-11'), aiConfidence: 0.85 },
    { amount: 350, description: 'Reference book for project', category: 'Study', date: new Date('2026-03-11'), aiConfidence: 0.93 },
    { amount: 200, description: 'Netflix subscription', category: 'Entertainment', date: new Date('2026-03-10'), aiConfidence: 0.97 },
    { amount: 15, description: 'Evening chai and biscuit', category: 'Food', date: new Date('2026-03-10'), aiConfidence: 0.92 },
    { amount: 80, description: 'Uber ride to market', category: 'Transport', date: new Date('2026-03-10'), aiConfidence: 0.89 },
    { amount: 120, description: 'Dosa and coffee breakfast', category: 'Food', date: new Date('2026-03-09'), aiConfidence: 0.91 },
    { amount: 500, description: 'College exam fees', category: 'Study', date: new Date('2026-03-09'), aiConfidence: 0.96 },
    { amount: 150, description: 'Movie tickets weekend', category: 'Entertainment', date: new Date('2026-03-08'), aiConfidence: 0.94 },
    { amount: 25, description: 'Samosa and chai canteen', category: 'Food', date: new Date('2026-03-08'), aiConfidence: 0.9 },
    { amount: 100, description: 'Ola to station', category: 'Transport', date: new Date('2026-03-07'), aiConfidence: 0.87 },
    { amount: 180, description: 'Biryani dinner with friends', category: 'Food', date: new Date('2026-03-07'), aiConfidence: 0.93 }
  ];

  dbState.expenses = sampleData.map(e => ({ ...e, _id: String(dbState.nextId++), userId: 'demo-user', createdAt: new Date() }));

  app.get('/api/expenses', (req, res) => {
    const totals = {};
    dbState.expenses.forEach(e => { 
      const amt = parseFloat(e.amount) || 0;
      totals[e.category] = (totals[e.category] || 0) + amt; 
    });
    res.json({ success: true, expenses: dbState.expenses.sort((a, b) => new Date(b.date) - new Date(a.date)), totals, count: dbState.expenses.length });
  });

  app.get('/api/expenses/stats', (req, res) => {
    const now = new Date();
    const thisMonth = dbState.expenses.filter(e => {
      const d = new Date(e.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });

    const stats = {
      totalExpenses: dbState.expenses.length,
      totalAmount: dbState.expenses.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0),
      thisMonthAmount: thisMonth.reduce((s, e) => s + (parseFloat(e.amount) || 0), 0),
      byCategory: {}
    };

    ['Food', 'Transport', 'Study', 'Entertainment'].forEach(cat => {
      stats.byCategory[cat] = thisMonth
        .filter(e => e.category === cat)
        .reduce((s, e) => s + (parseFloat(e.amount) || 0), 0);
    });

    res.json({ success: true, stats });
  });

  app.post('/api/expenses', (req, res) => {
    const amount = parseFloat(req.body.amount) || 0;
    const expense = { 
      ...req.body, 
      amount,
      _id: String(dbState.nextId++), 
      userId: 'demo-user', 
      createdAt: new Date(), 
      date: req.body.date ? new Date(req.body.date) : new Date() 
    };
    dbState.expenses.unshift(expense);
    io.emit('expense:created', expense);
    res.status(201).json({ success: true, expense });
  });

  app.put('/api/expenses/:id', (req, res) => {
    const idx = dbState.expenses.findIndex(e => e._id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, error: 'Not found' });
    const amount = req.body.amount ? parseFloat(req.body.amount) : dbState.expenses[idx].amount;
    dbState.expenses[idx] = { ...dbState.expenses[idx], ...req.body, amount };
    io.emit('expense:updated', dbState.expenses[idx]);
    res.json({ success: true, expense: dbState.expenses[idx] });
  });

  app.delete('/api/expenses/:id', (req, res) => {
    const idx = dbState.expenses.findIndex(e => e._id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, error: 'Not found' });
    dbState.expenses.splice(idx, 1);
    io.emit('expense:deleted', { id: req.params.id });
    res.json({ success: true, message: 'Deleted' });
  });
}

// Socket.io events
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  socket.on('disconnect', () => console.log('🔌 Client disconnected:', socket.id));
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`\n🚀 StudentBudgetAI Server running on port ${PORT}`);
  console.log(`📡 API: http://localhost:${PORT}/api`);
  console.log(`❤️  Health: http://localhost:${PORT}/api/health\n`);
});

module.exports = { app, server };

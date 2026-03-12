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

app.use('/api/auth', authRouter);
app.use('/api/expenses', expensesRouter);
app.use('/api/categorize', categorizeRouter);
app.use('/api/chat', chatRouter);

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

  inMemoryExpenses = sampleData.map(e => ({ ...e, _id: String(nextId++), userId: 'demo-user', createdAt: new Date() }));

  // Override routes with in-memory versions
  app.get('/api/expenses', (req, res) => {
    const totals = {};
    inMemoryExpenses.forEach(e => { totals[e.category] = (totals[e.category] || 0) + e.amount; });
    res.json({ success: true, expenses: inMemoryExpenses.sort((a, b) => new Date(b.date) - new Date(a.date)), totals, count: inMemoryExpenses.length });
  });

  app.post('/api/expenses', (req, res) => {
    const expense = { ...req.body, _id: String(nextId++), userId: 'demo-user', createdAt: new Date(), date: req.body.date ? new Date(req.body.date) : new Date() };
    inMemoryExpenses.unshift(expense);
    io.emit('expense:created', expense);
    res.status(201).json({ success: true, expense });
  });

  app.put('/api/expenses/:id', (req, res) => {
    const idx = inMemoryExpenses.findIndex(e => e._id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, error: 'Not found' });
    inMemoryExpenses[idx] = { ...inMemoryExpenses[idx], ...req.body };
    io.emit('expense:updated', inMemoryExpenses[idx]);
    res.json({ success: true, expense: inMemoryExpenses[idx] });
  });

  app.delete('/api/expenses/:id', (req, res) => {
    const idx = inMemoryExpenses.findIndex(e => e._id === req.params.id);
    if (idx === -1) return res.status(404).json({ success: false, error: 'Not found' });
    inMemoryExpenses.splice(idx, 1);
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

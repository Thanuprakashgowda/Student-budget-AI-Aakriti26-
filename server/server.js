require('dotenv').config();
const express = require('express');
// Socket.io removed for Vercel deployment
const mongoose = require('mongoose');
const cors = require('cors');

const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');

const app = express();
// HTTP server and Socket.io instances removed

/* =========================
   SECURITY MIDDLEWARE
========================= */

app.use(helmet()); // secure HTTP headers
app.use(mongoSanitize()); // prevent MongoDB injection
app.set('trust proxy', 1); // fix express-rate-limit proxy error

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use(limiter);

/* =========================
   NORMAL MIDDLEWARE
========================= */

app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:3001'] }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Removed socket.io context

// In-memory global state for demo mode
const dbState = {
  expenses: [],
  nextId: 1
};

app.set('dbState', dbState);

/* =========================
   DATABASE CONNECTION
========================= */

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/studentbudgetai';

async function connectToData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.warn('⚠️ MongoDB connection failed:', err.message);
    console.log('🔄 Reverting to in-memory fallback for this session');
    setupInMemoryMode();
  }
}

connectToData();

/* =========================
   ROUTES
========================= */

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

/* =========================
   HEALTH CHECK
========================= */

app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    mongodb:
      mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    message: 'StudentBudgetAI API running 🚀'
  });
});

/* =========================
   IN-MEMORY FALLBACK MODE
========================= */

let inMemoryExpenses = [];
let nextId = 1;

function setupInMemoryMode() {
  dbState.expenses = [];
  dbState.nextId = 1;

  app.get('/api/expenses', (req, res) => {
    const totals = {};
    dbState.expenses.forEach((e) => {
      const amt = parseFloat(e.amount) || 0;
      totals[e.category] = (totals[e.category] || 0) + amt;
    });

    res.json({
      success: true,
      expenses: dbState.expenses.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      ),
      totals,
      count: dbState.expenses.length
    });
  });

  app.post('/api/expenses', (req, res) => {
    const amount = parseFloat(req.body.amount) || 0;

    const expense = {
      ...req.body,
      amount,
      _id: String(dbState.nextId++),
      userId: 'demo-user-id',
      createdAt: new Date(),
      date: req.body.date ? new Date(req.body.date) : new Date()
    };

    dbState.expenses.unshift(expense);

    res.status(201).json({
      success: true,
      expense
    });
  });

  app.delete('/api/expenses/:id', (req, res) => {
    const idx = dbState.expenses.findIndex((e) => e._id === req.params.id);

    if (idx === -1)
      return res.status(404).json({
        success: false,
        error: 'Not found'
      });

    dbState.expenses.splice(idx, 1);

    res.json({
      success: true,
      message: 'Deleted'
    });
  });
}

// Socket.io listeners removed

/* =========================
   SERVER START
========================= */

const PORT = process.env.PORT || 5000;

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`\n🚀 StudentBudgetAI Server running locally on port ${PORT}`);
    console.log(`📡 API: http://localhost:${PORT}/api`);
    console.log(`❤️ Health: http://localhost:${PORT}/api/health\n`);
  });
}

// Export the app for Vercel Serverless Functions
module.exports = app;
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'studentbudgetai_secret_key_2026';
const JWT_EXPIRES = '7d';

// In-memory user store fallback (when MongoDB is not connected)
let inMemoryUsers = [];

const getUser = async (email) => {
  try {
    const User = require('../models/User');
    return await User.findOne({ email });
  } catch {
    return inMemoryUsers.find(u => u.email === email) || null;
  }
};

const createUser = async (data) => {
  try {
    const User = require('../models/User');
    const user = new User(data);
    await user.save();
    return user;
  } catch {
    // In-memory fallback with manual bcrypt
    const bcrypt = require('bcryptjs');
    const hashed = await bcrypt.hash(data.password, 10);
    const user = { ...data, password: hashed, _id: `user_${Date.now()}`, createdAt: new Date() };
    inMemoryUsers.push(user);
    const { password: _, ...safe } = user;
    return safe;
  }
};

const signToken = (userId) => jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES });

// ── POST /api/auth/register ──
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, college } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ success: false, error: 'Name, email and password are required' });

    if (password.length < 6)
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });

    const existing = await getUser(email.toLowerCase());
    if (existing)
      return res.status(409).json({ success: false, error: 'Email already registered. Please log in.' });

    const user = await createUser({ name, email: email.toLowerCase(), password, college: college || '' });

    const token = signToken(user._id);
    res.status(201).json({ success: true, token, user });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── POST /api/auth/login ──
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password)
      return res.status(400).json({ success: false, error: 'Email and password are required' });

    // Try MongoDB user
    let user = null;
    let passwordMatch = false;

    try {
      const User = require('../models/User');
      user = await User.findOne({ email: email.toLowerCase() }).select('+password');
      if (user) passwordMatch = await user.matchPassword(password);
    } catch {
      const bcrypt = require('bcryptjs');
      user = inMemoryUsers.find(u => u.email === email.toLowerCase());
      if (user) passwordMatch = await bcrypt.compare(password, user.password);
    }

    // Demo bypass: allow demo@student.com / demo1234
    if (!user && email.toLowerCase() === 'demo@student.com' && password === 'demo1234') {
      const token = signToken('demo-user-id');
      return res.json({
        success: true,
        token,
        user: { _id: 'demo-user-id', name: 'Demo Student', email: 'demo@student.com', college: 'Demo University' }
      });
    }

    if (!user || !passwordMatch)
      return res.status(401).json({ success: false, error: 'Invalid email or password' });

    const token = signToken(user._id);
    const { password: _, ...safeUser } = user.toJSON ? user.toJSON() : user;
    res.json({ success: true, token, user: safeUser });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ── GET /api/auth/me ── (verify token)
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer '))
      return res.status(401).json({ success: false, error: 'No token provided' });

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    // Demo user
    if (decoded.id === 'demo-user-id') {
      return res.json({ success: true, user: { _id: 'demo-user-id', name: 'Demo Student', email: 'demo@student.com', college: 'Demo University' } });
    }

    try {
      const User = require('../models/User');
      const user = await User.findById(decoded.id);
      if (!user) return res.status(404).json({ success: false, error: 'User not found' });
      return res.json({ success: true, user });
    } catch {
      const user = inMemoryUsers.find(u => u._id === decoded.id);
      if (!user) return res.status(404).json({ success: false, error: 'User not found' });
      const { password: _, ...safe } = user;
      return res.json({ success: true, user: safe });
    }
  } catch (err) {
    res.status(401).json({ success: false, error: 'Invalid or expired token' });
  }
});

module.exports = router;

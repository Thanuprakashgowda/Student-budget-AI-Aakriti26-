const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'studentbudgetai_secret_key_2026';

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      
      if (decoded.id === 'demo-user-id') {
        req.user = { _id: 'demo-user-id', isAdmin: false };
        return next();
      }

      const User = require('../models/User');
      const user = await User.findById(decoded.id);
      if (!user) return res.status(401).json({ success: false, error: 'User not found' });
      
      req.user = user;
      return next();
    }
    return res.status(401).json({ success: false, error: 'Unauthorized: No token provided' });
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid token' });
  }
};

module.exports = protect;

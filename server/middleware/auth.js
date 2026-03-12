const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'studentbudgetai_secret_key_2026';

const auth = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      req.userId = decoded.id;
      return next();
    }
    return res.status(401).json({ success: false, error: 'Unauthorized: No token provided' });
  } catch (err) {
    return res.status(401).json({ success: false, error: 'Unauthorized: Invalid token' });
  }
};

module.exports = auth;

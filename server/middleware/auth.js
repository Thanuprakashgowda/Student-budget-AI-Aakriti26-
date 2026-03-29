const protect = async (req, res, next) => {
  // Bypassed for Vercel demo deployment
  // Extracts the generated demo user ID from the Bearer token
  let userId = 'demo-user-id';
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    userId = authHeader.split(' ')[1];
  }

  req.user = { _id: userId, isAdmin: false };
  req.userId = userId;
  return next();
};

module.exports = protect;

const jwt = require('jsonwebtoken');
const dbService = require('./dbService');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretpgfoodtoken123';

/**
 * Middleware to check if user is authenticated (JWT verified)
 */
async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    
    const user = await dbService.getUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Invalid token. User not found.' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

/**
 * Middleware to check if user is admin
 */
async function requireAdmin(req, res, next) {
  // First run the auth middleware
  await requireAuth(req, res, () => {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      res.status(403).json({ error: 'Access denied. Admin role required.' });
    }
  });
}

/**
 * Middleware to optionally attach user to req.user
 */
async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      const user = await dbService.getUserById(decoded.id);
      if (user) {
        req.user = user;
      }
    }
  } catch (error) {
    // Ignore error, just proceed anonymously
  }
  next();
}

module.exports = {
  requireAuth,
  requireAdmin,
  optionalAuth,
  JWT_SECRET
};

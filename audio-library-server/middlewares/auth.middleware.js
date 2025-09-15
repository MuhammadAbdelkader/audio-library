const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      const error = new Error('Access denied. No token provided.');
      error.statusCode = 401;
      return next(error);
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      const error = new Error('Token is valid but user not found.');
      error.statusCode = 401;
      return next(error);
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

const adminMiddleware = (req, res, next) => {
  if (req.user.role !== 'admin') {
    const error = new Error('Access denied. Admin role required.');
    error.statusCode = 403;
    return next(error);
  }
  next();
};

module.exports = { authMiddleware, adminMiddleware };

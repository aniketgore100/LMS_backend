const jwt = require('jsonwebtoken');
const env = require('../config/env');
const User = require('../models/User');
const AppError = require('./error.middleware').AppError;

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Authentication required', 401));
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) return next(new AppError('User not found', 401));

    req.user = user;
    next();
  } catch (err) {
    return next(new AppError('Invalid or expired token', 401));
  }
};

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return next(new AppError('Forbidden: insufficient permissions', 403));
  }
  next();
};

module.exports = { authenticate, authorize };

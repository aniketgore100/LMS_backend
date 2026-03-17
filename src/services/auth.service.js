const jwt = require('jsonwebtoken');
const User = require('../models/User');
const env = require('../config/env');
const { AppError } = require('../middleware/error.middleware');

const generateToken = (id) => jwt.sign({ id }, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN });

const login = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError('Invalid email or password', 401);
  }
  const token = generateToken(user._id);
  return { token, user: user.toJSON() };
};

const getProfile = async (userId) => {
  const user = await User.findById(userId);
  if (!user) throw new AppError('User not found', 404);
  return user;
};

const createUser = async (data) => {
  const user = await User.create(data);
  return user;
};

module.exports = { login, getProfile, createUser };

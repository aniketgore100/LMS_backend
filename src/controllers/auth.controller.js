const authService = require('../services/auth.service');
const { successResponse } = require('../utils/response');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login(email, password);
    successResponse(res, result, 'Login successful');
  } catch (err) {
    next(err);
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user._id);
    successResponse(res, user);
  } catch (err) {
    next(err);
  }
};

module.exports = { login, getProfile };

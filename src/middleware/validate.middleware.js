const { validationResult } = require('express-validator');
const { AppError } = require('./error.middleware');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const messages = errors.array().map((e) => e.msg);
    return next(new AppError(messages[0], 422));
  }
  next();
};

module.exports = { validate };

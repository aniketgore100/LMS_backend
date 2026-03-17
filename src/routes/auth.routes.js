const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { login, getProfile } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { loginValidator } = require('../validators/auth.validator');
const { validate } = require('../middleware/validate.middleware');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts, please try again later' },
});

router.post('/login', loginLimiter, loginValidator, validate, login);
router.get('/profile', authenticate, getProfile);

module.exports = router;

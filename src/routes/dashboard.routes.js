const router = require('express').Router();
const { getMetrics } = require('../controllers/dashboard.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.use(authenticate);
router.get('/metrics', getMetrics);

module.exports = router;

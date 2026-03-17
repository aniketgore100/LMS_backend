const router = require('express').Router();
const ctrl = require('../controllers/payment.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validate.middleware');
const { createPaymentValidator, paymentStatusUpdateValidator } = require('../validators/payment.validator');

router.use(authenticate);

router.get('/', ctrl.getPayments);
router.post('/', createPaymentValidator, validate, ctrl.createPayment);
router.get('/:id', ctrl.getPaymentById);
router.post('/:id/pay', ctrl.markAsPaid);
router.patch('/:id/status', paymentStatusUpdateValidator, validate, ctrl.updatePaymentStatus);

module.exports = router;

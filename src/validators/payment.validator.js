const { body } = require('express-validator');

const createPaymentValidator = [
  body('memberId').isMongoId().withMessage('Valid member ID is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
  body('month')
    .matches(/^\d{4}-\d{2}$/)
    .withMessage('Month must be in YYYY-MM format'),
];

const paymentStatusUpdateValidator = [
  body('status').isIn(['paid', 'due']).withMessage('Status must be paid or due'),
];

module.exports = { createPaymentValidator, paymentStatusUpdateValidator };

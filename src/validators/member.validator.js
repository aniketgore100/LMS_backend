const { body } = require('express-validator');

const memberValidator = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('contactNumber').trim().notEmpty().withMessage('Contact number is required'),
  body('admissionDate').isISO8601().withMessage('Valid admission date required'),
  body('seatType').isIn(['full-time', 'half-time']).withMessage('Seat type must be full-time or half-time'),
  body('seatId').optional({ nullable: true }).isMongoId().withMessage('Invalid seat selection'),
  body('monthlyFee').isFloat({ min: 0 }).withMessage('Monthly fee must be a positive number'),
  body('paymentStatus').optional().isIn(['paid', 'due']).withMessage('Invalid payment status'),
  body('nextPaymentDate').optional().isISO8601().withMessage('Valid next payment date required'),
];

const memberUpdateValidator = [
  body('name').optional().trim().notEmpty().withMessage('Name cannot be empty'),
  body('email').optional().isEmail().normalizeEmail().withMessage('Valid email required'),
  body('contactNumber').optional().trim().notEmpty(),
  body('status').optional().isIn(['ongoing', 'closed']).withMessage('Status must be ongoing or closed'),
  body('paymentStatus').optional().isIn(['paid', 'due']).withMessage('Invalid payment status'),
  body('seatId').optional({ nullable: true }).isMongoId().withMessage('Invalid seat selection'),
  body('seatType').optional().isIn(['full-time', 'half-time']).withMessage('Seat type must be full-time or half-time'),
  body('nextPaymentDate').optional().isISO8601(),
  body('monthlyFee').optional().isFloat({ min: 0 }),
];

module.exports = { memberValidator, memberUpdateValidator };

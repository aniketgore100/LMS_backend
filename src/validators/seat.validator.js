const { body } = require('express-validator');

const seatValidator = [
  body('seatNumber').trim().notEmpty().withMessage('Seat number is required'),
  body('seatType').isIn(['full-time', 'half-time']).withMessage('Seat type must be full-time or half-time'),
];

module.exports = { seatValidator };

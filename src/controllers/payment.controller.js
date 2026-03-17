const paymentService = require('../services/payment.service');
const { successResponse } = require('../utils/response');

const getPayments = async (req, res, next) => {
  try {
    const result = await paymentService.getPayments(req.query);
    successResponse(res, result);
  } catch (err) { next(err); }
};

const getPaymentById = async (req, res, next) => {
  try {
    const payment = await paymentService.getPaymentById(req.params.id);
    successResponse(res, payment);
  } catch (err) { next(err); }
};

const createPayment = async (req, res, next) => {
  try {
    const payment = await paymentService.createPayment(req.body);
    successResponse(res, payment, 'Payment created', 201);
  } catch (err) { next(err); }
};

const markAsPaid = async (req, res, next) => {
  try {
    const payment = await paymentService.markAsPaid(req.params.id);
    successResponse(res, payment, 'Payment marked as paid');
  } catch (err) { next(err); }
};

const updatePaymentStatus = async (req, res, next) => {
  try {
    const payment = await paymentService.updatePaymentStatus(req.params.id, req.body.status);
    successResponse(res, payment, 'Payment status updated');
  } catch (err) { next(err); }
};

module.exports = { getPayments, getPaymentById, createPayment, markAsPaid, updatePaymentStatus };

const path = require('path');
const fs = require('fs');
const PDFDocument = require('pdfkit');
const Payment = require('../models/Payment');
const Member = require('../models/Member');
const { AppError } = require('../middleware/error.middleware');
const { paginate, paginatedResponse } = require('../utils/pagination');
const env = require('../config/env');
const mailService = require('./mail.service');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const escapeRegex = (input = '') => input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getPayments = async (query) => {
  const { page, limit, skip } = paginate(query);
  const filter = {};
  if (query.memberId) filter.memberId = query.memberId;
  if (query.status) {
    filter.status = query.status === 'due' ? { $in: ['due', 'pending'] } : query.status;
  }
  if (query.month) filter.month = query.month;
  if (query.search) {
    const escaped = escapeRegex(String(query.search).trim().slice(0, 100));
    if (!escaped) {
      const [payments, total] = await Promise.all([
        Payment.find(filter).populate('memberId', 'name email contactNumber isDeleted').skip(skip).limit(limit).sort({ createdAt: -1 }),
        Payment.countDocuments(filter),
      ]);
      return paginatedResponse(payments, total, page, limit);
    }
    const searchRegex = new RegExp(escaped, 'i');
    const matchedMembers = await Member.find({
      $or: [
        { name: searchRegex },
        { contactNumber: searchRegex },
        { email: searchRegex },
      ],
    }).select('_id');

    const memberIds = matchedMembers.map((member) => member._id);
    filter.memberId = { $in: memberIds.length > 0 ? memberIds : [null] };
  }

  const [payments, total] = await Promise.all([
    Payment.find(filter).populate('memberId', 'name email contactNumber isDeleted').skip(skip).limit(limit).sort({ createdAt: -1 }),
    Payment.countDocuments(filter),
  ]);
  return paginatedResponse(payments, total, page, limit);
};

const getPaymentById = async (id) => {
  const payment = await Payment.findById(id).populate('memberId', 'name email contactNumber isDeleted');
  if (!payment) throw new AppError('Payment not found', 404);
  return payment;
};

const createPayment = async (data) => {
  const member = await Member.findById(data.memberId);
  if (!member) throw new AppError('Member not found', 404);

  const existing = await Payment.findOne({ memberId: data.memberId, month: data.month });
  if (existing) throw new AppError(`Payment for ${data.month} already exists`, 409);

  const normalizedStatus = data.status === 'pending' ? 'due' : data.status;
  const payment = await Payment.create({
    ...data,
    status: normalizedStatus || 'due',
    amount: data.amount || member.monthlyFee,
    paidAt: normalizedStatus === 'paid' ? new Date() : null,
  });
  await Member.findByIdAndUpdate(data.memberId, { paymentStatus: normalizedStatus || 'due' });
  return payment;
};

const updatePaymentStatus = async (id, status) => {
  const payment = await Payment.findById(id).populate('memberId');
  if (!payment) throw new AppError('Payment not found', 404);

  const normalizedStatus = status === 'pending' ? 'due' : status;
  payment.status = normalizedStatus;
  payment.paidAt = normalizedStatus === 'paid' ? (payment.paidAt || new Date()) : null;
  await payment.save();

  if (payment.memberId?._id) {
    await Member.findByIdAndUpdate(payment.memberId._id, { paymentStatus: normalizedStatus });
  }

  return payment;
};

const markAsPaid = async (id) => {
  const payment = await Payment.findById(id).populate('memberId');
  if (!payment) throw new AppError('Payment not found', 404);
  if (payment.status === 'paid') throw new AppError('Payment is already marked as paid', 400);

  const receiptPath = await generateReceipt(payment);
  payment.status = 'paid';
  payment.paidAt = new Date();
  payment.receiptUrl = receiptPath;
  await payment.save();

  // Update member payment status
  await Member.findByIdAndUpdate(payment.memberId._id, { paymentStatus: 'paid' });

  // Send receipt via email
  try {
    await mailService.sendReceiptEmail(payment.memberId, payment, receiptPath);
  } catch (e) {
    console.error('Failed to send receipt email:', e.message);
  }

  return payment;
};

const generateReceipt = async (payment) => {
  const receiptsDir = path.resolve(env.RECEIPTS_DIR);
  ensureDir(receiptsDir);

  const filename = `receipt_${payment._id}.pdf`;
  const filepath = path.join(receiptsDir, filename);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const stream = fs.createWriteStream(filepath);
    doc.pipe(stream);

    // Header
    doc.fontSize(24).font('Helvetica-Bold').text('PAYMENT RECEIPT', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).font('Helvetica').text(`Receipt #: ${payment._id}`, { align: 'right' });
    doc.text(`Date: ${new Date(payment.paidAt || Date.now()).toLocaleDateString()}`, { align: 'right' });
    doc.moveDown();

    // Member Info
    const member = payment.memberId;
    doc.fontSize(14).font('Helvetica-Bold').text('Member Details');
    doc.fontSize(12).font('Helvetica');
    doc.text(`Name: ${member.name}`);
    doc.text(`Email: ${member.email}`);
    doc.text(`Contact: ${member.contactNumber}`);
    doc.moveDown();

    // Payment Info
    doc.fontSize(14).font('Helvetica-Bold').text('Payment Details');
    doc.fontSize(12).font('Helvetica');
    doc.text(`Month: ${payment.month}`);
    doc.text(`Amount: ₹${payment.amount}`);
    doc.text(`Status: PAID`);
    doc.moveDown(2);

    doc.fontSize(10).text('Thank you for your payment!', { align: 'center' });

    doc.end();
    stream.on('finish', () => resolve(`/${env.RECEIPTS_DIR}/${filename}`));
    stream.on('error', reject);
  });
};

module.exports = { getPayments, getPaymentById, createPayment, markAsPaid, updatePaymentStatus };

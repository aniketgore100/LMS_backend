const mongoose = require('mongoose');
const { MEMBER_STATUS, PAYMENT_STATUS, SEAT_TYPES } = require('../constants');

const memberSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  contactNumber: { type: String, required: true, trim: true },
  admissionDate: { type: Date, required: true },
  memberSince: { type: Date, default: Date.now },
  status: { type: String, enum: Object.values(MEMBER_STATUS), default: MEMBER_STATUS.ONGOING, index: true },
  seatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seat', default: null },
  seatType: { type: String, enum: Object.values(SEAT_TYPES), required: true },
  paymentStatus: { type: String, enum: Object.values(PAYMENT_STATUS), default: PAYMENT_STATUS.DUE, index: true },
  nextPaymentDate: { type: Date, index: true },
  monthlyFee: { type: Number, required: true },
  isDeleted: { type: Boolean, default: false, index: true },
  deletedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Member', memberSchema);

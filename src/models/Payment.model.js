const mongoose = require('mongoose');
const { PAYMENT_RECORD_STATUS } = require('../constants');

const paymentSchema = new mongoose.Schema(
  {
    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    month: {
      type: String, // Format: YYYY-MM
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(PAYMENT_RECORD_STATUS),
      default: PAYMENT_RECORD_STATUS.SUCCESS,
    },
    receiptUrl: {
      type: String,
      default: null,
    },
    receiptEmailSent: {
      type: Boolean,
      default: false,
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

paymentSchema.index({ memberId: 1, month: 1 });
paymentSchema.index({ paidAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);

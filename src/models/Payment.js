const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  memberId: { type: mongoose.Schema.Types.ObjectId, ref: 'Member', required: true },
  amount: { type: Number, required: true },
  month: { type: String, required: true }, // "YYYY-MM"
  status: { type: String, enum: ['paid', 'due', 'pending'], default: 'due' },
  receiptUrl: { type: String, default: null },
  paidAt: { type: Date, default: null },
}, { timestamps: true });

paymentSchema.index({ memberId: 1 });
paymentSchema.index({ month: 1 });

module.exports = mongoose.model('Payment', paymentSchema);

const mongoose = require('mongoose');
const { SEAT_TYPES, SEAT_STATUS } = require('../constants');

const seatSchema = new mongoose.Schema(
  {
    seatNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    seatType: {
      type: String,
      enum: Object.values(SEAT_TYPES),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(SEAT_STATUS),
      default: SEAT_STATUS.VACANT,
      index: true,
    },
    assignedMember: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Member',
      default: null,
    },
  },
  { timestamps: true }
);

seatSchema.index({ seatType: 1, status: 1 });

module.exports = mongoose.model('Seat', seatSchema);

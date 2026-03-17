const Seat = require('../models/Seat');
const Member = require('../models/Member');
const { AppError } = require('../middleware/error.middleware');
const { SEAT_STATUS } = require('../constants');

const createSeat = async (data) => {
  const seat = await Seat.create(data);
  return seat;
};

const getSeatStats = async () => {
  const result = await Seat.aggregate([
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        occupied: { $sum: { $cond: [{ $eq: ['$status', SEAT_STATUS.OCCUPIED] }, 1, 0] } },
        vacant: { $sum: { $cond: [{ $eq: ['$status', SEAT_STATUS.VACANT] }, 1, 0] } },
        fullTime: { $sum: { $cond: [{ $eq: ['$seatType', 'full-time'] }, 1, 0] } },
        halfTime: { $sum: { $cond: [{ $eq: ['$seatType', 'half-time'] }, 1, 0] } },
      },
    },
  ]);

  return result[0] || { total: 0, occupied: 0, vacant: 0, fullTime: 0, halfTime: 0 };
};

const getSeats = async () => {
  return Seat.find().populate('assignedMember', 'name email');
};

const getSeatById = async (id) => {
  const seat = await Seat.findById(id).populate('assignedMember', 'name email');
  if (!seat) throw new AppError('Seat not found', 404);
  return seat;
};

const updateSeat = async (id, data) => {
  const allowed = ['seatNumber', 'seatType'];
  const filteredData = Object.fromEntries(Object.entries(data).filter(([k]) => allowed.includes(k)));
  const existingSeat = await Seat.findById(id);
  if (!existingSeat) throw new AppError('Seat not found', 404);

  if (
    filteredData.seatType &&
    filteredData.seatType !== existingSeat.seatType &&
    existingSeat.status === SEAT_STATUS.OCCUPIED
  ) {
    throw new AppError('Seat type can only be changed for vacant seats', 400);
  }

  const seat = await Seat.findByIdAndUpdate(id, filteredData, { new: true, runValidators: true });
  if (!seat) throw new AppError('Seat not found', 404);

  if (filteredData.seatType && existingSeat.assignedMember && filteredData.seatType !== existingSeat.seatType) {
    await Member.findByIdAndUpdate(existingSeat.assignedMember, { seatType: filteredData.seatType });
  }

  return seat;
};

const deleteSeat = async (id) => {
  const seat = await Seat.findById(id);
  if (!seat) throw new AppError('Seat not found', 404);
  if (seat.status === SEAT_STATUS.OCCUPIED) throw new AppError('Cannot delete an occupied seat', 400);
  await seat.deleteOne();
};

const assignMember = async (seatId, memberId) => {
  const seat = await Seat.findById(seatId);
  if (!seat) throw new AppError('Seat not found', 404);
  if (seat.status === SEAT_STATUS.OCCUPIED && String(seat.assignedMember) !== String(memberId)) {
    throw new AppError('Seat is already occupied', 400);
  }

  const member = await Member.findById(memberId);
  if (!member) throw new AppError('Member not found', 404);
  if (member.status !== 'ongoing') throw new AppError('Only ongoing members can be assigned', 400);

  if (member.seatId && String(member.seatId) !== String(seat._id)) {
    await Seat.findByIdAndUpdate(member.seatId, {
      status: SEAT_STATUS.VACANT,
      assignedMember: null,
    });
  }

  seat.status = SEAT_STATUS.OCCUPIED;
  seat.assignedMember = memberId;
  await seat.save();

  member.seatId = seatId;
  member.seatType = seat.seatType;
  await member.save();

  return seat.populate('assignedMember', 'name email');
};

const releaseSeat = async (seatId) => {
  const seat = await Seat.findById(seatId);
  if (!seat) throw new AppError('Seat not found', 404);

  if (seat.assignedMember) {
    await Member.findByIdAndUpdate(seat.assignedMember, { seatId: null });
  }

  seat.status = SEAT_STATUS.VACANT;
  seat.assignedMember = null;
  await seat.save();
  return seat;
};

module.exports = { createSeat, getSeatStats, getSeats, getSeatById, updateSeat, deleteSeat, assignMember, releaseSeat };

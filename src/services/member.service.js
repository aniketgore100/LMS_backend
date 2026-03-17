const Member = require('../models/Member');
const Seat = require('../models/Seat');
const Payment = require('../models/Payment');
const { AppError } = require('../middleware/error.middleware');
const { MEMBER_STATUS, SEAT_STATUS, PAYMENT_STATUS } = require('../constants');
const { paginate, paginatedResponse } = require('../utils/pagination');
const { buildMemberFilter } = require('../utils/filter');

const addOneMonth = (inputDate) => {
  const date = new Date(inputDate);
  if (Number.isNaN(date.getTime())) return null;
  const next = new Date(date);
  next.setMonth(next.getMonth() + 1);
  return next;
};

const monthFromDate = (inputDate) => {
  const date = new Date(inputDate);
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 7);
  return date.toISOString().slice(0, 7);
};

const syncMemberPaymentRecord = async (member, paymentStatus, monthlyFee, admissionDate) => {
  if (!paymentStatus) return;

  const month = monthFromDate(admissionDate || member.admissionDate || new Date());
  const normalizedStatus = paymentStatus === 'pending' ? 'due' : paymentStatus;

  await Payment.findOneAndUpdate(
    { memberId: member._id, month },
    {
      memberId: member._id,
      month,
      amount: typeof monthlyFee === 'number' ? monthlyFee : (member.monthlyFee || 0),
      status: normalizedStatus,
      paidAt: normalizedStatus === 'paid' ? new Date() : null,
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
};

const assignSeatToMember = async (member, seatId) => {
  if (!seatId) {
    if (member.seatId) {
      await Seat.findByIdAndUpdate(member.seatId, {
        status: SEAT_STATUS.VACANT,
        assignedMember: null,
      });
      member.seatId = null;
    }
    return;
  }

  const seat = await Seat.findById(seatId);
  if (!seat) throw new AppError('Seat not found', 404);

  if (seat.assignedMember && String(seat.assignedMember) !== String(member._id)) {
    throw new AppError('Selected seat is already occupied', 400);
  }

  if (member.seatId && String(member.seatId) !== String(seat._id)) {
    await Seat.findByIdAndUpdate(member.seatId, {
      status: SEAT_STATUS.VACANT,
      assignedMember: null,
    });
  }

  seat.status = SEAT_STATUS.OCCUPIED;
  seat.assignedMember = member._id;
  await seat.save();

  member.seatId = seat._id;
  member.seatType = seat.seatType;
};

const createMember = async (data) => {
  const payload = { ...data };
  if (payload.admissionDate && !payload.nextPaymentDate) {
    payload.nextPaymentDate = addOneMonth(payload.admissionDate);
  }

  if ((payload.status || MEMBER_STATUS.ONGOING) === MEMBER_STATUS.ONGOING && payload.seatType && !payload.seatId) {
    throw new AppError('Please select a seat number for the selected seat type', 400);
  }

  const seatId = payload.seatId || null;
  if (seatId) {
    const seat = await Seat.findById(seatId);
    if (!seat) throw new AppError('Seat not found', 404);
    if (payload.seatType && seat.seatType !== payload.seatType) {
      throw new AppError('Selected seat does not match selected seat type', 400);
    }
    payload.seatType = seat.seatType;
  }

  const member = await Member.create({ ...payload, seatId: null });
  if (seatId) {
    await assignSeatToMember(member, seatId);
    await member.save();
  }

  await syncMemberPaymentRecord(member, payload.paymentStatus, payload.monthlyFee, payload.admissionDate);
  return member.populate('seatId', 'seatNumber seatType status');
};

const getMembers = async (query) => {
  const { page, limit, skip } = paginate(query);
  const filter = { isDeleted: { $ne: true }, ...buildMemberFilter(query) };

  const [members, total] = await Promise.all([
    Member.find(filter).populate('seatId', 'seatNumber seatType').skip(skip).limit(limit).sort({ createdAt: -1 }),
    Member.countDocuments(filter),
  ]);

  return paginatedResponse(members, total, page, limit);
};

const getMemberById = async (id) => {
  const member = await Member.findOne({ _id: id, isDeleted: { $ne: true } }).populate('seatId', 'seatNumber seatType status');
  if (!member) throw new AppError('Member not found', 404);
  return member;
};

const updateMember = async (id, data) => {
  const member = await Member.findOne({ _id: id, isDeleted: { $ne: true } });
  if (!member) throw new AppError('Member not found', 404);

  const payload = { ...data };
  if (payload.admissionDate && !payload.nextPaymentDate) {
    payload.nextPaymentDate = addOneMonth(payload.admissionDate);
  }
  const seatIdWasProvided = Object.prototype.hasOwnProperty.call(payload, 'seatId');
  const requestedSeatId = payload.seatId || null;
  const nextMemberStatus = payload.status || member.status;
  if (nextMemberStatus === MEMBER_STATUS.ONGOING && payload.seatType && seatIdWasProvided && !requestedSeatId) {
    throw new AppError('Please select a seat number for the selected seat type', 400);
  }
  if (seatIdWasProvided && requestedSeatId) {
    const requestedSeat = await Seat.findById(requestedSeatId);
    if (!requestedSeat) throw new AppError('Seat not found', 404);
    if (payload.seatType && requestedSeat.seatType !== payload.seatType) {
      throw new AppError('Selected seat does not match selected seat type', 400);
    }
    payload.seatType = requestedSeat.seatType;
  }

  const nextPaymentStatus = payload.paymentStatus || member.paymentStatus;
  if (
    payload.seatType &&
    payload.seatType !== member.seatType &&
    nextMemberStatus === MEMBER_STATUS.ONGOING &&
    nextPaymentStatus !== PAYMENT_STATUS.PAID
  ) {
    throw new AppError('Please pay the previous amount before changing seat type', 400);
  }

  delete payload.seatId;

  Object.assign(member, payload);

  // If status becomes closed, release assigned seat.
  if (member.status === MEMBER_STATUS.CLOSED) {
    await assignSeatToMember(member, null);
  } else if (seatIdWasProvided) {
    await assignSeatToMember(member, requestedSeatId);
  }

  await member.save();
  await syncMemberPaymentRecord(member, payload.paymentStatus, payload.monthlyFee, payload.admissionDate);
  return member.populate('seatId', 'seatNumber seatType status');
};

const deleteMember = async (id) => {
  const member = await Member.findOne({ _id: id, isDeleted: { $ne: true } });
  if (!member) throw new AppError('Member not found', 404);

  await assignSeatToMember(member, null);
  member.status = MEMBER_STATUS.CLOSED;
  member.isDeleted = true;
  member.deletedAt = new Date();
  await member.save();
};

module.exports = { createMember, getMembers, getMemberById, updateMember, deleteMember };

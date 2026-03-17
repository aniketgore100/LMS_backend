const Seat = require('../models/Seat');
const Member = require('../models/Member');
const Payment = require('../models/Payment');

const getMetrics = async () => {
  const [seatStats, memberStats, revenueData, growthData] = await Promise.all([
    getSeatStats(),
    getMemberStats(),
    getMonthlyRevenue(),
    getDailyGrowth(),
  ]);

  return { ...seatStats, ...memberStats, revenueData, growthData };
};

const getSeatStats = async () => {
  const result = await Seat.aggregate([
    {
      $group: {
        _id: null,
        totalSeats: { $sum: 1 },
        fullTimeSeats: { $sum: { $cond: [{ $eq: ['$seatType', 'full-time'] }, 1, 0] } },
        halfTimeSeats: { $sum: { $cond: [{ $eq: ['$seatType', 'half-time'] }, 1, 0] } },
        occupiedSeats: { $sum: { $cond: [{ $eq: ['$status', 'occupied'] }, 1, 0] } },
        vacantSeats: { $sum: { $cond: [{ $eq: ['$status', 'vacant'] }, 1, 0] } },
      },
    },
  ]);

  return result[0] || { totalSeats: 0, fullTimeSeats: 0, halfTimeSeats: 0, occupiedSeats: 0, vacantSeats: 0 };
};

const getMemberStats = async () => {
  const result = await Member.aggregate([
    {
      $group: {
        _id: null,
        activeMembers: { $sum: { $cond: [{ $eq: ['$status', 'ongoing'] }, 1, 0] } },
        closedMembers: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
        duePayments: { $sum: { $cond: [{ $eq: ['$paymentStatus', 'due'] }, 1, 0] } },
      },
    },
  ]);

  return result[0] || { activeMembers: 0, closedMembers: 0, duePayments: 0 };
};

const getMonthlyRevenue = async () => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  return Payment.aggregate([
    { $match: { status: 'paid', paidAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { $substr: ['$month', 0, 7] },
        revenue: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, month: '$_id', revenue: 1, count: 1 } },
  ]);
};

const getDailyGrowth = async () => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  return Member.aggregate([
    { $match: { createdAt: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
        },
        newMembers: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } },
    {
      $project: {
        _id: 0,
        day: {
          $concat: [
            { $toString: '$_id.year' }, '-',
            { $cond: [{ $lt: ['$_id.month', 10] }, { $concat: ['0', { $toString: '$_id.month' }] }, { $toString: '$_id.month' }] },
            '-',
            { $cond: [{ $lt: ['$_id.day', 10] }, { $concat: ['0', { $toString: '$_id.day' }] }, { $toString: '$_id.day' }] },
          ],
        },
        newMembers: 1,
      },
    },
  ]);
};

module.exports = { getMetrics };

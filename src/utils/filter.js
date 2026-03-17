const escapeRegex = (input = '') => input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const buildMemberFilter = (query) => {
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.paymentStatus) filter.paymentStatus = query.paymentStatus;
  if (query.seatType) filter.seatType = query.seatType;
  if (query.search) {
    const search = escapeRegex(String(query.search).trim().slice(0, 100));
    if (!search) return filter;
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { contactNumber: { $regex: search, $options: 'i' } },
    ];
  }
  return filter;
};

module.exports = { buildMemberFilter };

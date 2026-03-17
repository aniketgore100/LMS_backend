const seatService = require('../services/seat.service');
const { successResponse } = require('../utils/response');

const createSeat = async (req, res, next) => {
  try {
    const seat = await seatService.createSeat(req.body);
    successResponse(res, seat, 'Seat created', 201);
  } catch (err) { next(err); }
};

const getSeatStats = async (req, res, next) => {
  try {
    const stats = await seatService.getSeatStats();
    successResponse(res, stats);
  } catch (err) { next(err); }
};

const getSeats = async (req, res, next) => {
  try {
    const seats = await seatService.getSeats();
    successResponse(res, seats);
  } catch (err) { next(err); }
};

const getSeatById = async (req, res, next) => {
  try {
    const seat = await seatService.getSeatById(req.params.id);
    successResponse(res, seat);
  } catch (err) { next(err); }
};

const updateSeat = async (req, res, next) => {
  try {
    const seat = await seatService.updateSeat(req.params.id, req.body);
    successResponse(res, seat, 'Seat updated');
  } catch (err) { next(err); }
};

const deleteSeat = async (req, res, next) => {
  try {
    await seatService.deleteSeat(req.params.id);
    successResponse(res, null, 'Seat deleted');
  } catch (err) { next(err); }
};

const assignMember = async (req, res, next) => {
  try {
    const seat = await seatService.assignMember(req.params.id, req.body.memberId);
    successResponse(res, seat, 'Member assigned to seat');
  } catch (err) { next(err); }
};

const releaseSeat = async (req, res, next) => {
  try {
    const seat = await seatService.releaseSeat(req.params.id);
    successResponse(res, seat, 'Seat released');
  } catch (err) { next(err); }
};

module.exports = { createSeat, getSeatStats, getSeats, getSeatById, updateSeat, deleteSeat, assignMember, releaseSeat };

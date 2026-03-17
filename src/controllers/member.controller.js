const memberService = require('../services/member.service');
const csvService = require('../services/csv.service');
const { successResponse } = require('../utils/response');

const createMember = async (req, res, next) => {
  try {
    const member = await memberService.createMember(req.body);
    successResponse(res, member, 'Member created', 201);
  } catch (err) { next(err); }
};

const getMembers = async (req, res, next) => {
  try {
    const result = await memberService.getMembers(req.query);
    successResponse(res, result);
  } catch (err) { next(err); }
};

const getMemberById = async (req, res, next) => {
  try {
    const member = await memberService.getMemberById(req.params.id);
    successResponse(res, member);
  } catch (err) { next(err); }
};

const updateMember = async (req, res, next) => {
  try {
    const member = await memberService.updateMember(req.params.id, req.body);
    successResponse(res, member, 'Member updated');
  } catch (err) { next(err); }
};

const deleteMember = async (req, res, next) => {
  try {
    await memberService.deleteMember(req.params.id);
    successResponse(res, null, 'Member deleted');
  } catch (err) { next(err); }
};

const previewCSV = async (req, res, next) => {
  try {
    if (!req.file) throw new Error('CSV file is required');
    const { preview, total } = await csvService.processCSV(req.file.buffer);
    successResponse(res, { preview, total });
  } catch (err) { next(err); }
};

const importCSV = async (req, res, next) => {
  try {
    if (!req.file) throw new Error('CSV file is required');
    const { rows } = await csvService.processCSV(req.file.buffer);
    const result = await csvService.bulkInsertMembers(rows);
    successResponse(res, result, `Imported ${result.success} members`);
  } catch (err) { next(err); }
};

module.exports = { createMember, getMembers, getMemberById, updateMember, deleteMember, previewCSV, importCSV };

const dashboardService = require('../services/dashboard.service');
const { successResponse } = require('../utils/response');

const getMetrics = async (req, res, next) => {
  try {
    const metrics = await dashboardService.getMetrics();
    successResponse(res, metrics);
  } catch (err) { next(err); }
};

module.exports = { getMetrics };

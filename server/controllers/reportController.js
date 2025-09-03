import { reportService } from '../services/reportService.js';
import { catchAsync, successResponse } from '../utils/helpers.js';

// Get profit & loss report
export const getProfitLoss = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  const report = await reportService.generateProfitLossReport(startDate, endDate);
  successResponse(res, 200, report);
});

// Get inventory valuation
export const getInventoryValuation = catchAsync(async (req, res) => {
  const report = await reportService.generateInventoryValuation();
  successResponse(res, 200, report);
});

// Get sales by product
export const getSalesByProduct = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;
  const summary = await reportService.generateSalesByProduct(startDate, endDate);
  successResponse(res, 200, summary);
});
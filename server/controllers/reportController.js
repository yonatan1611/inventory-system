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

// Get sales by month
export const getSalesByMonth = catchAsync(async (req, res) => {
  const data = await reportService.generateSalesByMonth();
  successResponse(res, 200, data);
});

// Get inventory categories
export const getInventoryCategories = catchAsync(async (req, res) => {
  const data = await reportService.generateInventoryCategories();
  successResponse(res, 200, data);
});
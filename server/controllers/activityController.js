// src/controllers/activityController.js
import { activityService } from '../services/activityService.js';
import { catchAsync, successResponse } from '../utils/helpers.js';

export const getActivities = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  
  const result = await activityService.getAllActivities(page, limit);
  successResponse(res, 200, result);
});

export const getProductActivities = catchAsync(async (req, res) => {
  const { productId } = req.params;
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  
  const result = await activityService.getActivitiesByProduct(parseInt(productId), page, limit);
  successResponse(res, 200, result);
});
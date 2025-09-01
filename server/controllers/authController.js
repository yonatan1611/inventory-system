import { authService } from '../services/authService.js';
import { catchAsync, successResponse } from '../utils/helpers.js';

// Register admin user
export const setupAdmin = catchAsync(async (req, res) => {
  const { username, password } = req.body;
  
  const result = await authService.setupAdmin(username, password);
  successResponse(res, 201, null, result.message);
});

// Login
export const login = catchAsync(async (req, res) => {
  const { username, password } = req.body;
  
  const result = await authService.login(username, password);
  successResponse(res, 200, result, 'Login successful');
});
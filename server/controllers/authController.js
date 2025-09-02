import { authService } from '../services/authService.js';
import { catchAsync, successResponse } from '../utils/helpers.js';
import { User } from '../models/index.js'; // Adjust path and name as needed
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { APIError } from '../utils/helpers.js';
const JWT_SECRET = process.env.JWT_SECRET;

// Register admin user
export const setupAdmin = catchAsync(async (req, res) => {
  const { username, password } = req.body;
  
  const result = await authService.setupAdmin(username, password);
  successResponse(res, 201, null, result.message);
});

// Login
export const login = catchAsync(async (req, res) => {
  const { username, password } = req.body;
  
  // Find user
  const user = await User.findByUsername(username);
  if (!user) {
    throw new APIError('Invalid credentials', 401);
  }
  
  // Check password
  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    throw new APIError('Invalid credentials', 401);
  }
  
  // Generate token with longer expiration (e.g., 7 days)
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
  
  res.json({ 
    success: true,
    token,
    message: 'Login successful'
  });
});
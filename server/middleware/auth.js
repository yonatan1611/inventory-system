import { authService } from '../services/authService.js';
import { errorResponse } from '../utils/helpers.js';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return errorResponse(res, 401, 'Access token required');
  }

  try {
    const decoded = authService.verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    return errorResponse(res, 403, err.message);
  }
};
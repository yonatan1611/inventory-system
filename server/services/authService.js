import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/index.js';
import { APIError } from '../utils/helpers.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export const authService = {
  setupAdmin: async (username, password) => {
    // Check if admin user already exists
    const existingUser = await User.findFirst();
    if (existingUser) {
      throw new APIError('Admin user already exists', 400);
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Create admin user
    await User.create({
      username,
      password: hashedPassword
    });
    
    return { message: 'Admin user created successfully' };
  },

  login: async (username, password) => {
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
    
    // Generate token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '24h' });
    
    return { token };
  },

  verifyToken: (token) => {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (err) {
      throw new APIError('Invalid or expired token', 403);
    }
  }
};
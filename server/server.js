// server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productsRouter from './routes/products.js';
import transactionsRouter from './routes/transactions.js';
import reportsRouter from './routes/reports.js';
import authRouter from './routes/auth.js';
import activityRouter from './routes/activity.js';
import { authenticateToken } from './middleware/auth.js';

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Public routes
app.use('/api/auth', authRouter);

// Protected routes
app.use('/api/activity', authenticateToken, activityRouter);
app.use('/api/products', authenticateToken, productsRouter);
app.use('/api/transactions', authenticateToken, transactionsRouter);
app.use('/api/reports', authenticateToken, reportsRouter);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  if (err.isOperational) {
    return res.status(err.statusCode || 500).json({
      success: false,
      message: err.message
    });
  }
  
  // Generic error response for unhandled errors
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
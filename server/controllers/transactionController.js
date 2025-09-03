import { transactionService } from '../services/transactionService.js';
import { catchAsync, successResponse } from '../utils/helpers.js';
import { Product } from '../models/index.js';

// Get all transactions
export const getTransactions = catchAsync(async (req, res) => {
  const transactions = await transactionService.getAllTransactions();
  successResponse(res, 200, transactions);
});

// Create transaction
export const createTransaction = catchAsync(async (req, res) => {
  const { type, productId, quantity, notes } = req.body;
  
  const transaction = await transactionService.createTransaction({
    type,
    productId: parseInt(productId),
    quantity: parseInt(quantity),
    notes
  });
  
  successResponse(res, 201, transaction, 'Transaction recorded successfully');
});

export const sellProduct = catchAsync(async (req, res) => {
  const { productId, quantity } = req.body;
  const product = await Product.findById(productId);

  if (!product) {
    throw new APIError('Product not found', 404);
  }
  if (product.quantity < quantity) {
    throw new APIError('Insufficient stock', 400);
  }

  const profit = (product.sellingPrice - product.costPrice) * quantity;

  const transaction = await transactionService.createTransaction({
    type: 'SALE',
    productId,
    quantity,
    notes: `Profit: ${profit}`,
  });

  successResponse(res, 201, { transaction, profit }, 'Product sold and profit recorded');
});
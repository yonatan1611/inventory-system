import { transactionService } from '../services/transactionService.js';
import { activityService } from '../services/activityService.js';
import { catchAsync, successResponse } from '../utils/helpers.js';
import { prisma } from '../prismaClient.js'; // <-- use your prisma client

// Get all transactions
export const getTransactions = catchAsync(async (req, res) => {
  const transactions = await transactionService.getAllTransactions();
  successResponse(res, 200, transactions);
});

// Create transaction
export const createTransaction = catchAsync(async (req, res) => {
  const { type, productId, quantity, notes } = req.body;

  if (!productId || isNaN(productId)) {
    return res.status(400).json({ message: 'Valid productId is required' });
  }

  const transaction = await transactionService.createTransaction({
    type,
    productId: Number(productId),
    quantity: Number(quantity),
    notes,
  });

  successResponse(res, 201, transaction, 'Transaction recorded successfully');
});

// controllers/transactionController.js
export const sellProduct = catchAsync(async (req, res) => {
  const { productId, quantity, discount = 0 } = req.body;

  if (!productId || isNaN(productId)) {
    return res.status(400).json({ message: 'Valid productId is required' });
  }

  const product = await prisma.product.findUnique({
    where: { id: Number(productId) },
  });

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  if (product.quantity < quantity) {
    return res.status(400).json({ message: 'Insufficient stock' });
  }

  // Calculate discounted price and profit
  const discountedPrice = product.sellingPrice * (1 - discount / 100);
  const profit = (discountedPrice - product.costPrice) * Number(quantity);

  // Record transaction
  const transaction = await prisma.transaction.create({
    data: {
      type: 'SALE',
      productId: Number(productId),
      quantity: Number(quantity),
      notes: `Sold with ${discount}% discount. Profit: $${profit.toFixed(2)}`,
    },
  });

  // Update product stock
  await prisma.product.update({
    where: { id: Number(productId) },
    data: { quantity: product.quantity - Number(quantity) },
  });

  successResponse(
    res,
    201,
    { transaction, profit },
    'Product sold successfully'
  );

  await activityService.createActivity(
  'SELL_PRODUCT',
  `Sold ${quantity} units of ${product.name}. Profit: $${profit.toFixed(2)}`,
  req.user.id,
  product.id
);
});

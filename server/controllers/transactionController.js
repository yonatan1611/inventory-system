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
  const { variantId, quantity } = req.body;

  if (!variantId || isNaN(variantId)) {
    return res.status(400).json({ message: 'Valid variantId is required' });
  }

  // Get the variant
  const variant = await prisma.productVariant.findUnique({
    where: { id: Number(variantId) },
    include: {
      product: true
    }
  });

  if (!variant) {
    return res.status(404).json({ message: 'Variant not found' });
  }

  if (variant.quantity < quantity) {
    return res.status(400).json({ message: 'Insufficient stock' });
  }

  // Calculate profit
  const profit = (variant.sellingPrice - variant.costPrice) * Number(quantity);

  // Record transaction
  const transaction = await prisma.transaction.create({
    data: {
      type: 'SALE',
      productId: variant.productId,
      quantity: Number(quantity),
      notes: `Sold variant: ${variant.sku}. Profit: $${profit.toFixed(2)}`
    }
  });

  // Update variant stock
  await prisma.productVariant.update({
    where: { id: Number(variantId) },
    data: { quantity: variant.quantity - Number(quantity) }
  });

  // Log activity
  await activityService.createActivity(
    'SELL_PRODUCT',
    `Sold ${quantity} units of variant: ${variant.sku}. Profit: $${profit.toFixed(2)}`,
    req.user.userId,
    variant.productId
  );

  successResponse(
    res,
    201,
    { transaction, profit },
    'Product sold and profit recorded'
  );
});

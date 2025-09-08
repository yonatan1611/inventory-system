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
// Updated createTransaction in transactionController.js
// Updated createTransaction in transactionController.js
// In transactionController.js
export const createTransaction = catchAsync(async (req, res) => {
  const { type, productId, variantId, quantity, notes, discount, discountType } = req.body;

  if (!productId || isNaN(productId)) {
    return res.status(400).json({ message: 'Valid productId is required' });
  }

  if (!variantId || isNaN(variantId)) {
    return res.status(400).json({ message: 'Valid variantId is required' });
  }

  const transaction = await transactionService.createTransaction({
    type,
    productId: Number(productId),
    variantId: Number(variantId), // Add variantId
    quantity: Number(quantity),
    notes,
    discount: discount || 0,
    discountType: discountType || 'fixed'
  });

  successResponse(res, 201, transaction, 'Transaction recorded successfully');
});

// Updated sellProduct in transactionController.js
export const sellProduct = catchAsync(async (req, res) => {
  const { variantId, quantity, discount, discountType } = req.body;

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

  // Apply discount to calculate final price
  let finalPrice = variant.sellingPrice;
  if (discount) {
    if (discountType === 'percentage') {
      finalPrice = finalPrice * (1 - discount / 100);
    } else {
      finalPrice = finalPrice - discount;
    }
    finalPrice = Math.max(0, finalPrice); // Ensure non-negative price
  }

  // Calculate profit
  const profit = (finalPrice - variant.costPrice) * Number(quantity);

  // Record transaction
  const transaction = await prisma.transaction.create({
    data: {
      type: 'SALE',
      productId: variant.productId,
      quantity: Number(quantity),
      discount: discount || 0,
      discountType: discountType || 'fixed',
      notes: `Profit: ${profit.toFixed(2)} Birr`
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
    `Profit: ${profit.toFixed(2)} Birr`,
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
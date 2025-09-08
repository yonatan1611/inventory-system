// server/controllers/transactionController.js
import { transactionService } from '../services/transactionService.js';
import { activityService } from '../services/activityService.js';
import { productService } from '../services/productService.js';
import { catchAsync, successResponse } from '../utils/helpers.js';

// Create transaction
export const createTransaction = catchAsync(async (req, res) => {
  const { type, productId, variantId, quantity, discount, discountType, notes } = req.body;
  
  const transaction = await transactionService.createTransaction({
    type,
    productId,
    variantId,
    quantity,
    discount,
    discountType,
    notes
  });

  // If this is a REFILL transaction, update the inventory
  if (type === 'REFILL' && variantId) {
    try {
      const variant = await productService.getProductVariantById(variantId);
      await productService.updateVariantStock(
        variantId, 
        variant.quantity + parseInt(quantity)
      );
    } catch (error) {
      console.error('Error updating inventory during refill:', error);
      // We don't throw an error here as the transaction was already created
    }
  }

  // Log activity
  await activityService.createActivity(
    type === 'SALE' ? 'SALE' : 'REFILL',
    `Created ${type.toLowerCase()} transaction for product ID: ${productId}`,
    req.user.userId,
    parseInt(productId)
  );

  successResponse(res, 201, transaction, 'Transaction created successfully');
});

// Get all transactions
export const getTransactions = catchAsync(async (req, res) => {
  const { startDate, endDate } = req.query;
  
  let transactions;
  if (startDate && endDate) {
    transactions = await transactionService.getTransactionsByDateRange(startDate, endDate);
  } else {
    transactions = await transactionService.getAllTransactions();
  }
  
  successResponse(res, 200, transactions);
});

// Get transaction by ID
export const getTransaction = catchAsync(async (req, res) => {
  const { id } = req.params;
  const transaction = await transactionService.getTransactionById(id);
  successResponse(res, 200, transaction);
});

// Delete transaction
export const deleteTransaction = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await transactionService.deleteTransaction(id);
  
  // Log activity
  await activityService.createActivity(
    'DELETE_TRANSACTION',
    `Deleted transaction ID: ${id}`,
    req.user.userId,
    null
  );
  
  successResponse(res, 200, null, result.message || 'Transaction deleted successfully');
});

// Sell product
export const sellProduct = catchAsync(async (req, res) => {
  const { variantId, quantity, discount, discountType } = req.body;

  if (!variantId || isNaN(variantId)) {
    return res.status(400).json({ message: 'Valid variantId is required' });
  }

  // Get the variant using the product service
  const variant = await productService.getProductVariantById(variantId);

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

  // Record transaction using transaction service
  const transaction = await transactionService.createTransaction({
    type: 'SALE',
    productId: variant.productId,
    variantId: variantId,
    quantity: Number(quantity),
    discount: discount || 0,
    discountType: discountType || 'fixed',
    notes: `Profit: ${profit.toFixed(2)} Birr`
  });

  // Update variant stock using product service
  await productService.updateVariantStock(
    variantId, 
    variant.quantity - Number(quantity)
  );

  // Log activity
  await activityService.createActivity(
    'SELL_PRODUCT',
    `Sold ${quantity} units of variant ${variantId}. Profit: ${profit.toFixed(2)} Birr`,
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

// Refill product
export const refillProduct = catchAsync(async (req, res) => {
  const { variantId, quantity } = req.body;

  if (!variantId || isNaN(variantId)) {
    return res.status(400).json({ message: 'Valid variantId is required' });
  }

  // Get the variant using the product service
  const variant = await productService.getProductVariantById(variantId);

  // Record transaction using transaction service
  const transaction = await transactionService.createTransaction({
    type: 'REFILL',
    productId: variant.productId,
    variantId: variantId,
    quantity: Number(quantity),
    discount: 0,
    discountType: 'fixed',
    notes: `Refilled ${quantity} units`
  });

  // Update variant stock using product service
  await productService.updateVariantStock(
    variantId, 
    variant.quantity + Number(quantity)
  );

  // Log activity
  await activityService.createActivity(
    'REFILL_PRODUCT',
    `Refilled ${quantity} units of variant ${variantId}`,
    req.user.userId,
    variant.productId
  );

  successResponse(
    res,
    201,
    { transaction },
    'Product refilled successfully'
  );
});
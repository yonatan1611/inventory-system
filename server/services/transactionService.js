// server/services/transactionService.js
import { Transaction, ProductVariant } from '../models/index.js';
import { APIError } from '../utils/helpers.js';

export const transactionService = {
  createTransaction: async (transactionData) => {
    const { type, productId, variantId, quantity, discount, discountType, notes } = transactionData;

    // Validate required fields
    if (!type || !productId || !quantity) {
      throw new APIError('Type, productId, and quantity are required', 400);
    }

    // Check if variant exists if provided
    if (variantId) {
      const variant = await ProductVariant.findById(variantId);
      if (!variant) {
        throw new APIError('Variant not found', 404);
      }
    }

    // Create the transaction
    const transaction = await Transaction.create({
      type,
      productId: parseInt(productId),
      variantId: variantId ? parseInt(variantId) : null,
      quantity: parseInt(quantity),
      discount: discount ? parseFloat(discount) : 0,
      discountType: discountType || 'fixed',
      notes: notes || null,
      date: new Date() // Ensure we set the current date
    });

    return transaction;
  },

  getAllTransactions: async () => {
    return await Transaction.findAll();
  },

  getTransactionsByDateRange: async (startDate, endDate) => {
    return await Transaction.findByDateRange(startDate, endDate);
  },

  getTransactionById: async (id) => {
    const transaction = await Transaction.findById(id);
    
    if (!transaction) {
      throw new APIError('Transaction not found', 404);
    }
    
    return transaction;
  },

  deleteTransaction: async (id) => {
    const transaction = await Transaction.findById(id);
    
    if (!transaction) {
      throw new APIError('Transaction not found', 404);
    }
    
    await Transaction.delete(id);
    
    return { message: 'Transaction deleted successfully' };
  }
};
// server/services/transactionService.js
import { Transaction, Product, ProductVariant } from '../models/index.js'; // Import ProductVariant
import { APIError } from '../utils/helpers.js';

export const transactionService = {
  getAllTransactions: async () => {
    return await Transaction.findAll();
  },

  createTransaction: async (transactionData) => {
  const { type, productId, variantId, quantity, discount, discountType } = transactionData;
  
  // Get the product
  const product = await Product.findById(productId);
  if (!product) {
    throw new APIError('Product not found', 404);
  }
  
  // Get the variant if variantId is provided
  let variant = null;
  if (variantId) {
    variant = await ProductVariant.findById(variantId);
    if (!variant) {
      throw new APIError('Variant not found', 404);
    }
  }
  
  // Update quantity based on transaction type
  if (variantId) {
    // Handle variant transactions
    let newQuantity = variant.quantity;
    
    if (type === 'PURCHASE' || type === 'REFILL') {
      newQuantity += parseInt(quantity);
    } else if (type === 'SALE') {
      if (parseInt(quantity) > variant.quantity) {
        throw new APIError('Insufficient stock', 400);
      }
      newQuantity -= parseInt(quantity);
    } else if (type === 'ADJUSTMENT') {
      newQuantity = parseInt(quantity);
    } else {
      throw new APIError('Invalid transaction type', 400);
    }
    
    // Create the transaction
    const transaction = await Transaction.create({
      ...transactionData,
      discount: discount !== undefined ? parseFloat(discount) : 0,
      discountType: discountType || 'fixed'
    });
    
    // Update the variant quantity
    await ProductVariant.update(variantId, { quantity: newQuantity });
    
    return transaction;
  } else {
    // Handle product transactions (if you still need this)
    // This would be for products without variants
    throw new APIError('Variant ID is required', 400);
  }
},

  getTransactionsByDateRange: async (startDate, endDate) => {
    return await Transaction.findByDateRange(startDate, endDate);
  }
};
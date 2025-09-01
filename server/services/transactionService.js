import { Transaction, Product } from '../models/index.js';
import { APIError } from '../utils/helpers.js';
import { productService } from './productService.js';

export const transactionService = {
  getAllTransactions: async () => {
    return await Transaction.findAll();
  },

  createTransaction: async (transactionData) => {
    const { type, productId, quantity } = transactionData;
    const product = await Product.findById(productId);
    
    if (!product) {
      throw new APIError('Product not found', 404);
    }
    
    let newQuantity = product.quantity;
    
    if (type === 'PURCHASE') {
      newQuantity += parseInt(quantity);
    } else if (type === 'SALE') {
      if (parseInt(quantity) > product.quantity) {
        throw new APIError('Insufficient stock', 400);
      }
      newQuantity -= parseInt(quantity);
    } else if (type === 'ADJUSTMENT') {
      newQuantity = parseInt(quantity);
    } else {
      throw new APIError('Invalid transaction type', 400);
    }
    
    // Create the transaction
    const transaction = await Transaction.create(transactionData);
    
    // Update the product quantity
    await Product.update(productId, { quantity: newQuantity });
    
    return transaction;
  },

  getTransactionsByDateRange: async (startDate, endDate) => {
    return await Transaction.findByDateRange(startDate, endDate);
  }
};
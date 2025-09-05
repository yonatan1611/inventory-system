import { body, validationResult } from 'express-validator';
import { errorResponse } from '../utils/helpers.js';

// Validation rules for product creation
export const validateProduct = [
  body('name').notEmpty().withMessage('Product name is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('variants').isArray({ min: 1 }).withMessage('At least one variant is required'),
  body('variants.*.costPrice').isFloat({ min: 0 }).withMessage('Valid cost price is required'),
  body('variants.*.sellingPrice').isFloat({ min: 0 }).withMessage('Valid selling price is required'),
  body('variants.*.quantity').isInt({ min: 0 }).withMessage('Valid quantity is required'),
];

export const validateVariant = [
  body('costPrice').isFloat({ min: 0 }).withMessage('Valid cost price is required'),
  body('sellingPrice').isFloat({ min: 0 }).withMessage('Valid selling price is required'),
  body('quantity').isInt({ min: 0 }).withMessage('Valid quantity is required'),
];

// Validation rules for transaction creation
export const validateTransaction = [
  body('type').isIn(['PURCHASE', 'SALE', 'ADJUSTMENT']).withMessage('Invalid transaction type'),
  body('productId').isInt({ min: 1 }).withMessage('Valid product ID is required'),
  body('quantity').isInt({ min: 1 }).withMessage('Quantity must be a positive integer'),
];

// Validation rules for authentication
export const validateAuth = [
  body('username').notEmpty().withMessage('Username is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

// Check for validation errors
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return errorResponse(res, 400, errors.array()[0].msg);
  }
  next();
};
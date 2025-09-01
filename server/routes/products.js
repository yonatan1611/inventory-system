import express from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} from '../controllers/productController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateProduct, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

router.get('/', authenticateToken, getProducts);
router.get('/:id', authenticateToken, getProduct);
router.post('/', authenticateToken, validateProduct, handleValidationErrors, createProduct);
router.put('/:id', authenticateToken, validateProduct, handleValidationErrors, updateProduct);
router.delete('/:id', authenticateToken, deleteProduct);

export default router;
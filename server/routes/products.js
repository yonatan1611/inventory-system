// routes/products.js
import express from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  restoreProduct,
  hardDeleteProduct,
  addVariant,
  updateVariant,
  deleteVariant
} from '../controllers/productController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateProduct, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

router.get('/', authenticateToken, getProducts);
router.get('/:id', authenticateToken, getProduct);
router.post('/', authenticateToken, validateProduct, handleValidationErrors, createProduct);
router.put('/:id', authenticateToken, validateProduct, handleValidationErrors, updateProduct);
router.delete('/:id', authenticateToken, deleteProduct);
router.patch('/:id/restore', authenticateToken, restoreProduct);
router.delete('/:id/hard', authenticateToken, hardDeleteProduct);

// Variant routes
router.post('/:productId/variants', authenticateToken, addVariant);
router.put('/variants/:variantId', authenticateToken, updateVariant);
router.delete('/variants/:variantId', authenticateToken, deleteVariant);

export default router;
// server/routes/products.js
import express from 'express';
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  restoreProduct,       // <- make sure to import
  hardDeleteProduct     // <- optional: import if you add a permanent delete route
} from '../controllers/productController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateProduct, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

router.get('/', authenticateToken, getProducts);
router.get('/:id', authenticateToken, getProduct);
router.post('/', authenticateToken, validateProduct, handleValidationErrors, createProduct);
router.put('/:id', authenticateToken, validateProduct, handleValidationErrors, updateProduct);

// soft-delete (archive)
router.delete('/:id', authenticateToken, deleteProduct);

// restore (unarchive)
router.post('/:id/restore', authenticateToken, restoreProduct);

// optional: permanent delete (admin-only)
router.delete('/:id/permanent', authenticateToken, hardDeleteProduct);

export default router;

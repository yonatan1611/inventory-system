import express from 'express';
import { getTransactions, createTransaction, sellProduct, refillProduct } from '../controllers/transactionController.js';
import { authenticateToken } from '../middleware/auth.js';
import { validateTransaction, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

router.get('/', authenticateToken, getTransactions);
router.post('/', authenticateToken, validateTransaction, handleValidationErrors, createTransaction);
router.post('/sell', authenticateToken, sellProduct);
router.post('/refill', authenticateToken, refillProduct);

export default router;
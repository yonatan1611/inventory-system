import express from 'express';
import { getProfitLoss, getInventoryValuation } from '../controllers/reportController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/profit-loss', authenticateToken, getProfitLoss);
router.get('/inventory-valuation', authenticateToken, getInventoryValuation);

export default router;
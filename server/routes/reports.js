import express from 'express';
import { getProfitLoss, getInventoryValuation, getSalesByProduct, getSalesByMonth, getInventoryCategories } from '../controllers/reportController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/profit-loss', authenticateToken, getProfitLoss);
router.get('/inventory-valuation', authenticateToken, getInventoryValuation);
router.get('/sales-by-product', authenticateToken, getSalesByProduct);
router.get('/sales-by-month', authenticateToken, getSalesByMonth);
router.get('/inventory-categories', authenticateToken, getInventoryCategories);

export default router;
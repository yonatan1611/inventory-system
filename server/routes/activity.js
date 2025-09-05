// src/routes/activity.js
import express from 'express';
import { getActivities, getProductActivities } from '../controllers/activityController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', authenticateToken, getActivities);
router.get('/product/:productId', authenticateToken, getProductActivities);

export default router;
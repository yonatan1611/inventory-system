import express from 'express';
import { setupAdmin, login } from '../controllers/authController.js';
import { validateAuth, handleValidationErrors } from '../middleware/validation.js';

const router = express.Router();

router.post('/setup', validateAuth, handleValidationErrors, setupAdmin);
router.post('/login', validateAuth, handleValidationErrors, login);

export default router;
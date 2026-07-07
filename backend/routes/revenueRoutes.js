// backend/routes/revenueRoutes.js
import express from 'express';
import { getRevenueAnalytics } from '../controllers/revenueController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, admin, getRevenueAnalytics);

export default router;
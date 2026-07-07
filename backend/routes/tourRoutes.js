// backend/routes/tourRoutes.js
import express from 'express';
import {
  getTours,
  getTourById,
  createTour,
  updateTour,
  deleteTour,
} from '../controllers/tourController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getTours);
router.get('/:id', getTourById);
router.post('/', protect, admin, createTour);
router.put('/:id', protect, admin, updateTour);
router.delete('/:id', protect, admin, deleteTour);

export default router;
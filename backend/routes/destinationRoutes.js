// backend/routes/destinationRoutes.js
import express from 'express';
import {
  getDestinations,
  getDestinationById,
  createDestination,
  updateDestination,
  deleteDestination,
} from '../controllers/destinationController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getDestinations);
router.get('/:id', getDestinationById);
router.post('/', protect, admin, createDestination);
router.put('/:id', protect, admin, updateDestination);
router.delete('/:id', protect, admin, deleteDestination);

export default router;
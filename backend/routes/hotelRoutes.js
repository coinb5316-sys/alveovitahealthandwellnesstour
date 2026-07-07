// backend/routes/hotelRoutes.js
import express from 'express';
import {
  getHotels,
  getHotelById,
  createHotel,
  updateHotel,
  deleteHotel,
} from '../controllers/hotelController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getHotels);
router.get('/:id', getHotelById);
router.post('/', protect, admin, createHotel);
router.put('/:id', protect, admin, updateHotel);
router.delete('/:id', protect, admin, deleteHotel);

export default router;
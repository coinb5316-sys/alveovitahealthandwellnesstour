// backend/routes/bookingRoutes.js
import express from 'express';
import {
  getAdminBookings,
  getUserBookings,
  getBookingById,
  createBooking,
  updateBookingStatus,
  cancelBooking,
  getBookingStats,
  deleteBooking,
  completeBooking,
  softDeleteBooking,
  adminDeleteBooking,
  restoreBooking,
  getDeletedBookings,
} from '../controllers/bookingController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// ========================================
// ADMIN ROUTES (Specific routes first)
// ========================================
router.get('/admin/stats', protect, admin, getBookingStats);
router.get('/admin', protect, admin, getAdminBookings);
router.get('/deleted', protect, admin, getDeletedBookings);
router.delete('/admin/:id', protect, admin, adminDeleteBooking);
router.post('/:id/restore', protect, admin, restoreBooking);

// ========================================
// USER ROUTES
// ========================================
router.get('/mine', protect, getUserBookings);
router.delete('/:id/soft-delete', protect, softDeleteBooking);

// ========================================
// PARAMETERIZED ROUTES (Must come after specific routes)
// ========================================
router.get('/:id', protect, getBookingById);
router.post('/', protect, createBooking);
router.post('/:id/cancel', protect, cancelBooking);
router.patch('/:id/status', protect, admin, updateBookingStatus);
router.patch('/:id/complete', protect, admin, completeBooking);
router.delete('/:id', protect, deleteBooking);

export default router;
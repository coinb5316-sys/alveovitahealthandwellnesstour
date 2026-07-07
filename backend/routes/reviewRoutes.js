// backend/routes/reviewRoutes.js
import express from 'express';
import {
  getTourReviews,
  getHotelReviews,
  addTourReview,
  addHotelReview,
  getAdminReviews,
  updateReviewStatus,
  deleteReview
} from '../controllers/reviewController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/tours/:id/reviews', getTourReviews);
router.get('/hotels/:id/reviews', getHotelReviews);

// Protected routes (user)
router.post('/tours/:id/reviews', protect, addTourReview);
router.post('/hotels/:id/reviews', protect, addHotelReview);

// Admin routes
router.get('/admin/reviews', protect, admin, getAdminReviews);
router.put('/admin/reviews/:reviewId/status', protect, admin, updateReviewStatus);
router.delete('/admin/reviews/:reviewId', protect, admin, deleteReview);

export default router;
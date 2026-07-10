import express from 'express';
import {
  getNotifications,
  getNotificationById,
  createNotification,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getNotificationStats,
  createBulkNotifications,
  getAdminNotifications
} from '../controllers/notificationController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public routes (protected)
router.route('/')
  .get(protect, getNotifications)
  .post(protect, admin, createNotification);

// Admin routes
router.get('/admin', protect, admin, getAdminNotifications);

// Stats
router.get('/stats', protect, getNotificationStats);

// Bulk
router.post('/bulk', protect, admin, createBulkNotifications);

// Mark all as read
router.put('/read-all', protect, markAllAsRead);

// Delete all
router.delete('/delete-all', protect, deleteAllNotifications);

// Single notification routes
router.route('/:id')
  .get(protect, getNotificationById)
  .delete(protect, deleteNotification);

router.put('/:id/read', protect, markAsRead);

export default router;
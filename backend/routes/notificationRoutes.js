// backend/routes/notificationRoutes.js
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
  createBulkNotifications
} from '../controllers/notificationController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// ============================================
// USER ROUTES
// ============================================

// Get user notifications
router.get('/', getNotifications);

// Get notification stats
router.get('/stats', getNotificationStats);

// Get single notification
router.get('/:id', getNotificationById);

// Mark notification as read
router.put('/:id/read', markAsRead);

// Mark all as read
router.put('/read-all', markAllAsRead);

// Delete notification
router.delete('/:id', deleteNotification);

// Delete all notifications
router.delete('/delete-all', deleteAllNotifications);

// ============================================
// ADMIN ROUTES
// ============================================

// Create notification (admin only)
router.post('/', admin, createNotification);

// Create bulk notifications (admin only)
router.post('/bulk', admin, createBulkNotifications);

export default router;
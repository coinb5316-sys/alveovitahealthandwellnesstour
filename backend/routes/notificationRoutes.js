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
  createBulkNotifications,
  getAdminNotifications
} from '../controllers/notificationController.js';
// Fix: Import from auth.js (not authMiddleware.js)
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// ==================== NOTIFICATION ROUTES ====================

// Get user notifications (with admin support)
// GET /api/notifications
router.route('/')
  .get(protect, getNotifications)
  .post(protect, admin, createNotification);

// Admin routes - Get all notifications for admin
// GET /api/notifications/admin
router.get('/admin', protect, admin, getAdminNotifications);

// Get notification stats
// GET /api/notifications/stats
router.get('/stats', protect, getNotificationStats);

// Bulk notifications (admin only)
// POST /api/notifications/bulk
router.post('/bulk', protect, admin, createBulkNotifications);

// Mark all notifications as read
// PUT /api/notifications/read-all
router.put('/read-all', protect, markAllAsRead);

// Delete all notifications
// DELETE /api/notifications/delete-all
router.delete('/delete-all', protect, deleteAllNotifications);

// Single notification routes
// GET /api/notifications/:id
// DELETE /api/notifications/:id
router.route('/:id')
  .get(protect, getNotificationById)
  .delete(protect, deleteNotification);

// Mark a single notification as read
// PUT /api/notifications/:id/read
router.put('/:id/read', protect, markAsRead);

export default router;
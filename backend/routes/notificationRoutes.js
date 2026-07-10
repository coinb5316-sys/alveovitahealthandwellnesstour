// backend/routes/notificationRoutes.js
import express from 'express';
import {
  getNotifications,
  getAdminNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getNotificationStats,
  getNotificationCount,
  sendTestNotification
} from '../controllers/notificationController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// ==================== NOTIFICATION ROUTES ====================

// Get user notifications
// GET /api/notifications
router.get('/', protect, getNotifications);

// Get admin notifications (all users)
// GET /api/notifications/admin
router.get('/admin', protect, admin, getAdminNotifications);

// Get notification stats (admin only)
// GET /api/notifications/stats
router.get('/stats', protect, admin, getNotificationStats);

// Get notification count
// GET /api/notifications/count
router.get('/count', protect, getNotificationCount);

// Mark all notifications as read
// PUT /api/notifications/read-all
router.put('/read-all', protect, markAllAsRead);

// Delete all notifications
// DELETE /api/notifications/delete-all
router.delete('/delete-all', protect, deleteAllNotifications);

// Test notification endpoint
// POST /api/notifications/test
router.post('/test', protect, admin, sendTestNotification);

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
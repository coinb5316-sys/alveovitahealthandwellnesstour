import express from 'express';
import {
  getNotifications,
  getAdminNotifications,
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

// ============================================
// FIXED: Routes with proper order
// ============================================

// Admin routes - must come before :id routes
router.get('/admin', protect, admin, getAdminNotifications);
router.put('/admin/read-all', protect, admin, markAllAsRead);
router.delete('/admin/delete-all', protect, admin, deleteAllNotifications);

// User routes
router.get('/', protect, getNotifications);
router.get('/stats', protect, getNotificationStats);
router.post('/', protect, createNotification);
router.post('/bulk', protect, admin, createBulkNotifications);

// Individual notification routes - these must come AFTER the specific routes above
router.get('/:id', protect, getNotificationById);
router.put('/:id/read', protect, markAsRead);
router.delete('/:id', protect, deleteNotification);

export default router;
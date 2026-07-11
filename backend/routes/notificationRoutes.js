// backend/routes/notificationRoutes.js
import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import {
  getUserNotifications,
  getAdminNotifications,
  getNotificationById,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllRead,
  getNotificationStats,
  createSystemNotification,
  getNotificationTypes,
} from '../controllers/notificationController.js';

const router = express.Router();

// ============================================
// USER ROUTES (Authenticated users)
// ============================================

// Get user's notifications
router.get('/', protect, getUserNotifications);

// Get notification by ID
router.get('/:id', protect, getNotificationById);

// Mark notification as read
router.put('/:id/read', protect, markAsRead);

// Mark all as read
router.put('/read/all', protect, markAllAsRead);

// Delete notification
router.delete('/:id', protect, deleteNotification);

// Delete all read notifications
router.delete('/read/all', protect, deleteAllRead);

// Get notification stats
router.get('/stats', protect, getNotificationStats);

// Get notification types
router.get('/types', protect, getNotificationTypes);

// ============================================
// ADMIN ROUTES
// ============================================

// Get admin notifications (all users)
router.get('/admin', protect, admin, getAdminNotifications);

// Create system notification
router.post('/system', protect, admin, createSystemNotification);

export default router;
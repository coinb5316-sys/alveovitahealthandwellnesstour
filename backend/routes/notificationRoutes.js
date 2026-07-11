// backend/routes/notificationRoutes.js
import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import {
  getUserNotifications,
  getNotificationStats,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getAdminNotifications,
  adminMarkAllAsRead,
  adminDeleteAllNotifications,
  adminDeleteNotification,
  createAdminNotification,
  createBulkNotifications
} from '../controllers/notificationController.js';

const router = express.Router();

// USER ROUTES
router.get('/', protect, getUserNotifications);
router.get('/stats', protect, getNotificationStats);
router.put('/:id/read', protect, markNotificationAsRead);
router.put('/read-all', protect, markAllAsRead);
router.delete('/:id', protect, deleteNotification);
router.delete('/delete-all', protect, deleteAllNotifications);

// ADMIN ROUTES
router.get('/admin', protect, admin, getAdminNotifications);
router.put('/admin/read-all', protect, admin, adminMarkAllAsRead);
router.delete('/admin/delete-all', protect, admin, adminDeleteAllNotifications);
router.delete('/admin/:id', protect, admin, adminDeleteNotification);
router.post('/admin/create', protect, admin, createAdminNotification);
router.post('/admin/create-bulk', protect, admin, createBulkNotifications);

export default router;
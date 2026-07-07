// backend/routes/adminRoutes.js
import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  updateUserRole,
  updateUserStatus,
  getUserStats
} from '../controllers/adminController.js';

const router = express.Router();

// All routes require admin authentication
router.use(protect, admin);

// User management routes
router.get('/users', getUsers);
router.get('/users/stats', getUserStats);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/role', updateUserRole);
router.patch('/users/:id/status', updateUserStatus);

export default router;
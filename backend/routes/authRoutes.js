// backend/routes/authRoutes.js
import express from 'express';
import {
  register,
  login,
  googleLogin,
  refreshToken,
  verifyToken,
  logout,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/refresh-token', refreshToken);
router.post('/forgot-password', forgotPassword);  // ADD THIS
router.post('/reset-password', resetPassword);    // ADD THIS

// Protected routes
router.get('/verify', protect, verifyToken);
router.post('/logout', protect, logout);

export default router;
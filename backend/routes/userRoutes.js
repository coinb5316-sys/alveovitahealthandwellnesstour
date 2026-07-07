// backend/routes/userRoutes.js
import express from 'express';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  changePassword,
  getUserStats
} from '../controllers/userController.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/avatar', upload.single('avatar'), uploadAvatar);
router.post('/change-password', changePassword);
router.get('/stats', getUserStats);

export default router;
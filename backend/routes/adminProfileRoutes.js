// backend/routes/adminProfileRoutes.js
import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import {
  getAdminProfile,
  updateAdminProfile,
  uploadAdminAvatar,
  changeAdminPassword
} from '../controllers/adminProfileController.js';

const router = express.Router();

// All routes require admin authentication
router.use(protect, admin);

router.get('/profile', getAdminProfile);
router.put('/profile', updateAdminProfile);
router.post('/avatar', upload.single('avatar'), uploadAdminAvatar);
router.post('/change-password', changeAdminPassword);

export default router;
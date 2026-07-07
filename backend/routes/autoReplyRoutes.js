// backend/routes/autoReplyRoutes.js
import express from 'express';
import {
  getAutoReplies,
  getAutoReplyById,
  createAutoReply,
  updateAutoReply,
  deleteAutoReply,
  toggleAutoReply,
  getBotResponse
} from '../controllers/autoReplyController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public route for live chat
router.post('/respond', getBotResponse);

// Admin routes
router.get('/', protect, admin, getAutoReplies);
router.get('/:id', protect, admin, getAutoReplyById);
router.post('/', protect, admin, createAutoReply);
router.put('/:id', protect, admin, updateAutoReply);
router.delete('/:id', protect, admin, deleteAutoReply);
router.post('/:id/toggle', protect, admin, toggleAutoReply);

export default router;
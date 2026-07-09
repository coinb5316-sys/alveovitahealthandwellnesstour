// backend/routes/chatSessionRoutes.js
import express from 'express';
import {
  createChatSession,
  addMessage,
  getChatSessions,
  getChatSessionById,
  updateChatSessionStatus,
  resolveQuestion,
  deleteChatSession
} from '../controllers/chatSessionController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/', createChatSession);
router.post('/:id/messages', addMessage);

// Admin routes
router.get('/', protect, admin, getChatSessions);
router.get('/:id', protect, admin, getChatSessionById);
router.put('/:id/status', protect, admin, updateChatSessionStatus);
router.post('/:id/resolve-question', protect, admin, resolveQuestion);
router.delete('/:id', protect, admin, deleteChatSession);

export default router;
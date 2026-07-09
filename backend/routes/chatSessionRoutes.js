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

// ============================================
// PUBLIC ROUTES - No authentication required
// ============================================

// Create a new chat session (anyone can start a chat)
router.post('/', createChatSession);

// Add message to chat session (anyone can send messages)
router.post('/:id/messages', addMessage);

// ============================================
// ADMIN ROUTES - Protected
// ============================================

// Get all chat sessions
router.get('/', protect, admin, getChatSessions);

// Get single chat session
router.get('/:id', protect, admin, getChatSessionById);

// Update chat session status
router.put('/:id/status', protect, admin, updateChatSessionStatus);

// Resolve an unresolved question
router.post('/:id/resolve-question', protect, admin, resolveQuestion);

// Delete chat session
router.delete('/:id', protect, admin, deleteChatSession);

export default router;
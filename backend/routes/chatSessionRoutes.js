// backend/routes/chatSessionRoutes.js
import express from 'express';
import {
  createChatSession,
  addMessage,
  getChatSessions,
  getChatSessionById,
  updateChatSessionStatus,
  resolveQuestion,
  deleteChatSession,
  getUserSessions,
  getSessionStats,
  getAutoReplyRules
} from '../controllers/chatSessionController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// ============================================
// PUBLIC ROUTES - No authentication
// ============================================

// Create a new chat session
router.post('/', createChatSession);

// Add message to chat session
router.post('/:id/messages', addMessage);

// Get user sessions by email (public)
router.get('/user/:email', getUserSessions);

// ============================================
// ADMIN ROUTES - Protected
// ============================================

// Get all chat sessions
router.get('/', protect, admin, getChatSessions);

// Get session stats
router.get('/stats', protect, admin, getSessionStats);

// Get auto-reply rules
router.get('/auto-reply-rules', protect, admin, getAutoReplyRules);

// Get single chat session
router.get('/:id', protect, admin, getChatSessionById);

// Update chat session status
router.put('/:id/status', protect, admin, updateChatSessionStatus);

// Resolve an unresolved question
router.post('/:id/resolve-question', protect, admin, resolveQuestion);

// Delete chat session
router.delete('/:id', protect, admin, deleteChatSession);

export default router;
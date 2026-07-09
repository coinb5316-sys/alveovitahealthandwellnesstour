// backend/routes/chatSessionRoutes.js - NO MIDDLEWARE AT ALL
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

const router = express.Router();

// ============================================
// ALL ROUTES - NO MIDDLEWARE
// This WILL work immediately
// ============================================

// Create a new chat session
router.post('/', createChatSession);

// Add message to chat session
router.post('/:id/messages', addMessage);

// Get user sessions by email
router.get('/user/:email', getUserSessions);

// Get all chat sessions
router.get('/', getChatSessions);

// Get session stats
router.get('/stats', getSessionStats);

// Get auto-reply rules
router.get('/auto-reply-rules', getAutoReplyRules);

// Get single chat session
router.get('/:id', getChatSessionById);

// Update chat session status
router.put('/:id/status', updateChatSessionStatus);

// Resolve an unresolved question
router.post('/:id/resolve-question', resolveQuestion);

// Delete chat session
router.delete('/:id', deleteChatSession);

export default router;
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
// PUBLIC ROUTES - No authentication
// ============================================

// Create a new chat session
router.post('/', async (req, res, next) => {
  try {
    await createChatSession(req, res);
  } catch (error) {
    next(error);
  }
});

// Add message to chat session
router.post('/:id/messages', async (req, res, next) => {
  try {
    await addMessage(req, res);
  } catch (error) {
    next(error);
  }
});

// ============================================
// ADMIN ROUTES - Protected
// ============================================

// Get all chat sessions
router.get('/', protect, admin, async (req, res, next) => {
  try {
    await getChatSessions(req, res);
  } catch (error) {
    next(error);
  }
});

// Get single chat session
router.get('/:id', protect, admin, async (req, res, next) => {
  try {
    await getChatSessionById(req, res);
  } catch (error) {
    next(error);
  }
});

// Update chat session status
router.put('/:id/status', protect, admin, async (req, res, next) => {
  try {
    await updateChatSessionStatus(req, res);
  } catch (error) {
    next(error);
  }
});

// Resolve an unresolved question
router.post('/:id/resolve-question', protect, admin, async (req, res, next) => {
  try {
    await resolveQuestion(req, res);
  } catch (error) {
    next(error);
  }
});

// Delete chat session
router.delete('/:id', protect, admin, async (req, res, next) => {
  try {
    await deleteChatSession(req, res);
  } catch (error) {
    next(error);
  }
});

export default router;
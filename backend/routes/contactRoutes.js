// backend/routes/contactRoutes.js
import express from 'express';
import {
  submitContact,
  getContacts,
  getContactById,
  updateContactStatus,
  addContactReply,
  deleteContact,
  toggleSpam,
  toggleArchive
} from '../controllers/contactController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.post('/', submitContact);

// Admin routes
router.get('/', protect, admin, getContacts);
router.get('/:id', protect, admin, getContactById);
router.put('/:id/status', protect, admin, updateContactStatus);
router.post('/:id/reply', protect, admin, addContactReply);
router.post('/:id/spam', protect, admin, toggleSpam);
router.post('/:id/archive', protect, admin, toggleArchive);
router.delete('/:id', protect, admin, deleteContact);

export default router;
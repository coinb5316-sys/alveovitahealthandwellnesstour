// backend/routes/experienceRoutes.js
import express from 'express';
import {
  getExperiences,
  getExperienceById,
  createExperience,
  updateExperience,
  deleteExperience,
  toggleLike,
  toggleBookmark,
  addComment,
  addReply,
  addNestedReply,
  getLikedExperiences,
  getBookmarkedExperiences,
} from '../controllers/experienceController.js';
import { protect } from '../middleware/auth.js';
import upload from '../config/multer.js';

const router = express.Router();

// ============ PUBLIC ROUTES ============
router.get('/', getExperiences);

// ============ PROTECTED ROUTES (MUST COME BEFORE /:id) ============
// These must be defined BEFORE the /:id route
router.get('/liked', protect, getLikedExperiences);
router.get('/bookmarked', protect, getBookmarkedExperiences);

// ============ PROTECTED ROUTES WITH PARAMS ============
router.post('/', protect, upload.single('media'), createExperience);
router.put('/:id', protect, upload.single('media'), updateExperience);
router.delete('/:id', protect, deleteExperience);

// Like and Bookmark routes
router.post('/:id/like', protect, toggleLike);
router.post('/:id/bookmark', protect, toggleBookmark);

// Comment routes
router.post('/:id/comments', protect, addComment);
router.post('/:id/comments/:commentId/replies', protect, addReply);
router.post('/:id/comments/:commentId/replies/:replyId/replies', protect, addNestedReply);

// ============ PUBLIC ROUTE WITH PARAM (MUST BE LAST) ============
router.get('/:id', getExperienceById);

export default router;
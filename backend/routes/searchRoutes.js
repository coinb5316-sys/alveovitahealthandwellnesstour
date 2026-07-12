// backend/routes/searchRoutes.js
import express from 'express';
import {
  globalSearch,
  getSearchSuggestions,
  filterSearch
} from '../controllers/searchController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/search
// @desc    Global search across all modules
// @access  Public
router.get('/', globalSearch);

// @route   GET /api/search/suggestions
// @desc    Get search suggestions/autocomplete
// @access  Public
router.get('/suggestions', getSearchSuggestions);

// @route   POST /api/search/filter
// @desc    Advanced filter search
// @access  Public
router.post('/filter', filterSearch);

export default router;
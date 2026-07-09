// backend/routes/favoriteRoutes.js
import express from 'express';
import {
  getFavorites,
  addFavorite,
  removeFavorite,
  removeFavoriteByItem,
  checkFavorite,
  getFavoriteCount,
} from '../controllers/favoriteController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Get user's favorites
router.get('/', getFavorites);

// Add to favorites
router.post('/', addFavorite);

// Check if item is favorited
router.get('/check/:type/:id', checkFavorite);

// Get favorite count for an item
router.get('/count/:type/:id', getFavoriteCount);

// Remove from favorites by favorite ID
router.delete('/:id', removeFavorite);

// Remove from favorites by item type and ID
router.delete('/item/:type/:id', removeFavoriteByItem);

export default router;
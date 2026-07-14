// controllers/favoriteController.js - COMPLETE with Alveoly Notification Pattern
import Favorite from '../models/Favorite.js';
import Hotel from '../models/Hotel.js';
import Tour from '../models/Tour.js';
import Destination from '../models/Destination.js';
import { createNotification } from './notificationController.js';

// @desc    Get user's favorites
// @route   GET /api/favorites
export const getFavorites = async (req, res) => {
  try {
    const { type } = req.query;
    
    const query = { user: req.user.id };
    if (type && ['hotel', 'tour', 'destination'].includes(type)) {
      query.itemType = type;
    }

    const favorites = await Favorite.find(query)
      .sort({ addedAt: -1 });

    // Populate the actual items
    const populatedFavorites = await Promise.all(
      favorites.map(async (favorite) => {
        let item = null;
        const itemType = favorite.itemType;
        const itemId = favorite.itemId;

        if (itemType === 'hotel') {
          item = await Hotel.findById(itemId).select('name location price rating reviews images badge amenities');
        } else if (itemType === 'tour') {
          item = await Tour.findById(itemId).select('title location price rating reviews images duration type badge');
        } else if (itemType === 'destination') {
          item = await Destination.findById(itemId).select('name region image rating reviews tags popularity');
        }

        return {
          _id: favorite._id,
          user: favorite.user,
          itemType: favorite.itemType,
          itemId: favorite.itemId,
          addedAt: favorite.addedAt,
          createdAt: favorite.createdAt,
          item: item,
        };
      })
    );

    // Filter out favorites where item no longer exists
    const validFavorites = populatedFavorites.filter(f => f.item !== null);

    res.json({
      success: true,
      favorites: validFavorites,
    });
  } catch (error) {
    console.error('❌ Get favorites error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add to favorites
// @route   POST /api/favorites
export const addFavorite = async (req, res) => {
  try {
    const io = req.app.get('io');
    const { itemType, itemId } = req.body;

    if (!itemType || !itemId) {
      return res.status(400).json({
        success: false,
        message: 'Item type and ID are required',
      });
    }

    if (!['hotel', 'tour', 'destination'].includes(itemType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item type. Must be hotel, tour, or destination',
      });
    }

    // Check if item exists
    let itemExists = false;
    let itemName = '';
    
    if (itemType === 'hotel') {
      const hotel = await Hotel.findById(itemId);
      itemExists = !!hotel;
      itemName = hotel?.name || 'Hotel';
    } else if (itemType === 'tour') {
      const tour = await Tour.findById(itemId);
      itemExists = !!tour;
      itemName = tour?.title || 'Tour';
    } else if (itemType === 'destination') {
      const dest = await Destination.findById(itemId);
      itemExists = !!dest;
      itemName = dest?.name || 'Destination';
    }

    if (!itemExists) {
      return res.status(404).json({
        success: false,
        message: `${itemType.charAt(0).toUpperCase() + itemType.slice(1)} not found`,
      });
    }

    // Check if already favorited
    const existingFavorite = await Favorite.findOne({
      user: req.user.id,
      itemType,
      itemId,
    });

    if (existingFavorite) {
      return res.status(400).json({
        success: false,
        message: 'Item already in favorites',
      });
    }

    const favorite = await Favorite.create({
      user: req.user.id,
      itemType,
      itemId,
    });

    // Create notification
    await createNotification(
      req.user.id,
      'user',
      'success',
      `❤️ Added to Favorites: ${itemName}`,
      `You added "${itemName}" to your favorites.`,
      `/${itemType}s/${itemId}`,
      { itemType, itemId, action: 'favorite_added' }
    );

    // Emit socket event
    if (io) {
      io.emit('favorite-added', {
        favoriteId: favorite._id,
        userId: req.user.id,
        userName: req.user.name,
        itemType,
        itemId,
        itemName,
        timestamp: new Date(),
      });
    }

    res.status(201).json({
      success: true,
      favorite,
      message: 'Added to favorites successfully',
    });
  } catch (error) {
    console.error('❌ Add favorite error:', error);
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Item already in favorites',
      });
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove from favorites
// @route   DELETE /api/favorites/:id
export const removeFavorite = async (req, res) => {
  try {
    const io = req.app.get('io');
    const favorite = await Favorite.findById(req.params.id);

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found',
      });
    }

    // Check if user owns this favorite
    if (favorite.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to remove this favorite',
      });
    }

    const itemType = favorite.itemType;
    const itemId = favorite.itemId;

    // Get item name for notification
    let itemName = '';
    if (itemType === 'hotel') {
      const hotel = await Hotel.findById(itemId);
      itemName = hotel?.name || 'Hotel';
    } else if (itemType === 'tour') {
      const tour = await Tour.findById(itemId);
      itemName = tour?.title || 'Tour';
    } else if (itemType === 'destination') {
      const dest = await Destination.findById(itemId);
      itemName = dest?.name || 'Destination';
    }

    await favorite.deleteOne();

    // Create notification
    await createNotification(
      req.user.id,
      'user',
      'info',
      `💔 Removed from Favorites: ${itemName}`,
      `You removed "${itemName}" from your favorites.`,
      `/${itemType}s/${itemId}`,
      { itemType, itemId, action: 'favorite_removed' }
    );

    // Emit socket event
    if (io) {
      io.emit('favorite-removed', {
        favoriteId: req.params.id,
        userId: req.user.id,
        userName: req.user.name,
        itemType,
        itemId,
        itemName,
        timestamp: new Date(),
      });
    }

    res.json({
      success: true,
      message: 'Removed from favorites successfully',
    });
  } catch (error) {
    console.error('❌ Remove favorite error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Remove from favorites by item
// @route   DELETE /api/favorites/item/:type/:id
export const removeFavoriteByItem = async (req, res) => {
  try {
    const io = req.app.get('io');
    const { type, id } = req.params;

    if (!['hotel', 'tour', 'destination'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item type',
      });
    }

    const favorite = await Favorite.findOne({
      user: req.user.id,
      itemType: type,
      itemId: id,
    });

    if (!favorite) {
      return res.status(404).json({
        success: false,
        message: 'Favorite not found',
      });
    }

    // Get item name
    let itemName = '';
    if (type === 'hotel') {
      const hotel = await Hotel.findById(id);
      itemName = hotel?.name || 'Hotel';
    } else if (type === 'tour') {
      const tour = await Tour.findById(id);
      itemName = tour?.title || 'Tour';
    } else if (type === 'destination') {
      const dest = await Destination.findById(id);
      itemName = dest?.name || 'Destination';
    }

    await favorite.deleteOne();

    // Create notification
    await createNotification(
      req.user.id,
      'user',
      'info',
      `💔 Removed from Favorites: ${itemName}`,
      `You removed "${itemName}" from your favorites.`,
      `/${type}s/${id}`,
      { itemType: type, itemId: id, action: 'favorite_removed' }
    );

    // Emit socket event
    if (io) {
      io.emit('favorite-removed', {
        favoriteId: favorite._id,
        userId: req.user.id,
        userName: req.user.name,
        itemType: type,
        itemId: id,
        itemName,
        timestamp: new Date(),
      });
    }

    res.json({
      success: true,
      message: 'Removed from favorites successfully',
    });
  } catch (error) {
    console.error('❌ Remove favorite by item error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Check if item is favorited
// @route   GET /api/favorites/check/:type/:id
export const checkFavorite = async (req, res) => {
  try {
    const { type, id } = req.params;

    if (!['hotel', 'tour', 'destination'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item type',
      });
    }

    const favorite = await Favorite.findOne({
      user: req.user.id,
      itemType: type,
      itemId: id,
    });

    res.json({
      success: true,
      isFavorited: !!favorite,
      favoriteId: favorite?._id || null,
    });
  } catch (error) {
    console.error('❌ Check favorite error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get favorite count for an item
// @route   GET /api/favorites/count/:type/:id
export const getFavoriteCount = async (req, res) => {
  try {
    const { type, id } = req.params;

    if (!['hotel', 'tour', 'destination'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid item type',
      });
    }

    const count = await Favorite.countDocuments({
      itemType: type,
      itemId: id,
    });

    res.json({
      success: true,
      count,
    });
  } catch (error) {
    console.error('❌ Get favorite count error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
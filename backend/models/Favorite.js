// backend/models/Favorite.js
import mongoose from 'mongoose';

const favoriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  itemType: {
    type: String,
    enum: ['hotel', 'tour', 'destination'],
    required: true,
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'itemType',
  },
  addedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Ensure a user can only favorite an item once
favoriteSchema.index({ user: 1, itemType: 1, itemId: 1 }, { unique: true });

// Virtual to get the actual item
favoriteSchema.virtual('item').get(function() {
  return this.populated('itemId');
});

const Favorite = mongoose.model('Favorite', favoriteSchema);
export default Favorite;
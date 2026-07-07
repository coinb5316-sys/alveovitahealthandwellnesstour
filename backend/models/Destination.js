// backend/models/Destination.js
import mongoose from 'mongoose';

const destinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  country: {
    type: String,
    required: true,
    trim: true,
  },
  region: {
    type: String,
    required: true,
    enum: ['greater-accra', 'central', 'western', 'eastern', 'volta', 'ashanti', 'savannah', 'northern', 'upper-east', 'upper-west', 'bono', 'ahafo', 'bono-east', 'oti', 'north-east'],
  },
  category: {
    type: String,
    required: true,
    enum: ['beach', 'mountain', 'forest', 'city', 'desert', 'lake', 'cultural', 'historical'],
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviews: {
    type: Number,
    default: 0,
  },
  tags: [{
    type: String,
  }],
  tourCount: {
    type: Number,
    default: 0,
  },
  popularity: {
    type: String,
    enum: ['Popular', 'Very Popular', 'Trending', 'Hidden Gem', 'Must Visit'],
    default: 'Popular',
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'upcoming', 'draft'],
    default: 'active',
  },
  bestTimeToVisit: {
    type: String,
  },
  currency: {
    type: String,
    default: 'GHS',
  },
  language: {
    type: String,
    default: 'English',
  },
  timezone: {
    type: String,
    default: 'GMT',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

// Index for search
destinationSchema.index({ name: 'text', description: 'text', tags: 'text' });

const Destination = mongoose.model('Destination', destinationSchema);
export default Destination;
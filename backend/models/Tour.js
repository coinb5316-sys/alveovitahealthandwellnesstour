// backend/models/Tour.js
import mongoose from 'mongoose';

const tourSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  location: {
    type: String,
    required: true,
    trim: true,
  },
  region: {
    type: String,
    required: true,
    enum: ['greater-accra', 'central', 'western', 'eastern', 'volta', 'ashanti', 'savannah', 'northern', 'upper-east', 'upper-west', 'bono', 'ahafo', 'bono-east', 'oti', 'north-east'],
  },
  type: {
    type: String,
    required: true,
    enum: ['Cultural', 'Adventure', 'Nature', 'Historical', 'Wellness', 'Wildlife', 'Beach', 'City'],
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Moderate', 'Challenging'],
    default: 'Moderate',
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  duration: {
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
  description: {
    type: String,
    required: true,
  },
  longDescription: {
    type: String,
  },
  // Guide information
  guide: {
    name: { type: String, trim: true },
    bio: { type: String },
    experience: { type: Number, default: 0 },
    languages: [{ type: String }],
    avatar: { type: String },
    phone: { type: String },
    email: { type: String },
    rating: { type: Number, default: 0 },
  },
  // Transport information
  transport: {
    type: { type: String, enum: ['Bus', 'Van', 'Car', 'Train', 'Ship', 'Flight', 'Walking', 'Bicycle'], default: 'Bus' },
    description: { type: String },
    included: { type: Boolean, default: true },
    details: { type: String }
  },
  // Entry fees
  entryFees: {
    included: { type: Boolean, default: true },
    amount: { type: Number, default: 0 },
    description: { type: String },
    sites: [{ type: String }]
  },
  // Meals
  meals: {
    included: { type: Boolean, default: true },
    count: { type: Number, default: 0 },
    type: { type: String, enum: ['All Meals', 'Breakfast Only', 'Half Board', 'Full Board'], default: 'All Meals' },
    description: { type: String }
  },
  // Accommodation
  accommodation: {
    included: { type: Boolean, default: true },
    type: { type: String },
    description: { type: String },
    nights: { type: Number, default: 0 }
  },
  // Group size
  groupSize: {
    min: { type: Number, default: 2 },
    max: { type: Number, default: 20 }
  },
  languages: [{ type: String }],
  // Includes & Excludes (comma separated in admin, stored as array)
  includes: [{ type: String }],
  excludes: [{ type: String }],
  // Amenities (dropdown selection in admin)
  amenities: [{ type: String }],
  // Images - first is main banner, rest for slider
  images: [{ type: String }],
  // Itinerary - structured for multiple days
  itinerary: [{
    day: { type: Number },
    title: { type: String },
    activities: [{ type: String }]
  }],
  availableDates: [{ type: Date }],
  maxGroup: { type: Number, default: 20 },
  minGroup: { type: Number, default: 2 },
  badge: { type: String },
  status: {
    type: String,
    enum: ['active', 'inactive', 'upcoming', 'draft'],
    default: 'active',
  },
  category: {
    type: String,
    enum: ['wellness', 'medical', 'corporate', 'special'],
    default: 'wellness',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },

  // Reviews
  reviews: {
    type: Number,
    default: 0,
  },
  reviewList: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    userAvatar: { type: String, default: '' },
    rating: { type: Number, required: true, min: 1, max: 5 },
    title: { type: String, required: true },
    comment: { type: String, required: true },
    helpful: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    date: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    images: [{ type: String }],
    reply: {
      admin: { type: String },
      date: { type: Date },
    }
  }],
  
}, { timestamps: true });

// Index for search
tourSchema.index({ title: 'text', description: 'text', location: 'text' });

const Tour = mongoose.model('Tour', tourSchema);
export default Tour;
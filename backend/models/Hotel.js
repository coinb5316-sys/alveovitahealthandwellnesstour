// backend/models/Hotel.js
import mongoose from 'mongoose';

const hotelSchema = new mongoose.Schema({
  name: {
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
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
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
  badge: {
    type: String,
  },
  amenities: [{
    type: String,
  }],
  images: [{
    type: String,
  }],
  phone: {
    type: String,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
  },
  website: {
    type: String,
    trim: true,
  },
  checkIn: {
    type: String,
    default: '2:00 PM',
  },
  checkOut: {
    type: String,
    default: '12:00 PM',
  },
  rooms: {
    type: Number,
    default: 50,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'upcoming'],
    default: 'active',
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  // Reviews
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
hotelSchema.index({ name: 'text', description: 'text', location: 'text' });

const Hotel = mongoose.model('Hotel', hotelSchema);
export default Hotel;
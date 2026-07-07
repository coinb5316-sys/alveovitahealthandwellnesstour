// backend/models/Experience.js
import mongoose from 'mongoose';

// Reply sub-schema - using a function to handle self-reference
const replySubSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: { 
    type: String, 
    required: true 
  },
  userAvatar: { 
    type: String 
  },
  content: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  replies: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  }
});

// Comment sub-schema
const commentSubSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  userName: { 
    type: String, 
    required: true 
  },
  userAvatar: { 
    type: String 
  },
  content: { 
    type: String, 
    required: true 
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  },
  replies: {
    type: [mongoose.Schema.Types.Mixed],
    default: []
  }
});

const experienceSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  content: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['text', 'image', 'video', 'audio'],
    default: 'text',
  },
  mediaUrl: {
    type: String,
  },
  thumbnail: {
    type: String,
  },
  region: {
    type: String,
    enum: ['greater-accra', 'central', 'western', 'eastern', 'volta', 'ashanti', 'savannah', 'northern', 'upper-east', 'upper-west', 'bono', 'ahafo', 'bono-east', 'oti', 'north-east'],
    required: true,
  },
  tourName: {
    type: String,
    default: 'General Experience',
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  bookmarks: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  }],
  comments: [commentSubSchema],
  status: {
    type: String,
    enum: ['active', 'hidden', 'reported'],
    default: 'active',
  },
  views: {
    type: Number,
    default: 0,
  },
}, { timestamps: true });

// Index for search
experienceSchema.index({ title: 'text', content: 'text' });

const Experience = mongoose.model('Experience', experienceSchema);
export default Experience;
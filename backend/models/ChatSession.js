// backend/models/ChatSession.js - Add flexibility
import mongoose from 'mongoose';

const chatSessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  userPhone: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'closed', 'pending'],
    default: 'active'
  },
  messages: [{
    sender: {
      type: String,
      enum: ['user', 'bot', 'admin'],
      required: true
    },
    text: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    isAutoReply: {
      type: Boolean,
      default: false
    },
    matchedRule: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AutoReply'
    }
  }],
  unresolvedQuestions: [{
    question: String,
    askedAt: Date,
    resolved: {
      type: Boolean,
      default: false
    }
  }],
  openedAt: {
    type: Date,
    default: Date.now
  },
  closedAt: {
    type: Date
  },
  lastMessageAt: {
    type: Date,
    default: Date.now
  }
}, { 
  timestamps: true,
  // Allow flexible field names
  strict: false 
});

// Indexes for search
chatSessionSchema.index({ userName: 'text', userEmail: 'text' });
chatSessionSchema.index({ status: 1 });
chatSessionSchema.index({ lastMessageAt: -1 });

// Pre-save middleware to ensure lastMessageAt is updated
chatSessionSchema.pre('save', function(next) {
  if (this.isModified('messages')) {
    this.lastMessageAt = new Date();
  }
  next();
});

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);
export default ChatSession;
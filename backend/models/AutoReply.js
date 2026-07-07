// backend/models/AutoReply.js
import mongoose from 'mongoose';

const autoReplySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  trigger: {
    type: String,
    required: true,
    trim: true,
    // Comma or pipe separated keywords
  },
  reply: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['wellness', 'medical', 'corporate', 'special', 'general'],
    default: 'general'
  },
  enabled: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 1
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Index for faster search
autoReplySchema.index({ trigger: 'text' });

const AutoReply = mongoose.model('AutoReply', autoReplySchema);
export default AutoReply;
// backend/models/Contact.js
import mongoose from 'mongoose';

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  subject: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['wellness', 'medical', 'corporate', 'special', 'general'],
    default: 'general'
  },
  status: {
    type: String,
    enum: ['unread', 'read', 'replied', 'spam'],
    default: 'unread'
  },
  isSpam: {
    type: Boolean,
    default: false
  },
  isArchived: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  repliedAt: {
    type: Date
  },
  replies: [{
    content: {
      type: String,
      required: true
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    sentBy: {
      type: String,
      default: 'Admin'
    }
  }],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Indexes for search
contactSchema.index({ name: 'text', email: 'text', subject: 'text', message: 'text' });
contactSchema.index({ status: 1 });
contactSchema.index({ category: 1 });
contactSchema.index({ createdAt: -1 });

const Contact = mongoose.model('Contact', contactSchema);
export default Contact;
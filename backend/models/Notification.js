// backend/models/Notification.js
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['booking', 'payment', 'review', 'system', 'admin', 'tour', 'hotel', 'destination', 'experience', 'favorite', 'user', 'contact', 'chat'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  icon: {
    type: String,
    default: 'Bell'
  },
  color: {
    type: String,
    default: 'text-amber-500'
  },
  bgColor: {
    type: String,
    default: 'bg-amber-500/10'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  actionUrl: {
    type: String,
    trim: true
  },
  actionLabel: {
    type: String,
    trim: true
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ user: 1, read: 1 });
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });
notificationSchema.index({ isDeleted: 1 });

// Static methods
notificationSchema.statics.getUnreadCount = async function(userId) {
  const count = await this.countDocuments({
    user: userId,
    read: false,
    isDeleted: false
  });
  return count;
};

notificationSchema.statics.markAllAsRead = async function(userId) {
  const result = await this.updateMany(
    { user: userId, read: false, isDeleted: false },
    { read: true, readAt: new Date() }
  );
  return result;
};

notificationSchema.statics.deleteAll = async function(userId) {
  const result = await this.updateMany(
    { user: userId, isDeleted: false },
    { isDeleted: true, deletedAt: new Date() }
  );
  return result;
};

notificationSchema.methods.markAsRead = function() {
  this.read = true;
  this.readAt = new Date();
  return this.save();
};

notificationSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
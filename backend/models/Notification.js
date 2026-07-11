// backend/models/Notification.js
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  type: {
    type: String,
    enum: [
      'booking', 'payment', 'review', 'message', 'system',
      'tour', 'hotel', 'destination', 'experience',
      'user', 'admin', 'reminder', 'promotion', 'alert'
    ],
    default: 'system',
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  message: {
    type: String,
    required: true,
    trim: true,
  },
  icon: {
    type: String,
    default: 'Bell',
  },
  color: {
    type: String,
    default: 'text-blue-500',
  },
  bgColor: {
    type: String,
    default: 'bg-blue-500/10',
  },
  actionUrl: {
    type: String,
    default: null,
  },
  actionLabel: {
    type: String,
    default: 'View',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium',
  },
  read: {
    type: Boolean,
    default: false,
    index: true,
  },
  readAt: {
    type: Date,
    default: null,
  },
  delivered: {
    type: Boolean,
    default: false,
  },
  deliveredAt: {
    type: Date,
    default: null,
  },
  seen: {
    type: Boolean,
    default: false,
  },
  seenAt: {
    type: Date,
    default: null,
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  },
  expiresAt: {
    type: Date,
    default: null,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  senderName: {
    type: String,
    default: 'System',
  },
  senderAvatar: {
    type: String,
    default: null,
  },
  group: {
    type: String,
    enum: ['all', 'users', 'admins', 'specific'],
    default: 'specific',
  },
}, {
  timestamps: true,
});

// Indexes for performance
notificationSchema.index({ user: 1, read: 1 });
notificationSchema.index({ user: 1, createdAt: -1 });
notificationSchema.index({ user: 1, isDeleted: 1 });
notificationSchema.index({ group: 1, isDeleted: 1 });
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Instance method: Mark as read
notificationSchema.methods.markAsRead = async function() {
  if (!this.read) {
    this.read = true;
    this.readAt = new Date();
    await this.save();
  }
  return this;
};

// Instance method: Mark as seen
notificationSchema.methods.markAsSeen = async function() {
  if (!this.seen) {
    this.seen = true;
    this.seenAt = new Date();
    await this.save();
  }
  return this;
};

// Static method: Get unread count for user
notificationSchema.statics.getUnreadCount = async function(userId) {
  return this.countDocuments({
    user: userId,
    read: false,
    isDeleted: false,
    $or: [
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ]
  });
};

// Static method: Get all unread for user with pagination
notificationSchema.statics.getUnreadForUser = async function(userId, limit = 20, skip = 0) {
  return this.find({
    user: userId,
    read: false,
    isDeleted: false,
    $or: [
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ]
  })
  .sort({ priority: -1, createdAt: -1 })
  .limit(limit)
  .skip(skip)
  .lean();
};

// Static method: Mark all as read for user
notificationSchema.statics.markAllAsRead = async function(userId) {
  return this.updateMany(
    {
      user: userId,
      read: false,
      isDeleted: false,
    },
    {
      $set: {
        read: true,
        readAt: new Date(),
      }
    }
  );
};

// Static method: Delete all read notifications for user
notificationSchema.statics.deleteAllRead = async function(userId) {
  return this.updateMany(
    {
      user: userId,
      read: true,
      isDeleted: false,
    },
    {
      $set: {
        isDeleted: true,
        deletedAt: new Date(),
      }
    }
  );
};

// Static method: Create system notification for all users
notificationSchema.statics.createSystemNotification = async function(data, io) {
  const { title, message, type, icon, color, bgColor, actionUrl, actionLabel, priority, metadata } = data;
  
  // Find all users
  const User = mongoose.model('User');
  const users = await User.find({ status: 'active' }).select('_id');
  
  const notifications = [];
  for (const user of users) {
    notifications.push({
      user: user._id,
      type: type || 'system',
      title,
      message,
      icon: icon || 'Bell',
      color: color || 'text-blue-500',
      bgColor: bgColor || 'bg-blue-500/10',
      actionUrl: actionUrl || null,
      actionLabel: actionLabel || 'View',
      priority: priority || 'medium',
      group: 'all',
      metadata: metadata || {},
    });
  }
  
  if (notifications.length > 0) {
    await this.insertMany(notifications);
    
    if (io) {
      // Emit to all users
      for (const notif of notifications) {
        io.to(`user-${notif.user}`).emit('new-notification', {
          notification: notif,
          unreadCount: await this.getUnreadCount(notif.user)
        });
      }
    }
  }
  
  return notifications.length;
};

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification;
// backend/utils/notificationHelper.js
import Notification from '../models/Notification.js';
import User from '../models/User.js';

/**
 * Create a notification for a single user
 */
export const createNotification = async (io, userId, data) => {
  try {
    if (!userId) return null;
    
    const user = await User.findById(userId);
    if (!user) return null;

    const notification = await Notification.create({
      user: userId,
      type: data.type || 'system',
      title: data.title || 'New Notification',
      message: data.message || 'You have a new notification',
      icon: data.icon || 'Bell',
      color: data.color || 'text-blue-500',
      bgColor: data.bgColor || 'bg-blue-500/10',
      actionUrl: data.actionUrl || null,
      actionLabel: data.actionLabel || 'View',
      metadata: data.metadata || {},
      priority: data.priority || 'medium',
      expiresAt: data.expiresAt || null,
      sentAt: new Date()
    });

    await notification.populate('user', 'name email avatar');

    if (io) {
      const unreadCount = await Notification.countDocuments({
        user: userId,
        read: false,
        isDeleted: false
      });

      io.to(`user-${userId}`).emit('new-notification', {
        notification,
        unreadCount
      });

      io.to('admin-room').emit('admin-notification', {
        type: 'new-notification',
        notification: {
          ...notification.toObject(),
          userName: user.name,
          userEmail: user.email
        },
        userId,
        userName: user.name,
        message: `📬 New ${data.type} notification sent to ${user.name}`,
        timestamp: new Date()
      });
    }

    console.log(`✅ Notification created for user ${userId}: ${data.title}`);
    return notification;
  } catch (error) {
    console.error('❌ [NotificationHelper] Error:', error);
    return null;
  }
};

/**
 * Create notifications for multiple users
 */
export const createBulkNotifications = async (io, userIds, data) => {
  const results = [];
  for (const userId of userIds) {
    const result = await createNotification(io, userId, data);
    if (result) results.push(result);
  }
  return results;
};

/**
 * Notify all users
 */
export const notifyAllUsers = async (io, data) => {
  try {
    const users = await User.find({ role: 'user' }).select('_id');
    const userIds = users.map(u => u._id);
    return await createBulkNotifications(io, userIds, data);
  } catch (error) {
    console.error('❌ [notifyAllUsers] Error:', error);
    return [];
  }
};

/**
 * Notify all admins
 */
export const notifyAdmins = async (io, data) => {
  try {
    const admins = await User.find({ role: 'admin' }).select('_id');
    const userIds = admins.map(u => u._id);
    return await createBulkNotifications(io, userIds, data);
  } catch (error) {
    console.error('❌ [notifyAdmins] Error:', error);
    return [];
  }
};
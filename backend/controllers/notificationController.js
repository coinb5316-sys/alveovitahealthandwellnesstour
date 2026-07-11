// backend/controllers/notificationController.js
import Notification from '../models/Notification.js';
import User from '../models/User.js';

// ============================================
// USER NOTIFICATION FUNCTIONS
// ============================================

export const getUserNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, read, type } = req.query;
    
    const query = {
      user: req.user.id,
      isDeleted: false
    };
    
    if (read === 'true') {
      query.read = true;
    } else if (read === 'false') {
      query.read = false;
    }
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Notification.countDocuments(query),
      Notification.getUnreadCount(req.user.id)
    ]);
    
    const hasMore = total > skip + notifications.length;
    
    res.json({
      success: true,
      notifications,
      total,
      unreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        hasMore,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ Get user notifications error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch notifications'
    });
  }
};

export const getNotificationStats = async (req, res) => {
  try {
    const unread = await Notification.getUnreadCount(req.user.id);
    const total = await Notification.countDocuments({
      user: req.user.id,
      isDeleted: false
    });
    
    res.json({
      success: true,
      stats: {
        unread,
        total
      }
    });
  } catch (error) {
    console.error('❌ Get notification stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get notification stats'
    });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user.id,
      isDeleted: false
    });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    await notification.markAsRead();
    
    const unreadCount = await Notification.getUnreadCount(req.user.id);
    
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${req.user.id}`).emit('notification-read', {
        notificationId: notification._id,
        unreadCount
      });
    }
    
    res.json({
      success: true,
      notification,
      unreadCount,
      message: 'Notification marked as read'
    });
  } catch (error) {
    console.error('❌ Mark notification as read error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to mark notification as read'
    });
  }
};

export const markAllAsRead = async (req, res) => {
  try {
    await Notification.markAllAsRead(req.user.id);
    
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${req.user.id}`).emit('all-notifications-read', {
        userId: req.user.id
      });
    }
    
    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('❌ Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to mark all as read'
    });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOne({
      _id: req.params.id,
      user: req.user.id,
      isDeleted: false
    });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    await notification.softDelete();
    
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${req.user.id}`).emit('notification-deleted', {
        notificationId: notification._id
      });
    }
    
    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('❌ Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete notification'
    });
  }
};

export const deleteAllNotifications = async (req, res) => {
  try {
    await Notification.deleteAll(req.user.id);
    
    const io = req.app.get('io');
    if (io) {
      io.to(`user-${req.user.id}`).emit('all-notifications-deleted', {
        userId: req.user.id
      });
    }
    
    res.json({
      success: true,
      message: 'All notifications deleted'
    });
  } catch (error) {
    console.error('❌ Delete all notifications error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete all notifications'
    });
  }
};

// ============================================
// ADMIN NOTIFICATION FUNCTIONS
// ============================================

export const getAdminNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, read, type, userId } = req.query;
    
    const query = { isDeleted: false };
    
    if (userId && userId !== 'all') {
      query.user = userId;
    }
    
    if (read === 'true') {
      query.read = true;
    } else if (read === 'false') {
      query.read = false;
    }
    
    if (type && type !== 'all') {
      query.type = type;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const [notifications, total, unreadCount] = await Promise.all([
      Notification.find(query)
        .populate('user', 'name email avatar')
        .populate('createdBy', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Notification.countDocuments(query),
      Notification.countDocuments({ read: false, isDeleted: false })
    ]);
    
    const hasMore = total > skip + notifications.length;
    
    res.json({
      success: true,
      notifications,
      total,
      unreadCount,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        hasMore,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('❌ Get admin notifications error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch admin notifications'
    });
  }
};

export const adminMarkAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { read: false, isDeleted: false },
      { read: true, readAt: new Date() }
    );
    
    const io = req.app.get('io');
    if (io) {
      io.emit('all-notifications-read', {
        adminId: req.user.id
      });
    }
    
    res.json({
      success: true,
      message: `All ${result.modifiedCount} notifications marked as read`,
      count: result.modifiedCount
    });
  } catch (error) {
    console.error('❌ Admin mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to mark all as read'
    });
  }
};

export const adminDeleteAllNotifications = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { isDeleted: false },
      { isDeleted: true, deletedAt: new Date() }
    );
    
    const io = req.app.get('io');
    if (io) {
      io.emit('all-notifications-deleted', {
        adminId: req.user.id
      });
    }
    
    res.json({
      success: true,
      message: `All ${result.modifiedCount} notifications deleted`,
      count: result.modifiedCount
    });
  } catch (error) {
    console.error('❌ Admin delete all notifications error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete all notifications'
    });
  }
};

export const adminDeleteNotification = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, isDeleted: false },
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    const io = req.app.get('io');
    if (io && notification.user) {
      io.to(`user-${notification.user}`).emit('notification-deleted', {
        notificationId: notification._id
      });
    }
    
    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('❌ Admin delete notification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete notification'
    });
  }
};

export const createAdminNotification = async (req, res) => {
  try {
    const { userId, type, title, message, icon, color, bgColor, priority, actionUrl, actionLabel, metadata } = req.body;
    
    if (!userId || !type || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'userId, type, title, and message are required'
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    const notification = await Notification.create({
      user: userId,
      type,
      title,
      message,
      icon: icon || 'Bell',
      color: color || 'text-amber-500',
      bgColor: bgColor || 'bg-amber-500/10',
      priority: priority || 'medium',
      actionUrl: actionUrl || null,
      actionLabel: actionLabel || null,
      metadata: metadata || {},
      createdBy: req.user.id
    });
    
    const io = req.app.get('io');
    if (io) {
      const unreadCount = await Notification.getUnreadCount(userId);
      io.to(`user-${userId}`).emit('new-notification', {
        notification,
        unreadCount
      });
      
      io.to('admin-room').emit('admin-notification', {
        type: 'notification-created',
        userId,
        userName: user.name,
        title,
        message,
        createdBy: req.user.name,
        timestamp: new Date()
      });
    }
    
    res.status(201).json({
      success: true,
      notification,
      message: 'Notification created successfully'
    });
  } catch (error) {
    console.error('❌ Create admin notification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create notification'
    });
  }
};

export const createBulkNotifications = async (req, res) => {
  try {
    const { userIds, type, title, message, icon, color, bgColor, priority, actionUrl, actionLabel, metadata } = req.body;
    
    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'userIds array is required'
      });
    }
    
    if (!type || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'type, title, and message are required'
      });
    }
    
    const users = await User.find({ _id: { $in: userIds } });
    const validUserIds = users.map(u => u._id.toString());
    
    if (validUserIds.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No valid users found'
      });
    }
    
    const notifications = await Notification.insertMany(
      validUserIds.map(userId => ({
        user: userId,
        type,
        title,
        message,
        icon: icon || 'Bell',
        color: color || 'text-amber-500',
        bgColor: bgColor || 'bg-amber-500/10',
        priority: priority || 'medium',
        actionUrl: actionUrl || null,
        actionLabel: actionLabel || null,
        metadata: metadata || {},
        createdBy: req.user.id
      }))
    );
    
    const io = req.app.get('io');
    if (io) {
      for (const notification of notifications) {
        const unreadCount = await Notification.getUnreadCount(notification.user);
        io.to(`user-${notification.user}`).emit('new-notification', {
          notification,
          unreadCount
        });
      }
    }
    
    res.status(201).json({
      success: true,
      count: notifications.length,
      message: `${notifications.length} notifications created successfully`
    });
  } catch (error) {
    console.error('❌ Create bulk notifications error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create bulk notifications'
    });
  }
};
import Notification from '../models/Notification.js';
import User from '../models/User.js';

// @desc    Get user notifications (with admin support)
// @route   GET /api/notifications
export const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, read, type, priority, admin = 'false' } = req.query;
    
    // Build query based on user role
    const query = { isDeleted: false };
    
    // If admin and admin=true, show all notifications (no user filter)
    if (req.user.role === 'admin' && admin === 'true') {
      // Admins can see all notifications
      delete query.user;
    } else {
      // Regular users see only their own
      query.user = req.user.id;
    }
    
    if (read === 'true') query.read = true;
    if (read === 'false') query.read = false;
    if (type && type !== 'all') query.type = type;
    if (priority && priority !== 'all') query.priority = priority;

    // Don't show expired notifications
    query.$or = [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ];

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // If admin viewing all, populate user data
    let notifications = await Notification.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum + 1);

    // Populate user data for admin view
    if (req.user.role === 'admin' && admin === 'true') {
      notifications = await Notification.populate(notifications, {
        path: 'user',
        select: 'name email avatar'
      });
    }

    const hasMore = notifications.length > limitNum;
    if (hasMore) notifications.pop();

    const total = await Notification.countDocuments(query);
    
    // Get unread count for the current user (or all unread for admin)
    let unreadCount;
    if (req.user.role === 'admin' && admin === 'true') {
      unreadCount = await Notification.countDocuments({ 
        read: false,
        isDeleted: false
      });
    } else {
      unreadCount = await Notification.countDocuments({ 
        user: req.user.id, 
        read: false,
        isDeleted: false
      });
    }

    res.json({
      success: true,
      notifications,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum,
        hasMore
      },
      unreadCount,
      total
    });
  } catch (error) {
    console.error('❌ Get notifications error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch notifications'
    });
  }
};

// @desc    Get notification by ID
// @route   GET /api/notifications/:id
export const getNotificationById = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if user owns this notification or is admin
    if (notification.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this notification'
      });
    }

    // Mark as read
    if (!notification.read) {
      notification.read = true;
      notification.readAt = new Date();
      await notification.save();
    }

    // Populate user if admin
    if (req.user.role === 'admin') {
      await notification.populate('user', 'name email avatar');
    }

    res.json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('❌ Get notification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch notification'
    });
  }
};

// @desc    Create notification
// @route   POST /api/notifications
export const createNotification = async (req, res) => {
  try {
    const io = req.app.get('io');
    const { userId, type, title, message, icon, color, bgColor, actionUrl, actionLabel, metadata, priority, expiresAt } = req.body;

    if (!userId || !type || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'User ID, type, title and message are required'
      });
    }

    // Check if user exists
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
      color: color || 'text-blue-500',
      bgColor: bgColor || 'bg-blue-500/10',
      actionUrl: actionUrl || null,
      actionLabel: actionLabel || null,
      metadata: metadata || {},
      priority: priority || 'medium',
      expiresAt: expiresAt || null,
      sentAt: new Date()
    });

    // Populate user data for admin notifications
    await notification.populate('user', 'name email avatar');

    // Emit real-time notification to user
    if (io) {
      const unreadCount = await Notification.countDocuments({ 
        user: userId, 
        read: false,
        isDeleted: false
      });
      
      // Send to user's personal room
      io.to(`user-${userId}`).emit('new-notification', {
        notification,
        unreadCount
      });
      
      // Also emit to admin room for monitoring
      io.to('admin-room').emit('admin-notification', {
        type: 'new-notification',
        notification: {
          ...notification.toObject(),
          userName: user.name,
          userEmail: user.email
        },
        userId,
        userName: user.name,
        message: `📬 New ${type} notification sent to ${user.name}`,
        timestamp: new Date()
      });
    }

    res.status(201).json({
      success: true,
      notification,
      message: 'Notification created successfully'
    });
  } catch (error) {
    console.error('❌ Create notification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create notification'
    });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
export const markAsRead = async (req, res) => {
  try {
    const io = req.app.get('io');
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if user owns this notification or is admin
    if (notification.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this notification'
      });
    }

    notification.read = true;
    notification.readAt = new Date();
    await notification.save();

    // Get updated unread count for the user
    const unreadCount = await Notification.countDocuments({
      user: notification.user,
      read: false,
      isDeleted: false
    });

    // Emit real-time update
    if (io) {
      io.to(`user-${notification.user}`).emit('notification-read', {
        notificationId: notification._id,
        unreadCount
      });
    }

    res.json({
      success: true,
      notification,
      unreadCount
    });
  } catch (error) {
    console.error('❌ Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to mark notification as read'
    });
  }
};

// @desc    Mark all notifications as read (for user or admin)
// @route   PUT /api/notifications/read-all
export const markAllAsRead = async (req, res) => {
  try {
    const io = req.app.get('io');
    const { userId } = req.query; // For admin marking specific user's notifications
    
    // Determine which user's notifications to mark
    let targetUserId = req.user.id;
    let isAdminAction = false;
    
    if (req.user.role === 'admin' && userId) {
      targetUserId = userId;
      isAdminAction = true;
    }
    
    const result = await Notification.updateMany(
      { 
        user: targetUserId, 
        read: false,
        isDeleted: false
      },
      { 
        read: true, 
        readAt: new Date() 
      }
    );

    // Emit real-time update
    if (io) {
      io.to(`user-${targetUserId}`).emit('all-notifications-read', {
        userId: targetUserId,
        updatedCount: result.modifiedCount
      });
      
      if (isAdminAction) {
        io.to('admin-room').emit('admin-notification', {
          type: 'all-notifications-read',
          userId: targetUserId,
          message: `All notifications marked as read for user by admin ${req.user.name}`,
          timestamp: new Date()
        });
      }
    }

    res.json({
      success: true,
      message: `Marked ${result.modifiedCount} notifications as read`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('❌ Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to mark notifications as read'
    });
  }
};

// @desc    Delete notification
// @route   DELETE /api/notifications/:id
export const deleteNotification = async (req, res) => {
  try {
    const io = req.app.get('io');
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    // Check if user owns this notification or is admin
    if (notification.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this notification'
      });
    }

    // Soft delete
    notification.isDeleted = true;
    notification.deletedAt = new Date();
    await notification.save();

    // Emit real-time update
    if (io) {
      io.to(`user-${notification.user}`).emit('notification-deleted', {
        notificationId: notification._id
      });
      
      if (req.user.role === 'admin') {
        io.to('admin-room').emit('admin-notification', {
          type: 'notification-deleted',
          notificationId: notification._id,
          message: `Notification "${notification.title}" deleted by admin ${req.user.name}`,
          timestamp: new Date()
        });
      }
    }

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete notification'
    });
  }
};

// @desc    Delete all notifications (for user or admin)
// @route   DELETE /api/notifications/delete-all
export const deleteAllNotifications = async (req, res) => {
  try {
    const io = req.app.get('io');
    const { userId } = req.query; // For admin deleting specific user's notifications
    
    let targetUserId = req.user.id;
    let isAdminAction = false;
    
    if (req.user.role === 'admin' && userId) {
      targetUserId = userId;
      isAdminAction = true;
    }
    
    const result = await Notification.updateMany(
      { 
        user: targetUserId,
        isDeleted: false
      },
      { 
        isDeleted: true, 
        deletedAt: new Date() 
      }
    );

    // Emit real-time update
    if (io) {
      io.to(`user-${targetUserId}`).emit('all-notifications-deleted', {
        userId: targetUserId,
        deletedCount: result.modifiedCount
      });
      
      if (isAdminAction) {
        io.to('admin-room').emit('admin-notification', {
          type: 'all-notifications-deleted',
          userId: targetUserId,
          message: `All notifications deleted for user by admin ${req.user.name}`,
          timestamp: new Date()
        });
      }
    }

    res.json({
      success: true,
      message: `Deleted ${result.modifiedCount} notifications`,
      deletedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('❌ Delete all notifications error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete notifications'
    });
  }
};

// @desc    Get notification stats (for user or admin)
// @route   GET /api/notifications/stats
export const getNotificationStats = async (req, res) => {
  try {
    const { userId } = req.query;
    let targetUserId = req.user.id;
    
    if (req.user.role === 'admin' && userId) {
      targetUserId = userId;
    }
    
    const total = await Notification.countDocuments({
      user: targetUserId,
      isDeleted: false
    });

    const unread = await Notification.countDocuments({
      user: targetUserId,
      read: false,
      isDeleted: false
    });

    const byType = await Notification.aggregate([
      { $match: { user: targetUserId, isDeleted: false } },
      { $group: { _id: '$type', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    const byPriority = await Notification.aggregate([
      { $match: { user: targetUserId, isDeleted: false } },
      { $group: { _id: '$priority', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      success: true,
      stats: {
        total,
        unread,
        byType,
        byPriority
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

// @desc    Create bulk notifications
// @route   POST /api/notifications/bulk
export const createBulkNotifications = async (req, res) => {
  try {
    const io = req.app.get('io');
    const { userIds, type, title, message, icon, color, bgColor, actionUrl, actionLabel, metadata, priority, expiresAt } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array is required'
      });
    }

    if (!type || !title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Type, title and message are required'
      });
    }

    const notifications = [];
    const now = new Date();

    for (const userId of userIds) {
      const notification = {
        user: userId,
        type,
        title,
        message,
        icon: icon || 'Bell',
        color: color || 'text-blue-500',
        bgColor: bgColor || 'bg-blue-500/10',
        actionUrl: actionUrl || null,
        actionLabel: actionLabel || null,
        metadata: metadata || {},
        priority: priority || 'medium',
        expiresAt: expiresAt || null,
        sentAt: now
      };
      notifications.push(notification);
    }

    const created = await Notification.insertMany(notifications);

    // Emit real-time notifications
    if (io) {
      for (const notification of created) {
        const unreadCount = await Notification.countDocuments({
          user: notification.user,
          read: false,
          isDeleted: false
        });
        
        io.to(`user-${notification.user}`).emit('new-notification', {
          notification,
          unreadCount
        });
      }
      
      // Admin notification
      io.to('admin-room').emit('admin-notification', {
        type: 'bulk-notifications',
        count: created.length,
        message: `📨 ${created.length} bulk notifications sent by ${req.user.name}`,
        timestamp: new Date()
      });
    }

    res.status(201).json({
      success: true,
      count: created.length,
      message: `Created ${created.length} notifications successfully`
    });
  } catch (error) {
    console.error('❌ Create bulk notifications error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create notifications'
    });
  }
};

// @desc    Get admin notifications (all users)
// @route   GET /api/notifications/admin
export const getAdminNotifications = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { page = 1, limit = 20, read, type, priority, userId, search } = req.query;
    
    const query = { isDeleted: false };
    
    if (userId) query.user = userId;
    if (read === 'true') query.read = true;
    if (read === 'false') query.read = false;
    if (type && type !== 'all') query.type = type;
    if (priority && priority !== 'all') query.priority = priority;

    // Don't show expired notifications
    query.$or = [
      { expiresAt: { $exists: false } },
      { expiresAt: { $gt: new Date() } }
    ];

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let notifications = await Notification.find(query)
      .populate('user', 'name email avatar')
      .sort({ priority: -1, createdAt: -1 })
      .skip(skip)
      .limit(limitNum + 1);

    const hasMore = notifications.length > limitNum;
    if (hasMore) notifications.pop();

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.countDocuments({ 
      read: false,
      isDeleted: false
    });

    res.json({
      success: true,
      notifications,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum,
        hasMore
      },
      unreadCount,
      total
    });
  } catch (error) {
    console.error('❌ Get admin notifications error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch admin notifications'
    });
  }
};
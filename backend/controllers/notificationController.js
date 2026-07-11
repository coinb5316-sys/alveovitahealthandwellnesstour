import Notification from '../models/Notification.js';
import User from '../models/User.js';

// ============================================
// FIXED: Get user notifications with proper admin handling
// ============================================
export const getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, read, type, priority, admin = 'false' } = req.query;
    
    console.log('📡 [getNotifications] Request:', {
      userId: req.user?.id,
      userRole: req.user?.role,
      admin: admin,
      query: req.query
    });
    
    // Build query
    const query = { isDeleted: false };
    
    // IMPORTANT FIX: Only filter by user if NOT admin viewing all
    if (req.user.role === 'admin' && admin === 'true') {
      // Admin viewing all notifications - no user filter
      console.log('👑 Admin viewing all notifications');
    } else {
      // Regular user or admin viewing their own
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
    
    // Get unread count based on role
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
    console.error('❌ [getNotifications] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch notifications'
    });
  }
};

// ============================================
// FIXED: Get admin notifications (all users)
// ============================================
export const getAdminNotifications = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required'
      });
    }

    const { page = 1, limit = 20, read, type, priority, userId, search } = req.query;
    
    console.log('👑 [getAdminNotifications] Request:', {
      adminId: req.user?.id,
      query: req.query
    });
    
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
    console.error('❌ [getAdminNotifications] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch admin notifications'
    });
  }
};

// ============================================
// FIXED: Get notification by ID
// ============================================
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
    console.error('❌ [getNotificationById] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch notification'
    });
  }
};

// ============================================
// FIXED: Create notification
// ============================================
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

    await notification.populate('user', 'name email avatar');

    // Emit real-time notification
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
    console.error('❌ [createNotification] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create notification'
    });
  }
};

// ============================================
// FIXED: Mark as read
// ============================================
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

    // Get updated unread count
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
    console.error('❌ [markAsRead] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to mark notification as read'
    });
  }
};

// ============================================
// FIXED: Mark all as read
// ============================================
export const markAllAsRead = async (req, res) => {
  try {
    const io = req.app.get('io');
    const { userId } = req.query;
    
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
    console.error('❌ [markAllAsRead] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to mark notifications as read'
    });
  }
};

// ============================================
// FIXED: Delete notification
// ============================================
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
    console.error('❌ [deleteNotification] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete notification'
    });
  }
};

// ============================================
// FIXED: Delete all notifications
// ============================================
export const deleteAllNotifications = async (req, res) => {
  try {
    const io = req.app.get('io');
    const { userId } = req.query;
    
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
    console.error('❌ [deleteAllNotifications] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete notifications'
    });
  }
};

// ============================================
// FIXED: Get notification stats
// ============================================
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
    console.error('❌ [getNotificationStats] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get notification stats'
    });
  }
};

// ============================================
// FIXED: Create bulk notifications
// ============================================
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
    console.error('❌ [createBulkNotifications] Error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create notifications'
    });
  }
};
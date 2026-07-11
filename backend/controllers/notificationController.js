// backend/controllers/notificationController.js
import Notification from '../models/Notification.js';
import User from '../models/User.js';

// ============================================
// GET NOTIFICATIONS FOR A USER (PAGINATED)
// ============================================
export const getUserNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, filter = 'all' } = req.query;
    const userId = req.user.id;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Build query
    const query = {
      user: userId,
      isDeleted: false,
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    };
    
    // Apply filters
    if (filter === 'unread') {
      query.read = false;
    } else if (filter === 'read') {
      query.read = true;
    } else if (filter !== 'all') {
      query.type = filter;
    }
    
    // Get notifications with pagination
    const notifications = await Notification.find(query)
      .sort({ priority: -1, createdAt: -1 })
      .limit(limitNum)
      .skip(skip)
      .lean();
    
    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.getUnreadCount(userId);
    
    // Format notifications for frontend
    const formattedNotifications = notifications.map(notif => ({
      ...notif,
      timeAgo: getTimeAgo(notif.createdAt),
      isUnread: !notif.read,
    }));
    
    res.json({
      success: true,
      notifications: formattedNotifications,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum,
      },
      unreadCount,
    });
  } catch (error) {
    console.error('❌ Get user notifications error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch notifications'
    });
  }
};

// ============================================
// GET ADMIN NOTIFICATIONS (ALL USERS)
// ============================================
export const getAdminNotifications = async (req, res) => {
  try {
    // Only admins can access this
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Admin only.'
      });
    }
    
    const { page = 1, limit = 20, filter = 'all', userId } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    
    // Build query
    const query = {
      isDeleted: false,
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    };
    
    // Filter by user if provided
    if (userId) {
      query.user = userId;
    }
    
    // Apply filters
    if (filter === 'unread') {
      query.read = false;
    } else if (filter === 'read') {
      query.read = true;
    } else if (filter !== 'all') {
      query.type = filter;
    }
    
    // Get notifications with user population
    const notifications = await Notification.find(query)
      .populate('user', 'name email avatar role')
      .populate('sender', 'name email avatar')
      .sort({ priority: -1, createdAt: -1 })
      .limit(limitNum)
      .skip(skip)
      .lean();
    
    const total = await Notification.countDocuments(query);
    
    // Get stats
    const stats = await getAdminNotificationStats();
    
    res.json({
      success: true,
      notifications,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum,
      },
      stats,
    });
  } catch (error) {
    console.error('❌ Get admin notifications error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch admin notifications'
    });
  }
};

// ============================================
// GET NOTIFICATION BY ID
// ============================================
export const getNotificationById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findOne({
      _id: id,
      user: req.user.id,
      isDeleted: false,
    }).lean();
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    // Mark as seen
    if (!notification.seen) {
      await Notification.findByIdAndUpdate(id, {
        seen: true,
        seenAt: new Date(),
      });
    }
    
    res.json({
      success: true,
      notification: {
        ...notification,
        timeAgo: getTimeAgo(notification.createdAt),
      },
    });
  } catch (error) {
    console.error('❌ Get notification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch notification'
    });
  }
};

// ============================================
// MARK NOTIFICATION AS READ
// ============================================
export const markAsRead = async (req, res) => {
  try {
    const io = req.app.get('io');
    const { id } = req.params;
    
    const notification = await Notification.findOne({
      _id: id,
      user: req.user.id,
      isDeleted: false,
    });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    await notification.markAsRead();
    
    // Get updated unread count
    const unreadCount = await Notification.getUnreadCount(req.user.id);
    
    // Emit socket event
    if (io) {
      io.to(`user-${req.user.id}`).emit('notification-read', {
        notificationId: id,
        unreadCount,
      });
    }
    
    res.json({
      success: true,
      message: 'Notification marked as read',
      unreadCount,
    });
  } catch (error) {
    console.error('❌ Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to mark notification as read'
    });
  }
};

// ============================================
// MARK ALL NOTIFICATIONS AS READ
// ============================================
export const markAllAsRead = async (req, res) => {
  try {
    const io = req.app.get('io');
    
    const result = await Notification.markAllAsRead(req.user.id);
    
    // Get updated unread count
    const unreadCount = await Notification.getUnreadCount(req.user.id);
    
    // Emit socket event
    if (io) {
      io.to(`user-${req.user.id}`).emit('all-notifications-read', {
        unreadCount: 0,
      });
    }
    
    res.json({
      success: true,
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount,
      unreadCount,
    });
  } catch (error) {
    console.error('❌ Mark all as read error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to mark all as read'
    });
  }
};

// ============================================
// DELETE NOTIFICATION
// ============================================
export const deleteNotification = async (req, res) => {
  try {
    const io = req.app.get('io');
    const { id } = req.params;
    
    const notification = await Notification.findOne({
      _id: id,
      user: req.user.id,
      isDeleted: false,
    });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    notification.isDeleted = true;
    notification.deletedAt = new Date();
    notification.deletedBy = req.user.id;
    await notification.save();
    
    // Get updated unread count
    const unreadCount = await Notification.getUnreadCount(req.user.id);
    
    // Emit socket event
    if (io) {
      io.to(`user-${req.user.id}`).emit('notification-deleted', {
        notificationId: id,
        unreadCount,
      });
    }
    
    res.json({
      success: true,
      message: 'Notification deleted',
      unreadCount,
    });
  } catch (error) {
    console.error('❌ Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete notification'
    });
  }
};

// ============================================
// DELETE ALL NOTIFICATIONS (READ ONLY)
// ============================================
export const deleteAllRead = async (req, res) => {
  try {
    const io = req.app.get('io');
    
    const result = await Notification.deleteAllRead(req.user.id);
    
    // Get updated unread count
    const unreadCount = await Notification.getUnreadCount(req.user.id);
    
    // Emit socket event
    if (io) {
      io.to(`user-${req.user.id}`).emit('all-notifications-deleted', {
        unreadCount,
      });
    }
    
    res.json({
      success: true,
      message: 'All read notifications deleted',
      modifiedCount: result.modifiedCount,
      unreadCount,
    });
  } catch (error) {
    console.error('❌ Delete all read error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete read notifications'
    });
  }
};

// ============================================
// GET NOTIFICATION STATS
// ============================================
export const getNotificationStats = async (req, res) => {
  try {
    const stats = await getAdminNotificationStats();
    
    // Get user's unread count
    const userUnread = await Notification.getUnreadCount(req.user.id);
    
    res.json({
      success: true,
      stats: {
        ...stats,
        userUnread,
      },
    });
  } catch (error) {
    console.error('❌ Get notification stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get notification stats'
    });
  }
};

// ============================================
// ADMIN: CREATE SYSTEM NOTIFICATION
// ============================================
export const createSystemNotification = async (req, res) => {
  try {
    const io = req.app.get('io');
    
    const { 
      title, 
      message, 
      type = 'system', 
      icon, 
      color, 
      bgColor, 
      actionUrl, 
      actionLabel, 
      priority = 'medium',
      target = 'all', // 'all', 'users', 'admins', or specific userId
      metadata = {},
    } = req.body;
    
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }
    
    let users = [];
    
    if (target === 'all') {
      users = await User.find({ status: 'active' }).select('_id');
    } else if (target === 'users') {
      users = await User.find({ role: 'user', status: 'active' }).select('_id');
    } else if (target === 'admins') {
      users = await User.find({ role: 'admin', status: 'active' }).select('_id');
    } else if (target === 'specific' && req.body.userId) {
      const user = await User.findById(req.body.userId).select('_id');
      if (user) users = [user];
    }
    
    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No users found for this notification'
      });
    }
    
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
        group: target === 'all' ? 'all' : target === 'admins' ? 'admins' : 'specific',
        metadata: metadata || {},
        sender: req.user.id,
        senderName: req.user.name,
        senderAvatar: req.user.avatar || null,
      });
    }
    
    const created = await Notification.insertMany(notifications);
    
    // Emit socket events
    if (io) {
      for (const notif of created) {
        const unreadCount = await Notification.getUnreadCount(notif.user);
        io.to(`user-${notif.user}`).emit('new-notification', {
          notification: notif,
          unreadCount,
        });
      }
    }
    
    res.status(201).json({
      success: true,
      message: `System notification sent to ${created.length} users`,
      count: created.length,
    });
  } catch (error) {
    console.error('❌ Create system notification error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create system notification'
    });
  }
};

// ============================================
// GET NOTIFICATION TYPES
// ============================================
export const getNotificationTypes = async (req, res) => {
  res.json({
    success: true,
    types: [
      { value: 'all', label: 'All' },
      { value: 'booking', label: 'Bookings' },
      { value: 'payment', label: 'Payments' },
      { value: 'review', label: 'Reviews' },
      { value: 'message', label: 'Messages' },
      { value: 'system', label: 'System' },
      { value: 'tour', label: 'Tours' },
      { value: 'hotel', label: 'Hotels' },
      { value: 'destination', label: 'Destinations' },
      { value: 'experience', label: 'Experiences' },
      { value: 'reminder', label: 'Reminders' },
      { value: 'promotion', label: 'Promotions' },
      { value: 'alert', label: 'Alerts' },
    ]
  });
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function getTimeAgo(date) {
  const now = new Date();
  const diff = now - new Date(date);
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  if (seconds < 60) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  if (weeks < 4) return `${weeks}w ago`;
  if (months < 12) return `${months}mo ago`;
  return `${years}y ago`;
}

async function getAdminNotificationStats() {
  const total = await Notification.countDocuments({ isDeleted: false });
  const unread = await Notification.countDocuments({ read: false, isDeleted: false });
  const read = await Notification.countDocuments({ read: true, isDeleted: false });
  
  // Count by type
  const byType = await Notification.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: '$type', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  
  // Count by priority
  const byPriority = await Notification.aggregate([
    { $match: { isDeleted: false } },
    { $group: { _id: '$priority', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]);
  
  // Last 7 days trend
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const trend = await Notification.aggregate([
    { 
      $match: { 
        isDeleted: false,
        createdAt: { $gte: sevenDaysAgo }
      }
    },
    {
      $group: {
        _id: { 
          $dateToString: { format: '%Y-%m-%d', date: '$createdAt' }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } },
  ]);
  
  return {
    total,
    unread,
    read,
    byType,
    byPriority,
    trend,
  };
}
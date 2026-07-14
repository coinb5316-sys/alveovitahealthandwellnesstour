// controllers/notificationController.js - Alveoly Pattern (COMPLETE)
import Notification from "../models/Notification.js";
import { io, emitNotification, emitAdminNotification } from "../server.js";

// ================= CREATE NOTIFICATION =================
export const createNotification = async (userId, userRole, type, title, message, link = null, metadata = {}) => {
  try {
    const notification = await Notification.create({
      userId,
      userRole,
      type,
      title,
      message,
      link,
      metadata
    });
    
    const notificationData = {
      id: notification._id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      link: notification.link,
      createdAt: notification.createdAt,
      read: notification.read
    };
    
    // Emit real-time notification via Socket.IO
    if (typeof emitNotification === 'function') {
      emitNotification(userId, notificationData);
    } else {
      // Fallback to direct io emit
      io.to(userId.toString()).emit("new_notification", notificationData);
      io.to(`user_${userId}`).emit("new_notification", notificationData);
    }
    
    // Emit to admin room for admin notifications
    if (userRole === "admin") {
      const adminData = {
        id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        createdAt: notification.createdAt,
        userId: userId
      };
      
      if (typeof emitAdminNotification === 'function') {
        emitAdminNotification(adminData);
      } else {
        io.to("admin").emit("new_admin_notification", adminData);
        io.to("admin_notifications").emit("new_admin_notification", adminData);
      }
    }
    
    console.log(`📢 Notification created for ${userRole}: ${title}`);
    return notification;
  } catch (err) {
    console.error("Create notification error:", err);
    return null;
  }
};

// ================= BULK CREATE NOTIFICATIONS =================
export const createBulkNotifications = async (users, notificationData) => {
  try {
    const notifications = [];
    for (const user of users) {
      const notification = await Notification.create({
        userId: user._id || user,
        userRole: user.role || "user",
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        link: notificationData.link,
        metadata: notificationData.metadata || {}
      });
      
      notifications.push(notification);
      
      // Emit to each user
      const notifData = {
        id: notification._id,
        type: notification.type,
        title: notification.title,
        message: notification.message,
        link: notification.link,
        createdAt: notification.createdAt
      };
      
      io.to(user._id?.toString() || user.toString()).emit("new_notification", notifData);
    }
    
    console.log(`📢 Bulk notifications sent to ${notifications.length} users`);
    return notifications;
  } catch (err) {
    console.error("Bulk create notifications error:", err);
    return [];
  }
};

// ================= GET USER NOTIFICATIONS =================
export const getUserNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const filter = { userId: req.user._id };
    if (unreadOnly === "true") filter.read = false;
    
    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Notification.countDocuments(filter)
    ]);
    
    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      read: false
    });
    
    // Format notifications for frontend
    const formattedNotifications = notifications.map(notif => ({
      _id: notif._id,
      type: notif.type,
      title: notif.title,
      message: notif.message,
      link: notif.link,
      read: notif.read,
      createdAt: notif.createdAt,
      metadata: notif.metadata
    }));
    
    res.json({
      success: true,
      notifications: formattedNotifications,
      unreadCount,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / parseInt(limit)),
        limit: parseInt(limit)
      }
    });
  } catch (err) {
    console.error("Get notifications error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= MARK NOTIFICATION AS READ =================
export const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { read: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    res.json({ 
      success: true, 
      notification: {
        _id: notification._id,
        read: notification.read
      }
    });
  } catch (err) {
    console.error("Mark as read error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= MARK ALL AS READ =================
export const markAllAsRead = async (req, res) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.user._id, read: false },
      { read: true }
    );
    
    res.json({ 
      success: true, 
      updatedCount: result.modifiedCount 
    });
  } catch (err) {
    console.error("Mark all as read error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= DELETE NOTIFICATION =================
export const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await Notification.findOneAndDelete({
      _id: id,
      userId: req.user._id
    });
    
    if (!result) {
      return res.status(404).json({ message: "Notification not found" });
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error("Delete notification error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= DELETE ALL NOTIFICATIONS =================
export const deleteAllNotifications = async (req, res) => {
  try {
    const result = await Notification.deleteMany({ userId: req.user._id });
    res.json({ 
      success: true, 
      deletedCount: result.deletedCount 
    });
  } catch (err) {
    console.error("Delete all notifications error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET NOTIFICATION COUNT =================
export const getNotificationCount = async (req, res) => {
  try {
    const unreadCount = await Notification.countDocuments({
      userId: req.user._id,
      read: false
    });
    
    res.json({ unreadCount });
  } catch (err) {
    console.error("Get notification count error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= GET NOTIFICATION STATS (ADMIN) =================
export const getNotificationStats = async (req, res) => {
  try {
    // Only admins can access this
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    
    const total = await Notification.countDocuments();
    const unread = await Notification.countDocuments({ read: false });
    const read = total - unread;
    
    // Get notifications by type
    const byType = await Notification.aggregate([
      { $group: { _id: "$type", count: { $sum: 1 } } }
    ]);
    
    // Get recent activity (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentActivity = await Notification.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: { _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } }, count: { $sum: 1 } } },
      { $sort: { "_id": 1 } }
    ]);
    
    res.json({
      success: true,
      stats: {
        total,
        unread,
        read,
        byType: byType.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {}),
        recentActivity
      }
    });
  } catch (err) {
    console.error("Get notification stats error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ================= SEND TEST NOTIFICATION =================
export const sendTestNotification = async (req, res) => {
  try {
    const { userId, userRole, type, title, message } = req.body;
    
    const notification = await createNotification(
      userId,
      userRole,
      type,
      title,
      message,
      null,
      { test: true }
    );
    
    res.json({
      success: true,
      message: "Test notification sent",
      notification
    });
  } catch (err) {
    console.error("Send test notification error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
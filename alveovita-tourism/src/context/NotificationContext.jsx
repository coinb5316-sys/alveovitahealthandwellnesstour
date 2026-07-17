// src/context/NotificationContext.jsx
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { notificationService } from '../services/notificationService';

export const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  // ============================================
  // FETCH UNREAD COUNT
  // ============================================
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const result = await notificationService.fetchUnreadCount();
      if (result.success) {
        setUnreadCount(result.unreadCount);
      } else {
        setError(result.error);
      }
    } catch (error) {
      console.error('❌ [NotificationContext] fetchUnreadCount error:', error);
      setError(error.message || 'Failed to fetch unread count');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ============================================
  // MARK AS READ
  // ============================================
  const markAsRead = useCallback(async (notificationId) => {
    if (!notificationId) {
      console.warn('⚠️ [NotificationContext] markAsRead called without notificationId');
      return { success: false, error: 'Notification ID is required' };
    }

    try {
      const result = await notificationService.markAsRead(notificationId);
      if (result.success) {
        setUnreadCount(result.unreadCount);
        return result;
      }
      return { success: false, error: result.error };
    } catch (error) {
      console.error('❌ [NotificationContext] markAsRead error:', error);
      return { success: false, error: error.message || 'Failed to mark as read' };
    }
  }, []);

  // ============================================
  // MARK ALL AS READ
  // ============================================
  const markAllAsRead = useCallback(async () => {
    try {
      const result = await notificationService.markAllAsRead();
      if (result.success) {
        setUnreadCount(0);
        return result;
      }
      return { success: false, error: result.error };
    } catch (error) {
      console.error('❌ [NotificationContext] markAllAsRead error:', error);
      return { success: false, error: error.message || 'Failed to mark all as read' };
    }
  }, []);

  // ============================================
  // DELETE NOTIFICATION
  // ============================================
  const deleteNotification = useCallback(async (notificationId) => {
    if (!notificationId) {
      console.warn('⚠️ [NotificationContext] deleteNotification called without notificationId');
      return { success: false, error: 'Notification ID is required' };
    }

    try {
      const result = await notificationService.deleteNotification(notificationId);
      if (result.success) {
        setUnreadCount(result.unreadCount);
        return result;
      }
      return { success: false, error: result.error };
    } catch (error) {
      console.error('❌ [NotificationContext] deleteNotification error:', error);
      return { success: false, error: error.message || 'Failed to delete notification' };
    }
  }, []);

  // ============================================
  // DELETE ALL READ
  // ============================================
  const deleteAllRead = useCallback(async () => {
    try {
      const result = await notificationService.deleteAllRead();
      if (result.success) {
        setUnreadCount(result.unreadCount);
        return result;
      }
      return { success: false, error: result.error };
    } catch (error) {
      console.error('❌ [NotificationContext] deleteAllRead error:', error);
      return { success: false, error: error.message || 'Failed to delete read notifications' };
    }
  }, []);

  // ============================================
  // DELETE ALL NOTIFICATIONS
  // ============================================
  const deleteAllNotifications = useCallback(async () => {
    try {
      const result = await notificationService.deleteAllNotifications();
      if (result.success) {
        setUnreadCount(0);
        return result;
      }
      return { success: false, error: result.error };
    } catch (error) {
      console.error('❌ [NotificationContext] deleteAllNotifications error:', error);
      return { success: false, error: error.message || 'Failed to delete all notifications' };
    }
  }, []);

  // ============================================
  // MARK MULTIPLE AS READ
  // ============================================
  const markMultipleAsRead = useCallback(async (notificationIds) => {
    if (!notificationIds || notificationIds.length === 0) {
      return { success: false, error: 'No notifications selected' };
    }

    try {
      const result = await notificationService.markMultipleAsRead(notificationIds);
      if (result.success) {
        setUnreadCount(result.unreadCount);
        return result;
      }
      return { success: false, error: result.error };
    } catch (error) {
      console.error('❌ [NotificationContext] markMultipleAsRead error:', error);
      return { success: false, error: error.message || 'Failed to mark notifications as read' };
    }
  }, []);

  // ============================================
  // DELETE MULTIPLE
  // ============================================
  const deleteMultiple = useCallback(async (notificationIds) => {
    if (!notificationIds || notificationIds.length === 0) {
      return { success: false, error: 'No notifications selected' };
    }

    try {
      const result = await notificationService.deleteMultiple(notificationIds);
      if (result.success) {
        setUnreadCount(result.unreadCount);
        return result;
      }
      return { success: false, error: result.error };
    } catch (error) {
      console.error('❌ [NotificationContext] deleteMultiple error:', error);
      return { success: false, error: error.message || 'Failed to delete notifications' };
    }
  }, []);

  // ============================================
  // SOCKET EVENT LISTENERS
  // ============================================
  useEffect(() => {
    // Listen for socket events from the global socket
    const socket = window.socket;
    if (!socket) return;

    const handleNewNotification = (data) => {
      if (data.unreadCount !== undefined) {
        setUnreadCount(data.unreadCount);
        notificationService.setUnreadCount(data.unreadCount);
      } else {
        setUnreadCount(prev => prev + 1);
        notificationService.setUnreadCount(unreadCount + 1);
      }
    };

    const handleNotificationRead = (data) => {
      if (data.unreadCount !== undefined) {
        setUnreadCount(data.unreadCount);
        notificationService.setUnreadCount(data.unreadCount);
      } else {
        // Fetch fresh count
        fetchUnreadCount();
      }
    };

    const handleAllRead = () => {
      setUnreadCount(0);
      notificationService.setUnreadCount(0);
    };

    const handleNotificationDeleted = (data) => {
      if (data.unreadCount !== undefined) {
        setUnreadCount(data.unreadCount);
        notificationService.setUnreadCount(data.unreadCount);
      } else {
        fetchUnreadCount();
      }
    };

    // Register socket event listeners
    socket.on('new_notification', handleNewNotification);
    socket.on('new-notification', handleNewNotification);
    socket.on('notification-read', handleNotificationRead);
    socket.on('all-notifications-read', handleAllRead);
    socket.on('notification-deleted', handleNotificationDeleted);

    return () => {
      socket.off('new_notification', handleNewNotification);
      socket.off('new-notification', handleNewNotification);
      socket.off('notification-read', handleNotificationRead);
      socket.off('all-notifications-read', handleAllRead);
      socket.off('notification-deleted', handleNotificationDeleted);
    };
  }, [fetchUnreadCount]);

  // ============================================
  // SERVICE LISTENER FOR COUNT UPDATES
  // ============================================
  useEffect(() => {
    const unsubscribe = notificationService.addListener((event, data) => {
      if (event === 'count-updated' && data.unreadCount !== undefined) {
        setUnreadCount(data.unreadCount);
      }
    });

    return unsubscribe;
  }, []);

  // ============================================
  // FETCH INITIAL COUNT
  // ============================================
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    } else {
      setUnreadCount(0);
    }
  }, [user, fetchUnreadCount]);

  // ============================================
  // CONTEXT VALUE
  // ============================================
  const value = {
    unreadCount,
    loading,
    error,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    deleteAllNotifications,
    markMultipleAsRead,
    deleteMultiple,
    getUnreadCount: notificationService.getUnreadCount.bind(notificationService),
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;
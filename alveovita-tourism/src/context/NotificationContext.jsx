// src/context/NotificationContext.jsx - COMPLETE with Alveoly Pattern
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from '../api/axios';
import { useAuth } from './AuthContext';
import { useSocket } from './SocketContext';

// Export the context directly
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
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await axios.get('/notifications/stats');
      if (response.data.success) {
        setUnreadCount(response.data.stats.userUnread || 0);
      }
    } catch (error) {
      console.error('❌ Failed to fetch unread count:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      const response = await axios.put(`/notifications/${notificationId}/read`);
      if (response.data.success) {
        setUnreadCount(response.data.unreadCount);
        return true;
      }
    } catch (error) {
      console.error('❌ Failed to mark as read:', error);
    }
    return false;
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const response = await axios.put('/notifications/read-all');
      if (response.data.success) {
        setUnreadCount(0);
        return true;
      }
    } catch (error) {
      console.error('❌ Failed to mark all as read:', error);
    }
    return false;
  }, []);

  const deleteNotification = useCallback(async (notificationId) => {
    try {
      const response = await axios.delete(`/notifications/${notificationId}`);
      if (response.data.success) {
        setUnreadCount(response.data.unreadCount);
        return true;
      }
    } catch (error) {
      console.error('❌ Failed to delete notification:', error);
    }
    return false;
  }, []);

  // Socket events (Alveoly Pattern)
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewNotification = (data) => {
      if (data.unreadCount !== undefined) {
        setUnreadCount(data.unreadCount);
      } else {
        setUnreadCount(prev => prev + 1);
      }
    };

    const handleNotificationRead = (data) => {
      if (data.unreadCount !== undefined) {
        setUnreadCount(data.unreadCount);
      }
    };

    const handleAllRead = () => {
      setUnreadCount(0);
    };

    const handleNotificationDeleted = (data) => {
      if (data.unreadCount !== undefined) {
        setUnreadCount(data.unreadCount);
      }
    };

    socket.on('new_notification', handleNewNotification);
    socket.on('new-notification', handleNewNotification); // legacy support
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
  }, [socket, isConnected]);

  // Fetch initial count
  useEffect(() => {
    if (user) {
      fetchUnreadCount();
    }
  }, [user, fetchUnreadCount]);

  const value = {
    unreadCount,
    loading,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
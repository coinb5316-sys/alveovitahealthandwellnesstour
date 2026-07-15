// src/context/NotificationContext.jsx - FIXED
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axios from '../api/axios';
import { useAuth } from './AuthContext';
// ❌ Remove: import { useSocket } from './SocketContext';

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
  // ❌ Remove: const { socket, isConnected } = useSocket();

  const fetchUnreadCount = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      // ✅ Change from /stats to /count
      const response = await axios.get('/notifications/count');
      if (response.data.success) {
        setUnreadCount(response.data.unreadCount || 0);
      }
    } catch (error) {
      console.error('❌ Failed to fetch unread count:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // ... markAsRead, markAllAsRead, deleteNotification remain the same ...

  // ✅ Use global socket or window.socket instead of imported socket
  useEffect(() => {
    // Access socket from the window object (set by SocketProvider)
    const socket = window.socket;
    if (!socket) return;

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

    const handleAllRead = () => setUnreadCount(0);

    const handleNotificationDeleted = (data) => {
      if (data.unreadCount !== undefined) {
        setUnreadCount(data.unreadCount);
      }
    };

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
  }, []);

  // Fetch initial count when user changes
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
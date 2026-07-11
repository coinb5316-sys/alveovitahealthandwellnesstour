// src/hooks/useNotifications.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import axios from '../api/axios';

export const useNotifications = () => {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  
  const isMounted = useRef(true);
  const initialLoadDone = useRef(false);

  // ============================================
  // Fetch notifications
  // ============================================
  const fetchNotifications = useCallback(async (reset = true) => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const currentPage = reset ? 1 : page;
      const endpoint = user?.role === 'admin' 
        ? '/notifications/admin' 
        : '/notifications';
      
      const response = await axios.get(endpoint, {
        params: {
          page: currentPage,
          limit: 20
        }
      });
      
      if (response.data?.success && isMounted.current) {
        const data = response.data;
        const newNotifications = data.notifications || [];
        
        if (reset) {
          setNotifications(newNotifications);
          setPage(1);
        } else {
          setNotifications(prev => [...prev, ...newNotifications]);
        }
        
        setUnreadCount(data.unreadCount || 0);
        setTotal(data.total || 0);
        setHasMore(data.pagination?.hasMore || false);
      }
    } catch (err) {
      console.error('❌ Fetch notifications error:', err);
      setError(err.response?.data?.message || 'Failed to load notifications');
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [user, page]);

  // ============================================
  // Mark as read
  // ============================================
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await axios.put(`/notifications/${notificationId}/read`);
      
      if (isMounted.current) {
        setNotifications(prev => prev.map(n => 
          n._id === notificationId ? { ...n, read: true, readAt: new Date() } : n
        ));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error('❌ Mark as read error:', err);
    }
  }, []);

  // ============================================
  // Mark all as read
  // ============================================
  const markAllAsRead = useCallback(async () => {
    try {
      const endpoint = user?.role === 'admin'
        ? '/notifications/admin/read-all'
        : '/notifications/read-all';
      
      await axios.put(endpoint);
      
      if (isMounted.current) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true, readAt: new Date() })));
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('❌ Mark all as read error:', err);
    }
  }, [user]);

  // ============================================
  // Delete notification
  // ============================================
  const deleteNotification = useCallback(async (notificationId) => {
    try {
      await axios.delete(`/notifications/${notificationId}`);
      
      if (isMounted.current) {
        const deleted = notifications.find(n => n._id === notificationId);
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        setTotal(prev => prev - 1);
        
        if (!deleted?.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (err) {
      console.error('❌ Delete notification error:', err);
    }
  }, [notifications]);

  // ============================================
  // Delete all notifications
  // ============================================
  const deleteAllNotifications = useCallback(async () => {
    try {
      const endpoint = user?.role === 'admin'
        ? '/notifications/admin/delete-all'
        : '/notifications/delete-all';
      
      await axios.delete(endpoint);
      
      if (isMounted.current) {
        setNotifications([]);
        setTotal(0);
        setUnreadCount(0);
      }
    } catch (err) {
      console.error('❌ Delete all notifications error:', err);
    }
  }, [user]);

  // ============================================
  // Refresh notifications
  // ============================================
  const refresh = useCallback(async () => {
    await fetchNotifications(true);
  }, [fetchNotifications]);

  // ============================================
  // Load more
  // ============================================
  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1);
      fetchNotifications(false);
    }
  }, [loading, hasMore, fetchNotifications]);

  // ============================================
  // Socket listeners
  // ============================================
  useEffect(() => {
    if (!socket) return;
    
    const handleNewNotification = (data) => {
      if (data?.notification && isMounted.current) {
        setNotifications(prev => [data.notification, ...prev]);
        setTotal(prev => prev + 1);
        if (!data.notification.read) {
          setUnreadCount(prev => prev + 1);
        }
      }
    };
    
    const handleNotificationRead = (data) => {
      if (isMounted.current) {
        setNotifications(prev => prev.map(n => 
          n._id === data.notificationId ? { ...n, read: true } : n
        ));
        if (data.unreadCount !== undefined) {
          setUnreadCount(data.unreadCount);
        }
      }
    };
    
    const handleAllNotificationsRead = () => {
      if (isMounted.current) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    };
    
    const handleNotificationDeleted = (data) => {
      if (isMounted.current) {
        setNotifications(prev => prev.filter(n => n._id !== data.notificationId));
        setTotal(prev => prev - 1);
      }
    };
    
    const handleAllNotificationsDeleted = () => {
      if (isMounted.current) {
        setNotifications([]);
        setTotal(0);
        setUnreadCount(0);
      }
    };
    
    socket.on('new-notification', handleNewNotification);
    socket.on('notification-read', handleNotificationRead);
    socket.on('all-notifications-read', handleAllNotificationsRead);
    socket.on('notification-deleted', handleNotificationDeleted);
    socket.on('all-notifications-deleted', handleAllNotificationsDeleted);
    
    return () => {
      socket.off('new-notification', handleNewNotification);
      socket.off('notification-read', handleNotificationRead);
      socket.off('all-notifications-read', handleAllNotificationsRead);
      socket.off('notification-deleted', handleNotificationDeleted);
      socket.off('all-notifications-deleted', handleAllNotificationsDeleted);
    };
  }, [socket]);

  // ============================================
  // Initial load
  // ============================================
  useEffect(() => {
    isMounted.current = true;
    
    if (user && !initialLoadDone.current) {
      fetchNotifications(true);
      initialLoadDone.current = true;
    }
    
    return () => {
      isMounted.current = false;
    };
  }, [user]);

  return {
    notifications,
    unreadCount,
    total,
    loading,
    hasMore,
    error,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllNotifications,
    refresh,
    loadMore,
    setNotifications,
    setUnreadCount
  };
};

export default useNotifications;
// src/hooks/useNotifications.js
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { notificationService } from '../services/notificationService';
import { useToast } from './useToast';

export const useNotifications = () => {
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const { showToast } = useToast();
  
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const isMounted = useRef(true);
  const initialLoadDone = useRef(false);

  // ============================================
  // FETCH NOTIFICATIONS
  // ============================================
  const fetchNotifications = useCallback(async (reset = true, params = {}) => {
    if (!user) {
      console.warn('⚠️ [useNotifications] No user, skipping fetch');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const currentPage = reset ? 1 : page;
      
      const result = await notificationService.fetchNotifications({
        ...params,
        page: currentPage,
        limit: 20
      });

      if (!isMounted.current) return;

      if (result.success) {
        if (reset) {
          setNotifications(result.notifications);
          setPage(1);
        } else {
          setNotifications(prev => [...prev, ...result.notifications]);
        }
        
        setUnreadCount(result.unreadCount || 0);
        setTotal(result.total || 0);
        setHasMore(result.pagination?.hasMore || false);
      } else {
        setError(result.error || 'Failed to fetch notifications');
        if (reset) {
          setNotifications([]);
          setTotal(0);
          setUnreadCount(0);
        }
      }
    } catch (err) {
      console.error('❌ [useNotifications] fetchNotifications error:', err);
      setError(err.response?.data?.message || 'Failed to load notifications');
      if (reset) {
        setNotifications([]);
        setTotal(0);
        setUnreadCount(0);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [user, page]);

  // ============================================
  // MARK AS READ
  // ============================================
  const markAsRead = useCallback(async (notificationId) => {
    if (!notificationId) {
      console.warn('⚠️ [useNotifications] markAsRead called without notificationId');
      return { success: false, error: 'Notification ID is required' };
    }

    try {
      const result = await notificationService.markAsRead(notificationId);
      
      if (!isMounted.current) return result;

      if (result.success) {
        setNotifications(prev => prev.map(n => 
          n._id === notificationId 
            ? { ...n, read: true, readAt: new Date() }
            : n
        ));
        setUnreadCount(result.unreadCount);
        return { success: true, unreadCount: result.unreadCount };
      }
      return { success: false, error: result.error };
    } catch (err) {
      console.error('❌ [useNotifications] markAsRead error:', err);
      showToast('Failed to mark as read', 'error');
      return { success: false, error: err.message || 'Failed to mark as read' };
    }
  }, [showToast]);

  // ============================================
  // MARK ALL AS READ
  // ============================================
  const markAllAsRead = useCallback(async () => {
    try {
      const result = await notificationService.markAllAsRead();
      
      if (!isMounted.current) return result;

      if (result.success) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true, readAt: new Date() })));
        setUnreadCount(0);
        showToast('All notifications marked as read ✨', 'success');
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (err) {
      console.error('❌ [useNotifications] markAllAsRead error:', err);
      showToast('Failed to mark all as read', 'error');
      return { success: false, error: err.message || 'Failed to mark all as read' };
    }
  }, [showToast]);

  // ============================================
  // DELETE NOTIFICATION
  // ============================================
  const deleteNotification = useCallback(async (notificationId) => {
    if (!notificationId) {
      console.warn('⚠️ [useNotifications] deleteNotification called without notificationId');
      return { success: false, error: 'Notification ID is required' };
    }

    try {
      const result = await notificationService.deleteNotification(notificationId);
      
      if (!isMounted.current) return result;

      if (result.success) {
        const deleted = notifications.find(n => n._id === notificationId);
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        setTotal(prev => prev - 1);
        setUnreadCount(result.unreadCount);
        showToast('Notification deleted', 'success');
        return { success: true, unreadCount: result.unreadCount };
      }
      return { success: false, error: result.error };
    } catch (err) {
      console.error('❌ [useNotifications] deleteNotification error:', err);
      showToast('Failed to delete notification', 'error');
      return { success: false, error: err.message || 'Failed to delete notification' };
    }
  }, [notifications, showToast]);

  // ============================================
  // DELETE ALL READ
  // ============================================
  const deleteAllRead = useCallback(async () => {
    try {
      const result = await notificationService.deleteAllRead();
      
      if (!isMounted.current) return result;

      if (result.success) {
        setNotifications(prev => prev.filter(n => !n.read));
        setUnreadCount(result.unreadCount);
        showToast('All read notifications deleted', 'success');
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (err) {
      console.error('❌ [useNotifications] deleteAllRead error:', err);
      showToast('Failed to delete read notifications', 'error');
      return { success: false, error: err.message || 'Failed to delete read notifications' };
    }
  }, [showToast]);

  // ============================================
  // DELETE ALL NOTIFICATIONS
  // ============================================
  const deleteAllNotifications = useCallback(async () => {
    try {
      const result = await notificationService.deleteAllNotifications();
      
      if (!isMounted.current) return result;

      if (result.success) {
        setNotifications([]);
        setTotal(0);
        setUnreadCount(0);
        showToast('All notifications deleted', 'success');
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (err) {
      console.error('❌ [useNotifications] deleteAllNotifications error:', err);
      showToast('Failed to delete all notifications', 'error');
      return { success: false, error: err.message || 'Failed to delete all notifications' };
    }
  }, [showToast]);

  // ============================================
  // MARK MULTIPLE AS READ
  // ============================================
  const markMultipleAsRead = useCallback(async (notificationIds) => {
    if (!notificationIds || notificationIds.length === 0) {
      showToast('No notifications selected', 'info');
      return { success: false, error: 'No notifications selected' };
    }

    try {
      const result = await notificationService.markMultipleAsRead(notificationIds);
      
      if (!isMounted.current) return result;

      if (result.success) {
        setNotifications(prev => prev.map(n => 
          notificationIds.includes(n._id) 
            ? { ...n, read: true, readAt: new Date() }
            : n
        ));
        setUnreadCount(result.unreadCount);
        showToast(`${notificationIds.length} notifications marked as read`, 'success');
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (err) {
      console.error('❌ [useNotifications] markMultipleAsRead error:', err);
      showToast('Failed to mark notifications as read', 'error');
      return { success: false, error: err.message || 'Failed to mark notifications as read' };
    }
  }, [showToast]);

  // ============================================
  // DELETE MULTIPLE
  // ============================================
  const deleteMultiple = useCallback(async (notificationIds) => {
    if (!notificationIds || notificationIds.length === 0) {
      showToast('No notifications selected', 'info');
      return { success: false, error: 'No notifications selected' };
    }

    try {
      const result = await notificationService.deleteMultiple(notificationIds);
      
      if (!isMounted.current) return result;

      if (result.success) {
        setNotifications(prev => prev.filter(n => !notificationIds.includes(n._id)));
        setTotal(prev => prev - notificationIds.length);
        setUnreadCount(result.unreadCount);
        showToast(`${notificationIds.length} notifications deleted`, 'success');
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (err) {
      console.error('❌ [useNotifications] deleteMultiple error:', err);
      showToast('Failed to delete notifications', 'error');
      return { success: false, error: err.message || 'Failed to delete notifications' };
    }
  }, [showToast]);

  // ============================================
  // REFRESH
  // ============================================
  const refresh = useCallback(async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    await fetchNotifications(true);
    setIsRefreshing(false);
  }, [fetchNotifications, isRefreshing]);

  // ============================================
  // LOAD MORE
  // ============================================
  const loadMore = useCallback(async () => {
    if (!loading && hasMore && isMounted.current) {
      setPage(prev => prev + 1);
      await fetchNotifications(false);
    }
  }, [loading, hasMore, fetchNotifications]);

  // ============================================
  // SOCKET EVENT LISTENERS
  // ============================================
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleNewNotification = (data) => {
      if (data?.notification && isMounted.current) {
        console.log('🔔 [useNotifications] New notification:', data.notification);
        setNotifications(prev => [data.notification, ...prev]);
        setTotal(prev => prev + 1);
        if (data.unreadCount !== undefined) {
          setUnreadCount(data.unreadCount);
        } else if (!data.notification.read) {
          setUnreadCount(prev => prev + 1);
        }
        showToast('🔔 ' + data.notification.title, 'info');
      }
    };

    const handleNotificationRead = (data) => {
      if (isMounted.current) {
        setNotifications(prev => prev.map(n => 
          n._id === data.notificationId 
            ? { ...n, read: true, readAt: new Date() }
            : n
        ));
        if (data.unreadCount !== undefined) {
          setUnreadCount(data.unreadCount);
        }
      }
    };

    const handleAllNotificationsRead = () => {
      if (isMounted.current) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true, readAt: new Date() })));
        setUnreadCount(0);
        showToast('All notifications marked as read ✨', 'success');
      }
    };

    const handleNotificationDeleted = (data) => {
      if (isMounted.current) {
        setNotifications(prev => prev.filter(n => n._id !== data.notificationId));
        setTotal(prev => prev - 1);
        if (data.unreadCount !== undefined) {
          setUnreadCount(data.unreadCount);
        }
      }
    };

    const handleAllNotificationsDeleted = () => {
      if (isMounted.current) {
        setNotifications([]);
        setTotal(0);
        setUnreadCount(0);
        showToast('All notifications deleted', 'success');
      }
    };

    // Register socket listeners
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
  }, [socket, isConnected, showToast]);

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
  // INITIAL LOAD
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
  }, [user, fetchNotifications]);

  // ============================================
  // RETURN VALUE
  // ============================================
  return {
    notifications,
    unreadCount,
    total,
    loading,
    hasMore,
    error,
    isRefreshing,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    deleteAllNotifications,
    markMultipleAsRead,
    deleteMultiple,
    refresh,
    loadMore,
    setNotifications,
    setUnreadCount,
  };
};

export default useNotifications;
// src/components/NotificationPanel.jsx - COMPLETE with Alveoly Pattern
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, X, Check, Trash2, CheckCheck, Loader2,
  Calendar, CreditCard, Star, MessageSquare, AlertCircle,
  Hotel, MapPin, Package, Heart, Users, Settings,
  ChevronRight, Clock, Filter, Eye, EyeOff,
  MoreVertical, Archive, Bookmark, Share2, 
  Gift
} from 'lucide-react';
import axios from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { useToast } from '../hooks/useToast';

const NotificationPanel = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState(null);
  
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const { showToast } = useToast();
  const panelRef = useRef(null);
  const loadMoreRef = useRef(null);

  // ============================================
  // FETCH NOTIFICATIONS
  // ============================================
  const fetchNotifications = useCallback(async (pageNum = 1, reset = true) => {
    if (loading || loadingMore) return;
    
    const isLoadMore = pageNum > 1;
    if (isLoadMore) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    
    try {
      const params = new URLSearchParams({
        page: pageNum,
        limit: 20,
        filter: filter,
      });
      
      if (selectedType && selectedType !== 'all') {
        params.append('type', selectedType);
      }
      
      const response = await axios.get(`/notifications?${params}`);
      
      if (response.data.success) {
        const { notifications: newNotifications, pagination, unreadCount: count } = response.data;
        
        if (reset) {
          setNotifications(newNotifications);
        } else {
          setNotifications(prev => [...prev, ...newNotifications]);
        }
        
        setUnreadCount(count || 0);
        setPage(pagination.currentPage);
        setTotalPages(pagination.totalPages);
        setHasMore(pagination.currentPage < pagination.totalPages);
      }
    } catch (error) {
      console.error('❌ Failed to fetch notifications:', error);
      showToast('Failed to load notifications', 'error');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [filter, selectedType, showToast]);

  // ============================================
  // FETCH TYPES
  // ============================================
  const fetchTypes = useCallback(async () => {
    try {
      const response = await axios.get('/notifications/types');
      if (response.data.success) {
        setTypes(response.data.types);
      }
    } catch (error) {
      console.error('❌ Failed to fetch types:', error);
    }
  }, []);

  // ============================================
  // FETCH STATS
  // ============================================
  const fetchStats = useCallback(async () => {
    try {
      const response = await axios.get('/notifications/stats');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('❌ Failed to fetch stats:', error);
    }
  }, []);

  // ============================================
  // MARK AS READ
  // ============================================
  const handleMarkAsRead = async (notificationId) => {
    try {
      const response = await axios.put(`/notifications/${notificationId}/read`);
      if (response.data.success) {
        setNotifications(prev => 
          prev.map(n => 
            n._id === notificationId 
              ? { ...n, read: true, readAt: new Date() }
              : n
          )
        );
        setUnreadCount(response.data.unreadCount);
        showToast('Notification marked as read', 'success');
      }
    } catch (error) {
      console.error('❌ Failed to mark as read:', error);
      showToast('Failed to mark as read', 'error');
    }
  };

  // ============================================
  // MARK ALL AS READ
  // ============================================
  const handleMarkAllAsRead = async () => {
    try {
      const response = await axios.put('/notifications/read-all');
      if (response.data.success) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, read: true, readAt: new Date() }))
        );
        setUnreadCount(0);
        showToast('All notifications marked as read', 'success');
      }
    } catch (error) {
      console.error('❌ Failed to mark all as read:', error);
      showToast('Failed to mark all as read', 'error');
    }
  };

  // ============================================
  // DELETE NOTIFICATION
  // ============================================
  const handleDelete = async (notificationId) => {
    try {
      const response = await axios.delete(`/notifications/${notificationId}`);
      if (response.data.success) {
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        setUnreadCount(response.data.unreadCount);
        showToast('Notification deleted', 'success');
      }
    } catch (error) {
      console.error('❌ Failed to delete notification:', error);
      showToast('Failed to delete notification', 'error');
    }
  };

  // ============================================
  // DELETE ALL READ
  // ============================================
  const handleDeleteAllRead = async () => {
    if (!confirm('Delete all read notifications?')) return;
    
    try {
      const response = await axios.delete('/notifications/read-all');
      if (response.data.success) {
        setNotifications(prev => prev.filter(n => !n.read));
        setUnreadCount(response.data.unreadCount);
        showToast('All read notifications deleted', 'success');
      }
    } catch (error) {
      console.error('❌ Failed to delete read notifications:', error);
      showToast('Failed to delete read notifications', 'error');
    }
  };

  // ============================================
  // LOAD MORE (Infinite Scroll)
  // ============================================
  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore) return;
    fetchNotifications(page + 1, false);
  }, [hasMore, loadingMore, page, fetchNotifications]);

  // ============================================
  // INTERSECTION OBSERVER FOR INFINITE SCROLL
  // ============================================
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );
    
    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }
    
    return () => {
      if (loadMoreRef.current) {
        observer.unobserve(loadMoreRef.current);
      }
    };
  }, [hasMore, loadingMore, loadMore]);

  // ============================================
  // SOCKET EVENTS (Alveoly Pattern)
  // ============================================
  useEffect(() => {
    if (!socket || !isConnected) return;
    
    // Alveoly pattern: new_notification
    const handleNewNotification = (data) => {
      if (data.notification) {
        setNotifications(prev => [data.notification, ...prev]);
        setUnreadCount(data.unreadCount || 0);
        showToast('🔔 ' + data.notification.title, 'info');
      }
    };
    
    const handleNotificationRead = (data) => {
      if (data.notificationId) {
        setNotifications(prev => 
          prev.map(n => 
            n._id === data.notificationId 
              ? { ...n, read: true, readAt: new Date() }
              : n
          )
        );
        if (data.unreadCount !== undefined) {
          setUnreadCount(data.unreadCount);
        }
      }
    };
    
    const handleAllRead = (data) => {
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true, readAt: new Date() }))
      );
      setUnreadCount(0);
    };
    
    const handleNotificationDeleted = (data) => {
      if (data.notificationId) {
        setNotifications(prev => prev.filter(n => n._id !== data.notificationId));
        if (data.unreadCount !== undefined) {
          setUnreadCount(data.unreadCount);
        }
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
  }, [socket, isConnected, showToast]);

  // ============================================
  // INITIAL FETCH
  // ============================================
  useEffect(() => {
    if (isOpen && user) {
      fetchNotifications(1, true);
      fetchTypes();
      fetchStats();
    }
  }, [isOpen, user, fetchNotifications, fetchTypes, fetchStats]);

  // ============================================
  // REFETCH ON FILTER CHANGE
  // ============================================
  useEffect(() => {
    if (isOpen) {
      fetchNotifications(1, true);
    }
  }, [filter, selectedType, fetchNotifications, isOpen]);

  // ============================================
  // GET ICON FOR NOTIFICATION TYPE
  // ============================================
  const getIcon = (type, iconName) => {
    const icons = {
      booking: Calendar,
      payment: CreditCard,
      review: Star,
      message: MessageSquare,
      system: Bell,
      tour: Package,
      hotel: Hotel,
      destination: MapPin,
      experience: Heart,
      reminder: Clock,
      promotion: Gift,
      alert: AlertCircle,
    };
    
    const Icon = icons[type] || Bell;
    return <Icon className="w-5 h-5" />;
  };

  // ============================================
  // RENDER
  // ============================================
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Panel */}
          <motion.div
            ref={panelRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[480px] bg-gradient-to-br from-gray-900 via-gray-950 to-black shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex-shrink-0 p-4 border-b border-amber-500/10 bg-gradient-to-r from-amber-500/5 to-orange-500/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="p-2 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20">
                      <Bell className="w-5 h-5 text-amber-400" />
                    </div>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold shadow-lg shadow-amber-500/30 px-1">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">Notifications</h2>
                    <p className="text-xs text-gray-400">
                      {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up! 👏'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleMarkAllAsRead}
                    className="p-2 rounded-xl hover:bg-amber-500/10 transition-colors text-gray-400 hover:text-amber-400"
                    title="Mark all as read"
                    disabled={unreadCount === 0}
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleDeleteAllRead}
                    className="p-2 rounded-xl hover:bg-red-500/10 transition-colors text-gray-400 hover:text-red-400"
                    title="Delete all read"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl hover:bg-amber-500/10 transition-colors text-gray-400 hover:text-amber-400"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
                <button
                  onClick={() => { setFilter('all'); setSelectedType(null); }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    filter === 'all' && !selectedType
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                      : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    filter === 'unread'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                      : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  Unread
                </button>
                <button
                  onClick={() => setFilter('read')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                    filter === 'read'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                      : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  Read
                </button>
                <div className="w-px h-6 bg-gray-700/50" />
                {types.slice(0, 5).map((type) => (
                  <button
                    key={type.value}
                    onClick={() => {
                      setSelectedType(type.value === selectedType ? null : type.value);
                      setFilter('all');
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      selectedType === type.value
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                        : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
                {types.length > 5 && (
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                      showFilters
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <Filter className="w-3 h-3" />
                  </button>
                )}
              </div>

              {/* Expanded Filters */}
              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 pt-2 border-t border-amber-500/10"
                  >
                    <div className="flex flex-wrap gap-1.5">
                      {types.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => {
                            setSelectedType(type.value === selectedType ? null : type.value);
                            setFilter('all');
                          }}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all ${
                            selectedType === type.value
                              ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                              : 'bg-gray-800/30 text-gray-400 hover:text-white hover:bg-gray-700/30'
                          }`}
                        >
                          {type.label}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {loading && notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12">
                  <Loader2 className="w-8 h-8 text-amber-400 animate-spin mb-3" />
                  <p className="text-sm text-gray-400">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12">
                  <div className="p-4 rounded-full bg-amber-500/10 mb-4">
                    <Bell className="w-10 h-10 text-amber-400/40" />
                  </div>
                  <p className="text-gray-400 font-medium">No notifications yet</p>
                  <p className="text-sm text-gray-500">We'll keep you updated here</p>
                </div>
              ) : (
                <>
                  {notifications.map((notification, index) => (
                    <motion.div
                      key={notification._id || index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`group relative rounded-xl p-3 transition-all duration-300 ${
                        !notification.read
                          ? 'bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10'
                          : 'hover:bg-gray-800/30'
                      }`}
                    >
                      {/* Unread indicator */}
                      {!notification.read && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-amber-400 to-orange-400 rounded-r-full" />
                      )}

                      <div className="flex items-start gap-3 ml-2">
                        {/* Icon */}
                        <div className={`p-2 rounded-xl flex-shrink-0 ${notification.bgColor || 'bg-gray-800/50'}`}>
                          {getIcon(notification.type, notification.icon)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className={`text-sm font-medium ${
                                !notification.read ? 'text-white' : 'text-gray-300'
                              }`}>
                                {notification.title}
                              </p>
                              <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                                {notification.message}
                              </p>
                              {notification.metadata?.bookingId && (
                                <p className="text-[10px] text-gray-500 mt-1">
                                  Booking #{notification.metadata.bookingId.slice(-6)}
                                </p>
                              )}
                            </div>
                            <span className="text-[10px] text-gray-500 flex-shrink-0">
                              {notification.timeAgo || 'Just now'}
                            </span>
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center gap-2 mt-2">
                            {notification.actionUrl && (
                              <a
                                href={notification.actionUrl}
                                className="text-xs text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
                              >
                                {notification.actionLabel || 'View'}
                                <ChevronRight className="w-3 h-3" />
                              </a>
                            )}
                            
                            {/* Priority badge */}
                            {notification.priority === 'high' && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-red-400 border border-red-500/20">
                                High
                              </span>
                            )}
                            {notification.priority === 'urgent' && (
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/30 text-red-400 border border-red-500/30 animate-pulse">
                                Urgent
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {!notification.read && (
                            <button
                              onClick={() => handleMarkAsRead(notification._id)}
                              className="p-1.5 rounded-lg hover:bg-amber-500/10 text-gray-400 hover:text-amber-400 transition-colors"
                              title="Mark as read"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(notification._id)}
                            className="p-1.5 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {/* Load more trigger */}
                  {hasMore && (
                    <div ref={loadMoreRef} className="py-4 flex justify-center">
                      {loadingMore ? (
                        <Loader2 className="w-6 h-6 text-amber-400 animate-spin" />
                      ) : (
                        <button
                          onClick={loadMore}
                          className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                        >
                          Load more
                        </button>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 p-3 border-t border-amber-500/10 bg-gray-900/50">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                  {stats && ` · ${stats.total || 0} total`}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.location.href = '/notifications'}
                    className="text-xs text-amber-400 hover:text-amber-300 transition-colors"
                  >
                    View all
                  </button>
                  <div className="w-px h-4 bg-gray-700/50" />
                  <button
                    onClick={() => {
                      if (navigator.share) {
                        navigator.share({
                          title: 'Alveovita Notifications',
                          text: `You have ${unreadCount} unread notifications`,
                          url: window.location.href,
                        });
                      }
                    }}
                    className="text-xs text-gray-500 hover:text-amber-400 transition-colors"
                  >
                    Share
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationPanel;
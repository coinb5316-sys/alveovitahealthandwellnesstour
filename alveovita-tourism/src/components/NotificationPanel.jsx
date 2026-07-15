// src/components/NotificationPanel.jsx - PROFESSIONAL COMPLETE (FIXED)
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell, X, Check, Trash2, CheckCheck, Loader2,
  Calendar, CreditCard, Star, MessageSquare, AlertCircle,
  Hotel, MapPin, Package, Heart, Users, Settings,
  ChevronRight, Clock, Filter, Eye, EyeOff,
  MoreVertical, Archive, Bookmark, Share2, 
  Gift, Zap, Flame, Crown, Gem, Sparkles,
  Shield, Trophy, Circle, CircleDot, Search,
  CheckCircle
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
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [selectMode, setSelectMode] = useState(false);
  
  const { user } = useAuth();
  const { socket, isConnected } = useSocket();
  const { showToast } = useToast();
  const panelRef = useRef(null);
  const loadMoreRef = useRef(null);
  const searchInputRef = useRef(null);

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
      
      if (searchQuery.trim()) {
        params.append('search', searchQuery.trim());
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
  }, [filter, selectedType, searchQuery, showToast]);

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
    if (!user || user.role !== 'admin') {
      console.log('ℹ️ Skipping stats fetch - user is not admin');
      return;
    }
    
    try {
      const response = await axios.get('/notifications/stats');
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      if (error.response?.status === 403) {
        console.log('ℹ️ Stats only available for admin users');
      } else {
        console.error('❌ Failed to fetch stats:', error);
      }
    }
  }, [user]);

  // ============================================
  // MARK AS READ
  // ============================================
  const handleMarkAsRead = useCallback(async (notificationId) => {
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
        setSelectedNotifications(prev => prev.filter(id => id !== notificationId));
        showToast('Notification marked as read', 'success');
      }
    } catch (error) {
      console.error('❌ Failed to mark as read:', error);
      showToast('Failed to mark as read', 'error');
    }
  }, [showToast]);

  // ============================================
  // MARK ALL AS READ
  // ============================================
  const handleMarkAllAsRead = useCallback(async () => {
    try {
      const response = await axios.put('/notifications/read-all');
      if (response.data.success) {
        setNotifications(prev => 
          prev.map(n => ({ ...n, read: true, readAt: new Date() }))
        );
        setUnreadCount(0);
        setSelectedNotifications([]);
        setSelectMode(false);
        showToast('All notifications marked as read ✨', 'success');
      }
    } catch (error) {
      console.error('❌ Failed to mark all as read:', error);
      showToast('Failed to mark all as read', 'error');
    }
  }, [showToast]);

  // ============================================
  // DELETE NOTIFICATION
  // ============================================
  const handleDelete = useCallback(async (notificationId) => {
    try {
      const response = await axios.delete(`/notifications/${notificationId}`);
      if (response.data.success) {
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        setUnreadCount(response.data.unreadCount);
        setSelectedNotifications(prev => prev.filter(id => id !== notificationId));
        showToast('Notification deleted', 'success');
      }
    } catch (error) {
      console.error('❌ Failed to delete notification:', error);
      showToast('Failed to delete notification', 'error');
    }
  }, [showToast]);

  // ============================================
  // DELETE ALL READ
  // ============================================
  const handleDeleteAllRead = useCallback(async () => {
    if (!confirm('Delete all read notifications?')) return;
    
    try {
      const response = await axios.delete('/notifications/read-all');
      if (response.data.success) {
        setNotifications(prev => prev.filter(n => !n.read));
        setUnreadCount(response.data.unreadCount);
        setSelectedNotifications([]);
        setSelectMode(false);
        showToast('All read notifications deleted', 'success');
      }
    } catch (error) {
      console.error('❌ Failed to delete read notifications:', error);
      showToast('Failed to delete read notifications', 'error');
    }
  }, [showToast]);

  // ============================================
  // TOGGLE SELECTION
  // ============================================
  const toggleSelect = useCallback((notificationId) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId) 
        ? prev.filter(id => id !== notificationId) 
        : [...prev, notificationId]
    );
  }, []);

  // ============================================
  // MARK MULTIPLE AS READ
  // ============================================
  const markMultipleAsRead = useCallback(async () => {
    if (selectedNotifications.length === 0) {
      showToast('No notifications selected', 'info');
      return;
    }
    
    try {
      const promises = selectedNotifications.map(id => 
        axios.put(`/notifications/${id}/read`)
      );
      await Promise.all(promises);
      
      setNotifications(prev => prev.map(n => 
        selectedNotifications.includes(n._id) 
          ? { ...n, read: true, readAt: new Date() } 
          : n
      ));
      const readCount = selectedNotifications.filter(id => 
        notifications.find(n => n._id === id && !n.read)
      ).length;
      setUnreadCount(prev => Math.max(0, prev - readCount));
      setSelectedNotifications([]);
      setSelectMode(false);
      showToast(`${selectedNotifications.length} notifications marked as read`, 'success');
    } catch (error) {
      console.error('❌ Failed to mark multiple as read:', error);
      showToast('Failed to mark notifications as read', 'error');
    }
  }, [selectedNotifications, notifications, showToast]);

  // ============================================
  // DELETE MULTIPLE
  // ============================================
  const deleteMultiple = useCallback(async () => {
    if (selectedNotifications.length === 0) {
      showToast('No notifications selected', 'info');
      return;
    }
    
    if (!confirm(`Delete ${selectedNotifications.length} selected notifications?`)) return;
    
    try {
      const promises = selectedNotifications.map(id => 
        axios.delete(`/notifications/${id}`)
      );
      await Promise.all(promises);
      
      const deletedRead = selectedNotifications.filter(id => 
        notifications.find(n => n._id === id && !n.read)
      ).length;
      
      setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n._id)));
      setUnreadCount(prev => Math.max(0, prev - deletedRead));
      setSelectedNotifications([]);
      setSelectMode(false);
      showToast(`${selectedNotifications.length} notifications deleted`, 'success');
    } catch (error) {
      console.error('❌ Failed to delete multiple notifications:', error);
      showToast('Failed to delete notifications', 'error');
    }
  }, [selectedNotifications, notifications, showToast]);

  // ============================================
  // LOAD MORE
  // ============================================
  const loadMore = useCallback(() => {
    if (!hasMore || loadingMore) return;
    fetchNotifications(page + 1, false);
  }, [hasMore, loadingMore, page, fetchNotifications]);

  // ============================================
  // INTERSECTION OBSERVER
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
  // SOCKET EVENTS
  // ============================================
  useEffect(() => {
    if (!socket || !isConnected) return;
    
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
    
    const handleAllRead = () => {
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
  }, [isOpen, user]);

  // ============================================
  // REFETCH ON FILTER CHANGE
  // ============================================
  useEffect(() => {
    if (isOpen) {
      fetchNotifications(1, true);
    }
  }, [filter, selectedType, searchQuery, isOpen]);

  // ============================================
  // GET ICON
  // ============================================
  const getIcon = useCallback((type, iconName) => {
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
  }, []);

  // ============================================
  // GET TIME AGO
  // ============================================
  const getTimeAgo = useCallback((date) => {
    if (!date) return 'Just now';
    const diff = Date.now() - new Date(date).getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    if (seconds < 5) return 'Just now';
    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  }, []);

  // ============================================
  // GET FILTER COUNT
  // ============================================
  const getFilterCount = useCallback((filterType) => {
    if (filterType === 'all') return notifications.length;
    if (filterType === 'unread') return notifications.filter(n => !n.read).length;
    if (filterType === 'read') return notifications.filter(n => n.read).length;
    return notifications.filter(n => n.type === filterType).length;
  }, [notifications]);

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
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50"
            onClick={onClose}
          />
          
          {/* Panel */}
          <motion.div
            ref={panelRef}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full sm:w-[500px] bg-gradient-to-br from-gray-900 via-gray-950 to-black shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* ============================================ */}
            {/* HEADER - Premium */}
            {/* ============================================ */}
            <div className="flex-shrink-0 p-5 border-b border-amber-500/10 bg-gradient-to-r from-amber-500/5 to-orange-500/5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="p-2.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20">
                      <Bell className="w-5 h-5 text-amber-400" />
                    </div>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 min-w-[22px] h-6 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold shadow-lg shadow-amber-500/30 px-1.5">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white tracking-tight">
                      <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                        Notifications
                      </span>
                    </h2>
                    <p className="text-xs text-gray-400">
                      {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up! 👏'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Search Toggle */}
                  <button
                    onClick={() => {
                      setShowSearch(!showSearch);
                      if (!showSearch) {
                        setTimeout(() => searchInputRef.current?.focus(), 100);
                      }
                    }}
                    className={`p-2 rounded-xl transition-colors ${
                      showSearch ? 'bg-amber-500/20 text-amber-400' : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                    title="Search notifications"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                  
                  {/* Select Mode */}
                  {notifications.length > 0 && (
                    <button
                      onClick={() => {
                        setSelectMode(!selectMode);
                        setSelectedNotifications([]);
                      }}
                      className={`p-2 rounded-xl transition-colors ${
                        selectMode 
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      }`}
                      title="Select notifications"
                    >
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  )}
                  
                  {/* Mark All Read */}
                  <button
                    onClick={handleMarkAllAsRead}
                    className="p-2 rounded-xl transition-colors text-gray-400 hover:text-amber-400 hover:bg-amber-500/10"
                    title="Mark all as read"
                    disabled={unreadCount === 0}
                  >
                    <CheckCheck className={`w-4 h-4 ${unreadCount === 0 ? 'opacity-30 cursor-not-allowed' : ''}`} />
                  </button>
                  
                  {/* Delete All Read */}
                  <button
                    onClick={handleDeleteAllRead}
                    className="p-2 rounded-xl transition-colors text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                    title="Delete all read"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  
                  {/* Close */}
                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl transition-colors text-gray-400 hover:text-white hover:bg-gray-800"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <AnimatePresence>
                {showSearch && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3"
                  >
                    <div className={`flex items-center gap-2 rounded-xl px-4 transition-all ${
                      isConnected ? 'bg-gray-800/50 border border-gray-700' : 'bg-gray-800/30 border border-gray-700'
                    }`}>
                      <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search notifications..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full py-2.5 bg-transparent outline-none text-sm text-white placeholder-gray-400"
                      />
                      {searchQuery && (
                        <button
                          onClick={() => setSearchQuery('')}
                          className="p-1 rounded-full hover:bg-gray-700/50 transition-colors text-gray-400 hover:text-white flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Filters */}
              <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
                <button
                  onClick={() => { setFilter('all'); setSelectedType(null); }}
                  className={`px-4 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    filter === 'all' && !selectedType
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                      : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  All ({getFilterCount('all')})
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    filter === 'unread'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                      : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  🔴 Unread ({getFilterCount('unread')})
                </button>
                <button
                  onClick={() => setFilter('read')}
                  className={`px-4 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                    filter === 'read'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                      : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  ✅ Read ({getFilterCount('read')})
                </button>
                <div className="w-px h-6 bg-gray-700/50" />
                {types.slice(0, 5).map((type) => (
                  <button
                    key={type.value}
                    onClick={() => {
                      setSelectedType(type.value === selectedType ? null : type.value);
                      setFilter('all');
                    }}
                    className={`px-4 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                      selectedType === type.value
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                        : 'bg-gray-800/50 text-gray-400 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    {type.label} ({getFilterCount(type.value)})
                  </button>
                ))}
                {types.length > 5 && (
                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`px-4 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
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
                          className={`px-3 py-1 rounded-xl text-[10px] font-medium transition-all ${
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
              
              {/* Active filters summary */}
              {(filter !== 'all' || selectedType || searchQuery) && (
                <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-700/30">
                  <span className="text-[10px] text-gray-500">Active:</span>
                  {filter !== 'all' && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      filter === 'unread' ? 'bg-red-500/20 text-red-400' :
                      filter === 'read' ? 'bg-green-500/20 text-green-400' :
                      'bg-amber-500/20 text-amber-400'
                    }`}>
                      {filter === 'unread' ? '🔴 Unread' : 
                       filter === 'read' ? '✅ Read' : filter}
                    </span>
                  )}
                  {selectedType && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-400">
                      {types.find(t => t.value === selectedType)?.label || selectedType}
                    </span>
                  )}
                  {searchQuery && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                      🔍 "{searchQuery}"
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setFilter('all');
                      setSelectedType(null);
                      setSearchQuery('');
                    }}
                    className="text-[10px] text-amber-400 hover:text-amber-300 ml-auto"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* ============================================ */}
            {/* SELECT MODE TOOLBAR */}
            {/* ============================================ */}
            {selectMode && (
              <div className="flex-shrink-0 p-3 bg-amber-500/10 border-b border-amber-500/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      if (selectedNotifications.length === notifications.length) {
                        setSelectedNotifications([]);
                      } else {
                        setSelectedNotifications(notifications.map(n => n._id));
                      }
                    }}
                    className={`p-1.5 rounded-lg transition-colors ${
                      selectedNotifications.length === notifications.length && notifications.length > 0
                        ? 'bg-amber-500 text-white'
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    <Check className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-gray-300">
                    {selectedNotifications.length} selected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={markMultipleAsRead}
                    disabled={selectedNotifications.length === 0}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedNotifications.length > 0
                        ? 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    Mark read
                  </button>
                  <button
                    onClick={deleteMultiple}
                    disabled={selectedNotifications.length === 0}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      selectedNotifications.length > 0
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                        : 'opacity-50 cursor-not-allowed'
                    }`}
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => {
                      setSelectMode(false);
                      setSelectedNotifications([]);
                    }}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-gray-700 text-gray-300 hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* ============================================ */}
            {/* NOTIFICATION LIST */}
            {/* ============================================ */}
            <div className="flex-1 overflow-y-auto p-2 space-y-1">
              {loading && notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12">
                  <div className="relative w-12 h-12">
                    <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 animate-spin-slow" />
                    <div className="absolute inset-0 rounded-full border-t-4 border-amber-500 animate-spin" />
                  </div>
                  <p className="text-sm text-gray-400 mt-4">Loading notifications...</p>
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-12">
                  <div className="p-5 rounded-full bg-amber-500/10 mb-4">
                    <Bell className="w-12 h-12 text-amber-400/40" />
                  </div>
                  <p className="text-gray-400 font-medium">No notifications yet</p>
                  <p className="text-sm text-gray-500">We'll keep you updated here</p>
                </div>
              ) : (
                <>
                  {notifications.map((notification, index) => {
                    const isSelected = selectedNotifications.includes(notification._id);
                    const isUnread = !notification.read;
                    
                    return (
                      <motion.div
                        key={notification._id || index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`group relative rounded-xl p-3 transition-all duration-300 ${
                          isUnread
                            ? 'bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10'
                            : 'hover:bg-gray-800/30'
                        } ${isSelected ? 'ring-2 ring-amber-500' : ''}`}
                      >
                        {/* Unread indicator */}
                        {isUnread && (
                          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-gradient-to-b from-amber-400 to-orange-400 rounded-r-full" />
                        )}

                        <div className="flex items-start gap-3 ml-2">
                          {/* Selection checkbox */}
                          {selectMode && (
                            <button
                              onClick={() => toggleSelect(notification._id)}
                              className={`mt-1 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                                isSelected 
                                  ? 'bg-amber-500 border-amber-500 text-white' 
                                  : 'border-gray-600'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3" />}
                            </button>
                          )}
                          
                          {/* Icon */}
                          <div className={`p-2.5 rounded-xl flex-shrink-0 ${
                            notification.bgColor || 'bg-gray-800/50'
                          }`}>
                            {getIcon(notification.type, notification.icon)}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <div className="flex-1">
                                <p className={`text-sm font-medium ${isUnread ? 'text-white' : 'text-gray-300'}`}>
                                  {notification.title}
                                  {notification.priority === 'urgent' && (
                                    <span className="ml-2 text-[8px] px-2 py-0.5 rounded-full bg-red-500/30 text-red-400 animate-pulse border border-red-500/30">
                                      Urgent
                                    </span>
                                  )}
                                </p>
                              </div>
                              <span className="text-[10px] text-gray-500 flex-shrink-0">
                                {getTimeAgo(notification.createdAt)}
                              </span>
                            </div>
                            
                            <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                              {notification.message}
                            </p>
                            
                            {notification.metadata?.bookingId && (
                              <p className="text-[10px] text-gray-500 mt-1">
                                Booking #{notification.metadata.bookingId.slice(-6)}
                              </p>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-2 mt-2">
                              {notification.actionUrl && (
                                <a
                                  href={notification.actionUrl}
                                  className="text-xs text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
                                  onClick={() => onClose()}
                                >
                                  {notification.actionLabel || 'View'}
                                  <ChevronRight className="w-3 h-3" />
                                </a>
                              )}
                              
                              {notification.priority === 'high' && (
                                <span className="text-[10px] px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/20">
                                  High
                                </span>
                              )}
                              {notification.priority === 'urgent' && (
                                <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/30 text-red-400 border border-red-500/30 animate-pulse">
                                  Urgent
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Actions - Hover */}
                          {!selectMode && (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {isUnread && (
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
                          )}
                        </div>
                      </motion.div>
                    );
                  })}

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

            {/* ============================================ */}
            {/* FOOTER */}
            {/* ============================================ */}
            <div className="flex-shrink-0 p-4 border-t border-amber-500/10 bg-gray-900/50">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">
                  {notifications.length} notification{notifications.length !== 1 ? 's' : ''}
                  {stats && ` · ${stats.total || 0} total`}
                  {searchQuery && ` · filtered`}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      window.location.href = '/notifications';
                    }}
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
// src/pages/Notifications.jsx - PROFESSIONAL COMPLETE
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, Trash2, RefreshCw, Wifi, WifiOff, 
  Calendar, CreditCard, Star, User, CheckCircle,
  AlertCircle, MessageSquare, Heart, MapPin, Hotel, Plane,
  Settings, Globe, Clock, Award, Gift, TrendingUp,
  ChevronRight, Loader2, Filter, X, Check, 
  Circle, CircleDot, Eye, EyeOff, Archive,
  Bookmark, Share2, MoreVertical, Zap, Flame,
  Crown, Gem, Sparkles, Shield, Trophy
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { useToast } from '../hooks/useToast'
import { notificationService } from '../services/notificationService'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'

const Notifications = () => {
  const { isDark } = useTheme()
  const { user } = useAuth()
  const { socket, isConnected, getUnreadCount } = useSocket()
  const { showToast } = useToast()
  
  // ============================================
  // STATE
  // ============================================
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)
  const [filter, setFilter] = useState('all')
  const [refreshing, setRefreshing] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [apiError, setApiError] = useState(null)
  const [selectedNotifications, setSelectedNotifications] = useState([])
  const [selectMode, setSelectMode] = useState(false)
  const [sortOrder, setSortOrder] = useState('desc')
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [notificationTypes, setNotificationTypes] = useState([])
  const [activeTypeFilter, setActiveTypeFilter] = useState(null)
  
  const observerRef = useRef(null)
  const endRef = useRef(null)
  const isMounted = useRef(true)
  const initialLoadDone = useRef(false)

  // ============================================
  // FETCH NOTIFICATION TYPES
  // ============================================
  const fetchNotificationTypes = useCallback(async () => {
    try {
      const result = await notificationService.fetchTypes();
      if (result.success) {
        setNotificationTypes(result.types);
      }
    } catch (error) {
      console.error('❌ Failed to fetch notification types:', error);
    }
  }, []);

  // ============================================
  // FETCH NOTIFICATIONS
  // ============================================
  const fetchNotifications = useCallback(async (reset = true) => {
    if (!user) {
      console.warn('⚠️ [Notifications] No user, skipping fetch')
      setLoading(false)
      return
    }
    
    try {
      setLoading(true)
      setApiError(null)
      
      const currentPage = reset ? 1 : page
      
      const params = {
        page: currentPage,
        limit: 20,
        sort: sortOrder,
        filter: filter,
        type: activeTypeFilter,
        search: searchQuery
      };

      console.log(`📡 [Notifications] Fetching notifications`, params)
      
      const result = await notificationService.fetchNotifications(params);

      console.log(`📡 [Notifications] Response:`, {
        success: result.success,
        count: result.notifications?.length || 0,
        total: result.total || 0,
        unread: result.unreadCount || 0
      });

      if (result.success && isMounted.current) {
        const newNotifications = result.notifications || []
        
        if (reset) {
          setNotifications(newNotifications)
          setPage(1)
        } else {
          setNotifications(prev => [...prev, ...newNotifications])
        }
        
        const count = result.unreadCount || 0
        setUnreadCount(count)
        setHasMore(result.hasMore || false)
        setTotal(result.total || 0)
        
        console.log(`✅ [Notifications] Loaded ${newNotifications.length} notifications, total: ${result.total}, unread: ${count}`)
      } else {
        console.warn('⚠️ [Notifications] Unexpected response:', result)
        if (reset) {
          setNotifications([])
          setTotal(0)
          setUnreadCount(0)
        }
      }
    } catch (error) {
      console.error('❌ [Notifications] Fetch error:', error)
      
      setApiError(error.response?.data?.message || 'Failed to load notifications')
      
      if (isMounted.current) {
        showToast(error.response?.data?.message || 'Failed to load notifications', 'error')
      }
      
      if (reset) {
        setNotifications([])
        setTotal(0)
        setUnreadCount(0)
      }
    } finally {
      if (isMounted.current) {
        setLoading(false)
      }
    }
  }, [user, page, filter, activeTypeFilter, searchQuery, sortOrder, showToast]);

  // ============================================
  // LOAD MORE NOTIFICATIONS
  // ============================================
  const loadMore = useCallback(() => {
    if (!loading && hasMore && isMounted.current) {
      setPage(prev => prev + 1)
      fetchNotifications(false)
    }
  }, [loading, hasMore, fetchNotifications])

  // ============================================
  // MARK AS READ - Uses notificationService
  // ============================================
  const markAsRead = useCallback(async (notificationId) => {
    if (!notificationId) {
      showToast('Invalid notification ID', 'error');
      return;
    }

    try {
      const result = await notificationService.markAsRead(notificationId);
      
      if (result.success && isMounted.current) {
        setNotifications(prev => prev.map(n => 
          n._id === notificationId ? { ...n, read: true, readAt: new Date() } : n
        ));
        setUnreadCount(result.unreadCount);
        setSelectedNotifications(prev => prev.filter(id => id !== notificationId));
        
        // Update via socket
        if (getUnreadCount) {
          getUnreadCount();
        }
        
        showToast('Notification marked as read', 'success');
      } else {
        showToast(result.error || 'Failed to mark as read', 'error');
      }
    } catch (error) {
      console.error('❌ [Notifications] Mark as read error:', error);
      showToast('Failed to mark as read', 'error');
    }
  }, [getUnreadCount, showToast]);

  // ============================================
  // MARK MULTIPLE AS READ
  // ============================================
  const markMultipleAsRead = useCallback(async () => {
    if (selectedNotifications.length === 0) {
      showToast('No notifications selected', 'info');
      return;
    }
    
    try {
      const result = await notificationService.markMultipleAsRead(selectedNotifications);
      
      if (result.success && isMounted.current) {
        setNotifications(prev => prev.map(n => 
          selectedNotifications.includes(n._id) 
            ? { ...n, read: true, readAt: new Date() } 
            : n
        ));
        setUnreadCount(result.unreadCount);
        setSelectedNotifications([]);
        setSelectMode(false);
        showToast(`${selectedNotifications.length} notifications marked as read`, 'success');
        
        if (getUnreadCount) {
          getUnreadCount();
        }
      } else {
        showToast(result.error || 'Failed to mark notifications as read', 'error');
      }
    } catch (error) {
      console.error('❌ [Notifications] Mark multiple as read error:', error);
      showToast('Failed to mark notifications as read', 'error');
    }
  }, [selectedNotifications, getUnreadCount, showToast]);

  // ============================================
  // MARK ALL AS READ
  // ============================================
  const markAllAsRead = useCallback(async () => {
    try {
      const result = await notificationService.markAllAsRead();
      
      if (result.success && isMounted.current) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true, readAt: new Date() })));
        setUnreadCount(0);
        setSelectedNotifications([]);
        setSelectMode(false);
        showToast('All notifications marked as read ✨', 'success');
        
        if (getUnreadCount) {
          getUnreadCount();
        }
      } else {
        showToast(result.error || 'Failed to mark all as read', 'error');
      }
    } catch (error) {
      console.error('❌ [Notifications] Mark all as read error:', error);
      showToast('Failed to mark all as read', 'error');
    }
  }, [showToast, getUnreadCount]);

  // ============================================
  // DELETE NOTIFICATION
  // ============================================
  const deleteNotification = useCallback(async (notificationId) => {
    if (!confirm('Delete this notification?')) return;
    
    try {
      setIsDeleting(true);
      const result = await notificationService.deleteNotification(notificationId);
      
      if (result.success && isMounted.current) {
        const deleted = notifications.find(n => n._id === notificationId);
        setNotifications(prev => prev.filter(n => n._id !== notificationId));
        setTotal(prev => prev - 1);
        setUnreadCount(result.unreadCount);
        setSelectedNotifications(prev => prev.filter(id => id !== notificationId));
        showToast('Notification deleted', 'success');
        
        if (getUnreadCount) {
          getUnreadCount();
        }
      } else {
        showToast(result.error || 'Failed to delete notification', 'error');
      }
    } catch (error) {
      console.error('❌ [Notifications] Delete error:', error);
      showToast('Failed to delete notification', 'error');
    } finally {
      if (isMounted.current) {
        setIsDeleting(false);
      }
    }
  }, [notifications, getUnreadCount, showToast]);

  // ============================================
  // DELETE MULTIPLE NOTIFICATIONS
  // ============================================
  const deleteMultiple = useCallback(async () => {
    if (selectedNotifications.length === 0) {
      showToast('No notifications selected', 'info');
      return;
    }
    
    if (!confirm(`Delete ${selectedNotifications.length} selected notifications?`)) return;
    
    try {
      setIsDeleting(true);
      const result = await notificationService.deleteMultiple(selectedNotifications);
      
      if (result.success && isMounted.current) {
        setNotifications(prev => prev.filter(n => !selectedNotifications.includes(n._id)));
        setTotal(prev => prev - selectedNotifications.length);
        setUnreadCount(result.unreadCount);
        setSelectedNotifications([]);
        setSelectMode(false);
        showToast(`${selectedNotifications.length} notifications deleted`, 'success');
        
        if (getUnreadCount) {
          getUnreadCount();
        }
      } else {
        showToast(result.error || 'Failed to delete notifications', 'error');
      }
    } catch (error) {
      console.error('❌ [Notifications] Delete multiple error:', error);
      showToast('Failed to delete notifications', 'error');
    } finally {
      if (isMounted.current) {
        setIsDeleting(false);
      }
    }
  }, [selectedNotifications, getUnreadCount, showToast]);

  // ============================================
  // DELETE ALL NOTIFICATIONS
  // ============================================
  const deleteAllNotifications = useCallback(async () => {
    if (!confirm('Delete all notifications?')) return;
    
    try {
      setIsDeleting(true);
      const result = await notificationService.deleteAllNotifications();
      
      if (result.success && isMounted.current) {
        setNotifications([]);
        setTotal(0);
        setUnreadCount(0);
        setSelectedNotifications([]);
        setSelectMode(false);
        showToast('All notifications deleted', 'success');
        
        if (getUnreadCount) {
          getUnreadCount();
        }
      } else {
        showToast(result.error || 'Failed to delete all notifications', 'error');
      }
    } catch (error) {
      console.error('❌ [Notifications] Delete all error:', error);
      showToast('Failed to delete all notifications', 'error');
    } finally {
      if (isMounted.current) {
        setIsDeleting(false);
      }
    }
  }, [showToast, getUnreadCount]);

  // ============================================
  // TOGGLE SELECTION
  // ============================================
  const toggleSelect = useCallback((notificationId) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId) 
        ? prev.filter(id => id !== notificationId) 
        : [...prev, notificationId]
    )
  }, [])

  // ============================================
  // TOGGLE SELECT ALL
  // ============================================
  const toggleSelectAll = useCallback(() => {
    if (selectedNotifications.length === displayedNotifications.length) {
      setSelectedNotifications([])
    } else {
      setSelectedNotifications(displayedNotifications.map(n => n._id))
    }
  }, [selectedNotifications, displayedNotifications])

  // ============================================
  // HANDLE REFRESH
  // ============================================
  const handleRefresh = useCallback(async () => {
    if (refreshing) return
    setRefreshing(true)
    setPage(1)
    await fetchNotifications(true)
    setRefreshing(false)
  }, [fetchNotifications, refreshing])

  // ============================================
  // GET ICON COMPONENT
  // ============================================
  const getIcon = useCallback((notification) => {
    const iconMap = {
      'Bell': Bell,
      'Calendar': Calendar,
      'CreditCard': CreditCard,
      'Star': Star,
      'User': User,
      'CheckCircle': CheckCircle,
      'AlertCircle': AlertCircle,
      'MessageSquare': MessageSquare,
      'Heart': Heart,
      'MapPin': MapPin,
      'Hotel': Hotel,
      'Plane': Plane,
      'Settings': Settings,
      'Globe': Globe,
      'Clock': Clock,
      'Award': Award,
      'Gift': Gift,
      'TrendingUp': TrendingUp,
      'Zap': Zap,
      'Flame': Flame,
      'Crown': Crown,
      'Gem': Gem,
      'Sparkles': Sparkles,
      'Shield': Shield,
      'Trophy': Trophy
    }
    return iconMap[notification?.icon] || Bell
  }, [])

  // ============================================
  // GET TIME AGO
  // ============================================
  const getTimeAgo = useCallback((date) => {
    if (!date) return 'Just now'
    const diff = Date.now() - new Date(date).getTime()
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    const weeks = Math.floor(days / 7)
    const months = Math.floor(days / 30)
    const years = Math.floor(days / 365)
    
    if (seconds < 5) return 'Just now'
    if (seconds < 60) return `${seconds}s ago`
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    if (weeks < 4) return `${weeks}w ago`
    if (months < 12) return `${months}mo ago`
    return `${years}y ago`
  }, [])

  // ============================================
  // PRIORITY COLORS
  // ============================================
  const getPriorityColor = useCallback((priority) => {
    switch(priority) {
      case 'urgent': return 'border-red-500/30 bg-red-500/10'
      case 'high': return 'border-orange-500/30 bg-orange-500/10'
      case 'medium': return 'border-yellow-500/30 bg-yellow-500/10'
      default: return 'border-blue-500/30 bg-blue-500/10'
    }
  }, [])

  // ============================================
  // GET PRIORITY LABEL
  // ============================================
  const getPriorityLabel = useCallback((priority) => {
    switch(priority) {
      case 'urgent': return '🔴 Urgent'
      case 'high': return '🟠 High'
      case 'medium': return '🟡 Medium'
      default: return '🔵 Low'
    }
  }, [])

  // ============================================
  // FILTERED NOTIFICATIONS
  // ============================================
  const displayedNotifications = useCallback(() => {
    let filtered = [...notifications]
    
    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim()
      filtered = filtered.filter(n => 
        n.title?.toLowerCase().includes(query) ||
        n.message?.toLowerCase().includes(query)
      )
    }
    
    return filtered
  }, [notifications, searchQuery])

  // ============================================
  // GET FILTER COUNT
  // ============================================
  const getFilterCount = useCallback((filterType) => {
    if (filterType === 'all') return total
    if (filterType === 'unread') return unreadCount
    if (filterType === 'read') return total - unreadCount
    return notifications.filter(n => n.type === filterType).length
  }, [notifications, total, unreadCount])

  // ============================================
  // SERVICE LISTENER FOR COUNT UPDATES
  // ============================================
  useEffect(() => {
    const unsubscribe = notificationService.addListener((event, data) => {
      if (event === 'count-updated' && data.unreadCount !== undefined) {
        setUnreadCount(data.unreadCount);
      }
      if (event === 'new-notification' && data.notification) {
        setNotifications(prev => [data.notification, ...prev]);
        setTotal(prev => prev + 1);
        if (!data.notification.read) {
          setUnreadCount(prev => prev + 1);
        }
        showToast('🔔 ' + data.notification.title, 'info');
      }
    });

    return unsubscribe;
  }, [showToast]);

  // ============================================
  // SOCKET LISTENERS
  // ============================================
  useEffect(() => {
    if (!socket) return;

    const handleNewNotification = (data) => {
      if (data?.notification && isMounted.current) {
        console.log('🔔 [Notifications] New notification:', data.notification);
        setNotifications(prev => [data.notification, ...prev]);
        setTotal(prev => prev + 1);
        if (!data.notification.read) {
          setUnreadCount(prev => prev + 1);
        }
        showToast('🔔 ' + data.notification.title, 'info');
      }
    };

    const handleNotificationRead = (data) => {
      if (isMounted.current) {
        setNotifications(prev => prev.map(n => 
          n._id === data.notificationId ? { ...n, read: true, readAt: new Date() } : n
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
        setSelectedNotifications(prev => prev.filter(id => id !== data.notificationId));
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
        setSelectedNotifications([]);
        showToast('All notifications deleted', 'success');
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
  }, [socket, showToast]);

  // ============================================
  // INTERSECTION OBSERVER FOR INFINITE SCROLL
  // ============================================
  useEffect(() => {
    if (!endRef.current || !hasMore || loading) return;
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && isMounted.current) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );
    
    observerRef.current.observe(endRef.current);
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, loadMore]);

  // ============================================
  // INITIAL LOAD AND FILTER CHANGES
  // ============================================
  useEffect(() => {
    isMounted.current = true;
    
    if (!user) {
      setLoading(false);
      return;
    }
    
    setPage(1);
    setNotifications([]);
    fetchNotificationTypes();
    fetchNotifications(true);
    initialLoadDone.current = true;
    
    return () => {
      isMounted.current = false;
    };
  }, [filter, activeTypeFilter, user]);

  // ============================================
  // RENDER
  // ============================================
  if (!user) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-2xl font-bold">Please login to view notifications</h2>
          <button 
            onClick={() => window.location.href = '/login'}
            className="mt-4 px-6 py-3 bg-amber-500 text-white rounded-lg"
          >
            Login
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const filteredNotifications = displayedNotifications();

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* ============================================ */}
        {/* HEADER - Premium */}
        {/* ============================================ */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className={`text-3xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
              <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                Notifications
              </span>
              {user?.role === 'admin' && (
                <span className="ml-2 text-sm font-normal text-amber-500">(Admin View)</span>
              )}
            </h1>
            <div className="flex items-center gap-4 mt-1.5">
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>{total}</span> notification{total !== 1 ? 's' : ''}
                <span className="mx-2">·</span>
                <span className={`font-semibold ${unreadCount > 0 ? 'text-amber-500' : isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {unreadCount} unread
                </span>
              </p>
              <div className="flex items-center gap-1.5">
                {isConnected ? (
                  <>
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Live</span>
                  </>
                ) : (
                  <>
                    <div className="w-2 h-2 rounded-full bg-red-500" />
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Offline</span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Toggle */}
            <button
              onClick={() => setShowSearch(!showSearch)}
              className={`p-2 rounded-xl transition-colors ${
                isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              } ${showSearch ? (isDark ? 'bg-gray-800' : 'bg-gray-100') : ''}`}
              title="Search notifications"
            >
              <Search className="w-4 h-4" />
            </button>
            
            {/* Refresh */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`p-2 rounded-xl transition-colors ${
                isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              } ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Refresh notifications"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            
            {/* Select Mode Toggle */}
            {notifications.length > 0 && (
              <button
                onClick={() => {
                  setSelectMode(!selectMode);
                  setSelectedNotifications([]);
                }}
                className={`p-2 rounded-xl transition-colors ${
                  selectMode 
                    ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' 
                    : isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                }`}
                title="Select notifications"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
            )}
            
            {/* Mark all read */}
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-3 py-2 text-xs font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/30"
              >
                Mark all read ✨
              </button>
            )}
            
            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-xl transition-colors ${
                isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              } ${showFilters ? (isDark ? 'bg-gray-800' : 'bg-gray-100') : ''}`}
              title="Filter notifications"
            >
              <Filter className={`w-4 h-4 ${showFilters ? 'text-amber-500' : ''}`} />
              {filter !== 'all' && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500" />
              )}
            </button>
            
            {/* Delete All */}
            {notifications.length > 0 && (
              <button
                onClick={deleteAllNotifications}
                disabled={isDeleting}
                className={`p-2 rounded-xl transition-colors text-red-400 hover:text-red-500 ${
                  isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                } ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Delete all notifications"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* ============================================ */}
        {/* SEARCH BAR */}
        {/* ============================================ */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
              <div className={`flex items-center gap-2 rounded-xl px-4 transition-all ${
                isDark ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'
              }`}>
                <Search className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search notifications..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`w-full py-2.5 bg-transparent outline-none text-sm ${
                    isDark ? 'text-white placeholder-gray-400' : 'text-gray-800 placeholder-gray-400'
                  }`}
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

        {/* ============================================ */}
        {/* FILTER BAR - Premium */}
        {/* ============================================ */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`mb-6 p-4 rounded-2xl ${
                isDark ? 'bg-gray-800/50 border border-gray-700' : 'bg-white border border-gray-200'
              }`}
            >
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    filter === 'all'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                      : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    All
                    <span className={`text-xs ${filter === 'all' ? 'opacity-80' : 'text-gray-400'}`}>
                      ({getFilterCount('all')})
                    </span>
                  </span>
                </button>
                <button
                  onClick={() => setFilter('unread')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    filter === 'unread'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                      : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    🔴 Unread
                    <span className={`text-xs ${filter === 'unread' ? 'opacity-80' : 'text-gray-400'}`}>
                      ({getFilterCount('unread')})
                    </span>
                  </span>
                </button>
                <button
                  onClick={() => setFilter('read')}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    filter === 'read'
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                      : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    ✅ Read
                    <span className={`text-xs ${filter === 'read' ? 'opacity-80' : 'text-gray-400'}`}>
                      ({getFilterCount('read')})
                    </span>
                  </span>
                </button>
                
                <div className="w-px h-8 bg-gray-700/30 mx-1" />
                
                {/* Type filters */}
                {notificationTypes.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => {
                      if (activeTypeFilter === type.value) {
                        setActiveTypeFilter(null);
                      } else {
                        setActiveTypeFilter(type.value);
                        setFilter('all');
                      }
                    }}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      activeTypeFilter === type.value
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30'
                        : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {type.label}
                      <span className={`text-xs ${activeTypeFilter === type.value ? 'opacity-80' : 'text-gray-400'}`}>
                        ({getFilterCount(type.value)})
                      </span>
                    </span>
                  </button>
                ))}
              </div>
              
              {/* Active filters summary */}
              {(filter !== 'all' || activeTypeFilter) && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-700/30">
                  <span className="text-xs text-gray-400">Active filters:</span>
                  {filter !== 'all' && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      filter === 'unread' ? 'bg-red-500/20 text-red-400' :
                      filter === 'read' ? 'bg-green-500/20 text-green-400' :
                      'bg-amber-500/20 text-amber-400'
                    }`}>
                      {filter === 'unread' ? '🔴 Unread' : 
                       filter === 'read' ? '✅ Read' : filter}
                    </span>
                  )}
                  {activeTypeFilter && (
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-400">
                      {notificationTypes.find(t => t.value === activeTypeFilter)?.label || activeTypeFilter}
                    </span>
                  )}
                  <button
                    onClick={() => {
                      setFilter('all');
                      setActiveTypeFilter(null);
                    }}
                    className="text-xs text-amber-500 hover:text-amber-400 ml-auto"
                  >
                    Clear all ✨
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============================================ */}
        {/* SELECT MODE TOOLBAR */}
        {/* ============================================ */}
        {selectMode && (
          <div className={`mb-4 p-3 rounded-xl flex items-center justify-between ${
            isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'
          }`}>
            <div className="flex items-center gap-3">
              <button
                onClick={toggleSelectAll}
                className={`p-1.5 rounded-lg transition-colors ${
                  selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0
                    ? 'bg-amber-500 text-white'
                    : isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                }`}
              >
                <Check className="w-4 h-4" />
              </button>
              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
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
                className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                  isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* ============================================ */}
        {/* ERROR DISPLAY */}
        {/* ============================================ */}
        {apiError && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{apiError}</span>
            <button
              onClick={() => {
                setApiError(null);
                fetchNotifications(true);
              }}
              className="ml-auto text-red-400 hover:text-red-300 font-medium"
            >
              Try again
            </button>
          </div>
        )}

        {/* ============================================ */}
        {/* NOTIFICATIONS LIST */}
        {/* ============================================ */}
        {loading && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="relative w-16 h-16 mx-auto">
                <div className="absolute inset-0 rounded-full border-4 border-amber-500/20 animate-spin-slow" />
                <div className="absolute inset-0 rounded-full border-t-4 border-amber-500 animate-spin" />
              </div>
              <p className={`mt-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Loading notifications...
              </p>
            </div>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="text-center py-20">
            <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center ${
              isDark ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <Bell className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className={`mt-4 text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {searchQuery ? 'No matching notifications' : 'No notifications'}
            </h3>
            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {searchQuery ? `No results for "${searchQuery}"` : 
               filter === 'unread' ? "You're all caught up! 🎉" : 
               'No notifications to display'}
            </p>
            {(filter !== 'all' || activeTypeFilter || searchQuery) && (
              <button
                onClick={() => {
                  setFilter('all');
                  setActiveTypeFilter(null);
                  setSearchQuery('');
                }}
                className="mt-4 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/30"
              >
                Clear all filters ✨
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map((notification, index) => {
              const Icon = getIcon(notification);
              const isUnread = !notification.read;
              const isSelected = selectedNotifications.includes(notification._id);
              
              return (
                <motion.div
                  key={notification._id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.5) }}
                  className={`group relative p-4 rounded-xl transition-all duration-300 ${
                    isUnread
                      ? isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'
                      : isDark ? 'bg-gray-800/30 border border-transparent' : 'bg-white border border-gray-100'
                  } ${notification.priority ? getPriorityColor(notification.priority) : ''} ${
                    isSelected ? 'ring-2 ring-amber-500' : ''
                  } hover:shadow-lg`}
                >
                  <div className="flex items-start gap-4">
                    {/* Selection checkbox */}
                    {selectMode && (
                      <button
                        onClick={() => toggleSelect(notification._id)}
                        className={`mt-1 w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                          isSelected 
                            ? 'bg-amber-500 border-amber-500 text-white' 
                            : isDark ? 'border-gray-600' : 'border-gray-300'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3" />}
                      </button>
                    )}
                    
                    <div className={`p-2.5 rounded-xl flex-shrink-0 transition-all group-hover:scale-105 ${
                      notification.bgColor || (isDark ? 'bg-gray-700' : 'bg-gray-100')
                    }`}>
                      <Icon className={`w-5 h-5 ${notification.color || (isUnread ? 'text-amber-500' : 'text-gray-400')}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'} flex items-center gap-2`}>
                            {notification.title}
                            {notification.priority === 'urgent' && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/30 text-red-400 animate-pulse border border-red-500/30">
                                Urgent
                              </span>
                            )}
                            {isUnread && (
                              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                            )}
                          </h4>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-xs text-gray-400 whitespace-nowrap">
                            {getTimeAgo(notification.createdAt)}
                          </span>
                          {!selectMode && (
                            <>
                              {!notification.read && (
                                <button
                                  onClick={() => markAsRead(notification._id)}
                                  className="text-xs text-blue-400 hover:text-blue-300 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                  Mark read
                                </button>
                              )}
                              <button
                                onClick={() => deleteNotification(notification._id)}
                                disabled={isDeleting}
                                className="text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {notification.message}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          {getTimeAgo(notification.createdAt)}
                        </span>
                        
                        {notification.priority && notification.priority !== 'low' && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                            notification.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                            notification.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                            notification.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-blue-500/20 text-blue-400'
                          }`}>
                            {getPriorityLabel(notification.priority)}
                          </span>
                        )}
                        
                        {notification.type && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                            isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                          }`}>
                            {notification.type}
                          </span>
                        )}
                        
                        {notification.actionUrl && (
                          <a
                            href={notification.actionUrl}
                            className="text-xs text-amber-500 hover:text-amber-400 font-medium flex items-center gap-1 transition-colors"
                          >
                            View details
                            <ChevronRight className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* ============================================ */}
        {/* LOAD MORE */}
        {/* ============================================ */}
        {hasMore && filteredNotifications.length > 0 && (
          <div ref={endRef} className="py-6 text-center">
            {loading ? (
              <Loader2 className="w-6 h-6 text-amber-500 animate-spin mx-auto" />
            ) : (
              <button
                onClick={loadMore}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-500 font-medium transition-all duration-300 hover:from-amber-500/30 hover:to-orange-500/30"
              >
                Load more
              </button>
            )}
          </div>
        )}
        
        {/* Footer stats */}
        {notifications.length > 0 && (
          <div className={`mt-6 pt-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'} flex items-center justify-between text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            <span>
              Showing {filteredNotifications.length} of {total} notifications
            </span>
            <span>
              {unreadCount} unread · {total - unreadCount} read
            </span>
          </div>
        )}
      </div>
      
      <Footer />
    </div>
  );
};

export default Notifications;
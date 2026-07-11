import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Bell, Calendar, CreditCard, Star, User, CheckCircle, 
  AlertCircle, MessageSquare, Heart, MapPin, Hotel, Plane,
  Settings, Globe, Clock, Award, Gift, TrendingUp,
  ChevronRight, Check, Trash2, Loader2, Filter,
  ChevronDown, ChevronUp, RefreshCw, Wifi, WifiOff
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { useToast } from '../hooks/useToast'
import axios from '../api/axios'
import { useNavigate } from 'react-router-dom'

const NotificationPanel = ({ isOpen, onClose }) => {
  const { isDark } = useTheme()
  const { user } = useAuth()
  const { socket, isConnected, unreadCount: socketUnreadCount, getUnreadCount } = useSocket()
  const { showToast } = useToast()
  const navigate = useNavigate()
  
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [unreadCount, setUnreadCount] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)
  const [filter, setFilter] = useState('all')
  const [showFilters, setShowFilters] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [apiError, setApiError] = useState(null)
  
  const notificationsEndRef = useRef(null)
  const observerRef = useRef(null)
  const isMounted = useRef(true)
  const initialLoadDone = useRef(false)

  // ============================================
  // FIXED: Get API endpoint WITH /api prefix
  // ============================================
  const getApiEndpoint = useCallback(() => {
    if (user?.role === 'admin') {
      return '/api/notifications/admin'
    }
    return '/api/notifications'
  }, [user?.role])

  // ============================================
  // Fetch notifications with proper error handling
  // ============================================
  const fetchNotifications = useCallback(async (reset = true) => {
    if (!user) {
      console.warn('⚠️ [NotificationPanel] No user, skipping fetch')
      setLoading(false)
      return
    }
    
    try {
      setLoading(true)
      setApiError(null)
      
      const currentPage = reset ? 1 : page
      const endpoint = getApiEndpoint()
      
      const params = {
        page: currentPage,
        limit: 10,
      }
      
      if (filter === 'unread') {
        params.read = 'false'
      } else if (filter !== 'all' && filter !== 'unread') {
        params.type = filter
      }
      
      if (user?.role === 'admin') {
        params.admin = 'true'
      }

      console.log(`📡 [NotificationPanel] Fetching from ${endpoint}`, params)
      
      const response = await axios.get(endpoint, { params })

      if (response.data?.success && isMounted.current) {
        const data = response.data
        const newNotifications = data.notifications || []
        
        if (reset) {
          setNotifications(newNotifications)
          setPage(1)
        } else {
          setNotifications(prev => [...prev, ...newNotifications])
        }
        
        const count = data.unreadCount || 0
        setUnreadCount(count)
        setHasMore(data.pagination?.hasMore || false)
        setTotal(data.total || 0)
        
        console.log(`✅ [NotificationPanel] Loaded ${newNotifications.length} notifications, total: ${data.total}`)
      } else {
        console.warn('⚠️ [NotificationPanel] Unexpected response:', response.data)
        if (reset) {
          setNotifications([])
          setTotal(0)
          setUnreadCount(0)
        }
      }
    } catch (error) {
      console.error('❌ [NotificationPanel] Fetch error:', error)
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
  }, [user, page, filter, getApiEndpoint, showToast])

  // ============================================
  // Load more notifications
  // ============================================
  const loadMore = useCallback(() => {
    if (!loading && hasMore && isMounted.current) {
      setPage(prev => prev + 1)
      fetchNotifications(false)
    }
  }, [loading, hasMore, fetchNotifications])

  // ============================================
  // FIXED: Mark as read WITH /api prefix
  // ============================================
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await axios.put(`/api/notifications/${notificationId}/read`)
      
      if (isMounted.current) {
        setNotifications(prev => prev.map(n => 
          n._id === notificationId ? { ...n, read: true, readAt: new Date() } : n
        ))
        setUnreadCount(prev => Math.max(0, prev - 1))
        
        if (getUnreadCount) {
          getUnreadCount()
        }
      }
    } catch (error) {
      console.error('❌ [NotificationPanel] Mark as read error:', error)
    }
  }, [getUnreadCount])

  // ============================================
  // FIXED: Mark all as read WITH /api prefix
  // ============================================
  const markAllAsRead = useCallback(async () => {
    try {
      const endpoint = user?.role === 'admin' 
        ? '/api/notifications/admin/read-all'
        : '/api/notifications/read-all'
      
      await axios.put(endpoint)
      
      if (isMounted.current) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true, readAt: new Date() })))
        setUnreadCount(0)
        showToast('All notifications marked as read', 'success')
        
        if (getUnreadCount) {
          getUnreadCount()
        }
      }
    } catch (error) {
      console.error('❌ [NotificationPanel] Mark all as read error:', error)
      showToast('Failed to mark all as read', 'error')
    }
  }, [user?.role, showToast, getUnreadCount])

  // ============================================
  // FIXED: Delete notification WITH /api prefix
  // ============================================
  const deleteNotification = useCallback(async (notificationId, e) => {
    e?.stopPropagation()
    
    if (!confirm('Delete this notification?')) return
    
    try {
      setIsDeleting(true)
      await axios.delete(`/api/notifications/${notificationId}`)
      
      if (isMounted.current) {
        const deleted = notifications.find(n => n._id === notificationId)
        setNotifications(prev => prev.filter(n => n._id !== notificationId))
        setTotal(prev => prev - 1)
        
        if (!deleted?.read) {
          setUnreadCount(prev => Math.max(0, prev - 1))
        }
        
        showToast('Notification deleted', 'success')
        
        if (getUnreadCount) {
          getUnreadCount()
        }
      }
    } catch (error) {
      console.error('❌ [NotificationPanel] Delete error:', error)
      showToast('Failed to delete notification', 'error')
    } finally {
      if (isMounted.current) {
        setIsDeleting(false)
      }
    }
  }, [notifications, showToast, getUnreadCount])

  // ============================================
  // FIXED: Delete all WITH /api prefix
  // ============================================
  const deleteAllNotifications = useCallback(async () => {
    if (!confirm('Delete all notifications?')) return
    
    try {
      setIsDeleting(true)
      const endpoint = user?.role === 'admin' 
        ? '/api/notifications/admin/delete-all'
        : '/api/notifications/delete-all'
      
      await axios.delete(endpoint)
      
      if (isMounted.current) {
        setNotifications([])
        setTotal(0)
        setUnreadCount(0)
        showToast('All notifications deleted', 'success')
        
        if (getUnreadCount) {
          getUnreadCount()
        }
      }
    } catch (error) {
      console.error('❌ [NotificationPanel] Delete all error:', error)
      showToast('Failed to delete all notifications', 'error')
    } finally {
      if (isMounted.current) {
        setIsDeleting(false)
      }
    }
  }, [user?.role, showToast, getUnreadCount])

  // ============================================
  // Handle notification click
  // ============================================
  const handleNotificationClick = useCallback((notification) => {
    if (!notification.read) {
      markAsRead(notification._id)
    }
    
    if (notification.actionUrl) {
      navigate(notification.actionUrl)
      onClose()
    }
  }, [markAsRead, navigate, onClose])

  // ============================================
  // Handle refresh
  // ============================================
  const handleRefresh = useCallback(async () => {
    if (refreshing) return
    setRefreshing(true)
    setPage(1)
    await fetchNotifications(true)
    setRefreshing(false)
  }, [fetchNotifications, refreshing])

  // ============================================
  // Get icon component
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
      'TrendingUp': TrendingUp
    }
    return iconMap[notification?.icon] || Bell
  }, [])

  // ============================================
  // Get time ago
  // ============================================
  const getTimeAgo = useCallback((date) => {
    if (!date) return 'Just now'
    const diff = Date.now() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return new Date(date).toLocaleDateString()
  }, [])

  // ============================================
  // Priority colors
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
  // Socket listeners
  // ============================================
  useEffect(() => {
    if (!socket) return

    const handleNewNotification = (data) => {
      if (data?.notification && isMounted.current) {
        console.log('🔔 [NotificationPanel] New notification:', data.notification)
        setNotifications(prev => [data.notification, ...prev])
        setTotal(prev => prev + 1)
        if (!data.notification.read) {
          setUnreadCount(prev => prev + 1)
        }
        showToast('🔔 ' + data.notification.title, 'info')
      }
    }

    const handleNotificationRead = (data) => {
      if (isMounted.current) {
        setNotifications(prev => prev.map(n => 
          n._id === data.notificationId ? { ...n, read: true } : n
        ))
        if (data.unreadCount !== undefined) {
          setUnreadCount(data.unreadCount)
        }
      }
    }

    const handleAllNotificationsRead = () => {
      if (isMounted.current) {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })))
        setUnreadCount(0)
      }
    }

    const handleNotificationDeleted = (data) => {
      if (isMounted.current) {
        setNotifications(prev => prev.filter(n => n._id !== data.notificationId))
        setTotal(prev => prev - 1)
      }
    }

    const handleAllNotificationsDeleted = () => {
      if (isMounted.current) {
        setNotifications([])
        setTotal(0)
        setUnreadCount(0)
      }
    }

    socket.on('new-notification', handleNewNotification)
    socket.on('notification-read', handleNotificationRead)
    socket.on('all-notifications-read', handleAllNotificationsRead)
    socket.on('notification-deleted', handleNotificationDeleted)
    socket.on('all-notifications-deleted', handleAllNotificationsDeleted)

    return () => {
      socket.off('new-notification', handleNewNotification)
      socket.off('notification-read', handleNotificationRead)
      socket.off('all-notifications-read', handleAllNotificationsRead)
      socket.off('notification-deleted', handleNotificationDeleted)
      socket.off('all-notifications-deleted', handleAllNotificationsDeleted)
    }
  }, [socket, showToast])

  // ============================================
  // Sync unread count with socket
  // ============================================
  useEffect(() => {
    if (socketUnreadCount !== undefined && isMounted.current) {
      setUnreadCount(socketUnreadCount)
    }
  }, [socketUnreadCount])

  // ============================================
  // Intersection observer for infinite scroll
  // ============================================
  useEffect(() => {
    if (!notificationsEndRef.current || !hasMore || !isOpen) return
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && isMounted.current) {
          loadMore()
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    )
    
    observerRef.current.observe(notificationsEndRef.current)
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasMore, loading, loadMore, isOpen])

  // ============================================
  // Load notifications when panel opens
  // ============================================
  useEffect(() => {
    isMounted.current = true
    
    if (isOpen && user) {
      setPage(1)
      setNotifications([])
      fetchNotifications(true)
      initialLoadDone.current = true
    }
    
    return () => {
      isMounted.current = false
    }
  }, [isOpen, user])

  // ============================================
  // RENDER
  // ============================================
  if (!isOpen) return null

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed right-0 top-0 z-50 h-full w-full max-w-lg ${
              isDark ? 'bg-gray-900' : 'bg-white'
            } shadow-2xl`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-4 border-b sticky top-0 z-10 ${
              isDark ? 'border-gray-800 bg-gray-900/95 backdrop-blur-sm' : 'border-gray-200 bg-white/95 backdrop-blur-sm'
            }`}>
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Notifications
                  {user?.role === 'admin' && (
                    <span className="ml-2 text-xs font-normal text-amber-500">(Admin)</span>
                  )}
                </h2>
                {unreadCount > 0 && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-red-500 text-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                {/* Connection status */}
                <div className={`mr-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {isConnected ? (
                    <Wifi className="w-4 h-4 text-green-500" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-500 animate-pulse" />
                  )}
                </div>
                
                {/* Refresh */}
                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                  } ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
                
                {/* Mark all read */}
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className={`p-2 rounded-lg text-xs font-medium transition-colors ${
                      isDark ? 'hover:bg-gray-800 text-blue-400' : 'hover:bg-gray-100 text-blue-600'
                    }`}
                  >
                    Mark all read
                  </button>
                )}
                
                {/* Filter */}
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                  }`}
                >
                  <Filter className="w-4 h-4" />
                </button>
                
                {/* Delete all */}
                {notifications.length > 0 && (
                  <button
                    onClick={deleteAllNotifications}
                    disabled={isDeleting}
                    className={`p-2 rounded-lg transition-colors text-red-400 hover:text-red-500 ${
                      isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                    } ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                
                {/* Close */}
                <button
                  onClick={onClose}
                  className={`p-2 rounded-lg transition-colors ${
                    isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Error Display */}
            {apiError && (
              <div className="mx-4 mt-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500 text-sm">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{apiError}</span>
                </div>
              </div>
            )}

            {/* Filters */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`px-4 py-3 border-b ${
                    isDark ? 'border-gray-800 bg-gray-800/50' : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => setFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        filter === 'all'
                          ? 'bg-amber-500 text-white'
                          : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilter('unread')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        filter === 'unread'
                          ? 'bg-amber-500 text-white'
                          : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      Unread
                    </button>
                    <button
                      onClick={() => setFilter('booking')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        filter === 'booking'
                          ? 'bg-amber-500 text-white'
                          : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      Bookings
                    </button>
                    <button
                      onClick={() => setFilter('payment')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        filter === 'payment'
                          ? 'bg-amber-500 text-white'
                          : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      Payments
                    </button>
                    <button
                      onClick={() => setFilter('review')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        filter === 'review'
                          ? 'bg-amber-500 text-white'
                          : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      Reviews
                    </button>
                    <button
                      onClick={() => setFilter('system')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        filter === 'system'
                          ? 'bg-amber-500 text-white'
                          : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                      }`}
                    >
                      System
                    </button>
                    {user?.role === 'admin' && (
                      <button
                        onClick={() => setFilter('admin')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          filter === 'admin'
                            ? 'bg-purple-500 text-white'
                            : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                      >
                        Admin
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Notification List */}
            <div className="overflow-y-auto h-[calc(100vh-120px)] p-4">
              {loading && notifications.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Bell className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    No Notifications
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {filter === 'unread' ? "You're all caught up!" : 'No notifications to show'}
                  </p>
                  {filter !== 'all' && (
                    <button
                      onClick={() => setFilter('all')}
                      className="mt-4 text-amber-500 hover:text-amber-600 text-sm font-medium"
                    >
                      View all notifications →
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    {notifications.map((notification, index) => {
                      const Icon = getIcon(notification)
                      const isUnread = !notification.read
                      
                      return (
                        <motion.div
                          key={notification._id || index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }}
                          onClick={() => handleNotificationClick(notification)}
                          className={`p-4 rounded-xl transition-all cursor-pointer relative group ${
                            isUnread
                              ? isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'
                              : isDark ? 'hover:bg-gray-800/50' : 'hover:bg-gray-50'
                          } ${notification.priority ? getPriorityColor(notification.priority) : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg flex-shrink-0 ${
                              notification.bgColor || (isDark ? 'bg-gray-800' : 'bg-gray-100')
                            }`}>
                              <Icon className={`w-5 h-5 ${notification.color || 'text-gray-500'}`} />
                            </div>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2">
                                <h4 className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                  {notification.title}
                                </h4>
                                {isUnread && (
                                  <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0 mt-1.5 animate-pulse" />
                                )}
                              </div>
                              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} line-clamp-2`}>
                                {notification.message}
                              </p>
                              <div className="flex items-center flex-wrap gap-2 mt-1.5">
                                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                                  {getTimeAgo(notification.createdAt)}
                                </span>
                                {notification.priority && (
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                    notification.priority === 'urgent' ? 'bg-red-500/20 text-red-400' :
                                    notification.priority === 'high' ? 'bg-orange-500/20 text-orange-400' :
                                    notification.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                                    'bg-blue-500/20 text-blue-400'
                                  }`}>
                                    {notification.priority}
                                  </span>
                                )}
                                {notification.type && (
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                                    isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'
                                  }`}>
                                    {notification.type}
                                  </span>
                                )}
                                {notification.actionLabel && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      handleNotificationClick(notification)
                                    }}
                                    className="text-xs text-amber-500 hover:text-amber-600 font-medium flex items-center gap-1"
                                  >
                                    {notification.actionLabel}
                                    <ChevronRight className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                            
                            <button
                              onClick={(e) => deleteNotification(notification._id, e)}
                              disabled={isDeleting}
                              className={`p-1.5 rounded-lg transition-colors ${
                                isDark 
                                  ? 'hover:bg-gray-700 text-gray-500 hover:text-red-400' 
                                  : 'hover:bg-gray-200 text-gray-400 hover:text-red-500'
                              } ${isDeleting ? 'opacity-50 cursor-not-allowed' : 'opacity-0 group-hover:opacity-100'}`}
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </motion.div>
                      )
                    })}
                  </div>
                  
                  {/* Load more indicator */}
                  {hasMore && (
                    <div ref={notificationsEndRef} className="py-4 flex justify-center">
                      {loading ? (
                        <Loader2 className="w-6 h-6 text-amber-500 animate-spin" />
                      ) : (
                        <button
                          onClick={loadMore}
                          className="text-sm text-amber-500 hover:text-amber-600 font-medium"
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
            <div className={`p-3 border-t ${
              isDark ? 'border-gray-800' : 'border-gray-200'
            }`}>
              <div className="flex items-center justify-between">
                <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  {total} notification{total !== 1 ? 's' : ''}
                </p>
                <div className="flex items-center gap-3">
                  <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    {unreadCount} unread
                  </p>
                  <div className="flex items-center gap-1">
                    {isConnected ? (
                      <>
                        <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Live
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          Offline
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default NotificationPanel
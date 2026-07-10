// src/pages/Notifications.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bell, Trash2, RefreshCw, Wifi, WifiOff, 
  Calendar, CreditCard, Star, User, CheckCircle,
  AlertCircle, MessageSquare, Heart, MapPin, Hotel, Plane,
  Settings, Globe, Clock, Award, Gift, TrendingUp,
  ChevronRight, Loader2, Filter, X
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { useToast } from '../hooks/useToast'
import axios from '../api/axios'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'

const Notifications = () => {
  const { isDark } = useTheme()
  const { user } = useAuth()
  const { socket, isConnected, getUnreadCount } = useSocket()
  const { showToast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)
  const [filter, setFilter] = useState('all')
  const [refreshing, setRefreshing] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [isDeleting, setIsDeleting] = useState(false)
  
  const observerRef = useRef(null)
  const endRef = useRef(null)
  const isMounted = useRef(true)
  const initialLoadDone = useRef(false)

  // Get API endpoint based on user role
  const getApiEndpoint = useCallback(() => {
    return user?.role === 'admin' ? '/notifications/admin' : '/notifications'
  }, [user?.role])

  // Fetch notifications
  const fetchNotifications = useCallback(async (reset = true) => {
    if (!user) return
    
    try {
      setLoading(true)
      const currentPage = reset ? 1 : page
      
      const endpoint = getApiEndpoint()
      const params = {
        page: currentPage,
        limit: 20,
        read: filter === 'unread' ? 'false' : undefined,
        type: filter !== 'all' && filter !== 'unread' ? filter : undefined
      }
      
      // If admin, add admin flag to get all notifications
      if (user?.role === 'admin') {
        params.admin = 'true'
      }

      console.log(`📡 [Notifications] Fetching from ${endpoint}`, params)
      
      const response = await axios.get(endpoint, { params })

      if (response.data.success && isMounted.current) {
        const data = response.data
        const newNotifications = data.notifications || []
        
        if (reset) {
          setNotifications(newNotifications)
          setPage(1)
        } else {
          setNotifications(prev => [...prev, ...newNotifications])
        }
        
        setUnreadCount(data.unreadCount || 0)
        setHasMore(data.pagination?.hasMore || false)
        setTotal(data.total || 0)
        
        console.log(`✅ [Notifications] Loaded ${newNotifications.length} notifications, total: ${data.total}`)
      }
    } catch (error) {
      console.error('❌ [Notifications] Fetch error:', error)
      if (isMounted.current) {
        showToast(error.response?.data?.message || 'Failed to load notifications', 'error')
      }
    } finally {
      if (isMounted.current) {
        setLoading(false)
      }
    }
  }, [user, page, filter, getApiEndpoint, showToast])

  // Load more notifications
  const loadMore = useCallback(() => {
    if (!loading && hasMore && isMounted.current) {
      setPage(prev => prev + 1)
      fetchNotifications(false)
    }
  }, [loading, hasMore, fetchNotifications])

  // Mark as read
  const markAsRead = useCallback(async (notificationId) => {
    try {
      await axios.put(`/notifications/${notificationId}/read`)
      
      if (isMounted.current) {
        setNotifications(prev => prev.map(n => 
          n._id === notificationId ? { ...n, read: true, readAt: new Date() } : n
        ))
        setUnreadCount(prev => Math.max(0, prev - 1))
        
        // Refresh unread count from socket
        if (getUnreadCount) {
          getUnreadCount()
        }
      }
    } catch (error) {
      console.error('❌ [Notifications] Mark as read error:', error)
      showToast('Failed to mark as read', 'error')
    }
  }, [getUnreadCount, showToast])

  // Mark all as read
  const markAllAsRead = useCallback(async () => {
    try {
      const endpoint = user?.role === 'admin' ? '/notifications/admin/read-all' : '/notifications/read-all'
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
      console.error('❌ [Notifications] Mark all as read error:', error)
      showToast('Failed to mark all as read', 'error')
    }
  }, [user?.role, showToast, getUnreadCount])

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    if (!confirm('Delete this notification?')) return
    
    try {
      setIsDeleting(true)
      await axios.delete(`/notifications/${notificationId}`)
      
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
      console.error('❌ [Notifications] Delete error:', error)
      showToast('Failed to delete notification', 'error')
    } finally {
      if (isMounted.current) {
        setIsDeleting(false)
      }
    }
  }, [notifications, showToast, getUnreadCount])

  // Delete all notifications
  const deleteAllNotifications = useCallback(async () => {
    if (!confirm('Delete all notifications?')) return
    
    try {
      setIsDeleting(true)
      const endpoint = user?.role === 'admin' ? '/notifications/admin/delete-all' : '/notifications/delete-all'
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
      console.error('❌ [Notifications] Delete all error:', error)
      showToast('Failed to delete all notifications', 'error')
    } finally {
      if (isMounted.current) {
        setIsDeleting(false)
      }
    }
  }, [user?.role, showToast, getUnreadCount])

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    if (refreshing) return
    setRefreshing(true)
    setPage(1)
    await fetchNotifications(true)
    setRefreshing(false)
  }, [fetchNotifications, refreshing])

  // Get icon component
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

  // Get time ago
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

  // Priority colors
  const getPriorityColor = useCallback((priority) => {
    switch(priority) {
      case 'urgent': return 'border-red-500/30 bg-red-500/10'
      case 'high': return 'border-orange-500/30 bg-orange-500/10'
      case 'medium': return 'border-yellow-500/30 bg-yellow-500/10'
      default: return 'border-blue-500/30 bg-blue-500/10'
    }
  }, [])

  // Socket listeners
  useEffect(() => {
    if (!socket) return

    const handleNewNotification = (data) => {
      if (data.notification && isMounted.current) {
        console.log('🔔 [Notifications] New notification:', data.notification)
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

    const handleAllNotificationsRead = (data) => {
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

    const handleAllNotificationsDeleted = (data) => {
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

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (!endRef.current || !hasMore || loading) return
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading && isMounted.current) {
          loadMore()
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    )
    
    observerRef.current.observe(endRef.current)
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasMore, loading, loadMore])

  // Initial load and filter changes
  useEffect(() => {
    isMounted.current = true
    
    if (filter !== 'all' || !initialLoadDone.current) {
      setPage(1)
      setNotifications([])
      fetchNotifications(true)
      initialLoadDone.current = true
    }
    
    return () => {
      isMounted.current = false
    }
  }, [filter, fetchNotifications])

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
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
      <Navbar />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Notifications
              {user?.role === 'admin' && (
                <span className="ml-2 text-sm font-normal text-amber-500">(Admin View)</span>
              )}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {total} notification{total !== 1 ? 's' : ''} · {unreadCount} unread
              </p>
              <div className="flex items-center gap-1">
                {isConnected ? (
                  <>
                    <Wifi className="w-3.5 h-3.5 text-green-500" />
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Live
                    </span>
                  </>
                ) : (
                  <>
                    <WifiOff className="w-3.5 h-3.5 text-red-500" />
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Offline
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {/* Refresh */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              } ${refreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
              title="Refresh notifications"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
            
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-3 py-2 text-xs font-medium bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors"
              >
                Mark all read
              </button>
            )}
            
            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-lg transition-colors ${
                isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              } ${showFilters ? (isDark ? 'bg-gray-800' : 'bg-gray-100') : ''}`}
              title="Filter notifications"
            >
              <Filter className="w-4 h-4" />
            </button>
            
            {/* Delete All */}
            {notifications.length > 0 && (
              <button
                onClick={deleteAllNotifications}
                disabled={isDeleting}
                className={`p-2 rounded-lg transition-colors text-red-400 hover:text-red-500 ${
                  isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                } ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
                title="Delete all notifications"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Bar */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`mb-6 p-3 rounded-xl ${
                isDark ? 'bg-gray-800/50' : 'bg-gray-50'
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

        {/* Notifications List */}
        {loading && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20">
            <Bell className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              No notifications
            </h3>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {filter === 'unread' ? "You're all caught up!" : 'No notifications to display'}
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
          <div className="space-y-3">
            {notifications.map((notification, index) => {
              const Icon = getIcon(notification)
              const isUnread = !notification.read
              
              return (
                <motion.div
                  key={notification._id || index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: Math.min(index * 0.03, 0.5) }}
                  className={`p-4 rounded-xl transition-all ${
                    isUnread
                      ? isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'
                      : isDark ? 'bg-gray-800/30' : 'bg-white'
                  } ${notification.priority ? getPriorityColor(notification.priority) : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-lg flex-shrink-0 ${
                      notification.bgColor || (isDark ? 'bg-gray-700' : 'bg-gray-100')
                    }`}>
                      <Icon className={`w-5 h-5 ${notification.color || (isUnread ? 'text-amber-500' : 'text-gray-400')}`} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {isUnread && (
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                          )}
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification._id)}
                              className="text-xs text-blue-500 hover:text-blue-600"
                            >
                              Mark read
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification._id)}
                            disabled={isDeleting}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {notification.message}
                      </p>
                      
                      <div className="flex flex-wrap items-center gap-2 mt-1.5">
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
                        
                        {notification.actionUrl && (
                          <a
                            href={notification.actionUrl}
                            className="text-xs text-amber-500 hover:text-amber-600 font-medium flex items-center gap-1"
                          >
                            View details
                            <ChevronRight className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Load more */}
        {hasMore && (
          <div ref={endRef} className="py-4 text-center">
            {loading ? (
              <Loader2 className="w-6 h-6 text-amber-500 animate-spin mx-auto" />
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
      </div>
      
      <Footer />
    </div>
  )
}

export default Notifications
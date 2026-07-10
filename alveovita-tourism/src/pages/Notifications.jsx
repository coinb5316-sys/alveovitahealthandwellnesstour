// src/pages/Notifications.jsx
import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { useToast } from '../hooks/useToast'
import axios from '../api/axios'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import NotificationPanel from '../components/NotificationPanel'

const Notifications = () => {
  const { isDark } = useTheme()
  const { user } = useAuth()
  const { socket, isConnected } = useSocket()
  const { showToast } = useToast()
  
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [total, setTotal] = useState(0)
  const [filter, setFilter] = useState('all')
  const [selectedNotification, setSelectedNotification] = useState(null)
  
  const observerRef = useRef(null)
  const endRef = useRef(null)

  // Fetch notifications
  const fetchNotifications = async (reset = true) => {
    try {
      setLoading(true)
      const currentPage = reset ? 1 : page
      
      const response = await axios.get('/notifications', {
        params: {
          page: currentPage,
          limit: 20,
          read: filter === 'unread' ? 'false' : undefined,
          type: filter !== 'all' && filter !== 'unread' ? filter : undefined
        }
      })

      if (response.data.success) {
        const data = response.data
        if (reset) {
          setNotifications(data.notifications)
          setPage(1)
        } else {
          setNotifications(prev => [...prev, ...data.notifications])
        }
        setUnreadCount(data.unreadCount || 0)
        setHasMore(data.pagination?.hasMore || false)
        setTotal(data.total || 0)
      }
    } catch (error) {
      console.error('Error fetching notifications:', error)
      showToast('Failed to load notifications', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Load more
  const loadMore = () => {
    if (!loading && hasMore) {
      setPage(prev => prev + 1)
      fetchNotifications(false)
    }
  }

  // Mark as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.put(`/notifications/${notificationId}/read`)
      setNotifications(prev => prev.map(n => 
        n._id === notificationId ? { ...n, read: true } : n
      ))
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error marking as read:', error)
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      await axios.put('/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
      showToast('All notifications marked as read', 'success')
    } catch (error) {
      console.error('Error marking all as read:', error)
      showToast('Failed to mark all as read', 'error')
    }
  }

  // Delete notification
  const deleteNotification = async (notificationId) => {
    if (!confirm('Delete this notification?')) return
    
    try {
      await axios.delete(`/notifications/${notificationId}`)
      setNotifications(prev => prev.filter(n => n._id !== notificationId))
      setTotal(prev => prev - 1)
      showToast('Notification deleted', 'success')
    } catch (error) {
      console.error('Error deleting notification:', error)
      showToast('Failed to delete notification', 'error')
    }
  }

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (!endRef.current || !hasMore) return
    
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          loadMore()
        }
      },
      { threshold: 0.1 }
    )
    
    observerRef.current.observe(endRef.current)
    
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [hasMore, loading])

  // Socket listeners
  useEffect(() => {
    if (!socket) return

    const handleNewNotification = (data) => {
      if (data.notification) {
        setNotifications(prev => [data.notification, ...prev])
        setTotal(prev => prev + 1)
        if (!data.notification.read) {
          setUnreadCount(prev => prev + 1)
        }
      }
    }

    socket.on('new-notification', handleNewNotification)
    
    return () => {
      socket.off('new-notification', handleNewNotification)
    }
  }, [socket])

  // Initial load
  useEffect(() => {
    fetchNotifications()
  }, [filter])

  // Get time ago
  const getTimeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return new Date(date).toLocaleDateString()
  }

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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Notifications
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {total} notification{total !== 1 ? 's' : ''} · {unreadCount} unread
              {isConnected && (
                <span className="ml-2 text-green-500">● Live</span>
              )}
            </p>
          </div>
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 text-sm bg-blue-500/10 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors"
              >
                Mark all read
              </button>
            )}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className={`px-3 py-2 rounded-lg text-sm border ${
                isDark 
                  ? 'bg-gray-800 text-white border-gray-700' 
                  : 'bg-white text-gray-800 border-gray-200'
              }`}
            >
              <option value="all">All</option>
              <option value="unread">Unread</option>
              <option value="booking">Bookings</option>
              <option value="payment">Payments</option>
              <option value="review">Reviews</option>
              <option value="system">System</option>
            </select>
          </div>
        </div>

        {/* Notifications List */}
        {loading && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
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
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl transition-all ${
                  !notification.read
                    ? isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'
                    : isDark ? 'bg-gray-800/50' : 'bg-white'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-2 rounded-lg ${
                    isDark ? 'bg-gray-700' : 'bg-gray-100'
                  }`}>
                    <Bell className={`w-5 h-5 ${!notification.read ? 'text-amber-500' : 'text-gray-400'}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {notification.title}
                      </h4>
                      <div className="flex items-center gap-2 ml-4">
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
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {notification.message}
                    </p>
                    <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      {getTimeAgo(notification.createdAt)}
                    </span>
                    {notification.actionUrl && (
                      <a
                        href={notification.actionUrl}
                        className="ml-3 text-xs text-amber-500 hover:text-amber-600 font-medium"
                      >
                        View details →
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Load more */}
        {hasMore && (
          <div ref={endRef} className="py-4 text-center">
            {loading ? (
              <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
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
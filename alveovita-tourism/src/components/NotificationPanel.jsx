// src/components/NotificationPanel.jsx
import { motion, AnimatePresence } from 'framer-motion'
import { X, Bell, Calendar, CreditCard, Star, User, CheckCircle, AlertCircle } from 'lucide-react'
import { useTheme } from '../context/ThemeContext'

const NotificationPanel = ({ isOpen, onClose, onNotificationClick }) => {
  const { isDark } = useTheme()

  const notifications = [
    {
      id: 1,
      type: 'booking',
      title: 'New Booking',
      message: 'Sarah Johnson booked Executive Wellness Retreat',
      time: '2 min ago',
      icon: Calendar,
      read: false,
      color: 'text-blue-500'
    },
    {
      id: 2,
      type: 'payment',
      title: 'Payment Received',
      message: '$2,400 payment received from Michael Chen',
      time: '15 min ago',
      icon: CreditCard,
      read: false,
      color: 'text-green-500'
    },
    {
      id: 3,
      type: 'review',
      title: 'New Review',
      message: '5-star review from David Kim',
      time: '1 hour ago',
      icon: Star,
      read: true,
      color: 'text-yellow-500'
    },
    {
      id: 4,
      type: 'user',
      title: 'New User Registered',
      message: 'Emily Davis created an account',
      time: '3 hours ago',
      icon: User,
      read: true,
      color: 'text-purple-500'
    },
    {
      id: 5,
      type: 'alert',
      title: 'System Update',
      message: 'System maintenance scheduled for tonight',
      time: '5 hours ago',
      icon: AlertCircle,
      read: true,
      color: 'text-red-500'
    }
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`fixed right-0 top-0 z-50 h-full w-full max-w-md ${
              isDark ? 'bg-gray-900' : 'bg-white'
            } shadow-2xl`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-4 border-b ${
              isDark ? 'border-gray-800' : 'border-gray-200'
            }`}>
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-amber-500" />
                <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Notifications
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-500 text-white">
                  {notifications.filter(n => !n.read).length}
                </span>
              </div>
              <button
                onClick={onClose}
                className={`p-2 rounded-lg transition-colors ${
                  isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                }`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Notification List */}
            <div className="overflow-y-auto h-[calc(100vh-72px)] p-4">
              <div className="space-y-3">
                {notifications.map((notification) => {
                  const Icon = notification.icon
                  return (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: notification.id * 0.05 }}
                      onClick={() => onNotificationClick?.(notification)}
                      className={`p-4 rounded-xl transition-all cursor-pointer ${
                        !notification.read
                          ? isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'
                          : isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg bg-opacity-10 ${
                          isDark ? 'bg-gray-800' : 'bg-gray-100'
                        }`}>
                          <Icon className={`w-5 h-5 ${notification.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <h4 className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
                              {notification.title}
                            </h4>
                            {!notification.read && (
                              <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0 mt-1.5" />
                            )}
                          </div>
                          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {notification.message}
                          </p>
                          <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                            {notification.time}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {/* Empty State */}
              {notifications.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Bell className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                  <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    No Notifications
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    You're all caught up! Check back later for updates.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

export default NotificationPanel
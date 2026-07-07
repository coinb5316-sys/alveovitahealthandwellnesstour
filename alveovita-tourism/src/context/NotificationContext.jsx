// src/context/NotificationContext.jsx
import React, { createContext, useState, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, X, Info, AlertTriangle } from 'lucide-react'

export const NotificationContext = createContext()

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([])

  const showToast = (message, type = 'info', duration = 4000) => {
    const id = Date.now()
    setNotifications(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, duration)
  }

  const getIcon = (type) => {
    switch(type) {
      case 'success': return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'error': return <AlertCircle className="w-5 h-5 text-red-400" />
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-400" />
      default: return <Info className="w-5 h-5 text-blue-400" />
    }
  }

  const getColor = (type) => {
    switch(type) {
      case 'success': return 'border-green-500/20 bg-green-500/10'
      case 'error': return 'border-red-500/20 bg-red-500/10'
      case 'warning': return 'border-yellow-500/20 bg-yellow-500/10'
      default: return 'border-blue-500/20 bg-blue-500/10'
    }
  }

  return (
    <NotificationContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] space-y-3 max-w-md w-full">
        <AnimatePresence>
          {notifications.map(({ id, message, type }) => (
            <motion.div
              key={id}
              initial={{ opacity: 0, x: 50, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 50, scale: 0.9 }}
              className={`p-4 rounded-xl border backdrop-blur-sm ${getColor(type)} border-gray-200/20`}
              style={{ background: 'rgba(0,0,0,0.8)' }}
            >
              <div className="flex items-start gap-3">
                {getIcon(type)}
                <p className="text-sm text-white flex-1">{message}</p>
                <button
                  onClick={() => setNotifications(prev => prev.filter(n => n.id !== id))}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </NotificationContext.Provider>
  )
}

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider')
  }
  return context
}
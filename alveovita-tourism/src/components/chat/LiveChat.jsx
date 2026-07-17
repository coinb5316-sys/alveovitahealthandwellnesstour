// src/components/chat/LiveChat.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../hooks/useToast'
import { useSocket } from '../../context/SocketContext'
import { 
  X, Send, User, Mail, Phone, MessageSquare,
  Bot, Shield, CheckCircle, AlertCircle,
  Loader2, Clock, ArrowRight, Sparkles, Mic,
  RefreshCw, Wifi, WifiOff
} from 'lucide-react'

const LiveChat = ({ isOpen, onClose, isDark }) => {
  const { user } = useAuth()
  const { showToast } = useToast()
  const { socket, isConnected, joinChat, sendMessage, sendTyping, sessionId: socketSessionId, setSessionId, reconnect } = useSocket()
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    subject: '',
    message: ''
  })
  const [formError, setFormError] = useState(null)
  const [chatSubmitted, setChatSubmitted] = useState(false)
  const [sessionId, setLocalSessionId] = useState(null)
  const [isWaitingForAdmin, setIsWaitingForAdmin] = useState(false)
  const [isAdminTyping, setIsAdminTyping] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const [isSending, setIsSending] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  // Add ref to track if component is mounted
  const isMounted = useRef(true)

  // ============================================
  // Socket event listeners - FIXED with useCallback
  // ============================================
  const handleNewMessage = useCallback((data) => {
    if (!isMounted.current) return
    
    // Remove admin typing indicator if it exists
    setMessages(prev => prev.filter(msg => msg.id !== 'admin-typing'))
    
    const message = {
      id: Date.now() + Math.random() * 1000, // Ensure uniqueness
      sender: data.sender === 'admin' ? 'admin' : data.sender,
      text: data.text,
      time: new Date(data.timestamp).toLocaleTimeString(),
      isAutoReply: data.isAutoReply || false,
      isTypingIndicator: false
    }
    setMessages(prev => [...prev, message])
    
    if (data.sender === 'bot' && data.isAutoReply) {
      setIsWaitingForAdmin(false)
    }
    
    if (data.sender === 'admin') {
      setIsWaitingForAdmin(false)
      setIsAdminTyping(false)
    }
  }, [])

  const handleUserTyping = useCallback((data) => {
    if (!isMounted.current) return
    if (data.sender === 'admin') {
      setIsAdminTyping(data.isTyping)
    }
  }, [])

  const handleAdminTyping = useCallback((data) => {
    if (!isMounted.current) return
    
    if (data.isTyping) {
      setIsAdminTyping(true)
      setIsWaitingForAdmin(true)
      setMessages(prev => {
        const filtered = prev.filter(msg => msg.id !== 'admin-typing')
        return [...filtered, {
          id: 'admin-typing',
          sender: 'bot',
          text: '👤 Admin is typing...',
          time: new Date().toLocaleTimeString(),
          isTypingIndicator: true
        }]
      })
    } else {
      setIsAdminTyping(false)
      setIsWaitingForAdmin(false)
      setMessages(prev => prev.filter(msg => msg.id !== 'admin-typing'))
    }
  }, [])

  const handleSessionResolved = useCallback(() => {
    if (!isMounted.current) return
    showToast('This chat session has been resolved', 'info')
    setIsWaitingForAdmin(false)
  }, [showToast])

  const handleChatError = useCallback((error) => {
    if (!isMounted.current) return
    showToast(error.message || 'Chat error occurred', 'error')
  }, [showToast])

  // ============================================
  // Socket setup - FIXED dependencies
  // ============================================
  useEffect(() => {
    isMounted.current = true
    
    if (!socket) {
      console.log('📡 [LiveChat] No socket available')
      return
    }

    console.log('📡 [LiveChat] Setting up socket listeners')

    // Register all listeners
    socket.on('new-message', handleNewMessage)
    socket.on('user-typing', handleUserTyping)
    socket.on('admin-typing', handleAdminTyping)
    socket.on('session-resolved', handleSessionResolved)
    socket.on('chat-error', handleChatError)

    // Cleanup function - removes all listeners
    return () => {
      console.log('📡 [LiveChat] Cleaning up socket listeners')
      socket.off('new-message', handleNewMessage)
      socket.off('user-typing', handleUserTyping)
      socket.off('admin-typing', handleAdminTyping)
      socket.off('session-resolved', handleSessionResolved)
      socket.off('chat-error', handleChatError)
      isMounted.current = false
    }
  }, [socket, handleNewMessage, handleUserTyping, handleAdminTyping, handleSessionResolved, handleChatError])

  // ============================================
  // Handle form submission - FIXED error handling
  // ============================================
  const handleFormSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setFormError(null)

    if (!formData.name || !formData.email) {
      setFormError('Please fill in your name and email')
      setLoading(false)
      return
    }

    try {
      console.log('📤 [LiveChat] Creating chat session...')
      
      // Create chat session via API with timeout
      const response = await axios.post('/chat-sessions', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || '',
        initialMessage: formData.message || 'Chat started'
      }, {
        timeout: 15000
      })

      console.log('📥 [LiveChat] Session response:', response.data)

      if (response.data.success) {
        const session = response.data.session
        setLocalSessionId(session._id)
        setSessionId(session._id)
        
        // Join chat via socket (only if connected)
        if (joinChat && isConnected) {
          joinChat({
            sessionId: session._id,
            userId: user?.id || null,
            userName: formData.name,
            userEmail: formData.email
          })
        } else if (!isConnected) {
          console.warn('⚠️ [LiveChat] Socket not connected - chat will work via API fallback')
          showToast('Chat started (offline mode - messages via email)', 'info')
        }

        // Create contact record in background (don't await)
        axios.post('/contact', {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || '',
          subject: formData.subject || 'Live Chat Inquiry',
          message: formData.message || 'Chat started from live chat widget'
        }, {
          timeout: 5000
        }).catch(contactError => {
          console.warn('⚠️ [LiveChat] Contact record failed:', contactError.message)
        })

        const userMessageText = formData.message || 'Hello, I need assistance with your wellness services.'
        
        // Get messages from server response
        const serverMessages = session.messages || []
        const botMessages = serverMessages
          .filter(m => m.sender === 'bot' || m.sender === 'admin')
          .map((m, index) => ({
            id: 100 + index,
            sender: m.sender === 'admin' ? 'admin' : 'bot',
            text: m.text,
            time: new Date(m.timestamp || Date.now()).toLocaleTimeString(),
            isAutoReply: m.isAutoReply || false
          }))

        const userMessage = {
          id: messages.length + 1,
          sender: 'user',
          text: userMessageText,
          time: new Date().toLocaleTimeString()
        }

        // Default welcome messages if no server messages
        const defaultMessages = [
          {
            id: 1,
            sender: 'bot',
            text: '👋 Hello! Welcome to Alveovita Wellness. I\'m your wellness assistant. How can I help you today?',
            time: new Date().toLocaleTimeString()
          },
          {
            id: 2,
            sender: 'bot',
            text: 'Feel free to ask me any questions about our services. Our team is here to help!',
            time: new Date().toLocaleTimeString()
          }
        ]
        
        // Combine messages
        const finalMessages = botMessages.length > 0 
          ? [...botMessages, userMessage]
          : [...defaultMessages, userMessage]
        
        setMessages(finalMessages)
        setStep(2)
        setChatSubmitted(true)
        showToast('Chat started successfully!', 'success')
        
        // Send initial message via socket (only if connected)
        if (isConnected && sendMessage) {
          sendMessage({
            sessionId: session._id,
            text: userMessageText,
            sender: 'user'
          })
        } else {
          // Fallback: Send via API
          await axios.post(`/chat-sessions/${session._id}/messages`, {
            text: userMessageText,
            sender: 'user'
          }, {
            timeout: 5000
          })
        }
      }
    } catch (error) {
      console.error('❌ [LiveChat] Error:', error)
      
      // Handle specific error types
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        setFormError('⏰ Connection timeout. Please check your internet and try again.')
        showToast('Connection timeout - please retry', 'error')
      } else if (error.response?.status === 404) {
        setFormError('🔌 Chat service unavailable. Please use the contact form.')
        showToast('Chat service unavailable', 'error')
      } else if (error.response?.status === 500) {
        setFormError('⚠️ Server error. Please try again or use the contact form.')
        showToast('Server error - please retry', 'error')
      } else if (error.response?.data?.message) {
        setFormError(error.response.data.message)
        showToast(error.response.data.message, 'error')
      } else {
        setFormError('Failed to start chat. Please try again.')
        showToast('Failed to start chat', 'error')
      }
    } finally {
      setLoading(false)
    }
  }

  // ============================================
  // Send message in chat - FIXED to work offline
  // ============================================
  const sendMessageHandler = async () => {
    if (!message.trim() || !sessionId || isSending) return

    setIsSending(true)
    const messageText = message.trim()
    
    const userMessage = {
      id: Date.now() + Math.random() * 1000,
      sender: 'user',
      text: messageText,
      time: new Date().toLocaleTimeString()
    }
    setMessages(prev => [...prev, userMessage])
    setMessage('')

    try {
      // Try socket first if connected
      if (isConnected && sendMessage) {
        console.log('📤 [LiveChat] Sending via socket')
        sendMessage({
          sessionId: sessionId,
          text: messageText,
          sender: 'user'
        })
        showToast('Message sent', 'success')
      } else {
        // Fallback: Send via API
        console.log('📤 [LiveChat] Sending via API fallback')
        await axios.post(`/chat-sessions/${sessionId}/messages`, {
          text: messageText,
          sender: 'user'
        }, {
          timeout: 10000
        })
        showToast('Message sent (offline mode)', 'info')
      }
    } catch (error) {
      console.error('❌ [LiveChat] Send message error:', error)
      showToast('Failed to send message. Please try again.', 'error')
      
      // Remove the failed message
      setMessages(prev => prev.filter(msg => msg.id !== userMessage.id))
    } finally {
      setIsSending(false)
    }
  }

  // ============================================
  // Handle typing indicator - FIXED
  // ============================================
  const handleTyping = useCallback((isTyping) => {
    if (sessionId && isConnected && sendTyping) {
      sendTyping({
        sessionId,
        isTyping,
        sender: 'user'
      })
    }
  }, [sessionId, isConnected, sendTyping])

  // ============================================
  // Handle enter key - FIXED
  // ============================================
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !isSending && message.trim()) {
      e.preventDefault()
      sendMessageHandler()
    }
  }

  // ============================================
  // Scroll to bottom
  // ============================================
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ============================================
  // Focus input when chat opens
  // ============================================
  useEffect(() => {
    if (step === 2 && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 300)
    }
  }, [step])

  // ============================================
  // Reset when modal closes - FIXED cleanup
  // ============================================
  useEffect(() => {
    if (!isOpen) {
      // Reset all state after a delay
      const timer = setTimeout(() => {
        setStep(1)
        setMessages([])
        setMessage('')
        setChatSubmitted(false)
        setLocalSessionId(null)
        setIsWaitingForAdmin(false)
        setIsAdminTyping(false)
        setIsSending(false)
        setFormData({
          name: user?.name || '',
          email: user?.email || '',
          phone: '',
          subject: '',
          message: ''
        })
        setFormError(null)
      }, 300)
      
      return () => clearTimeout(timer)
    }
  }, [isOpen, user])

  // ============================================
  // Handle reconnect - FIXED
  // ============================================
  const handleReconnect = () => {
    if (reconnect) {
      reconnect()
      showToast('Reconnecting...', 'info')
    }
  }

  // ============================================
  // RENDER - FIXED send button conditions
  // ============================================
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className={`max-w-lg w-full rounded-2xl shadow-2xl overflow-hidden ${
          isDark ? 'bg-gray-900 border border-gray-800' : 'bg-white'
        }`}
      >
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-r from-amber-500 to-orange-500">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-7 h-7 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-xl">Live Chat</h3>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full animate-pulse ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></span>
                <p className="text-white/80 text-sm">
                  {isConnected ? 'Online' : 'Disconnected'}
                </p>
                {!isConnected && (
                  <button
                    onClick={handleReconnect}
                    className="ml-2 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                    title="Reconnect"
                  >
                    <RefreshCw className="w-3 h-3 text-white animate-spin-slow" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {step === 1 ? (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Start a Conversation
                  </h4>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Fill in your details and we'll connect you with our team
                  </p>
                </div>
              </div>

              {formError && (
                <div className={`p-4 rounded-xl flex items-start gap-2 mb-4 ${
                  isDark ? 'bg-red-900/30' : 'bg-red-50'
                } border border-red-500/30`}>
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className={isDark ? 'text-red-400' : 'text-red-600'}>{formError}</span>
                    {formError.includes('timeout') && (
                      <button
                        onClick={() => {
                          setRetryCount(prev => prev + 1)
                          setFormError(null)
                          handleFormSubmit(new Event('submit'))
                        }}
                        className="mt-2 text-sm text-amber-500 hover:text-amber-600 font-medium flex items-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Retry
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Connection status warning */}
              {!isConnected && (
                <div className={`p-3 rounded-xl flex items-center gap-2 mb-4 ${
                  isDark ? 'bg-yellow-900/30' : 'bg-yellow-50'
                } border border-yellow-500/30`}>
                  <WifiOff className="w-4 h-4 text-yellow-500 flex-shrink-0" />
                  <span className={`text-sm ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                    Connection lost. Messages will be sent via email.
                  </span>
                </div>
              )}

              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl outline-none ${
                        isDark 
                          ? 'bg-gray-800 text-white border-gray-700' 
                          : 'bg-gray-50 text-gray-800 border-gray-200'
                      } border focus:border-amber-500 transition-colors`}
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl outline-none ${
                        isDark 
                          ? 'bg-gray-800 text-white border-gray-700' 
                          : 'bg-gray-50 text-gray-800 border-gray-200'
                      } border focus:border-amber-500 transition-colors`}
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl outline-none ${
                        isDark 
                          ? 'bg-gray-800 text-white border-gray-700' 
                          : 'bg-gray-50 text-gray-800 border-gray-200'
                      } border focus:border-amber-500 transition-colors`}
                      placeholder="+233 55 123 4567"
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Your Message
                  </label>
                  <div className="relative">
                    <MessageSquare className={`absolute left-3 top-4 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                    <textarea
                      rows={3}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl outline-none ${
                        isDark 
                          ? 'bg-gray-800 text-white border-gray-700' 
                          : 'bg-gray-50 text-gray-800 border-gray-200'
                      } border focus:border-amber-500 transition-colors resize-none`}
                      placeholder="Tell us how we can help you..."
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:scale-105 transition-all shadow-lg shadow-amber-500/30 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-5 h-5" />
                      Start Chat
                    </>
                  )}
                </button>

                <div className={`flex items-center justify-center gap-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  <Shield className="w-3 h-3" />
                  Your information is secure and private
                </div>
              </form>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-2 text-xs">
                  <span className={`w-2 h-2 rounded-full animate-pulse ${isConnected ? 'bg-green-400' : 'bg-yellow-400'}`}></span>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                    {isConnected ? 'Online' : 'Offline'}
                  </span>
                </div>
                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>•</span>
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {user?.name || formData.name || 'Guest'}
                </span>
                {sessionId && (
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    • #{sessionId.slice(-6)}
                  </span>
                )}
                {isAdminTyping && (
                  <span className="text-xs text-amber-500 flex items-center gap-1 animate-pulse">
                    <Mic className="w-3 h-3" />
                    Admin typing...
                  </span>
                )}
              </div>

              <div className={`rounded-xl p-4 h-64 overflow-y-auto space-y-3 ${
                isDark ? 'bg-gray-800' : 'bg-gray-50'
              }`}>
                {messages.map((msg) => {
                  // Check if this is the admin typing indicator
                  if (msg.id === 'admin-typing') {
                    return (
                      <div key={msg.id} className="flex justify-start">
                        <div className={`p-3 rounded-2xl rounded-tl-none ${
                          isDark ? 'bg-gray-700' : 'bg-white'
                        } shadow-sm`}>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-amber-500">
                              {msg.text}
                            </span>
                            <div className="flex items-center gap-1">
                              <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                              <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                              <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  // Regular message rendering
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[85%] p-3 rounded-2xl ${
                          msg.sender === 'user'
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-tr-none'
                            : msg.sender === 'admin'
                              ? isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-700'
                              : isDark
                                ? 'bg-gray-700 text-gray-300 rounded-tl-none'
                                : 'bg-white text-gray-700 rounded-tl-none shadow-sm'
                        }`}
                      >
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                        <span className={`text-[10px] mt-1 block ${
                          msg.sender === 'user' ? 'text-white/70' : 'text-gray-400'
                        }`}>
                          {msg.time}
                          {msg.isAutoReply && ' 🤖'}
                        </span>
                      </div>
                    </div>
                  );
                })}

                {/* Sending indicator */}
                {isSending && (
                  <div className="flex justify-end">
                    <div className={`p-3 rounded-2xl rounded-tr-none ${
                      isDark ? 'bg-gray-700' : 'bg-gray-200'
                    }`}>
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-amber-500" />
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Sending...
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* ============================================ */}
              {/* SEND BUTTON - FIXED: Only disable if no message or isSending */}
              {/* ============================================ */}
              <div className="flex items-center gap-2 mt-4">
                <input
                  ref={inputRef}
                  type="text"
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value);
                    handleTyping(true);
                    clearTimeout(typingTimeoutRef.current);
                    typingTimeoutRef.current = setTimeout(() => handleTyping(false), 1500);
                  }}
                  onKeyPress={handleKeyPress}
                  placeholder={isWaitingForAdmin ? "Waiting for admin response..." : "Type your message..."}
                  className={`flex-1 px-4 py-3 rounded-xl outline-none text-sm ${
                    isWaitingForAdmin || isSending
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                      : isDark 
                        ? 'bg-gray-800 text-white placeholder-gray-400 border border-gray-700' 
                        : 'bg-gray-50 text-gray-800 placeholder-gray-500 border border-gray-200'
                  } focus:border-amber-500 transition-colors`}
                  disabled={isWaitingForAdmin || isSending}
                />
                <button
                  onClick={sendMessageHandler}
                  // FIXED: Only disable if no message or isSending
                  // Allow sending even if disconnected (will use API fallback)
                  disabled={!message.trim() || isSending}
                  className="p-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[44px]"
                >
                  {isSending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </button>
              </div>

              <div className={`mt-3 text-center text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <Sparkles className="w-3 h-3 inline mr-1" />
                Powered by Alveovita Wellness AI Assistant
                {!isConnected && (
                  <button
                    onClick={handleReconnect}
                    className="ml-2 text-amber-500 hover:text-amber-600 font-medium flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    Reconnect
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  )
}

export default LiveChat
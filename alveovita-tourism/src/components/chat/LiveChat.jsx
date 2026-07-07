// src/components/chat/LiveChat.jsx
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import axios from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../hooks/useToast'
import { useSocket } from '../../context/SocketContext'
import { 
  X, Send, User, Mail, Phone, MessageSquare,
  Bot, Shield, CheckCircle, AlertCircle,
  Loader2, Clock, ArrowRight, Sparkles, Mic
} from 'lucide-react'

const LiveChat = ({ isOpen, onClose, isDark }) => {
  const { user } = useAuth()
  const { showToast } = useToast()
  const { socket, isConnected, joinChat, sendMessage, sendTyping, sessionId: socketSessionId, setSessionId } = useSocket()
  
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
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
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)
  const typingTimeoutRef = useRef(null)

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data) => {
      // Remove admin typing indicator if it exists
      setMessages(prev => prev.filter(msg => msg.id !== 'admin-typing'));
      
      const message = {
        id: Date.now(),
        sender: data.sender,
        text: data.text,
        time: new Date(data.timestamp).toLocaleTimeString(),
        isAutoReply: data.isAutoReply || false
      };
      setMessages(prev => [...prev, message]);
      
      if (data.sender === 'bot' && data.isAutoReply) {
        setIsWaitingForAdmin(false);
      }
      
      if (data.sender === 'admin') {
        setIsWaitingForAdmin(false);
        setIsAdminTyping(false);
      }
    };

    const handleUserTyping = (data) => {
      if (data.sender === 'admin') {
        setIsAdminTyping(data.isTyping);
      }
    };

    const handleAdminTyping = (data) => {
      if (data.isTyping) {
        setIsAdminTyping(true);
        setIsWaitingForAdmin(true);
        // Show "Admin is typing..." message
        setMessages(prev => {
          // Remove any existing admin typing message
          const filtered = prev.filter(msg => msg.id !== 'admin-typing');
          return [...filtered, {
            id: 'admin-typing',
            sender: 'bot',
            text: '👤 Admin is typing...',
            time: new Date().toLocaleTimeString(),
            isTypingIndicator: true
          }];
        });
      } else {
        setIsAdminTyping(false);
        setIsWaitingForAdmin(false);
        // Remove the typing indicator
        setMessages(prev => prev.filter(msg => msg.id !== 'admin-typing'));
      }
    };

    const handleSessionResolved = () => {
      showToast('This chat session has been resolved', 'info');
    };

    const handleChatError = (error) => {
      showToast(error.message || 'Chat error occurred', 'error');
    };

    socket.on('new-message', handleNewMessage);
    socket.on('user-typing', handleUserTyping);
    socket.on('admin-typing', handleAdminTyping);
    socket.on('session-resolved', handleSessionResolved);
    socket.on('chat-error', handleChatError);

    return () => {
      socket.off('new-message', handleNewMessage);
      socket.off('user-typing', handleUserTyping);
      socket.off('admin-typing', handleAdminTyping);
      socket.off('session-resolved', handleSessionResolved);
      socket.off('chat-error', handleChatError);
    };
  }, [socket, showToast]);

  // Handle form submission
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
      // Create chat session via API
      const response = await axios.post('/chat-sessions', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || '',
        initialMessage: formData.message || 'Chat started'
      })

      if (response.data.success) {
        const session = response.data.session;
        setLocalSessionId(session._id);
        setSessionId(session._id);
        
        // Join chat via socket
        joinChat({
          sessionId: session._id,
          userId: user?.id || null,
          userName: formData.name,
          userEmail: formData.email
        });

        // Also create contact record
        await axios.post('/contact', {
          name: formData.name,
          email: formData.email,
          phone: formData.phone || '',
          subject: formData.subject || 'Live Chat Inquiry',
          message: formData.message || 'Chat started from live chat widget'
        })

        const userMessage = {
          id: messages.length + 1,
          sender: 'user',
          text: formData.message || 'Hello, I need assistance with your wellness services.',
          time: new Date().toLocaleTimeString()
        }
        
        setMessages(prev => [...prev, ...initialMessages, userMessage])
        setStep(2)
        setChatSubmitted(true)
        showToast('Chat started successfully!', 'success')
        
        // Send initial message via socket
        sendMessage({
          sessionId: session._id,
          text: userMessage.text,
          sender: 'user'
        });
      }
    } catch (error) {
      setFormError(error.response?.data?.message || 'Failed to start chat. Please try again.')
      showToast('Failed to start chat', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Send message in chat
  const sendMessageHandler = () => {
    if (!message.trim() || !sessionId) return

    const userMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: message.trim(),
      time: new Date().toLocaleTimeString()
    }
    setMessages(prev => [...prev, userMessage])
    const sentMessage = message.trim()
    setMessage('')

    // Send via socket
    sendMessage({
      sessionId: sessionId,
      text: sentMessage,
      sender: 'user'
    });
  }

  // Handle typing indicator
  const handleTyping = (isTyping) => {
    if (sessionId) {
      sendTyping({
        sessionId,
        isTyping,
        sender: 'user'
      });
    }
  }

  // Handle enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessageHandler()
    }
  }

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (step === 2 && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 300)
    }
  }, [step])

  // Reset when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setStep(1)
        setMessages([])
        setMessage('')
        setChatSubmitted(false)
        setLocalSessionId(null)
        setIsWaitingForAdmin(false)
        setIsAdminTyping(false)
        setFormData({
          name: user?.name || '',
          email: user?.email || '',
          phone: '',
          subject: '',
          message: ''
        })
      }, 300)
    }
  }, [isOpen, user])

  // Initial greeting message
  const initialMessages = [
    {
      id: 1,
      sender: 'bot',
      text: '👋 Hello! Welcome to Alveovita Wellness. I\'m your wellness assistant. How can I help you today?',
      time: new Date().toLocaleTimeString()
    },
    {
      id: 2,
      sender: 'bot',
      text: 'Feel free to ask me any questions about our services. If I can\'t answer, our team will be notified.',
      time: new Date().toLocaleTimeString()
    }
  ]

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
            <div>
              <h3 className="text-white font-bold text-xl">Live Chat</h3>
              <p className="text-white/80 text-sm flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full animate-pulse ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></span>
                {isConnected ? 'Online' : 'Connecting...'}
              </p>
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
                <div className={`p-4 rounded-xl flex items-center gap-2 mb-4 ${
                  isDark ? 'bg-red-900/30' : 'bg-red-50'
                } border border-red-500/30`}>
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span className={isDark ? 'text-red-400' : 'text-red-600'}>{formError}</span>
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
                  disabled={loading || !isConnected}
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
                <div className="flex items-center gap-2 text-xs text-green-400">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Online
                </div>
                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>•</span>
                <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {user?.name || formData.name || 'Guest'}
                </span>
                {sessionId && (
                  <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    • Ticket #{sessionId.slice(-6)}
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

                {/* Remove the old isTyping indicator since we now use admin-typing */}

                <div ref={messagesEndRef} />
              </div>

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
                    isWaitingForAdmin 
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                      : isDark 
                        ? 'bg-gray-800 text-white placeholder-gray-400 border border-gray-700' 
                        : 'bg-gray-50 text-gray-800 placeholder-gray-500 border border-gray-200'
                  } focus:border-amber-500 transition-colors`}
                  disabled={isWaitingForAdmin}
                />
                <button
                  onClick={sendMessageHandler}
                  disabled={!message.trim() || isWaitingForAdmin || !isConnected}
                  className="p-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>

              <div className={`mt-3 text-center text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                <Sparkles className="w-3 h-3 inline mr-1" />
                Powered by Alveovita Wellness AI Assistant
                {!isConnected && (
                  <span className="ml-2 text-amber-500">(Reconnecting...)</span>
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
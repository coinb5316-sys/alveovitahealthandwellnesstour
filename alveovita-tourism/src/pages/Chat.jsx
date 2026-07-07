// src/pages/Chat.jsx
import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import { 
  MessageCircle, Send, User, Bot, Phone, Mail,
  Clock, CheckCircle, AlertCircle, ArrowRight,
  Mic, Paperclip, Smile, X, ChevronDown,
  ChevronUp, Minimize2, Maximize2, Loader2,
  Users, Calendar, Star, Award, Shield,
  Heart, Sparkles, Gift, Crown, Gem,
  Headphones, MessageSquare, Video, Camera,
  Image, Upload, PhoneCall, VideoIcon
} from 'lucide-react'

const Chat = () => {
  const { isDark } = useTheme()
  const { user } = useAuth()
  const { showToast } = useToast()
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([])
  const [isTyping, setIsTyping] = useState(false)
  const [isConnected, setIsConnected] = useState(true)
  const [chatHistory, setChatHistory] = useState([])
  const [isMinimized, setIsMinimized] = useState(false)
  const [agentOnline, setAgentOnline] = useState(true)
  const [waitTime, setWaitTime] = useState('2-3 minutes')
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Quick replies
  const quickReplies = [
    'Book a wellness retreat',
    'Medical tourism inquiry',
    'Corporate wellness programs',
    'Pricing & packages',
    'Available dates',
    'Group bookings',
    'Cancellation policy',
    'Payment methods'
  ]

  // Auto-replies for common queries
  const autoReplies = {
    'book a wellness retreat': 'Great choice! Our wellness retreats include health screening, spa treatments, and personalized wellness coaching. Would you like to see our available packages?',
    'medical tourism inquiry': 'We offer comprehensive medical tourism services including executive health screening, rehabilitation, and nutritional counseling. Can you tell me more about what you\'re looking for?',
    'corporate wellness programs': 'Our corporate wellness programs include team building retreats, stress management workshops, and health education programs. How many employees are you looking to book for?',
    'pricing': 'Our pricing varies depending on the program and duration. A 5-day executive wellness retreat starts at $2,499 per person. Would you like a detailed quote?',
    'available dates': 'We have availability starting from January 15, 2025. Would you like to check specific dates for your preferred program?',
    'group bookings': 'Yes, we offer special rates for groups of 10 or more. Please provide your group size and preferred dates for a customized quote.',
    'cancellation policy': 'You can cancel your booking up to 7 days before the tour start date for a full refund. Cancellations within 7 days may incur a fee.',
    'payment methods': 'We accept all major credit cards (Visa, Mastercard, American Express), bank transfers, mobile money (MoMo), and Paystack for secure online payments.'
  }

  // Initial greeting message
  const initialMessages = [
    {
      id: 1,
      sender: 'bot',
      text: '👋 Hello! Welcome to Alveovita Wellness. I\'m your wellness assistant. How can I help you today?',
      time: new Date().toLocaleTimeString(),
      type: 'text'
    },
    {
      id: 2,
      sender: 'bot',
      text: 'You can ask me about:',
      time: new Date().toLocaleTimeString(),
      type: 'text'
    }
  ]

  // Load chat history from localStorage
  useEffect(() => {
    const savedHistory = localStorage.getItem('alveovita_chat_history')
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory)
        setChatHistory(parsed)
        if (parsed.length > 0) {
          setMessages(parsed)
        } else {
          setMessages(initialMessages)
        }
      } catch (e) {
        console.error('Error loading chat history:', e)
        setMessages(initialMessages)
      }
    } else {
      setMessages(initialMessages)
    }
  }, [])

  // Save chat history
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('alveovita_chat_history', JSON.stringify(messages))
    }
  }, [messages])

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // Focus input
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Get bot response
  const getBotResponse = (input) => {
    const lowerInput = input.toLowerCase()
    for (const [key, value] of Object.entries(autoReplies)) {
      if (lowerInput.includes(key)) {
        return value
      }
    }
    return "Thank you for your message! Our wellness team will review your request and get back to you shortly. In the meantime, would you like to explore our available wellness packages on our website?"
  }

  // Send message
  const sendMessage = () => {
    if (!message.trim()) return

    const userMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: message.trim(),
      time: new Date().toLocaleTimeString(),
      type: 'text'
    }
    setMessages(prev => [...prev, userMessage])
    setMessage('')

    // Simulate bot response
    setIsTyping(true)
    setTimeout(() => {
      const botResponse = getBotResponse(message.trim())
      const botMessage = {
        id: messages.length + 2,
        sender: 'bot',
        text: botResponse,
        time: new Date().toLocaleTimeString(),
        type: 'text'
      }
      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)
    }, 1000 + Math.random() * 1000)
  }

  // Handle enter key
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // Handle quick reply
  const handleQuickReply = (reply) => {
    const userMessage = {
      id: messages.length + 1,
      sender: 'user',
      text: reply,
      time: new Date().toLocaleTimeString(),
      type: 'text'
    }
    setMessages(prev => [...prev, userMessage])

    setIsTyping(true)
    setTimeout(() => {
      const botResponse = getBotResponse(reply)
      const botMessage = {
        id: messages.length + 2,
        sender: 'bot',
        text: botResponse,
        time: new Date().toLocaleTimeString(),
        type: 'text'
      }
      setMessages(prev => [...prev, botMessage])
      setIsTyping(false)
    }, 1000 + Math.random() * 1000)
  }

  // Clear chat history
  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear chat history?')) {
      setMessages(initialMessages)
      localStorage.removeItem('alveovita_chat_history')
      showToast('Chat history cleared', 'success')
    }
  }

  // Handle file upload (simulated)
  const handleFileUpload = () => {
    showToast('File upload feature coming soon!', 'info')
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1920&q=80)'
        }}>
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
        </div>
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <span className="text-amber-400 font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Live Chat
            </span>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-white mt-4 leading-tight">
              Let's <span className="text-amber-400">Chat</span>
            </h1>
            <p className="text-xl text-gray-300 mt-4 leading-relaxed">
              Connect with our wellness team instantly. We're here to help you 24/7.
            </p>
            <div className="flex flex-wrap gap-4 mt-6 text-gray-300 text-sm">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                {agentOnline ? 'Online' : 'Offline'}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                Avg wait time: {waitTime}
              </span>
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-amber-400" />
                5 agents available
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Chat Interface */}
      <section className={`py-12 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className={`rounded-3xl overflow-hidden shadow-2xl border ${
              isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
            }`}>
              {/* Chat Header */}
              <div className={`p-4 border-b flex items-center justify-between ${
                isDark ? 'border-gray-700' : 'border-gray-200'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center`}>
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-800"></span>
                  </div>
                  <div>
                    <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      Wellness Assistant
                    </h3>
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        Online • {agentOnline ? 'Available' : 'Away'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={clearHistory}
                    className={`p-2 rounded-lg transition-all hover:scale-105 ${
                      isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setIsMinimized(!isMinimized)}
                    className={`p-2 rounded-lg transition-all hover:scale-105 ${
                      isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                    }`}
                  >
                    {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {!isMinimized && (
                <>
                  {/* Messages */}
                  <div className={`h-96 overflow-y-auto p-4 space-y-3 ${
                    isDark ? 'bg-gray-900' : 'bg-gray-50'
                  }`}>
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[80%] ${
                          msg.sender === 'user'
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl rounded-tr-none'
                            : isDark
                              ? 'bg-gray-800 text-gray-300 rounded-2xl rounded-tl-none'
                              : 'bg-white text-gray-700 rounded-2xl rounded-tl-none shadow-sm'
                        } p-3`}>
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                          <span className={`text-[10px] mt-1 block ${
                            msg.sender === 'user' ? 'text-white/70' : 'text-gray-400'
                          }`}>
                            {msg.time}
                          </span>
                        </div>
                      </div>
                    ))}

                    {isTyping && (
                      <div className="flex justify-start">
                        <div className={`p-3 rounded-2xl rounded-tl-none ${
                          isDark ? 'bg-gray-800' : 'bg-white'
                        } shadow-sm`}>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <div className="w-2 h-2 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Quick Replies */}
                  <div className={`p-3 border-t ${
                    isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                  }`}>
                    <div className="flex flex-wrap gap-1.5">
                      {quickReplies.slice(0, 6).map((reply, index) => (
                        <button
                          key={index}
                          onClick={() => handleQuickReply(reply)}
                          className={`px-2.5 py-1 rounded-full text-xs transition-all hover:scale-105 whitespace-nowrap ${
                            isDark 
                              ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {reply}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Input */}
                  <div className={`p-3 border-t flex items-center gap-2 ${
                    isDark ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'
                  }`}>
                    <button
                      onClick={handleFileUpload}
                      className={`p-2 rounded-full transition-all hover:scale-105 ${
                        isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                      }`}
                    >
                      <Paperclip className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleFileUpload}
                      className={`p-2 rounded-full transition-all hover:scale-105 ${
                        isDark ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
                      }`}
                    >
                      <Smile className="w-4 h-4" />
                    </button>
                    <input
                      ref={inputRef}
                      type="text"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      className={`flex-1 px-3 py-2 rounded-full outline-none text-sm ${
                        isDark 
                          ? 'bg-gray-700 text-white placeholder-gray-400' 
                          : 'bg-gray-100 text-gray-800 placeholder-gray-500'
                      }`}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!message.trim()}
                      className="p-2 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Chat Info */}
            <div className={`mt-6 p-4 rounded-2xl ${
              isDark ? 'bg-gray-800' : 'bg-white'
            } shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-2">
                    <Clock className="w-5 h-5 text-blue-500" />
                  </div>
                  <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    24/7 Support
                  </h4>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Available around the clock
                  </p>
                </div>
                <div>
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-2">
                    <MessageSquare className="w-5 h-5 text-green-500" />
                  </div>
                  <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Quick Response
                  </h4>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Average wait time: 2-3 min
                  </p>
                </div>
                <div>
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-2">
                    <Headphones className="w-5 h-5 text-amber-500" />
                  </div>
                  <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Expert Team
                  </h4>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Wellness professionals ready to help
                  </p>
                </div>
              </div>
            </div>

            {/* Alternative Contact Options */}
            <div className={`mt-6 p-6 rounded-2xl ${
              isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'
            }`}>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <h4 className={`text-sm font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      Need immediate assistance?
                    </h4>
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Call us directly for urgent inquiries
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3">
                  <a href="tel:+233551234567" className={`px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105 ${
                    isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                    <Phone className="w-4 h-4 inline mr-2" />
                    +233 55 123 4567
                  </a>
                  <Link to="/contact">
                    <button className="px-4 py-2 rounded-xl text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 transition-all hover:scale-105">
                      <Mail className="w-4 h-4 inline mr-2" />
                      Email Us
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1920&q=80)'
        }}>
          <div className="absolute inset-0 bg-gradient-to-r from-amber-900/95 to-orange-800/95" />
        </div>
        <div className="container-custom relative z-10 text-center text-white">
          <h2 className="text-3xl font-display font-bold mb-4">
            Ready to Start Your <span className="text-amber-300">Wellness Journey</span>?
          </h2>
          <p className="text-lg text-gray-200 mb-6 max-w-2xl mx-auto">
            Our team is ready to help you plan the perfect wellness experience.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact">
              <button className="px-6 py-3 bg-white text-amber-700 rounded-xl font-medium hover:bg-amber-50 transition-all shadow-xl hover:scale-105 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Contact Us
              </button>
            </Link>
            <Link to="/tours">
              <button className="px-6 py-3 border-2 border-white/30 text-white rounded-xl font-medium hover:bg-white/10 transition-all backdrop-blur-sm hover:scale-105 flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Browse Tours
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Chat
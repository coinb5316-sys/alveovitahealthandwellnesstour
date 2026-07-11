// src/components/common/Navbar.jsx
import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Menu, X, ChevronDown, User, LogOut, Settings,
  Calendar, Heart, Sun, Moon, Search, Stethoscope,
  Flower2, Briefcase, Coffee, Leaf, Bell, MessageSquare,
  HelpCircle, Shield, Award, Globe, MapPin, Phone,
  Mail, Sparkles, Crown, Gem, Rocket, Target, BookOpen,
  Gift, Users, Dumbbell, Utensils, TreePine, Waves,
  Home, Info, Package, PhoneCall, LayoutDashboard,
  FileText, CreditCard, Star, Share2, Zap, BadgeCheck,
  TrendingUp, Compass, Camera, Music, Palette, Wand2,
  Layers, Grid, Infinity, Anchor, Sailboat, Bike, Footprints,
  History, Bookmark, Clock, CheckCircle, AlertCircle,
  UserPlus, LogIn, ShieldCheck, Fingerprint, Key,
  Lock, Unlock, Eye, EyeOff, Smartphone, Laptop,
  Headphones, Video, Mic, Image as ImageIcon,
  Plus, Minus, Circle, AlertTriangle, Info as InfoIcon,
  Loader2, Check, Trash2, CheckCheck, Filter,
  Hotel, MapPin as MapPinIcon, Package as PackageIcon
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { useSocket } from '../../context/SocketContext'
import { useToast } from '../../hooks/useToast'
import axios from '../../api/axios'
import NotificationPanel from '../NotificationPanel'
import logo from '../../assets/images/sun1.png?url'

const Navbar = () => {
  // ============================================
  // STATE
  // ============================================
  const [isOpen, setIsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isServicesOpen, setIsServicesOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [avatarError, setAvatarError] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false)
  const [quickNotifications, setQuickNotifications] = useState([])
  const [loadingQuick, setLoadingQuick] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)

  // ============================================
  // CONTEXT HOOKS
  // ============================================
  const { isDark, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const { socket, isConnected } = useSocket()
  const { showToast } = useToast()

  // ============================================
  // REFS
  // ============================================
  const searchRef = useRef(null)
  const dropdownRef = useRef(null)
  const notificationRef = useRef(null)
  const servicesRef = useRef(null)
  const mobileMenuRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  // ============================================
  // FETCH UNREAD COUNT
  // ============================================
  const fetchUnreadCount = useCallback(async () => {
    if (!user) return
    
    try {
      setLoadingNotifications(true)
      const response = await axios.get('/api/notifications/stats')
      if (response.data.success) {
        setUnreadCount(response.data.stats.userUnread || 0)
      }
    } catch (error) {
      console.error('❌ Error fetching unread count:', error)
    } finally {
      setLoadingNotifications(false)
    }
  }, [user])

  // ============================================
  // FETCH QUICK NOTIFICATIONS (for dropdown preview)
  // ============================================
  const fetchQuickNotifications = useCallback(async () => {
    if (!user) return
    
    try {
      setLoadingQuick(true)
      const response = await axios.get('/api/notifications', {
        params: { page: 1, limit: 5, filter: 'unread' }
      })
      if (response.data.success) {
        setQuickNotifications(response.data.notifications || [])
      }
    } catch (error) {
      console.error('❌ Error fetching quick notifications:', error)
    } finally {
      setLoadingQuick(false)
    }
  }, [user])

  // ============================================
  // MARK NOTIFICATION AS READ (from quick preview)
  // ============================================
  const handleQuickMarkAsRead = useCallback(async (notificationId) => {
    try {
      const response = await axios.put(`/api/notifications/${notificationId}/read`)
      if (response.data.success) {
        setQuickNotifications(prev => 
          prev.map(n => 
            n._id === notificationId 
              ? { ...n, read: true }
              : n
          )
        )
        setUnreadCount(response.data.unreadCount)
      }
    } catch (error) {
      console.error('❌ Failed to mark as read:', error)
    }
  }, [])

  // ============================================
  // DELETE NOTIFICATION (from quick preview)
  // ============================================
  const handleQuickDelete = useCallback(async (notificationId) => {
    try {
      const response = await axios.delete(`/api/notifications/${notificationId}`)
      if (response.data.success) {
        setQuickNotifications(prev => prev.filter(n => n._id !== notificationId))
        setUnreadCount(response.data.unreadCount)
      }
    } catch (error) {
      console.error('❌ Failed to delete notification:', error)
    }
  }, [])

  // ============================================
  // SOCKET EVENT LISTENERS
  // ============================================
  useEffect(() => {
    if (!socket || !isConnected) return

    const handleNewNotification = (data) => {
      if (data.notification) {
        // Add to quick notifications
        setQuickNotifications(prev => [data.notification, ...prev].slice(0, 5))
        // Update unread count
        if (data.unreadCount !== undefined) {
          setUnreadCount(data.unreadCount)
        } else {
          setUnreadCount(prev => prev + 1)
        }
        // Show toast
        showToast('🔔 ' + data.notification.title, 'info')
      }
    }

    const handleNotificationRead = (data) => {
      if (data.notificationId) {
        setQuickNotifications(prev => 
          prev.map(n => 
            n._id === data.notificationId 
              ? { ...n, read: true }
              : n
          )
        )
      }
      if (data.unreadCount !== undefined) {
        setUnreadCount(data.unreadCount)
      } else {
        fetchUnreadCount()
      }
    }

    const handleAllNotificationsRead = () => {
      setQuickNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    }

    const handleNotificationDeleted = (data) => {
      if (data.notificationId) {
        setQuickNotifications(prev => prev.filter(n => n._id !== data.notificationId))
      }
      fetchUnreadCount()
    }

    const handleAllNotificationsDeleted = () => {
      setQuickNotifications([])
      setUnreadCount(0)
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
  }, [socket, isConnected, showToast, fetchUnreadCount])

  // ============================================
  // FETCH DATA ON USER CHANGE
  // ============================================
  useEffect(() => {
    if (user) {
      fetchUnreadCount()
      fetchQuickNotifications()
    } else {
      setUnreadCount(0)
      setQuickNotifications([])
    }
  }, [user, fetchUnreadCount, fetchQuickNotifications])

  // ============================================
  // SCROLL DETECTION
  // ============================================
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // ============================================
  // RESET AVATAR ERROR ON USER CHANGE
  // ============================================
  useEffect(() => {
    setAvatarError(false)
  }, [user?.avatar])

  // ============================================
  // CLOSE MOBILE MENU ON ROUTE CHANGE
  // ============================================
  useEffect(() => {
    setIsOpen(false)
  }, [location])

  // ============================================
  // CLICK OUTSIDE HANDLERS
  // ============================================
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target) && !e.target.closest('.mobile-toggle')) {
        setIsOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setSearchOpen(false)
      }
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false)
      }
      if (notificationRef.current && !notificationRef.current.contains(e.target)) {
        setNotificationOpen(false)
      }
      if (servicesRef.current && !servicesRef.current.contains(e.target)) {
        setIsServicesOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ============================================
  // PREVENT BODY SCROLL
  // ============================================
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // ============================================
  // SEARCH HANDLERS
  // ============================================
  useEffect(() => {
    if (searchQuery.length > 1) {
      const results = searchableItems.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.location && item.location.toLowerCase().includes(searchQuery.toLowerCase()))
      )
      setSearchResults(results.slice(0, 6))
      setIsSearching(true)
    } else {
      setSearchResults([])
      setIsSearching(false)
    }
  }, [searchQuery])

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.length > 0) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
      setSearchOpen(false)
      setSearchQuery('')
      setIsMobileSearchOpen(false)
      setIsOpen(false)
    }
  }

  // ============================================
  // USER AVATAR HELPERS
  // ============================================
  const getUserInitials = () => {
    if (!user?.name) return 'U'
    const names = user.name.split(' ')
    if (names.length === 1) return names[0].charAt(0).toUpperCase()
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
  }

  const getUserAvatar = () => {
    if (!user?.avatar || avatarError) return null
    return user.avatar
  }

  // ============================================
  // USER AVATAR COMPONENT
  // ============================================
  const UserAvatar = ({ size = 'md', className = '' }) => {
    const avatarUrl = getUserAvatar()
    const initials = getUserInitials()
    
    const sizeClasses = {
      sm: 'w-8 h-8 text-xs',
      md: 'w-10 h-10 text-sm',
      lg: 'w-12 h-12 text-base'
    }

    return (
      <div className={`relative flex-shrink-0 ${className}`}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={user?.name || 'User'}
            className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-amber-400/30 ring-offset-2 ring-offset-[#0a0a0a] shadow-lg shadow-amber-500/20 transition-all duration-300 hover:ring-amber-400/60 hover:shadow-amber-500/40`}
            onError={() => setAvatarError(true)}
          />
        ) : (
          <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold shadow-lg shadow-amber-500/30 ring-2 ring-amber-400/30 ring-offset-2 ring-offset-[#0a0a0a] transition-all duration-300 hover:ring-amber-400/60 hover:shadow-amber-500/40`}>
            {initials}
          </div>
        )}
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#0a0a0a] shadow-lg shadow-green-500/20"></div>
      </div>
    )
  }

  // ============================================
  // DATA
  // ============================================
  const services = [
    { 
      name: 'Wellness Retreats', 
      icon: Flower2, 
      href: '/services/wellness', 
      desc: 'Rejuvenate your soul',
      color: 'from-emerald-500 to-teal-500',
      badge: 'Popular'
    },
    { 
      name: 'Medical Tourism', 
      icon: Stethoscope, 
      href: '/services/medical', 
      desc: 'World-class healthcare',
      color: 'from-blue-500 to-cyan-500',
      badge: 'Trusted'
    },
    { 
      name: 'Corporate Wellness', 
      icon: Briefcase, 
      href: '/services/corporate', 
      desc: 'Employee well-being',
      color: 'from-purple-500 to-indigo-500',
      badge: 'Enterprise'
    },
    { 
      name: 'Special Programs', 
      icon: Gift, 
      href: '/services/special', 
      desc: 'Unique experiences',
      color: 'from-amber-500 to-orange-500',
      badge: 'Exclusive'
    },
  ]

  const publicLinks = [
    { name: 'Home', icon: Home, href: '/' },
    { name: 'About', icon: Info, href: '/about' },
    { name: 'Destinations', icon: Globe, href: '/destinations' },
    { name: 'Tours', icon: Compass, href: '/tours' },
    { name: 'Contact', icon: PhoneCall, href: '/contact' },
  ]

  const userMenuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', color: 'text-blue-400' },
    { name: 'My Bookings', icon: Calendar, href: '/bookings', color: 'text-green-400' },
    { name: 'Favorites', icon: Heart, href: '/favorites', color: 'text-red-400' },
    { name: 'Profile', icon: User, href: '/profile', color: 'text-amber-400' },
    { name: 'Settings', icon: Settings, href: '/settings', color: 'text-gray-400' },
  ]

  const searchableItems = [
    ...services.map(s => ({ ...s, type: 'service', category: 'Services' })),
    ...publicLinks.map(l => ({ ...l, type: 'page', category: 'Pages' })),
    { name: 'Kempinski Hotel', type: 'hotel', category: 'Hotels', location: 'Accra' },
    { name: 'Movenpick Hotel', type: 'hotel', category: 'Hotels', location: 'Accra' },
    { name: 'Royal Senchi Resort', type: 'hotel', category: 'Hotels', location: 'Akosombo' },
    { name: 'Mole National Park Safari', type: 'tour', category: 'Tours', location: 'Mole' },
    { name: 'Cape Coast Castle Tour', type: 'tour', category: 'Tours', location: 'Cape Coast' },
    { name: 'Kumasi Heritage Walk', type: 'tour', category: 'Tours', location: 'Kumasi' },
  ]

  const isActive = (path) => location.pathname === path

  // ============================================
  // LOGO COMPONENT
  // ============================================
  const Logo = () => (
    <div className="flex items-center gap-3 group">
      <div className="relative">
        <img 
          src={logo} 
          alt="Alveovita" 
          className="h-10 sm:h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-110"
          onError={(e) => {
            e.target.style.display = 'none'
            e.target.parentElement.innerHTML = `
              <div class="relative w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center text-white font-bold text-xl sm:text-2xl shadow-lg shadow-amber-500/30 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
                <span class="font-display">A</span>
                <div class="absolute -top-1 -right-1 w-3 h-3 sm:w-4 sm:h-4 bg-amber-400 rounded-full animate-pulse"></div>
                <div class="absolute -bottom-1 -left-1 w-2 h-2 sm:w-3 sm:h-3 bg-orange-400 rounded-full animate-pulse animation-delay-500"></div>
              </div>
            `
          }}
        />
        <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-900 animate-pulse"></div>
      </div>
      <div className="flex flex-col sm:block">
        <span className="font-bold text-lg sm:text-xl text-white leading-tight">
          Alveovita
        </span>
        <span className="hidden sm:inline-block text-[10px] uppercase tracking-widest ml-1 px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-300 font-medium border border-amber-500/20">
          Premium
        </span>
        <span className="sm:hidden text-[8px] uppercase tracking-wider text-amber-300/60">
          Premium
        </span>
      </div>
    </div>
  )

  // ============================================
  // GET ICON FOR NOTIFICATION TYPE
  // ============================================
  const getNotificationIcon = (type, iconName) => {
    const icons = {
      booking: Calendar,
      payment: CreditCard,
      review: Star,
      message: MessageSquare,
      system: Bell,
      tour: PackageIcon,
      hotel: Hotel,
      destination: MapPinIcon,
      experience: Heart,
      reminder: Clock,
      promotion: Gift,
      alert: AlertCircle,
    }
    const Icon = icons[type] || Bell
    return <Icon className="w-4 h-4" />
  }

  // ============================================
  // GET TIME AGO
  // ============================================
  const getTimeAgo = (date) => {
    if (!date) return 'Just now'
    const now = new Date()
    const diff = now - new Date(date)
    const seconds = Math.floor(diff / 1000)
    const minutes = Math.floor(seconds / 60)
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    if (seconds < 60) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return `${Math.floor(days / 7)}w ago`
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-amber-500/20 shadow-2xl shadow-amber-500/10' 
        : 'bg-gradient-to-r from-[#0a0a0a] via-[#1a0a00] to-[#0a0a0a] border-b border-amber-500/10 shadow-2xl shadow-amber-500/5'
    }`}>
      {/* Top glowing gradient bar */}
      <div className="h-0.5 w-full bg-gradient-to-r from-amber-400/50 via-orange-400 to-amber-400/50 animate-pulse" />

      <div className="container-custom px-3 sm:px-4 md:px-6">
        <div className="flex justify-between items-center h-14 sm:h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group relative flex-shrink-0">
            <Logo />
            <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-amber-400/0 via-amber-400/5 to-orange-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
          </Link>

          {/* ============================================ */}
          {/* DESKTOP MENU */}
          {/* ============================================ */}
          <div className="hidden lg:flex items-center gap-1">
            {/* Public Links */}
            {publicLinks.map((link) => (
              <Link
                key={link.name}
                to={link.href}
                className={`relative px-3 xl:px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 group ${
                  isActive(link.href)
                    ? 'text-amber-400 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                    : 'text-gray-300 hover:text-amber-400 hover:bg-amber-500/10 hover:shadow-lg hover:shadow-amber-500/5'
                }`}
              >
                <link.icon className="w-4 h-4" />
                <span className="text-sm">{link.name}</span>
                {isActive(link.href) && (
                  <motion.div 
                    layoutId="navbar-active"
                    className="absolute -bottom-0.5 left-4 right-4 h-0.5 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full shadow-lg shadow-amber-400/50"
                  />
                )}
              </Link>
            ))}
            
            {/* Services Dropdown */}
            <div className="relative" ref={servicesRef}>
              <button 
                onClick={() => setIsServicesOpen(!isServicesOpen)}
                className={`relative px-3 xl:px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2 group ${
                  isServicesOpen
                    ? 'text-amber-400 bg-amber-500/10 shadow-lg shadow-amber-500/10'
                    : 'text-gray-300 hover:text-amber-400 hover:bg-amber-500/10 hover:shadow-lg hover:shadow-amber-500/5'
                }`}
              >
                <Package className="w-4 h-4" />
                <span className="text-sm">Services</span>
                <motion.div
                  animate={{ rotate: isServicesOpen ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronDown className="ml-1 w-4 h-4" />
                </motion.div>
              </button>
              
              <AnimatePresence>
                {isServicesOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="absolute top-full left-0 mt-2 w-72 xl:w-80 rounded-2xl shadow-2xl border border-amber-500/20 overflow-hidden bg-gradient-to-b from-[#1a0a00] to-[#0a0a0a]"
                  >
                    <div className="p-2">
                      <div className="px-3 py-2 text-xs font-semibold text-amber-400/60 uppercase tracking-wider">
                        Our Services
                      </div>
                      {services.map((service, index) => (
                        <Link
                          key={index}
                          to={service.href}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:bg-amber-500/10 text-gray-300 hover:text-white"
                          onClick={() => setIsServicesOpen(false)}
                        >
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${service.color} flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
                            <service.icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm">{service.name}</div>
                            <div className="text-xs text-gray-500 truncate">{service.desc}</div>
                          </div>
                          {service.badge && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/20 flex-shrink-0">
                              {service.badge}
                            </span>
                          )}
                        </Link>
                      ))}
                      <Link 
                        to="/services" 
                        className="block text-center py-3 rounded-xl text-sm font-medium transition-all duration-300 text-amber-400 hover:bg-amber-500/10"
                        onClick={() => setIsServicesOpen(false)}
                      >
                        View All Services →
                      </Link>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right side */}
            <div className="flex items-center gap-1 ml-4">
              {/* Search */}
              <div ref={searchRef} className="relative">
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className={`p-2.5 rounded-xl transition-all duration-300 hover:scale-110 ${
                    searchOpen
                      ? 'bg-amber-500/20 text-amber-400 shadow-lg shadow-amber-500/20'
                      : 'text-gray-400 hover:text-amber-400 hover:bg-amber-500/10'
                  }`}
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
                
                <AnimatePresence>
                  {searchOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-80 xl:w-96 rounded-2xl shadow-2xl border border-amber-500/20 overflow-hidden bg-gradient-to-b from-[#1a0a00] to-[#0a0a0a]"
                    >
                      <form onSubmit={handleSearch} className="p-3">
                        <div className={`flex items-center gap-2 rounded-xl px-4 transition-all bg-gray-800/50 ${isSearching ? 'ring-2 ring-amber-400' : ''}`}>
                          <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          <input
                            type="text"
                            placeholder="Search tours, services..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full py-3 bg-transparent outline-none text-white placeholder-gray-400 text-sm"
                            autoFocus
                          />
                          {searchQuery && (
                            <button
                              type="button"
                              onClick={() => setSearchQuery('')}
                              className="p-1 rounded-full hover:bg-gray-700 transition-colors text-gray-400 hover:text-white flex-shrink-0"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </form>

                      {isSearching && searchResults.length > 0 && (
                        <div className="p-2 pt-0 border-t border-amber-500/10">
                          <div className="px-3 py-2 text-xs font-semibold text-amber-400/60 uppercase tracking-wider">
                            Results
                          </div>
                          {searchResults.map((result, idx) => (
                            <Link
                              key={idx}
                              to={result.href || '#'}
                              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:scale-105 hover:bg-amber-500/10 text-gray-300 hover:text-white"
                              onClick={() => {
                                setSearchOpen(false)
                                setSearchQuery('')
                              }}
                            >
                              {result.icon && <result.icon className="w-5 h-5 text-amber-400 flex-shrink-0" />}
                              <div className="min-w-0 flex-1">
                                <div className="font-medium text-sm truncate">{result.name}</div>
                                <div className="text-xs text-gray-500 truncate">
                                  {result.category}
                                  {result.location && ` • ${result.location}`}
                                </div>
                              </div>
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 flex-shrink-0">
                                {result.type}
                              </span>
                            </Link>
                          ))}
                          <button
                            onClick={handleSearch}
                            className="w-full text-center py-3 rounded-xl text-sm font-medium transition-all text-amber-400 hover:bg-amber-500/10"
                          >
                            See all results for "{searchQuery}"
                          </button>
                        </div>
                      )}

                      {isSearching && searchResults.length === 0 && (
                        <div className="p-6 text-center">
                          <Search className="w-12 h-12 mx-auto text-gray-600 mb-2" />
                          <p className="text-sm text-gray-400">
                            No results found for "{searchQuery}"
                          </p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ============================================ */}
              {/* NOTIFICATIONS - ENHANCED WITH QUICK PREVIEW */}
              {/* ============================================ */}
              {user && (
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => {
                      setNotificationOpen(!notificationOpen)
                      if (!notificationOpen) {
                        fetchQuickNotifications()
                      }
                    }}
                    className="relative p-2.5 rounded-xl transition-all duration-300 hover:scale-110 text-gray-400 hover:text-amber-400 hover:bg-amber-500/10"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {loadingNotifications ? (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-gray-500/50 rounded-full flex items-center justify-center">
                        <Loader2 className="w-3 h-3 text-white animate-spin" />
                      </span>
                    ) : unreadCount > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 min-w-[20px] h-5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold shadow-lg shadow-amber-500/30 px-1"
                      >
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </motion.span>
                    )}
                  </button>

                  {/* Notification Quick Preview Dropdown */}
                  <AnimatePresence>
                    {notificationOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-[380px] rounded-2xl shadow-2xl border border-amber-500/20 overflow-hidden bg-gradient-to-b from-[#1a0a00] to-[#0a0a0a]"
                      >
                        {/* Header */}
                        <div className="p-4 border-b border-amber-500/10 bg-gradient-to-r from-amber-500/5 to-orange-500/5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Bell className="w-4 h-4 text-amber-400" />
                              <h3 className="font-bold text-white text-sm">Notifications</h3>
                              {unreadCount > 0 && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400">
                                  {unreadCount} new
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              {unreadCount > 0 && (
                                <button
                                  onClick={async () => {
                                    try {
                                      await axios.put('/api/notifications/read/all')
                                      setQuickNotifications(prev => prev.map(n => ({ ...n, read: true })))
                                      setUnreadCount(0)
                                      showToast('All notifications marked as read', 'success')
                                    } catch (error) {
                                      console.error('❌ Failed to mark all as read:', error)
                                    }
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-amber-500/10 text-gray-400 hover:text-amber-400 transition-colors"
                                  title="Mark all as read"
                                >
                                  <CheckCheck className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => {
                                  setNotificationOpen(false)
                                  setNotificationPanelOpen(true)
                                }}
                                className="text-xs text-amber-400 hover:text-amber-300 transition-colors px-2 py-1 rounded-lg hover:bg-amber-500/10"
                              >
                                View all
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Notification List */}
                        <div className="max-h-[400px] overflow-y-auto p-2 space-y-1">
                          {loadingQuick ? (
                            <div className="flex items-center justify-center py-8">
                              <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
                            </div>
                          ) : quickNotifications.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-8">
                              <div className="p-3 rounded-full bg-amber-500/10 mb-3">
                                <Bell className="w-8 h-8 text-amber-400/40" />
                              </div>
                              <p className="text-sm text-gray-400 font-medium">No new notifications</p>
                              <p className="text-xs text-gray-500">You're all caught up! 🎉</p>
                            </div>
                          ) : (
                            quickNotifications.map((notification) => (
                              <motion.div
                                key={notification._id}
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`group relative rounded-xl p-3 transition-all duration-300 ${
                                  !notification.read
                                    ? 'bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10'
                                    : 'hover:bg-gray-800/30'
                                }`}
                              >
                                {/* Unread indicator */}
                                {!notification.read && (
                                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-amber-400 to-orange-400 rounded-r-full" />
                                )}

                                <div className="flex items-start gap-3 ml-2">
                                  {/* Icon */}
                                  <div className={`p-2 rounded-xl flex-shrink-0 ${notification.bgColor || 'bg-gray-800/50'}`}>
                                    {getNotificationIcon(notification.type, notification.icon)}
                                  </div>

                                  {/* Content */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <div>
                                        <p className={`text-sm font-medium ${
                                          !notification.read ? 'text-white' : 'text-gray-300'
                                        }`}>
                                          {notification.title}
                                        </p>
                                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">
                                          {notification.message}
                                        </p>
                                      </div>
                                      <span className="text-[10px] text-gray-500 flex-shrink-0">
                                        {getTimeAgo(notification.createdAt)}
                                      </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2 mt-1.5">
                                      {notification.actionUrl && (
                                        <a
                                          href={notification.actionUrl}
                                          className="text-[10px] text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-0.5"
                                          onClick={() => setNotificationOpen(false)}
                                        >
                                          View
                                          <ChevronDown className="w-3 h-3 -rotate-90" />
                                        </a>
                                      )}
                                      {notification.priority === 'urgent' && (
                                        <span className="text-[8px] px-1.5 py-0.5 rounded bg-red-500/30 text-red-400 border border-red-500/30 animate-pulse">
                                          Urgent
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Action buttons */}
                                  <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {!notification.read && (
                                      <button
                                        onClick={() => handleQuickMarkAsRead(notification._id)}
                                        className="p-1 rounded-lg hover:bg-amber-500/10 text-gray-400 hover:text-amber-400 transition-colors"
                                        title="Mark as read"
                                      >
                                        <Check className="w-3 h-3" />
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleQuickDelete(notification._id)}
                                      className="p-1 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                                      title="Delete"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            ))
                          )}
                        </div>

                        {/* Footer */}
                        <div className="p-3 border-t border-amber-500/10 bg-gray-900/50">
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-gray-500">
                              {unreadCount > 0 ? `${unreadCount} unread` : 'All read'}
                            </p>
                            <button
                              onClick={() => {
                                setNotificationOpen(false)
                                setNotificationPanelOpen(true)
                              }}
                              className="text-xs text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
                            >
                              Open full panel
                              <ChevronDown className="w-3 h-3 -rotate-90" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2.5 rounded-xl transition-all duration-300 hover:scale-110 text-gray-400 hover:text-amber-400 hover:bg-amber-500/10"
                aria-label="Toggle theme"
              >
                <motion.div
                  animate={{ rotate: isDark ? 180 : 0 }}
                  transition={{ duration: 0.5, type: 'spring' }}
                >
                  {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </motion.div>
              </button>

              {/* User Section */}
              {user ? (
                <div className="flex items-center gap-2" ref={dropdownRef}>
                  <Link 
                    to="/favorites" 
                    className="p-2.5 rounded-xl transition-all duration-300 hover:scale-110 text-gray-400 hover:text-amber-400 hover:bg-amber-500/10" 
                    aria-label="Favorites"
                  >
                    <Heart className="w-5 h-5" />
                  </Link>
                  
                  <div className="relative">
                    <button
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 hover:scale-105 ${
                        isDropdownOpen
                          ? 'bg-amber-500/20 text-amber-400 shadow-lg shadow-amber-500/20'
                          : 'text-gray-300 hover:text-amber-400 hover:bg-amber-500/10'
                      }`}
                      aria-label="User menu"
                    >
                      <UserAvatar size="md" />
                      <span className="hidden xl:inline font-medium text-white text-sm">
                        {user.name?.split(' ')[0] || 'User'}
                      </span>
                      <motion.div
                        animate={{ rotate: isDropdownOpen ? 180 : 0 }}
                        transition={{ duration: 0.3 }}
                        className="hidden xl:block"
                      >
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {isDropdownOpen && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-2 w-64 rounded-2xl shadow-2xl border border-amber-500/20 overflow-hidden bg-gradient-to-b from-[#1a0a00] to-[#0a0a0a]"
                        >
                          <div className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b border-amber-500/10">
                            <div className="flex items-center gap-3">
                              <UserAvatar size="lg" />
                              <div className="min-w-0">
                                <div className="font-bold text-white truncate">{user.name || 'User'}</div>
                                <div className="text-sm text-gray-400 truncate">{user.email || 'user@email.com'}</div>
                                <div className="flex items-center gap-1 text-xs text-green-400">
                                  <BadgeCheck className="w-3 h-3 flex-shrink-0" />
                                  <span>Verified Member</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="p-2">
                            {userMenuItems.map((item) => (
                              <Link
                                key={item.name}
                                to={item.href}
                                className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:bg-amber-500/10 text-gray-300 hover:text-white"
                                onClick={() => setIsDropdownOpen(false)}
                              >
                                <item.icon className={`w-4 h-4 ${item.color} flex-shrink-0`} />
                                <span className="font-medium text-sm">{item.name}</span>
                              </Link>
                            ))}
                            <hr className="my-1 border-amber-500/10" />
                            <button
                              onClick={() => {
                                logout()
                                setIsDropdownOpen(false)
                                navigate('/')
                              }}
                              className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105 w-full text-red-400 hover:bg-red-500/10 hover:text-red-300"
                            >
                              <LogOut className="w-4 h-4 flex-shrink-0" />
                              <span className="font-medium text-sm">Logout</span>
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link 
                    to="/login" 
                    className="px-3 xl:px-4 py-2.5 rounded-xl font-medium transition-all duration-300 hover:scale-105 flex items-center gap-2 text-gray-300 hover:text-amber-400 hover:bg-amber-500/10 text-sm"
                  >
                    <LogIn className="w-4 h-4" />
                    <span className="hidden sm:inline">Login</span>
                  </Link>
                  <Link 
                    to="/register" 
                    className="px-4 xl:px-6 py-2.5 rounded-xl font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all duration-300 hover:scale-105 flex items-center gap-2 text-sm"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span className="hidden sm:inline">Get Started</span>
                    <span className="sm:hidden">Sign Up</span>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* ============================================ */}
          {/* MOBILE CONTROLS */}
          {/* ============================================ */}
          <div className="flex items-center gap-1 sm:gap-2 lg:hidden">
            <button
              onClick={() => setIsMobileSearchOpen(!isMobileSearchOpen)}
              className="p-2 rounded-xl transition-all duration-300 text-gray-400 hover:text-amber-400 hover:bg-amber-500/10"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl transition-all duration-300 text-gray-400 hover:text-amber-400 hover:bg-amber-500/10"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            
            {user && (
              <Link to="/favorites" className="p-2 rounded-xl transition-all duration-300 text-gray-400 hover:text-amber-400 hover:bg-amber-500/10" aria-label="Favorites">
                <Heart className="w-5 h-5" />
              </Link>
            )}

            {user && (
              <button
                onClick={() => {
                  setNotificationPanelOpen(true)
                  fetchQuickNotifications()
                }}
                className="relative p-2 rounded-xl transition-all duration-300 text-gray-400 hover:text-amber-400 hover:bg-amber-500/10"
                aria-label="Notifications"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[8px] rounded-full flex items-center justify-center font-bold shadow-lg shadow-amber-500/30 px-1">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>
            )}

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl transition-all duration-300 text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 mobile-toggle"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* ============================================ */}
        {/* MOBILE SEARCH BAR */}
        {/* ============================================ */}
        <AnimatePresence>
          {isMobileSearchOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden pb-3"
            >
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tours, services, destinations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-12 py-3 rounded-xl outline-none bg-gray-800/50 text-white placeholder-gray-400 border border-amber-500/10 focus:border-amber-400 text-sm"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-700 transition-colors text-gray-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </form>
              {isSearching && searchResults.length > 0 && (
                <div className="mt-2 rounded-xl border border-amber-500/10 bg-gray-800/30 overflow-hidden">
                  {searchResults.slice(0, 3).map((result, idx) => (
                    <Link
                      key={idx}
                      to={result.href || '#'}
                      className="flex items-center gap-3 px-3 py-2 transition-all hover:bg-amber-500/10 text-gray-300 hover:text-white"
                      onClick={() => {
                        setIsMobileSearchOpen(false)
                        setSearchQuery('')
                      }}
                    >
                      {result.icon && <result.icon className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                      <div className="min-w-0 flex-1">
                        <div className="font-medium text-sm truncate">{result.name}</div>
                        <div className="text-xs text-gray-500 truncate">{result.category}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ============================================ */}
        {/* MOBILE MENU */}
        {/* ============================================ */}
        <AnimatePresence>
          {isOpen && (
            <motion.div 
              ref={mobileMenuRef}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'calc(100vh - 56px)' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="lg:hidden overflow-hidden border-t border-amber-500/10 fixed left-0 right-0 bg-gradient-to-b from-[#0a0a0a] to-[#1a0a00]"
              style={{ top: '56px' }}
            >
              <div className="h-full overflow-y-auto pb-20">
                <div className="py-3 space-y-1">
                  {user ? (
                    <div className="px-4 py-3 mb-2 bg-gradient-to-r from-amber-500/5 to-orange-500/5 rounded-xl mx-2 border border-amber-500/10">
                      <div className="flex items-center gap-3">
                        <UserAvatar size="md" />
                        <div className="min-w-0">
                          <div className="font-bold text-sm text-white truncate">{user.name}</div>
                          <div className="text-xs text-gray-400 truncate">{user.email}</div>
                          <div className="flex items-center gap-1 text-[10px] text-green-400">
                            <BadgeCheck className="w-3 h-3" />
                            <span>Verified</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 px-4 pb-3">
                      <Link 
                        to="/login" 
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all duration-300 text-gray-300 hover:text-amber-400 hover:bg-amber-500/10"
                        onClick={() => setIsOpen(false)}
                      >
                        <LogIn className="w-4 h-4" />
                        Login
                      </Link>
                      <Link 
                        to="/register" 
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium transition-all duration-300 hover:scale-105"
                        onClick={() => setIsOpen(false)}
                      >
                        <UserPlus className="w-4 h-4" />
                        Get Started
                      </Link>
                    </div>
                  )}

                  <div className="px-2">
                    {publicLinks.map((link) => (
                      <Link
                        key={link.name}
                        to={link.href}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                          isActive(link.href)
                            ? 'bg-amber-500/10 text-amber-400'
                            : 'text-gray-300 hover:text-amber-400 hover:bg-amber-500/10'
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        <link.icon className={`w-4 h-4 ${isActive(link.href) ? 'text-amber-400' : ''}`} />
                        <span className="text-sm">{link.name}</span>
                        {isActive(link.href) && (
                          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        )}
                      </Link>
                    ))}
                  </div>

                  <div className="mt-2">
                    <div className="px-4 py-2 text-xs font-semibold text-amber-400/60 uppercase tracking-wider flex items-center gap-2">
                      <Package className="w-4 h-4" />
                      Services
                    </div>
                    <div className="px-2">
                      {services.map((service, index) => (
                        <Link
                          key={index}
                          to={service.href}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-gray-300 hover:text-amber-400 hover:bg-amber-500/10"
                          onClick={() => setIsOpen(false)}
                        >
                          <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${service.color} flex items-center justify-center text-white flex-shrink-0`}>
                            <service.icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm">{service.name}</div>
                            <div className="text-xs text-gray-500 truncate">{service.desc}</div>
                          </div>
                          {service.badge && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-semibold border border-amber-500/20 flex-shrink-0">
                              {service.badge}
                            </span>
                          )}
                        </Link>
                      ))}
                      <Link 
                        to="/services" 
                        className="block text-center py-3 rounded-xl text-sm font-medium transition-all duration-300 text-amber-400 hover:bg-amber-500/10 mx-2"
                        onClick={() => setIsOpen(false)}
                      >
                        View All Services →
                      </Link>
                    </div>
                  </div>

                  <hr className="my-2 border-amber-500/10 mx-4" />

                  {user && (
                    <div className="px-2">
                      {userMenuItems.map((item) => (
                        <Link
                          key={item.name}
                          to={item.href}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 text-gray-300 hover:text-amber-400 hover:bg-amber-500/10"
                          onClick={() => setIsOpen(false)}
                        >
                          <item.icon className={`w-4 h-4 ${item.color}`} />
                          <span className="text-sm">{item.name}</span>
                        </Link>
                      ))}
                      <button
                        onClick={() => {
                          logout()
                          setIsOpen(false)
                          navigate('/')
                        }}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 w-full text-red-400 hover:bg-red-500/10 hover:text-red-300"
                      >
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm">Logout</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ============================================ */}
      {/* NOTIFICATION PANEL - Full panel */}
      {/* ============================================ */}
      <NotificationPanel 
        isOpen={notificationPanelOpen} 
        onClose={() => setNotificationPanelOpen(false)} 
      />
    </nav>
  )
}

export default Navbar
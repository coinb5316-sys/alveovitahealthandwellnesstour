// src/components/common/Navbar.jsx
import { useState, useEffect, useRef } from 'react'
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
  Plus, Minus, Circle, AlertTriangle, Info as InfoIcon
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import logo from '../../assets/images/sun1.png?url'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [notifications, setNotifications] = useState(3)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isServicesOpen, setIsServicesOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [activeNotification, setActiveNotification] = useState(null)
  const [avatarError, setAvatarError] = useState(false)
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const { isDark, toggleTheme } = useTheme()
  const { user, logout } = useAuth()
  const searchRef = useRef(null)
  const dropdownRef = useRef(null)
  const notificationRef = useRef(null)
  const servicesRef = useRef(null)
  const mobileMenuRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()

  // Reset avatar error when user changes
  useEffect(() => {
    setAvatarError(false)
  }, [user?.avatar])

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false)
  }, [location])

  // Handle click outside for mobile menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(e.target) && !e.target.closest('.mobile-toggle')) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Handle click outside for other dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
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

  // Prevent body scroll when mobile menu is open
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

  const handleNotificationClick = (id) => {
    setActiveNotification(id)
    setNotifications(prev => Math.max(0, prev - 1))
  }

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user?.name) return 'U'
    const names = user.name.split(' ')
    if (names.length === 1) return names[0].charAt(0).toUpperCase()
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
  }

  // Get user avatar URL with fallback handling
  const getUserAvatar = () => {
    if (!user?.avatar || avatarError) return null
    return user.avatar
  }

  // Professional avatar component
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
        {/* Online status dot */}
        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-[#0a0a0a] shadow-lg shadow-green-500/20"></div>
      </div>
    )
  }

  // Services Data
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

  // Public links
  const publicLinks = [
    { name: 'Home', icon: Home, href: '/' },
    { name: 'About', icon: Info, href: '/about' },
    { name: 'Destinations', icon: Globe, href: '/destinations' },
    { name: 'Tours', icon: Compass, href: '/tours' },
    { name: 'Contact', icon: PhoneCall, href: '/contact' },
  ]

  // Authenticated user menu items
  const userMenuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/dashboard', color: 'text-blue-400' },
    { name: 'My Bookings', icon: Calendar, href: '/bookings', color: 'text-green-400' },
    { name: 'Favorites', icon: Heart, href: '/favorites', color: 'text-red-400' },
    { name: 'Profile', icon: User, href: '/profile', color: 'text-amber-400' },
    { name: 'Settings', icon: Settings, href: '/settings', color: 'text-gray-400' },
  ]

  const notificationItems = [
    {
      id: 1,
      type: 'booking',
      title: 'Booking Confirmed',
      message: 'Your wellness retreat at Kempinski Hotel has been confirmed.',
      time: '2 minutes ago',
      icon: Calendar,
      color: 'text-green-400',
      bg: 'bg-green-500/10',
      read: false
    },
    {
      id: 2,
      type: 'promotion',
      title: 'Special Offer',
      message: 'Get 20% off on all medical tourism packages this month!',
      time: '1 hour ago',
      icon: Gift,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
      read: false
    },
    {
      id: 3,
      type: 'review',
      title: 'New Review',
      message: 'Sarah J. left a 5-star review for your recent tour.',
      time: '3 hours ago',
      icon: Star,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      read: true
    },
  ]

  // Search data
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

  return (
    <nav className="fixed top-0 w-full z-50 bg-gradient-to-r from-[#0a0a0a] via-[#1a0a00] to-[#0a0a0a] border-b border-amber-500/10 shadow-2xl shadow-amber-500/5">
      {/* Top glowing gradient bar */}
      <div className="h-0.5 w-full bg-gradient-to-r from-amber-400/50 via-orange-400 to-amber-400/50 animate-pulse" />

      <div className="container-custom px-3 sm:px-4 md:px-6">
        <div className="flex justify-between items-center h-14 sm:h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group relative flex-shrink-0">
            <Logo />
            <div className="absolute -inset-2 rounded-2xl bg-gradient-to-r from-amber-400/0 via-amber-400/5 to-orange-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />
          </Link>

          {/* Desktop Menu - Hidden on mobile */}
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

              {/* Notifications - ONLY show when authenticated */}
              {user && (
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setNotificationOpen(!notificationOpen)}
                    className="relative p-2.5 rounded-xl transition-all duration-300 hover:scale-110 text-gray-400 hover:text-amber-400 hover:bg-amber-500/10"
                    aria-label="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {notifications > 0 && (
                      <motion.span 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold shadow-lg shadow-amber-500/30"
                      >
                        {notifications}
                      </motion.span>
                    )}
                  </button>

                  <AnimatePresence>
                    {notificationOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-80 rounded-2xl shadow-2xl border border-amber-500/20 overflow-hidden bg-gradient-to-b from-[#1a0a00] to-[#0a0a0a]"
                      >
                        <div className="p-4 border-b border-amber-500/10">
                          <div className="flex items-center justify-between">
                            <h3 className="font-bold text-white text-sm">Notifications</h3>
                            <button className="text-xs text-amber-400 hover:text-amber-300 transition-colors">
                              Mark all read
                            </button>
                          </div>
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {notificationItems.map((item) => (
                            <div
                              key={item.id}
                              onClick={() => handleNotificationClick(item.id)}
                              className={`flex items-start gap-3 px-4 py-3 transition-all cursor-pointer ${
                                !item.read ? 'bg-amber-500/5 border-l-2 border-amber-400' : ''
                              } hover:bg-amber-500/10`}
                            >
                              <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0`}>
                                <item.icon className={`w-5 h-5 ${item.color}`} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-medium text-sm text-white truncate">{item.title}</span>
                                  {!item.read && (
                                    <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0"></span>
                                  )}
                                </div>
                                <p className="text-sm truncate text-gray-400">{item.message}</p>
                                <span className="text-xs text-gray-500">{item.time}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="p-3 text-center border-t border-amber-500/10 hover:bg-amber-500/10 transition-colors">
                          <Link to="/notifications" className="text-sm text-amber-400 hover:text-amber-300 transition-colors">
                            View all notifications
                          </Link>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Theme Toggle - Show to everyone */}
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
                  <Link to="/favorites" className="p-2.5 rounded-xl transition-all duration-300 hover:scale-110 text-gray-400 hover:text-amber-400 hover:bg-amber-500/10" aria-label="Favorites">
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
                      {/* Professional User Avatar with uploaded image */}
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
                          {/* User Info with professional avatar */}
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

          {/* Mobile Controls */}
          <div className="flex items-center gap-1 sm:gap-2 lg:hidden">
            {/* Mobile Search Toggle */}
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
              <div className="relative">
                <button
                  onClick={() => setNotificationOpen(!notificationOpen)}
                  className="relative p-2 rounded-xl transition-all duration-300 text-gray-400 hover:text-amber-400 hover:bg-amber-500/10"
                  aria-label="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {notifications > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[8px] rounded-full flex items-center justify-center font-bold shadow-lg shadow-amber-500/30">
                      {notifications}
                    </span>
                  )}
                </button>

                <AnimatePresence>
                  {notificationOpen && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-72 rounded-2xl shadow-2xl border border-amber-500/20 overflow-hidden bg-gradient-to-b from-[#1a0a00] to-[#0a0a0a]"
                    >
                      <div className="p-3 border-b border-amber-500/10">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-white text-sm">Notifications</h3>
                          <button className="text-xs text-amber-400 hover:text-amber-300 transition-colors">
                            Mark all read
                          </button>
                        </div>
                      </div>
                      <div className="max-h-64 overflow-y-auto">
                        {notificationItems.slice(0, 2).map((item) => (
                          <div
                            key={item.id}
                            onClick={() => handleNotificationClick(item.id)}
                            className={`flex items-start gap-3 px-3 py-2 transition-all cursor-pointer ${
                              !item.read ? 'bg-amber-500/5 border-l-2 border-amber-400' : ''
                            } hover:bg-amber-500/10`}
                          >
                            <div className={`w-8 h-8 rounded-xl ${item.bg} flex items-center justify-center flex-shrink-0`}>
                              <item.icon className={`w-4 h-4 ${item.color}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="font-medium text-xs text-white truncate">{item.title}</span>
                                {!item.read && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0"></span>
                                )}
                              </div>
                              <p className="text-xs truncate text-gray-400">{item.message}</p>
                              <span className="text-[10px] text-gray-500">{item.time}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-2 text-center border-t border-amber-500/10 hover:bg-amber-500/10 transition-colors">
                        <Link to="/notifications" className="text-xs text-amber-400 hover:text-amber-300 transition-colors">
                          View all notifications
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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

        {/* Mobile Search Bar - Expandable */}
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

        {/* Mobile Menu - Full screen overlay */}
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
                  {/* User section in mobile menu */}
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

                  {/* Navigation Links */}
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

                  {/* Services Section */}
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

                  {/* Authenticated User Menu Items */}
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
    </nav>
  )
}

export default Navbar
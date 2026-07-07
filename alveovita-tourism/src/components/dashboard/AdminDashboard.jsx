// src/components/dashboard/AdminDashboard.jsx
import { useState, useEffect, useRef, useReducer, useMemo } from 'react'
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'
import {
  LayoutDashboard, Users, Calendar, DollarSign, Package,
  MessageSquare, Settings, LogOut, Plus, Eye, Search,
  CheckCircle, XCircle, Clock, AlertCircle, BarChart3,
  Download, Bell, UserCircle, Shield, Star, Heart,
  TrendingUp, ArrowUpRight, MoreVertical, Menu,
  X, Grid, List, Filter, ChevronDown, Edit, Trash2,
  Gift, Award as AwardIcon, Zap, Globe, Cloud, Sun, Moon,
  BookOpen, Music, Camera, Coffee, Leaf, Sparkles,
  PieChart, LineChart, Activity, Target, Flag,
  MapPin, Phone, Mail, CreditCard, Ticket,
  Compass, Wind, Droplet, Thermometer, Waves, Mountain,
  Flower, Sunrise, Sunset, CloudRain
} from 'lucide-react'
// ============================================
// 1. STATE MANAGEMENT WITH useReducer
// ============================================
const initialState = {
  activeView: 'analytics',
  timeFilter: 'week',
  isCollapsed: false,
  hoveredMetric: null,
  viewMode: 'density',
  selectedRegion: null,
  isMapInteractive: true,
  chartAnimation: 'idle',
  dataStream: 'live'
}

const dashboardReducer = (state, action) => {
  switch (action.type) {
    case 'SET_VIEW': return { ...state, activeView: action.payload }
    case 'SET_TIME_FILTER': return { ...state, timeFilter: action.payload }
    case 'TOGGLE_COLLAPSE': return { ...state, isCollapsed: !state.isCollapsed }
    case 'SET_HOVERED_METRIC': return { ...state, hoveredMetric: action.payload }
    case 'SET_VIEW_MODE': return { ...state, viewMode: action.payload }
    case 'SET_SELECTED_REGION': return { ...state, selectedRegion: action.payload }
    case 'TOGGLE_MAP_INTERACTIVE': return { ...state, isMapInteractive: !state.isMapInteractive }
    case 'SET_CHART_ANIMATION': return { ...state, chartAnimation: action.payload }
    default: return state
  }
}

// ============================================
// 2. CUSTOM HOOKS
// ============================================
const useSpringNumber = (target, config = { damping: 15, stiffness: 120 }) => {
  const spring = useSpring(target, config)
  return spring
}

const useParallax = (ref, speed = 0.05) => {
  const [offset, setOffset] = useState(0)
  
  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect()
        const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * speed
        setOffset(offset)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [ref, speed])
  
  return offset
}

// ============================================
// 3. MAIN COMPONENT
// ============================================
const AdminDashboard = () => {
  const { isDark, toggleTheme } = useTheme()
  const [state, dispatch] = useReducer(dashboardReducer, initialState)
  const { activeView, timeFilter, isCollapsed, hoveredMetric, viewMode } = state
  
  const [bookings, setBookings] = useState([])
  const [tours, setTours] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Refs for parallax
  const heroRef = useRef(null)
  const metricsRef = useRef(null)
  const chartRef = useRef(null)
  
  // Parallax values
  const heroParallax = useParallax(heroRef, 0.03)
  const metricsParallax = useParallax(metricsRef, 0.02)
  
  // Mouse tracking for 3D effects
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const mouseXSpring = useSpring(0, { damping: 30, stiffness: 200 })
  const mouseYSpring = useSpring(0, { damping: 30, stiffness: 200 })
  
  // ✅ ALL useTransform hooks at TOP LEVEL
  // Card rotation for metric cards
  const cardRotationX = useTransform(mouseXSpring, [-1, 1], [4, -4])
  const cardRotationY = useTransform(mouseYSpring, [-1, 1], [-4, 4])
  
  // Sidebar rotation
  const sidebarRotateX = useTransform(mouseXSpring, [-1, 1], [2, -2])
  const sidebarRotateY = useTransform(mouseYSpring, [-1, 1], [-2, 2])
  
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 2
      const y = (e.clientY / window.innerHeight - 0.5) * 2
      mouseXSpring.set(x)
      mouseYSpring.set(y)
      setMousePosition({ x, y })
    }
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseXSpring, mouseYSpring])
  
  // Load data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1800))
      
      const savedBookings = localStorage.getItem('alveovita_bookings')
      const savedTours = localStorage.getItem('alveovita_tours')
      setBookings(savedBookings ? JSON.parse(savedBookings) : [])
      setTours(savedTours ? JSON.parse(savedTours) : [])
      setIsLoading(false)
    }
    loadData()
  }, [])
  
  // ============================================
  // 4. BILLION-DOLLAR DATA
  // ============================================
  const metrics = useMemo(() => [
    {
      id: 'revenue',
      label: 'Total Revenue',
      value: '$284,590',
      change: '+23.7%',
      trend: 'up',
      icon: DollarSign,
      color: '#F59E0B',
      gradient: 'from-amber-400 via-orange-400 to-amber-500',
      description: 'vs last month',
      chart: [30, 45, 38, 55, 48, 62, 75, 68, 82, 90, 85, 95],
      growth: 'exponential',
      confidence: 98.7
    },
    {
      id: 'bookings',
      label: 'Total Bookings',
      value: '1,847',
      change: '+18.2%',
      trend: 'up',
      icon: Calendar,
      color: '#3B82F6',
      gradient: 'from-blue-400 via-indigo-400 to-blue-500',
      description: 'vs last month',
      chart: [20, 35, 28, 42, 38, 55, 48, 60, 52, 70, 65, 78],
      growth: 'linear',
      confidence: 96.3
    },
    {
      id: 'users',
      label: 'Active Users',
      value: '5,234',
      change: '+12.5%',
      trend: 'up',
      icon: Users,
      color: '#8B5CF6',
      gradient: 'from-purple-400 via-violet-400 to-purple-500',
      description: 'vs last month',
      chart: [15, 25, 22, 35, 30, 45, 40, 55, 48, 60, 58, 65],
      growth: 's-curve',
      confidence: 94.8
    },
    {
      id: 'rating',
      label: 'Avg Rating',
      value: '4.9',
      change: '+0.3',
      trend: 'up',
      icon: Star,
      color: '#EF4444',
      gradient: 'from-red-400 via-rose-400 to-red-500',
      description: 'out of 5.0',
      chart: [4.2, 4.3, 4.5, 4.6, 4.7, 4.8, 4.8, 4.9, 4.9, 4.9, 4.9, 4.9],
      growth: 'plateau',
      confidence: 99.1
    }
  ], [])
  
  // ============================================
  // 5. NAVIGATION WITH CATEGORIES
  // ============================================
  const navItems = [
    {
      category: 'Core Intelligence',
      icon: Zap,
      items: [
        { id: 'analytics', label: 'Analytics', icon: LayoutDashboard },
        { id: 'bookings', label: 'Bookings', icon: Calendar, badge: '24' },
        { id: 'tours', label: 'Tours', icon: Package },
        { id: 'users', label: 'Users', icon: Users },
      ]
    },
    {
      category: 'Experience Management',
      icon: Compass,
      items: [
        { id: 'reviews', label: 'Reviews', icon: Star, badge: '8' },
        { id: 'messages', label: 'Messages', icon: MessageSquare, badge: '3' },
        { id: 'analytics', label: 'Reports', icon: BarChart3 },
      ]
    },
    {
      category: 'System Control',
      icon: Settings,
      items: [
        { id: 'settings', label: 'Settings', icon: Settings },
        { id: 'support', label: 'Support', icon: Shield },
      ]
    }
  ]
  
  // ============================================
  // 6. RENDER: HOLOGRAPHIC LOADER
  // ============================================
  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 via-transparent to-orange-500/20 blur-3xl animate-pulse" />
          
          <div className="relative flex flex-col items-center gap-8">
            <div className="relative w-32 h-32">
              <div className="absolute inset-0 rounded-full border-2 border-amber-400/30 animate-spin-slow" />
              <div className="absolute inset-[8px] rounded-full border-2 border-orange-400/20 animate-spin-slower" />
              <div className="absolute inset-[16px] rounded-full border border-amber-500/10" />
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-2xl font-bold text-white shadow-2xl shadow-amber-500/30">
                  AV
                </div>
              </div>
              
              <motion.div
                className="absolute inset-0 rounded-full overflow-hidden"
                initial={{ y: -32 }}
                animate={{ y: 32 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="w-full h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
              </motion.div>
            </div>
            
            <div className="text-center">
              <div className="text-sm font-mono text-slate-400 dark:text-slate-500 tracking-widest">
                INITIALIZING SYSTEM
              </div>
              <div className="flex items-center justify-center gap-1 mt-2">
                <motion.div
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0 }}
                  className="w-2 h-2 rounded-full bg-amber-400"
                />
                <motion.div
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                  className="w-2 h-2 rounded-full bg-orange-400"
                />
                <motion.div
                  animate={{ opacity: [0, 1, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.6 }}
                  className="w-2 h-2 rounded-full bg-amber-500"
                />
              </div>
              
              <div className="w-48 h-[2px] bg-slate-800 dark:bg-slate-700 rounded-full overflow-hidden mt-4">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
                  initial={{ width: '0%' }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                />
              </div>
            </div>
            
            <div className="absolute -z-10 w-64 h-64">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 rounded-full bg-amber-400/30"
                  initial={{
                    x: Math.random() * 256 - 128,
                    y: Math.random() * 256 - 128,
                    opacity: 0
                  }}
                  animate={{
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0]
                  }}
                  transition={{
                    duration: 2 + Math.random() * 2,
                    repeat: Infinity,
                    delay: Math.random() * 2
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  // ============================================
  // 7. RENDER: MAIN DASHBOARD
  // ============================================
  return (
    <div className={`min-h-screen flex ${isDark ? 'bg-slate-950' : 'bg-slate-50'} transition-colors duration-700`}>
      
      {/* SIDEBAR */}
      <motion.aside
        initial={false}
        animate={{ width: isCollapsed ? 80 : 320 }}
        className={`fixed left-0 top-0 h-full ${
          isDark 
            ? 'bg-slate-900/80 backdrop-blur-2xl' 
            : 'bg-white/80 backdrop-blur-2xl'
        } border-r ${
          isDark ? 'border-slate-700/30' : 'border-slate-200/30'
        } shadow-2xl shadow-black/10 z-50 flex flex-col transition-all duration-500 ease-spring`}
        style={{
          boxShadow: isDark 
            ? '0 0 80px rgba(0,0,0,0.3), inset -1px 0 0 rgba(255,255,255,0.05)'
            : '0 0 80px rgba(0,0,0,0.08), inset -1px 0 0 rgba(255,255,255,0.5)'
        }}
      >
        {/* Brand with 3D tilt - Using pre-computed hooks */}
        <motion.div 
          className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} h-24 px-6 border-b ${
            isDark ? 'border-slate-700/30' : 'border-slate-200/30'
          }`}
          style={{
            rotateX: sidebarRotateX,
            rotateY: sidebarRotateY,
          }}
        >
          {!isCollapsed ? (
            <motion.div 
              className="flex items-center gap-4"
              whileHover={{ scale: 1.02 }}
            >
              <div className="relative group">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-amber-500/30 group-hover:shadow-amber-500/50 transition-all duration-300">
                  AV
                </div>
                <div className="absolute inset-0 rounded-2xl border-2 border-amber-400/30 animate-ping-slow" />
                <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-900 shadow-lg shadow-emerald-400/30" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent tracking-tight">
                  AlveoVita
                </h1>
                <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 tracking-[0.2em] uppercase">
                  Executive Console
                </p>
              </div>
            </motion.div>
          ) : (
            <div className="relative group">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 flex items-center justify-center text-white font-bold text-2xl shadow-xl shadow-amber-500/30">
                AV
              </div>
              <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-400 rounded-full border-2 border-white dark:border-slate-900 shadow-lg shadow-emerald-400/30" />
            </div>
          )}
          
          <motion.button
            onClick={() => dispatch({ type: 'TOGGLE_COLLAPSE' })}
            className={`p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/30 transition-all duration-300 ${
              isCollapsed ? 'hidden' : ''
            }`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <Menu className="w-5 h-5 text-slate-400" />
          </motion.button>
        </motion.div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-8 scrollbar-thin scrollbar-thumb-amber-400/20">
          {navItems.map((section) => (
            <div key={section.category} className="mb-8">
              {!isCollapsed && (
                <div className="flex items-center gap-2 px-4 mb-3">
                  <section.icon className="w-3 h-3 text-slate-400" />
                  <p className="text-[10px] font-mono text-slate-400 dark:text-slate-500 tracking-[0.15em] uppercase">
                    {section.category}
                  </p>
                </div>
              )}
              <div className="space-y-1">
                {section.items.map((item) => (
                  <motion.button
                    key={item.id}
                    whileHover={{ x: isCollapsed ? 0 : 6, scale: 1.02 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => dispatch({ type: 'SET_VIEW', payload: item.id })}
                    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-300 relative group ${
                      activeView === item.id
                        ? isDark
                          ? 'bg-gradient-to-r from-amber-500/20 to-orange-500/10 text-amber-400'
                          : 'bg-gradient-to-r from-amber-500/10 to-orange-500/5 text-amber-600'
                        : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100/50 dark:hover:bg-slate-700/20'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                  >
                    <item.icon className={`w-5 h-5 flex-shrink-0 transition-colors ${
                      activeView === item.id ? 'text-amber-400' : 'group-hover:text-amber-400/70'
                    }`} />
                    
                    {!isCollapsed && (
                      <>
                        <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                        {item.badge && (
                          <span className="px-2.5 py-0.5 text-[10px] font-mono bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full shadow-lg shadow-amber-500/20">
                            {item.badge}
                          </span>
                        )}
                      </>
                    )}
                    
                    {activeView === item.id && (
                      <motion.div
                        layoutId="navActive"
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-10 bg-gradient-to-b from-amber-400 to-orange-500 rounded-r-full shadow-lg shadow-amber-500/30"
                      />
                    )}
                  </motion.button>
                ))}
              </div>
            </div>
          ))}
        </nav>
        
        {/* Bottom actions */}
        <div className="p-4 border-t border-slate-200/30 dark:border-slate-700/30 space-y-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
              isDark ? 'hover:bg-slate-700/20 text-slate-400' : 'hover:bg-slate-100/50 text-slate-600'
            } ${isCollapsed ? 'justify-center' : ''} group`}
          >
            <Bell className="w-5 h-5 group-hover:text-amber-400 transition-colors" />
            {!isCollapsed && (
              <>
                <span className="text-sm font-medium flex-1 text-left">Notifications</span>
                <span className="px-2.5 py-0.5 text-[10px] font-mono bg-gradient-to-r from-red-400 to-rose-500 text-white rounded-full shadow-lg shadow-red-500/20">
                  3
                </span>
              </>
            )}
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all ${
              isDark ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-red-50 text-red-500'
            } ${isCollapsed ? 'justify-center' : ''} group`}
          >
            <LogOut className="w-5 h-5" />
            {!isCollapsed && (
              <span className="text-sm font-medium">Logout</span>
            )}
          </motion.button>
        </div>
      </motion.aside>
      
      {/* MAIN CONTENT */}
      <div className={`flex-1 transition-all duration-500 ease-spring ${isCollapsed ? 'ml-[80px]' : 'ml-[320px]'}`}>
        
        {/* Header */}
        <header className={`sticky top-0 z-40 ${
          isDark ? 'bg-slate-950/70' : 'bg-slate-50/70'
        } backdrop-blur-2xl border-b ${
          isDark ? 'border-slate-700/20' : 'border-slate-200/20'
        }`}>
          <div className="flex items-center justify-between px-8 h-24">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-6"
            >
              <div>
                <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'} tracking-tight`}>
                  {activeView.charAt(0).toUpperCase() + activeView.slice(1)}
                </h1>
                <div className="flex items-center gap-3 text-sm text-slate-400">
                  <span>Welcome back, Administrator</span>
                  <span className="w-1 h-1 rounded-full bg-slate-400" />
                  <span className="font-mono text-xs">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </span>
                  <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-emerald-400 text-xs font-mono">● LIVE</span>
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4"
            >
              {/* View mode toggles */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/20 dark:border-slate-700/20">
                {['density', 'focus', 'night'].map((mode) => (
                  <motion.button
                    key={mode}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => dispatch({ type: 'SET_VIEW_MODE', payload: mode })}
                    className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      viewMode === mode
                        ? 'bg-white dark:bg-slate-700 shadow-lg text-slate-800 dark:text-white'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
                    }`}
                  >
                    {mode.charAt(0).toUpperCase() + mode.slice(1)}
                  </motion.button>
                ))}
              </div>
              
              {/* Time filter */}
              <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/20 dark:border-slate-700/20">
                {['day', 'week', 'month', 'year'].map((filter) => (
                  <button
                    key={filter}
                    onClick={() => dispatch({ type: 'SET_TIME_FILTER', payload: filter })}
                    className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      timeFilter === filter
                        ? 'bg-white dark:bg-slate-700 shadow-lg text-slate-800 dark:text-white'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white'
                    }`}
                  >
                    {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  </button>
                ))}
              </div>
              
              {/* Action buttons */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2.5 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/20 dark:border-slate-700/20 hover:bg-slate-200/50 dark:hover:bg-slate-700/30 transition-all"
              >
                <Download className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-xl shadow-amber-500/30 hover:shadow-amber-500/50 transition-all duration-300"
              >
                <Plus className="w-5 h-5" />
              </motion.button>
            </motion.div>
          </div>
        </header>
        
        {/* CONTENT AREA */}
        <main className="p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeView}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.6, ease: [0.23, 1, 0.32, 1] }}
            >
              
              {/* HERO METRICS */}
              <motion.div
                ref={metricsRef}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8"
                style={{
                  y: metricsParallax
                }}
              >
                {metrics.map((metric, index) => {
                  const isHovered = hoveredMetric === index
                  
                  return (
                    <motion.div
                      key={metric.id}
                      initial={{ opacity: 0, scale: 0.8, y: 40 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ 
                        delay: index * 0.08,
                        duration: 0.6,
                        ease: [0.23, 1, 0.32, 1]
                      }}
                      onHoverStart={() => dispatch({ type: 'SET_HOVERED_METRIC', payload: index })}
                      onHoverEnd={() => dispatch({ type: 'SET_HOVERED_METRIC', payload: null })}
                      className="relative"
                      style={{
                        rotateX: cardRotationX,
                        rotateY: cardRotationY,
                        transformStyle: 'preserve-3d',
                        perspective: 1000
                      }}
                    >
                      <div className={`relative p-6 rounded-2xl ${
                        isDark ? 'bg-slate-800/60' : 'bg-white/60'
                      } backdrop-blur-xl border ${
                        isDark ? 'border-slate-700/30' : 'border-slate-200/30'
                      } overflow-hidden transition-all duration-500 ${
                        isHovered ? 'shadow-2xl shadow-amber-500/10 scale-[1.02]' : 'shadow-xl'
                      }`}>
                        {/* Animated gradient background */}
                        <motion.div 
                          className={`absolute inset-0 bg-gradient-to-br ${metric.gradient} opacity-0`}
                          animate={{ opacity: isHovered ? 0.08 : 0 }}
                          transition={{ duration: 0.4 }}
                        />
                        
                        {/* Glow effect */}
                        <div className={`absolute -inset-1 bg-gradient-to-r ${metric.gradient} opacity-0 blur-2xl transition-opacity duration-500 ${
                          isHovered ? 'opacity-20' : ''
                        }`} />
                        
                        <div className="relative">
                          <div className="flex items-start justify-between">
                            <motion.div 
                              className={`p-3.5 rounded-xl bg-gradient-to-br ${metric.gradient} shadow-xl`}
                              whileHover={{ scale: 1.1, rotate: -5 }}
                              transition={{ type: 'spring', stiffness: 300 }}
                            >
                              <metric.icon className="w-6 h-6 text-white" />
                            </motion.div>
                            <motion.div 
                              className="flex items-center gap-1.5"
                              animate={{ 
                                scale: isHovered ? 1.1 : 1,
                              }}
                            >
                              <span className={`text-sm font-bold ${metric.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
                                {metric.change}
                              </span>
                              <ArrowUpRight className={`w-4 h-4 ${metric.trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`} />
                            </motion.div>
                          </div>
                          
                          <div className="mt-4">
                            <motion.div 
                              className={`text-4xl font-bold ${isDark ? 'text-white' : 'text-slate-800'} tracking-tight`}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: 0.3 + index * 0.05 }}
                            >
                              {metric.value}
                            </motion.div>
                            <div className="text-sm text-slate-400 mt-1">{metric.label}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                              {metric.description} • {metric.confidence}% confidence
                            </div>
                          </div>
                          
                          {/* Mini chart */}
                          <div className="mt-4 h-16 flex items-end gap-0.5">
                            {metric.chart.map((value, i) => {
                              const heightPercent = (value / Math.max(...metric.chart)) * 100
                              return (
                                <motion.div
                                  key={i}
                                  className={`flex-1 rounded-sm transition-all duration-300 ${
                                    isDark ? 'bg-slate-600/30' : 'bg-slate-200/50'
                                  }`}
                                  initial={{ height: 0 }}
                                  animate={{ height: `${heightPercent}%` }}
                                  transition={{
                                    delay: 0.1 + i * 0.02,
                                    type: 'spring',
                                    damping: 15,
                                    stiffness: 100
                                  }}
                                  style={{
                                    backgroundColor: isHovered ? metric.color : undefined,
                                    opacity: isHovered ? 1 : 0.5
                                  }}
                                />
                              )
                            })}
                          </div>
                          
                          {/* Growth indicator */}
                          <div className="mt-2 flex items-center gap-2">
                            <div className={`text-[10px] font-mono ${
                              metric.growth === 'exponential' ? 'text-amber-400' :
                              metric.growth === 's-curve' ? 'text-blue-400' :
                              metric.growth === 'plateau' ? 'text-emerald-400' :
                              'text-slate-400'
                            }`}>
                              {metric.growth.toUpperCase()} GROWTH
                            </div>
                            <div className="w-1 h-1 rounded-full bg-slate-400" />
                            <div className="text-[10px] font-mono text-slate-400">
                              R² {Math.round(metric.confidence)}%
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </motion.div>
              
              {/* MAIN GRID */}
              <div className="grid xl:grid-cols-3 gap-6">
                
                {/* Left Column */}
                <div className="xl:col-span-2 space-y-6">
                  
                  {/* Booking Status */}
                  <motion.div 
                    ref={chartRef}
                    className={`p-6 rounded-2xl ${
                      isDark ? 'bg-slate-800/60' : 'bg-white/60'
                    } backdrop-blur-xl border ${
                      isDark ? 'border-slate-700/30' : 'border-slate-200/30'
                    } shadow-xl transition-all duration-500`}
                    whileHover={{ 
                      boxShadow: isDark 
                        ? '0 0 60px rgba(0,0,0,0.3)'
                        : '0 0 60px rgba(0,0,0,0.05)'
                    }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <motion.h3 
                          className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'} tracking-tight`}
                        >
                          Booking Status Distribution
                        </motion.h3>
                        <p className="text-sm text-slate-400">Real-time status metrics with predictive analytics</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 text-sm text-slate-400">
                          <Activity className="w-4 h-4" />
                          <span className="font-mono">{bookings.length} Total</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>LIVE</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-4 gap-4">
                      {[
                        { label: 'Completed', value: 45, color: '#10B981', trend: '+12%' },
                        { label: 'Pending', value: 28, color: '#F59E0B', trend: '-3%' },
                        { label: 'Cancelled', value: 12, color: '#EF4444', trend: '+2%' },
                        { label: 'In Progress', value: 15, color: '#3B82F6', trend: '+8%' },
                      ].map((status, idx) => (
                        <motion.div
                          key={idx}
                          className="relative group"
                          whileHover={{ y: -4 }}
                        >
                          <div className="flex items-center justify-between mb-1.5">
                            <span className="text-sm font-medium text-slate-400">{status.label}</span>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-800 dark:text-white">
                                {status.value}%
                              </span>
                              <span className={`text-xs ${
                                status.trend.startsWith('+') ? 'text-emerald-400' : 'text-red-400'
                              }`}>
                                {status.trend}
                              </span>
                            </div>
                          </div>
                          <div className="relative h-4 bg-slate-100/50 dark:bg-slate-700/50 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${status.value}%` }}
                              transition={{ 
                                duration: 1.5, 
                                delay: idx * 0.1,
                                ease: [0.23, 1, 0.32, 1]
                              }}
                              className="h-full rounded-full relative"
                              style={{ backgroundColor: status.color }}
                            >
                              <motion.div
                                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                                animate={{ x: ['-100%', '200%'] }}
                                transition={{ 
                                  duration: 3,
                                  repeat: Infinity,
                                  ease: 'linear'
                                }}
                              />
                            </motion.div>
                          </div>
                          <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                            <div className="px-2 py-1 text-xs font-mono bg-slate-900/90 text-white rounded shadow-lg whitespace-nowrap">
                              {status.value}% of total bookings
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                  
                  {/* Recent Transactions */}
                  <motion.div 
                    className={`p-6 rounded-2xl ${
                      isDark ? 'bg-slate-800/60' : 'bg-white/60'
                    } backdrop-blur-xl border ${
                      isDark ? 'border-slate-700/30' : 'border-slate-200/30'
                    } shadow-xl`}
                    whileHover={{ 
                      boxShadow: isDark 
                        ? '0 0 60px rgba(0,0,0,0.3)'
                        : '0 0 60px rgba(0,0,0,0.05)'
                    }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'} tracking-tight`}>
                          Recent Transactions
                        </h3>
                        <p className="text-sm text-slate-400">Latest booking activity with real-time updates</p>
                      </div>
                      <motion.button 
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="text-sm font-medium text-amber-400 hover:text-amber-500 transition-colors flex items-center gap-1"
                      >
                        View All
                        <ArrowUpRight className="w-4 h-4" />
                      </motion.button>
                    </div>
                    
                    <div className="space-y-3">
                      {[
                        { 
                          guest: 'Sarah Johnson', 
                          tour: 'Luxury Wellness Retreat', 
                          date: 'Dec 15, 2024', 
                          amount: '$2,400',
                          status: 'completed',
                          avatar: 'https://i.pravatar.cc/150?img=1',
                          confidence: 98
                        },
                        { 
                          guest: 'Michael Chen', 
                          tour: 'Spa & Meditation', 
                          date: 'Dec 14, 2024', 
                          amount: '$1,800',
                          status: 'pending',
                          avatar: 'https://i.pravatar.cc/150?img=2',
                          confidence: 76
                        },
                        { 
                          guest: 'Emily Davis', 
                          tour: 'Yoga & Wellness', 
                          date: 'Dec 14, 2024', 
                          amount: '$1,200',
                          status: 'completed',
                          avatar: 'https://i.pravatar.cc/150?img=3',
                          confidence: 94
                        },
                        { 
                          guest: 'David Kim', 
                          tour: 'Holistic Healing', 
                          date: 'Dec 13, 2024', 
                          amount: '$3,600',
                          status: 'pending',
                          avatar: 'https://i.pravatar.cc/150?img=4',
                          confidence: 82
                        },
                        { 
                          guest: 'Lisa Thompson', 
                          tour: 'Mindfulness Retreat', 
                          date: 'Dec 13, 2024', 
                          amount: '$1,500',
                          status: 'completed',
                          avatar: 'https://i.pravatar.cc/150?img=5',
                          confidence: 97
                        },
                      ].map((transaction, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          whileHover={{ 
                            x: 8,
                            transition: { type: 'spring', stiffness: 300 }
                          }}
                          className={`flex items-center justify-between p-4 rounded-xl ${
                            isDark ? 'bg-slate-700/20 hover:bg-slate-700/40' : 'bg-slate-50/50 hover:bg-slate-100/50'
                          } transition-all group cursor-pointer`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <img
                                src={transaction.avatar}
                                alt={transaction.guest}
                                className="w-12 h-12 rounded-xl object-cover ring-2 ring-slate-200/20 dark:ring-slate-700/30"
                              />
                              <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 ${
                                isDark ? 'border-slate-800' : 'border-white'
                              } ${transaction.status === 'completed' ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                            </div>
                            <div>
                              <div className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                {transaction.guest}
                              </div>
                              <div className="flex items-center gap-2 text-sm text-slate-400">
                                <span>{transaction.tour}</span>
                                <span className="w-1 h-1 rounded-full bg-slate-400" />
                                <span>{transaction.date}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className={`font-bold ${isDark ? 'text-white' : 'text-slate-800'}`}>
                                {transaction.amount}
                              </div>
                              <div className="text-[10px] font-mono text-slate-400">
                                {transaction.confidence}% confidence
                              </div>
                            </div>
                            <div className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                              transaction.status === 'completed'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}>
                              {transaction.status}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>
                
                {/* Right Column */}
                <div className="space-y-6">
                  
                  {/* Today's Schedule */}
                  <motion.div 
                    className={`p-6 rounded-2xl ${
                      isDark ? 'bg-slate-800/60' : 'bg-white/60'
                    } backdrop-blur-xl border ${
                      isDark ? 'border-slate-700/30' : 'border-slate-200/30'
                    } shadow-xl`}
                    whileHover={{ 
                      boxShadow: isDark 
                        ? '0 0 60px rgba(0,0,0,0.3)'
                        : '0 0 60px rgba(0,0,0,0.05)'
                    }}
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'} tracking-tight`}>
                          Today's Schedule
                        </h3>
                        <p className="text-sm text-slate-400">Real-time event tracking</p>
                      </div>
                      <motion.div 
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-xs font-mono border border-emerald-500/20"
                        animate={{ opacity: [0.7, 1, 0.7] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        LIVE
                      </motion.div>
                    </div>
                    
                    <div className="space-y-4">
                      {[
                        { time: '09:00', event: 'Spa Wellness Tour', guests: 12, location: 'Serenity Spa', status: 'active' },
                        { time: '11:30', event: 'Yoga Retreat', guests: 8, location: 'Mountain View', status: 'upcoming' },
                        { time: '14:00', event: 'Meditation Session', guests: 15, location: 'Zen Garden', status: 'upcoming' },
                        { time: '16:30', event: 'Health Consultation', guests: 6, location: 'Wellness Center', status: 'upcoming' },
                      ].map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.08 }}
                          whileHover={{ x: 4 }}
                          className={`flex items-start gap-4 p-3.5 rounded-xl ${
                            isDark ? 'bg-slate-700/20' : 'bg-slate-50/50'
                          } transition-all ${
                            item.status === 'active' ? 'border border-emerald-500/30' : ''
                          }`}
                        >
                          <div className="flex flex-col items-center min-w-[60px]">
                            <span className="text-sm font-bold text-amber-400 font-mono">{item.time}</span>
                            <div className="w-px h-8 bg-slate-300/30 dark:bg-slate-600/30 mt-1" />
                          </div>
                          <div className="flex-1">
                            <div className={`font-medium ${isDark ? 'text-white' : 'text-slate-800'} flex items-center gap-2`}>
                              {item.event}
                              {item.status === 'active' && (
                                <span className="text-[8px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                  NOW
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-sm text-slate-400 mt-0.5">
                              <span className="flex items-center gap-1.5">
                                <Users className="w-3 h-3" />
                                {item.guests} guests
                              </span>
                              <span className="flex items-center gap-1.5">
                                <MapPin className="w-3 h-3" />
                                {item.location}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                  
                  {/* Quick Stats */}
                  <motion.div 
                    className={`p-6 rounded-2xl ${
                      isDark ? 'bg-slate-800/60' : 'bg-white/60'
                    } backdrop-blur-xl border ${
                      isDark ? 'border-slate-700/30' : 'border-slate-200/30'
                    } shadow-xl`}
                    whileHover={{ 
                      boxShadow: isDark 
                        ? '0 0 60px rgba(0,0,0,0.3)'
                        : '0 0 60px rgba(0,0,0,0.05)'
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-slate-800'} tracking-tight`}>
                        Quick Stats
                      </h3>
                      <AwardIcon className="w-5 h-5 text-amber-400" />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { label: 'Completed', value: '847', icon: CheckCircle, color: 'text-emerald-400', change: '+12%' },
                        { label: 'Pending', value: '324', icon: Clock, color: 'text-amber-400', change: '-3%' },
                        { label: 'Cancelled', value: '89', icon: XCircle, color: 'text-red-400', change: '+2%' },
                        { label: 'Total Tours', value: '36', icon: Package, color: 'text-blue-400', change: '+5%' },
                      ].map((stat, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.2 + index * 0.05 }}
                          whileHover={{ scale: 1.05 }}
                          className={`p-3.5 rounded-xl ${
                            isDark ? 'bg-slate-700/20' : 'bg-slate-50/50'
                          } transition-all`}
                        >
                          <div className="flex items-center justify-between">
                            <stat.icon className={`w-4 h-4 ${stat.color}`} />
                            <span className={`text-[10px] font-mono ${
                              stat.change.startsWith('+') ? 'text-emerald-400' : 'text-red-400'
                            }`}>
                              {stat.change}
                            </span>
                          </div>
                          <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'} mt-1 tracking-tight`}>
                            {stat.value}
                          </div>
                          <div className="text-xs text-slate-400">{stat.label}</div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>
              
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

export default AdminDashboard
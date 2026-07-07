// src/pages/Dashboard.jsx
import { useState, useEffect } from 'react'
import { Outlet, Navigate, useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import { 
  LayoutDashboard, Calendar, Users, Package,
  Settings, LogOut, Menu, X, Heart,
  Camera, User, Bell, Search, ChevronRight,
  BarChart3, PieChart, MessageSquare, Star,
  Gift, Award, TrendingUp, Clock
} from 'lucide-react'

const Dashboard = () => {
  const { user, isAuthenticated, loading } = useAuth()
  const { isDark } = useTheme()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024)
      if (window.innerWidth < 1024) {
        setSidebarOpen(false)
      } else {
        setSidebarOpen(true)
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
    { icon: Calendar, label: 'My Bookings', path: '/dashboard/bookings' },
    { icon: Camera, label: 'Experiences', path: '/dashboard/experiences' },
    { icon: Heart, label: 'Favorites', path: '/dashboard/favorites' },
    { icon: Users, label: 'Profile', path: '/dashboard/profile' },
    { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
  ]

  const adminItems = [
    { icon: BarChart3, label: 'Analytics', path: '/dashboard/admin' },
    { icon: Package, label: 'Manage Tours', path: '/dashboard/admin/tours' },
    { icon: Users, label: 'Manage Users', path: '/dashboard/admin/users' },
    { icon: Calendar, label: 'Manage Bookings', path: '/dashboard/admin/bookings' },
  ]

  const isAdmin = user?.role === 'admin'

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <Navbar />
      
      <div className="flex pt-16">
        {/* Sidebar */}
        <motion.aside
          initial={{ x: -300 }}
          animate={{ x: sidebarOpen ? 0 : -300 }}
          transition={{ duration: 0.3 }}
          className={`fixed lg:relative z-40 w-72 h-[calc(100vh-4rem)] ${
            isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'
          } border-r overflow-y-auto`}
        >
          <div className="p-4">
            {/* User Profile */}
            <div className={`p-4 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'} mb-6`}>
              <div className="flex items-center gap-3">
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80'}
                  alt={user?.name}
                  className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-400/30"
                />
                <div className="flex-1 min-w-0">
                  <h4 className={`font-bold truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {user?.name}
                  </h4>
                  <p className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {user?.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="space-y-1">
              <p className={`text-xs uppercase tracking-wider font-semibold px-3 mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Main Menu
              </p>
              {navItems.map((item) => {
                const isActive = location.pathname === item.path
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:scale-105 ${
                      isActive
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                        : isDark
                          ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.label}</span>
                    {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                  </Link>
                )
              })}

              {isAdmin && (
                <>
                  <div className={`my-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`} />
                  <p className={`text-xs uppercase tracking-wider font-semibold px-3 mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Admin Panel
                  </p>
                  {adminItems.map((item) => {
                    const isActive = location.pathname === item.path
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all hover:scale-105 ${
                          isActive
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
                            : isDark
                              ? 'text-gray-400 hover:bg-gray-800 hover:text-white'
                              : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                        }`}
                      >
                        <item.icon className="w-5 h-5" />
                        <span>{item.label}</span>
                        {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                      </Link>
                    )
                  })}
                </>
              )}
            </nav>

            {/* Logout */}
            <div className={`mt-6 pt-6 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
              <button
                onClick={() => {/* handle logout */}}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl w-full transition-all hover:scale-105 ${
                  isDark
                    ? 'text-red-400 hover:bg-red-900/20'
                    : 'text-red-600 hover:bg-red-50'
                }`}
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </motion.aside>

        {/* Main Content */}
        <div className={`flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-72' : ''}`}>
          <div className="p-4 lg:p-8">
            <Outlet />
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`fixed bottom-6 right-6 z-50 lg:hidden p-4 rounded-full shadow-2xl ${
          isDark ? 'bg-gray-800' : 'bg-white'
        }`}
      >
        {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <Footer />
    </div>
  )
}

export default Dashboard
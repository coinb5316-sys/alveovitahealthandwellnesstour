// src/components/dashboard/DashboardSidebar.jsx
import { motion } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'
import { 
  LayoutDashboard, Users, Calendar, DollarSign, Package,
  MessageSquare, Settings, LogOut, Bell, Menu, Shield,
  BarChart3, Star, Compass, Zap, Award
} from 'lucide-react'

const DashboardSidebar = ({ isCollapsed, setIsCollapsed }) => {
  const { isDark } = useTheme()
  const [activeView, setActiveView] = useState('analytics')

  const navItems = [
    {
      category: 'Core',
      icon: Zap,
      items: [
        { id: 'analytics', label: 'Analytics', icon: LayoutDashboard },
        { id: 'bookings', label: 'Bookings', icon: Calendar, badge: '24' },
        { id: 'tours', label: 'Tours', icon: Package },
        { id: 'users', label: 'Users', icon: Users },
      ]
    },
    {
      category: 'Management',
      icon: Compass,
      items: [
        { id: 'reviews', label: 'Reviews', icon: Star, badge: '8' },
        { id: 'messages', label: 'Messages', icon: MessageSquare, badge: '3' },
        { id: 'analytics', label: 'Reports', icon: BarChart3 },
      ]
    },
    {
      category: 'System',
      icon: Settings,
      items: [
        { id: 'settings', label: 'Settings', icon: Settings },
        { id: 'support', label: 'Support', icon: Shield },
      ]
    }
  ]

  return (
    <motion.aside
      initial={false}
      animate={{ width: isCollapsed ? 80 : 280 }}
      className={`fixed left-0 top-0 h-full ${
        isDark 
          ? 'bg-slate-900/95 backdrop-blur-2xl' 
          : 'bg-white/95 backdrop-blur-2xl'
      } border-r ${
        isDark ? 'border-slate-700/30' : 'border-slate-200/30'
      } shadow-2xl shadow-black/10 z-50 flex flex-col transition-all duration-500 ease-spring`}
    >
      {/* Brand */}
      <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} h-20 px-4 border-b ${
        isDark ? 'border-slate-700/30' : 'border-slate-200/30'
      }`}>
        {!isCollapsed ? (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold shadow-lg shadow-amber-500/20">
              AV
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                AlveoVita
              </h1>
              <p className="text-[10px] font-mono text-slate-400 tracking-widest uppercase">
                Admin Console
              </p>
            </div>
          </div>
        ) : (
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold shadow-lg shadow-amber-500/20">
            AV
          </div>
        )}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/30 transition-all ${isCollapsed ? 'hidden' : ''}`}
        >
          <Menu className="w-5 h-5 text-slate-400" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-6">
        {navItems.map((section) => (
          <div key={section.category} className="mb-6">
            {!isCollapsed && (
              <div className="flex items-center gap-2 px-3 mb-2">
                <section.icon className="w-3 h-3 text-slate-400" />
                <p className="text-[10px] font-mono text-slate-400 tracking-widest uppercase">
                  {section.category}
                </p>
              </div>
            )}
            <div className="space-y-1">
              {section.items.map((item) => (
                <motion.button
                  key={item.id}
                  whileHover={{ x: isCollapsed ? 0 : 4 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveView(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative ${
                    activeView === item.id
                      ? 'bg-gradient-to-r from-amber-500/10 to-orange-500/5 text-amber-600 dark:text-amber-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/30'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                >
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${activeView === item.id ? 'text-amber-500' : ''}`} />
                  {!isCollapsed && (
                    <>
                      <span className="text-sm font-medium flex-1 text-left">{item.label}</span>
                      {item.badge && (
                        <span className="px-2 py-0.5 text-[10px] font-mono bg-gradient-to-r from-amber-400 to-orange-500 text-white rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                  {activeView === item.id && (
                    <motion.div
                      layoutId="navActive"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-amber-400 to-orange-500 rounded-r-full"
                    />
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer Actions */}
      <div className="p-4 border-t border-slate-200/30 dark:border-slate-700/30 space-y-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
            isDark ? 'hover:bg-slate-700/30 text-slate-400' : 'hover:bg-slate-100 text-slate-600'
          } ${isCollapsed ? 'justify-center' : ''}`}
        >
          <Bell className="w-5 h-5" />
          {!isCollapsed && (
            <>
              <span className="text-sm font-medium flex-1 text-left">Notifications</span>
              <span className="px-2 py-0.5 text-[10px] font-mono bg-red-500 text-white rounded-full">3</span>
            </>
          )}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.95 }}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
            isDark ? 'hover:bg-red-500/10 text-red-400' : 'hover:bg-red-50 text-red-500'
          } ${isCollapsed ? 'justify-center' : ''}`}
        >
          <LogOut className="w-5 h-5" />
          {!isCollapsed && <span className="text-sm font-medium">Logout</span>}
        </motion.button>
      </div>
    </motion.aside>
  )
}

export default DashboardSidebar
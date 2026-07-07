// src/components/dashboard/DashboardHeader.jsx
import { motion } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'
import { Download, Plus, Sun, Moon } from 'lucide-react'

const DashboardHeader = ({ isCollapsed }) => {
  const { isDark, toggleTheme } = useTheme()
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  })

  return (
    <header className={`sticky top-0 z-40 ${
      isDark ? 'bg-slate-950/80' : 'bg-slate-50/80'
    } backdrop-blur-2xl border-b ${
      isDark ? 'border-slate-700/20' : 'border-slate-200/20'
    }`}>
      <div className="flex items-center justify-between px-6 lg:px-8 h-20">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-800'} tracking-tight`}>
              Analytics
            </h1>
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <span>Welcome back, Admin</span>
              <span className="w-1 h-1 rounded-full bg-slate-400" />
              <span>{currentDate}</span>
              <span className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-400 text-xs font-mono">● LIVE</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/20 dark:border-slate-700/20 hover:bg-slate-200/50 dark:hover:bg-slate-700/30 transition-all"
          >
            {isDark ? (
              <Sun className="w-5 h-5 text-amber-400" />
            ) : (
              <Moon className="w-5 h-5 text-slate-600" />
            )}
          </button>

          <button className="p-2.5 rounded-xl bg-slate-100/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200/20 dark:border-slate-700/20 hover:bg-slate-200/50 dark:hover:bg-slate-700/30 transition-all">
            <Download className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          
          <button className="p-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-orange-500 text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all duration-300">
            <Plus className="w-5 h-5" />
          </button>
        </motion.div>
      </div>
    </header>
  )
}

export default DashboardHeader
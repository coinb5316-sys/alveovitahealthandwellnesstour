// src/components/common/CookieConsent.jsx
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Cookie, X, Check, Shield, ChevronRight, 
  Settings, Lock, Eye, Info, ExternalLink,
  ChevronDown, ChevronUp, CheckCircle,
  AlertCircle, Globe, Users, Database
} from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const CookieConsent = () => {
  const { isDark } = useTheme()
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState({
    necessary: true, // Always true, can't be disabled
    functional: false,
    analytics: false,
    marketing: false
  })
  const [isVisible, setIsVisible] = useState(false)

  // Cookie categories
  const cookieCategories = [
    {
      id: 'necessary',
      name: 'Necessary Cookies',
      description: 'Essential for the website to function properly. These cannot be disabled.',
      icon: Shield,
      required: true,
      alwaysEnabled: true
    },
    {
      id: 'functional',
      name: 'Functional Cookies',
      description: 'Enable enhanced functionality like remembering your preferences and settings.',
      icon: Settings,
      required: false
    },
    {
      id: 'analytics',
      name: 'Analytics Cookies',
      description: 'Help us understand how you interact with our website to improve your experience.',
      icon: Database,
      required: false
    },
    {
      id: 'marketing',
      name: 'Marketing Cookies',
      description: 'Used to deliver personalized advertisements and content.',
      icon: Users,
      required: false
    }
  ]

  // Check if user has already consented
  useEffect(() => {
    const consent = localStorage.getItem('alveovita_cookie_consent')
    if (consent) {
      try {
        const parsed = JSON.parse(consent)
        if (parsed.consent) {
          setIsVisible(false)
          setShowBanner(false)
          return
        }
      } catch (e) {
        console.error('Error parsing cookie consent:', e)
      }
    }
    
    // Show banner after a short delay
    const timer = setTimeout(() => {
      setIsVisible(true)
      setShowBanner(true)
    }, 1500)
    
    return () => clearTimeout(timer)
  }, [])

  // Load saved preferences
  useEffect(() => {
    const saved = localStorage.getItem('alveovita_cookie_preferences')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setPreferences(prev => ({
          ...prev,
          ...parsed
        }))
      } catch (e) {
        console.error('Error loading cookie preferences:', e)
      }
    }
  }, [])

  const handleAcceptAll = () => {
    const allPreferences = {
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true
    }
    saveConsent(allPreferences)
  }

  const handleRejectAll = () => {
    const minimalPreferences = {
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false
    }
    saveConsent(minimalPreferences)
  }

  const handleSavePreferences = () => {
    saveConsent(preferences)
    setShowSettings(false)
  }

  const saveConsent = (prefs) => {
    const consentData = {
      consent: true,
      preferences: prefs,
      timestamp: new Date().toISOString()
    }
    
    localStorage.setItem('alveovita_cookie_consent', JSON.stringify(consentData))
    localStorage.setItem('alveovita_cookie_preferences', JSON.stringify(prefs))
    
    setPreferences(prefs)
    setShowBanner(false)
    setIsVisible(false)
  }

  const handleToggle = (categoryId) => {
    if (categoryId === 'necessary') return
    setPreferences(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }))
  }

  if (!showBanner) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="fixed bottom-0 left-0 right-0 z-[9999] p-4"
        >
          <div className={`max-w-5xl mx-auto rounded-2xl shadow-2xl border ${
            isDark 
              ? 'bg-gray-900 border-gray-800 shadow-black/50' 
              : 'bg-white border-gray-200 shadow-gray-200/50'
          }`}>
            <div className="p-6">
              <div className="flex items-start gap-4">
                {/* Icon */}
                <div className="flex-shrink-0">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    isDark ? 'bg-amber-500/20' : 'bg-amber-100'
                  }`}>
                    <Cookie className={`w-6 h-6 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        🍪 Cookie Preferences
                      </h3>
                      <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        We use cookies to enhance your browsing experience, analyze site traffic, and serve personalized content.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={handleRejectAll}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105 ${
                          isDark 
                            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        Reject All
                      </button>
                      <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105 flex items-center gap-1 ${
                          isDark 
                            ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <Settings className="w-4 h-4" />
                        Settings
                      </button>
                      <button
                        onClick={handleAcceptAll}
                        className="px-6 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all hover:scale-105"
                      >
                        Accept All
                      </button>
                    </div>
                  </div>

                  {/* Settings Panel */}
                  <AnimatePresence>
                    {showSettings && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-800' : 'border-gray-200'}`}>
                          <div className="space-y-3">
                            {cookieCategories.map((category) => {
                              const Icon = category.icon
                              const isEnabled = preferences[category.id]
                              const isRequired = category.alwaysEnabled

                              return (
                                <div
                                  key={category.id}
                                  className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                                    isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-50'
                                  }`}
                                >
                                  <div className="flex items-center gap-3 flex-1">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                                      isDark ? 'bg-gray-700' : 'bg-gray-100'
                                    }`}>
                                      <Icon className={`w-4 h-4 ${
                                        isEnabled ? 'text-amber-400' : isDark ? 'text-gray-500' : 'text-gray-400'
                                      }`} />
                                    </div>
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                          {category.name}
                                        </span>
                                        {isRequired && (
                                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-400 font-semibold">
                                            Required
                                          </span>
                                        )}
                                      </div>
                                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {category.description}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="flex-shrink-0">
                                    <button
                                      onClick={() => handleToggle(category.id)}
                                      disabled={isRequired}
                                      className={`relative w-12 h-6 rounded-full transition-all ${
                                        isEnabled 
                                          ? 'bg-amber-500' 
                                          : isDark ? 'bg-gray-700' : 'bg-gray-300'
                                      } ${isRequired ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                    >
                                      <div className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-all ${
                                        isEnabled ? 'translate-x-6' : 'translate-x-0'
                                      }`} />
                                    </button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>

                          <div className="flex items-center justify-end gap-3 mt-4 pt-4 border-t border-gray-200/20">
                            <button
                              onClick={() => setShowSettings(false)}
                              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all hover:scale-105 ${
                                isDark 
                                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                              }`}
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSavePreferences}
                              className="px-6 py-2 rounded-xl text-sm font-medium bg-amber-500 text-white shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-all hover:scale-105 flex items-center gap-2"
                            >
                              <Check className="w-4 h-4" />
                              Save Preferences
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Footer */}
                  <div className={`mt-3 pt-3 border-t flex flex-wrap items-center justify-between gap-2 ${
                    isDark ? 'border-gray-800' : 'border-gray-200'
                  }`}>
                    <div className="flex items-center gap-4 text-xs">
                      <button
                        onClick={() => {
                          // Show privacy policy
                          window.open('/privacy', '_blank')
                        }}
                        className={`flex items-center gap-1 ${
                          isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                        } transition-colors`}
                      >
                        <Shield className="w-3 h-3" />
                        Privacy Policy
                      </button>
                      <button
                        onClick={() => {
                          // Show cookie policy
                          window.open('/cookies', '_blank')
                        }}
                        className={`flex items-center gap-1 ${
                          isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'
                        } transition-colors`}
                      >
                        <Info className="w-3 h-3" />
                        Cookie Policy
                      </button>
                    </div>
                    <div className={`text-[10px] ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      <Lock className="w-3 h-3 inline mr-1" />
                      Your data is secure
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default CookieConsent
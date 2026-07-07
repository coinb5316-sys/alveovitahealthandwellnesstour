// src/components/auth/Login.jsx
import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useToast } from '../../hooks/useToast'
import { 
  Mail, Lock, Eye, EyeOff, ArrowRight, 
  AlertCircle, Fingerprint,
  Shield, User, Copy, Sparkles,
  ChevronRight, ChevronLeft
} from 'lucide-react'
import Navbar from '../common/Navbar'
import Footer from '../common/Footer'
import AuthBackground from './AuthBackground'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showDemoAccounts, setShowDemoAccounts] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const { login, googleLogin, getDemoAccounts } = useAuth()
  const { isDark } = useTheme()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const emailInputRef = useRef(null)
  const passwordInputRef = useRef(null)

  const demoAccounts = getDemoAccounts?.() || []

  useEffect(() => {
    emailInputRef.current?.focus()
  }, [])

  const redirectBasedOnRole = (user) => {
    if (user?.role === 'admin') {
      navigate('/admin')
    } else {
      navigate('/dashboard')
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const result = await login(email, password)
      if (result.success) {
        showToast('Welcome back! 🎉', 'success')
        redirectBasedOnRole(result.user)
      } else {
        setError(result.error || 'Login failed. Please try again.')
        showToast('Login failed. Please try again.', 'error')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      showToast('An unexpected error occurred.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true)
    try {
      const result = await googleLogin(credentialResponse)
      if (result.success) {
        showToast('Welcome! 🎉', 'success')
        navigate('/dashboard')
      } else {
        setError(result.error || 'Google login failed.')
        showToast('Google login failed.', 'error')
      }
    } catch (err) {
      setError('An unexpected error occurred.')
      showToast('An unexpected error occurred.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleError = () => {
    setError('Google login failed. Please try again.')
    showToast('Google login failed.', 'error')
  }

  const fillDemoAccount = (demoEmail, demoPassword, role) => {
    setEmail(demoEmail)
    setPassword(demoPassword)
    setShowDemoAccounts(false)
    showToast(`Demo account loaded: ${demoEmail}`, 'info')
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-white'} relative overflow-hidden`}>
      <Navbar />
      
      <AuthBackground />

      <div className="min-h-screen flex items-center justify-center py-20 px-4 relative z-10">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, type: 'spring' }}
            className={`p-8 rounded-3xl ${
              isDark 
                ? 'bg-gray-900/90 backdrop-blur-xl border border-gray-800' 
                : 'bg-white/90 backdrop-blur-xl border border-gray-100'
            } shadow-2xl relative`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Decorative elements */}
            <div className="absolute -top-3 -right-3 w-20 h-20 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full opacity-10 blur-2xl" />
            <div className="absolute -bottom-3 -left-3 w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-10 blur-2xl" />

            {/* Logo & Header */}
            <div className="text-center mb-8 relative">
              <motion.div 
                className="w-20 h-20 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-amber-500/30"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring' }}
              >
                <Fingerprint className="w-10 h-10 text-white" />
              </motion.div>
              
              <h1 className={`text-4xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Welcome Back
              </h1>
              <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Sign in to continue your wellness journey
              </p>
              
              <div className="flex items-center justify-center gap-2 mt-4">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Secure connection • 256-bit encryption
                </span>
              </div>
            </div>

            {/* Email Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-xl flex items-center gap-2 ${
                    isDark ? 'bg-red-900/30' : 'bg-red-50'
                  } border border-red-500/30`}
                >
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span className={isDark ? 'text-red-400' : 'text-red-600'}>{error}</span>
                </motion.div>
              )}

              <div className="relative group">
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'} transition-colors group-focus-within:text-amber-500`} />
                  <input
                    ref={emailInputRef}
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-12 pr-4 py-3 rounded-xl outline-none transition-all ${
                      isDark 
                        ? 'bg-gray-800 text-white border-gray-700 focus:border-amber-500' 
                        : 'bg-gray-50 text-gray-800 border-gray-200 focus:border-amber-500'
                    } border focus:ring-2 focus:ring-amber-500/20`}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="relative group">
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Password
                </label>
                <div className="relative">
                  <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'} transition-colors group-focus-within:text-amber-500`} />
                  <input
                    ref={passwordInputRef}
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-12 pr-12 py-3 rounded-xl outline-none transition-all ${
                      isDark 
                        ? 'bg-gray-800 text-white border-gray-700 focus:border-amber-500' 
                        : 'bg-gray-50 text-gray-800 border-gray-200 focus:border-amber-500'
                    } border focus:ring-2 focus:ring-amber-500/20`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${
                      isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
                    } transition-colors`}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                  />
                  <span className={`text-sm ${isDark ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-600 group-hover:text-gray-800'} transition-colors`}>
                    Remember me
                  </span>
                </label>
                <Link to="/forgot-password" className="text-sm text-amber-500 hover:text-amber-600 transition-colors flex items-center gap-1">
  Forgot password?
  <ChevronRight className="w-3 h-3" />
</Link>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden group"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className={`absolute inset-0 flex items-center ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-4 ${isDark ? 'bg-gray-900 text-gray-400' : 'bg-white text-gray-500'}`}>
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Login - Only Social Option */}
            <div className="w-full overflow-hidden rounded-xl">
<GoogleLogin
  onSuccess={handleGoogleSuccess}
  onError={handleGoogleError}
  theme={isDark ? 'filled_black' : 'outline'}
  size="large"
  width="100%"
  text="signin_with"
  shape="pill"
  // Add these props to fix issues
  useOneTap={false}
  context="signin"
/>
            </div>

            {/* Demo Accounts */}
            <div className="mt-6">
              <button
                onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                className="w-full px-4 py-2.5 rounded-xl border-2 border-dashed border-amber-500/50 text-amber-500 hover:bg-amber-500/10 transition-all flex items-center justify-center gap-2 text-sm font-medium"
              >
                <Sparkles className="w-4 h-4" />
                {showDemoAccounts ? 'Hide Demo Accounts' : '🚀 Try Demo Accounts'}
              </button>

              <AnimatePresence>
                {showDemoAccounts && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-3 space-y-2 overflow-hidden"
                  >
                    <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'} text-center`}>
                      Click to auto-fill demo credentials
                    </p>
                    {demoAccounts.map((account, index) => (
                      <motion.button
                        key={account.email}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        onClick={() => fillDemoAccount(account.email, account.password, account.role)}
                        className={`w-full p-3 rounded-xl text-left transition-all hover:scale-[1.02] flex items-center justify-between ${
                          isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-50 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {account.role === 'admin' ? (
                            <Shield className="w-5 h-5 text-purple-500" />
                          ) : (
                            <User className="w-5 h-5 text-blue-500" />
                          )}
                          <div>
                            <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                              {account.name}
                            </div>
                            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {account.email}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            account.role === 'admin' 
                              ? 'bg-purple-500/20 text-purple-500' 
                              : 'bg-blue-500/20 text-blue-500'
                          }`}>
                            {account.role}
                          </span>
                          <Copy className="w-4 h-4 text-amber-400" />
                        </div>
                      </motion.button>
                    ))}
                    <div className={`text-xs text-center ${isDark ? 'text-gray-500' : 'text-gray-400'} mt-2`}>
                      <span className="font-medium">Demo Passwords:</span> user: password123 | admin: admin123
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className={`mt-6 p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2 text-xs">
                <Shield className="w-4 h-4 text-amber-500 flex-shrink-0" />
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  <span className="font-medium">🔐 Secure Login:</span> Your data is encrypted and protected
                </span>
              </div>
            </div>

            <p className={`text-center mt-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Don't have an account?{' '}
              <Link to="/register" className="text-amber-500 hover:text-amber-600 font-medium transition-colors group">
                Create one now
                <ArrowRight className="w-3 h-3 inline ml-1 group-hover:translate-x-1 transition-transform" />
              </Link>
            </p>
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Login
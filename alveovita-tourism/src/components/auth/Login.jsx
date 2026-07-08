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
  Shield, User, Sparkles,
  ChevronRight, ChevronLeft, Loader2
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
  const [isHovered, setIsHovered] = useState(false)
  const { login, googleLogin } = useAuth()
  const { isDark } = useTheme()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const emailInputRef = useRef(null)
  const passwordInputRef = useRef(null)

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

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-white'} relative overflow-hidden`}>
      <Navbar />
      
      <AuthBackground />

      <div className="min-h-screen flex items-center justify-center py-16 sm:py-20 px-3 sm:px-4 relative z-10">
        <div className="w-full max-w-md">
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.6, type: 'spring' }}
            className={`p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl ${
              isDark 
                ? 'bg-gray-900/90 backdrop-blur-xl border border-gray-800' 
                : 'bg-white/90 backdrop-blur-xl border border-gray-100'
            } shadow-2xl relative`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {/* Decorative elements */}
            <div className="absolute -top-3 -right-3 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full opacity-10 blur-2xl" />
            <div className="absolute -bottom-3 -left-3 w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-10 blur-2xl" />

            {/* Logo & Header */}
            <div className="text-center mb-6 sm:mb-8">
              <motion.div 
                className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-2xl shadow-amber-500/30"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring' }}
              >
                <Fingerprint className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
              </motion.div>
              
              <h1 className={`text-2xl sm:text-3xl md:text-4xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Welcome Back
              </h1>
              <p className={`mt-1 sm:mt-2 text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Sign in to continue your wellness journey
              </p>
              
              <div className="flex items-center justify-center gap-1.5 sm:gap-2 mt-3 sm:mt-4">
                <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse" />
                <span className={`text-[10px] sm:text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Secure connection • 256-bit encryption
                </span>
              </div>
            </div>

            {/* Email Login Form */}
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-3 sm:p-4 rounded-xl flex items-center gap-2 ${
                    isDark ? 'bg-red-900/30' : 'bg-red-50'
                  } border border-red-500/30`}
                >
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
                  <span className={`text-xs sm:text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</span>
                </motion.div>
              )}

              <div className="relative group">
                <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail className={`absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'} transition-colors group-focus-within:text-amber-500`} />
                  <input
                    ref={emailInputRef}
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl outline-none transition-all text-sm sm:text-base ${
                      isDark 
                        ? 'bg-gray-800 text-white border-gray-700 focus:border-amber-500' 
                        : 'bg-gray-50 text-gray-800 border-gray-200 focus:border-amber-500'
                    } border focus:ring-2 focus:ring-amber-500/20`}
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div className="relative group">
                <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Password
                </label>
                <div className="relative">
                  <Lock className={`absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'} transition-colors group-focus-within:text-amber-500`} />
                  <input
                    ref={passwordInputRef}
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-9 sm:pl-12 pr-9 sm:pr-12 py-2.5 sm:py-3 rounded-xl outline-none transition-all text-sm sm:text-base ${
                      isDark 
                        ? 'bg-gray-800 text-white border-gray-700 focus:border-amber-500' 
                        : 'bg-gray-50 text-gray-800 border-gray-200 focus:border-amber-500'
                    } border focus:ring-2 focus:ring-amber-500/20`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 ${
                      isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
                    } transition-colors`}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                  />
                  <span className={`text-xs sm:text-sm ${isDark ? 'text-gray-400 group-hover:text-gray-300' : 'text-gray-600 group-hover:text-gray-800'} transition-colors`}>
                    Remember me
                  </span>
                </label>
                <Link to="/forgot-password" className="text-xs sm:text-sm text-amber-500 hover:text-amber-600 transition-colors flex items-center gap-1">
                  Forgot password?
                  <ChevronRight className="w-3 h-3" />
                </Link>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium transition-all shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden text-sm sm:text-base"
              >
                <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Divider */}
            <div className="relative my-5 sm:my-6">
              <div className={`absolute inset-0 flex items-center ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                <div className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs sm:text-sm">
                <span className={`px-3 sm:px-4 ${isDark ? 'bg-gray-900 text-gray-400' : 'bg-white text-gray-500'}`}>
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
                useOneTap={false}
                context="signin"
              />
            </div>

            {/* Security Notice */}
            <div className={`mt-5 sm:mt-6 p-3 sm:p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-start gap-2 text-[10px] sm:text-xs">
                <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                  <span className="font-medium">🔐 Secure Login:</span> Your data is encrypted and protected with industry-standard security.
                </span>
              </div>
            </div>

            <p className={`text-center mt-5 sm:mt-6 text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
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
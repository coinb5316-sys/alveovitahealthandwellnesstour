// src/pages/ResetPassword.jsx
import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { useToast } from '../hooks/useToast'
import API from '../api/axios'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import AuthBackground from '../components/auth/AuthBackground'
import { 
  Lock, Eye, EyeOff, ArrowRight, CheckCircle,
  AlertCircle, Fingerprint, Shield, ArrowLeft,
  Sparkles, Key
} from 'lucide-react'

const ResetPassword = () => {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)
  const [isValidToken, setIsValidToken] = useState(true)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  })
  
  const { isDark } = useTheme()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const passwordInputRef = useRef(null)

  useEffect(() => {
    // Check if token exists
    if (!token) {
      setIsValidToken(false)
      setError('No reset token provided')
      return
    }
    passwordInputRef.current?.focus()
  }, [token])

  useEffect(() => {
    const pwd = password
    const checks = {
      length: pwd.length >= 8,
      uppercase: /[A-Z]/.test(pwd),
      lowercase: /[a-z]/.test(pwd),
      number: /[0-9]/.test(pwd),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(pwd)
    }
    setPasswordChecks(checks)
    const strength = Object.values(checks).filter(Boolean).length
    setPasswordStrength(strength)
  }, [password])

  const getPasswordStrengthLabel = () => {
    const labels = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong']
    const colors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-blue-500', 'bg-green-500']
    return {
      label: labels[passwordStrength] || 'Very Weak',
      color: colors[passwordStrength] || 'bg-red-500',
      width: `${(passwordStrength / 5) * 100}%`
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      showToast('Passwords do not match', 'error')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      showToast('Password must be at least 8 characters', 'error')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await API.post('/auth/reset-password', {
        token,
        password
      })
      
      if (response.data.success) {
        setSubmitted(true)
        showToast('Password reset successfully! 🎉', 'success')
        
        setTimeout(() => {
          navigate('/login')
        }, 3000)
      } else {
        setError(response.data.message || 'Failed to reset password')
        showToast('Failed to reset password', 'error')
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to reset password'
      setError(errorMessage)
      showToast('Failed to reset password', 'error')
    } finally {
      setLoading(false)
    }
  }

  if (!isValidToken) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-white'} relative overflow-hidden`}>
        <Navbar />
        <AuthBackground />
        <div className="min-h-screen flex items-center justify-center py-20 px-4 relative z-10">
          <div className="w-full max-w-md">
            <div className={`p-8 rounded-3xl ${isDark ? 'bg-gray-900/90' : 'bg-white/90'} shadow-2xl text-center`}>
              <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-10 h-10 text-red-500" />
              </div>
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Invalid Reset Link
              </h2>
              <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                The password reset link is invalid or has expired.
              </p>
              <Link to="/forgot-password">
                <button className="mt-6 px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:scale-105 transition-all flex items-center justify-center gap-2 mx-auto">
                  <ArrowLeft className="w-5 h-5" />
                  Request New Link
                </button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    )
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
          >
            <div className="absolute -top-3 -right-3 w-20 h-20 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full opacity-10 blur-2xl" />
            <div className="absolute -bottom-3 -left-3 w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-10 blur-2xl" />

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-green-500/30">
                  <CheckCircle className="w-12 h-12 text-white" />
                </div>
                <h2 className={`text-3xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Password Reset! 🎉
                </h2>
                <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Your password has been reset successfully.
                </p>
                <p className={`mt-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Redirecting to login...
                </p>
                <Link to="/login">
                  <button className="mt-6 px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:scale-105 transition-all">
                    Go to Login
                  </button>
                </Link>
              </motion.div>
            ) : (
              <>
                <div className="text-center mb-8">
                  <motion.div 
                    className="w-20 h-20 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-amber-500/30"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring' }}
                  >
                    <Key className="w-10 h-10 text-white" />
                  </motion.div>
                  
                  <h1 className={`text-4xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Set New Password
                  </h1>
                  <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Create a new strong password for your account
                  </p>
                </div>

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
                      New Password *
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
                        placeholder="Create a strong password"
                        minLength={8}
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

                  {/* Password Strength */}
                  {password.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Password Strength
                        </span>
                        <span className={`text-xs font-medium ${
                          passwordStrength >= 4 ? 'text-green-500' :
                          passwordStrength >= 3 ? 'text-blue-500' :
                          passwordStrength >= 2 ? 'text-yellow-500' :
                          'text-red-500'
                        }`}>
                          {getPasswordStrengthLabel().label}
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-500 ${getPasswordStrengthLabel().color}`}
                          style={{ width: getPasswordStrengthLabel().width }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-1">
                        {Object.entries(passwordChecks).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-1.5 text-xs">
                            {value ? (
                              <CheckCircle className="w-3 h-3 text-green-500" />
                            ) : (
                              <AlertCircle className="w-3 h-3 text-gray-400" />
                            )}
                            <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                              {key === 'length' && '8+ characters'}
                              {key === 'uppercase' && 'Uppercase'}
                              {key === 'lowercase' && 'Lowercase'}
                              {key === 'number' && 'Number'}
                              {key === 'special' && 'Special char'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="relative group">
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Confirm Password *
                    </label>
                    <div className="relative">
                      <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'} transition-colors group-focus-within:text-amber-500`} />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full pl-12 pr-12 py-3 rounded-xl outline-none transition-all ${
                          isDark 
                            ? 'bg-gray-800 text-white border-gray-700 focus:border-amber-500' 
                            : 'bg-gray-50 text-gray-800 border-gray-200 focus:border-amber-500'
                        } border focus:ring-2 focus:ring-amber-500/20`}
                        placeholder="Confirm your new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className={`absolute right-4 top-1/2 transform -translate-y-1/2 ${
                          isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
                        } transition-colors`}
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {confirmPassword && password !== confirmPassword && (
                    <div className={`p-3 rounded-xl flex items-center gap-2 ${
                      isDark ? 'bg-red-900/20' : 'bg-red-50'
                    }`}>
                      <AlertCircle className="w-4 h-4 text-red-500" />
                      <span className={`text-xs ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                        Passwords do not match
                      </span>
                    </div>
                  )}

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
                        Resetting Password...
                      </>
                    ) : (
                      <>
                        <span>Reset Password</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </motion.button>

                  <div className={`mt-4 p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <div className="flex items-center gap-2 text-xs">
                      <Shield className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                        <span className="font-medium">🔐 Secure:</span> Your new password is encrypted
                      </span>
                    </div>
                  </div>

                  <p className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Remember your password?{' '}
                    <Link to="/login" className="text-amber-500 hover:text-amber-600 font-medium transition-colors group">
                      Sign in
                      <ArrowRight className="w-3 h-3 inline ml-1 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </p>
                </form>
              </>
            )}
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default ResetPassword
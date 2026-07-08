// src/components/auth/Register.jsx
import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { GoogleLogin } from '@react-oauth/google'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { useToast } from '../../hooks/useToast'
import { 
  User, Mail, Lock, Eye, EyeOff, ArrowRight,
  CheckCircle, AlertCircle, Phone, MapPin,
  Shield, Sparkles, 
  ChevronRight, ChevronLeft, Fingerprint, Loader2
} from 'lucide-react'
import Navbar from '../common/Navbar'
import Footer from '../common/Footer'
import AuthBackground from './AuthBackground'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [currentStep, setCurrentStep] = useState(1)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [passwordChecks, setPasswordChecks] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    special: false
  })
  const [isHovered, setIsHovered] = useState(false)
  const [focusedField, setFocusedField] = useState(null)
  const { register, googleLogin } = useAuth()
  const { isDark } = useTheme()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const nameInputRef = useRef(null)

  useEffect(() => {
    nameInputRef.current?.focus()
  }, [])

  useEffect(() => {
    const pwd = formData.password
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
  }, [formData.password])

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
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      showToast('Passwords do not match', 'error')
      return
    }

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long')
      showToast('Password must be at least 8 characters', 'error')
      return
    }

    if (!agreeTerms) {
      setError('Please agree to the terms and conditions')
      showToast('Please agree to the terms', 'error')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const result = await register(formData)
      if (result.success) {
        setSuccess(true)
        showToast('Account created successfully! 🎉', 'success')
        setTimeout(() => navigate('/dashboard'), 2000)
      } else {
        setError(result.error || 'Registration failed. Please try again.')
        showToast('Registration failed', 'error')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      showToast('An unexpected error occurred', 'error')
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
        setError(result.error || 'Google signup failed.')
        showToast('Google signup failed.', 'error')
      }
    } catch (err) {
      setError('An unexpected error occurred.')
      showToast('An unexpected error occurred.', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleError = () => {
    setError('Google signup failed. Please try again.')
    showToast('Google signup failed.', 'error')
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

            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-6 sm:py-8"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-2xl shadow-green-500/30">
                  <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
                </div>
                <h2 className={`text-2xl sm:text-3xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Account Created! 🎉
                </h2>
                <p className={`mt-1 sm:mt-2 text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Welcome to Alveovita Wellness Community
                </p>
                <div className="mt-4 sm:mt-6 flex items-center justify-center gap-2 text-sm text-amber-500">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Redirecting to dashboard...
                </div>
              </motion.div>
            ) : (
              <>
                {/* Header */}
                <div className="text-center mb-6 sm:mb-8">
                  <motion.div 
                    className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-2xl shadow-amber-500/30"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    transition={{ type: 'spring' }}
                  >
                    <Fingerprint className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                  </motion.div>
                  
                  <h1 className={`text-2xl sm:text-3xl md:text-4xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Create Account
                  </h1>
                  <p className={`mt-1 sm:mt-2 text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Start your wellness journey with us
                  </p>
                </div>

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

                  {/* Step Indicator */}
                  <div className="flex items-center gap-2 mb-4 sm:mb-6">
                    {[1, 2].map((step) => (
                      <div key={step} className="flex-1 flex items-center gap-2">
                        <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold ${
                          currentStep >= step 
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white' 
                            : isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'
                        }`}>
                          {step}
                        </div>
                        {step < 2 && (
                          <div className={`flex-1 h-0.5 ${currentStep > step ? 'bg-amber-500' : isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
                        )}
                      </div>
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    {currentStep === 1 && (
                      <motion.div
                        key="step1"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-3 sm:space-y-4"
                      >
                        <div className="relative group">
                          <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Full Name *
                          </label>
                          <div className="relative">
                            <User className={`absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'} transition-colors group-focus-within:text-amber-500`} />
                            <input
                              ref={nameInputRef}
                              type="text"
                              required
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              onFocus={() => setFocusedField('name')}
                              onBlur={() => setFocusedField(null)}
                              className={`w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl outline-none transition-all text-sm sm:text-base ${
                                isDark 
                                  ? 'bg-gray-800 text-white border-gray-700 focus:border-amber-500' 
                                  : 'bg-gray-50 text-gray-800 border-gray-200 focus:border-amber-500'
                              } border focus:ring-2 focus:ring-amber-500/20`}
                              placeholder="John Doe"
                            />
                          </div>
                        </div>

                        <div className="relative group">
                          <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Email Address *
                          </label>
                          <div className="relative">
                            <Mail className={`absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'} transition-colors group-focus-within:text-amber-500`} />
                            <input
                              type="email"
                              required
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              onFocus={() => setFocusedField('email')}
                              onBlur={() => setFocusedField(null)}
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
                            Phone Number
                          </label>
                          <div className="relative">
                            <Phone className={`absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'} transition-colors group-focus-within:text-amber-500`} />
                            <input
                              type="tel"
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              onFocus={() => setFocusedField('phone')}
                              onBlur={() => setFocusedField(null)}
                              className={`w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl outline-none transition-all text-sm sm:text-base ${
                                isDark 
                                  ? 'bg-gray-800 text-white border-gray-700 focus:border-amber-500' 
                                  : 'bg-gray-50 text-gray-800 border-gray-200 focus:border-amber-500'
                              } border focus:ring-2 focus:ring-amber-500/20`}
                              placeholder="+233 55 123 4567"
                            />
                          </div>
                        </div>

                        <div className="relative group">
                          <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Location
                          </label>
                          <div className="relative">
                            <MapPin className={`absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'} transition-colors group-focus-within:text-amber-500`} />
                            <input
                              type="text"
                              value={formData.location}
                              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                              onFocus={() => setFocusedField('location')}
                              onBlur={() => setFocusedField(null)}
                              className={`w-full pl-9 sm:pl-12 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl outline-none transition-all text-sm sm:text-base ${
                                isDark 
                                  ? 'bg-gray-800 text-white border-gray-700 focus:border-amber-500' 
                                  : 'bg-gray-50 text-gray-800 border-gray-200 focus:border-amber-500'
                              } border focus:ring-2 focus:ring-amber-500/20`}
                              placeholder="Accra, Ghana"
                            />
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setCurrentStep(2)}
                          className="w-full px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:scale-105 transition-all shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 text-sm sm:text-base"
                        >
                          Continue
                          <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </motion.div>
                    )}

                    {currentStep === 2 && (
                      <motion.div
                        key="step2"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                        className="space-y-3 sm:space-y-4"
                      >
                        <div className="relative group">
                          <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Password *
                          </label>
                          <div className="relative">
                            <Lock className={`absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'} transition-colors group-focus-within:text-amber-500`} />
                            <input
                              type={showPassword ? 'text' : 'password'}
                              required
                              value={formData.password}
                              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                              onFocus={() => setFocusedField('password')}
                              onBlur={() => setFocusedField(null)}
                              className={`w-full pl-9 sm:pl-12 pr-9 sm:pr-12 py-2.5 sm:py-3 rounded-xl outline-none transition-all text-sm sm:text-base ${
                                isDark 
                                  ? 'bg-gray-800 text-white border-gray-700 focus:border-amber-500' 
                                  : 'bg-gray-50 text-gray-800 border-gray-200 focus:border-amber-500'
                              } border focus:ring-2 focus:ring-amber-500/20`}
                              placeholder="Min 8 characters"
                              minLength={8}
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

                        {/* Password Strength */}
                        {formData.password.length > 0 && (
                          <div className="space-y-1.5 sm:space-y-2">
                            <div className="flex items-center justify-between">
                              <span className={`text-[10px] sm:text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                Password Strength
                              </span>
                              <span className={`text-[10px] sm:text-xs font-medium ${
                                passwordStrength >= 4 ? 'text-green-500' :
                                passwordStrength >= 3 ? 'text-blue-500' :
                                passwordStrength >= 2 ? 'text-yellow-500' :
                                'text-red-500'
                              }`}>
                                {getPasswordStrengthLabel().label}
                              </span>
                            </div>
                            <div className="w-full h-1 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all duration-500 ${getPasswordStrengthLabel().color}`}
                                style={{ width: getPasswordStrengthLabel().width }}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-1">
                              {Object.entries(passwordChecks).map(([key, value]) => (
                                <div key={key} className="flex items-center gap-1 text-[10px] sm:text-xs">
                                  {value ? (
                                    <CheckCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-green-500" />
                                  ) : (
                                    <AlertCircle className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-400" />
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
                          <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            Confirm Password *
                          </label>
                          <div className="relative">
                            <Lock className={`absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'} transition-colors group-focus-within:text-amber-500`} />
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              required
                              value={formData.confirmPassword}
                              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                              onFocus={() => setFocusedField('confirmPassword')}
                              onBlur={() => setFocusedField(null)}
                              className={`w-full pl-9 sm:pl-12 pr-9 sm:pr-12 py-2.5 sm:py-3 rounded-xl outline-none transition-all text-sm sm:text-base ${
                                isDark 
                                  ? 'bg-gray-800 text-white border-gray-700 focus:border-amber-500' 
                                  : 'bg-gray-50 text-gray-800 border-gray-200 focus:border-amber-500'
                              } border focus:ring-2 focus:ring-amber-500/20`}
                              placeholder="Confirm your password"
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                              className={`absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 ${
                                isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'
                              } transition-colors`}
                            >
                              {showConfirmPassword ? <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" /> : <Eye className="w-4 h-4 sm:w-5 sm:h-5" />}
                            </button>
                          </div>
                        </div>

                        {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                          <div className={`p-2.5 sm:p-3 rounded-xl flex items-center gap-2 ${
                            isDark ? 'bg-red-900/20' : 'bg-red-50'
                          }`}>
                            <AlertCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
                            <span className={`text-[10px] sm:text-xs ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                              Passwords do not match
                            </span>
                          </div>
                        )}

                        <div className="flex items-start gap-2">
                          <input
                            type="checkbox"
                            checked={agreeTerms}
                            onChange={(e) => setAgreeTerms(e.target.checked)}
                            className="w-3.5 h-3.5 sm:w-4 sm:h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500 mt-0.5"
                            required
                          />
                          <span className={`text-[10px] sm:text-xs md:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            I agree to the{' '}
                            <Link to="/terms" className="text-amber-500 hover:text-amber-600 transition-colors">
                              Terms of Service
                            </Link>
                            {' '}and{' '}
                            <Link to="/privacy" className="text-amber-500 hover:text-amber-600 transition-colors">
                              Privacy Policy
                            </Link>
                          </span>
                        </div>

                        <div className="flex gap-2 sm:gap-3">
                          <button
                            type="button"
                            onClick={() => setCurrentStep(1)}
                            className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium transition-all hover:scale-105 text-sm sm:text-base ${
                              isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                          <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 sm:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:scale-105 transition-all shadow-lg shadow-amber-500/30 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 relative overflow-hidden text-sm sm:text-base"
                          >
                            <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                            {loading ? (
                              <>
                                <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                                Creating Account...
                              </>
                            ) : (
                              <>
                                <span>Create Account</span>
                                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
                              </>
                            )}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
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

                {/* Google Signup - Only Social Option */}
                <div className="w-full overflow-hidden rounded-xl">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    theme={isDark ? 'filled_black' : 'outline'}
                    size="large"
                    width="100%"
                    text="signup_with"
                    shape="pill"
                    useOneTap={false}
                    context="signup"
                  />
                </div>

                {/* Login Link */}
                <p className={`text-center mt-5 sm:mt-6 text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Already have an account?{' '}
                  <Link to="/login" className="text-amber-500 hover:text-amber-600 font-medium transition-colors group">
                    Sign in
                    <ArrowRight className="w-3 h-3 inline ml-1 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </p>

                <div className={`mt-4 sm:mt-6 p-3 sm:p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <div className="flex items-start gap-2 text-[10px] sm:text-xs">
                    <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                      <span className="font-medium">🔐 Secure Registration:</span> Your data is encrypted and protected with industry-standard security.
                    </span>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Register
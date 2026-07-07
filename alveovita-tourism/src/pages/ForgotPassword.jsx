// src/pages/ForgotPassword.jsx
import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { useToast } from '../hooks/useToast'
import API from '../api/axios'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import AuthBackground from '../components/auth/AuthBackground'
import { 
  Mail, ArrowRight, AlertCircle, CheckCircle, 
  Fingerprint, Shield, ArrowLeft, Sparkles
} from 'lucide-react'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const { isDark } = useTheme()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const emailInputRef = useRef(null)

  useEffect(() => {
    emailInputRef.current?.focus()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const response = await API.post('/auth/forgot-password', { email })
      
      if (response.data.success) {
        setSubmitted(true)
        setSuccessMessage(response.data.message || 'Password reset link sent!')
        showToast('Check your email for reset instructions 📧', 'success')
        
        // Auto redirect after 5 seconds
        setTimeout(() => {
          navigate('/login')
        }, 5000)
      } else {
        setError(response.data.message || 'Something went wrong')
        showToast('Failed to send reset link', 'error')
      }
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Failed to send reset link'
      setError(errorMessage)
      showToast('Failed to send reset link', 'error')
    } finally {
      setLoading(false)
    }
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
            {/* Decorative elements */}
            <div className="absolute -top-3 -right-3 w-20 h-20 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full opacity-10 blur-2xl" />
            <div className="absolute -bottom-3 -left-3 w-20 h-20 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full opacity-10 blur-2xl" />

            {/* Logo & Header */}
            <div className="text-center mb-8">
              <motion.div 
                className="w-20 h-20 bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-amber-500/30"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: 'spring' }}
              >
                <Fingerprint className="w-10 h-10 text-white" />
              </motion.div>
              
              <h1 className={`text-4xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {submitted ? 'Check Your Email' : 'Forgot Password'}
              </h1>
              <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {submitted 
                  ? `We've sent a reset link to ${email}`
                  : 'Enter your email to receive a reset link'
                }
              </p>
            </div>

            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className={`p-6 rounded-2xl ${isDark ? 'bg-green-900/30' : 'bg-green-50'} border border-green-500/30 text-center`}>
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Email Sent! 📧
                  </h3>
                  <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    We've sent a password reset link to <br />
                    <span className="font-medium text-amber-500">{email}</span>
                  </p>
                  <p className={`mt-2 text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Please check your inbox and spam folder.
                    The link will expire in 1 hour.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  <Link to="/login">
                    <button className="w-full px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:scale-105 transition-all shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2">
                      <ArrowLeft className="w-5 h-5" />
                      Back to Login
                    </button>
                  </Link>
                  <button
                    onClick={() => {
                      setSubmitted(false)
                      setEmail('')
                    }}
                    className={`px-8 py-3 rounded-xl font-medium transition-all hover:scale-105 ${
                      isDark 
                        ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                    }`}
                  >
                    Try another email
                  </button>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
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
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Enter the email address associated with your account
                  </p>
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
                      Sending...
                    </>
                  ) : (
                    <>
                      <span>Send Reset Link</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </motion.button>

                <div className={`mt-4 p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-2 text-xs">
                    <Shield className="w-4 h-4 text-amber-500 flex-shrink-0" />
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                      <span className="font-medium">🔐 Secure:</span> Your information is encrypted
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
            )}
          </motion.div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default ForgotPassword
// src/pages/Feedback.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import { 
  Star, Send, User, Mail, MessageSquare, MessageCircle,
  CheckCircle, AlertCircle, ArrowRight,
  ThumbsUp, ThumbsDown, Smile, Frown,
  Heart, Award, Shield, Users, Clock,
  Sparkles, Gift, Crown, Gem,
  Camera, Image, Upload, X,
  Phone, MapPin, Calendar, Globe,
  Compass
} from 'lucide-react'

const Feedback = () => {
  const { isDark } = useTheme()
  const { user } = useAuth()
  const { showToast } = useToast()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    category: 'general',
    subject: '',
    message: '',
    experience: '',
    suggestions: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const categories = [
    { id: 'general', label: 'General Feedback', icon: Star },
    { id: 'booking', label: 'Booking Experience', icon: Calendar },
    { id: 'tour', label: 'Tour Experience', icon: Compass },
    { id: 'wellness', label: 'Wellness Program', icon: Heart },
    { id: 'website', label: 'Website', icon: Globe },
    { id: 'support', label: 'Customer Support', icon: Users },
  ]

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (rating === 0) {
      setError('Please rate your experience')
      setLoading(false)
      return
    }

    if (!formData.name || !formData.email || !formData.message) {
      setError('Please fill in all required fields')
      setLoading(false)
      return
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      setSubmitted(true)
      showToast('Thank you for your feedback! 🎉', 'success')
      
      setTimeout(() => {
        setSubmitted(false)
        setRating(0)
        setFormData({
          name: user?.name || '',
          email: user?.email || '',
          category: 'general',
          subject: '',
          message: '',
          experience: '',
          suggestions: ''
        })
      }, 3000)
    } catch (err) {
      setError('Failed to submit feedback. Please try again.')
      showToast('Failed to submit feedback', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleStarClick = (value) => {
    setRating(value)
  }

  const handleStarHover = (value) => {
    setHoverRating(value)
  }

  const handleStarLeave = () => {
    setHoverRating(0)
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
      <Navbar />

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1920&q=80)'
        }}>
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-transparent" />
        </div>
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl"
          >
            <span className="text-amber-400 font-semibold text-sm uppercase tracking-wider flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Feedback
            </span>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-white mt-4 leading-tight">
              We Value Your <span className="text-amber-400">Feedback</span>
            </h1>
            <p className="text-xl text-gray-300 mt-4 leading-relaxed">
              Help us improve our services by sharing your experience. Your feedback is invaluable to us.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Feedback Form */}
      <section className={`py-24 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container-custom">
          <div className="max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className={`p-8 rounded-3xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl`}
            >
              {submitted ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle className="w-12 h-12 text-white" />
                  </div>
                  <h3 className={`text-2xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Thank You! 🎉
                  </h3>
                  <p className={`mt-2 max-w-md mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Your feedback has been submitted successfully. We appreciate you taking the time to help us improve.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className={`p-4 rounded-xl flex items-center gap-2 ${
                      isDark ? 'bg-red-900/30' : 'bg-red-50'
                    } border border-red-500/30`}>
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <span className={isDark ? 'text-red-400' : 'text-red-600'}>{error}</span>
                    </div>
                  )}

                  {/* Rating */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      How would you rate your experience? *
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => handleStarClick(value)}
                          onMouseEnter={() => handleStarHover(value)}
                          onMouseLeave={handleStarLeave}
                          className="transition-all hover:scale-110"
                        >
                          <Star className={`w-10 h-10 ${
                            value <= (hoverRating || rating)
                              ? 'fill-amber-400 text-amber-400'
                              : isDark ? 'text-gray-600' : 'text-gray-300'
                          } transition-colors`} />
                        </button>
                      ))}
                      <span className={`ml-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {rating > 0 ? `${rating}/5` : 'Click to rate'}
                      </span>
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Category
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {categories.map((category) => (
                        <button
                          key={category.id}
                          type="button"
                          onClick={() => setFormData({ ...formData, category: category.id })}
                          className={`px-3 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                            formData.category === category.id
                              ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                              : isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          <category.icon className="w-4 h-4" />
                          {category.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Name & Email */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Full Name *
                      </label>
                      <div className="relative">
                        <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className={`w-full pl-10 pr-4 py-3 rounded-xl outline-none ${
                            isDark 
                              ? 'bg-gray-700 text-white border-gray-600' 
                              : 'bg-gray-50 text-gray-800 border-gray-200'
                          } border focus:border-amber-500 transition-colors`}
                          placeholder="John Doe"
                        />
                      </div>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Email Address *
                      </label>
                      <div className="relative">
                        <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className={`w-full pl-10 pr-4 py-3 rounded-xl outline-none ${
                            isDark 
                              ? 'bg-gray-700 text-white border-gray-600' 
                              : 'bg-gray-50 text-gray-800 border-gray-200'
                          } border focus:border-amber-500 transition-colors`}
                          placeholder="john@example.com"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Subject
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl outline-none ${
                        isDark 
                          ? 'bg-gray-700 text-white border-gray-600' 
                          : 'bg-gray-50 text-gray-800 border-gray-200'
                      } border focus:border-amber-500 transition-colors`}
                      placeholder="Brief subject of your feedback"
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Your Feedback *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl outline-none ${
                        isDark 
                          ? 'bg-gray-700 text-white border-gray-600' 
                          : 'bg-gray-50 text-gray-800 border-gray-200'
                      } border focus:border-amber-500 transition-colors resize-none`}
                      placeholder="Share your experience, suggestions, or any issues you encountered..."
                    />
                  </div>

                  {/* Experience */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      What did you like most?
                    </label>
                    <textarea
                      rows={2}
                      value={formData.experience}
                      onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl outline-none ${
                        isDark 
                          ? 'bg-gray-700 text-white border-gray-600' 
                          : 'bg-gray-50 text-gray-800 border-gray-200'
                      } border focus:border-amber-500 transition-colors resize-none`}
                      placeholder="Tell us what you enjoyed most about your experience..."
                    />
                  </div>

                  {/* Suggestions */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Suggestions for improvement
                    </label>
                    <textarea
                      rows={2}
                      value={formData.suggestions}
                      onChange={(e) => setFormData({ ...formData, suggestions: e.target.value })}
                      className={`w-full px-4 py-3 rounded-xl outline-none ${
                        isDark 
                          ? 'bg-gray-700 text-white border-gray-600' 
                          : 'bg-gray-50 text-gray-800 border-gray-200'
                      } border focus:border-amber-500 transition-colors resize-none`}
                      placeholder="How can we make your experience even better?"
                    />
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:scale-105 transition-all shadow-lg shadow-amber-500/30 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Submit Feedback
                      </>
                    )}
                  </button>

                  <p className={`text-xs text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Your feedback helps us improve our services and create better experiences for everyone.
                  </p>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1920&q=80)'
        }}>
          <div className="absolute inset-0 bg-gradient-to-r from-amber-900/95 to-orange-800/95" />
        </div>
        <div className="container-custom relative z-10 text-center text-white">
          <h2 className="text-3xl font-display font-bold mb-4">
            Have More to <span className="text-amber-300">Share</span>?
          </h2>
          <p className="text-lg text-gray-200 mb-6 max-w-2xl mx-auto">
            Your voice matters. Connect with us directly through our other channels.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/contact">
              <button className="px-6 py-3 bg-white text-amber-700 rounded-xl font-medium hover:bg-amber-50 transition-all shadow-xl hover:scale-105 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Contact Us
              </button>
            </Link>
            <Link to="/faq">
              <button className="px-6 py-3 border-2 border-white/30 text-white rounded-xl font-medium hover:bg-white/10 transition-all backdrop-blur-sm hover:scale-105 flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Visit FAQ
              </button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Feedback
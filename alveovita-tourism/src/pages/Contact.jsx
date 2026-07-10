// src/pages/Contact.jsx
import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast'
import axios from '../api/axios'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import LiveChat from '../components/chat/LiveChat'
import { 
  MapPin, Phone, Mail, Clock, Send, MessageSquare,
  User, CheckCircle, AlertCircle, ArrowRight,
  Globe, Building, Users, Award, Sparkles,
  ChevronRight, Headphones, Calendar, Star,
  MessageCircle, Bot, Clock as ClockIcon, 
  ThumbsUp, ThumbsDown, Smile, Paperclip,
  Mic, Video, Image as ImageIcon, Send as SendIcon,
  MoreVertical, PhoneCall, VideoIcon, InfoIcon,
  Loader2, X
} from 'lucide-react'

// Import social icons from react-icons
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaYoutube } from 'react-icons/fa'

const Contact = () => {
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const { user } = useAuth()
  const { showToast } = useToast()
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    subject: '',
    message: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [showChat, setShowChat] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      const response = await axios.post('/contact', formData)
      
      if (response.data.success) {
        setSubmitted(true)
        setFormData({ name: user?.name || '', email: user?.email || '', phone: '', subject: '', message: '' })
        showToast('Message sent successfully! We\'ll get back to you soon.', 'success')
        setTimeout(() => setSubmitted(false), 5000)
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send message. Please try again.')
      showToast('Failed to send message', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleBookConsultation = () => {
    if (user) {
      navigate('/dashboard/bookings')
    } else {
      navigate('/tours')
    }
  }

  const handleBrowseTours = () => {
    navigate('/tours')
  }

  const contactInfo = [
    {
      icon: MapPin,
      title: 'Visit Us',
      details: '123 Independence Avenue, Accra, Ghana',
      link: 'https://maps.google.com',
      color: 'from-red-500 to-pink-500'
    },
    {
      icon: Phone,
      title: 'Call Us',
      details: '+233 55 123 4567',
      link: 'tel:+233551234567',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: Mail,
      title: 'Email Us',
      details: 'info@alveovita.com',
      link: 'mailto:info@alveovita.com',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Clock,
      title: 'Working Hours',
      details: '24/7 Available - We\'re always here for you',
      color: 'from-purple-500 to-indigo-500'
    }
  ]

  const socialLinks = [
    { icon: FaFacebook, href: 'https://facebook.com', label: 'Facebook', color: 'hover:text-blue-600' },
    { icon: FaTwitter, href: 'https://twitter.com', label: 'Twitter', color: 'hover:text-sky-400' },
    { icon: FaInstagram, href: 'https://instagram.com', label: 'Instagram', color: 'hover:text-pink-500' },
    { icon: FaLinkedin, href: 'https://linkedin.com', label: 'LinkedIn', color: 'hover:text-blue-700' },
    { icon: FaYoutube, href: 'https://youtube.com', label: 'YouTube', color: 'hover:text-red-600' }
  ]

  const faqs = [
    {
      question: 'What services do you offer?',
      answer: 'We offer comprehensive wellness tourism services including medical tourism, wellness retreats, corporate wellness programs, senior wellness, student wellness, and cultural immersion experiences.'
    },
    {
      question: 'How do I book a tour?',
      answer: 'You can book a tour directly through our website by selecting your preferred tour, choosing dates, and completing the booking form. You can also contact us directly for personalized assistance.'
    },
    {
      question: 'Do you offer group discounts?',
      answer: 'Yes, we offer special rates for groups of 10 or more. Please contact us directly for group booking inquiries and customized packages.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, bank transfers, mobile money (MoMo), and Paystack for secure online payments.'
    },
    {
      question: 'Can I customize my wellness program?',
      answer: 'Absolutely! All our programs can be customized to meet your specific needs and preferences. Contact us to create your personalized wellness journey.'
    }
  ]

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
      <Navbar />

      {/* Live Chat Modal - Mobile Friendly */}
      <AnimatePresence>
        {showChat && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ type: 'spring', damping: 25 }}
              className="w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm sm:text-base text-gray-900 dark:text-white">Live Chat</h3>
                    <p className="text-[10px] sm:text-xs text-green-500">Online • Usually replies instantly</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowChat(false)}
                  className="p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                </button>
              </div>
              <div className="h-72 sm:h-80 md:h-96 p-3 sm:p-4 overflow-y-auto">
                <div className="flex flex-col gap-3 sm:gap-4">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-2.5 sm:p-3 rounded-xl rounded-tl-none max-w-[85%]">
                      <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-200">
                        Hello! Welcome to Alveovita. How can I help you today?
                      </p>
                      <span className="text-[8px] sm:text-[10px] text-gray-500 mt-1 block">Just now</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3 justify-end">
                    <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-2.5 sm:p-3 rounded-xl rounded-tr-none max-w-[85%]">
                      <p className="text-xs sm:text-sm">
                        Hi, I'd like to know more about your wellness retreats.
                      </p>
                      <span className="text-[8px] sm:text-[10px] text-amber-100 mt-1 block">Just now</span>
                    </div>
                  </div>
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                      <MessageCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                    </div>
                    <div className="bg-gray-100 dark:bg-gray-800 p-2.5 sm:p-3 rounded-xl rounded-tl-none max-w-[85%]">
                      <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-200">
                        Great! We offer a variety of wellness retreats. Would you like me to share some options with you?
                      </p>
                      <span className="text-[8px] sm:text-[10px] text-gray-500 mt-1 block">Just now</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 focus:border-amber-500 outline-none text-xs sm:text-sm text-gray-900 dark:text-white placeholder-gray-500"
                  />
                  <button className="p-2 sm:p-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:scale-105 transition-all flex-shrink-0">
                    <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Hero Section - Responsive */}
      <section className="relative min-h-[50vh] sm:min-h-[60vh] flex items-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1920&q=80)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/40" />
        </div>
        <div className="container-custom relative z-10 px-4 sm:px-6 py-12 sm:py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-3xl mx-auto text-center"
          >
            <span className="inline-flex items-center gap-2 text-amber-400 font-semibold text-xs sm:text-sm uppercase tracking-wider bg-amber-500/10 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border border-amber-500/20">
              <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              Get In Touch
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-display font-bold text-white mt-3 sm:mt-4 leading-tight">
              Let's Start Your <br className="hidden sm:inline" />
              <span className="text-amber-400">Wellness</span> Journey
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-300 mt-3 sm:mt-4 leading-relaxed max-w-2xl mx-auto">
              Have questions about our services? We're here to help you create the perfect wellness experience.
              Reach out to us and let's begin your transformation.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-5 sm:mt-6 md:mt-8">
              <button 
                onClick={handleBookConsultation}
                className="px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full font-medium hover:shadow-lg hover:shadow-amber-500/30 transition-all hover:scale-105 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                Book Consultation
              </button>
              <button 
                onClick={() => setShowChat(true)}
                className="px-5 sm:px-6 md:px-8 py-2.5 sm:py-3 border-2 border-white/30 text-white rounded-full font-medium hover:bg-white/10 transition-all backdrop-blur-sm hover:scale-105 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                Live Chat
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact Info Cards - Responsive Grid */}
      <section className={`py-12 sm:py-16 md:py-20 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container-custom px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6">
            {contactInfo.map((info, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03 }}
                className={`group p-5 sm:p-6 rounded-2xl transition-all duration-300 ${
                  isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:shadow-2xl'
                }`}
              >
                <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-r ${info.color} flex items-center justify-center mb-3 sm:mb-4 group-hover:scale-110 transition-transform`}>
                  <info.icon className="w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 text-white" />
                </div>
                <h3 className={`text-base sm:text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {info.title}
                </h3>
                {info.link ? (
                  <a 
                    href={info.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className={`text-xs sm:text-sm ${isDark ? 'text-gray-400 hover:text-amber-400' : 'text-gray-600 hover:text-amber-600'} transition-colors block mt-1 break-words`}
                  >
                    {info.details}
                  </a>
                ) : (
                  <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                    {info.details}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Map - Responsive */}
      <section id="contact-form" className="py-12 sm:py-16 md:py-20">
        <div className="container-custom px-4 sm:px-6">
          <div className="grid lg:grid-cols-5 gap-6 md:gap-8 lg:gap-12">
            {/* Form - Takes 3 columns on desktop */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-3"
            >
              <div className={`p-5 sm:p-6 md:p-8 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-2xl`}>
                <div className="flex items-center gap-3 mb-5 sm:mb-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className={`text-xl sm:text-2xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      Send Us a Message
                    </h2>
                    <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Fill in the form and we'll get back to you within 24 hours
                    </p>
                  </div>
                </div>

                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`p-4 sm:p-5 md:p-6 rounded-2xl ${isDark ? 'bg-green-900/30' : 'bg-green-50'} border border-green-500/30`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                      </div>
                      <div>
                        <h3 className={`font-bold text-sm sm:text-base ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          Message Sent Successfully! 🎉
                        </h3>
                        <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          Thank you for reaching out. We'll respond shortly.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                    {error && (
                      <div className={`p-3 sm:p-4 rounded-xl flex items-center gap-2 ${
                        isDark ? 'bg-red-900/30' : 'bg-red-50'
                      } border border-red-500/30`}>
                        <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-500 flex-shrink-0" />
                        <span className={`text-xs sm:text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>{error}</span>
                      </div>
                    )}

                    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Full Name *
                        </label>
                        <div className="relative">
                          <User className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl outline-none text-sm sm:text-base ${
                              isDark 
                                ? 'bg-gray-700 text-white border-gray-600' 
                                : 'bg-gray-50 text-gray-800 border-gray-200'
                            } border focus:border-amber-500 transition-colors`}
                            placeholder="John Doe"
                          />
                        </div>
                      </div>
                      <div>
                        <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Email Address *
                        </label>
                        <div className="relative">
                          <Mail className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                          <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl outline-none text-sm sm:text-base ${
                              isDark 
                                ? 'bg-gray-700 text-white border-gray-600' 
                                : 'bg-gray-50 text-gray-800 border-gray-200'
                            } border focus:border-amber-500 transition-colors`}
                            placeholder="john@example.com"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
                      <div>
                        <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl outline-none text-sm sm:text-base ${
                              isDark 
                                ? 'bg-gray-700 text-white border-gray-600' 
                                : 'bg-gray-50 text-gray-800 border-gray-200'
                            } border focus:border-amber-500 transition-colors`}
                            placeholder="+233 55 123 4567"
                          />
                        </div>
                      </div>
                      <div>
                        <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Subject *
                        </label>
                        <div className="relative">
                          <MessageSquare className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                          <input
                            type="text"
                            required
                            value={formData.subject}
                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                            className={`w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 rounded-xl outline-none text-sm sm:text-base ${
                              isDark 
                                ? 'bg-gray-700 text-white border-gray-600' 
                                : 'bg-gray-50 text-gray-800 border-gray-200'
                            } border focus:border-amber-500 transition-colors`}
                            placeholder="Wellness Retreat Inquiry"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-xs sm:text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Message *
                      </label>
                      <textarea
                        required
                        rows={4}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl outline-none text-sm sm:text-base ${
                          isDark 
                            ? 'bg-gray-700 text-white border-gray-600' 
                            : 'bg-gray-50 text-gray-800 border-gray-200'
                        } border focus:border-amber-500 transition-colors resize-none`}
                        placeholder="Tell us about your wellness needs, preferences, or any questions you have..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full px-5 sm:px-6 md:px-8 py-3 sm:py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:scale-105 transition-all shadow-lg shadow-amber-500/30 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm sm:text-base"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 sm:w-5 sm:h-5" />
                          Send Message
                        </>
                      )}
                    </button>

                    <p className={`text-[10px] sm:text-xs text-center ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      We respect your privacy. Your information will never be shared.
                    </p>
                  </form>
                )}
              </div>
            </motion.div>

            {/* Right Column - Quick Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-2 space-y-4 sm:space-y-5 md:space-y-6"
            >
              {/* Map - Responsive */}
              <div className={`p-4 sm:p-5 md:p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
                <h3 className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                  Find Us Here
                </h3>
                <div className="aspect-[4/3] rounded-xl overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d31715.384071135608!2d-0.21541034999999999!3d5.6037168!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xfdf99b2c0125817%3A0x4cf0f31a69ba5b5!2sAccra%2C%20Ghana!5e0!3m2!1sen!2s!4v1700000000000"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Alveovita Location"
                    className="rounded-xl"
                  />
                </div>
              </div>

              {/* Social Links - Responsive */}
              <div className={`p-4 sm:p-5 md:p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl`}>
                <h3 className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-amber-500" />
                  Connect With Us
                </h3>
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      className={`p-2.5 sm:p-3 rounded-full transition-all hover:scale-110 ${
                        isDark 
                          ? 'bg-gray-700 hover:bg-gray-600' 
                          : 'bg-gray-100 hover:bg-gray-200'
                      } ${social.color}`}
                    >
                      <social.icon className="w-4 h-4 sm:w-5 sm:h-5" />
                    </a>
                  ))}
                </div>
                <div className="mt-3 sm:mt-4">
                  <a 
                    href="https://facebook.com" 
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 text-amber-500 hover:text-amber-600 transition-colors text-xs sm:text-sm`}
                  >
                    Follow us for wellness tips and updates
                    <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                  </a>
                </div>
              </div>

              {/* Quick Response - Responsive */}
              <div className={`p-4 sm:p-5 md:p-6 rounded-2xl ${isDark ? 'bg-gradient-to-r from-amber-900/30 to-orange-900/30' : 'bg-gradient-to-r from-amber-50 to-orange-50'} border border-amber-500/20`}>
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                    <Headphones className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                  </div>
                  <div>
                    <h4 className={`font-bold text-sm sm:text-base ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      Quick Response
                    </h4>
                    <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Our team is available 24/7 to assist you.
                    </p>
                    <button 
                      onClick={() => setShowChat(true)}
                      className="mt-2 sm:mt-3 px-4 sm:px-5 md:px-6 py-1.5 sm:py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:scale-105 transition-all flex items-center gap-2 text-xs sm:text-sm"
                    >
                      <MessageSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      Start Live Chat
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* FAQ Section - Responsive */}
      <section className={`py-12 sm:py-16 md:py-20 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container-custom px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-10 md:mb-12"
          >
            <span className="text-amber-500 font-semibold text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2">
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              FAQ
            </span>
            <h2 className={`text-2xl sm:text-3xl md:text-4xl font-display font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Frequently Asked Questions
            </h2>
            <p className={`max-w-2xl mx-auto mt-3 sm:mt-4 text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Find answers to the most common questions about our wellness tourism services.
            </p>
          </motion.div>

          <div className="max-w-3xl mx-auto space-y-3 sm:space-y-4">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className={`p-4 sm:p-5 md:p-6 rounded-2xl transition-all duration-300 ${
                  isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:shadow-xl'
                }`}
              >
                <div className="flex items-start gap-3 sm:gap-4">
                  <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Star className="w-3 h-3 sm:w-4 sm:h-4 text-amber-500" />
                  </div>
                  <div>
                    <h3 className={`font-bold text-sm sm:text-base ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {faq.question}
                    </h3>
                    <p className={`mt-1 sm:mt-2 text-xs sm:text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-6 sm:mt-8">
            <p className={`text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Still have questions?{' '}
              <button 
                onClick={() => setShowChat(true)}
                className="text-amber-500 hover:text-amber-600 font-medium transition-colors"
              >
                Chat with us now
              </button>
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section - Responsive */}
      <section className="relative py-16 sm:py-20 md:py-24 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1920&q=80)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-amber-900/95 to-orange-800/95" />
        </div>
        <div className="container-custom relative z-10 px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center text-white"
          >
            <div className="inline-flex flex-wrap items-center justify-center gap-2 bg-white/10 backdrop-blur-sm px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full mb-4 sm:mb-5 md:mb-6 border border-white/20">
              <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
              <span className="text-[10px] sm:text-xs md:text-sm font-medium">Book Your Consultation Today</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-3 sm:mb-4">
              Ready to Transform Your <span className="text-amber-300">Wellness</span>?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-200 mb-6 sm:mb-8 max-w-2xl mx-auto">
              Take the first step towards a healthier, happier you. Our team is ready to help you create
              the perfect wellness journey.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
              <button 
                onClick={handleBookConsultation}
                className="px-6 sm:px-7 md:px-8 py-3 sm:py-3.5 md:py-4 bg-white text-amber-700 rounded-full font-medium hover:bg-amber-50 transition-all shadow-xl hover:scale-105 flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                Book Consultation
              </button>
              <button 
                onClick={handleBrowseTours}
                className="px-6 sm:px-7 md:px-8 py-3 sm:py-3.5 md:py-4 border-2 border-white/30 text-white rounded-full font-medium hover:bg-white/10 transition-all backdrop-blur-sm flex items-center justify-center gap-2 text-sm sm:text-base"
              >
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                Browse Tours
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Contact
// src/pages/FAQ.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom' // Add this import
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { useToast } from '../hooks/useToast'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import { 
  Search, ChevronDown, ChevronUp, MessageCircle,
  Phone, Mail, Book, Video, Headphones,
  Star, Award, Shield, Users, Clock,
  CheckCircle, ArrowRight, Sparkles,
  Heart, Compass, MapPin, Calendar,
  DollarSign, Gift, Crown, Gem
} from 'lucide-react'

const FAQ = () => {
  const { isDark } = useTheme()
  const { showToast } = useToast()
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedFaq, setExpandedFaq] = useState(null)
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', label: 'All Questions', icon: Star },
    { id: 'booking', label: 'Booking', icon: Calendar },
    { id: 'payments', label: 'Payments', icon: DollarSign },
    { id: 'tours', label: 'Tours & Activities', icon: Compass },
    { id: 'wellness', label: 'Wellness Programs', icon: Heart },
    { id: 'account', label: 'Account', icon: Users },
  ]

  const faqs = [
    {
      id: 1,
      category: 'booking',
      question: 'How do I book a tour?',
      answer: 'You can book a tour directly through our website by selecting your preferred tour, choosing dates, and completing the booking form. You can also contact us directly for personalized assistance. Our team is available 24/7 to help you with your booking.'
    },
    {
      id: 2,
      category: 'booking',
      question: 'Can I modify my booking after confirmation?',
      answer: 'Yes, you can modify your booking up to 48 hours before the tour start date. Please contact our support team at +233 55 123 4567 or email info@alveovita.com to make changes to your booking.'
    },
    {
      id: 3,
      category: 'booking',
      question: 'What is your cancellation policy?',
      answer: 'You can cancel your booking up to 7 days before the tour start date for a full refund. Cancellations within 7 days may incur a fee. For wellness retreats and special programs, please refer to the specific cancellation terms provided during booking.'
    },
    {
      id: 4,
      category: 'payments',
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, Mastercard, American Express), bank transfers, mobile money (MoMo), and Paystack for secure online payments. All payments are processed through our secure payment gateway.'
    },
    {
      id: 5,
      category: 'payments',
      question: 'Do you offer payment plans?',
      answer: 'Yes, we offer flexible payment plans for our premium wellness programs and retreats. Please contact our sales team to discuss payment options that work best for you.'
    },
    {
      id: 6,
      category: 'tours',
      question: 'Do you offer group discounts?',
      answer: 'Yes, we offer special rates for groups of 10 or more. Please contact us directly for group booking inquiries and customized packages. We can also create tailored experiences for corporate groups and organizations.'
    },
    {
      id: 7,
      category: 'tours',
      question: 'What should I pack for a tour?',
      answer: 'We provide a detailed packing list for each tour after booking. Generally, we recommend comfortable clothing, walking shoes, sunscreen, a hat, insect repellent, and any personal medications you may need.'
    },
    {
      id: 8,
      category: 'wellness',
      question: 'What wellness programs do you offer?',
      answer: 'We offer a comprehensive range of wellness programs including stress relief retreats, mental wellness programs, corporate wellness packages, senior wellness tourism, student wellness programs, and cultural immersion experiences. Each program is designed to promote holistic well-being.'
    },
    {
      id: 9,
      category: 'wellness',
      question: 'Can I customize my wellness program?',
      answer: 'Absolutely! All our programs can be customized to meet your specific needs and preferences. Contact us to create your personalized wellness journey. We work with you to design a program that aligns with your health goals and interests.'
    },
    {
      id: 10,
      category: 'account',
      question: 'How do I create an account?',
      answer: 'You can create an account by clicking on the "Register" button in the navigation bar. Fill in your details, verify your email, and you\'re ready to start booking tours and saving your favorites.'
    },
    {
      id: 11,
      category: 'account',
      question: 'How do I reset my password?',
      answer: 'Click on "Login" and then "Forgot Password". Enter your email address and we\'ll send you a password reset link. Follow the instructions in the email to create a new password.'
    },
    {
      id: 12,
      category: 'general',
      question: 'Is travel insurance included?',
      answer: 'Travel insurance is not included in our packages. We strongly recommend purchasing comprehensive travel insurance for your protection. This ensures coverage for any unforeseen circumstances during your trip.'
    }
  ]

  // Filter FAQs based on search and category
  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const toggleFaq = (id) => {
    setExpandedFaq(expandedFaq === id ? null : id)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchTerm.trim()) {
      showToast(`Searching for "${searchTerm}"...`, 'info')
    }
  }

  const handleContactSupport = () => {
    showToast('Connecting to support team...', 'info')
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
              <MessageCircle className="w-4 h-4" />
              FAQ
            </span>
            <h1 className="text-5xl md:text-6xl font-display font-bold text-white mt-4 leading-tight">
              Frequently Asked <span className="text-amber-400">Questions</span>
            </h1>
            <p className="text-xl text-gray-300 mt-4 leading-relaxed">
              Find answers to the most common questions about our services, booking process, and wellness programs.
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mt-8 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400/50"
              />
            </form>
          </motion.div>
        </div>
      </section>

      {/* Categories */}
      <section className={`py-6 border-b ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
        <div className="container-custom">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                    : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <category.icon className="w-4 h-4" />
                {category.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ List */}
      <section className={`py-16 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            {filteredFaqs.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-amber-400" />
                </div>
                <h3 className={`text-2xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  No Results Found
                </h3>
                <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Try adjusting your search or filter to find what you're looking for.
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory('all')
                  }}
                  className="mt-6 px-6 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-all"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <AnimatePresence>
                  {filteredFaqs.map((faq) => (
                    <motion.div
                      key={faq.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`rounded-2xl overflow-hidden transition-all duration-300 ${
                        isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:shadow-xl'
                      } border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
                    >
                      <button
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full p-6 text-left flex items-start justify-between gap-4"
                      >
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              isDark ? 'bg-amber-500/20 text-amber-400' : 'bg-amber-100 text-amber-700'
                            }`}>
                              {categories.find(c => c.id === faq.category)?.label || faq.category}
                            </span>
                          </div>
                          <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            {faq.question}
                          </h3>
                        </div>
                        <div className="flex-shrink-0 mt-1">
                          {expandedFaq === faq.id ? (
                            <ChevronUp className="w-5 h-5 text-amber-500" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-amber-500" />
                          )}
                        </div>
                      </button>
                      
                      <AnimatePresence>
                        {expandedFaq === faq.id && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                          >
                            <div className={`px-6 pb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                              <div className={`pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                                <p className="leading-relaxed">{faq.answer}</p>
                                {faq.id === 1 && (
                                  <Link to="/tours">
                                    <button className="mt-3 text-sm text-amber-500 hover:text-amber-600 transition-colors flex items-center gap-1">
                                      Browse Tours <ArrowRight className="w-4 h-4" />
                                    </button>
                                  </Link>
                                )}
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Still Need Help */}
      <section className={`py-16 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <div className={`p-8 rounded-3xl text-center ${
              isDark ? 'bg-gray-800' : 'bg-white'
            } shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
              <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
                <Headphones className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className={`text-2xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Still Need Help?
              </h3>
              <p className={`mt-2 max-w-md mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Our support team is available 24/7 to assist you with any questions or concerns.
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-6">
                <button
                  onClick={handleContactSupport}
                  className="px-6 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-all hover:scale-105 flex items-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Live Chat
                </button>
                <Link to="/contact">
                  <button className={`px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 flex items-center gap-2 ${
                    isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                    <Mail className="w-4 h-4" />
                    Email Us
                  </button>
                </Link>
                <a href="tel:+233551234567" className={`px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 flex items-center gap-2 ${
                  isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}>
                  <Phone className="w-4 h-4" />
                  Call Us
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default FAQ
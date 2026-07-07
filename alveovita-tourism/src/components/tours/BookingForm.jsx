// src/components/tours/BookingForm.jsx
import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { useBooking } from '../../context/BookingContext'
import Navbar from '../common/Navbar'
import Footer from '../common/Footer'
import PaystackPayment from '../payment/PaystackPayment'
import { 
  Calendar, User, Mail, Phone, MapPin, 
  CreditCard, Lock, CheckCircle, ArrowRight,
  AlertCircle, ChevronLeft, Clock, Users,
  DollarSign, Shield, MessageSquare, Info,
  Building, BookOpen, Heart, Star, Loader2
} from 'lucide-react'

const BookingForm = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isDark } = useTheme()
  const { user } = useAuth()
  const { createBooking } = useBooking()
  const [tour, setTour] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)
  const [showPayment, setShowPayment] = useState(false)
  const [bookingReference, setBookingReference] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    date: '',
    guests: 1,
    specialRequests: '',
    paymentMethod: 'card',
    terms: false
  })

  useEffect(() => {
    const loadTour = () => {
      setLoading(true)
      const mockTours = {
        '1': {
          id: 1,
          title: 'Executive Wellness Retreat',
          location: 'Accra, Ghana',
          duration: '5 Days, 4 Nights',
          price: 2499,
          rating: 4.9,
          image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80',
          availableDates: ['2025-01-15', '2025-01-22', '2025-02-05']
        },
        '2': {
          id: 2,
          title: 'Nature & Healing Retreat',
          location: 'Volta Region, Ghana',
          duration: '7 Days, 6 Nights',
          price: 3299,
          rating: 4.8,
          image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&q=80',
          availableDates: ['2025-02-01', '2025-02-15', '2025-03-01']
        }
      }
      setTour(mockTours[id] || mockTours['1'])
      setLoading(false)
    }
    loadTour()
  }, [id])

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || ''
      }))
    }
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    if (!formData.name || !formData.email || !formData.date) {
      setError('Please fill in all required fields')
      setSubmitting(false)
      return
    }

    if (!formData.terms) {
      setError('Please agree to the terms and conditions')
      setSubmitting(false)
      return
    }

    try {
      const bookingData = {
        tourId: tour.id,
        tourTitle: tour.title,
        tourPrice: tour.price,
        date: formData.date,
        guests: formData.guests,
        customerName: formData.name,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        customerAddress: formData.address,
        specialRequests: formData.specialRequests,
        totalAmount: tour.price * formData.guests,
        status: 'pending'
      }

      const result = await createBooking(bookingData)
      
      if (result.success) {
        setBookingReference(result.reference)
        setShowPayment(true)
        setSubmitting(false)
      } else {
        setError(result.error || 'Booking failed. Please try again.')
        setSubmitting(false)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      setSubmitting(false)
    }
  }

  const handlePaymentSuccess = async (paymentData) => {
    setSuccess(true)
    setShowPayment(false)
    
    await createBooking({
      ...formData,
      tourId: tour.id,
      tourTitle: tour.title,
      date: formData.date,
      guests: formData.guests,
      totalAmount: tour.price * formData.guests,
      paymentReference: paymentData.reference,
      status: 'confirmed'
    })

    setTimeout(() => {
      navigate('/dashboard')
    }, 3000)
  }

  const handlePaymentError = (error) => {
    setError(error.message || 'Payment failed. Please try again.')
    setShowPayment(false)
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-amber-500 animate-spin mx-auto" />
            <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading booking details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!tour) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Tour Not Found
            </h2>
            <Link to="/tours" className="mt-4 inline-block px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-all">
              Browse Tours
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <Navbar />

      <div className="pt-20 pb-16">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form Column */}
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className={`p-6 md:p-8 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl`}
              >
                <div className="flex items-center gap-2 mb-6">
                  <button
                    onClick={() => navigate(-1)}
                    className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-all`}
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <h1 className={`text-2xl md:text-3xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Book Your Wellness Journey
                  </h1>
                </div>

                {success ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-8"
                  >
                    <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="w-10 h-10 text-white" />
                    </div>
                    <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      Booking Confirmed! 🎉
                    </h3>
                    <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Your wellness journey has been booked successfully.
                      We'll send you a confirmation email shortly.
                    </p>
                    <div className="mt-6 flex flex-wrap justify-center gap-4">
                      <Link
                        to="/dashboard"
                        className="px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-all"
                      >
                        Go to Dashboard
                      </Link>
                      <Link
                        to="/tours"
                        className={`px-6 py-3 rounded-xl border ${isDark ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-600'} hover:scale-105 transition-all`}
                      >
                        Browse More Tours
                      </Link>
                    </div>
                  </motion.div>
                ) : showPayment ? (
                  <PaystackPayment
                    amount={tour.price * formData.guests}
                    email={formData.email}
                    name={formData.name}
                    tourTitle={tour.title}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    onClose={() => setShowPayment(false)}
                  />
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                      <div className={`p-4 rounded-xl flex items-center gap-2 ${
                        isDark ? 'bg-red-900/30' : 'bg-red-50'
                      } border border-red-500/30`}>
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <span className={isDark ? 'text-red-400' : 'text-red-600'}>{error}</span>
                      </div>
                    )}

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Full Name *
                        </label>
                        <div className="relative">
                          <User className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className={`w-full pl-12 pr-4 py-3 rounded-xl outline-none ${
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
                          <Mail className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                          <input
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={`w-full pl-12 pr-4 py-3 rounded-xl outline-none ${
                              isDark 
                                ? 'bg-gray-700 text-white border-gray-600' 
                                : 'bg-gray-50 text-gray-800 border-gray-200'
                            } border focus:border-amber-500 transition-colors`}
                            placeholder="john@example.com"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            className={`w-full pl-12 pr-4 py-3 rounded-xl outline-none ${
                              isDark 
                                ? 'bg-gray-700 text-white border-gray-600' 
                                : 'bg-gray-50 text-gray-800 border-gray-200'
                            } border focus:border-amber-500 transition-colors`}
                            placeholder="+233 55 123 4567"
                          />
                        </div>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Address
                        </label>
                        <div className="relative">
                          <MapPin className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                          <input
                            type="text"
                            value={formData.address}
                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                            className={`w-full pl-12 pr-4 py-3 rounded-xl outline-none ${
                              isDark 
                                ? 'bg-gray-700 text-white border-gray-600' 
                                : 'bg-gray-50 text-gray-800 border-gray-200'
                            } border focus:border-amber-500 transition-colors`}
                            placeholder="Accra, Ghana"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Select Date *
                        </label>
                        <select
                          required
                          value={formData.date}
                          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                          className={`w-full px-4 py-3 rounded-xl outline-none ${
                            isDark 
                              ? 'bg-gray-700 text-white border-gray-600' 
                              : 'bg-gray-50 text-gray-800 border-gray-200'
                          } border focus:border-amber-500 transition-colors`}
                        >
                          <option value="">Select a date</option>
                          {tour.availableDates.map((date) => (
                            <option key={date} value={date}>
                              {new Date(date).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              })}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Number of Guests *
                        </label>
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, guests: Math.max(1, formData.guests - 1) })}
                            className={`p-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-all`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
                            </svg>
                          </button>
                          <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            {formData.guests}
                          </span>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, guests: formData.guests + 1 })}
                            className={`p-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-all`}
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Special Requests
                      </label>
                      <div className="relative">
                        <MessageSquare className={`absolute left-4 top-4 w-5 h-5 ${isDark ? 'text-gray-500' : 'text-gray-400'}`} />
                        <textarea
                          rows={3}
                          value={formData.specialRequests}
                          onChange={(e) => setFormData({ ...formData, specialRequests: e.target.value })}
                          className={`w-full pl-12 pr-4 py-3 rounded-xl outline-none ${
                            isDark 
                              ? 'bg-gray-700 text-white border-gray-600' 
                              : 'bg-gray-50 text-gray-800 border-gray-200'
                          } border focus:border-amber-500 transition-colors resize-none`}
                          placeholder="Any dietary restrictions, accessibility needs, or special requests..."
                        />
                      </div>
                    </div>

                    <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="flex items-start gap-2">
                        <input
                          type="checkbox"
                          required
                          checked={formData.terms}
                          onChange={(e) => setFormData({ ...formData, terms: e.target.checked })}
                          className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500 mt-1"
                        />
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
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
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:scale-105 transition-all shadow-lg shadow-amber-500/30 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-5 h-5" />
                          Proceed to Payment - ${(tour.price * formData.guests).toLocaleString()}
                        </>
                      )}
                    </button>

                    <div className={`flex items-center justify-center gap-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      <Shield className="w-4 h-4" />
                      Secure payment powered by Paystack
                    </div>
                  </form>
                )}
              </motion.div>
            </div>

            {/* Summary Column */}
            <div className="lg:col-span-1">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className={`sticky top-24 p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-xl`}
              >
                <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Booking Summary
                </h3>

                <div className="aspect-video rounded-xl overflow-hidden mb-4">
                  <img 
                    src={tour.image} 
                    alt={tour.title}
                    className="w-full h-full object-cover"
                  />
                </div>

                <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {tour.title}
                </h4>
                <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                  {tour.location}
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                      {tour.duration}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Users className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                      {formData.guests} {formData.guests === 1 ? 'guest' : 'guests'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Star className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                      {tour.rating} / 5.0
                    </span>
                  </div>
                </div>

                <div className={`mt-4 pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                  <div className="flex items-center justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                      ${tour.price} × {formData.guests}
                    </span>
                    <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      ${(tour.price * formData.guests).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-1 text-sm">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Service fee</span>
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>$0.00</span>
                  </div>
                  <div className={`mt-2 pt-2 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Total</span>
                      <span className="text-2xl font-bold text-amber-500">
                        ${(tour.price * formData.guests).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={`mt-4 p-3 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                  <div className="flex items-center gap-2 text-xs">
                    <Info className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                      Free cancellation up to 7 days before the tour
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <div className={`flex items-center gap-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Shield className="w-4 h-4" />
                    Secure payment powered by Paystack
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default BookingForm
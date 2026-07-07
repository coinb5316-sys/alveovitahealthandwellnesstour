// src/components/tours/TourDetails.jsx
import React, { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../../context/ThemeContext'
import { useAuth } from '../../context/AuthContext'
import { useBooking } from '../../context/BookingContext'
import { useToast } from '../../hooks/useToast'
import { useSocket } from '../../context/SocketContext'
import axios from '../../api/axios'
import Navbar from '../common/Navbar'
import Footer from '../common/Footer'
import PaystackPayment from '../payment/PaystackPayment'
import { 
  Star, MapPin, Clock, Calendar, Users, Heart, 
  Share2, CheckCircle, ArrowRight, X, ChevronLeft,
  ChevronRight, DollarSign, Award, Shield, Globe,
  Phone, Mail, MessageSquare, ThumbsUp, Eye,
  Clock as ClockIcon, User, Briefcase, Coffee,
  Sun, Leaf, TreePine, Waves, Mountain, Compass,
  Camera, Video, Image, Upload, Plus, Minus,
  Calendar as CalendarIcon, User as UserIcon,
  CreditCard, Lock, Check, AlertCircle, Info,
  Building2, Wifi, Utensils, Dumbbell,
  Sparkles, Gift, Crown, Gem, Rocket, Zap,
  Car, Home, Plane, Train, Bus, Bike,
  Loader2, Bus as BusIcon, Train as TrainIcon, Car as CarIcon, Ship, Plane as PlaneIcon, Footprints,
  Play, Pause, Maximize2, Minimize2,
  LogIn, Edit3, ThumbsUp as ThumbsUpIcon, Flag,
  Reply, Verified, StarHalf, Star as StarIcon
} from 'lucide-react'

const TOUR_BOOKING_KEY = 'alveovita_tour_booking_data'
const REDIRECT_CHECK_KEY = 'alveovita_tour_booking_redirect'

const TourDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { isDark } = useTheme()
  const { user } = useAuth()
  const { createBooking } = useBooking()
  const { showToast } = useToast()
  const { socket, isConnected } = useSocket()
  const sliderRef = useRef(null)
  const autoPlayRef = useRef(null)
  
  const [tour, setTour] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedDate, setSelectedDate] = useState(null)
  const [guests, setGuests] = useState(1)
  const [activeTab, setActiveTab] = useState('overview')
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [bookingStep, setBookingStep] = useState(1)
  const [bookingData, setBookingData] = useState({
    name: '',
    email: '',
    phone: '',
    specialRequests: '',
    paymentMethod: 'card'
  })
  const [bookingError, setBookingError] = useState(null)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [showPayment, setShowPayment] = useState(false)
  const [bookingReference, setBookingReference] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [isAutoPlaying, setIsAutoPlaying] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showThumbnails, setShowThumbnails] = useState(true)
  const [touchStart, setTouchStart] = useState(null)
  const [touchEnd, setTouchEnd] = useState(null)
  const [paymentAttempted, setPaymentAttempted] = useState(false)

  // Review states
  const [reviews, setReviews] = useState([])
  const [reviewStats, setReviewStats] = useState({ total: 0, average: 0, distribution: {} })
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviewFormData, setReviewFormData] = useState({
    rating: 5,
    title: '',
    comment: '',
    images: []
  })
  const [reviewLoading, setReviewLoading] = useState(false)
  const [reviewSubmitted, setReviewSubmitted] = useState(false)
  const [pendingReviews, setPendingReviews] = useState([])

  // Socket.IO event listeners
  useEffect(() => {
    if (!socket) return;

    const handleTourUpdated = (data) => {
      if (data.tourId === id) {
        showToast(`🔄 "${data.title}" has been updated`, 'info');
        fetchTourData();
      }
    };

    const handleNewReview = (data) => {
      if (data.itemId === id && data.reviewType === 'tour') {
        showToast(`⭐ New review added!`, 'info');
        fetchReviews();
      }
    };

    const handleReviewStatusChanged = (data) => {
      if (data.itemId === id && data.itemType === 'tour') {
        if (data.newStatus === 'approved') {
          showToast(`✅ Review from ${data.userName} was approved!`, 'success');
          fetchReviews();
          fetchTourData();
        } else if (data.newStatus === 'rejected') {
          showToast(`❌ Review from ${data.userName} was rejected`, 'warning');
          fetchReviews();
        }
      }
    };

    socket.on('tour-updated', handleTourUpdated);
    socket.on('new-review', handleNewReview);
    socket.on('review-status-changed', handleReviewStatusChanged);

    return () => {
      socket.off('tour-updated', handleTourUpdated);
      socket.off('new-review', handleNewReview);
      socket.off('review-status-changed', handleReviewStatusChanged);
    };
  }, [socket, id, showToast]);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && tour?.images?.length > 1) {
      autoPlayRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % tour.images.length)
      }, 4000)
    }
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
      }
    }
  }, [isAutoPlaying, tour?.images?.length])

  // Fetch tour data function
  const fetchTourData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(`/tours/${id}`)
      
      if (response.data.success) {
        const tourData = response.data.tour
        const formattedTour = {
          ...tourData,
          id: tourData._id,
          price: tourData.price || 0,
          image: tourData.images?.[0] || 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=800&q=80',
          images: tourData.images?.length ? tourData.images : ['https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=800&q=80'],
          includes: tourData.includes || [],
          excludes: tourData.excludes || [],
          amenities: tourData.amenities || [],
          availableDates: tourData.availableDates || [],
          itinerary: tourData.itinerary || [],
          maxGroup: tourData.maxGroup || 20,
          minGroup: tourData.minGroup || 2,
          rating: tourData.rating || 0,
          reviews: tourData.reviews || 0,
          badge: tourData.badge || '',
          status: tourData.status || 'active',
          category: tourData.category || 'wellness',
          guide: tourData.guide || null,
          transport: tourData.transport || null,
          entryFees: tourData.entryFees || null,
          meals: tourData.meals || null,
          accommodation: tourData.accommodation || null,
          groupSize: tourData.groupSize || { min: 2, max: 20 },
          languages: tourData.languages || []
        }
        setTour(formattedTour)
        
        const favorites = JSON.parse(localStorage.getItem('alveovita_favorites') || '{"hotels":[],"tours":[]}')
        setIsFavorite(favorites.tours.some(t => t.id === formattedTour.id))
        
        if (user) {
          setBookingData(prev => ({
            ...prev,
            name: user.name || prev.name,
            email: user.email || prev.email
          }))
        }

        await fetchReviews()
      } else {
        setError('Tour not found')
      }
    } catch (err) {
      console.error('Error fetching tour:', err)
      setError(err.response?.data?.message || 'Failed to load tour details')
      showToast('Failed to load tour details', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Fetch tour from backend
  useEffect(() => {
    fetchTourData()
  }, [id, user])

  // Fetch reviews function
  const fetchReviews = async () => {
    try {
      const response = await axios.get(`/tours/${id}/reviews`)
      if (response.data.success) {
        setReviews(response.data.reviews || [])
        setReviewStats({
          total: response.data.total || 0,
          average: response.data.rating || 0,
          distribution: response.data.distribution || {}
        })
      }
    } catch (error) {
      console.error('Error fetching reviews:', error)
    }
  }

  // Review submission handler
  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    setReviewLoading(true)
    
    try {
      const response = await axios.post(`/tours/${id}/reviews`, reviewFormData)
      if (response.data.success) {
        setReviewSubmitted(true)
        showToast('Review submitted successfully! It will be visible after approval.', 'success')
        setShowReviewForm(false)
        setReviewFormData({ rating: 5, title: '', comment: '', images: [] })
        await fetchReviews()
      }
    } catch (error) {
      showToast(error.response?.data?.message || 'Failed to submit review', 'error')
    } finally {
      setReviewLoading(false)
    }
  }

  // Check for redirect from login
  useEffect(() => {
    const redirectFlag = sessionStorage.getItem(REDIRECT_CHECK_KEY)
    const savedData = localStorage.getItem(TOUR_BOOKING_KEY)

    if (redirectFlag === 'true' && savedData && tour) {
      try {
        const parsed = JSON.parse(savedData)
        if (parsed.tourId === tour.id) {
          setSelectedDate(parsed.selectedDate)
          setGuests(parsed.guests || 1)
          setBookingData({
            name: parsed.name || '',
            email: parsed.email || '',
            phone: parsed.phone || '',
            specialRequests: parsed.specialRequests || '',
            paymentMethod: parsed.paymentMethod || 'card'
          })
          setBookingStep(parsed.bookingStep || 1)
          
          setTimeout(() => {
            setShowBookingModal(true)
          }, 500)
          
          sessionStorage.removeItem(REDIRECT_CHECK_KEY)
          showToast('Welcome back! Continue with your booking.', 'info')
        }
      } catch (e) {
        console.error('Error restoring booking data:', e)
      }
    }

    const params = new URLSearchParams(location.search)
    if (params.get('booking') === 'true' && tour) {
      setTimeout(() => {
        setShowBookingModal(true)
      }, 500)
    }
  }, [tour, location.search])

  // Save booking data to localStorage
  useEffect(() => {
    if (tour && (selectedDate || guests > 1 || bookingData.name || bookingData.email)) {
      const dataToSave = {
        tourId: tour.id,
        selectedDate,
        guests,
        name: bookingData.name,
        email: bookingData.email,
        phone: bookingData.phone,
        specialRequests: bookingData.specialRequests,
        paymentMethod: bookingData.paymentMethod,
        bookingStep
      }
      localStorage.setItem(TOUR_BOOKING_KEY, JSON.stringify(dataToSave))
    }
  }, [tour, selectedDate, guests, bookingData, bookingStep])

  const clearSavedBooking = () => {
    localStorage.removeItem(TOUR_BOOKING_KEY)
    sessionStorage.removeItem(REDIRECT_CHECK_KEY)
  }

  const toggleFavorite = () => {
    if (!user) {
      showToast('Please login to save favorites', 'info')
      navigate('/login')
      return
    }

    const favorites = JSON.parse(localStorage.getItem('alveovita_favorites') || '{"hotels":[],"tours":[]}')
    
    if (isFavorite) {
      favorites.tours = favorites.tours.filter(t => t.id !== tour.id)
      showToast('Removed from favorites', 'success')
    } else {
      favorites.tours.push({
        id: tour.id,
        title: tour.title,
        location: tour.location,
        image: tour.images[0],
        rating: tour.rating,
        reviews: tour.reviews,
        price: tour.price,
        duration: tour.duration,
        type: tour.type || tour.category,
        badge: tour.badge,
        addedDate: new Date().toISOString(),
        region: tour.region || tour.location?.split(',')[0] || ''
      })
      showToast('Added to favorites ❤️', 'success')
    }
    
    localStorage.setItem('alveovita_favorites', JSON.stringify(favorites))
    setIsFavorite(!isFavorite)
  }

  const handleShare = async () => {
    const shareData = {
      title: tour.title,
      text: `Check out ${tour.title} in ${tour.location}!`,
      url: window.location.href
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        if (err.name !== 'AbortError') {
          copyToClipboard()
        }
      }
    } else {
      copyToClipboard()
    }
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href)
    showToast('Link copied to clipboard! 📋', 'success')
  }

  // Image slider functions
  const goToSlide = (index) => {
    setCurrentImageIndex(index)
    if (autoPlayRef.current) {
      clearInterval(autoPlayRef.current)
      if (isAutoPlaying) {
        autoPlayRef.current = setInterval(() => {
          setCurrentImageIndex((prev) => (prev + 1) % tour.images.length)
        }, 4000)
      }
    }
  }

  const nextImage = () => {
    if (tour && tour.images) {
      goToSlide((currentImageIndex + 1) % tour.images.length)
    }
  }

  const prevImage = () => {
    if (tour && tour.images) {
      goToSlide((currentImageIndex - 1 + tour.images.length) % tour.images.length)
    }
  }

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying)
    if (!isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % tour.images.length)
      }, 4000)
    } else {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
      }
    }
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
        setIsFullscreen(false)
      }
    }
  }

  // Touch swipe handling
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    const diff = touchStart - touchEnd
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextImage()
      } else {
        prevImage()
      }
    }
    setTouchStart(null)
    setTouchEnd(null)
  }

  // Handle booking initialization
  const handleBookingInit = async () => {
    // Prevent multiple submissions
    if (isProcessing || isSubmitting) {
      return
    }
    
    setBookingError(null)
    setIsProcessing(true)
    setIsSubmitting(true)
    
    // Check if user is logged in
    if (!user) {
      const bookingState = {
        tourId: tour.id,
        selectedDate,
        guests,
        name: bookingData.name,
        email: bookingData.email,
        phone: bookingData.phone,
        specialRequests: bookingData.specialRequests,
        paymentMethod: bookingData.paymentMethod,
        bookingStep
      }
      localStorage.setItem(TOUR_BOOKING_KEY, JSON.stringify(bookingState))
      sessionStorage.setItem(REDIRECT_CHECK_KEY, 'true')
      
      showToast('Please login to book', 'info')
      setIsRedirecting(true)
      navigate('/login', { 
        state: { 
          from: window.location.pathname,
          booking: true 
        } 
      })
      setIsProcessing(false)
      setIsSubmitting(false)
      return
    }

    // Validate date
    if (!selectedDate) {
      setBookingError('Please select a date')
      setIsProcessing(false)
      setIsSubmitting(false)
      return
    }

    // Validate customer info
    if (!bookingData.name || !bookingData.email) {
      setBookingError('Please fill in all required fields')
      setIsProcessing(false)
      setIsSubmitting(false)
      return
    }

    const totalAmount = tour.price * guests

    try {
      // Check for existing pending booking
      const existingBookingRes = await axios.get(`/bookings/mine`)
      let existingBooking = null
      
      if (existingBookingRes.data.success) {
        const pendingBookings = existingBookingRes.data.bookings.filter(
          b => b.tourId === tour.id && b.status === 'pending'
        )
        if (pendingBookings.length > 0) {
          existingBooking = pendingBookings[0]
          showToast('Found existing pending booking. Please complete payment.', 'info')
        }
      }

      let bookingResult

      if (existingBooking) {
        // Update existing booking
        const updateRes = await axios.patch(`/bookings/${existingBooking._id}`, {
          guests: guests,
          date: selectedDate,
          totalAmount: totalAmount,
          customerName: bookingData.name,
          customerEmail: bookingData.email,
          customerPhone: bookingData.phone,
          specialRequests: bookingData.specialRequests
        })
        bookingResult = updateRes.data
        showToast('Booking updated successfully', 'success')
      } else {
        // Create new booking
        bookingResult = await createBooking({
          tourId: tour.id,
          tourTitle: tour.title,
          tourPrice: tour.price,
          date: selectedDate,
          guests: guests,
          customerName: bookingData.name,
          customerEmail: bookingData.email,
          customerPhone: bookingData.phone,
          specialRequests: bookingData.specialRequests,
          totalAmount: totalAmount,
          status: 'pending',
          type: 'tour'
        })
      }

      if (bookingResult && bookingResult.success) {
        setBookingReference(bookingResult.booking?.paymentReference || bookingResult.reference)
        setShowPayment(true)
        clearSavedBooking()
      } else {
        setBookingError(bookingResult?.error || 'Failed to initialize booking')
        setIsProcessing(false)
        setIsSubmitting(false)
      }
    } catch (err) {
      console.error('Booking error:', err)
      setBookingError(err.response?.data?.message || 'An unexpected error occurred. Please try again.')
      setIsProcessing(false)
      setIsSubmitting(false)
    } finally {
      if (!showPayment) {
        setIsProcessing(false)
        setIsSubmitting(false)
      }
    }
  }

  const handlePaymentSuccess = async (paymentData) => {
    setBookingSuccess(true)
    setBookingStep(3)
    setShowPayment(false)
    setIsProcessing(false)
    setIsSubmitting(false)
    
    showToast('🎉 Payment successful! Your booking is confirmed.', 'success')
    
    // Update the booking with payment reference
    if (bookingReference) {
      await createBooking({
        ...bookingData,
        tourId: tour.id,
        tourTitle: tour.title,
        date: selectedDate,
        guests: guests,
        totalAmount: tour.price * guests,
        paymentReference: paymentData.reference || bookingReference,
        status: 'confirmed',
        type: 'tour'
      })
    }

    clearSavedBooking()

    setTimeout(() => {
      setShowBookingModal(false)
      navigate('/dashboard')
    }, 3000)
  }

  const handlePaymentError = (error) => {
    setBookingError(error.message || 'Payment failed. Please try again.')
    setShowPayment(false)
    setIsProcessing(false)
    setIsSubmitting(false)
    setPaymentAttempted(true)
  }

  const handlePaymentClose = () => {
    setShowPayment(false)
    setIsProcessing(false)
    setIsSubmitting(false)
    setPaymentAttempted(true)
  }

  const openBookingModal = () => {
    // Reset payment states when opening modal
    setPaymentAttempted(false)
    setBookingError(null)
    setShowBookingModal(true)
    
    const savedData = localStorage.getItem(TOUR_BOOKING_KEY)
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        if (parsed.tourId === tour.id) {
          setSelectedDate(parsed.selectedDate)
          setGuests(parsed.guests || 1)
          setBookingData({
            name: parsed.name || '',
            email: parsed.email || '',
            phone: parsed.phone || '',
            specialRequests: parsed.specialRequests || '',
            paymentMethod: parsed.paymentMethod || 'card'
          })
          setBookingStep(parsed.bookingStep || 1)
        }
      } catch (e) {
        console.error('Error restoring booking data:', e)
      }
    }
  }

  // Get transport icon
  const getTransportIcon = (type) => {
    const iconMap = {
      'Bus': BusIcon,
      'Van': Car,
      'Car': CarIcon,
      'Train': TrainIcon,
      'Boat': Ship,
      'Flight': PlaneIcon,
      'Walking': Footprints,
      'Bicycle': Bike
    }
    return iconMap[type] || Car
  }

  // Tabs
  const tabs = ['overview', 'itinerary', 'amenities', 'reviews']

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-amber-500 animate-spin mx-auto" />
            <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading tour details...</p>
            {isConnected && (
              <span className="text-xs text-green-500 mt-2 block">🟢 Live updates connected</span>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (error || !tour) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Tour Not Found
            </h2>
            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {error || "The tour you're looking for doesn't exist."}
            </p>
            <Link to="/tours" className="mt-4 inline-block px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-all">
              Browse Tours
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
      <Navbar />

      {/* Connection Status */}
      {isConnected && (
        <div className="bg-green-500/10 border-b border-green-500/20 py-1 px-4 text-center">
          <span className="text-xs text-green-500 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            Live updates • Real-time tour & review updates
          </span>
        </div>
      )}

      {/* Professional Image Slider */}
      <section className="relative pt-16">
        <div 
          className="relative h-[60vh] md:h-[70vh] overflow-hidden bg-black"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentImageIndex}
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
              className="absolute inset-0"
            >
              <img 
                src={tour.images[currentImageIndex]} 
                alt={`${tour.title} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
            </motion.div>
          </AnimatePresence>

          {/* Image Counter */}
          {tour.images.length > 1 && (
            <div className="absolute top-6 left-6 z-20 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium flex items-center gap-2">
              <Image className="w-4 h-4" />
              {currentImageIndex + 1} / {tour.images.length}
            </div>
          )}

          {/* Badge and Duration */}
          <div className="absolute top-6 left-24 z-20 flex flex-wrap gap-2">
            {tour.badge && (
              <span className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-sm font-semibold shadow-lg shadow-amber-500/30">
                {tour.badge}
              </span>
            )}
            <span className="px-4 py-2 bg-black/60 backdrop-blur-sm text-white rounded-full text-sm font-medium border border-white/10">
              {tour.duration}
            </span>
          </div>

          {/* Controls - Top Right */}
          <div className="absolute top-6 right-6 z-20 flex flex-col gap-2">
            <button
              onClick={toggleFavorite}
              className={`p-3 rounded-full transition-all hover:scale-110 backdrop-blur-sm ${
                isFavorite 
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' 
                  : 'bg-black/50 text-white hover:bg-amber-500 hover:text-white'
              }`}
            >
              <Heart className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} />
            </button>
            <button
              onClick={handleShare}
              className="p-3 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-amber-500 transition-all hover:scale-110"
            >
              <Share2 className="w-5 h-5" />
            </button>
            {tour.images.length > 1 && (
              <button
                onClick={toggleFullscreen}
                className="p-3 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-amber-500 transition-all hover:scale-110"
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
            )}
          </div>

          {/* Navigation Arrows */}
          {tour.images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-amber-500 transition-all hover:scale-110 group"
              >
                <ChevronLeft className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </button>
              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-3 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-amber-500 transition-all hover:scale-110 group"
              >
                <ChevronRight className="w-6 h-6 group-hover:scale-110 transition-transform" />
              </button>
            </>
          )}

          {/* Bottom Controls */}
          {tour.images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-4">
              <div className="flex gap-2 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full">
                {tour.images.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`transition-all duration-300 rounded-full ${
                      index === currentImageIndex 
                        ? 'bg-amber-400 w-8 h-2.5' 
                        : 'bg-white/50 w-2.5 h-2.5 hover:bg-white/80'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={toggleAutoPlay}
                className="p-2 rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-amber-500 transition-all hover:scale-110"
              >
                {isAutoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
            </div>
          )}

          {/* Thumbnail Strip */}
          {tour.images.length > 1 && showThumbnails && (
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20 flex gap-2 overflow-x-auto max-w-[80%] px-4 py-2 bg-black/30 backdrop-blur-sm rounded-xl">
              {tour.images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  className={`flex-shrink-0 w-16 h-12 rounded-lg overflow-hidden transition-all duration-300 ${
                    index === currentImageIndex 
                      ? 'ring-2 ring-amber-400 scale-105 shadow-lg shadow-amber-500/30' 
                      : 'opacity-60 hover:opacity-100'
                  }`}
                >
                  <img 
                    src={img} 
                    alt={`Thumbnail ${index + 1}`} 
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container-custom">
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="space-y-8">
                {/* Title & Rating */}
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h1 className={`text-3xl md:text-4xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {tour.title}
                      </h1>
                      <div className="flex items-center gap-4 mt-2 flex-wrap">
                        <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          <MapPin className="w-4 h-4" />
                          {tour.location}
                        </span>
                        <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          <ClockIcon className="w-4 h-4" />
                          {tour.duration}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-amber-400">
                        <Star className="w-5 h-5 fill-current" />
                        <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          {tour.rating}
                        </span>
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          ({tour.reviews} reviews)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                        activeTab === tab
                          ? 'bg-amber-500 text-white'
                          : isDark
                            ? 'hover:bg-gray-800 text-gray-400'
                            : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                {/* Tab Content - Overview */}
                <div className="space-y-6">
                  {activeTab === 'overview' && (
                    <>
                      <p className={`whitespace-pre-line ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                        {tour.longDescription || tour.description}
                      </p>

                      {tour.languages && tour.languages.length > 0 && (
                        <div>
                          <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            Languages Available
                          </h3>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {tour.languages.map((lang, i) => (
                              <span key={i} className={`px-3 py-1 rounded-full text-sm ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                {lang}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            What's Included
                          </h3>
                          <ul className="mt-2 space-y-2">
                            {tour.includes.map((item, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                                  {item}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            What's Not Included
                          </h3>
                          <ul className="mt-2 space-y-2">
                            {tour.excludes.map((item, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <X className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                                  {item}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      {/* Group Size */}
                      <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        <div className="flex items-center gap-3">
                          <Users className="w-5 h-5 text-amber-500" />
                          <div>
                            <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                              Group Size
                            </h4>
                            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {tour.groupSize?.min || tour.minGroup || 2} - {tour.groupSize?.max || tour.maxGroup || 20} participants
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* GUIDE SECTION */}
                      {tour.guide && tour.guide.name && (
                        <div>
                          <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            Your Guide
                          </h3>
                          <div className={`mt-3 p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                            <div className="flex items-center gap-4">
                              <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                                {tour.guide.avatar ? (
                                  <img src={tour.guide.avatar} alt={tour.guide.name} className="w-full h-full object-cover" />
                                ) : (
                                  tour.guide.name?.charAt(0) || 'G'
                                )}
                              </div>
                              <div>
                                <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                  {tour.guide.name}
                                </h4>
                                {tour.guide.experience > 0 && (
                                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {tour.guide.experience} years experience
                                  </p>
                                )}
                                {tour.guide.rating > 0 && (
                                  <div className="flex items-center gap-1 text-amber-400 text-sm">
                                    <Star className="w-4 h-4 fill-current" />
                                    <span>{tour.guide.rating}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            {tour.guide.bio && (
                              <p className={`mt-2 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                {tour.guide.bio}
                              </p>
                            )}
                            {tour.guide.languages && tour.guide.languages.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {tour.guide.languages.map((lang, i) => (
                                  <span key={i} className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                    {lang}
                                  </span>
                                ))}
                              </div>
                            )}
                            {(tour.guide.phone || tour.guide.email) && (
                              <div className="mt-2 flex flex-wrap gap-3 text-sm">
                                {tour.guide.phone && (
                                  <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    <Phone className="w-4 h-4" />
                                    {tour.guide.phone}
                                  </span>
                                )}
                                {tour.guide.email && (
                                  <span className={`flex items-center gap-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    <Mail className="w-4 h-4" />
                                    {tour.guide.email}
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* TRANSPORT SECTION */}
                      {tour.transport && (
                        <div>
                          <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            Transport
                          </h3>
                          <div className={`mt-3 p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                            <div className="flex items-center gap-3">
                              {React.createElement(getTransportIcon(tour.transport.type), {
                                className: "w-6 h-6 text-amber-500"
                              })}
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                    {tour.transport.type || 'Bus'}
                                  </span>
                                  <span className={`text-sm ${tour.transport.included ? 'text-green-500' : 'text-red-500'}`}>
                                    {tour.transport.included ? '✓ Included' : '✗ Not Included'}
                                  </span>
                                </div>
                                {tour.transport.description && (
                                  <p className={`mt-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {tour.transport.description}
                                  </p>
                                )}
                                {tour.transport.details && (
                                  <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                    {tour.transport.details}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* ENTRY FEES SECTION */}
                      {tour.entryFees && (
                        <div>
                          <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            Entry Fees
                          </h3>
                          <div className={`mt-3 p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                {tour.entryFees.included ? '✓ Included' : '✗ Not Included'}
                              </span>
                              {tour.entryFees.amount > 0 && (
                                <span className={`text-sm font-bold text-amber-500`}>
                                  ₵{tour.entryFees.amount}
                                </span>
                              )}
                            </div>
                            {tour.entryFees.description && (
                              <p className={`mt-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                {tour.entryFees.description}
                              </p>
                            )}
                            {tour.entryFees.sites && tour.entryFees.sites.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-1">
                                {tour.entryFees.sites.map((site, i) => (
                                  <span key={i} className={`text-xs px-2 py-1 rounded-full ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                                    {site}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* MEALS SECTION */}
                      {tour.meals && (
                        <div>
                          <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            Meals
                          </h3>
                          <div className={`mt-3 p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                {tour.meals.included ? '✓ Included' : '✗ Not Included'}
                              </span>
                              {tour.meals.type && (
                                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                  {tour.meals.type}
                                </span>
                              )}
                              {tour.meals.count > 0 && (
                                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  ({tour.meals.count} meals)
                                </span>
                              )}
                            </div>
                            {tour.meals.description && (
                              <p className={`mt-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                {tour.meals.description}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {/* ACCOMMODATION SECTION */}
                      {tour.accommodation && (
                        <div>
                          <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            Accommodation
                          </h3>
                          <div className={`mt-3 p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                {tour.accommodation.included ? '✓ Included' : '✗ Not Included'}
                              </span>
                              {tour.accommodation.type && (
                                <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                  {tour.accommodation.type}
                                </span>
                              )}
                              {tour.accommodation.nights > 0 && (
                                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  ({tour.accommodation.nights} nights)
                                </span>
                              )}
                            </div>
                            {tour.accommodation.description && (
                              <p className={`mt-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                {tour.accommodation.description}
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {/* Tab Content - Itinerary */}
                  {activeTab === 'itinerary' && (
                    <div className="space-y-6">
                      {tour.itinerary && tour.itinerary.length > 0 ? (
                        tour.itinerary.map((day, index) => (
                          <div key={index} className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                            <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                              Day {day.day}: {day.title}
                            </h3>
                            <ul className="mt-2 space-y-1">
                              {day.activities.map((activity, idx) => (
                                <li key={idx} className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                                  • {activity}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))
                      ) : (
                        <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          No itinerary available for this tour.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Tab Content - Amenities */}
                  {activeTab === 'amenities' && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {tour.amenities && tour.amenities.length > 0 ? (
                        tour.amenities.map((amenity, index) => (
                          <div key={index} className={`p-3 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'} text-center`}>
                            <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                              {amenity}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className={`col-span-full ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          No amenities listed for this tour.
                        </p>
                      )}
                    </div>
                  )}

                  {/* Tab Content - Reviews */}
                  {activeTab === 'reviews' && (
                    <div className="space-y-6">
                      {/* Review Stats */}
                      <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        <div className="flex flex-col md:flex-row items-center gap-6">
                          <div className="text-center">
                            <div className="text-5xl font-bold text-amber-500">
                              {reviewStats.average || 0}
                            </div>
                            <div className="flex items-center justify-center gap-1 mt-1">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-5 h-5 ${
                                    i < Math.floor(reviewStats.average || 0)
                                      ? 'fill-amber-400 text-amber-400'
                                      : i < Math.ceil(reviewStats.average || 0) && (reviewStats.average || 0) % 1 > 0
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-gray-300 dark:text-gray-600'
                                  }`}
                                />
                              ))}
                            </div>
                            <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {reviewStats.total} reviews
                            </div>
                          </div>
                          <div className="flex-1 w-full">
                            {[5, 4, 3, 2, 1].map((star) => {
                              const count = reviewStats.distribution?.[star] || 0
                              const percentage = reviewStats.total > 0 ? (count / reviewStats.total) * 100 : 0
                              return (
                                <div key={star} className="flex items-center gap-2 text-sm">
                                  <span className="w-6 text-right">{star}</span>
                                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                  <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                  <span className="w-8 text-right text-gray-500">{count}</span>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </div>

                      {/* Write Review Button */}
                      {user ? (
                        <button
                          onClick={() => setShowReviewForm(!showReviewForm)}
                          className="px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-all flex items-center gap-2"
                        >
                          <Edit3 className="w-4 h-4" />
                          Write a Review
                        </button>
                      ) : (
                        <button
                          onClick={() => navigate('/login', { state: { from: window.location.pathname } })}
                          className="px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-all flex items-center gap-2"
                        >
                          <LogIn className="w-4 h-4" />
                          Login to Write a Review
                        </button>
                      )}

                      {/* Review Form */}
                      {showReviewForm && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                        >
                          <form onSubmit={handleReviewSubmit} className="space-y-4">
                            <div>
                              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                Rating *
                              </label>
                              <div className="flex gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    type="button"
                                    onClick={() => setReviewFormData({ ...reviewFormData, rating: star })}
                                    className="focus:outline-none"
                                  >
                                    <Star
                                      className={`w-8 h-8 transition-all ${
                                        star <= reviewFormData.rating
                                          ? 'fill-amber-400 text-amber-400 hover:scale-110'
                                          : 'text-gray-300 dark:text-gray-600 hover:text-amber-400'
                                      }`}
                                    />
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div>
                              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                Review Title *
                              </label>
                              <input
                                type="text"
                                required
                                value={reviewFormData.title}
                                onChange={(e) => setReviewFormData({ ...reviewFormData, title: e.target.value })}
                                className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                                  isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-200'
                                } border focus:border-amber-500 transition-colors`}
                                placeholder="Summarize your experience..."
                              />
                            </div>

                            <div>
                              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                                Your Review *
                              </label>
                              <textarea
                                required
                                rows={4}
                                value={reviewFormData.comment}
                                onChange={(e) => setReviewFormData({ ...reviewFormData, comment: e.target.value })}
                                className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                                  isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-200'
                                } border focus:border-amber-500 transition-colors resize-none`}
                                placeholder="Share your experience with this tour..."
                              />
                            </div>

                            <div className="flex items-center gap-3">
                              <button
                                type="button"
                                onClick={() => setShowReviewForm(false)}
                                className={`px-6 py-2.5 rounded-xl ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-all`}
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={reviewLoading}
                                className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:scale-105 transition-all disabled:opacity-50"
                              >
                                {reviewLoading ? 'Submitting...' : 'Submit Review'}
                              </button>
                            </div>
                          </form>
                        </motion.div>
                      )}

                      {/* Review List */}
                      <div className="space-y-4">
                        {reviews.length === 0 ? (
                          <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No reviews yet. Be the first to review this tour!</p>
                          </div>
                        ) : (
                          reviews.map((review) => (
                            <div
                              key={review._id}
                              className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
                            >
                              <div className="flex items-start gap-4">
                                <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 overflow-hidden">
                                  {review.userAvatar ? (
                                    <img src={review.userAvatar} alt={review.userName} className="w-full h-full object-cover" />
                                  ) : (
                                    review.userName?.charAt(0) || 'U'
                                  )}
                                </div>
                                <div className="flex-1">
                                  <div className="flex items-center justify-between flex-wrap gap-2">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                          {review.userName}
                                        </span>
                                        {review.verified && (
                                          <span className="text-xs text-green-500 flex items-center gap-0.5">
                                            <Verified className="w-3 h-3" />
                                            Verified
                                          </span>
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2 mt-0.5">
                                        <div className="flex gap-0.5">
                                          {[...Array(5)].map((_, i) => (
                                            <Star
                                              key={i}
                                              className={`w-4 h-4 ${
                                                i < review.rating
                                                  ? 'fill-amber-400 text-amber-400'
                                                  : 'text-gray-300 dark:text-gray-600'
                                              }`}
                                            />
                                          ))}
                                        </div>
                                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                          {new Date(review.date).toLocaleDateString()}
                                        </span>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() => {
                                          showToast('Thank you for your feedback!', 'success')
                                        }}
                                        className={`flex items-center gap-1 text-xs ${isDark ? 'text-gray-400 hover:text-amber-400' : 'text-gray-500 hover:text-amber-500'} transition-colors`}
                                      >
                                        <ThumbsUpIcon className="w-3 h-3" />
                                        Helpful ({review.helpful || 0})
                                      </button>
                                    </div>
                                  </div>
                                  <h4 className={`font-semibold mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                    {review.title}
                                  </h4>
                                  <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                    {review.comment}
                                  </p>
                                  {review.images && review.images.length > 0 && (
                                    <div className="flex gap-2 mt-2">
                                      {review.images.slice(0, 3).map((img, i) => (
                                        <img
                                          key={i}
                                          src={img}
                                          alt={`Review image ${i + 1}`}
                                          className="w-16 h-16 object-cover rounded-lg"
                                        />
                                      ))}
                                      {review.images.length > 3 && (
                                        <div className={`w-16 h-16 rounded-lg flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-200'} text-sm`}>
                                          +{review.images.length - 3}
                                        </div>
                                      )}
                                    </div>
                                  )}
                                  {review.reply && review.reply.admin && (
                                    <div className={`mt-3 p-3 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'} border-l-2 border-amber-500`}>
                                      <div className="flex items-center gap-2 text-sm">
                                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                          Admin Response
                                        </span>
                                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                          {new Date(review.reply.date).toLocaleDateString()}
                                        </span>
                                      </div>
                                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                        {review.reply.admin}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column - Booking Card */}
            <div className="lg:col-span-1">
              <div className={`sticky top-24 p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-2xl`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-3xl font-bold text-amber-500">₵{tour.price}</span>
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}> / person</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-4 h-4 fill-current" />
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {tour.rating}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Select Date
                    </label>
                    <select
                      value={selectedDate || ''}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl outline-none ${
                        isDark 
                          ? 'bg-gray-700 text-white border-gray-600' 
                          : 'bg-gray-50 text-gray-800 border-gray-200'
                      } border focus:border-amber-500 transition-colors`}
                    >
                      <option value="">Select a date</option>
                      {tour.availableDates && tour.availableDates.map((date) => (
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
                      Number of Guests
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setGuests(Math.max(1, guests - 1))}
                        className={`p-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-all`}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {guests}
                      </span>
                      <button
                        onClick={() => setGuests(Math.min(tour.maxGroup || 20, guests + 1))}
                        className={`p-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-all`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                      <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        (max {tour.maxGroup || 20})
                      </span>
                    </div>
                  </div>

                  <div className={`pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                        {guests} × ₵{tour.price}
                      </span>
                      <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        ₵{(tour.price * guests).toLocaleString()}
                      </span>
                    </div>
                    <button
                      onClick={openBookingModal}
                      disabled={isProcessing}
                      className={`w-full mt-4 px-6 py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                        isProcessing
                          ? 'bg-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:scale-105 shadow-lg shadow-amber-500/30'
                      }`}
                    >
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Calendar className="w-5 h-5" />
                          Book Now
                        </>
                      )}
                    </button>
                  </div>

                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'} text-center`}>
                    <Lock className="w-4 h-4 inline mr-1" />
                    Secure booking powered by Paystack
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Modal with Paystack */}
      <AnimatePresence>
        {showBookingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`max-w-2xl w-full mx-4 p-6 rounded-2xl ${isDark ? 'bg-gray-900' : 'bg-white'} shadow-2xl max-h-[90vh] overflow-y-auto`}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {bookingSuccess ? 'Booking Confirmed! 🎉' : 
                   showPayment ? 'Complete Payment' :
                   bookingStep === 1 ? 'Book Your Journey' : 
                   'Review & Confirm'}
                </h3>
                {!bookingSuccess && !showPayment && (
                  <button
                    onClick={() => {
                      setShowBookingModal(false)
                      setBookingStep(1)
                      setBookingSuccess(false)
                      setShowPayment(false)
                      setBookingError(null)
                      setIsProcessing(false)
                      setIsSubmitting(false)
                    }}
                    className={`p-2 rounded-full ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {bookingSuccess ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-8"
                >
                  <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Check className="w-10 h-10 text-white" />
                  </div>
                  <h4 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Booking Confirmed!
                  </h4>
                  <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Your tour has been booked successfully.
                    We'll send you a confirmation email with all the details.
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
                  amount={tour.price * guests}
                  email={bookingData.email}
                  name={bookingData.name}
                  tourTitle={tour.title}
                  bookingData={{
                    tourId: tour.id,
                    type: 'tour',
                    date: selectedDate,
                    guests: guests,
                    totalAmount: tour.price * guests,
                    customerName: bookingData.name,
                    customerEmail: bookingData.email,
                    customerPhone: bookingData.phone,
                    specialRequests: bookingData.specialRequests
                  }}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  onClose={handlePaymentClose}
                />
              ) : (
                <>
                  <div className="flex items-center justify-center gap-2 mb-6">
                    {[1, 2].map((step) => (
                      <div key={step} className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          bookingStep >= step 
                            ? 'bg-amber-500 text-white' 
                            : isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-200 text-gray-500'
                        }`}>
                          {step}
                        </div>
                        {step < 2 && (
                          <div className={`w-12 h-0.5 ${bookingStep > step ? 'bg-amber-500' : isDark ? 'bg-gray-700' : 'bg-gray-200'}`} />
                        )}
                      </div>
                    ))}
                  </div>

                  {bookingStep === 1 && (
                    <div className="space-y-4">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={bookingData.name}
                          onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                          className={`w-full px-4 py-3 rounded-xl outline-none ${
                            isDark 
                              ? 'bg-gray-800 text-white border-gray-700' 
                              : 'bg-gray-50 text-gray-800 border-gray-200'
                          } border focus:border-amber-500 transition-colors`}
                          placeholder="John Doe"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Email Address *
                        </label>
                        <input
                          type="email"
                          value={bookingData.email}
                          onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                          className={`w-full px-4 py-3 rounded-xl outline-none ${
                            isDark 
                              ? 'bg-gray-800 text-white border-gray-700' 
                              : 'bg-gray-50 text-gray-800 border-gray-200'
                          } border focus:border-amber-500 transition-colors`}
                          placeholder="john@example.com"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Phone Number
                        </label>
                        <input
                          type="tel"
                          value={bookingData.phone}
                          onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                          className={`w-full px-4 py-3 rounded-xl outline-none ${
                            isDark 
                              ? 'bg-gray-800 text-white border-gray-700' 
                              : 'bg-gray-50 text-gray-800 border-gray-200'
                          } border focus:border-amber-500 transition-colors`}
                          placeholder="+233 55 123 4567"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          Special Requests
                        </label>
                        <textarea
                          rows={3}
                          value={bookingData.specialRequests}
                          onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
                          className={`w-full px-4 py-3 rounded-xl outline-none ${
                            isDark 
                              ? 'bg-gray-800 text-white border-gray-700' 
                              : 'bg-gray-50 text-gray-800 border-gray-200'
                          } border focus:border-amber-500 transition-colors resize-none`}
                          placeholder="Any dietary restrictions, accessibility needs, or special requests..."
                        />
                      </div>

                      {bookingError && (
                        <div className={`p-4 rounded-xl flex items-center gap-2 ${
                          isDark ? 'bg-red-900/30' : 'bg-red-50'
                        } border border-red-500/30`}>
                          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                          <span className={isDark ? 'text-red-400' : 'text-red-600'}>{bookingError}</span>
                        </div>
                      )}

                      <button
                        onClick={() => setBookingStep(2)}
                        disabled={isProcessing}
                        className={`w-full px-6 py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                          isProcessing
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:scale-105'
                        }`}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            Continue to Review
                            <ArrowRight className="w-5 h-5" />
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  {bookingStep === 2 && (
                    <div className="space-y-4">
                      <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          Booking Summary
                        </h4>
                        <div className="mt-2 space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Tour</span>
                            <span className={isDark ? 'text-white' : 'text-gray-800'}>{tour.title}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Date</span>
                            <span className={isDark ? 'text-white' : 'text-gray-800'}>
                              {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              }) : 'Not selected'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Guests</span>
                            <span className={isDark ? 'text-white' : 'text-gray-800'}>{guests}</span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-gray-200/20">
                            <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Total Price</span>
                            <span className="font-bold text-amber-500 text-lg">
                              ₵{(tour.price * guests).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          Payment Method
                        </h4>
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                          You will be redirected to Paystack to complete payment securely.
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-green-500">
                          <Shield className="w-4 h-4" />
                          Secure payment powered by Paystack
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => setBookingStep(1)}
                          className={`px-6 py-3 rounded-xl ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'} transition-all`}
                        >
                          Back
                        </button>
                        <button
                          onClick={handleBookingInit}
                          disabled={isProcessing || isSubmitting || isRedirecting}
                          className={`flex-1 px-6 py-3 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                            isProcessing || isSubmitting || isRedirecting
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:scale-105'
                          }`}
                        >
                          {isProcessing || isSubmitting || isRedirecting ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              {isRedirecting ? 'Redirecting...' : 'Processing...'}
                            </>
                          ) : (
                            <>
                              <CreditCard className="w-5 h-5" />
                              Proceed to Payment - ₵{(tour.price * guests).toLocaleString()}
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}

export default TourDetails
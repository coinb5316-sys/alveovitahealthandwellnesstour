// src/components/hotels/HotelDetails.jsx
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
  Star, MapPin, Phone, Mail, Globe, CheckCircle, ArrowLeft,
  Heart, Share2, Calendar, Users, Wifi, Coffee, Utensils,
  Dumbbell, Waves, Sun, Moon, Sparkles, Crown, Gem,
  Shield, Award, Clock, X, ChevronLeft, ChevronRight,
  ThumbsUp, MessageCircle, Eye, User, Star as StarIcon,
  Plus, Minus, CreditCard, Lock, AlertCircle, Info,
  Building2, Home, Plane, Car, Bike, Footprints,
  Music, Camera, Video, Image, Upload, Search, Filter,
  ExternalLink, PhoneCall, MailOpen, Map, Navigation,
  Hotel, Bed, Bath, Tv, Wifi as WifiIcon, Coffee as CoffeeIcon,
  Loader2, Play, Pause, Maximize2, Minimize2,
  LogIn, Edit3, Verified, StarHalf, Heart as HeartIcon,
  Printer, Ticket, ReceiptText
} from 'lucide-react'

const HOTEL_BOOKING_KEY = 'alveovita_hotel_booking_data'
const REDIRECT_CHECK_KEY = 'alveovita_booking_redirect'

const HotelDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const { isDark } = useTheme()
  const { user } = useAuth()
  const { createBooking } = useBooking()
  const { showToast } = useToast()
  const { socket, isConnected } = useSocket()
  const autoPlayRef = useRef(null)
  
  const [hotel, setHotel] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isFavorite, setIsFavorite] = useState(false)
  const [favoriteId, setFavoriteId] = useState(null)
  const [favoriteLoading, setFavoriteLoading] = useState(false)
  const [showShare, setShowShare] = useState(false)
  const [showBookingModal, setShowBookingModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState(null)
  const [guests, setGuests] = useState(1)
  const [nights, setNights] = useState(1)
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
  const [activeTab, setActiveTab] = useState('overview')
  const [showAllAmenities, setShowAllAmenities] = useState(false)
  const [showAllReviews, setShowAllReviews] = useState(false)
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
  const [bookingConfirmedData, setBookingConfirmedData] = useState(null)

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

  // Socket.IO event listeners
  useEffect(() => {
    if (!socket) return;

    const handleHotelUpdated = (data) => {
      if (data.hotelId === id) {
        showToast(`🔄 "${data.name}" has been updated`, 'info');
        fetchHotelData();
      }
    };

    const handleNewReview = (data) => {
      if (data.itemId === id && data.reviewType === 'hotel') {
        showToast(`⭐ New review added!`, 'info');
        fetchReviews();
      }
    };

    const handleReviewStatusChanged = (data) => {
      if (data.itemId === id && data.itemType === 'hotel') {
        if (data.newStatus === 'approved') {
          showToast(`✅ Review from ${data.userName} was approved!`, 'success');
          fetchReviews();
          fetchHotelData();
        } else if (data.newStatus === 'rejected') {
          showToast(`❌ Review from ${data.userName} was rejected`, 'warning');
          fetchReviews();
        }
      }
    };

    socket.on('hotel-updated', handleHotelUpdated);
    socket.on('new-review', handleNewReview);
    socket.on('review-status-changed', handleReviewStatusChanged);

    return () => {
      socket.off('hotel-updated', handleHotelUpdated);
      socket.off('new-review', handleNewReview);
      socket.off('review-status-changed', handleReviewStatusChanged);
    };
  }, [socket, id, showToast]);

  // Auto-play functionality
  useEffect(() => {
    if (isAutoPlaying && hotel?.images?.length > 1) {
      autoPlayRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % hotel.images.length)
      }, 4000)
    }
    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current)
      }
    }
  }, [isAutoPlaying, hotel?.images?.length])

  // Fetch reviews function
  const fetchReviews = async () => {
    try {
      const response = await axios.get(`/hotels/${id}/reviews`)
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

  // Check favorite status
  const checkFavoriteStatus = async () => {
    if (!user || !hotel?.id) return
    
    try {
      const response = await axios.get(`/favorites/check/hotel/${hotel.id}`)
      if (response.data.success) {
        setIsFavorite(response.data.isFavorited)
        setFavoriteId(response.data.favoriteId || null)
      }
    } catch (error) {
      console.error('Error checking favorite status:', error)
    }
  }

  // Toggle favorite
  const toggleFavorite = async () => {
    if (!user) {
      showToast('Please login to save favorites', 'info')
      navigate('/login')
      return
    }

    if (favoriteLoading) return
    
    setFavoriteLoading(true)
    
    try {
      if (isFavorite && favoriteId) {
        await axios.delete(`/favorites/${favoriteId}`)
        setIsFavorite(false)
        setFavoriteId(null)
        showToast(`Removed "${hotel.name}" from favorites`, 'success')
        
        if (socket) {
          socket.emit('favorite-removed', {
            favoriteId: favoriteId,
            userId: user.id,
            userName: user.name,
            itemType: 'hotel',
            itemId: hotel.id,
            itemName: hotel.name,
          })
        }
      } else {
        const response = await axios.post('/favorites', {
          itemType: 'hotel',
          itemId: hotel.id
        })
        
        if (response.data.success) {
          setIsFavorite(true)
          setFavoriteId(response.data.favorite._id)
          showToast(`Added "${hotel.name}" to favorites ❤️`, 'success')
          
          if (socket) {
            socket.emit('favorite-added', {
              favoriteId: response.data.favorite._id,
              userId: user.id,
              userName: user.name,
              itemType: 'hotel',
              itemId: hotel.id,
              itemName: hotel.name,
            })
          }
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
      showToast('Failed to update favorites', 'error')
    } finally {
      setFavoriteLoading(false)
    }
  }

  // Fetch hotel data function
  const fetchHotelData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await axios.get(`/hotels/${id}`)
      
      if (response.data.success) {
        const hotelData = response.data.hotel
        const formattedHotel = {
          ...hotelData,
          id: hotelData._id,
          price: hotelData.price || 0,
          image: hotelData.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
          images: hotelData.images?.length ? hotelData.images : ['https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'],
          amenities: hotelData.amenities || [],
          rating: hotelData.rating || 0,
          reviews: hotelData.reviews || 0,
          checkIn: hotelData.checkIn || '2:00 PM',
          checkOut: hotelData.checkOut || '12:00 PM',
          status: hotelData.status || 'active',
          rooms: hotelData.rooms || 50,
          phone: hotelData.phone || '+233 55 123 4567',
          email: hotelData.email || 'info@hotel.com',
          website: hotelData.website || 'www.hotel.com',
          badge: hotelData.badge || '',
          region: hotelData.region || ''
        }
        setHotel(formattedHotel)
        
        if (user) {
          setBookingData(prev => ({
            ...prev,
            name: user.name || prev.name,
            email: user.email || prev.email
          }))
        }

        await fetchReviews()
        await checkFavoriteStatus()
      } else {
        setError('Hotel not found')
      }
    } catch (err) {
      console.error('Error fetching hotel:', err)
      setError(err.response?.data?.message || 'Failed to load hotel details')
      showToast('Failed to load hotel details', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Fetch hotel from backend
  useEffect(() => {
    fetchHotelData()
  }, [id, user])

  // Review submission handler
  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    setReviewLoading(true)
    
    try {
      const response = await axios.post(`/hotels/${id}/reviews`, reviewFormData)
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

  // Check for redirect from login and restore booking state
  useEffect(() => {
    const redirectFlag = sessionStorage.getItem(REDIRECT_CHECK_KEY)
    const savedData = localStorage.getItem(HOTEL_BOOKING_KEY)

    if (redirectFlag === 'true' && savedData && hotel) {
      try {
        const parsed = JSON.parse(savedData)
        if (parsed.hotelId === hotel.id) {
          setSelectedDate(parsed.selectedDate)
          setGuests(parsed.guests || 1)
          setNights(parsed.nights || 1)
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
    if (params.get('booking') === 'true') {
      setTimeout(() => {
        setShowBookingModal(true)
      }, 500)
    }
  }, [hotel, location.search])

  // Save booking data to localStorage whenever it changes
  useEffect(() => {
    if (hotel && (selectedDate || guests > 1 || nights > 1 || bookingData.name || bookingData.email)) {
      const dataToSave = {
        hotelId: hotel.id,
        selectedDate,
        guests,
        nights,
        name: bookingData.name,
        email: bookingData.email,
        phone: bookingData.phone,
        specialRequests: bookingData.specialRequests,
        paymentMethod: bookingData.paymentMethod,
        bookingStep
      }
      localStorage.setItem(HOTEL_BOOKING_KEY, JSON.stringify(dataToSave))
    }
  }, [hotel, selectedDate, guests, nights, bookingData, bookingStep])

  const clearSavedBooking = () => {
    localStorage.removeItem(HOTEL_BOOKING_KEY)
    sessionStorage.removeItem(REDIRECT_CHECK_KEY)
  }

  const handleShare = async () => {
    const shareData = {
      title: hotel.name,
      text: `Check out ${hotel.name} in ${hotel.location}!`,
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
          setCurrentImageIndex((prev) => (prev + 1) % hotel.images.length)
        }, 4000)
      }
    }
  }

  const nextImage = () => {
    if (hotel && hotel.images) {
      goToSlide((currentImageIndex + 1) % hotel.images.length)
    }
  }

  const prevImage = () => {
    if (hotel && hotel.images) {
      goToSlide((currentImageIndex - 1 + hotel.images.length) % hotel.images.length)
    }
  }

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying)
    if (!isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        setCurrentImageIndex((prev) => (prev + 1) % hotel.images.length)
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
    if (isProcessing || isSubmitting) {
      return
    }
    
    setBookingError(null)
    setIsProcessing(true)
    setIsSubmitting(true)
    
    if (!user) {
      const bookingState = {
        hotelId: hotel.id,
        selectedDate,
        guests,
        nights,
        name: bookingData.name,
        email: bookingData.email,
        phone: bookingData.phone,
        specialRequests: bookingData.specialRequests,
        paymentMethod: bookingData.paymentMethod,
        bookingStep
      }
      localStorage.setItem(HOTEL_BOOKING_KEY, JSON.stringify(bookingState))
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

    if (!selectedDate) {
      setBookingError('Please select a date')
      setIsProcessing(false)
      setIsSubmitting(false)
      return
    }

    if (!bookingData.name || !bookingData.email) {
      setBookingError('Please fill in all required fields')
      setIsProcessing(false)
      setIsSubmitting(false)
      return
    }

    const totalAmount = hotel.price * nights * guests

    try {
      const existingBookingRes = await axios.get(`/bookings/mine`)
      let existingBooking = null
      
      if (existingBookingRes.data.success) {
        const pendingBookings = existingBookingRes.data.bookings.filter(
          b => b.hotelId === hotel.id && b.status === 'pending'
        )
        if (pendingBookings.length > 0) {
          existingBooking = pendingBookings[0]
          showToast('Found existing pending booking. Please complete payment.', 'info')
        }
      }

      let bookingResult

      if (existingBooking) {
        const updateRes = await axios.patch(`/bookings/${existingBooking._id}`, {
          guests: guests,
          nights: nights,
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
        bookingResult = await createBooking({
          hotelId: hotel.id,
          hotelName: hotel.name,
          hotelPrice: hotel.price,
          date: selectedDate,
          nights: nights,
          guests: guests,
          customerName: bookingData.name,
          customerEmail: bookingData.email,
          customerPhone: bookingData.phone,
          specialRequests: bookingData.specialRequests,
          totalAmount: totalAmount,
          status: 'pending',
          type: 'hotel'
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

  // ============================================
// Updated handlePaymentSuccess function for HotelDetails.jsx
// ============================================
const handlePaymentSuccess = async (paymentData) => {
  try {
    console.log('💰 Payment success data received:', paymentData);
    
    if (!paymentData || !paymentData.success) {
      console.warn('Payment was not successful:', paymentData);
      showToast('Payment was not successful. Please try again.', 'error');
      setIsProcessing(false);
      setIsSubmitting(false);
      return;
    }
    
    const bookingInfo = paymentData?.booking || {};
    const reference = paymentData?.reference || bookingReference;
    
    console.log('📋 Booking info from payment:', bookingInfo);
    
    if (bookingInfo.status === 'confirmed' || bookingInfo.paymentStatus === 'paid') {
      setBookingConfirmedData({
        id: bookingInfo.id || bookingReference,
        reference: reference,
        amount: hotel.price * nights * guests,
        name: hotel.name,
        type: 'hotel',
        date: selectedDate,
        nights: nights,
        guests: guests,
        customerName: bookingData.name,
        customerEmail: bookingData.email,
        paymentReference: reference,
        status: 'confirmed',
        destination: hotel.location
      });
      
      setBookingSuccess(true);
      setShowPayment(false);
      setIsProcessing(false);
      setIsSubmitting(false);
      
      showToast('🎉 Payment successful! Your booking is confirmed.', 'success');
      setPaymentAttempted(false);
      clearSavedBooking();

      setTimeout(() => {
        setShowBookingModal(false);
        navigate('/dashboard');
      }, 6000);
    } else {
      try {
        const bookingId = bookingInfo.id || bookingReference;
        if (bookingId) {
          const fetchResponse = await axios.get(`/bookings/${bookingId}`);
          if (fetchResponse.data.success && fetchResponse.data.booking) {
            const updatedBooking = fetchResponse.data.booking;
            if (updatedBooking.status === 'confirmed') {
              setBookingConfirmedData({
                id: updatedBooking._id,
                reference: reference,
                amount: hotel.price * nights * guests,
                name: hotel.name,
                type: 'hotel',
                date: selectedDate,
                nights: nights,
                guests: guests,
                customerName: bookingData.name,
                customerEmail: bookingData.email,
                paymentReference: reference,
                status: 'confirmed',
                destination: hotel.location
              });
              
              setBookingSuccess(true);
              setShowPayment(false);
              setIsProcessing(false);
              setIsSubmitting(false);
              
              showToast('🎉 Payment successful! Your booking is confirmed.', 'success');
              setPaymentAttempted(false);
              clearSavedBooking();

              setTimeout(() => {
                setShowBookingModal(false);
                navigate('/dashboard');
              }, 6000);
              return;
            }
          }
        }
      } catch (fetchError) {
        console.warn('Could not fetch updated booking:', fetchError);
      }
      
      setBookingSuccess(true);
      setShowPayment(false);
      setIsProcessing(false);
      setIsSubmitting(false);
      showToast('Payment successful! Your booking is being confirmed.', 'success');
      clearSavedBooking();

      setTimeout(() => {
        setShowBookingModal(false);
        navigate('/dashboard');
      }, 6000);
    }
  } catch (error) {
    console.error('Payment success handling error:', error);
    showToast('Payment confirmed but there was an issue updating your booking.', 'warning');
    setIsProcessing(false);
    setIsSubmitting(false);
  }
};

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
    setPaymentAttempted(false)
    setBookingError(null)
    setBookingSuccess(false)
    setBookingConfirmedData(null)
    setShowBookingModal(true)
    const savedData = localStorage.getItem(HOTEL_BOOKING_KEY)
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData)
        if (parsed.hotelId === hotel.id) {
          setSelectedDate(parsed.selectedDate)
          setGuests(parsed.guests || 1)
          setNights(parsed.nights || 1)
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

  // Tabs including reviews
  const tabs = ['overview', 'amenities', 'reviews']

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto">
              <motion.div
                className="absolute inset-0 rounded-full border-4 border-amber-500/20"
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-2 rounded-full border-4 border-amber-500/40"
                animate={{ rotate: -360 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                className="absolute inset-4 rounded-full border-4 border-amber-500/60"
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              />
              <Loader2 className="absolute inset-0 w-16 h-16 text-amber-500 animate-spin mx-auto my-auto" />
            </div>
            <p className={`mt-6 text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading hotel details...</p>
            {isConnected && (
              <span className="text-xs text-green-500 mt-2 block">🟢 Live updates connected</span>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (error || !hotel) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
        <Navbar />
        <div className="container-custom py-24 text-center">
          <AlertCircle className="w-16 h-16 text-amber-500 mx-auto mb-4" />
          <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Hotel not found
          </h2>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {error || "The hotel you're looking for doesn't exist."}
          </p>
          <Link to="/hotels" className="mt-4 inline-block px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-all">
            Browse Hotels
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const totalPrice = hotel.price * nights * guests

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <Navbar />

      {/* Connection Status */}
      {isConnected && (
        <div className="bg-green-500/10 border-b border-green-500/20 py-1 px-4 text-center">
          <span className="text-xs text-green-500 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            Live updates • Real-time hotel & review updates
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
                src={hotel.images[currentImageIndex]} 
                alt={`${hotel.name} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
            </motion.div>
          </AnimatePresence>

          {/* Image Counter */}
          {hotel.images.length > 1 && (
            <div className="absolute top-6 left-6 z-20 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium flex items-center gap-2">
              <Image className="w-4 h-4" />
              {currentImageIndex + 1} / {hotel.images.length}
            </div>
          )}

          {/* Badge */}
          <div className="absolute top-6 left-24 z-20 flex flex-wrap gap-2">
            {hotel.badge && (
              <span className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-full text-sm font-semibold shadow-lg shadow-amber-500/30">
                {hotel.badge}
              </span>
            )}
          </div>

          {/* Controls - Top Right */}
          <div className="absolute top-6 right-6 z-20 flex flex-col gap-2">
            <button
              onClick={toggleFavorite}
              disabled={favoriteLoading}
              className={`p-3 rounded-full transition-all hover:scale-110 backdrop-blur-sm ${
                isFavorite 
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' 
                  : 'bg-black/50 text-white hover:bg-amber-500 hover:text-white'
              } ${favoriteLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {favoriteLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Heart className="w-5 h-5" fill={isFavorite ? 'currentColor' : 'none'} />
              )}
            </button>
            <button
              onClick={handleShare}
              className="p-3 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-amber-500 transition-all hover:scale-110"
            >
              <Share2 className="w-5 h-5" />
            </button>
            {hotel.images.length > 1 && (
              <button
                onClick={toggleFullscreen}
                className="p-3 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-amber-500 transition-all hover:scale-110"
              >
                {isFullscreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
              </button>
            )}
          </div>

          {/* Navigation Arrows */}
          {hotel.images.length > 1 && (
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
          {hotel.images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 flex items-center gap-4">
              <div className="flex gap-2 bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full">
                {hotel.images.map((_, index) => (
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
          {hotel.images.length > 1 && showThumbnails && (
            <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20 flex gap-2 overflow-x-auto max-w-[80%] px-4 py-2 bg-black/30 backdrop-blur-sm rounded-xl">
              {hotel.images.map((img, index) => (
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
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h1 className={`text-3xl md:text-4xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {hotel.name}
                  </h1>
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    <div className="flex items-center text-gray-500">
                      <MapPin className="w-4 h-4 mr-1" />
                      {hotel.location}
                    </div>
                    <div className="flex items-center">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="ml-1 font-medium">{hotel.rating}</span>
                      <span className="text-gray-500 text-sm ml-1">({hotel.reviews} reviews)</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${hotel.status === 'active' ? 'bg-green-500/20 text-green-500' : 'bg-yellow-500/20 text-yellow-500'}`}>
                      {hotel.status === 'active' ? 'Active' : hotel.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-amber-500">₵{hotel.price}</div>
                  <div className="text-sm text-gray-500">per night</div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-2 mb-6">
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

              {/* Tab Content */}
              <div className="space-y-6">
                {activeTab === 'overview' && (
                  <>
                    <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                      <p className={`${isDark ? 'text-gray-300' : 'text-gray-600'} leading-relaxed`}>
                        {hotel.description}
                      </p>
                    </div>

                    {/* Highlights */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg text-center`}>
                        <Clock className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                        <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          Check-in: {hotel.checkIn}
                        </div>
                      </div>
                      <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg text-center`}>
                        <Clock className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                        <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          Check-out: {hotel.checkOut}
                        </div>
                      </div>
                      <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg text-center`}>
                        <Bed className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                        <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          {hotel.rooms} Rooms
                        </div>
                      </div>
                      <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg text-center`}>
                        <Award className="w-6 h-6 text-amber-500 mx-auto mb-2" />
                        <div className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          {hotel.badge || 'Premium'}
                        </div>
                      </div>
                    </div>

                    {/* Contact Info */}
                    <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                      <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        Contact Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-gray-600">
                          <Phone className="w-4 h-4 text-amber-500" />
                          <span>{hotel.phone}</span>
                          <a href={`tel:${hotel.phone}`} className="text-sm text-amber-500 hover:underline ml-auto">
                            Call Now
                          </a>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <Mail className="w-4 h-4 text-amber-500" />
                          <span>{hotel.email}</span>
                          <a href={`mailto:${hotel.email}`} className="text-sm text-amber-500 hover:underline ml-auto">
                            Email
                          </a>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                          <Globe className="w-4 h-4 text-amber-500" />
                          <a href={`https://${hotel.website}`} target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition-colors">
                            {hotel.website}
                          </a>
                          <a href={`https://${hotel.website}`} target="_blank" rel="noopener noreferrer" className="text-sm text-amber-500 hover:underline ml-auto">
                            Visit Website
                          </a>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {activeTab === 'amenities' && (
                  <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
                    <h3 className={`font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      Hotel Amenities
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {(showAllAmenities ? hotel.amenities : hotel.amenities.slice(0, 8)).map((amenity, index) => (
                        <div key={index} className={`flex items-center gap-2 p-2 rounded-lg ${
                          isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'
                        } transition-colors`}>
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                            {amenity}
                          </span>
                        </div>
                      ))}
                    </div>
                    {hotel.amenities.length > 8 && (
                      <button
                        onClick={() => setShowAllAmenities(!showAllAmenities)}
                        className="mt-4 text-amber-500 hover:text-amber-600 transition-colors text-sm font-medium"
                      >
                        {showAllAmenities ? 'Show Less' : `Show All ${hotel.amenities.length} Amenities`}
                      </button>
                    )}
                  </div>
                )}

                {/* REVIEWS TAB */}
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
                              placeholder="Share your experience with this hotel..."
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
                          <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No reviews yet. Be the first to review this hotel!</p>
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

            {/* Booking Card */}
            <div className="lg:col-span-1">
              <div className={`sticky top-24 p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-2xl`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-3xl font-bold text-amber-500">₵{hotel.price}</span>
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}> / night</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-400">
                    <Star className="w-4 h-4 fill-current" />
                    <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {hotel.rating}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Check-in Date
                    </label>
                    <input
                      type="date"
                      value={selectedDate || ''}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl outline-none ${
                        isDark 
                          ? 'bg-gray-700 text-white border-gray-600' 
                          : 'bg-gray-50 text-gray-800 border-gray-200'
                      } border focus:border-amber-500 transition-colors`}
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Number of Nights
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setNights(Math.max(1, nights - 1))}
                        className={`p-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-all`}
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {nights}
                      </span>
                      <button
                        onClick={() => setNights(Math.min(30, nights + 1))}
                        className={`p-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-all`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Guests
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
                        onClick={() => setGuests(Math.min(10, guests + 1))}
                        className={`p-2 rounded-lg ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'} transition-all`}
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className={`pt-4 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>
                        {guests} guests × {nights} nights
                      </span>
                      <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        ₵{totalPrice.toLocaleString()}
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
                  {bookingSuccess ? '🎉 Booking Confirmed!' : 
                   showPayment ? 'Complete Payment' :
                   'Book Your Stay'}
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
                      setBookingConfirmedData(null)
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
                  className="text-center py-6"
                >
                  {/* Success Animation */}
                  <div className="relative w-28 h-28 mx-auto mb-6">
                    <motion.div
                      className="absolute inset-0 rounded-full bg-green-500/20"
                      animate={{ scale: [1, 1.5, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    />
                    <motion.div
                      className="absolute inset-2 rounded-full bg-green-500/40"
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
                    />
                    <div className="absolute inset-0 rounded-full bg-green-500 flex items-center justify-center shadow-2xl shadow-green-500/30">
                      <CheckCircle className="w-14 h-14 text-white" />
                    </div>
                  </div>

                  <h3 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-2`}>
                    Booking Confirmed! 🎉
                  </h3>
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} text-center max-w-sm mx-auto`}>
                    Your stay at {hotel.name} has been booked successfully. A confirmation email has been sent to your email address.
                  </p>

                  {/* Booking Details Card */}
                  <div className={`mt-6 p-5 rounded-xl ${isDark ? 'bg-gray-800/50' : 'bg-gray-50'} border ${isDark ? 'border-gray-700' : 'border-gray-200'} max-w-sm mx-auto text-left`}>
                    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200/20">
                      <Hotel className="w-5 h-5 text-amber-500" />
                      <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>Booking Details</span>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Hotel</span>
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{hotel.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Check-in</span>
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          {selectedDate ? new Date(selectedDate).toLocaleDateString('en-US', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Nights</span>
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{nights}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Guests</span>
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>{guests}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-200/20">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Total Paid</span>
                        <span className="font-bold text-amber-500 text-lg">₵{totalPrice.toLocaleString()}</span>
                      </div>
                      {bookingReference && (
                        <div className="flex justify-between pt-1">
                          <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Reference</span>
                          <span className={`font-mono text-xs ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                            {bookingReference.slice(0, 16)}...
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap justify-center gap-3">
                    <Link
                      to="/dashboard"
                      className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:scale-105 transition-all shadow-lg shadow-amber-500/30"
                    >
                      Go to Dashboard
                    </Link>
                    <Link
                      to="/hotels"
                      className={`px-6 py-3 rounded-xl border ${isDark ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-600'} hover:scale-105 transition-all`}
                    >
                      Browse More Hotels
                    </Link>
                    <button
                      onClick={() => window.print()}
                      className={`px-6 py-3 rounded-xl border ${isDark ? 'border-gray-600 text-gray-300' : 'border-gray-200 text-gray-600'} hover:scale-105 transition-all flex items-center gap-2`}
                    >
                      <Printer className="w-4 h-4" />
                      Print
                    </button>
                  </div>
                  
                  <p className={`mt-4 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    📧 Confirmation email sent to {bookingData.email}
                  </p>
                  
                  <button
                    onClick={() => {
                      setShowBookingModal(false)
                      navigate('/dashboard')
                    }}
                    className="mt-4 text-amber-500 hover:text-amber-600 transition-colors text-sm"
                  >
                    Close this window →
                  </button>
                </motion.div>
              ) : showPayment ? (
                <PaystackPayment
                  amount={totalPrice}
                  email={bookingData.email}
                  name={bookingData.name}
                  tourTitle={`${hotel.name} - Hotel Booking`}
                  bookingData={{
                    hotelId: hotel.id,
                    type: 'hotel',
                    date: selectedDate,
                    nights: nights,
                    guests: guests,
                    totalAmount: totalPrice,
                    customerName: bookingData.name,
                    customerEmail: bookingData.email,
                    customerPhone: bookingData.phone,
                    specialRequests: bookingData.specialRequests,
                    location: hotel.location
                  }}
                  onSuccess={handlePaymentSuccess}
                  onError={handlePaymentError}
                  onClose={handlePaymentClose}
                  onPaymentStart={() => {
                    setBookingError(null);
                    setPaymentAttempted(true);
                  }}
                />
              ) : (
                <div className="space-y-4">
                  <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      Booking Summary
                    </h4>
                    <div className="mt-2 space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Hotel</span>
                        <span className={isDark ? 'text-white' : 'text-gray-800'}>{hotel.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Check-in</span>
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
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Nights</span>
                        <span className={isDark ? 'text-white' : 'text-gray-800'}>{nights}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Guests</span>
                        <span className={isDark ? 'text-white' : 'text-gray-800'}>{guests}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-gray-200/20">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-600'}>Total</span>
                        <span className="font-bold text-amber-500 text-lg">
                          ₵{totalPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <h4 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      Guest Information
                    </h4>
                    <div className="mt-2 space-y-3">
                      <input
                        type="text"
                        placeholder="Full Name *"
                        value={bookingData.name}
                        onChange={(e) => setBookingData({ ...bookingData, name: e.target.value })}
                        className={`w-full px-4 py-2 rounded-xl outline-none ${
                          isDark 
                            ? 'bg-gray-700 text-white border-gray-600' 
                            : 'bg-gray-100 text-gray-800 border-gray-200'
                        } border focus:border-amber-500 transition-colors text-sm`}
                      />
                      <input
                        type="email"
                        placeholder="Email Address *"
                        value={bookingData.email}
                        onChange={(e) => setBookingData({ ...bookingData, email: e.target.value })}
                        className={`w-full px-4 py-2 rounded-xl outline-none ${
                          isDark 
                            ? 'bg-gray-700 text-white border-gray-600' 
                            : 'bg-gray-100 text-gray-800 border-gray-200'
                        } border focus:border-amber-500 transition-colors text-sm`}
                      />
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        value={bookingData.phone}
                        onChange={(e) => setBookingData({ ...bookingData, phone: e.target.value })}
                        className={`w-full px-4 py-2 rounded-xl outline-none ${
                          isDark 
                            ? 'bg-gray-700 text-white border-gray-600' 
                            : 'bg-gray-100 text-gray-800 border-gray-200'
                        } border focus:border-amber-500 transition-colors text-sm`}
                      />
                      <textarea
                        rows={2}
                        placeholder="Special Requests"
                        value={bookingData.specialRequests}
                        onChange={(e) => setBookingData({ ...bookingData, specialRequests: e.target.value })}
                        className={`w-full px-4 py-2 rounded-xl outline-none ${
                          isDark 
                            ? 'bg-gray-700 text-white border-gray-600' 
                            : 'bg-gray-100 text-gray-800 border-gray-200'
                        } border focus:border-amber-500 transition-colors resize-none text-sm`}
                      />
                    </div>
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
                    onClick={handleBookingInit}
                    disabled={isProcessing || isSubmitting || isRedirecting}
                    className={`w-full px-6 py-4 rounded-xl font-medium transition-all flex items-center justify-center gap-2 ${
                      isProcessing || isSubmitting || isRedirecting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:scale-105 shadow-lg shadow-amber-500/30'
                    }`}
                  >
                    {isProcessing || isSubmitting || isRedirecting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {isRedirecting ? 'Redirecting to login...' : 'Processing...'}
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5" />
                        Proceed to Payment - ₵{totalPrice.toLocaleString()}
                      </>
                    )}
                  </button>

                  <div className={`flex items-center justify-center gap-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    <Shield className="w-4 h-4" />
                    Secure payment powered by Paystack
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  )
}

export default HotelDetails
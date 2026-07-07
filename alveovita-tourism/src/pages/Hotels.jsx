// src/pages/Hotels.jsx
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast'
import { useSocket } from '../context/SocketContext'
import axios from '../api/axios'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import { regions } from '../data/tourismData'
import { 
  Star, MapPin, Search, Filter, Grid, List, X, 
  ChevronDown, ChevronLeft, ChevronRight, 
  Sparkles, Award, Users, Heart, Share2, Eye,
  Bed, Wifi, Waves, Dumbbell, Coffee, Utensils,
  Loader2, ArrowUpDown, Building2, Home
} from 'lucide-react'

const Hotels = () => {
  const { isDark } = useTheme()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { socket, isConnected } = useSocket()
  
  const [loading, setLoading] = useState(true)
  const [hotels, setHotels] = useState([])
  const [totalHotels, setTotalHotels] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [viewMode, setViewMode] = useState('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [selectedStatus, setSelectedStatus] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(9)
  const [favorites, setFavorites] = useState([])
  const [priceRange, setPriceRange] = useState({ min: 0, max: 5000 })
  const [notification, setNotification] = useState(null)

  // Socket.IO event listeners
  useEffect(() => {
    if (!socket) return;

    const handleHotelCreated = (data) => {
      setNotification({
        type: 'created',
        message: `✨ New hotel "${data.name}" added!`,
        data
      });
      // Refresh the list if we're on the first page
      if (currentPage === 1) {
        fetchHotels();
      } else {
        setCurrentPage(1);
      }
      showToast(`✨ New hotel: ${data.name}`, 'info');
    };

    const handleHotelUpdated = (data) => {
      setNotification({
        type: 'updated',
        message: `🔄 Hotel "${data.name}" updated!`,
        data
      });
      fetchHotels();
      showToast(`🔄 ${data.name} was updated`, 'info');
    };

    const handleHotelDeleted = (data) => {
      setNotification({
        type: 'deleted',
        message: `🗑️ Hotel "${data.name}" removed!`,
        data
      });
      fetchHotels();
      showToast(`🗑️ ${data.name} was removed`, 'warning');
    };

    socket.on('hotel-created', handleHotelCreated);
    socket.on('hotel-updated', handleHotelUpdated);
    socket.on('hotel-deleted', handleHotelDeleted);

    return () => {
      socket.off('hotel-created', handleHotelCreated);
      socket.off('hotel-updated', handleHotelUpdated);
      socket.off('hotel-deleted', handleHotelDeleted);
    };
  }, [socket, showToast, currentPage]);

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Load favorites from localStorage
  useEffect(() => {
    const savedFavorites = localStorage.getItem('alveovita_favorites')
    if (savedFavorites) {
      try {
        const parsed = JSON.parse(savedFavorites)
        setFavorites(parsed.hotels || [])
      } catch (e) {
        console.error('Error loading favorites:', e)
      }
    }
  }, [])

  // Fetch hotels from backend
  useEffect(() => {
    fetchHotels()
  }, [searchTerm, selectedRegion, selectedStatus, sortBy, currentPage, priceRange])

  const fetchHotels = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams()
      if (searchTerm) params.append('search', searchTerm)
      if (selectedRegion !== 'all') params.append('region', selectedRegion)
      if (selectedStatus !== 'all') params.append('status', selectedStatus)
      
      let sortField = 'createdAt'
      let sortOrder = 'desc'
      switch(sortBy) {
        case 'popular':
          sortField = 'rating'
          sortOrder = 'desc'
          break
        case 'price-low':
          sortField = 'price'
          sortOrder = 'asc'
          break
        case 'price-high':
          sortField = 'price'
          sortOrder = 'desc'
          break
        case 'reviews':
          sortField = 'reviews'
          sortOrder = 'desc'
          break
        default:
          sortField = 'createdAt'
          sortOrder = 'desc'
      }
      
      params.append('sortBy', sortField)
      params.append('sortOrder', sortOrder)
      params.append('page', currentPage)
      params.append('limit', itemsPerPage)
      
      const response = await axios.get(`/hotels?${params.toString()}`)
      
      if (response.data.success) {
        const formattedHotels = response.data.hotels.map(hotel => ({
          ...hotel,
          id: hotel._id,
          price: `₵${hotel.price.toLocaleString()}`,
          image: hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
          amenities: hotel.amenities || [],
          rating: hotel.rating || 0,
          reviews: hotel.reviews || 0,
          status: hotel.status || 'active'
        }))
        
        setHotels(formattedHotels)
        setTotalHotels(response.data.pagination?.total || formattedHotels.length)
        setTotalPages(response.data.pagination?.pages || 1)
      }
    } catch (error) {
      console.error('Error fetching hotels:', error)
      showToast('Failed to load hotels', 'error')
    } finally {
      setLoading(false)
    }
  }

  const toggleFavorite = (hotelId) => {
    if (!user) {
      showToast('Please login to save favorites', 'info')
      navigate('/login')
      return
    }

    const isFavorite = favorites.some(h => h.id === hotelId)
    let updatedFavorites
    
    if (isFavorite) {
      updatedFavorites = favorites.filter(h => h.id !== hotelId)
      showToast('Removed from favorites', 'success')
    } else {
      const hotel = hotels.find(h => h.id === hotelId)
      updatedFavorites = [...favorites, {
        id: hotel.id,
        name: hotel.name,
        location: hotel.location,
        image: hotel.image,
        rating: hotel.rating,
        reviews: hotel.reviews,
        price: hotel.price,
        amenities: hotel.amenities,
        badge: hotel.badge,
        addedDate: new Date().toISOString()
      }]
      showToast('Added to favorites ❤️', 'success')
    }
    
    setFavorites(updatedFavorites)
    localStorage.setItem('alveovita_favorites', JSON.stringify({
      hotels: updatedFavorites,
      tours: JSON.parse(localStorage.getItem('alveovita_favorites') || '{"hotels":[],"tours":[]}').tours || []
    }))
  }

  const isFavorite = (hotelId) => {
    return favorites.some(h => h.id === hotelId)
  }

  const handleShare = async (hotel) => {
    const shareData = {
      title: hotel.name,
      text: `Check out ${hotel.name} in ${hotel.location}!`,
      url: `${window.location.origin}/hotel/${hotel.id}`
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        if (err.name !== 'AbortError') {
          navigator.clipboard.writeText(shareData.url)
          showToast('Link copied to clipboard!', 'success')
        }
      }
    } else {
      navigator.clipboard.writeText(shareData.url)
      showToast('Link copied to clipboard!', 'success')
    }
  }

  const clearFilters = () => {
    setSearchTerm('')
    setSelectedRegion('all')
    setSelectedStatus('all')
    setPriceRange({ min: 0, max: 5000 })
    setSortBy('popular')
  }

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-500/20 text-green-400'
      case 'inactive': return 'bg-red-500/20 text-red-400'
      case 'maintenance': return 'bg-yellow-500/20 text-yellow-400'
      case 'upcoming': return 'bg-blue-500/20 text-blue-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getStatusLabel = (status) => {
    const labels = {
      active: 'Active',
      inactive: 'Inactive',
      maintenance: 'Maintenance',
      upcoming: 'Upcoming'
    }
    return labels[status] || status || 'Active'
  }

  if (loading) {
    return (
      <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-amber-500 animate-spin mx-auto" />
            <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading hotels...</p>
            {isConnected && (
              <span className="text-xs text-green-500 mt-2 block">🟢 Live updates connected</span>
            )}
          </div>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
      <Navbar />

      {/* Connection Status Banner */}
      {isConnected && (
        <div className="bg-green-500/10 border-b border-green-500/20 py-1 px-4 text-center">
          <span className="text-xs text-green-500 flex items-center justify-center gap-2">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
            Live updates enabled • Real-time hotel updates
          </span>
        </div>
      )}

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-2xl ${
              notification.type === 'created' 
                ? 'bg-green-500 text-white' 
                : notification.type === 'updated'
                ? 'bg-blue-500 text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">
                {notification.type === 'created' ? '✨' : notification.type === 'updated' ? '🔄' : '🗑️'}
              </span>
              <span className="font-medium">{notification.message}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1920&q=80)',
          }}
        >
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
              <Building2 className="w-4 h-4" />
              Stay in Style
            </span>
            <h1 className={`text-4xl md:text-5xl font-display font-bold text-white mt-4 leading-tight`}>
              Discover Amazing <span className="text-amber-400">Hotels</span>
            </h1>
            <p className="text-lg text-gray-300 mt-4 max-w-2xl">
              Find the perfect accommodation across all regions of Ghana. From luxury resorts to cozy lodges.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <div className="flex items-center gap-2 text-white/80">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-sm">{totalHotels} Hotels Available</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Users className="w-4 h-4 text-amber-400" />
                <span className="text-sm">15+ Destinations</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Award className="w-4 h-4 text-amber-400" />
                <span className="text-sm">Top Rated</span>
              </div>
              {isConnected && (
                <div className="flex items-center gap-2 text-green-400/80">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                  <span className="text-sm">Live</span>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Filters Section */}
      <section className={`py-6 border-b ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-gray-50'}`}>
        <div className="container-custom">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-[200px] relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search hotels..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl outline-none text-sm ${
                  isDark 
                    ? 'bg-gray-800 text-white border-gray-700' 
                    : 'bg-white text-gray-800 border-gray-200'
                } border focus:border-amber-500 transition-colors`}
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 text-sm ${
                showFilters
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                  : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>

            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`px-4 py-2.5 rounded-xl outline-none text-sm appearance-none ${
                  isDark 
                    ? 'bg-gray-800 text-white border-gray-700' 
                    : 'bg-white text-gray-800 border-gray-200'
                } border focus:border-amber-500 transition-colors pr-10`}
              >
                <option value="popular">Most Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="reviews">Most Reviewed</option>
              </select>
              <ArrowUpDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-400'} pointer-events-none`} />
            </div>

            <div className="flex border rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2.5 transition-all ${
                  viewMode === 'grid'
                    ? 'bg-amber-500 text-white'
                    : isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2.5 transition-all ${
                  viewMode === 'list'
                    ? 'bg-amber-500 text-white'
                    : isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-100'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-4 mt-4 border-t border-gray-200/20">
                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Region
                      </label>
                      <select
                        value={selectedRegion}
                        onChange={(e) => setSelectedRegion(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl outline-none text-sm ${
                          isDark 
                            ? 'bg-gray-800 text-white border-gray-700' 
                            : 'bg-white text-gray-800 border-gray-200'
                        } border focus:border-amber-500 transition-colors`}
                      >
                        <option value="all">All Regions</option>
                        {regions.map(region => (
                          <option key={region.id} value={region.id}>{region.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Status
                      </label>
                      <select
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl outline-none text-sm ${
                          isDark 
                            ? 'bg-gray-800 text-white border-gray-700' 
                            : 'bg-white text-gray-800 border-gray-200'
                        } border focus:border-amber-500 transition-colors`}
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="upcoming">Upcoming</option>
                      </select>
                    </div>

                    <div>
                      <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Max Price: ₵{priceRange.max}
                      </label>
                      <input
                        type="range"
                        min="0"
                        max="5000"
                        step="100"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: parseInt(e.target.value) })}
                        className="w-full accent-amber-500"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {hotels.length} hotels found
                    </span>
                    <button
                      onClick={clearFilters}
                      className="text-sm text-amber-500 hover:text-amber-600 transition-colors flex items-center gap-1"
                    >
                      <X className="w-4 h-4" />
                      Clear Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Hotels Grid */}
      <section className={`py-12 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
        <div className="container-custom">
          {hotels.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-amber-400" />
              </div>
              <h3 className={`text-2xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                No Hotels Found
              </h3>
              <p className={`mt-2 max-w-md mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Try adjusting your filters or search terms to find what you're looking for.
              </p>
              <button
                onClick={clearFilters}
                className="mt-6 px-6 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-all"
              >
                Clear All Filters
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {hotels.map((hotel, index) => (
                <motion.div
                  key={hotel.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`group rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
                    isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white shadow-lg hover:shadow-2xl'
                  }`}
                >
                  <Link to={`/hotel/${hotel.id}`}>
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img 
                        src={hotel.image} 
                        alt={hotel.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      {hotel.badge && (
                        <div className="absolute top-3 left-3">
                          <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            {hotel.badge}
                          </span>
                        </div>
                      )}
                      <div className="absolute top-3 right-3 flex gap-1.5">
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleShare(hotel)
                          }}
                          className="p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-amber-500 transition-all hover:scale-110"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            toggleFavorite(hotel.id)
                          }}
                          className={`p-2 bg-black/50 backdrop-blur-sm rounded-full transition-all hover:scale-110 ${
                            isFavorite(hotel.id) ? 'text-amber-400' : 'text-white hover:text-amber-400'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isFavorite(hotel.id) ? 'fill-amber-400' : ''}`} />
                        </button>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-white bg-black/50 px-3 py-1 rounded-full">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-medium">{hotel.rating}</span>
                          <span className="text-xs text-gray-300">({hotel.reviews})</span>
                        </div>
                        <span className="text-white bg-black/50 px-3 py-1 rounded-full text-sm font-bold">
                          {hotel.price}
                        </span>
                      </div>
                      <div className={`absolute bottom-16 right-3 px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(hotel.status)}`}>
                        {getStatusLabel(hotel.status)}
                      </div>
                    </div>
                    <div className="p-5">
                      <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {hotel.name}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1">
                        <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span className="truncate">{hotel.location}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {hotel.amenities.slice(0, 3).map((amenity, i) => (
                          <span key={i} className={`text-xs px-2 py-1 rounded-full ${
                            isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {amenity}
                          </span>
                        ))}
                        {hotel.amenities.length > 3 && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                          }`}>
                            +{hotel.amenities.length - 3}
                          </span>
                        )}
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200/20 flex items-center justify-between">
                        <div className="flex items-center gap-1">
                          <Bed className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {hotel.rooms || 0} rooms
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-amber-500 font-bold">{hotel.price}</span>
                          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            / night
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              {hotels.map((hotel, index) => (
                <motion.div
                  key={hotel.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className={`flex flex-col md:flex-row rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.01] ${
                    isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white shadow-lg hover:shadow-2xl'
                  }`}
                >
                  <Link to={`/hotel/${hotel.id}`} className="flex-1 flex flex-col md:flex-row">
                    <div className="relative w-full md:w-64 h-48 md:h-auto flex-shrink-0">
                      <img 
                        src={hotel.image} 
                        alt={hotel.name}
                        className="w-full h-full object-cover"
                      />
                      {hotel.badge && (
                        <div className="absolute top-3 left-3">
                          <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            {hotel.badge}
                          </span>
                        </div>
                      )}
                      <div className="absolute top-3 right-3 flex gap-1.5">
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleShare(hotel)
                          }}
                          className="p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-amber-500 transition-all hover:scale-110"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            toggleFavorite(hotel.id)
                          }}
                          className={`p-2 bg-black/50 backdrop-blur-sm rounded-full transition-all hover:scale-110 ${
                            isFavorite(hotel.id) ? 'text-amber-400' : 'text-white hover:text-amber-400'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isFavorite(hotel.id) ? 'fill-amber-400' : ''}`} />
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
                              {hotel.name}
                            </h3>
                            <div className="flex items-center text-sm text-gray-500 mt-1 flex-wrap">
                              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                              <span>{hotel.location}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-amber-500">{hotel.price}</div>
                            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              per night
                            </div>
                          </div>
                        </div>
                        <p className={`text-sm mt-2 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {hotel.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-3">
                          {hotel.amenities.slice(0, 4).map((amenity, i) => (
                            <span key={i} className={`text-xs px-2 py-1 rounded-full ${
                              isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {amenity}
                            </span>
                          ))}
                          {hotel.amenities.length > 4 && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                            }`}>
                              +{hotel.amenities.length - 4}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200/20 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1 text-amber-400">
                            <Star className="w-4 h-4 fill-current" />
                            <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                              {hotel.rating}
                            </span>
                            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              ({hotel.reviews} reviews)
                            </span>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(hotel.status)}`}>
                            {getStatusLabel(hotel.status)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Bed className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {hotel.rooms || 0} rooms
                          </span>
                          <span className="text-xs text-amber-500 flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            View Details
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-xl transition-all ${
                  currentPage === 1
                    ? isDark ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {[...Array(Math.min(totalPages, 5))].map((_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-xl font-medium transition-all ${
                      currentPage === pageNum
                        ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                        : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {pageNum}
                  </button>
                )
              })}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-xl transition-all ${
                  currentPage === totalPages
                    ? isDark ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1920&q=80)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-amber-900/95 to-orange-800/95" />
        </div>
        <div className="container-custom relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center text-white"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold mb-4">
              Find Your Perfect <span className="text-amber-300">Stay</span>
            </h2>
            <p className="text-xl text-gray-200 mb-8">
              Book your stay today and experience the best of Ghana's hospitality.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/contact">
                <button className="px-8 py-3 bg-white text-amber-700 rounded-full font-medium hover:bg-amber-50 transition-all shadow-xl hover:scale-105">
                  Contact Us
                </button>
              </Link>
              <button 
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="px-8 py-3 border-2 border-white/30 text-white rounded-full font-medium hover:bg-white/10 transition-all backdrop-blur-sm hover:scale-105"
              >
                Browse Hotels
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Hotels
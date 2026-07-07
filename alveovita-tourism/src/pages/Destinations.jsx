// src/pages/Destinations.jsx
import { useState, useEffect } from 'react'
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
  MapPin, Search, Filter, Grid, List, X, ChevronDown,
  ChevronLeft, ChevronRight, Star, Users, Clock, Compass,
  Mountain, Waves, TreePine, Building, Sun, Crown,
  Sparkles, Award, Eye, Heart, Share2, Bookmark,
  ArrowUpDown, ChevronRight as ChevronRightIcon,
  Globe, Flag, Calendar, TrendingUp, Loader2
} from 'lucide-react'

const Destinations = () => {
  const { isDark } = useTheme()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { socket, isConnected } = useSocket()
  
  const [loading, setLoading] = useState(true)
  const [destinations, setDestinations] = useState([])
  const [viewMode, setViewMode] = useState('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('popular')
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(9)
  const [favorites, setFavorites] = useState([])
  const [totalDestinations, setTotalDestinations] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [categories, setCategories] = useState([])
  const [notification, setNotification] = useState(null)

  // Socket.IO event listeners
  useEffect(() => {
    if (!socket) return;

    const handleDestinationCreated = (data) => {
      setNotification({
        type: 'created',
        message: `✨ New destination "${data.name}" added!`,
        data
      });
      if (currentPage === 1) {
        fetchDestinations();
      } else {
        setCurrentPage(1);
      }
      showToast(`✨ New destination: ${data.name}`, 'info');
    };

    const handleDestinationUpdated = (data) => {
      setNotification({
        type: 'updated',
        message: `🔄 Destination "${data.name}" updated!`,
        data
      });
      fetchDestinations();
      showToast(`🔄 ${data.name} was updated`, 'info');
    };

    const handleDestinationDeleted = (data) => {
      setNotification({
        type: 'deleted',
        message: `🗑️ Destination "${data.name}" removed!`,
        data
      });
      fetchDestinations();
      showToast(`🗑️ ${data.name} was removed`, 'warning');
    };

    socket.on('destination-created', handleDestinationCreated);
    socket.on('destination-updated', handleDestinationUpdated);
    socket.on('destination-deleted', handleDestinationDeleted);

    return () => {
      socket.off('destination-created', handleDestinationCreated);
      socket.off('destination-updated', handleDestinationUpdated);
      socket.off('destination-deleted', handleDestinationDeleted);
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
        setFavorites(parsed.destinations || [])
      } catch (e) {
        console.error('Error loading favorites:', e)
      }
    }
  }, [])

  // Fetch destinations from backend
  useEffect(() => {
    fetchDestinations()
  }, [searchTerm, selectedRegion, selectedCategory, sortBy, currentPage])

  const fetchDestinations = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams()
      params.append('page', currentPage)
      params.append('limit', itemsPerPage)
      if (searchTerm) params.append('search', searchTerm)
      if (selectedRegion !== 'all') params.append('region', selectedRegion)
      if (selectedCategory !== 'all') params.append('category', selectedCategory)
      
      // Map sortBy to backend field
      let sortField = 'createdAt'
      let sortOrder = 'desc'
      switch(sortBy) {
        case 'popular':
          sortField = 'tourCount'
          sortOrder = 'desc'
          break
        case 'rating':
          sortField = 'rating'
          sortOrder = 'desc'
          break
        case 'reviews':
          sortField = 'reviews'
          sortOrder = 'desc'
          break
        case 'tours':
          sortField = 'tourCount'
          sortOrder = 'desc'
          break
        case 'name':
          sortField = 'name'
          sortOrder = 'asc'
          break
        default:
          sortField = 'createdAt'
          sortOrder = 'desc'
      }
      params.append('sortBy', sortField)
      params.append('sortOrder', sortOrder)

      const response = await axios.get(`/destinations?${params.toString()}`)
      
      if (response.data.success) {
        setDestinations(response.data.destinations)
        setTotalDestinations(response.data.pagination?.total || 0)
        setTotalPages(response.data.pagination?.pages || 1)
        
        // Extract unique categories from fetched destinations
        const uniqueCategories = [...new Set(response.data.destinations.map(d => d.category).filter(Boolean))]
        setCategories(uniqueCategories)
      }
    } catch (error) {
      console.error('Error fetching destinations:', error)
      showToast('Failed to load destinations', 'error')
    } finally {
      setLoading(false)
    }
  }

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedRegion, selectedCategory, sortBy])

  const toggleFavorite = (destId) => {
    if (!user) {
      showToast('Please login to save favorites', 'info')
      navigate('/login')
      return
    }

    const isFavorite = favorites.some(d => (d.id || d._id) === destId)
    let updatedFavorites
    
    if (isFavorite) {
      updatedFavorites = favorites.filter(d => (d.id || d._id) !== destId)
      showToast('Removed from favorites', 'success')
    } else {
      const dest = destinations.find(d => (d._id || d.id) === destId)
      updatedFavorites = [...favorites, {
        id: dest._id || dest.id,
        name: dest.name,
        country: dest.country,
        image: dest.image,
        rating: dest.rating,
        reviews: dest.reviews,
        category: dest.category,
        addedDate: new Date().toISOString()
      }]
      showToast('Added to favorites ❤️', 'success')
    }
    
    setFavorites(updatedFavorites)
    localStorage.setItem('alveovita_favorites', JSON.stringify({
      hotels: JSON.parse(localStorage.getItem('alveovita_favorites') || '{"hotels":[],"tours":[],"destinations":[]}').hotels || [],
      tours: JSON.parse(localStorage.getItem('alveovita_favorites') || '{"hotels":[],"tours":[],"destinations":[]}').tours || [],
      destinations: updatedFavorites
    }))
  }

  const isFavorite = (destId) => {
    return favorites.some(d => (d.id || d._id) === destId)
  }

  const handleShare = async (dest) => {
    const shareData = {
      title: dest.name,
      text: `Check out ${dest.name} in ${dest.country}!`,
      url: `${window.location.origin}/destinations`
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
    setSelectedCategory('all')
    setSortBy('popular')
  }

  const getCategoryIcon = (category) => {
    const iconMap = {
      'beach': Waves,
      'mountain': Mountain,
      'forest': TreePine,
      'city': Building,
      'desert': Sun,
      'lake': Waves,
      'cultural': Compass,
      'historical': Clock
    }
    return iconMap[category] || MapPin
  }

  const getCategoryColor = (category) => {
    const colorMap = {
      'beach': 'bg-blue-500/20 text-blue-500',
      'mountain': 'bg-emerald-500/20 text-emerald-500',
      'forest': 'bg-green-500/20 text-green-500',
      'city': 'bg-purple-500/20 text-purple-500',
      'desert': 'bg-amber-500/20 text-amber-500',
      'lake': 'bg-cyan-500/20 text-cyan-500',
      'cultural': 'bg-orange-500/20 text-orange-500',
      'historical': 'bg-red-500/20 text-red-500'
    }
    return colorMap[category] || 'bg-gray-500/20 text-gray-500'
  }

  const getPopularityBadge = (popularity) => {
    const badgeMap = {
      'Very Popular': 'bg-red-500/20 text-red-500 border-red-500/30',
      'Popular': 'bg-blue-500/20 text-blue-500 border-blue-500/30',
      'Trending': 'bg-green-500/20 text-green-500 border-green-500/30',
      'Hidden Gem': 'bg-amber-500/20 text-amber-500 border-amber-500/30',
      'Must Visit': 'bg-purple-500/20 text-purple-500 border-purple-500/30'
    }
    return badgeMap[popularity] || 'bg-gray-500/20 text-gray-500 border-gray-500/30'
  }

  const getRegionName = (regionId) => {
    const region = regions.find(r => r.id === regionId)
    return region ? region.name : regionId
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Loader2 className="w-16 h-16 text-amber-500 animate-spin mx-auto" />
            <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading destinations...</p>
            {isConnected && (
              <span className="text-xs text-green-500 mt-2 block">🟢 Live updates connected</span>
            )}
          </div>
        </div>
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
            Live updates enabled • Real-time destination updates
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
            backgroundImage: 'url(https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=1920&q=80)',
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
              <Globe className="w-4 h-4" />
              Explore Destinations
            </span>
            <h1 className={`text-4xl md:text-5xl font-display font-bold text-white mt-4 leading-tight`}>
              Discover Amazing <span className="text-amber-400">Destinations</span>
            </h1>
            <p className="text-lg text-gray-300 mt-4 max-w-2xl">
              Explore the best destinations across all regions of Ghana. From cultural sites to natural wonders, find your perfect escape.
            </p>
            <div className="flex flex-wrap gap-3 mt-6">
              <div className="flex items-center gap-2 text-white/80">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className="text-sm">{totalDestinations} Destinations</span>
              </div>
              <div className="flex items-center gap-2 text-white/80">
                <Users className="w-4 h-4 text-amber-400" />
                <span className="text-sm">{regions.length} Regions</span>
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
            {/* Search */}
            <div className="flex-1 min-w-[200px] relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search destinations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl outline-none text-sm ${
                  isDark 
                    ? 'bg-gray-800 text-white border-gray-700' 
                    : 'bg-white text-gray-800 border-gray-200'
                } border focus:border-amber-500 transition-colors`}
              />
            </div>

            {/* Filter Toggle */}
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

            {/* Sort */}
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
                <option value="rating">Highest Rated</option>
                <option value="reviews">Most Reviewed</option>
                <option value="tours">Most Tours</option>
                <option value="name">Alphabetical</option>
              </select>
              <ArrowUpDown className={`absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-400'} pointer-events-none`} />
            </div>

            {/* View Toggle */}
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

          {/* Expanded Filters */}
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
                    {/* Region Filter */}
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

                    {/* Category Filter */}
                    <div>
                      <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Category
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className={`w-full px-3 py-2 rounded-xl outline-none text-sm ${
                          isDark 
                            ? 'bg-gray-800 text-white border-gray-700' 
                            : 'bg-white text-gray-800 border-gray-200'
                        } border focus:border-amber-500 transition-colors`}
                      >
                        <option value="all">All Categories</option>
                        {categories.map(category => (
                          <option key={category} value={category}>
                            {category.charAt(0).toUpperCase() + category.slice(1)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-end">
                      <button
                        onClick={clearFilters}
                        className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-2 text-sm"
                      >
                        <X className="w-4 h-4" />
                        Clear Filters
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-4">
                    <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {totalDestinations} destinations found
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* Destinations Grid */}
      <section className={`py-12 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
        <div className="container-custom">
          {destinations.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Search className="w-12 h-12 text-amber-400" />
              </div>
              <h3 className={`text-2xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                No Destinations Found
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
              {destinations.map((dest, index) => {
                const Icon = getCategoryIcon(dest.category)
                const destId = dest._id || dest.id
                return (
                  <motion.div
                    key={destId}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`group rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
                      isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white shadow-lg hover:shadow-2xl'
                    }`}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img 
                        src={dest.image || 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=800&q=80'} 
                        alt={dest.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(dest.category)}`}>
                          {dest.category}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPopularityBadge(dest.popularity)}`}>
                          {dest.popularity || 'Popular'}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3 flex gap-1.5">
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleShare(dest)
                          }}
                          className="p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-amber-500 transition-all hover:scale-110"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            toggleFavorite(destId)
                          }}
                          className={`p-2 bg-black/50 backdrop-blur-sm rounded-full transition-all hover:scale-110 ${
                            isFavorite(destId) ? 'text-amber-400' : 'text-white hover:text-amber-400'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isFavorite(destId) ? 'fill-amber-400' : ''}`} />
                        </button>
                      </div>
                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-white bg-black/50 px-3 py-1 rounded-full">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-medium">{dest.rating || 0}</span>
                          <span className="text-xs text-gray-300">({dest.reviews || 0})</span>
                        </div>
                        <div className="flex items-center gap-1 text-white bg-black/50 px-3 py-1 rounded-full text-xs">
                          <Users className="w-3 h-3" />
                          <span>{dest.tourCount || 0} tours</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            {dest.name}
                          </h3>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                            <span>{getRegionName(dest.region)}</span>
                            <span className="mx-2">•</span>
                            <Flag className="w-4 h-4 mr-1 flex-shrink-0" />
                            <span>{dest.country}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Icon className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                        </div>
                      </div>
                      <p className={`text-sm mt-2 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        {dest.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-3">
                        {(dest.tags || []).slice(0, 3).map((tag, i) => (
                          <span key={i} className={`text-xs px-2 py-1 rounded-full ${
                            isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {tag}
                          </span>
                        ))}
                        {(dest.tags || []).length > 3 && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                          }`}>
                            +{(dest.tags || []).length - 3}
                          </span>
                        )}
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200/20 flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4" />
                          <span className="text-xs">Best: {dest.bestTimeToVisit || 'Year-round'}</span>
                        </div>
                        <button
                          onClick={() => navigate(`/tours?region=${dest.region}`)}
                          className="text-sm text-amber-500 hover:text-amber-600 font-medium flex items-center gap-1"
                        >
                          View Tours <ChevronRightIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          ) : (
            <div className="space-y-4">
              {destinations.map((dest, index) => {
                const Icon = getCategoryIcon(dest.category)
                const destId = dest._id || dest.id
                return (
                  <motion.div
                    key={destId}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex flex-col md:flex-row rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.01] ${
                      isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white shadow-lg hover:shadow-2xl'
                    }`}
                  >
                    <div className="relative w-full md:w-64 h-48 md:h-auto flex-shrink-0">
                      <img 
                        src={dest.image || 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=800&q=80'} 
                        alt={dest.name}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(dest.category)}`}>
                          {dest.category}
                        </span>
                      </div>
                      <div className="absolute top-3 right-3 flex gap-1.5">
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleShare(dest)
                          }}
                          className="p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-amber-500 transition-all hover:scale-110"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            toggleFavorite(destId)
                          }}
                          className={`p-2 bg-black/50 backdrop-blur-sm rounded-full transition-all hover:scale-110 ${
                            isFavorite(destId) ? 'text-amber-400' : 'text-white hover:text-amber-400'
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${isFavorite(destId) ? 'fill-amber-400' : ''}`} />
                        </button>
                      </div>
                    </div>
                    <div className="flex-1 p-5 flex flex-col justify-between">
                      <div>
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
                              {dest.name}
                            </h3>
                            <div className="flex items-center text-sm text-gray-500 mt-1 flex-wrap">
                              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                              <span>{getRegionName(dest.region)}</span>
                              <span className="mx-2">•</span>
                              <Flag className="w-4 h-4 mr-1 flex-shrink-0" />
                              <span>{dest.country}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-1 text-amber-400">
                              <Star className="w-4 h-4 fill-current" />
                              <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                {dest.rating || 0}
                              </span>
                              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                ({dest.reviews || 0} reviews)
                              </span>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full border ${getPopularityBadge(dest.popularity)}`}>
                              {dest.popularity || 'Popular'}
                            </span>
                          </div>
                        </div>
                        <p className={`text-sm mt-2 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {dest.description}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-3">
                          {(dest.tags || []).slice(0, 4).map((tag, i) => (
                            <span key={i} className={`text-xs px-2 py-1 rounded-full ${
                              isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {tag}
                            </span>
                          ))}
                          {(dest.tags || []).length > 4 && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                            }`}>
                              +{(dest.tags || []).length - 4}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-gray-200/20 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Users className="w-4 h-4" />
                            <span>{dest.tourCount || 0} tours</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span className="text-xs">Best: {dest.bestTimeToVisit || 'Year-round'}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => navigate(`/tours?region=${dest.region}`)}
                          className="text-sm text-amber-500 hover:text-amber-600 font-medium flex items-center gap-1"
                        >
                          View Tours <ChevronRightIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}

          {/* Pagination */}
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
                let pageNum
                if (totalPages <= 5) {
                  pageNum = i + 1
                } else if (currentPage <= 3) {
                  pageNum = i + 1
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i
                } else {
                  pageNum = currentPage - 2 + i
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
                <ChevronRightIcon className="w-5 h-5" />
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
            backgroundImage: 'url(https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=1920&q=80)',
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
              Ready to Explore <span className="text-amber-300">Ghana</span>?
            </h2>
            <p className="text-xl text-gray-200 mb-8">
              Discover the beauty and culture of Ghana's most amazing destinations.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/tours">
                <button className="px-8 py-3 bg-white text-amber-700 rounded-full font-medium hover:bg-amber-50 transition-all shadow-xl hover:scale-105">
                  Explore Tours
                </button>
              </Link>
              <Link to="/contact">
                <button className="px-8 py-3 border-2 border-white/30 text-white rounded-full font-medium hover:bg-white/10 transition-all backdrop-blur-sm hover:scale-105">
                  Contact Us
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default Destinations
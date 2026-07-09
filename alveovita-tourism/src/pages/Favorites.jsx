// src/pages/Favorites.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import axios from '../api/axios'
import { 
  Heart, Star, MapPin, Clock, Calendar, Users,
  Hotel, Compass, Trash2, Share2, Eye, X,
  Filter, Search, Grid, List, ChevronDown,
  Building2, Waves, Mountain, TreePine, Sun,
  Crown, Compass as CompassIcon, Leaf, Bird,
  Flower2, Sparkles, Gift, Crown as CrownIcon,
  Gem, Rocket, Zap, Award, Shield, CheckCircle,
  AlertCircle, Bookmark, Heart as HeartIcon,
  Loader2, ArrowRight, ChevronRight, ChevronLeft,
  Plus, Minus, RefreshCw, ExternalLink,
  Phone, Mail, Globe, MessageCircle, ThumbsUp,
  User, Briefcase, Coffee, Music, Camera, Video,
  Image, Upload, Filter as FilterIcon, SortAsc, SortDesc,
  LayoutGrid, LayoutList, MoreVertical, Edit,
  Trash2 as TrashIcon, Copy, Link as LinkIcon,
  Info, HelpCircle, Settings, LogOut, Bell,
  Menu, X as XIcon, Check, Circle,
  TrendingUp, Award as AwardIcon, Shield as ShieldIcon
} from 'lucide-react'

const Favorites = () => {
  const { isDark } = useTheme()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [favorites, setFavorites] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [selectedItems, setSelectedItems] = useState([])
  const [isSelectionMode, setIsSelectionMode] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      showToast('Please login to view your favorites', 'info')
      navigate('/login')
      return
    }

    fetchFavorites()
  }, [user])

  const fetchFavorites = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await axios.get('/favorites')
      
      if (response.data.success) {
        setFavorites(response.data.favorites || [])
      } else {
        setError('Failed to load favorites')
      }
    } catch (error) {
      console.error('Error fetching favorites:', error)
      setError(error.response?.data?.message || 'Failed to load favorites')
      showToast('Failed to load favorites', 'error')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const handleRefresh = () => {
    setRefreshing(true)
    fetchFavorites()
    showToast('Refreshing favorites...', 'info')
  }

  // Remove from favorites
  const removeFromFavorites = async (favoriteId, itemName) => {
    try {
      await axios.delete(`/favorites/${favoriteId}`)
      setFavorites(favorites.filter(f => f._id !== favoriteId))
      showToast(`Removed "${itemName}" from favorites`, 'success')
      
      // If in selection mode, remove from selected items
      if (isSelectionMode) {
        setSelectedItems(selectedItems.filter(id => id !== favoriteId))
      }
    } catch (error) {
      console.error('Error removing favorite:', error)
      showToast('Failed to remove from favorites', 'error')
    }
  }

  // Remove multiple favorites
  const removeSelected = async () => {
    try {
      const idsToRemove = selectedItems
      await Promise.all(
        idsToRemove.map(id => axios.delete(`/favorites/${id}`))
      )
      setFavorites(favorites.filter(f => !idsToRemove.includes(f._id)))
      setSelectedItems([])
      setIsSelectionMode(false)
      showToast(`Removed ${idsToRemove.length} items from favorites`, 'success')
    } catch (error) {
      console.error('Error removing selected favorites:', error)
      showToast('Failed to remove selected favorites', 'error')
    }
  }

  const toggleSelectItem = (favoriteId) => {
    if (selectedItems.includes(favoriteId)) {
      setSelectedItems(selectedItems.filter(id => id !== favoriteId))
    } else {
      setSelectedItems([...selectedItems, favoriteId])
    }
  }

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredFavorites.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(filteredFavorites.map(f => f._id))
    }
  }

  // Get item details from favorite
  const getItemDetails = (favorite) => {
    const item = favorite.item
    if (!item) return null
    
    return {
      id: favorite.itemId,
      type: favorite.itemType,
      name: item.name || item.title || 'Item',
      location: item.location || item.region || 'Ghana',
      image: item.images?.[0] || item.image || '',
      rating: item.rating || 0,
      reviews: item.reviews || 0,
      price: item.price || 0,
      description: item.description || '',
      badge: item.badge || '',
      amenities: item.amenities || item.includes || [],
      addedDate: favorite.addedAt || favorite.createdAt,
      region: item.region || '',
      favoriteId: favorite._id,
      duration: item.duration || '',
      type: item.type || '',
    }
  }

  // Filter favorites based on active tab and search
  const filteredFavorites = favorites
    .filter(favorite => {
      const item = favorite.item
      if (!item) return false
      
      // Tab filter
      if (activeTab !== 'all' && favorite.itemType !== activeTab) {
        return false
      }
      
      // Search filter
      if (searchTerm) {
        const name = (item.name || item.title || '').toLowerCase()
        const location = (item.location || item.region || '').toLowerCase()
        const search = searchTerm.toLowerCase()
        return name.includes(search) || location.includes(search)
      }
      
      return true
    })
    .sort((a, b) => {
      const dateA = new Date(a.addedAt || a.createdAt)
      const dateB = new Date(b.addedAt || b.createdAt)
      
      switch(sortBy) {
        case 'recent':
          return dateB - dateA
        case 'oldest':
          return dateA - dateB
        case 'rating':
          return (b.item?.rating || 0) - (a.item?.rating || 0)
        case 'price-low':
          return (a.item?.price || 0) - (b.item?.price || 0)
        case 'price-high':
          return (b.item?.price || 0) - (a.item?.price || 0)
        default:
          return 0
      }
    })

  const getItemLink = (favorite) => {
    const type = favorite.itemType
    const id = favorite.itemId
    switch(type) {
      case 'hotel': return `/hotel/${id}`
      case 'tour': return `/tour/${id}`
      case 'destination': return `/destination/${id}`
      default: return '#'
    }
  }

  const getItemPrice = (item) => {
    if (!item) return ''
    const price = item.price || 0
    if (item.type === 'hotel') {
      return `₵${price} / night`
    }
    return `₵${price} / person`
  }

  const getBadgeColor = (type) => {
    switch(type) {
      case 'hotel': return 'bg-blue-500/20 text-blue-400'
      case 'tour': return 'bg-green-500/20 text-green-400'
      case 'destination': return 'bg-purple-500/20 text-purple-400'
      default: return 'bg-gray-500/20 text-gray-400'
    }
  }

  const getTypeIcon = (type) => {
    switch(type) {
      case 'hotel': return <Hotel className="h-4 w-4" />
      case 'tour': return <Compass className="h-4 w-4" />
      case 'destination': return <MapPin className="h-4 w-4" />
      default: return <Heart className="h-4 w-4" />
    }
  }

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
              <HeartIcon className="absolute inset-0 w-16 h-16 text-amber-500 animate-pulse mx-auto my-auto" />
            </div>
            <p className={`mt-6 text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Loading your favorites...
            </p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Failed to Load Favorites
            </h2>
            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {error}
            </p>
            <button
              onClick={fetchFavorites}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-all"
            >
              <RefreshCw className="h-5 w-5" />
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
      <Navbar />

      <div className="pt-20 pb-16">
        <div className="container-custom">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
            <div>
              <h1 className={`text-3xl md:text-4xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                My Favorites
              </h1>
              <p className={`mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {filteredFavorites.length} items saved
                {favorites.length !== filteredFavorites.length && ` (${favorites.length} total)`}
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className={`p-2 rounded-xl transition-all flex items-center gap-2 ${
                  refreshing 
                    ? 'opacity-50 cursor-not-allowed' 
                    : isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                }`}
              >
                <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Refresh</span>
              </button>
              {isSelectionMode && selectedItems.length > 0 && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  onClick={removeSelected}
                  className="px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all flex items-center gap-2 shadow-lg shadow-red-500/30"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove {selectedItems.length} items
                </motion.button>
              )}
              <button
                onClick={() => {
                  setIsSelectionMode(!isSelectionMode)
                  if (isSelectionMode) setSelectedItems([])
                }}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  isSelectionMode
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                    : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {isSelectionMode ? 'Done' : 'Select'}
              </button>
            </div>
          </div>

          {/* Filters & Controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search favorites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl outline-none transition-all ${
                  isDark 
                    ? 'bg-gray-800 text-white border-gray-700 focus:border-amber-400' 
                    : 'bg-gray-50 text-gray-800 border-gray-200 focus:border-amber-400'
                } border focus:ring-2 focus:ring-amber-400/50`}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 flex-wrap">
              {['all', 'hotel', 'tour', 'destination'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all capitalize flex items-center gap-1.5 ${
                    activeTab === tab
                      ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                      : isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab === 'all' ? (
                    <Heart className="w-4 h-4" />
                  ) : (
                    getTypeIcon(tab)
                  )}
                  {tab === 'all' ? 'All' : tab + 's'}
                  {tab !== 'all' && (
                    <span className={`text-xs ${
                      activeTab === tab 
                        ? 'text-white/80' 
                        : isDark ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      ({favorites.filter(f => f.itemType === tab).length})
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* Sort & View */}
            <div className="flex items-center gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className={`px-4 py-2 rounded-xl outline-none transition-all ${
                  isDark 
                    ? 'bg-gray-800 text-white border-gray-700' 
                    : 'bg-gray-50 text-gray-800 border-gray-200'
                } border focus:border-amber-400 focus:ring-2 focus:ring-amber-400/50`}
              >
                <option value="recent">Most Recent</option>
                <option value="oldest">Oldest First</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>

              <div className="flex border rounded-xl overflow-hidden">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 transition-all ${
                    viewMode === 'grid'
                      ? 'bg-amber-500 text-white'
                      : isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Grid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 transition-all ${
                    viewMode === 'list'
                      ? 'bg-amber-500 text-white'
                      : isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <List className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>

          {/* Select All */}
          {isSelectionMode && filteredFavorites.length > 0 && (
            <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <button
                onClick={toggleSelectAll}
                className={`flex items-center gap-2 text-sm font-medium ${
                  isDark ? 'text-gray-300 hover:text-white' : 'text-gray-700 hover:text-gray-900'
                } transition-colors`}
              >
                <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${
                  selectedItems.length === filteredFavorites.length
                    ? 'bg-amber-500 border-amber-500'
                    : isDark ? 'border-gray-500' : 'border-gray-300'
                }`}>
                  {selectedItems.length === filteredFavorites.length && (
                    <Check className="w-3 h-3 text-white" />
                  )}
                </div>
                {selectedItems.length === filteredFavorites.length ? 'Deselect All' : 'Select All'}
              </button>
              <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {selectedItems.length} selected
              </span>
              {selectedItems.length > 0 && (
                <button
                  onClick={removeSelected}
                  className="ml-auto px-3 py-1 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-all"
                >
                  Remove Selected
                </button>
              )}
            </div>
          )}

          {/* Favorites Grid */}
          {filteredFavorites.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFavorites.map((favorite, index) => {
                  const item = getItemDetails(favorite)
                  if (!item) return null
                  
                  return (
                    <motion.div
                      key={favorite._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`group rounded-2xl overflow-hidden transition-all duration-300 ${
                        isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white shadow-lg hover:shadow-2xl'
                      } ${isSelectionMode ? 'cursor-pointer' : ''}`}
                      onClick={() => isSelectionMode && toggleSelectItem(favorite._id)}
                    >
                      <div className="relative aspect-[4/3] overflow-hidden">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            loading="lazy"
                          />
                        ) : (
                          <div className={`w-full h-full flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                            {getTypeIcon(favorite.itemType)}
                          </div>
                        )}
                        
                        {/* Selection checkbox */}
                        {isSelectionMode && (
                          <div className="absolute top-3 left-3 z-10">
                            <div className={`w-7 h-7 rounded-lg border-2 flex items-center justify-center transition-all backdrop-blur-sm ${
                              selectedItems.includes(favorite._id)
                                ? 'bg-amber-500 border-amber-500'
                                : 'bg-black/50 border-white/50'
                            }`}>
                              {selectedItems.includes(favorite._id) && (
                                <Check className="w-4 h-4 text-white" />
                              )}
                            </div>
                          </div>
                        )}

                        {/* Item Type Badge */}
                        <div className="absolute top-3 right-3 flex gap-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getBadgeColor(favorite.itemType)}`}>
                            {favorite.itemType}
                          </span>
                          {!isSelectionMode && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                removeFromFavorites(favorite._id, item.name)
                              }}
                              className="p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-red-500 transition-all hover:scale-110"
                            >
                              <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                            </button>
                          )}
                        </div>

                        {/* Rating & Price */}
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                          <div className="flex items-center gap-1 text-white bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full">
                            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                            <span className="text-sm font-medium">{item.rating}</span>
                            <span className="text-xs text-gray-300">({item.reviews})</span>
                          </div>
                          <span className="text-white bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold">
                            {getItemPrice(item)}
                          </span>
                        </div>

                        {item.badge && (
                          <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2">
                            <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                              {item.badge}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-bold text-lg truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>
                              {item.name}
                            </h3>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                              <span className="truncate">{item.location}</span>
                            </div>
                          </div>
                          {item.region && (
                            <span className={`text-xs px-2 py-1 rounded-full ml-2 flex-shrink-0 ${
                              isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {item.region}
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap gap-1 mt-3">
                          {(item.amenities || []).slice(0, 3).map((attr, i) => (
                            <span key={i} className={`text-xs px-2 py-1 rounded-full ${
                              isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {attr}
                            </span>
                          ))}
                          {(item.amenities || []).length > 3 && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                            }`}>
                              +{(item.amenities || []).length - 3}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200/20">
                          <div className="flex items-center gap-3">
                            <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              Added {new Date(item.addedDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {!isSelectionMode && (
                              <>
                                <Link to={getItemLink(favorite)}>
                                  <button className="p-2 rounded-lg hover:bg-amber-500/10 transition-colors" title="View Details">
                                    <Eye className="w-4 h-4 text-gray-400 hover:text-amber-500 transition-colors" />
                                  </button>
                                </Link>
                                <button 
                                  className="p-2 rounded-lg hover:bg-amber-500/10 transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    const url = `${window.location.origin}${getItemLink(favorite)}`
                                    navigator.clipboard.writeText(url)
                                    showToast('Link copied to clipboard!', 'success')
                                  }}
                                  title="Share"
                                >
                                  <Share2 className="w-4 h-4 text-gray-400 hover:text-amber-500 transition-colors" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            ) : (
              // List View
              <div className="space-y-4">
                {filteredFavorites.map((favorite, index) => {
                  const item = getItemDetails(favorite)
                  if (!item) return null
                  
                  return (
                    <motion.div
                      key={favorite._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex flex-col md:flex-row gap-4 p-4 rounded-2xl transition-all duration-300 ${
                        isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white shadow-lg hover:shadow-2xl'
                      } ${isSelectionMode ? 'cursor-pointer' : ''}`}
                      onClick={() => isSelectionMode && toggleSelectItem(favorite._id)}
                    >
                      <div className="relative w-full md:w-48 h-32 md:h-auto flex-shrink-0">
                        {item.image ? (
                          <img 
                            src={item.image} 
                            alt={item.name}
                            className="w-full h-full object-cover rounded-xl"
                            loading="lazy"
                          />
                        ) : (
                          <div className={`w-full h-full rounded-xl flex items-center justify-center ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                            {getTypeIcon(favorite.itemType)}
                          </div>
                        )}
                        {isSelectionMode && (
                          <div className="absolute top-2 left-2">
                            <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center backdrop-blur-sm ${
                              selectedItems.includes(favorite._id)
                                ? 'bg-amber-500 border-amber-500'
                                : 'bg-black/50 border-white/50'
                            }`}>
                              {selectedItems.includes(favorite._id) && (
                                <Check className="w-4 h-4 text-white" />
                              )}
                            </div>
                          </div>
                        )}
                        <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${getBadgeColor(favorite.itemType)}`}>
                          {favorite.itemType}
                        </span>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between flex-wrap gap-2">
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-bold text-lg truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>
                              {item.name}
                            </h3>
                            <div className="flex items-center text-sm text-gray-500 mt-1 flex-wrap">
                              <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                              <span className="truncate">{item.location}</span>
                              {item.region && (
                                <>
                                  <span className="mx-2">•</span>
                                  <span>{item.region}</span>
                                </>
                              )}
                              {item.duration && (
                                <>
                                  <span className="mx-2">•</span>
                                  <Clock className="w-4 h-4 mr-1" />
                                  <span>{item.duration}</span>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <div className="text-lg font-bold text-amber-500">{getItemPrice(item)}</div>
                            <div className="flex items-center justify-end gap-1 text-amber-400">
                              <Star className="w-4 h-4 fill-current" />
                              <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                {item.rating}
                              </span>
                              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                ({item.reviews})
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-1 mt-2">
                          {(item.amenities || []).slice(0, 4).map((attr, i) => (
                            <span key={i} className={`text-xs px-2 py-1 rounded-full ${
                              isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {attr}
                            </span>
                          ))}
                        </div>

                        <div className="flex items-center justify-between mt-3 flex-wrap gap-2">
                          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Added {new Date(item.addedDate).toLocaleDateString()}
                          </span>
                          <div className="flex items-center gap-2">
                            {!isSelectionMode && (
                              <>
                                <Link to={getItemLink(favorite)}>
                                  <button className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-medium hover:scale-105 transition-all">
                                    View Details
                                  </button>
                                </Link>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    removeFromFavorites(favorite._id, item.name)
                                  }}
                                  className="p-2 text-red-400 hover:text-red-500 transition-colors hover:bg-red-500/10 rounded-lg"
                                  title="Remove from favorites"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )
          ) : (
            // Empty State
            <div className={`text-center py-16 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-12 h-12 text-amber-400" />
              </div>
              <h3 className={`text-2xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {searchTerm ? 'No matching favorites' : 'No Favorites Yet'}
              </h3>
              <p className={`mt-2 max-w-md mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {searchTerm 
                  ? 'No favorites match your search criteria. Try adjusting your search.'
                  : 'Start exploring tours, hotels, and destinations in Ghana and save your favorites for easy access.'}
              </p>
              {searchTerm ? (
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                >
                  <X className="h-5 w-5" />
                  Clear Search
                </button>
              ) : (
                <div className="mt-6 flex flex-wrap justify-center gap-4">
                  <Link to="/tours">
                    <button className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:scale-105 transition-all shadow-lg shadow-amber-500/30">
                      <Compass className="h-5 w-5" />
                      Browse Tours
                    </button>
                  </Link>
                  <Link to="/hotels">
                    <button className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium border transition-all hover:scale-105 ${
                      isDark 
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-800' 
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}>
                      <Hotel className="h-5 w-5" />
                      Browse Hotels
                    </button>
                  </Link>
                  <Link to="/destinations">
                    <button className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium border transition-all hover:scale-105 ${
                      isDark 
                        ? 'border-gray-600 text-gray-300 hover:bg-gray-800' 
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}>
                      <MapPin className="h-5 w-5" />
                      Explore Destinations                    </button>
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Favorites
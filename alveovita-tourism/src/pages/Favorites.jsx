// src/pages/Favorites.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import { 
  Heart, Star, MapPin, Clock, Calendar, Users,
  Hotel, Compass, Trash2, Share2, Eye, X,
  Filter, Search, Grid, List, ChevronDown,
  Building2, Waves, Mountain, TreePine, Sun,
  Crown, Compass as CompassIcon, Leaf, Bird,
  Flower2, Sparkles, Gift, Crown as CrownIcon,
  Gem, Rocket, Zap, Award, Shield, CheckCircle,
  AlertCircle, Bookmark, Heart as HeartIcon
} from 'lucide-react'

const Favorites = () => {
  const { isDark } = useTheme()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [favorites, setFavorites] = useState({
    hotels: [],
    tours: []
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [viewMode, setViewMode] = useState('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState('recent')
  const [selectedItems, setSelectedItems] = useState([])
  const [isSelectionMode, setIsSelectionMode] = useState(false)

  // Mock favorites data
  const mockFavorites = {
    hotels: [
      {
        id: 1,
        name: 'Kempinski Hotel Gold Coast City',
        location: 'Accra, Ghana',
        image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80',
        rating: 4.9,
        reviews: 342,
        price: '$350',
        amenities: ['Spa', 'Pool', 'Gym', 'Restaurant', 'Free WiFi'],
        badge: '5-Star Luxury',
        addedDate: '2025-01-15',
        region: 'Greater Accra'
      },
      {
        id: 5,
        name: 'Royal Senchi Hotel & Resort',
        location: 'Akosombo, Ghana',
        image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&q=80',
        rating: 4.8,
        reviews: 203,
        price: '$250',
        amenities: ['Pool', 'Spa', 'Water Sports', 'Restaurant', 'Free WiFi'],
        badge: 'Resort',
        addedDate: '2025-01-20',
        region: 'Eastern'
      },
      {
        id: 9,
        name: 'Zaina Lodge',
        location: 'Mole National Park, Ghana',
        image: 'https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=800&q=80',
        rating: 4.9,
        reviews: 78,
        price: '$300',
        amenities: ['Pool', 'Safari Tours', 'Restaurant', 'Free WiFi', 'Observation Deck'],
        badge: 'Safari Lodge',
        addedDate: '2025-02-01',
        region: 'Northern'
      }
    ],
    tours: [
      {
        id: 1,
        title: 'Accra City & Culture Tour',
        location: 'Accra, Ghana',
        image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=800&q=80',
        duration: '4 Hours',
        price: '$85',
        rating: 4.8,
        reviews: 234,
        type: 'Cultural',
        difficulty: 'Easy',
        addedDate: '2025-01-18',
        region: 'Greater Accra'
      },
      {
        id: 3,
        title: 'Cape Coast Castle Tour',
        location: 'Cape Coast, Ghana',
        image: 'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&q=80',
        duration: '3 Hours',
        price: '$70',
        rating: 4.9,
        reviews: 312,
        type: 'Historical',
        difficulty: 'Easy',
        addedDate: '2025-01-25',
        region: 'Central'
      },
      {
        id: 6,
        title: 'Mole National Park Safari',
        location: 'Mole, Ghana',
        image: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=800&q=80',
        duration: '8 Hours',
        price: '$150',
        rating: 4.9,
        reviews: 98,
        type: 'Adventure',
        difficulty: 'Moderate',
        addedDate: '2025-02-05',
        region: 'Northern'
      }
    ]
  }

  useEffect(() => {
    // Check if user is authenticated
    if (!user) {
      showToast('Please login to view your favorites', 'info')
      navigate('/login')
      return
    }

    // Load favorites from localStorage or API
    const loadFavorites = async () => {
      setLoading(true)
      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500))
        
        // Load from localStorage or use mock data
        const savedFavorites = localStorage.getItem('alveovita_favorites')
        if (savedFavorites) {
          setFavorites(JSON.parse(savedFavorites))
        } else {
          setFavorites(mockFavorites)
          localStorage.setItem('alveovita_favorites', JSON.stringify(mockFavorites))
        }
      } catch (error) {
        console.error('Error loading favorites:', error)
        showToast('Failed to load favorites', 'error')
      } finally {
        setLoading(false)
      }
    }

    loadFavorites()
  }, [user, navigate, showToast])

  // Filter favorites based on active tab and search
  const getFilteredFavorites = () => {
    let items = []
    
    if (activeTab === 'all' || activeTab === 'hotels') {
      items = [...items, ...favorites.hotels.map(h => ({ ...h, type: 'hotel' }))]
    }
    if (activeTab === 'all' || activeTab === 'tours') {
      items = [...items, ...favorites.tours.map(t => ({ ...t, type: 'tour' }))]
    }

    // Apply search filter
    if (searchTerm) {
      items = items.filter(item => 
        (item.name || item.title).toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.location.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply sorting
    items.sort((a, b) => {
      const dateA = new Date(a.addedDate)
      const dateB = new Date(b.addedDate)
      
      switch(sortBy) {
        case 'recent':
          return dateB - dateA
        case 'oldest':
          return dateA - dateB
        case 'rating':
          return (b.rating || 0) - (a.rating || 0)
        case 'price-low':
          return (a.price || 0) - (b.price || 0)
        case 'price-high':
          return (b.price || 0) - (a.price || 0)
        default:
          return 0
      }
    })

    return items
  }

  const filteredFavorites = getFilteredFavorites()

  // Handle remove from favorites
  const removeFromFavorites = (id, type) => {
    const updatedFavorites = { ...favorites }
    
    if (type === 'hotel') {
      updatedFavorites.hotels = updatedFavorites.hotels.filter(h => h.id !== id)
    } else {
      updatedFavorites.tours = updatedFavorites.tours.filter(t => t.id !== id)
    }
    
    setFavorites(updatedFavorites)
    localStorage.setItem('alveovita_favorites', JSON.stringify(updatedFavorites))
    showToast('Removed from favorites', 'success')
  }

  // Handle remove multiple
  const removeSelected = () => {
    const updatedFavorites = { ...favorites }
    const itemsToRemove = selectedItems
    
    itemsToRemove.forEach(item => {
      if (item.type === 'hotel') {
        updatedFavorites.hotels = updatedFavorites.hotels.filter(h => h.id !== item.id)
      } else {
        updatedFavorites.tours = updatedFavorites.tours.filter(t => t.id !== item.id)
      }
    })
    
    setFavorites(updatedFavorites)
    localStorage.setItem('alveovita_favorites', JSON.stringify(updatedFavorites))
    setSelectedItems([])
    setIsSelectionMode(false)
    showToast(`Removed ${itemsToRemove.length} items from favorites`, 'success')
  }

  const toggleSelectItem = (item) => {
    const exists = selectedItems.find(i => i.id === item.id && i.type === item.type)
    if (exists) {
      setSelectedItems(selectedItems.filter(i => !(i.id === item.id && i.type === item.type)))
    } else {
      setSelectedItems([...selectedItems, { id: item.id, type: item.type }])
    }
  }

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredFavorites.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(filteredFavorites.map(item => ({ id: item.id, type: item.type })))
    }
  }

  const getItemImage = (item) => {
    if (item.type === 'hotel') {
      return item.image
    }
    return item.image
  }

  const getItemName = (item) => {
    if (item.type === 'hotel') {
      return item.name
    }
    return item.title
  }

  const getItemLink = (item) => {
    if (item.type === 'hotel') {
      return `/hotel/${item.id}`
    }
    return `/tour/${item.id}`
  }

  const getItemPrice = (item) => {
    if (item.type === 'hotel') {
      return `${item.price} / night`
    }
    return `${item.price} / person`
  }

  const getBadgeColor = (type) => {
    return type === 'hotel' ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <HeartIcon className="w-16 h-16 text-amber-500 animate-pulse mx-auto" />
            <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Loading your favorites...
            </p>
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
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {isSelectionMode && selectedItems.length > 0 && (
                <motion.button
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  onClick={removeSelected}
                  className="px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Remove {selectedItems.length} items
                </motion.button>
              )}
              <button
                onClick={() => setIsSelectionMode(!isSelectionMode)}
                className={`px-4 py-2 rounded-xl font-medium transition-all ${
                  isSelectionMode
                    ? 'bg-amber-500 text-white'
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
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2">
              {['all', 'hotels', 'tours'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-xl font-medium transition-all capitalize ${
                    activeTab === tab
                      ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                      : isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tab}
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
                } border focus:border-amber-400`}
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
            <div className="flex items-center gap-3 mb-4">
              <button
                onClick={toggleSelectAll}
                className={`flex items-center gap-2 text-sm ${
                  isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'
                } transition-colors`}
              >
                <CheckCircle className={`w-4 h-4 ${selectedItems.length === filteredFavorites.length ? 'text-amber-500' : ''}`} />
                {selectedItems.length === filteredFavorites.length ? 'Deselect All' : 'Select All'}
              </button>
              <span className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                {selectedItems.length} selected
              </span>
            </div>
          )}

          {/* Favorites Grid */}
          {filteredFavorites.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredFavorites.map((item, index) => (
                  <motion.div
                    key={`${item.type}-${item.id}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`group rounded-2xl overflow-hidden transition-all duration-300 ${
                      isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white shadow-lg hover:shadow-2xl'
                    } ${isSelectionMode ? 'cursor-pointer' : ''}`}
                    onClick={() => isSelectionMode && toggleSelectItem(item)}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden">
                      <img 
                        src={getItemImage(item)} 
                        alt={getItemName(item)}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />
                      
                      {/* Selection checkbox */}
                      {isSelectionMode && (
                        <div className="absolute top-3 left-3 z-10">
                          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                            selectedItems.find(i => i.id === item.id && i.type === item.type)
                              ? 'bg-amber-500 border-amber-500'
                              : 'bg-black/50 border-white/50'
                          }`}>
                            {selectedItems.find(i => i.id === item.id && i.type === item.type) && (
                              <CheckCircle className="w-4 h-4 text-white" />
                            )}
                          </div>
                        </div>
                      )}

                      <div className="absolute top-3 right-3 flex gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getBadgeColor(item.type)}`}>
                          {item.type}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            removeFromFavorites(item.id, item.type)
                          }}
                          className="p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-red-500 transition-all hover:scale-110"
                        >
                          <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                        </button>
                      </div>

                      <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                        <div className="flex items-center space-x-1 text-white bg-black/50 px-3 py-1 rounded-full">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="text-sm font-medium">{item.rating}</span>
                          <span className="text-xs text-gray-300">({item.reviews})</span>
                        </div>
                        <span className="text-white bg-black/50 px-3 py-1 rounded-full text-sm font-bold">
                          {getItemPrice(item)}
                        </span>
                      </div>

                      {item.badge && (
                        <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2">
                          <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            {item.badge}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            {getItemName(item)}
                          </h3>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <MapPin className="w-4 h-4 mr-1" />
                            {item.location}
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {item.region}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1 mt-3">
                        {(item.amenities || item.includes || []).slice(0, 3).map((attr, i) => (
                          <span key={i} className={`text-xs px-2 py-1 rounded-full ${
                            isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {attr}
                          </span>
                        ))}
                        {(item.amenities || item.includes || []).length > 3 && (
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                          }`}>
                            +{(item.amenities || item.includes || []).length - 3}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200/20">
                        <div className="flex items-center gap-3">
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            Added {new Date(item.addedDate).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {!isSelectionMode && (
                            <>
                              <Link to={getItemLink(item)}>
                                <button className="p-2 rounded-lg hover:bg-amber-500/10 transition-colors">
                                  <Eye className="w-4 h-4 text-gray-400 hover:text-amber-500 transition-colors" />
                                </button>
                              </Link>
                              <button className="p-2 rounded-lg hover:bg-amber-500/10 transition-colors">
                                <Share2 className="w-4 h-4 text-gray-400 hover:text-amber-500 transition-colors" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              // List View
              <div className="space-y-4">
                {filteredFavorites.map((item, index) => (
                  <motion.div
                    key={`${item.type}-${item.id}`}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex flex-col md:flex-row gap-4 p-4 rounded-2xl transition-all duration-300 ${
                      isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white shadow-lg hover:shadow-2xl'
                    } ${isSelectionMode ? 'cursor-pointer' : ''}`}
                    onClick={() => isSelectionMode && toggleSelectItem(item)}
                  >
                    <div className="relative w-full md:w-48 h-32 md:h-auto flex-shrink-0">
                      <img 
                        src={getItemImage(item)} 
                        alt={getItemName(item)}
                        className="w-full h-full object-cover rounded-xl"
                        loading="lazy"
                      />
                      {isSelectionMode && (
                        <div className="absolute top-2 left-2">
                          <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center ${
                            selectedItems.find(i => i.id === item.id && i.type === item.type)
                              ? 'bg-amber-500 border-amber-500'
                              : 'bg-black/50 border-white/50'
                          }`}>
                            {selectedItems.find(i => i.id === item.id && i.type === item.type) && (
                              <CheckCircle className="w-4 h-4 text-white" />
                            )}
                          </div>
                        </div>
                      )}
                      <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold ${getBadgeColor(item.type)}`}>
                        {item.type}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            {getItemName(item)}
                          </h3>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <MapPin className="w-4 h-4 mr-1" />
                            {item.location}
                            <span className="mx-2">•</span>
                            {item.region}
                          </div>
                        </div>
                        <div className="text-right">
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
                        {(item.amenities || item.includes || []).slice(0, 4).map((attr, i) => (
                          <span key={i} className={`text-xs px-2 py-1 rounded-full ${
                            isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                          }`}>
                            {attr}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Added {new Date(item.addedDate).toLocaleDateString()}
                        </span>
                        <div className="flex items-center gap-2">
                          {!isSelectionMode && (
                            <>
                              <Link to={getItemLink(item)}>
                                <button className="px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 transition-all">
                                  View Details
                                </button>
                              </Link>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  removeFromFavorites(item.id, item.type)
                                }}
                                className="p-2 text-red-400 hover:text-red-500 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )
          ) : (
            // Empty State
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <Heart className="w-12 h-12 text-amber-400" />
              </div>
              <h3 className={`text-2xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                No Favorites Yet
              </h3>
              <p className={`mt-2 max-w-md mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Start exploring tours and hotels in Ghana and save your favorites for easy access.
              </p>
              <div className="mt-6 flex flex-wrap justify-center gap-4">
                <Link to="/tours">
                  <button className="px-6 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition-all hover:scale-105">
                    Browse Tours
                  </button>
                </Link>
                <Link to="/hotels">
                  <button className={`px-6 py-3 rounded-xl font-medium border transition-all hover:scale-105 ${
                    isDark 
                      ? 'border-gray-600 text-gray-300 hover:bg-gray-800' 
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}>
                    Browse Hotels
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default Favorites
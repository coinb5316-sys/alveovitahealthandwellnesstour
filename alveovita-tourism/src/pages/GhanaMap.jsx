// src/pages/GhanaMap.jsx
import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import { 
  MapPin, Hotel, Compass, Star, X, Search,
  Filter, ChevronRight, Phone, Mail, Globe,
  Clock, Users, Wifi, Coffee, Utensils, Dumbbell,
  Waves, Sun, TreePine, Mountain, Crown, Building2,
  Leaf, Bird, Flower2, Waves as WavesIcon,
  Navigation, Car, Plane, Train, Bike, Info,
  Layers, Grid, Map, List, ZoomIn, ZoomOut,
  RefreshCw, Crosshair, ChevronDown, ChevronUp,
  TrendingUp, Award, Shield, Heart, Bookmark,
  Share2, Eye, Calendar, DollarSign, Bed,
  Bath, Tv, Music, Camera, Video, Image,
  Sparkles, Gift, Crown as CrownIcon, Gem,
  Rocket, Zap, BadgeCheck, Clock as ClockIcon,
  Users as UsersIcon, Globe as GlobeIcon
} from 'lucide-react'
import { hotels, tours, regions } from '../data/tourismData'

const GhanaMap = () => {
  const { isDark } = useTheme()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const mapRef = useRef(null)
  const [map, setMap] = useState(null)
  const [markers, setMarkers] = useState([])
  const [selectedPlace, setSelectedPlace] = useState(null)
  const [showInfoWindow, setShowInfoWindow] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [mapLoaded, setMapLoaded] = useState(false)
  const [userLocation, setUserLocation] = useState(null)
  const [showStats, setShowStats] = useState(true)
  const [showLegend, setShowLegend] = useState(true)
  const [mapZoom, setMapZoom] = useState(7)
  const [selectedRegion, setSelectedRegion] = useState(null)
  const [regionStats, setRegionStats] = useState({})
  const [showRegionInfo, setShowRegionInfo] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isMapReady, setIsMapReady] = useState(false)

  // Google Maps API Key
  const GOOGLE_MAPS_API_KEY = 'AIzaSyCX9uG_Dt0f5hVanKUypE4O4tKMZkFiFzg'

  // Ghana regions with coordinates and info
  const regionLocations = {
    'greater-accra': { 
      lat: 5.6037, lng: -0.1870,
      description: 'Capital city with vibrant culture, beaches, and business hubs',
      attractions: ['Independence Arch', 'Kwame Nkrumah Mausoleum', 'Labadi Beach'],
      hotels: 25,
      tours: 18
    },
    'ashanti': { 
      lat: 6.6666, lng: -1.6163,
      description: 'Home to the Ashanti Kingdom, rich history and cultural heritage',
      attractions: ['Manhyia Palace', 'Kumasi Cultural Centre', 'Lake Bosomtwe'],
      hotels: 20,
      tours: 15
    },
    'western': { 
      lat: 5.5000, lng: -2.5000,
      description: 'Coastal region with beautiful beaches and fishing villages',
      attractions: ['Busua Beach', 'Nzulezo Stilt Village', 'Ankasa National Park'],
      hotels: 15,
      tours: 12
    },
    'eastern': { 
      lat: 6.5000, lng: -0.5000,
      description: 'Scenic landscapes with mountains, waterfalls, and botanical gardens',
      attractions: ['Aburi Botanical Gardens', 'Boti Falls', 'Akwapim Mountains'],
      hotels: 18,
      tours: 14
    },
    'central': { 
      lat: 5.5000, lng: -1.0000,
      description: 'Historical region with castles and coastal heritage',
      attractions: ['Cape Coast Castle', 'Elmina Castle', 'Kakum National Park'],
      hotels: 22,
      tours: 16
    },
    'volta': { 
      lat: 6.5000, lng: 0.5000,
      description: 'Lush landscapes with the Volta River and beautiful mountains',
      attractions: ['Mount Afadjato', 'Wli Waterfalls', 'Volta River'],
      hotels: 16,
      tours: 13
    },
    'northern': { 
      lat: 9.5000, lng: -0.5000,
      description: 'Gateway to the savannah with wildlife and cultural experiences',
      attractions: ['Mole National Park', 'Larabanga Mosque', 'Mysterious Stone'],
      hotels: 14,
      tours: 11
    },
    'upper-east': { 
      lat: 10.5000, lng: -0.5000,
      description: 'Cultural region with traditional villages and sacred sites',
      attractions: ['Paga Crocodile Pond', 'Tongo Hills', 'Sirigu Arts Centre'],
      hotels: 10,
      tours: 8
    },
    'upper-west': { 
      lat: 10.5000, lng: -2.5000,
      description: 'Rich in culture with traditional festivals and architecture',
      attractions: ['Wa Naa\'s Palace', 'Wechiau Hippo Sanctuary', 'Gbele Game Reserve'],
      hotels: 8,
      tours: 6
    },
    'bono': { 
      lat: 7.5000, lng: -2.5000,
      description: 'Known for its rich agricultural heritage and cultural festivals',
      attractions: ['Bono Manso', 'Kintampo Waterfalls', 'Boabeng-Fiema Monkey Sanctuary'],
      hotels: 12,
      tours: 9
    },
    'ahafo': { 
      lat: 7.0000, lng: -2.5000,
      description: 'Emerging region with diverse ecosystems and cultural heritage',
      attractions: ['Ahafo Hills', 'Traditional Festivals', 'Farm Tours'],
      hotels: 6,
      tours: 5
    },
    'savannah': { 
      lat: 9.0000, lng: -1.5000,
      description: 'Vast savannah landscapes with unique wildlife and culture',
      attractions: ['Mole Game Reserve', 'Traditional Villages', 'Savannah Tours'],
      hotels: 9,
      tours: 7
    },
    'north-east': { 
      lat: 10.0000, lng: -0.5000,
      description: 'Rich cultural heritage with traditional festivals and landmarks',
      attractions: ['Nalerigu', 'Gambaga Escarpment', 'Traditional Markets'],
      hotels: 7,
      tours: 5
    },
    'oti': { 
      lat: 7.5000, lng: 0.5000,
      description: 'Beautiful landscapes with rivers and traditional communities',
      attractions: ['Oti River', 'Traditional Villages', 'Scenic Views'],
      hotels: 5,
      tours: 4
    },
    'western-north': { 
      lat: 6.0000, lng: -3.0000,
      description: 'Rich in natural resources with beautiful forest reserves',
      attractions: ['Forest Reserves', 'Traditional Festivals', 'Cultural Tours'],
      hotels: 8,
      tours: 6
    }
  }

  // Generate random coordinates for demo places
  const generateRandomCoords = (regionId, count = 3) => {
    const base = regionLocations[regionId] || { lat: 7.9465, lng: -1.0232 }
    const places = []
    for (let i = 0; i < count; i++) {
      places.push({
        lat: base.lat + (Math.random() - 0.5) * 0.3,
        lng: base.lng + (Math.random() - 0.5) * 0.3
      })
    }
    return places
  }

  // Create markers data
  const createMarkers = () => {
    const allMarkers = []

    // Add hotels as markers
    hotels.forEach((hotel) => {
      const coords = generateRandomCoords(hotel.region, 1)[0]
      allMarkers.push({
        id: `hotel-${hotel.id}`,
        type: 'hotel',
        title: hotel.name,
        location: hotel.location,
        region: hotel.region,
        lat: coords.lat,
        lng: coords.lng,
        image: hotel.image,
        rating: hotel.rating,
        price: hotel.price,
        badge: hotel.badge,
        description: hotel.description,
        amenities: hotel.amenities,
        data: hotel
      })
    })

    // Add tours as markers
    tours.forEach((tour) => {
      const coords = generateRandomCoords(tour.region, 1)[0]
      allMarkers.push({
        id: `tour-${tour.id}`,
        type: 'tour',
        title: tour.title,
        location: tour.location,
        region: tour.region,
        lat: coords.lat,
        lng: coords.lng,
        image: tour.image,
        rating: tour.rating,
        price: tour.price,
        duration: tour.duration,
        description: tour.description,
        includes: tour.includes,
        data: tour
      })
    })

    // Add region markers with enhanced info
    Object.entries(regionLocations).forEach(([regionId, coords]) => {
      const region = regions.find(r => r.id === regionId)
      if (region) {
        const regionData = regionLocations[regionId]
        allMarkers.push({
          id: `region-${regionId}`,
          type: 'region',
          title: region.name,
          location: `${region.name}, Ghana`,
          region: regionId,
          lat: coords.lat,
          lng: coords.lng,
          image: `https://source.unsplash.com/400x300/?${region.name},Ghana`,
          description: regionData?.description || `Explore ${region.name} region`,
          attractions: regionData?.attractions || [],
          hotelsCount: regionData?.hotels || 0,
          toursCount: regionData?.tours || 0,
          data: region
        })
      }
    })

    return allMarkers
  }

  // Load Google Maps
  useEffect(() => {
    const loadGoogleMaps = () => {
      if (!window.google) {
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`
        script.async = true
        script.defer = true
        script.onload = () => {
          setIsMapReady(true)
          setIsLoading(false)
        }
        script.onerror = () => {
          showToast('Failed to load map. Please refresh and try again.', 'error')
          setIsLoading(false)
        }
        document.head.appendChild(script)
      } else {
        setIsMapReady(true)
        setIsLoading(false)
      }
    }

    loadGoogleMaps()

    return () => {
      // Cleanup
    }
  }, [])

  // Initialize map when ready
  useEffect(() => {
    if (isMapReady && mapRef.current && window.google && window.google.maps) {
      initializeMap()
    }
  }, [isMapReady])

  // Re-initialize map when theme changes
  useEffect(() => {
    if (map && isMapReady) {
      map.setOptions({
        styles: isDark ? darkMapStyle : lightMapStyle
      })
    }
  }, [isDark, map, isMapReady])

  const initializeMap = () => {
    if (!window.google || !window.google.maps || !mapRef.current) {
      console.log('Google Maps not ready yet')
      return
    }

    const mapInstance = new window.google.maps.Map(mapRef.current, {
      center: { lat: 7.9465, lng: -1.0232 },
      zoom: 7,
      styles: isDark ? darkMapStyle : lightMapStyle,
      mapTypeControl: true,
      mapTypeControlOptions: {
        style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: window.google.maps.ControlPosition.TOP_RIGHT
      },
      zoomControl: true,
      zoomControlOptions: {
        position: window.google.maps.ControlPosition.RIGHT_TOP
      },
      streetViewControl: true,
      streetViewControlOptions: {
        position: window.google.maps.ControlPosition.RIGHT_TOP
      },
      fullscreenControl: true,
      fullscreenControlOptions: {
        position: window.google.maps.ControlPosition.RIGHT_TOP
      }
    })

    setMap(mapInstance)
    addMarkers(mapInstance)

    // Add zoom listener
    mapInstance.addListener('zoom_changed', () => {
      setMapZoom(mapInstance.getZoom())
    })
  }

  // Map styles
  const darkMapStyle = [
    { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
    { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
    { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#263c3f' }] },
    { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6b9a76' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#38414e' }] },
    { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#212a37' }] },
    { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#9ca5b3' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#746855' }] },
    { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#1f2835' }] },
    { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#f3d19c' }] },
    { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#2f3948' }] },
    { featureType: 'transit.station', elementType: 'labels.text.fill', stylers: [{ color: '#d59563' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#17263c' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#515c6d' }] },
    { featureType: 'water', elementType: 'labels.text.stroke', stylers: [{ color: '#17263c' }] }
  ]

  const lightMapStyle = [
    { elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
    { elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
    { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#bdbdbd' }] },
    { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
    { featureType: 'poi', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
    { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#e5e5e5' }] },
    { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
    { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
    { featureType: 'road.arterial', elementType: 'labels.text.fill', stylers: [{ color: '#757575' }] },
    { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#dadada' }] },
    { featureType: 'road.highway', elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
    { featureType: 'road.local', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] },
    { featureType: 'transit.line', elementType: 'geometry', stylers: [{ color: '#e5e5e5' }] },
    { featureType: 'transit.station', elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
    { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9c9c9' }] },
    { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#9e9e9e' }] }
  ]

  const addMarkers = (mapInstance) => {
    if (!window.google || !window.google.maps) return
    
    const allMarkers = createMarkers()
    setMarkers(allMarkers)

    // Create markers with custom icons
    allMarkers.forEach((markerData) => {
      const icon = getMarkerIcon(markerData.type)
      
      const marker = new window.google.maps.Marker({
        position: { lat: markerData.lat, lng: markerData.lng },
        map: mapInstance,
        title: markerData.title,
        icon: {
          url: icon,
          scaledSize: new window.google.maps.Size(40, 40),
          anchor: new window.google.maps.Point(20, 20)
        },
        animation: window.google.maps.Animation.DROP,
        data: markerData
      })

      // Add click listener
      marker.addListener('click', () => {
        setSelectedPlace(markerData)
        setShowInfoWindow(true)
        
        // Center map on marker
        mapInstance.panTo({ lat: markerData.lat, lng: markerData.lng })
        mapInstance.setZoom(12)
      })
    })
  }

  const getMarkerIcon = (type) => {
    const colors = {
      hotel: 'FF6B35',
      tour: '00B4D8',
      region: 'F4A261'
    }
    const icons = {
      hotel: '🏨',
      tour: '📍',
      region: '📍'
    }
    return `data:image/svg+xml,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
        <circle cx="20" cy="20" r="18" fill="#${colors[type]}" opacity="0.9"/>
        <circle cx="20" cy="20" r="15" fill="white" opacity="0.2"/>
        <text x="20" y="26" font-size="20" text-anchor="middle" fill="white">${icons[type]}</text>
      </svg>
    `)}`
  }

  const filteredMarkers = markers.filter(marker => {
    if (activeFilter !== 'all' && marker.type !== activeFilter) return false
    if (searchQuery) {
      return marker.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
             marker.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
             marker.description?.toLowerCase().includes(searchQuery.toLowerCase())
    }
    return true
  })

  // Filter by type
  const filterTypes = [
    { id: 'all', label: 'All', icon: MapPin, color: 'text-gray-400' },
    { id: 'hotel', label: 'Hotels', icon: Hotel, color: 'text-orange-500' },
    { id: 'tour', label: 'Tours', icon: Compass, color: 'text-blue-500' },
    { id: 'region', label: 'Regions', icon: MapPin, color: 'text-amber-500' }
  ]

  // Get counts for each type
  const getTypeCount = (type) => {
    if (type === 'all') return markers.length
    return markers.filter(m => m.type === type).length
  }

  // Get stats for selected region
  const getRegionStats = () => {
    const stats = {}
    regions.forEach(region => {
      const regionHotels = hotels.filter(h => h.region === region.id)
      const regionTours = tours.filter(t => t.region === region.id)
      stats[region.id] = {
        hotels: regionHotels.length,
        tours: regionTours.length,
        total: regionHotels.length + regionTours.length
      }
    })
    return stats
  }

  const handleRegionSelect = (regionId) => {
    const regionData = regionLocations[regionId]
    if (regionData && map) {
      setSelectedRegion(regionId)
      setShowRegionInfo(true)
      map.panTo({ lat: regionData.lat, lng: regionData.lng })
      map.setZoom(10)
    }
  }

  const handleGetDirections = (place) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const url = `https://www.google.com/maps/dir/${position.coords.latitude},${position.coords.longitude}/${place.lat},${place.lng}`
          window.open(url, '_blank')
        },
        () => {
          const url = `https://www.google.com/maps/dir//${place.lat},${place.lng}`
          window.open(url, '_blank')
        }
      )
    } else {
      const url = `https://www.google.com/maps/dir//${place.lat},${place.lng}`
      window.open(url, '_blank')
    }
  }

  const handleShare = async (place) => {
    const shareData = {
      title: place.title,
      text: `Check out ${place.title} in ${place.location}!`,
      url: window.location.href
    }

    if (navigator.share) {
      try {
        await navigator.share(shareData)
      } catch (err) {
        if (err.name !== 'AbortError') {
          navigator.clipboard.writeText(window.location.href)
          showToast('Link copied to clipboard!', 'success')
        }
      }
    } else {
      navigator.clipboard.writeText(window.location.href)
      showToast('Link copied to clipboard!', 'success')
    }
  }

  const handleFavorite = (place) => {
    if (!user) {
      showToast('Please login to save favorites', 'info')
      navigate('/login')
      return
    }
    
    showToast(`Added ${place.title} to favorites! ❤️`, 'success')
  }

  // Get icon for amenity
  const getAmenityIcon = (amenity) => {
    const iconMap = {
      'Spa': Sparkles,
      'Pool': Waves,
      'Gym': Dumbbell,
      'Restaurant': Utensils,
      'Free WiFi': Wifi,
      'Parking': Car,
      'Conference Rooms': Users,
      'Beach Access': Waves,
      'Safari Tours': Compass,
      'Observation Deck': Eye,
      'Water Sports': Waves,
      'Tour Desk': Compass
    }
    return iconMap[amenity] || MapPin
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
      <Navbar />

      <div className="pt-20">
        <div className="container-custom">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h1 className={`text-3xl md:text-4xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Explore Ghana
              </h1>
              <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Discover tourist sites, hotels, and attractions across Ghana's 16 regions
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <div className={`px-3 py-1.5 rounded-xl text-xs font-medium ${isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
                {filteredMarkers.length} locations found
              </div>
              <button
                onClick={() => setShowStats(!showStats)}
                className={`p-2 rounded-xl transition-all ${
                  isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {showStats ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Stats Dashboard */}
          <AnimatePresence>
            {showStats && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4"
              >
                <div className={`p-3 rounded-xl text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {markers.length}
                  </div>
                  <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Total Locations
                  </div>
                </div>
                {filterTypes.filter(f => f.id !== 'all').map((filter) => (
                  <div key={filter.id} className={`p-3 rounded-xl text-center ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                    <div className={`text-2xl font-bold ${filter.color}`}>
                      {getTypeCount(filter.id)}
                    </div>
                    <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {filter.label}
                    </div>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
              <input
                type="text"
                placeholder="Search by name, location, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl outline-none text-sm ${
                  isDark 
                    ? 'bg-gray-800 text-white border-gray-700' 
                    : 'bg-gray-50 text-gray-800 border-gray-200'
                } border focus:border-amber-500 transition-colors`}
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {filterTypes.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                    activeFilter === filter.id
                      ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                      : isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <filter.icon className={`w-4 h-4 ${activeFilter === filter.id ? 'text-white' : filter.color}`} />
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          {/* Region Quick Access */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            <span className={`text-xs font-medium px-2 py-1 rounded-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Regions:
            </span>
            {regions.slice(0, 10).map((region) => (
              <button
                key={region.id}
                onClick={() => handleRegionSelect(region.id)}
                className={`text-xs px-2.5 py-1 rounded-lg transition-all ${
                  selectedRegion === region.id
                    ? 'bg-amber-500 text-white'
                    : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {region.name}
              </button>
            ))}
            {regions.length > 10 && (
              <span className={`text-xs px-2.5 py-1 rounded-lg ${isDark ? 'bg-gray-800 text-gray-500' : 'bg-gray-100 text-gray-400'}`}>
                +{regions.length - 10} more
              </span>
            )}
          </div>

          {/* Map Container */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl" style={{ height: '65vh', minHeight: '450px' }}>
            {isMapReady ? (
              <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-800">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Loading Google Maps...
                  </p>
                </div>
              </div>
            )}
            
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-800">
                <div className="text-center">
                  <div className="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Loading map...</p>
                </div>
              </div>
            )}

            {/* Map Controls */}
            <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
              <button
                onClick={() => {
                  if (map) {
                    map.setZoom(map.getZoom() + 1)
                  }
                }}
                className={`p-2 rounded-xl shadow-lg transition-all hover:scale-105 ${
                  isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
                }`}
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (map) {
                    map.setZoom(map.getZoom() - 1)
                  }
                }}
                className={`p-2 rounded-xl shadow-lg transition-all hover:scale-105 ${
                  isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
                }`}
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  if (map) {
                    map.setCenter({ lat: 7.9465, lng: -1.0232 })
                    map.setZoom(7)
                  }
                }}
                className={`p-2 rounded-xl shadow-lg transition-all hover:scale-105 ${
                  isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'
                }`}
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            {/* Info Window */}
            <AnimatePresence>
              {showInfoWindow && selectedPlace && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.9 }}
                  className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 max-h-[80vh] overflow-y-auto z-20"
                >
                  <div className={`p-5 rounded-2xl shadow-2xl ${
                    isDark ? 'bg-gray-900 border border-gray-700' : 'bg-white border border-gray-100'
                  }`}>
                    <button
                      onClick={() => setShowInfoWindow(false)}
                      className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    
                    <div className="aspect-video rounded-xl overflow-hidden mb-4 relative">
                      <img 
                        src={selectedPlace.image} 
                        alt={selectedPlace.title}
                        className="w-full h-full object-cover"
                      />
                      {selectedPlace.badge && (
                        <span className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
                          {selectedPlace.badge}
                        </span>
                      )}
                      <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                        selectedPlace.type === 'hotel' ? 'bg-orange-500' :
                        selectedPlace.type === 'tour' ? 'bg-blue-500' : 'bg-amber-500'
                      } text-white`}>
                        {selectedPlace.type}
                      </span>
                    </div>
                    
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          {selectedPlace.title}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 mt-0.5">
                          <MapPin className="w-3 h-3 mr-1" />
                          {selectedPlace.location}
                        </div>
                      </div>
                      {selectedPlace.rating && (
                        <div className="flex items-center gap-1 text-amber-400">
                          <Star className="w-4 h-4 fill-current" />
                          <span className="font-medium">{selectedPlace.rating}</span>
                        </div>
                      )}
                    </div>

                    <p className={`text-sm mt-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {selectedPlace.description}
                    </p>

                    {selectedPlace.type === 'region' && selectedPlace.attractions && (
                      <div className="mt-3">
                        <p className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Attractions:
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedPlace.attractions.map((attraction, i) => (
                            <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${
                              isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {attraction}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedPlace.type === 'hotel' && selectedPlace.amenities && (
                      <div className="mt-3">
                        <p className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Amenities:
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedPlace.amenities.slice(0, 5).map((amenity, i) => (
                            <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${
                              isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {amenity}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedPlace.type === 'tour' && selectedPlace.includes && (
                      <div className="mt-3">
                        <p className={`text-xs font-semibold ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Includes:
                        </p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {selectedPlace.includes.slice(0, 5).map((item, i) => (
                            <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${
                              isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {item}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="mt-3 flex items-center justify-between pt-3 border-t border-gray-200/20">
                      <div>
                        {selectedPlace.price && (
                          <span className="text-lg font-bold text-amber-500">{selectedPlace.price}</span>
                        )}
                        {selectedPlace.duration && (
                          <span className={`text-sm ml-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {selectedPlace.duration}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleFavorite(selectedPlace)}
                          className="p-1.5 rounded-lg hover:bg-amber-500/10 transition-colors"
                        >
                          <Heart className="w-4 h-4 text-gray-400 hover:text-amber-500 transition-colors" />
                        </button>
                        <button
                          onClick={() => handleShare(selectedPlace)}
                          className="p-1.5 rounded-lg hover:bg-amber-500/10 transition-colors"
                        >
                          <Share2 className="w-4 h-4 text-gray-400 hover:text-amber-500 transition-colors" />
                        </button>
                        <button
                          onClick={() => handleGetDirections(selectedPlace)}
                          className="p-1.5 rounded-lg hover:bg-amber-500/10 transition-colors"
                        >
                          <Navigation className="w-4 h-4 text-gray-400 hover:text-amber-500 transition-colors" />
                        </button>
                        <Link to={selectedPlace.type === 'hotel' ? `/hotel/${selectedPlace.data?.id}` : `/tour/${selectedPlace.data?.id}`}>
                          <button className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-all hover:scale-105">
                            View
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Legend */}
          <div className={`mt-4 p-3 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'} flex flex-wrap items-center gap-4`}>
            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Legend:
            </span>
            {filterTypes.map((filter) => (
              <div key={filter.id} className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${filter.color.replace('text-', 'bg-')}`} />
                <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {filter.label}
                </span>
              </div>
            ))}
            <div className="ml-auto text-xs text-gray-400 flex items-center gap-2">
              <span>Zoom: {mapZoom}x</span>
              <span>•</span>
              <span>{filteredMarkers.length} locations</span>
            </div>
          </div>

          {/* Tips */}
          <div className={`mt-4 p-4 rounded-xl ${isDark ? 'bg-amber-500/10 border border-amber-500/20' : 'bg-amber-50 border border-amber-200'}`}>
            <div className="flex items-start gap-3">
              <Info className={`w-5 h-5 ${isDark ? 'text-amber-400' : 'text-amber-500'} flex-shrink-0 mt-0.5`} />
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-amber-400' : 'text-amber-700'}`}>
                  💡 Pro Tips:
                </p>
                <ul className={`text-xs ${isDark ? 'text-amber-300/70' : 'text-amber-600'} mt-1 space-y-0.5`}>
                  <li>• Click on any marker to see details about hotels, tours, and regions</li>
                  <li>• Use the search bar to find specific locations or attractions</li>
                  <li>• Click on region names above the map to zoom into specific areas</li>
                  <li>• Use the navigation button in the info window to get directions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default GhanaMap
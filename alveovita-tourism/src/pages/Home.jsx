// src/pages/Home.jsx
import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Autoplay, Pagination, Navigation, EffectFade } from 'swiper/modules'
import { motion, AnimatePresence } from 'framer-motion'
import axios from '../api/axios'
import { 
  ArrowRight, Star, Users, Award, Globe, Heart, Shield, Clock,
  ChevronRight, Play, MapPin, Calendar, CheckCircle, Quote,
  TrendingUp, Building2, Stethoscope, Flower2, Sun, Leaf,
  Coffee, Camera, Mountain, Waves, Plane, Hotel, Compass,
  Sparkles, Briefcase, Dumbbell, Utensils, Music, TreePine,
  Bird, Zap, Gift, BadgeCheck, Crown, Gem, Rocket, Infinity,
  Layers, Grid, Palette, Wand2, Sparkle, Stars, Phone, Mail,
  Book, BookOpen, Video, Mic, Image, Upload, X, Filter,
  Search, ThumbsUp, MessageCircle, Share2, Bookmark, Eye,
  Loader2, Diamond, Trophy, Medal, Crown as CrownIcon
} from 'lucide-react'
import { useTheme } from '../context/ThemeContext'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../hooks/useToast'
import { useSocket } from '../context/SocketContext'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'
import ShareExperienceModal from '../components/common/ShareExperienceModal'
import ExperienceDetailsModal from '../components/common/ExperienceDetailsModal'
import EditExperienceModal from '../components/common/EditExperienceModal'
import { regions } from '../data/tourismData'
import { formatDate, getRegionName, getInitials } from '../utils/helpers'

// Import Swiper styles
import 'swiper/css'
import 'swiper/css/effect-fade'
import 'swiper/css/navigation'
import 'swiper/css/pagination'

const Home = () => {
  const { isDark } = useTheme()
  const { user } = useAuth()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const { socket, isConnected } = useSocket()
  
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('wellness')
  const [selectedRegion, setSelectedRegion] = useState('all')
  const [scrolled, setScrolled] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)
  const [showExperienceModal, setShowExperienceModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedExperience, setSelectedExperience] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [expandedRegions, setExpandedRegions] = useState(false)
  const [likedExperiences, setLikedExperiences] = useState({})
  const [bookmarkedExperiences, setBookmarkedExperiences] = useState({})
  const [notification, setNotification] = useState(null)
  const [searchSuggestions, setSearchSuggestions] = useState([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isSearchingSuggestions, setIsSearchingSuggestions] = useState(false)
  const [searchError, setSearchError] = useState(null)
  
  // Data states
  const [hotels, setHotels] = useState([])
  const [tours, setTours] = useState([])
  const [experiences, setExperiences] = useState([])
  const [totalHotels, setTotalHotels] = useState(0)
  const [totalTours, setTotalTours] = useState(0)
  const [totalExperiences, setTotalExperiences] = useState(0)

  // Search timeout ref
  let searchTimeout = null

  // Socket.IO event listeners
  useEffect(() => {
    if (!socket) return;

    const handleExperienceCreated = (data) => {
      const newExperience = {
        _id: data.experienceId,
        title: data.title,
        content: data.content,
        type: data.type,
        mediaUrl: data.mediaUrl,
        thumbnail: data.thumbnail,
        region: data.region,
        tourName: data.tourName,
        createdAt: data.createdAt,
        user: {
          _id: data.userId,
          name: data.userName,
          avatar: data.userAvatar
        },
        likes: [],
        comments: [],
        views: 0
      };
      
      setExperiences(prev => [newExperience, ...prev]);
      setTotalExperiences(prev => prev + 1);
      
      setNotification({
        type: 'new',
        message: `✨ ${data.userName} shared "${data.title}"`,
        data: data
      });
      
      showToast(`✨ New experience shared: ${data.title}`, 'info');
    };

    const handleExperienceUpdated = (data) => {
      setExperiences(prev => prev.map(exp => 
        exp._id === data.experienceId 
          ? {
              ...exp,
              title: data.title,
              content: data.content,
              type: data.type,
              mediaUrl: data.mediaUrl,
              thumbnail: data.thumbnail,
              region: data.region,
              tourName: data.tourName
            }
          : exp
      ));
      
      setNotification({
        type: 'updated',
        message: `🔄 "${data.title}" was updated`,
        data: data
      });
    };

    const handleExperienceDeleted = (data) => {
      setExperiences(prev => prev.filter(exp => exp._id !== data.experienceId));
      setTotalExperiences(prev => prev - 1);
      
      if (selectedExperience?._id === data.experienceId) {
        setShowExperienceModal(false);
        setSelectedExperience(null);
      }
      
      setNotification({
        type: 'deleted',
        message: `🗑️ "${data.title}" was deleted`,
        data: data
      });
    };

    const handleLikeToggled = (data) => {
      setExperiences(prev => prev.map(exp => 
        exp._id === data.experienceId 
          ? { ...exp, likes: Array(data.totalLikes).fill({}) }
          : exp
      ));
      
      if (data.userId === user?.id) {
        setLikedExperiences(prev => ({
          ...prev,
          [data.experienceId]: data.liked
        }));
      }
    };

    const handleBookmarkToggled = (data) => {
      if (data.userId === user?.id) {
        setBookmarkedExperiences(prev => ({
          ...prev,
          [data.experienceId]: data.bookmarked
        }));
      }
    };

    const handleCommentAdded = (data) => {
      setExperiences(prev => prev.map(exp => 
        exp._id === data.experienceId 
          ? { ...exp, comments: [...(exp.comments || []), data.comment] }
          : exp
      ));
      
      if (selectedExperience?._id === data.experienceId) {
        setSelectedExperience(prev => ({
          ...prev,
          comments: [...(prev?.comments || []), data.comment]
        }));
      }
    };

    const handleReplyAdded = (data) => {
      setExperiences(prev => prev.map(exp => {
        if (exp._id === data.experienceId) {
          const updatedComments = exp.comments.map(c => {
            if (c._id === data.commentId) {
              return { ...c, replies: [...(c.replies || []), data.reply] };
            }
            return c;
          });
          return { ...exp, comments: updatedComments };
        }
        return exp;
      }));
      
      if (selectedExperience?._id === data.experienceId) {
        setSelectedExperience(prev => {
          const updatedComments = prev?.comments?.map(c => {
            if (c._id === data.commentId) {
              return { ...c, replies: [...(c.replies || []), data.reply] };
            }
            return c;
          });
          return { ...prev, comments: updatedComments };
        });
      }
    };

    const handleCommentDeleted = (data) => {
      setExperiences(prev => prev.map(exp => 
        exp._id === data.experienceId 
          ? { ...exp, comments: exp.comments.filter(c => c._id !== data.commentId) }
          : exp
      ));
      
      if (selectedExperience?._id === data.experienceId) {
        setSelectedExperience(prev => ({
          ...prev,
          comments: prev?.comments?.filter(c => c._id !== data.commentId) || []
        }));
      }
    };

    const handleReplyDeleted = (data) => {
      const removeReply = (items) => {
        for (let item of items) {
          if (item._id === data.commentId) {
            const removeFromReplies = (replies) => {
              const index = replies.findIndex(r => r._id === data.replyId);
              if (index !== -1) {
                replies.splice(index, 1);
                return true;
              }
              for (let reply of replies) {
                if (reply.replies && reply.replies.length > 0) {
                  if (removeFromReplies(reply.replies)) return true;
                }
              }
              return false;
            };
            if (item.replies) {
              removeFromReplies(item.replies);
            }
            return true;
          }
          if (item.replies && item.replies.length > 0) {
            if (removeReply(item.replies)) return true;
          }
        }
        return false;
      };

      setExperiences(prev => prev.map(exp => {
        if (exp._id === data.experienceId) {
          const updatedComments = [...exp.comments];
          removeReply(updatedComments);
          return { ...exp, comments: updatedComments };
        }
        return exp;
      }));
    };

    socket.on('experience-created', handleExperienceCreated);
    socket.on('experience-updated', handleExperienceUpdated);
    socket.on('experience-deleted', handleExperienceDeleted);
    socket.on('experience-like-toggled', handleLikeToggled);
    socket.on('experience-bookmark-toggled', handleBookmarkToggled);
    socket.on('experience-comment-added', handleCommentAdded);
    socket.on('experience-reply-added', handleReplyAdded);
    socket.on('experience-comment-deleted', handleCommentDeleted);
    socket.on('experience-reply-deleted', handleReplyDeleted);

    return () => {
      socket.off('experience-created', handleExperienceCreated);
      socket.off('experience-updated', handleExperienceUpdated);
      socket.off('experience-deleted', handleExperienceDeleted);
      socket.off('experience-like-toggled', handleLikeToggled);
      socket.off('experience-bookmark-toggled', handleBookmarkToggled);
      socket.off('experience-comment-added', handleCommentAdded);
      socket.off('experience-reply-added', handleReplyAdded);
      socket.off('experience-comment-deleted', handleCommentDeleted);
      socket.off('experience-reply-deleted', handleReplyDeleted);
    };
  }, [socket, showToast, user, selectedExperience]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Fetch data when region or search term changes
  useEffect(() => {
    fetchData()
  }, [selectedRegion, searchTerm])

  // Fetch search suggestions with debounce
  const fetchSearchSuggestions = async (query) => {
    if (!query || query.trim().length < 1) {
      setSearchSuggestions([])
      setShowSuggestions(false)
      return
    }

    setIsSearchingSuggestions(true)
    setSearchError(null)

    try {
      const response = await axios.get('/api/search/suggestions', {
        params: { q: query.trim(), limit: 5 }
      })
      
      if (response.data.success) {
        setSearchSuggestions(response.data.suggestions || [])
        setShowSuggestions(response.data.suggestions.length > 0)
      } else {
        setSearchSuggestions([])
        setShowSuggestions(false)
      }
    } catch (error) {
      console.error('Search suggestions error:', error)
      setSearchError('Failed to load suggestions')
      setSearchSuggestions([])
      setShowSuggestions(false)
    } finally {
      setIsSearchingSuggestions(false)
    }
  }

  // Handle search input with debounce
  const handleSearchInput = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
      fetchSearchSuggestions(value)
    }, 300)
  }

  // Handle search submission
  const handleSearchSubmit = () => {
    if (searchTerm.trim().length >= 2) {
      navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`)
      setShowSuggestions(false)
      setSearchSuggestions([])
    } else if (searchTerm.trim().length > 0) {
      showToast('Please enter at least 2 characters', 'info')
    } else {
      navigate('/search')
    }
  }

  // Handle search on Enter key
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearchSubmit()
    }
    if (e.key === 'Escape') {
      setShowSuggestions(false)
      setSearchSuggestions([])
    }
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    if (suggestion.id && suggestion.type) {
      navigate(`/${suggestion.type}/${suggestion.id}`)
    } else {
      navigate(`/search?q=${encodeURIComponent(suggestion.text || searchTerm)}`)
    }
    setShowSuggestions(false)
    setSearchSuggestions([])
    setSearchTerm('')
  }

  // Get icon for suggestion type
  const getSuggestionIcon = (type) => {
    const icons = {
      hotel: Hotel,
      tour: Compass,
      destination: MapPin,
      experience: Sparkles,
      page: Home,
      service: Package
    }
    const Icon = icons[type] || Search
    return <Icon className="w-4 h-4" />
  }

  const getSuggestionColor = (type) => {
    const colors = {
      hotel: 'text-blue-500 bg-blue-500/10',
      tour: 'text-green-500 bg-green-500/10',
      destination: 'text-purple-500 bg-purple-500/10',
      experience: 'text-amber-500 bg-amber-500/10',
      page: 'text-gray-500 bg-gray-500/10',
      service: 'text-rose-500 bg-rose-500/10'
    }
    return colors[type] || 'text-gray-500 bg-gray-500/10'
  }

  const fetchData = async () => {
    try {
      setLoading(true)
      
      const hotelParams = new URLSearchParams()
      if (selectedRegion !== 'all') hotelParams.append('region', selectedRegion)
      if (searchTerm) hotelParams.append('search', searchTerm)
      hotelParams.append('limit', 6)
      
      const hotelRes = await axios.get(`/hotels?${hotelParams.toString()}`)
      if (hotelRes.data.success) {
        const formattedHotels = hotelRes.data.hotels.map(h => ({
          ...h,
          id: h._id,
          price: `₵${h.price.toLocaleString()}`
        }))
        setHotels(formattedHotels)
        setTotalHotels(hotelRes.data.pagination?.total || 0)
      }

      const tourParams = new URLSearchParams()
      if (selectedRegion !== 'all') tourParams.append('region', selectedRegion)
      if (searchTerm) tourParams.append('search', searchTerm)
      tourParams.append('limit', 6)
      
      const tourRes = await axios.get(`/tours?${tourParams.toString()}`)
      if (tourRes.data.success) {
        const formattedTours = tourRes.data.tours.map(t => ({
          ...t,
          id: t._id,
          price: `₵${t.price.toLocaleString()}`
        }))
        setTours(formattedTours)
        setTotalTours(tourRes.data.pagination?.total || 0)
      }

      const expParams = new URLSearchParams()
      if (selectedRegion !== 'all') expParams.append('region', selectedRegion)
      if (searchTerm) expParams.append('search', searchTerm)
      expParams.append('limit', 10)
      
      const expRes = await axios.get(`/experiences?${expParams.toString()}`)
      if (expRes.data.success) {
        setExperiences(expRes.data.experiences || [])
        setTotalExperiences(expRes.data.pagination?.total || 0)
        
        if (user) {
          const likedRes = await axios.get('/experiences/liked')
          const bookmarkedRes = await axios.get('/experiences/bookmarked')
          if (likedRes.data.success) {
            const likedMap = {}
            likedRes.data.liked.forEach(id => { likedMap[id] = true })
            setLikedExperiences(likedMap)
          }
          if (bookmarkedRes.data.success) {
            const bookmarkedMap = {}
            bookmarkedRes.data.bookmarked.forEach(id => { bookmarkedMap[id] = true })
            setBookmarkedExperiences(bookmarkedMap)
          }
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      showToast('Failed to load data', 'error')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteExperience = async (experienceId) => {
    try {
      await axios.delete(`/experiences/${experienceId}`)
      setExperiences(prev => prev.filter(exp => exp._id !== experienceId))
      setTotalExperiences(prev => prev - 1)
      showToast('Experience deleted successfully', 'success')
      setShowExperienceModal(false)
      setSelectedExperience(null)
    } catch (error) {
      console.error('Error deleting experience:', error)
      showToast(error.response?.data?.message || 'Failed to delete experience', 'error')
    }
  }

  const handleEditExperience = async (experienceId, formData) => {
    try {
      const response = await axios.put(`/experiences/${experienceId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
      
      if (response.data.success) {
        setExperiences(prev => prev.map(exp => 
          exp._id === experienceId ? response.data.experience : exp
        ))
        showToast('Experience updated successfully!', 'success')
        setShowEditModal(false)
        setShowExperienceModal(false)
        setSelectedExperience(null)
      }
    } catch (error) {
      console.error('Error updating experience:', error)
      showToast(error.response?.data?.message || 'Failed to update experience', 'error')
      throw error
    }
  }

  const handleLike = async (experienceId) => {
    if (!user) {
      showToast('Please login to like experiences', 'info')
      navigate('/login')
      return
    }
    
    try {
      const response = await axios.post(`/experiences/${experienceId}/like`)
      
      setLikedExperiences(prev => ({
        ...prev,
        [experienceId]: !prev[experienceId]
      }))
      
      setExperiences(prev => prev.map(exp => 
        exp._id === experienceId 
          ? { ...exp, likes: response.data.likes }
          : exp
      ))
    } catch (error) {
      console.error('Error liking experience:', error)
      showToast('Failed to like experience', 'error')
    }
  }

  const handleBookmark = async (experienceId) => {
    if (!user) {
      showToast('Please login to bookmark experiences', 'info')
      navigate('/login')
      return
    }
    
    try {
      const isBookmarked = bookmarkedExperiences[experienceId]
      await axios.post(`/experiences/${experienceId}/bookmark`)
      
      setBookmarkedExperiences(prev => ({
        ...prev,
        [experienceId]: !prev[experienceId]
      }))
      
      showToast(
        isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks',
        'success'
      )
    } catch (error) {
      console.error('Error bookmarking experience:', error)
      showToast('Failed to bookmark experience', 'error')
    }
  }

  const handleShare = (experienceId) => {
    const experience = experiences.find(e => e._id === experienceId)
    if (navigator.share) {
      navigator.share({
        title: experience.title,
        text: experience.description,
        url: `${window.location.origin}/experience/${experienceId}`
      }).catch(() => {})
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/experience/${experienceId}`)
      showToast('Link copied to clipboard!', 'success')
    }
  }

  const handleViewExperience = (experience) => {
    setSelectedExperience(experience)
    setShowExperienceModal(true)
  }

  const handleShareSubmit = async (formData) => {
    try {
      const response = await axios.post('/experiences', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (response.data.success) {
        showToast('Experience shared successfully! 🎉', 'success')
        setShowShareModal(false)
      }
    } catch (error) {
      console.error('Error sharing experience:', error)
      showToast(error.response?.data?.message || 'Failed to share experience', 'error')
    }
  }

  const serviceCategories = {
    wellness: {
      title: 'Wellness Retreats',
      icon: Flower2,
      color: 'from-emerald-500 to-teal-500',
      services: [
        { name: 'Stress Relief Getaways', description: 'Weekend escapes for busy professionals', icon: Sun },
        { name: 'Mental Wellness Retreats', description: 'Emotional restoration & mindfulness', icon: Heart },
        { name: 'Nature & Adventure Therapy', description: 'Healing through nature experiences', icon: TreePine },
        { name: 'Spa & Therapeutic Treatments', description: 'Luxury relaxation & rejuvenation', icon: Coffee }
      ]
    },
    medical: {
      title: 'Medical Tourism',
      icon: Stethoscope,
      color: 'from-blue-500 to-cyan-500',
      services: [
        { name: 'Executive Health Screening', description: 'Comprehensive health check-ups', icon: Shield },
        { name: 'Wellness Programs', description: 'Preventive healthcare & holistic wellness', icon: Heart },
        { name: 'Rehabilitation Services', description: 'Recovery & therapeutic care', icon: Zap },
        { name: 'Nutritional Counseling', description: 'Personalized nutrition planning', icon: Utensils }
      ]
    },
    corporate: {
      title: 'Corporate Wellness',
      icon: Briefcase,
      color: 'from-purple-500 to-indigo-500',
      services: [
        { name: 'Corporate Wellness Retreats', description: 'Team building & leadership development', icon: Users },
        { name: 'Stress Management Programs', description: 'Employee well-being & productivity', icon: Mountain },
        { name: 'Health Education Workshops', description: 'Workplace wellness workshops', icon: Book },
        { name: 'Fitness Programs', description: 'Corporate fitness initiatives', icon: Dumbbell }
      ]
    },
    special: {
      title: 'Special Programs',
      icon: Gift,
      color: 'from-amber-500 to-orange-500',
      services: [
        { name: 'Senior Wellness Tourism', description: 'Gentle exercise & social engagement', icon: Crown },
        { name: 'Student Wellness Programs', description: 'Academic stress management', icon: BookOpen },
        { name: 'Family Wellness', description: 'Bonding & rejuvenation experiences', icon: Heart },
        { name: 'Cultural Immersion', description: 'Ghanaian heritage & traditions', icon: Globe }
      ]
    }
  }

  const heroSlides = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1542296332-2e4473faf563?w=1920&q=80',
      title: 'Discover Wellness',
      subtitle: 'Where Health Meets Paradise',
      description: 'Experience transformative health and wellness journeys in the heart of Ghana.',
      badge: 'Premium Wellness 2024',
      stats: ['98% Satisfaction', '50+ Partners', '15K+ Clients']
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=1920&q=80',
      title: 'Fly with Confidence',
      subtitle: 'Seamless Global Access',
      description: 'Private charters, VIP lounges, and personalized travel coordination.',
      badge: 'Luxury Travel',
      stats: ['24/7 Support', 'VIP Service', 'Global Network']
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1920&q=80',
      title: 'Stay in Paradise',
      subtitle: '5-Star Wellness Resorts',
      description: 'Where healing meets luxury in Africa\'s most stunning destinations.',
      badge: 'Award Winning',
      stats: ['5-Star Rating', 'Spa Access', 'Personal Concierge']
    }
  ]

  const statistics = [
    { icon: Users, value: '15,000+', label: 'Happy Clients', description: 'Across 50+ countries' },
    { icon: Building2, value: '50+', label: 'Partner Hotels', description: 'Accredited facilities' },
    { icon: Award, value: '200+', label: 'Wellness Programs', description: 'Customized offerings' },
    { icon: Heart, value: '98%', label: 'Satisfaction Rate', description: 'Client feedback' }
  ]

  const getExperienceIcon = (type) => {
    switch(type) {
      case 'video': return <Play className="w-4 h-4" />
      case 'image': return <Image className="w-4 h-4" />
      case 'audio': return <Mic className="w-4 h-4" />
      default: return <MessageCircle className="w-4 h-4" />
    }
  }

  const getExperienceColor = (type) => {
    switch(type) {
      case 'video': return 'bg-gradient-to-r from-blue-500 to-purple-500'
      case 'image': return 'bg-gradient-to-r from-green-500 to-emerald-500'
      case 'audio': return 'bg-gradient-to-r from-purple-500 to-pink-500'
      default: return 'bg-gradient-to-r from-amber-500 to-orange-500'
    }
  }

  if (loading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
              <Loader2 className="w-20 h-20 text-amber-500 animate-spin mx-auto relative z-10" />
            </div>
            <p className={`mt-6 text-lg font-light tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Loading Luxury Experiences
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></span>
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-2 h-2 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const displayedExperiences = experiences

  return (
    <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
      <Navbar />

      {/* Premium Connection Status */}
      {isConnected && (
        <div className="bg-gradient-to-r from-emerald-500/10 via-emerald-400/5 to-emerald-500/10 border-b border-emerald-500/20 py-2 px-4 text-center backdrop-blur-sm">
          <span className="text-xs text-emerald-400 flex items-center justify-center gap-3 font-light tracking-wider">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></span>
              <span className="hidden sm:inline">Live Connection</span>
            </span>
            <span className="w-px h-4 bg-emerald-500/20"></span>
            <span>Real-time Experiences</span>
            <span className="w-px h-4 bg-emerald-500/20"></span>
            <span className="hidden md:inline">Premium Network</span>
            <span className="w-px h-4 bg-emerald-500/20 hidden md:block"></span>
            <span className="hidden md:inline">24/7 Support</span>
          </span>
        </div>
      )}

      {/* Luxury Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -80, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -80, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={`fixed top-24 left-1/2 transform -translate-x-1/2 z-50 px-8 py-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${
              notification.type === 'new' 
                ? 'bg-gradient-to-r from-emerald-500/90 to-teal-500/90 border-emerald-400/30 text-white' 
                : notification.type === 'updated'
                ? 'bg-gradient-to-r from-blue-500/90 to-indigo-500/90 border-blue-400/30 text-white'
                : 'bg-gradient-to-r from-rose-500/90 to-red-500/90 border-rose-400/30 text-white'
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-2xl">
                {notification.type === 'new' ? '✨' : notification.type === 'updated' ? '🔄' : '🗑️'}
              </div>
              <div>
                <p className="font-medium text-white/90">{notification.message}</p>
                <p className="text-xs text-white/60 mt-0.5">Luxury Experience Update</p>
              </div>
              <button 
                onClick={() => setNotification(null)}
                className="ml-4 p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-4 h-4 text-white/70" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ultra-Luxury Hero Section */}
      <section className="relative min-h-[95vh] overflow-hidden">
        <Swiper
          modules={[Autoplay, Pagination, Navigation, EffectFade]}
          effect="fade"
          spaceBetween={0}
          slidesPerView={1}
          autoplay={{
            delay: 6000,
            disableOnInteraction: false,
          }}
          pagination={{ 
            clickable: true,
            bulletClass: 'swiper-pagination-bullet',
            bulletActiveClass: 'swiper-pagination-bullet-active'
          }}
          navigation={true}
          loop={true}
          className="h-screen w-full"
        >
          {heroSlides.map((slide) => (
            <SwiperSlide key={slide.id}>
              <div className="relative h-screen w-full">
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat transform scale-105"
                  style={{ backgroundImage: `url(${slide.image})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                </div>
                
                <div className="relative h-full flex items-center">
                  <div className="container-custom py-20">
                    <motion.div 
                      initial={{ opacity: 0, y: 40 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 1, delay: 0.2 }}
                      className="max-w-4xl"
                    >
                      {/* Premium Badge */}
                      <div className="inline-flex items-center space-x-4 bg-gradient-to-r from-amber-500/20 via-amber-400/10 to-amber-500/20 backdrop-blur-2xl border border-amber-400/20 rounded-full px-6 py-3 mb-8 shadow-2xl shadow-amber-500/10">
                        <span className="w-3 h-3 bg-amber-400 rounded-full animate-pulse shadow-lg shadow-amber-400/50" />
                        <span className="text-amber-200 font-light text-xs tracking-[0.2em] uppercase">{slide.badge}</span>
                        <Diamond className="w-4 h-4 text-amber-400" />
                      </div>

                      <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold text-white leading-[1.1]">
                        {slide.title}
                        <br />
                        <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">
                          {slide.subtitle}
                        </span>
                      </h1>
                      
                      <p className="text-lg md:text-2xl text-gray-200 mt-6 max-w-2xl leading-relaxed font-light tracking-wide">
                        {slide.description}
                      </p>

                      {/* Enhanced Premium Search Bar with Suggestions */}
                      <div className="mt-10 flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative group">
                          <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
                          <div className="relative">
                            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-amber-400 w-5 h-5 z-10" />
                            <input
                              type="text"
                              placeholder="Search luxury hotels, tours, experiences..."
                              value={searchTerm}
                              onChange={handleSearchInput}
                              onKeyDown={handleSearchKeyDown}
                              onFocus={() => searchSuggestions.length > 0 && setShowSuggestions(true)}
                              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                              className="w-full pl-14 pr-6 py-5 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-amber-400/50 transition-all shadow-2xl"
                            />
                            {isSearchingSuggestions && (
                              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                                <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
                              </div>
                            )}
                            
                            {/* Search Suggestions Dropdown */}
                            <AnimatePresence>
                              {showSuggestions && searchSuggestions.length > 0 && (
                                <motion.div
                                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                  transition={{ duration: 0.2 }}
                                  className="absolute top-full left-0 right-0 mt-2 rounded-2xl shadow-2xl overflow-hidden bg-gradient-to-b from-[#1a0a00] to-[#0a0a0a] border border-amber-500/20 z-50"
                                >
                                  <div className="p-2 max-h-72 overflow-y-auto">
                                    {searchSuggestions.map((suggestion, idx) => (
                                      <button
                                        key={idx}
                                        onClick={() => handleSuggestionClick(suggestion)}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 hover:scale-105 hover:bg-amber-500/10 text-gray-300 hover:text-white text-left"
                                      >
                                        <div className={`p-2 rounded-lg ${getSuggestionColor(suggestion.type)}`}>
                                          {getSuggestionIcon(suggestion.type)}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                          <div className="font-medium text-sm truncate">{suggestion.text}</div>
                                          <div className="text-xs text-gray-500 truncate">
                                            {suggestion.typeLabel || suggestion.type}
                                            {suggestion.location && ` • ${suggestion.location}`}
                                            {suggestion.region && !suggestion.location && ` • ${suggestion.region}`}
                                          </div>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-gray-500 flex-shrink-0" />
                                      </button>
                                    ))}
                                    {searchTerm.trim().length >= 2 && (
                                      <button
                                        onClick={handleSearchSubmit}
                                        className="w-full mt-1 text-center py-2.5 rounded-xl text-sm font-medium transition-all duration-300 text-amber-400 hover:bg-amber-500/10"
                                      >
                                        See all results for "{searchTerm}"
                                      </button>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={handleSearchSubmit}
                          className="relative group bg-gradient-to-r from-amber-500 to-orange-500 text-white px-10 py-5 rounded-2xl font-semibold shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 transition-all flex items-center justify-center space-x-3 overflow-hidden"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                          <Search className="w-5 h-5 relative z-10" />
                          <span className="relative z-10">Search</span>
                          <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                      </div>

                      {/* Premium Stats */}
                      <div className="mt-10 flex flex-wrap gap-8">
                        {slide.stats.map((stat, idx) => (
                          <div key={idx} className="flex items-center space-x-3 text-white/80 backdrop-blur-sm bg-white/5 px-5 py-2 rounded-full border border-white/10">
                            <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div>
                            <span className="text-sm font-light tracking-wide">{stat}</span>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Premium Scroll Indicator */}
        <div className="absolute bottom-12 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex flex-col items-center space-y-3">
            <span className="text-white/40 text-[10px] tracking-[0.3em] uppercase font-light">Scroll to Explore</span>
            <div className="w-7 h-12 border border-white/20 rounded-full flex justify-center backdrop-blur-sm bg-white/5">
              <motion.div 
                animate={{ y: [0, 12, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="w-1.5 h-4 bg-gradient-to-b from-amber-400 to-amber-300 rounded-full mt-2 shadow-lg shadow-amber-400/30"
              />
            </div>
          </div>
        </div>

        {/* Premium Share Button */}
        <motion.button
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.8, type: 'spring', damping: 20 }}
          onClick={() => {
            if (!user) {
              showToast('Please login to share experiences', 'info')
              navigate('/login')
              return
            }
            setShowShareModal(true)
          }}
          className="fixed bottom-10 right-10 z-50 group bg-gradient-to-r from-amber-500 to-orange-500 text-white p-5 rounded-2xl shadow-2xl shadow-amber-500/40 hover:shadow-amber-500/70 transition-all duration-500"
        >
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute inset-0 bg-white/20 rounded-full blur-xl animate-pulse"></div>
              <Upload className="w-6 h-6 relative z-10" />
            </div>
            <span className="hidden md:inline font-medium tracking-wide">Share Experience</span>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full animate-pulse shadow-lg shadow-emerald-400/50"></div>
          </div>
        </motion.button>
      </section>

      {/* Premium Region Filter */}
      <section className={`py-6 transition-colors duration-300 ${isDark ? 'bg-gray-900/80 backdrop-blur-sm' : 'bg-gray-50'}`}>
        <div className="container-custom">
          <div className="flex flex-wrap items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedRegion('all')}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                selectedRegion === 'all'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-2xl shadow-amber-500/30'
                  : isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              All Regions
            </motion.button>
            {(expandedRegions ? regions : regions.slice(0, 8)).map(region => {
              const getIcon = (name) => {
                const iconMap = {
                  'Greater Accra': Building2,
                  'Ashanti': Crown,
                  'Western': Waves,
                  'Eastern': Mountain,
                  'Central': Compass,
                  'Volta': TreePine,
                  'Northern': Sun,
                  'Upper East': Bird,
                  'Upper West': Leaf,
                  'Bono': Flower2,
                  'Ahafo': TreePine,
                  'Savannah': Sun,
                  'North East': Mountain,
                  'Oti': TreePine,
                  'Western North': Leaf,
                }
                return iconMap[name] || MapPin
              }
              const IconComponent = getIcon(region.name)
              return (
                <motion.button
                  key={region.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedRegion(region.id)}
                  className={`px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-300 flex items-center space-x-2 ${
                    selectedRegion === region.id
                      ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-2xl shadow-amber-500/30'
                      : isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <IconComponent className="w-3.5 h-3.5" />
                  <span>{region.name}</span>
                </motion.button>
              )
            })}
            {!expandedRegions && regions.length > 8 && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/map')}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700' : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                +{regions.length - 8} More
              </motion.button>
            )}
          </div>
        </div>
      </section>

      {/* Premium Services Section */}
      <section className={`py-28 transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-white'} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent pointer-events-none"></div>
        <div className="container-custom relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 backdrop-blur-sm px-6 py-2 rounded-full border border-amber-500/20 mb-4">
              <Diamond className="w-4 h-4 text-amber-500" />
              <span className="text-amber-500 font-light text-xs tracking-[0.2em] uppercase">Luxury Services</span>
            </div>
            <h2 className={`text-5xl md:text-6xl font-display font-bold mt-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              World-Class <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Wellness</span>
            </h2>
            <p className={`max-w-3xl mx-auto mt-4 text-lg font-light tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Discover our comprehensive range of premium wellness programs designed to rejuvenate your mind, body, and spirit.
            </p>
          </motion.div>

          {/* Premium Tab Navigation */}
          <div className="flex flex-wrap justify-center gap-3 mb-16">
            {Object.entries(serviceCategories).map(([key, category]) => (
              <motion.button
                key={key}
                onClick={() => setActiveTab(key)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`px-8 py-4 rounded-full font-medium transition-all duration-500 flex items-center space-x-3 ${
                  activeTab === key
                    ? `bg-gradient-to-r ${category.color} text-white shadow-2xl`
                    : isDark
                      ? 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                }`}
              >
                <category.icon className="w-5 h-5" />
                <span>{category.title}</span>
              </motion.button>
            ))}
          </div>

          {/* Premium Tab Content */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {serviceCategories[activeTab].services.map((service, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.6 }}
                whileHover={{ scale: 1.03, y: -5 }}
                className={`group p-8 rounded-3xl transition-all duration-500 ${
                  isDark 
                    ? 'bg-gray-800/50 hover:bg-gray-700/70 border border-gray-700/50 backdrop-blur-sm' 
                    : 'bg-gray-50 hover:shadow-2xl border border-gray-100'
                }`}
              >
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 bg-gradient-to-br ${serviceCategories[activeTab].color} group-hover:scale-110 transition-transform duration-500 shadow-2xl shadow-amber-500/20`}>
                  <service.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className={`font-bold text-xl ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {service.name}
                </h3>
                <p className={`text-sm mt-2 font-light leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {service.description}
                </p>
                <div className="mt-4 w-12 h-0.5 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full group-hover:w-20 transition-all duration-500"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Premium Hotels Section */}
      <section className={`py-20 transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-50'} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-t from-amber-500/5 via-transparent to-transparent pointer-events-none"></div>
        <div className="container-custom relative z-10">
          <div className="flex items-center justify-between mb-12">
            <div>
              <div className="flex items-center space-x-3">
                <div className="w-1 h-8 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></div>
                <span className="text-amber-500 font-light text-sm tracking-[0.2em] uppercase">Luxury Accommodation</span>
              </div>
              <h2 className={`text-4xl md:text-5xl font-display font-bold mt-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Premium <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Hotels</span> in Ghana
              </h2>
            </div>
            <Link 
              to="/hotels"
              className={`group flex items-center space-x-2 text-sm font-medium transition-all duration-300 ${
                isDark ? 'text-gray-400 hover:text-amber-400' : 'text-gray-600 hover:text-amber-600'
              }`}
            >
              <span>View All</span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-all">
                <ChevronRight className="w-4 h-4 text-white" />
              </div>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hotels.slice(0, 6).map((hotel, index) => (
              <motion.div
                key={hotel._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.6 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className={`group rounded-3xl overflow-hidden transition-all duration-500 ${
                  isDark ? 'bg-gray-800/50 hover:bg-gray-700/70 border border-gray-700/50 backdrop-blur-sm' : 'bg-white shadow-xl hover:shadow-3xl'
                }`}
              >
                <Link to={`/hotel/${hotel._id}`}>
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img 
                      src={hotel.images?.[0] || hotel.image || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'} 
                      alt={hotel.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                    />
                    {hotel.badge && (
                      <div className="absolute top-4 left-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-2xl shadow-amber-500/30">
                        <span className="flex items-center space-x-1">
                          <Crown className="w-3 h-3" />
                          <span>{hotel.badge}</span>
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-white bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-medium">{hotel.rating}</span>
                        <span className="text-xs text-gray-300">({hotel.reviews})</span>
                      </div>
                      <span className="text-white bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 rounded-full text-sm font-bold shadow-2xl shadow-amber-500/30">
                        {hotel.price || `₵${hotel.price}`}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className={`font-bold text-xl ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {hotel.name}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 mt-2">
                      <MapPin className="w-4 h-4 mr-1.5 text-amber-500" />
                      {hotel.location}
                    </div>
                    <p className={`text-sm mt-3 line-clamp-2 font-light leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {hotel.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {hotel.amenities?.slice(0, 3).map((amenity, i) => (
                        <span key={i} className={`text-xs px-3 py-1.5 rounded-full ${
                          isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {amenity}
                        </span>
                      ))}
                      {hotel.amenities?.length > 3 && (
                        <span className={`text-xs px-3 py-1.5 rounded-full ${
                          isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                        }`}>
                          +{hotel.amenities.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {hotels.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-3xl flex items-center justify-center">
                <Hotel className="w-10 h-10 text-amber-500" />
              </div>
              <p className={`mt-6 text-lg font-light ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                No luxury hotels found in this region
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Premium Tours Section */}
      <section className={`py-20 transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-white'} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-transparent pointer-events-none"></div>
        <div className="container-custom relative z-10">
          <div className="flex items-center justify-between mb-12">
            <div>
              <div className="flex items-center space-x-3">
                <div className="w-1 h-8 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></div>
                <span className="text-amber-500 font-light text-sm tracking-[0.2em] uppercase">Exclusive Tours</span>
              </div>
              <h2 className={`text-4xl md:text-5xl font-display font-bold mt-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Explore Ghana's <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Wonders</span>
              </h2>
            </div>
            <Link 
              to="/tours"
              className={`group flex items-center space-x-2 text-sm font-medium transition-all duration-300 ${
                isDark ? 'text-gray-400 hover:text-amber-400' : 'text-gray-600 hover:text-amber-600'
              }`}
            >
              <span>View All</span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:shadow-amber-500/40 transition-all">
                <ChevronRight className="w-4 h-4 text-white" />
              </div>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tours.slice(0, 6).map((tour, index) => (
              <motion.div
                key={tour._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.6 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className={`group rounded-3xl overflow-hidden transition-all duration-500 ${
                  isDark ? 'bg-gray-800/50 hover:bg-gray-700/70 border border-gray-700/50 backdrop-blur-sm' : 'bg-white shadow-xl hover:shadow-3xl'
                }`}
              >
                <Link to={`/tour/${tour._id}`}>
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img 
                      src={tour.images?.[0] || tour.image || 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=800&q=80'} 
                      alt={tour.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1.5 rounded-full text-xs font-semibold shadow-2xl shadow-amber-500/30">
                        {tour.type}
                      </span>
                      <span className="bg-black/50 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-xs border border-white/10">
                        {tour.difficulty}
                      </span>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-white bg-black/40 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                        <span className="text-sm font-medium">{tour.rating}</span>
                        <span className="text-xs text-gray-300">({tour.reviews})</span>
                      </div>
                      <span className="text-white bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 rounded-full text-sm font-bold shadow-2xl shadow-amber-500/30">
                        {tour.price || `₵${tour.price}`}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className={`font-bold text-xl ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {tour.title}
                    </h3>
                    <div className="flex items-center text-sm text-gray-500 mt-2">
                      <MapPin className="w-4 h-4 mr-1.5 text-amber-500" />
                      {tour.location}
                      <span className="mx-2">•</span>
                      <Clock className="w-4 h-4 mr-1.5 text-amber-500" />
                      {tour.duration}
                    </div>
                    <p className={`text-sm mt-3 line-clamp-2 font-light leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {tour.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mt-4">
                      {tour.includes?.slice(0, 3).map((item, i) => (
                        <span key={i} className={`text-xs px-3 py-1.5 rounded-full ${
                          isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                        }`}>
                          ✓ {item}
                        </span>
                      ))}
                      {tour.includes?.length > 3 && (
                        <span className={`text-xs px-3 py-1.5 rounded-full ${
                          isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                        }`}>
                          +{tour.includes.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {tours.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-3xl flex items-center justify-center">
                <Compass className="w-10 h-10 text-amber-500" />
              </div>
              <p className={`mt-6 text-lg font-light ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                No exclusive tours found in this region
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Premium Experiences Section */}
      <section className={`py-20 transition-colors duration-300 ${isDark ? 'bg-gray-900' : 'bg-gray-50'} relative overflow-hidden`}>
        <div className="absolute inset-0 bg-gradient-to-t from-amber-500/5 via-transparent to-transparent pointer-events-none"></div>
        <div className="container-custom relative z-10">
          <div className="flex items-center justify-between mb-12">
            <div>
              <div className="flex items-center space-x-3">
                <div className="w-1 h-8 bg-gradient-to-b from-amber-500 to-orange-500 rounded-full"></div>
                <span className="text-amber-500 font-light text-sm tracking-[0.2em] uppercase">Community Stories</span>
              </div>
              <h2 className={`text-4xl md:text-5xl font-display font-bold mt-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Traveler <span className="bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">Experiences</span>
              </h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                if (!user) {
                  showToast('Please login to share experiences', 'info')
                  navigate('/login')
                  return
                }
                setShowShareModal(true)
              }}
              className={`group flex items-center space-x-3 px-6 py-3 rounded-full text-sm font-medium transition-all duration-300 ${
                isDark ? 'bg-gray-800 text-white hover:bg-gray-700 border border-gray-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200'
              }`}
            >
              <Upload className="w-4 h-4 text-amber-500" />
              <span>Share Your Story</span>
            </motion.button>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {displayedExperiences.slice(0, 10).map((exp, index) => (
              <motion.div
                key={exp._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.06, duration: 0.6 }}
                whileHover={{ scale: 1.01, y: -3 }}
                className={`rounded-3xl overflow-hidden transition-all duration-500 cursor-pointer ${
                  isDark ? 'bg-gray-800/50 hover:bg-gray-700/70 border border-gray-700/50 backdrop-blur-sm' : 'bg-white shadow-xl hover:shadow-3xl'
                }`}
                onClick={() => handleViewExperience(exp)}
              >
                <div className="p-7">
                  {/* Premium User Info */}
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="relative">
                      <img 
                        src={exp.user?.avatar || `https://ui-avatars.com/api/?name=${exp.user?.name || 'Anonymous'}&background=random`} 
                        alt={exp.user?.name || 'User'}
                        className="w-12 h-12 rounded-full object-cover ring-2 ring-amber-500/20"
                        loading="lazy"
                      />
                      <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-400 rounded-full border-2 border-white dark:border-gray-800"></div>
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {exp.user?.name || 'Anonymous'}
                      </h4>
                      <div className="flex items-center text-xs text-gray-500">
                        <MapPin className="w-3 h-3 mr-1 text-amber-500" />
                        {exp.user?.location || 'Ghana'}
                        <span className="mx-2">•</span>
                        {formatDate(exp.createdAt)}
                      </div>
                    </div>
                    <div className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-2 bg-gradient-to-r ${getExperienceColor(exp.type)} text-white shadow-lg`}>
                      {getExperienceIcon(exp.type)}
                      <span className="capitalize">{exp.type}</span>
                    </div>
                  </div>

                  {/* Premium Media Content */}
                  {exp.type === 'video' && exp.mediaUrl && (
                    <div className="relative aspect-video rounded-2xl overflow-hidden bg-black/50 mb-4 group/video">
                      <img 
                        src={exp.thumbnail || exp.mediaUrl} 
                        alt={exp.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/30 group-hover/video:bg-black/20 transition-colors"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-2xl shadow-amber-500/30 hover:scale-110 transition-transform">
                          <Play className="w-7 h-7 text-white ml-1" />
                        </div>
                      </div>
                    </div>
                  )}

                  {exp.type === 'image' && exp.mediaUrl && (
                    <div className="aspect-video rounded-2xl overflow-hidden mb-4">
                      <img 
                        src={exp.mediaUrl} 
                        alt={exp.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}

                  {exp.type === 'audio' && exp.mediaUrl && (
                    <div className={`p-4 rounded-2xl mb-4 flex items-center space-x-4 ${
                      isDark ? 'bg-gray-700/50' : 'bg-gray-100'
                    }`}>
                      <div className="w-12 h-12 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20">
                        <Mic className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <audio controls className="w-full h-8" src={exp.mediaUrl} />
                      </div>
                    </div>
                  )}

                  {/* Premium Content */}
                  <h3 className={`font-bold text-xl ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {exp.title}
                  </h3>
                  <p className={`text-sm mt-2 line-clamp-2 font-light leading-relaxed ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {exp.content || exp.description}
                  </p>

                  {/* Premium Tags */}
                  <div className="flex flex-wrap gap-2 mt-4">
                    <span className={`text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 text-amber-500 border border-amber-500/20`}>
                      {getRegionName(exp.region)}
                    </span>
                    <span className={`text-xs px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-500 border border-blue-500/20`}>
                      {exp.tourName || 'General Experience'}
                    </span>
                  </div>

                  {/* Premium Actions */}
                  <div className="flex items-center justify-between mt-5 pt-4 border-t border-gray-200/20">
                    <div className="flex items-center space-x-6">
                      <button 
                        className={`flex items-center space-x-2 transition-all duration-300 group/like ${
                          likedExperiences[exp._id] 
                            ? 'text-amber-500' 
                            : isDark ? 'text-gray-400 hover:text-amber-400' : 'text-gray-500 hover:text-amber-500'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleLike(exp._id)
                        }}
                      >
                        <div className="relative">
                          <Heart className={`w-5 h-5 ${likedExperiences[exp._id] ? 'fill-amber-500' : ''} group-hover/like:scale-110 transition-transform`} />
                          {likedExperiences[exp._id] && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
                          )}
                        </div>
                        <span className="text-sm font-medium">{exp.likes?.length || 0}</span>
                      </button>
                      <button 
                        className={`flex items-center space-x-2 ${
                          isDark ? 'text-gray-400 hover:text-amber-400' : 'text-gray-500 hover:text-amber-500'
                        } transition-all duration-300`}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewExperience(exp)
                        }}
                      >
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">{exp.comments?.length || 0}</span>
                      </button>
                    </div>
                    <div className="flex items-center space-x-3">
                      <button 
                        className={`p-2 rounded-full transition-all duration-300 ${
                          isDark ? 'hover:bg-gray-700 text-gray-400 hover:text-amber-400' : 'hover:bg-gray-100 text-gray-500 hover:text-amber-500'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleShare(exp._id)
                        }}
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button 
                        className={`p-2 rounded-full transition-all duration-300 ${
                          isDark ? 'hover:bg-gray-700 text-gray-400 hover:text-amber-400' : 'hover:bg-gray-100 text-gray-500 hover:text-amber-500'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleBookmark(exp._id)
                        }}
                      >
                        <Bookmark className={`w-4 h-4 ${bookmarkedExperiences[exp._id] ? 'fill-amber-500 text-amber-500' : ''}`} />
                      </button>
                      <button 
                        className={`p-2 rounded-full transition-all duration-300 ${
                          isDark ? 'hover:bg-gray-700 text-gray-400 hover:text-amber-400' : 'hover:bg-gray-100 text-gray-500 hover:text-amber-500'
                        }`}
                        onClick={(e) => {
                          e.stopPropagation()
                          handleViewExperience(exp)
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {displayedExperiences.length === 0 && (
            <div className="text-center py-16">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-500/10 to-orange-500/10 rounded-3xl flex items-center justify-center">
                <Users className="w-10 h-10 text-amber-500" />
              </div>
              <p className={`mt-6 text-lg font-light ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                No experiences shared for this region yet. Be the first!
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (!user) {
                    showToast('Please login to share experiences', 'info')
                    navigate('/login')
                    return
                  }
                  setShowShareModal(true)
                }}
                className="mt-6 inline-flex items-center space-x-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-8 py-4 rounded-full font-medium shadow-2xl shadow-amber-500/30 hover:shadow-amber-500/50 transition-all"
              >
                <Upload className="w-5 h-5" />
                <span>Share Your Experience</span>
              </motion.button>
            </div>
          )}
        </div>
      </section>

      {/* Premium CTA Section */}
      <section className="relative py-40 overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=1920&q=80)',
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-amber-950/95 via-orange-900/90 to-amber-950/95" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-500/5 via-transparent to-transparent"></div>
        </div>

        <div className="container-custom relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl mx-auto text-center text-white"
          >
            <div className="inline-flex items-center space-x-4 bg-white/10 backdrop-blur-2xl px-8 py-4 rounded-full mb-10 border border-white/20 shadow-2xl">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <span className="text-sm font-light tracking-[0.2em] uppercase">Exclusive Offer</span>
              </div>
              <div className="w-px h-6 bg-white/20"></div>
              <span className="text-xs text-amber-300 font-light">Limited Time</span>
            </div>
            
            <h2 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold mb-8 leading-tight">
              Begin Your <span className="bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 bg-clip-text text-transparent">Wellness</span> Journey Today
            </h2>
            <p className="text-xl md:text-2xl text-gray-200 mb-10 max-w-3xl mx-auto leading-relaxed font-light tracking-wide">
              Join thousands of satisfied clients and experience the perfect blend of 
              world-class healthcare and luxurious travel.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6">
              <Link to="/tours">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative bg-white text-amber-700 px-14 py-6 rounded-2xl font-bold hover:shadow-2xl transition-all shadow-2xl flex items-center space-x-3 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-50 to-orange-50 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="relative z-10">Book Your Journey</span>
                  <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </Link>
              <Link to="/contact">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group glass px-14 py-6 rounded-2xl font-semibold border-2 border-white/30 hover:bg-white/10 transition-all flex items-center space-x-3 backdrop-blur-2xl"
                >
                  <Phone className="w-5 h-5 text-amber-400" />
                  <span>Contact Concierge</span>
                </motion.button>
              </Link>
            </div>

            {/* Premium Trust Badges */}
            <div className="mt-16 flex flex-wrap justify-center gap-12">
              <div className="flex items-center space-x-3 text-white/60">
                <Trophy className="w-5 h-5 text-amber-400" />
                <span className="text-sm font-light tracking-wide">Award Winning</span>
              </div>
              <div className="flex items-center space-x-3 text-white/60">
                <Medal className="w-5 h-5 text-amber-400" />
                <span className="text-sm font-light tracking-wide">5-Star Rating</span>
              </div>
              <div className="flex items-center space-x-3 text-white/60">
                <Shield className="w-5 h-5 text-amber-400" />
                <span className="text-sm font-light tracking-wide">Premium Security</span>
              </div>
              <div className="flex items-center space-x-3 text-white/60">
                <Users className="w-5 h-5 text-amber-400" />
                <span className="text-sm font-light tracking-wide">15K+ Happy Clients</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Modals */}
      <ShareExperienceModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        onSubmit={handleShareSubmit}
        regions={regions}
        isDark={isDark}
        user={user}
      />

      <ExperienceDetailsModal
        isOpen={showExperienceModal}
        onClose={() => {
          setShowExperienceModal(false)
          setSelectedExperience(null)
        }}
        experience={selectedExperience}
        isDark={isDark}
        user={user}
        onLike={handleLike}
        onBookmark={handleBookmark}
        onShare={handleShare}
        onDeleteExperience={handleDeleteExperience}
        onEdit={() => setShowEditModal(true)}
        isLiked={selectedExperience ? likedExperiences[selectedExperience._id] || false : false}
        isBookmarked={selectedExperience ? bookmarkedExperiences[selectedExperience._id] || false : false}
        onAddComment={async (experienceId, comment) => {
          try {
            const response = await axios.post(`/experiences/${experienceId}/comments`, { content: comment })
            if (response.data.success) {
              showToast('Comment added successfully', 'success')
            }
          } catch (error) {
            console.error('Error adding comment:', error)
            showToast('Failed to add comment', 'error')
          }
        }}
        onAddReply={async (experienceId, commentId, reply) => {
          try {
            const response = await axios.post(`/experiences/${experienceId}/comments/${commentId}/replies`, { content: reply })
            if (response.data.success) {
              showToast('Reply added successfully', 'success')
            }
          } catch (error) {
            console.error('Error adding reply:', error)
            showToast('Failed to add reply', 'error')
          }
        }}
      />

      <EditExperienceModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false)
          setSelectedExperience(null)
        }}
        experience={selectedExperience}
        isDark={isDark}
        onUpdate={handleEditExperience}
      />

      <Footer />
    </div>
  )
}

export default Home
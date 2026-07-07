// src/components/dashboard/UserDashboard.jsx
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { 
  User, Calendar, Heart, Settings, LogOut, Camera,
  Video, Image, Upload, X, Star, MapPin, Clock,
  Users, Award, TrendingUp, MessageSquare, Bell,
  FileText, CreditCard, Share2, Eye, ThumbsUp,
  Filter, Search, Plus, Edit, Trash2, CheckCircle,
  AlertCircle, Clock as ClockIcon, DollarSign
} from 'lucide-react'

const UserDashboard = () => {
  const { user } = useAuth()
  const { isDark } = useTheme()
  const [activeTab, setActiveTab] = useState('overview')
  const [showShareExperience, setShowShareExperience] = useState(false)
  const [experienceData, setExperienceData] = useState({
    title: '',
    description: '',
    type: 'image',
    tour: '',
    rating: 5,
    tags: []
  })
  const [mediaFile, setMediaFile] = useState(null)
  const [mediaPreview, setMediaPreview] = useState(null)
  const [sharedExperiences, setSharedExperiences] = useState([])
  const [bookings, setBookings] = useState([])

  useEffect(() => {
    // Load shared experiences from localStorage
    const savedExperiences = localStorage.getItem('alveovita_experiences')
    if (savedExperiences) {
      setSharedExperiences(JSON.parse(savedExperiences))
    }
    
    // Load bookings
    const savedBookings = localStorage.getItem('alveovita_bookings')
    if (savedBookings) {
      setBookings(JSON.parse(savedBookings))
    }
  }, [])

  const stats = [
    { icon: Calendar, label: 'Total Bookings', value: bookings.length, color: 'text-blue-500' },
    { icon: Heart, label: 'Favorites', value: '12', color: 'text-red-500' },
    { icon: Award, label: 'Reviews', value: '8', color: 'text-amber-500' },
    { icon: TrendingUp, label: 'Points', value: '2,450', color: 'text-green-500' },
  ]

  const recentBookings = bookings.slice(0, 3)

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setMediaFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setMediaPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleShareExperience = () => {
    const newExperience = {
      id: Date.now(),
      ...experienceData,
      media: mediaPreview,
      date: new Date().toISOString(),
      user: user?.name || 'Anonymous',
      likes: 0,
      comments: 0,
      shares: 0
    }
    
    const updatedExperiences = [newExperience, ...sharedExperiences]
    setSharedExperiences(updatedExperiences)
    localStorage.setItem('alveovita_experiences', JSON.stringify(updatedExperiences))
    
    // Reset form
    setShowShareExperience(false)
    setExperienceData({
      title: '',
      description: '',
      type: 'image',
      tour: '',
      rating: 5,
      tags: []
    })
    setMediaFile(null)
    setMediaPreview(null)
  }

  const renderTabContent = () => {
    switch(activeTab) {
      case 'overview':
        return (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
                >
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                  <div className="mt-2">
                    <div className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {stat.value}
                    </div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {stat.label}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Recent Bookings */}
            <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Recent Bookings
                </h3>
                <button className="text-amber-500 hover:text-amber-600 transition-colors text-sm">
                  View All
                </button>
              </div>
              {recentBookings.length > 0 ? (
                <div className="space-y-4">
                  {recentBookings.map((booking, index) => (
                    <div key={index} className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            {booking.tourTitle}
                          </h4>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {booking.dates}
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-600' :
                          booking.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No bookings yet. Start your wellness journey today!</p>
                </div>
              )}
            </div>
          </div>
        )

      case 'bookings':
        return (
          <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                My Bookings
              </h3>
              <div className="flex items-center gap-2">
                <button className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <Filter className="w-4 h-4" />
                </button>
                <button className={`p-2 rounded-lg ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                  <Search className="w-4 h-4" />
                </button>
              </div>
            </div>
            {bookings.length > 0 ? (
              <div className="space-y-4">
                {bookings.map((booking, index) => (
                  <div key={index} className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'} hover:scale-[1.02] transition-all`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <img 
                          src={booking.image || 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=150&q=80'}
                          alt={booking.tourTitle}
                          className="w-16 h-16 rounded-xl object-cover"
                        />
                        <div>
                          <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            {booking.tourTitle}
                          </h4>
                          <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {booking.dates} • {booking.guests} guests
                          </div>
                          <div className={`text-sm font-medium text-amber-500`}>
                            {booking.totalPrice}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-600' :
                          booking.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {booking.status}
                        </span>
                        <button className="text-amber-500 hover:text-amber-600 transition-colors text-sm">
                          View Details
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={`text-center py-12 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <Calendar className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium">No bookings found</p>
                <p className="text-sm">Start exploring our wellness tours and book your experience today!</p>
              </div>
            )}
          </div>
        )

      case 'experiences':
        return (
          <div className="space-y-6">
            {/* Share Experience Button */}
            <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border-2 border-dashed border-amber-500`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Share Your Experience
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Inspire others with your wellness journey
                  </p>
                </div>
                <button
                  onClick={() => setShowShareExperience(true)}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium hover:scale-105 transition-all"
                >
                  <Plus className="w-5 h-5 inline mr-2" />
                  Share Now
                </button>
              </div>
            </div>

            {/* Shared Experiences */}
            <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
              <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Your Shared Experiences
              </h3>
              {sharedExperiences.length > 0 ? (
                <div className="grid md:grid-cols-2 gap-4">
                  {sharedExperiences.map((exp) => (
                    <motion.div
                      key={exp.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'} hover:scale-[1.02] transition-all`}
                    >
                      {exp.media && (
                        <div className="mb-3 rounded-lg overflow-hidden">
                          {exp.type === 'image' ? (
                            <img src={exp.media} alt={exp.title} className="w-full h-48 object-cover" />
                          ) : (
                            <video src={exp.media} className="w-full h-48 object-cover" controls />
                          )}
                        </div>
                      )}
                      <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {exp.title}
                      </h4>
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mt-1`}>
                        {exp.description}
                      </p>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center text-amber-400">
                          {[...Array(exp.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-current" />
                          ))}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3" /> {exp.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" /> {exp.comments}
                          </span>
                          <span className="flex items-center gap-1">
                            <Share2 className="w-3 h-3" /> {exp.shares}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className={`text-center py-8 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  <Camera className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No experiences shared yet. Share your first wellness journey!</p>
                </div>
              )}
            </div>
          </div>
        )

      case 'profile':
        return (
          <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
            <div className="flex items-center gap-6 mb-6">
              <div className="relative">
                <img
                  src={user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80'}
                  alt={user?.name}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-amber-400/30"
                />
                <button className="absolute bottom-0 right-0 p-2 bg-amber-500 rounded-full text-white hover:scale-110 transition-all">
                  <Camera className="w-4 h-4" />
                </button>
              </div>
              <div>
                <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {user?.name || 'User'}
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {user?.email || 'user@example.com'}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">
                    Verified Member
                  </span>
                  <span className="px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-xs font-medium">
                    Premium
                  </span>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Full Name
                </label>
                <input
                  type="text"
                  defaultValue={user?.name}
                  className={`w-full px-4 py-2 rounded-lg outline-none ${
                    isDark ? 'bg-gray-600 text-white' : 'bg-white text-gray-800'
                  } border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}
                />
              </div>
              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Email Address
                </label>
                <input
                  type="email"
                  defaultValue={user?.email}
                  className={`w-full px-4 py-2 rounded-lg outline-none ${
                    isDark ? 'bg-gray-600 text-white' : 'bg-white text-gray-800'
                  } border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}
                />
              </div>
              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  defaultValue="+233 55 123 4567"
                  className={`w-full px-4 py-2 rounded-lg outline-none ${
                    isDark ? 'bg-gray-600 text-white' : 'bg-white text-gray-800'
                  } border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}
                />
              </div>
              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Location
                </label>
                <input
                  type="text"
                  defaultValue="Accra, Ghana"
                  className={`w-full px-4 py-2 rounded-lg outline-none ${
                    isDark ? 'bg-gray-600 text-white' : 'bg-white text-gray-800'
                  } border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}
                />
              </div>
            </div>

            <div className="mt-6 flex gap-4">
              <button className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium hover:scale-105 transition-all">
                Save Changes
              </button>
              <button className={`px-6 py-2 rounded-xl border ${isDark ? 'border-gray-600 text-gray-400' : 'border-gray-200 text-gray-600'} hover:scale-105 transition-all`}>
                Cancel
              </button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className={`text-3xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Welcome back, {user?.name?.split(' ')[0] || 'User'}! 👋
          </h1>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Here's what's happening with your wellness journey
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className={`p-2 rounded-full ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
            <Bell className="w-5 h-5" />
          </button>
          <button className={`p-2 rounded-full ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'bookings', label: 'Bookings', icon: Calendar },
          { id: 'experiences', label: 'Experiences', icon: Camera },
          { id: 'profile', label: 'Profile', icon: User },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-amber-500 text-white'
                : isDark
                  ? 'hover:bg-gray-700 text-gray-400'
                  : 'hover:bg-gray-100 text-gray-600'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Share Experience Modal */}
      {showShareExperience && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`max-w-2xl w-full mx-4 p-6 rounded-2xl ${isDark ? 'bg-gray-900' : 'bg-white'} shadow-2xl max-h-[90vh] overflow-y-auto`}
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Share Your Experience
              </h3>
              <button
                onClick={() => setShowShareExperience(false)}
                className={`p-2 rounded-full ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Media Upload */}
              <div className={`p-4 rounded-xl border-2 border-dashed ${isDark ? 'border-gray-600' : 'border-gray-300'}`}>
                <div className="flex items-center justify-center">
                  {mediaPreview ? (
                    <div className="relative">
                      {experienceData.type === 'image' ? (
                        <img src={mediaPreview} alt="Preview" className="max-h-64 rounded-lg" />
                      ) : (
                        <video src={mediaPreview} className="max-h-64 rounded-lg" controls />
                      )}
                      <button
                        onClick={() => {
                          setMediaPreview(null)
                          setMediaFile(null)
                        }}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:scale-110 transition-all"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Camera className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Drag and drop or click to upload
                      </p>
                      <div className="flex items-center justify-center gap-4 mt-4">
                        <label className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:scale-105 transition-all cursor-pointer">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <Image className="w-4 h-4 inline mr-2" />
                          Upload Image
                        </label>
                        <label className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:scale-105 transition-all cursor-pointer">
                          <input
                            type="file"
                            accept="video/*"
                            onChange={handleFileChange}
                            className="hidden"
                          />
                          <Video className="w-4 h-4 inline mr-2" />
                          Upload Video
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Experience Details */}
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Title
                </label>
                <input
                  type="text"
                  placeholder="What was your experience?"
                  value={experienceData.title}
                  onChange={(e) => setExperienceData({ ...experienceData, title: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg outline-none ${
                    isDark ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-800'
                  } border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description
                </label>
                <textarea
                  placeholder="Share your wellness journey..."
                  rows={4}
                  value={experienceData.description}
                  onChange={(e) => setExperienceData({ ...experienceData, description: e.target.value })}
                  className={`w-full px-4 py-2 rounded-lg outline-none ${
                    isDark ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-800'
                  } border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tour/Program
                  </label>
                  <select
                    value={experienceData.tour}
                    onChange={(e) => setExperienceData({ ...experienceData, tour: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg outline-none ${
                      isDark ? 'bg-gray-800 text-white' : 'bg-gray-50 text-gray-800'
                    } border ${isDark ? 'border-gray-600' : 'border-gray-200'}`}
                  >
                    <option value="">Select a tour</option>
                    <option value="executive-wellness">Executive Wellness Retreat</option>
                    <option value="nature-healing">Nature & Healing Retreat</option>
                    <option value="corporate-wellness">Corporate Wellness Program</option>
                    <option value="cultural-immersion">Cultural Wellness Immersion</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Rating
                  </label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setExperienceData({ ...experienceData, rating: star })}
                        className={`text-2xl transition-all ${
                          star <= experienceData.rating ? 'text-amber-400' : 'text-gray-300'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowShareExperience(false)}
                  className={`px-6 py-2 rounded-lg ${
                    isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-100'
                  } transition-all`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleShareExperience}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium hover:scale-105 transition-all"
                >
                  Share Experience
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default UserDashboard
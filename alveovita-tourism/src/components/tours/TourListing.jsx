// src/components/tours/TourListing.jsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, MapPin, Clock, Calendar, Users, Heart, Share2, Eye } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

const TourListing = ({ tours, loading }) => {
  const { isDark } = useTheme()
  const [viewMode, setViewMode] = useState('grid')
  const [sortBy, setSortBy] = useState('popular')

  if (loading) {
    return (
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className={`rounded-2xl overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="aspect-[4/3] skeleton" />
            <div className="p-4 space-y-3">
              <div className="h-4 w-3/4 skeleton" />
              <div className="h-3 w-1/2 skeleton" />
              <div className="h-3 w-full skeleton" />
              <div className="h-10 w-full skeleton" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div>
      {/* Filters and Sorting */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-amber-500 text-white' : isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-amber-500 text-white' : isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'}`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className={`px-4 py-2 rounded-lg outline-none ${
            isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-800 border-gray-200'
          } border`}
        >
          <option value="popular">Most Popular</option>
          <option value="rating">Highest Rated</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
          <option value="newest">Newest First</option>
        </select>
      </div>

      {/* Tours Grid */}
      <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-6'}>
        {tours.map((tour, index) => (
          <motion.div
            key={tour.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`group rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
              isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white shadow-lg hover:shadow-2xl'
            }`}
          >
            <div className="relative">
              <div className={`${viewMode === 'grid' ? 'aspect-[4/3]' : 'aspect-[16/6]'} overflow-hidden`}>
                <img
                  src={tour.image}
                  alt={tour.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  loading="lazy"
                />
              </div>
              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                {tour.badge && (
                  <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    {tour.badge}
                  </span>
                )}
                {tour.discount && (
                  <span className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    {tour.discount}% OFF
                  </span>
                )}
              </div>
              <div className="absolute top-4 right-4 flex flex-col gap-2">
                <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-amber-500 hover:text-white transition-all">
                  <Heart className="w-4 h-4" />
                </button>
                <button className="p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-amber-500 hover:text-white transition-all">
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between mb-2">
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  {tour.title}
                </h3>
                <div className="flex items-center space-x-1 text-amber-400">
                  <Star className="w-4 h-4 fill-current" />
                  <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {tour.rating}
                  </span>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    ({tour.reviews})
                  </span>
                </div>
              </div>

              <div className="flex items-center text-gray-400 text-sm mb-3 space-x-4">
                <span className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  {tour.location}
                </span>
                <span className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {tour.duration}
                </span>
                <span className="flex items-center">
                  <Users className="w-4 h-4 mr-1" />
                  {tour.maxGroup || '10'} max
                </span>
              </div>

              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4 line-clamp-2`}>
                {tour.description}
              </p>

              <div className="flex flex-wrap gap-2 mb-4">
                {tour.includes && tour.includes.slice(0, 3).map((item, idx) => (
                  <span key={idx} className={`text-xs px-2 py-1 rounded-full ${
                    isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {item}
                  </span>
                ))}
                {tour.includes && tour.includes.length > 3 && (
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                  }`}>
                    +{tour.includes.length - 3} more
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div>
                  <span className="text-2xl font-bold text-amber-500">{tour.price}</span>
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}> / person</span>
                </div>
                <Link
                  to={`/tour/${tour.id}`}
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium hover:scale-105 transition-all"
                >
                  View Details
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Load More */}
      {tours.length > 0 && (
        <div className="text-center mt-12">
          <button className="px-8 py-3 rounded-xl border-2 border-amber-500 text-amber-500 font-medium hover:bg-amber-500 hover:text-white transition-all hover:scale-105">
            Load More Tours
          </button>
        </div>
      )}
    </div>
  )
}

export default TourListing
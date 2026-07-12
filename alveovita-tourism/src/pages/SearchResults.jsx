// src/pages/SearchResults.jsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, Filter, X, Loader2, MapPin, Star, 
  Hotel, Compass, Map, Sparkles, Clock, Users,
  ChevronDown, ChevronUp, Grid, List,
  ArrowLeft, Heart, Share2, Bookmark
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import SearchBar from '../components/common/SearchBar';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const SearchResults = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    types: [],
    regions: [],
    minPrice: '',
    maxPrice: '',
    minRating: ''
  });
  const [searchQuery, setSearchQuery] = useState('');
  
  const limit = 12;

  // Get search params from URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q') || '';
    setSearchQuery(q);
    
    if (location.state?.filters) {
      setFilters(location.state.filters);
    }
    
    if (location.state?.results) {
      setResults(location.state.results);
      setTotal(location.state.results.length);
      setLoading(false);
    } else if (q) {
      performSearch(q, 1);
    } else {
      setLoading(false);
    }
  }, [location]);

  // Perform search
  const performSearch = async (query, pageNum = 1) => {
    setLoading(true);
    try {
      const response = await axios.get('/api/search', {
        params: {
          q: query,
          page: pageNum,
          limit: limit,
          type: 'all'
        }
      });
      
      if (response.data.success) {
        setResults(response.data.results || []);
        setTotal(response.data.pagination?.total || 0);
        setHasMore(response.data.pagination?.pages > pageNum);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Search error:', error);
      showToast('Failed to perform search', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Apply filters
  const applyFilters = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/search/filter', {
        q: searchQuery,
        ...filters,
        limit: limit,
        page: 1
      });
      
      if (response.data.success) {
        setResults(response.data.results || []);
        setTotal(response.data.pagination?.total || 0);
        setHasMore(response.data.pagination?.pages > 1);
        setPage(1);
        setShowFilters(false);
      }
    } catch (error) {
      console.error('Filter error:', error);
      showToast('Failed to apply filters', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Load more results
  const loadMore = async () => {
    const nextPage = page + 1;
    setLoading(true);
    try {
      const response = await axios.get('/api/search', {
        params: {
          q: searchQuery,
          page: nextPage,
          limit: limit,
          type: 'all'
        }
      });
      
      if (response.data.success) {
        setResults(prev => [...prev, ...response.data.results]);
        setHasMore(response.data.pagination?.pages > nextPage);
        setPage(nextPage);
      }
    } catch (error) {
      console.error('Load more error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get icon for result type
  const getTypeIcon = (type) => {
    const icons = {
      hotel: Hotel,
      tour: Compass,
      destination: Map,
      experience: Sparkles
    };
    const Icon = icons[type] || Search;
    return <Icon className="w-5 h-5" />;
  };

  // Get color for result type
  const getTypeColor = (type) => {
    const colors = {
      hotel: 'text-blue-500 bg-blue-500/10',
      tour: 'text-green-500 bg-green-500/10',
      destination: 'text-purple-500 bg-purple-500/10',
      experience: 'text-amber-500 bg-amber-500/10'
    };
    return colors[type] || 'text-gray-500 bg-gray-500/10';
  };

  // Get badge color based on rating
  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'bg-emerald-500';
    if (rating >= 4) return 'bg-green-500';
    if (rating >= 3) return 'bg-amber-500';
    return 'bg-red-500';
  };

  // Format price
  const formatPrice = (price) => {
    if (!price) return 'Contact for price';
    return `₵${Number(price).toLocaleString()}`;
  };

  if (loading && results.length === 0) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto" />
            <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Searching...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <Navbar />
      
      {/* Search Header */}
      <div className={`sticky top-16 z-40 py-4 border-b ${isDark ? 'bg-gray-900/90 border-gray-800' : 'bg-white/90 border-gray-200'} backdrop-blur-xl`}>
        <div className="container-custom">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className={`p-2 rounded-xl transition-all duration-300 ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
            >
              <ArrowLeft className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
            <div className="flex-1">
              <SearchBar
                placeholder="Search again..."
                onSearch={(q) => {
                  setSearchQuery(q);
                  performSearch(q);
                }}
                className="max-w-2xl"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`
                px-4 py-2 rounded-xl font-medium transition-all duration-300 flex items-center gap-2
                ${showFilters 
                  ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30' 
                  : isDark 
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Results Header */}
      <div className="container-custom py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {searchQuery ? `Results for "${searchQuery}"` : 'All Results'}
            </h1>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Found {total} {total === 1 ? 'result' : 'results'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all duration-300 ${viewMode === 'grid' ? 'bg-amber-500/20 text-amber-500' : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl transition-all duration-300 ${viewMode === 'list' ? 'bg-amber-500/20 text-amber-500' : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'}`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className={`border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}
        >
          <div className="container-custom py-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Type Filter */}
              <div>
                <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Types
                </label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['hotel', 'tour', 'destination', 'experience'].map(type => (
                    <button
                      key={type}
                      onClick={() => setFilters(prev => ({
                        ...prev,
                        types: prev.types.includes(type) 
                          ? prev.types.filter(t => t !== type) 
                          : [...prev.types, type]
                      }))}
                      className={`
                        px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 capitalize
                        ${filters.types.includes(type)
                          ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                          : isDark 
                            ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }
                      `}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Price (₵)
                </label>
                <div className="flex gap-2 mt-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                    className={`
                      w-1/2 px-3 py-2 rounded-xl text-sm outline-none transition-all
                      ${isDark 
                        ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-amber-500' 
                        : 'bg-gray-100 border border-gray-200 text-gray-800 placeholder-gray-400 focus:border-amber-500'
                      }
                    `}
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                    className={`
                      w-1/2 px-3 py-2 rounded-xl text-sm outline-none transition-all
                      ${isDark 
                        ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-amber-500' 
                        : 'bg-gray-100 border border-gray-200 text-gray-800 placeholder-gray-400 focus:border-amber-500'
                      }
                    `}
                  />
                </div>
              </div>

              {/* Min Rating */}
              <div>
                <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Minimum Rating
                </label>
                <div className="flex gap-1 mt-2">
                  {[1, 2, 3, 4, 5].map(rating => (
                    <button
                      key={rating}
                      onClick={() => setFilters(prev => ({ 
                        ...prev, 
                        minRating: prev.minRating === rating.toString() ? '' : rating.toString()
                      }))}
                      className={`
                        px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300
                        ${filters.minRating === rating.toString()
                          ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                          : isDark 
                            ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' 
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }
                      `}
                    >
                      {rating}⭐
                    </button>
                  ))}
                </div>
              </div>

              {/* Apply Filters */}
              <div className="flex items-end">
                <button
                  onClick={applyFilters}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/30"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Results Grid */}
      <div className="container-custom py-8">
        {results.length === 0 ? (
          <div className="text-center py-16">
            <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className={`mt-4 text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              No results found
            </h3>
            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Try adjusting your search or filters
            </p>
            <button
              onClick={() => {
                setFilters({ types: [], regions: [], minPrice: '', maxPrice: '', minRating: '' });
                if (searchQuery) performSearch(searchQuery);
              }}
              className="mt-4 text-amber-500 hover:text-amber-600 font-medium"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
            : 'space-y-4'
          }>
            {results.map((result, index) => (
              <motion.div
                key={result._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`
                  group rounded-2xl overflow-hidden transition-all duration-300
                  ${isDark ? 'bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700' : 'bg-white hover:shadow-2xl border border-gray-200'}
                  ${viewMode === 'list' ? 'flex flex-col md:flex-row' : ''}
                `}
              >
                <Link to={result.url || `/${result._type}/${result._id}`} className="flex-1">
                  {viewMode === 'grid' ? (
                    <>
                      {/* Grid View */}
                      <div className="relative aspect-[4/3] overflow-hidden">
                        <img 
                          src={result.images?.[0] || result.image || result.thumbnail || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'} 
                          alt={result.name || result.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                          loading="lazy"
                        />
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getTypeColor(result._type)}`}>
                            {getTypeIcon(result._type)}
                            <span className="ml-1">{result._type}</span>
                          </span>
                        </div>
                        {result.rating && (
                          <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span className="text-sm font-medium">{result.rating}</span>
                          </div>
                        )}
                        {result.price && (
                          <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold shadow-lg shadow-amber-500/30">
                            {formatPrice(result.price)}
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className={`font-bold text-lg line-clamp-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          {result.name || result.title}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1">
                          <MapPin className="w-3.5 h-3.5 mr-1 text-amber-500" />
                          {result.location || result.region || 'Ghana'}
                        </div>
                        <p className={`text-sm mt-2 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {result.description || result.content || 'No description available'}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* List View */}
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-48 h-48 md:h-auto flex-shrink-0 relative overflow-hidden">
                          <img 
                            src={result.images?.[0] || result.image || result.thumbnail || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'} 
                            alt={result.name || result.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            loading="lazy"
                          />
                          <span className={`absolute top-2 left-2 px-2.5 py-1 rounded-full text-xs font-medium capitalize ${getTypeColor(result._type)}`}>
                            {getTypeIcon(result._type)}
                            <span className="ml-1">{result._type}</span>
                          </span>
                        </div>
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                {result.name || result.title}
                              </h3>
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <MapPin className="w-3.5 h-3.5 mr-1 text-amber-500" />
                                {result.location || result.region || 'Ghana'}
                              </div>
                            </div>
                            {result.rating && (
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                                <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                  {result.rating}
                                </span>
                              </div>
                            )}
                          </div>
                          <p className={`text-sm mt-2 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {result.description || result.content || 'No description available'}
                          </p>
                          {result.price && (
                            <div className="mt-3 text-lg font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
                              {formatPrice(result.price)}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </Link>
              </motion.div>
            ))}
          </div>
        )}

        {/* Load More */}
        {hasMore && results.length > 0 && (
          <div className="text-center mt-8">
            <button
              onClick={loadMore}
              disabled={loading}
              className={`
                px-8 py-3 rounded-xl font-medium transition-all duration-300
                bg-gradient-to-r from-amber-500 to-orange-500 text-white
                hover:shadow-lg hover:shadow-amber-500/30
                ${loading ? 'opacity-70 cursor-not-allowed' : ''}
              `}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Load More
                  <ChevronDown className="w-4 h-4" />
                </span>
              )}
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SearchResults;
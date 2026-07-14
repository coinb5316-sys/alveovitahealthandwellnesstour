// src/pages/SearchResults.jsx - COMPLETE with Alveoly Pattern
import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Filter, X, Loader2, MapPin, Star, 
  Hotel, Compass, Map, Sparkles, Clock, Users,
  ChevronDown, ChevronUp, Grid, List,
  ArrowLeft, Heart, Share2, Bookmark, AlertCircle,
  Sliders, RefreshCw, ChevronRight, Eye,
  TrendingUp, Award, Crown, Gem, Stethoscope,  // <-- ADD Stethoscope HERE
  Home, Package, MapPin as MapPinIcon
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../hooks/useToast';
import { useAuth } from '../context/AuthContext';
import axios from '../api/axios';
import Navbar from '../components/common/Navbar';
import Footer from '../components/common/Footer';

const SearchResults = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  
  // ============================================
  // STATE
  // ============================================
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searching, setSearching] = useState(false);
  const [filters, setFilters] = useState({
    types: [],
    regions: [],
    minPrice: '',
    maxPrice: '',
    minRating: '',
    sortBy: 'relevance'
  });
  
  const limit = 12;
  const searchTimeoutRef = useRef(null);
  const resultsEndRef = useRef(null);

  // ============================================
  // GET SEARCH QUERY FROM URL
  // ============================================
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q') || '';
    setSearchQuery(q);
    
    // Restore filters from state if available
    if (location.state?.filters) {
      setFilters(prev => ({ ...prev, ...location.state.filters }));
    }
    
    // Perform search if query exists
    if (q) {
      performSearch(q, 1);
    } else {
      setLoading(false);
    }
    
    // Cleanup
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [location]);

  // ============================================
  // PERFORM SEARCH
  // ============================================
  const performSearch = async (query, pageNum = 1, reset = true) => {
    if (!query || query.trim().length < 2) {
      if (reset) {
        setResults([]);
        setTotal(0);
        setLoading(false);
      }
      return;
    }

    if (reset) {
      setLoading(true);
      setError(null);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await axios.get('/search', {
        params: {
          q: query.trim(),
          page: pageNum,
          limit: limit,
          type: filters.types.length > 0 ? filters.types.join(',') : 'all',
          region: filters.regions.length > 0 ? filters.regions.join(',') : 'all',
          minPrice: filters.minPrice || undefined,
          maxPrice: filters.maxPrice || undefined,
          minRating: filters.minRating || undefined,
          sortBy: filters.sortBy || 'relevance'
        }
      });
      
      if (response.data.success) {
        const newResults = response.data.results || [];
        
        if (reset) {
          setResults(newResults);
          setPage(pageNum);
        } else {
          setResults(prev => [...prev, ...newResults]);
          setPage(pageNum);
        }
        
        setTotal(response.data.pagination?.total || 0);
        setHasMore(response.data.pagination?.pages > pageNum);
        
        // Update URL with search query if not already there
        if (reset && query !== searchQuery) {
          navigate(`/search?q=${encodeURIComponent(query)}`, { replace: true });
        }
      } else {
        setError(response.data.message || 'Search failed');
        if (reset) {
          setResults([]);
          setTotal(0);
        }
      }
    } catch (error) {
      console.error('❌ Search error:', error);
      setError(error.response?.data?.message || 'Failed to perform search');
      if (reset) {
        setResults([]);
        setTotal(0);
      }
      showToast(error.response?.data?.message || 'Search failed. Please try again.', 'error');
    } finally {
      if (reset) {
        setLoading(false);
      } else {
        setLoadingMore(false);
      }
    }
  };

  // ============================================
  // FETCH SEARCH SUGGESTIONS (Autocomplete)
  // ============================================
  const fetchSuggestions = useCallback(async (query) => {
    if (!query || query.trim().length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setSearching(true);
    try {
      const response = await axios.get('/search/suggestions', {
        params: { q: query.trim(), limit: 5 }
      });
      
      if (response.data.success) {
        setSuggestions(response.data.suggestions || []);
        setShowSuggestions(response.data.suggestions?.length > 0);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('❌ Suggestions error:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setSearching(false);
    }
  }, []);

  // ============================================
  // HANDLE SEARCH INPUT WITH DEBOUNCE
  // ============================================
  const handleSearchInput = useCallback((e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    clearTimeout(searchTimeoutRef.current);
    
    if (value.trim().length >= 1) {
      searchTimeoutRef.current = setTimeout(() => {
        fetchSuggestions(value);
      }, 300);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [fetchSuggestions]);

  // ============================================
  // HANDLE SEARCH SUBMIT
  // ============================================
  const handleSearch = useCallback((e) => {
    e.preventDefault();
    setShowSuggestions(false);
    setSuggestions([]);
    
    if (searchQuery.trim().length >= 2) {
      performSearch(searchQuery, 1, true);
    } else {
      showToast('Please enter at least 2 characters', 'info');
    }
  }, [searchQuery, showToast]);

  // ============================================
  // HANDLE SUGGESTION CLICK
  // ============================================
  const handleSuggestionClick = useCallback((suggestion) => {
    setShowSuggestions(false);
    setSuggestions([]);
    
    if (suggestion.id && suggestion.type) {
      navigate(`/${suggestion.type}/${suggestion.id}`);
    } else {
      const query = suggestion.text || suggestion.title || searchQuery;
      setSearchQuery(query);
      performSearch(query, 1, true);
    }
  }, [navigate, searchQuery]);

  // ============================================
  // APPLY FILTERS
  // ============================================
  const applyFilters = useCallback(async () => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      showToast('Please enter a search query first', 'info');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const response = await axios.post('/search/filter', {
        q: searchQuery.trim(),
        types: filters.types,
        regions: filters.regions,
        minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
        minRating: filters.minRating ? parseFloat(filters.minRating) : undefined,
        sortBy: filters.sortBy || 'relevance',
        limit: limit,
        page: 1
      });
      
      if (response.data.success) {
        setResults(response.data.results || []);
        setTotal(response.data.pagination?.total || 0);
        setHasMore(response.data.pagination?.pages > 1);
        setPage(1);
        setShowFilters(false);
        showToast(`Found ${response.data.pagination?.total || 0} results`, 'success');
      } else {
        setError(response.data.message || 'Filter failed');
      }
    } catch (error) {
      console.error('❌ Filter error:', error);
      setError(error.response?.data?.message || 'Failed to apply filters');
      showToast('Failed to apply filters', 'error');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters, limit, showToast]);

  // ============================================
  // RESET FILTERS
  // ============================================
  const resetFilters = useCallback(() => {
    setFilters({
      types: [],
      regions: [],
      minPrice: '',
      maxPrice: '',
      minRating: '',
      sortBy: 'relevance'
    });
    if (searchQuery) {
      performSearch(searchQuery, 1, true);
    }
  }, [searchQuery]);

  // ============================================
  // LOAD MORE RESULTS
  // ============================================
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || !searchQuery) return;
    const nextPage = page + 1;
    await performSearch(searchQuery, nextPage, false);
  }, [loadingMore, hasMore, page, searchQuery]);

  // ============================================
  // INFINITE SCROLL OBSERVER
  // ============================================
  useEffect(() => {
    if (!resultsEndRef.current || !hasMore || loading) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loadingMore && hasMore) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '100px' }
    );
    
    observer.observe(resultsEndRef.current);
    
    return () => {
      if (observer) observer.disconnect();
    };
  }, [hasMore, loading, loadingMore, loadMore]);

  // ============================================
  // GET ICON FOR RESULT TYPE
  // ============================================
  const getTypeIcon = (type) => {
    const icons = {
      hotel: Hotel,
      tour: Compass,
      destination: Map,
      experience: Sparkles,
      wellness: Heart,
      medical: Stethoscope
    };
    const Icon = icons[type] || Search;
    return <Icon className="w-5 h-5" />;
  };

  // ============================================
  // GET COLOR FOR RESULT TYPE
  // ============================================
  const getTypeColor = (type) => {
    const colors = {
      hotel: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
      tour: 'text-green-500 bg-green-500/10 border-green-500/20',
      destination: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
      experience: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
      wellness: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
      medical: 'text-rose-500 bg-rose-500/10 border-rose-500/20'
    };
    return colors[type] || 'text-gray-500 bg-gray-500/10 border-gray-500/20';
  };

  // ============================================
  // GET BADGE COLOR BASED ON RATING
  // ============================================
  const getRatingColor = (rating) => {
    if (rating >= 4.5) return 'bg-emerald-500';
    if (rating >= 4) return 'bg-green-500';
    if (rating >= 3) return 'bg-amber-500';
    return 'bg-red-500';
  };

  // ============================================
  // FORMAT PRICE
  // ============================================
  const formatPrice = (price) => {
    if (!price) return 'Contact for price';
    return `₵${Number(price).toLocaleString()}`;
  };

  // ============================================
  // GET TIME AGO
  // ============================================
  const getTimeAgo = (date) => {
    if (!date) return '';
    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  // ============================================
  // RENDER LOADING STATE
  // ============================================
  if (loading && results.length === 0) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="text-center">
            <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto" />
            <p className={`mt-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Searching for "{searchQuery}"...
            </p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  // ============================================
  // RENDER
  // ============================================
  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <Navbar />
      
      {/* ============================================ */}
      {/* SEARCH HEADER */}
      {/* ============================================ */}
      <div className={`sticky top-16 z-40 py-4 border-b transition-colors duration-300 ${
        isDark ? 'bg-gray-900/90 border-gray-800' : 'bg-white/90 border-gray-200'
      } backdrop-blur-xl`}>
        <div className="container-custom px-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className={`p-2 rounded-xl transition-all duration-300 hover:scale-105 ${
                isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
              }`}
            >
              <ArrowLeft className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-600'}`} />
            </button>
            
            {/* Search Form */}
            <form onSubmit={handleSearch} className="flex-1 relative">
              <div className={`flex items-center gap-2 rounded-xl px-4 transition-all ${
                isDark ? 'bg-gray-800/50 border border-gray-700' : 'bg-gray-100 border border-gray-200'
              } ${showSuggestions ? 'ring-2 ring-amber-500' : ''}`}>
                {searching ? (
                  <Loader2 className="w-5 h-5 text-amber-400 animate-spin flex-shrink-0" />
                ) : (
                  <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
                <input
                  type="text"
                  placeholder="Search hotels, tours, destinations, experiences..."
                  value={searchQuery}
                  onChange={handleSearchInput}
                  onFocus={() => {
                    if (suggestions.length > 0) setShowSuggestions(true);
                  }}
                  className={`w-full py-3 bg-transparent outline-none text-sm ${
                    isDark ? 'text-white placeholder-gray-400' : 'text-gray-800 placeholder-gray-400'
                  }`}
                  autoFocus
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSuggestions([]);
                      setShowSuggestions(false);
                    }}
                    className="p-1 rounded-full hover:bg-gray-700/50 transition-colors text-gray-400 hover:text-white flex-shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              {/* Suggestions Dropdown */}
              <AnimatePresence>
                {showSuggestions && suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className={`absolute left-0 right-0 mt-2 rounded-2xl shadow-2xl border overflow-hidden z-50 ${
                      isDark ? 'bg-gray-900 border-gray-700' : 'bg-white border-gray-200'
                    }`}
                  >
                    {suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className={`w-full flex items-center gap-3 px-4 py-3 transition-all duration-200 text-left ${
                          isDark ? 'hover:bg-gray-800 text-gray-300' : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${getTypeColor(suggestion.type)}`}>
                          {getTypeIcon(suggestion.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{suggestion.text}</div>
                          <div className="text-xs text-gray-500 truncate">
                            {suggestion.typeLabel || suggestion.type}
                            {suggestion.location && ` • ${suggestion.location}`}
                            {suggestion.region && !suggestion.location && ` • ${suggestion.region}`}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
            
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`
                px-4 py-2.5 rounded-xl font-medium transition-all duration-300 flex items-center gap-2
                ${showFilters 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30' 
                  : isDark 
                    ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              <Sliders className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {Object.values(filters).some(v => Array.isArray(v) ? v.length > 0 : v) && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* FILTERS PANEL */}
      {/* ============================================ */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={`border-b ${isDark ? 'border-gray-800' : 'border-gray-200'}`}
          >
            <div className="container-custom px-4 py-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Type Filter */}
                <div>
                  <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Content Types
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
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
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
                      min="0"
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
                      min="0"
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
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/30'
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

                {/* Sort By */}
                <div>
                  <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value }))}
                    className={`
                      w-full mt-2 px-3 py-2 rounded-xl text-sm outline-none transition-all
                      ${isDark 
                        ? 'bg-gray-800 border border-gray-700 text-white focus:border-amber-500' 
                        : 'bg-gray-100 border border-gray-200 text-gray-800 focus:border-amber-500'
                      }
                    `}
                  >
                    <option value="relevance">Relevance</option>
                    <option value="rating">Highest Rating</option>
                    <option value="price">Price: Low to High</option>
                    <option value="price-desc">Price: High to Low</option>
                    <option value="newest">Newest First</option>
                    <option value="popular">Most Popular</option>
                  </select>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex flex-wrap items-center justify-between gap-3 mt-6 pt-4 border-t border-gray-200/20">
                <div className="flex items-center gap-2">
                  <button
                    onClick={resetFilters}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isDark 
                        ? 'text-gray-400 hover:text-white hover:bg-gray-800' 
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-200'
                    }`}
                  >
                    Reset Filters
                  </button>
                  {(filters.types.length > 0 || filters.minPrice || filters.maxPrice || filters.minRating) && (
                    <span className="text-xs text-amber-500">
                      {filters.types.length} type{filters.types.length !== 1 ? 's' : ''} filtered
                    </span>
                  )}
                </div>
                <button
                  onClick={applyFilters}
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/30 flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Apply Filters
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ============================================ */}
      {/* RESULTS HEADER */}
      {/* ============================================ */}
      <div className="container-custom px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {searchQuery ? `Results for "${searchQuery}"` : 'All Results'}
            </h1>
            <div className="flex items-center gap-3 mt-1">
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Found {total} {total === 1 ? 'result' : 'results'}
              </p>
              {total > 0 && (
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
                }`}>
                  Page {page}
                </span>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all duration-300 ${
                viewMode === 'grid' 
                  ? 'bg-amber-500/20 text-amber-500' 
                  : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'
              }`}
              aria-label="Grid view"
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-xl transition-all duration-300 ${
                viewMode === 'list' 
                  ? 'bg-amber-500/20 text-amber-500' 
                  : isDark ? 'text-gray-400 hover:text-white' : 'text-gray-400 hover:text-gray-600'
              }`}
              aria-label="List view"
            >
              <List className="w-5 h-5" />
            </button>
            
            {results.length > 0 && (
              <button
                onClick={() => performSearch(searchQuery, 1, true)}
                className={`p-2 rounded-xl transition-all duration-300 ${
                  isDark ? 'text-gray-400 hover:text-white hover:bg-gray-800' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
                aria-label="Refresh results"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ============================================ */}
      {/* ERROR DISPLAY */}
      {/* ============================================ */}
      {error && (
        <div className="container-custom px-4">
          <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-500 text-sm flex items-center gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
            <button
              onClick={() => {
                setError(null);
                if (searchQuery) performSearch(searchQuery, 1, true);
              }}
              className="ml-auto text-red-400 hover:text-red-300 font-medium"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* ============================================ */}
      {/* RESULTS GRID */}
      {/* ============================================ */}
      <div className="container-custom px-4 py-8">
        {results.length === 0 && !loading && !error ? (
          <div className="text-center py-16">
            <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center ${
              isDark ? 'bg-gray-800' : 'bg-gray-100'
            }`}>
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className={`mt-4 text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              No results found
            </h3>
            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              {searchQuery ? `No results found for "${searchQuery}"` : 'Enter a search query to get started'}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
              {searchQuery && (
                <button
                  onClick={() => {
                    setFilters({ types: [], regions: [], minPrice: '', maxPrice: '', minRating: '', sortBy: 'relevance' });
                    performSearch(searchQuery, 1, true);
                  }}
                  className="text-amber-500 hover:text-amber-600 font-medium"
                >
                  Try clearing filters
                </button>
              )}
              <Link
                to="/"
                className="text-amber-500 hover:text-amber-600 font-medium"
              >
                Browse all content →
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6'
              : 'space-y-4'
            }>
              {results.map((result, index) => (
                <motion.div
                  key={result._id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.03, 0.5) }}
                  className={`
                    group rounded-2xl overflow-hidden transition-all duration-300
                    ${isDark 
                      ? 'bg-gray-800/80 hover:bg-gray-700/80 border border-gray-700 hover:border-amber-500/30' 
                      : 'bg-white hover:shadow-2xl border border-gray-200 hover:border-amber-200'
                    }
                    ${viewMode === 'list' ? 'flex flex-col md:flex-row' : ''}
                  `}
                >
                  <Link to={result.url || `/${result._type}/${result._id}`} className="flex-1">
                    {viewMode === 'grid' ? (
                      // ===== GRID VIEW =====
                      <>
                        <div className="relative aspect-[4/3] overflow-hidden">
                          <img 
                            src={result.images?.[0] || result.image || result.thumbnail || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'} 
                            alt={result.name || result.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            loading="lazy"
                          />
                          {/* Type Badge */}
                          <div className="absolute top-3 left-3 flex items-center gap-2">
                            <span className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize border backdrop-blur-sm ${getTypeColor(result._type)}`}>
                              {getTypeIcon(result._type)}
                              <span className="ml-1">{result._type}</span>
                            </span>
                          </div>
                          
                          {/* Rating */}
                          {result.rating && (
                            <div className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span className="text-sm font-medium">{result.rating}</span>
                            </div>
                          )}
                          
                          {/* Price */}
                          {result.price && (
                            <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-bold shadow-lg shadow-amber-500/30">
                              {formatPrice(result.price)}
                            </div>
                          )}
                          
                          {/* Favorite Button */}
                          {user && (
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                // Add to favorites logic
                                showToast('Added to favorites ❤️', 'success');
                              }}
                              className="absolute bottom-3 left-3 p-2 rounded-full bg-black/50 backdrop-blur-sm text-white hover:bg-amber-500 transition-colors"
                            >
                              <Heart className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <div className="p-4">
                          <h3 className={`font-bold text-base line-clamp-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            {result.name || result.title}
                          </h3>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <MapPin className="w-3.5 h-3.5 mr-1 text-amber-500 flex-shrink-0" />
                            <span className="truncate">{result.location || result.region || 'Ghana'}</span>
                          </div>
                          <p className={`text-sm mt-2 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {result.description || result.content || 'No description available'}
                          </p>
                          {result.duration && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              <span>{result.duration}</span>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      // ===== LIST VIEW =====
                      <div className="flex flex-col md:flex-row">
                        <div className="md:w-48 h-48 md:h-auto flex-shrink-0 relative overflow-hidden">
                          <img 
                            src={result.images?.[0] || result.image || result.thumbnail || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'} 
                            alt={result.name || result.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            loading="lazy"
                          />
                          <span className={`absolute top-2 left-2 px-2.5 py-1 rounded-full text-xs font-medium capitalize border backdrop-blur-sm ${getTypeColor(result._type)}`}>
                            {getTypeIcon(result._type)}
                            <span className="ml-1">{result._type}</span>
                          </span>
                          {result.rating && (
                            <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-white">
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                              <span className="text-xs font-medium">{result.rating}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                {result.name || result.title}
                              </h3>
                              <div className="flex items-center text-sm text-gray-500 mt-1">
                                <MapPin className="w-3.5 h-3.5 mr-1 text-amber-500 flex-shrink-0" />
                                <span className="truncate">{result.location || result.region || 'Ghana'}</span>
                              </div>
                            </div>
                            {result.price && (
                              <div className="text-lg font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent ml-4 flex-shrink-0">
                                {formatPrice(result.price)}
                              </div>
                            )}
                          </div>
                          <p className={`text-sm mt-2 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {result.description || result.content || 'No description available'}
                          </p>
                          <div className="flex flex-wrap items-center gap-3 mt-3">
                            {result.duration && (
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
                              }`}>
                                <Clock className="w-3 h-3 inline mr-1" />
                                {result.duration}
                              </span>
                            )}
                            {result.amenities?.slice(0, 3).map((amenity, i) => (
                              <span key={i} className={`text-xs px-2 py-1 rounded-full ${
                                isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
                              }`}>
                                {amenity}
                              </span>
                            ))}
                            {result.amenities?.length > 3 && (
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
                              }`}>
                                +{result.amenities.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </Link>
                </motion.div>
              ))}
            </div>

            {/* ============================================ */}
            {/* LOAD MORE */}
            {/* ============================================ */}
            {hasMore && results.length > 0 && (
              <>
                <div ref={resultsEndRef} className="h-4" />
                <div className="text-center mt-8">
                  <button
                    onClick={loadMore}
                    disabled={loadingMore}
                    className={`
                      px-8 py-3 rounded-xl font-medium transition-all duration-300
                      bg-gradient-to-r from-amber-500 to-orange-500 text-white
                      hover:shadow-lg hover:shadow-amber-500/30
                      ${loadingMore ? 'opacity-70 cursor-not-allowed' : ''}
                    `}
                  >
                    {loadingMore ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Loading more...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        Load More
                        <ChevronDown className="w-4 h-4" />
                      </span>
                    )}
                  </button>
                  <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Showing {results.length} of {total} results
                  </p>
                </div>
              </>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default SearchResults;
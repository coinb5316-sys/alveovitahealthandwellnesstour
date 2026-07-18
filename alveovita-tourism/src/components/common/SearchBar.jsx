// src/components/common/SearchBar.jsx - Updated with Blue-Black Theme
import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, X, Loader2, MapPin, Star, 
  Hotel, Compass, Map, Sparkles, Filter,
  ChevronRight, Clock, Users, Heart, Stethoscope
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../hooks/useToast';
import axios from '../../api/axios';

const SearchBar = ({ 
  placeholder = 'Search hotels, tours, destinations...',
  className = '',
  autoFocus = false,
  onSearch,
  onClose,
  showFilters = true
}) => {
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const [filters, setFilters] = useState({
    types: [],
    regions: [],
    minPrice: '',
    maxPrice: '',
    minRating: ''
  });
  
  const inputRef = useRef(null);
  const containerRef = useRef(null);
  const searchTimeout = useRef(null);

  // Fetch suggestions with debounce
  const fetchSuggestions = useCallback(async (searchTerm) => {
    if (!searchTerm || searchTerm.trim().length < 1) {
      setSuggestions([]);
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get('/api/search/suggestions', {
        params: { q: searchTerm, limit: 8 }
      });
      
      if (response.data.success) {
        setSuggestions(response.data.suggestions || []);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle input change with debounce
  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  // Handle search submission
  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim().length < 2) {
      showToast('Please enter at least 2 characters', 'info');
      return;
    }
    
    if (onSearch) {
      onSearch(query.trim());
    } else {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
    }
    
    if (onClose) onClose();
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.text);
    if (suggestion.id) {
      navigate(suggestion.url || `/${suggestion.type}/${suggestion.id}`);
    } else {
      navigate(`/search?q=${encodeURIComponent(suggestion.text)}`);
    }
    if (onClose) onClose();
    setSuggestions([]);
  };

  // Clear search
  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    inputRef.current?.focus();
  };

  // Handle filter toggle
  const toggleFilter = (type, value) => {
    setFilters(prev => {
      if (type === 'types' || type === 'regions') {
        const current = prev[type] || [];
        const index = current.indexOf(value);
        if (index > -1) {
          return { ...prev, [type]: current.filter(v => v !== value) };
        } else {
          return { ...prev, [type]: [...current, value] };
        }
      }
      return prev;
    });
  };

  // Apply filters
  const applyFilters = async () => {
    try {
      const response = await axios.post('/api/search/filter', {
        q: query,
        ...filters,
        limit: 20,
        page: 1
      });
      
      if (response.data.success) {
        navigate('/search', { 
          state: { results: response.data.results, filters: filters }
        });
        setShowFiltersPanel(false);
        if (onClose) onClose();
      }
    } catch (error) {
      console.error('Filter search error:', error);
      showToast('Failed to apply filters', 'error');
    }
  };

  // Close on escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        if (onClose) onClose();
        setShowFiltersPanel(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setSuggestions([]);
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus on mount if autoFocus
  useEffect(() => {
    if (autoFocus && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 100);
    }
  }, [autoFocus]);

  // Get icon for suggestion type
  const getTypeIcon = (type) => {
    const icons = {
      hotel: Hotel,
      tour: Compass,
      destination: Map,
      experience: Sparkles
    };
    const Icon = icons[type] || Search;
    return <Icon className="w-4 h-4" />;
  };

  // Get color for suggestion type - Blue Theme
  const getTypeColor = (type) => {
    const colors = {
      hotel: 'text-blue-500 bg-blue-500/10',
      tour: 'text-cyan-500 bg-cyan-500/10',
      destination: 'text-indigo-500 bg-indigo-500/10',
      experience: 'text-blue-400 bg-blue-400/10'
    };
    return colors[type] || 'text-gray-500 bg-gray-500/10';
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <form onSubmit={handleSearch} className="relative">
        {/* Search Input Container - Blue Theme */}
        <div className={`
          relative flex items-center rounded-2xl transition-all duration-300
          ${isFocused ? 'ring-2 ring-blue-400/50 shadow-2xl shadow-blue-500/20' : ''}
          ${isDark ? 'bg-gray-800/80 border border-gray-700' : 'bg-white border border-gray-200'}
        `}>
          {/* Search Icon */}
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
            {isLoading ? (
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-gray-400" />
            )}
          </div>

          {/* Input */}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setTimeout(() => setIsFocused(false), 200)}
            placeholder={placeholder}
            className={`
              w-full py-4 pl-12 pr-24 bg-transparent outline-none text-sm
              ${isDark ? 'text-white placeholder-gray-500' : 'text-gray-800 placeholder-gray-400'}
            `}
            aria-label="Search"
          />

          {/* Right Actions */}
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            {showFilters && (
              <button
                type="button"
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className={`
                  p-2 rounded-xl transition-all duration-300
                  ${showFiltersPanel 
                    ? 'bg-blue-500/20 text-blue-500' 
                    : isDark 
                      ? 'text-gray-400 hover:text-blue-400 hover:bg-blue-500/10' 
                      : 'text-gray-400 hover:text-blue-500 hover:bg-blue-500/10'
                  }
                `}
                title="Filters"
              >
                <Filter className="w-5 h-5" />
              </button>
            )}

            {query && (
              <button
                type="button"
                onClick={handleClear}
                className={`
                  p-2 rounded-xl transition-all duration-300
                  ${isDark 
                    ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                  }
                `}
                title="Clear"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            <button
              type="submit"
              className={`
                px-4 py-2 rounded-xl font-medium transition-all duration-300
                bg-gradient-to-r from-blue-500 to-indigo-500 text-white
                hover:shadow-lg hover:shadow-blue-500/30
                flex items-center gap-2
              `}
            >
              <span className="hidden sm:inline">Search</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Suggestions Dropdown - Blue Theme */}
        <AnimatePresence>
          {(suggestions.length > 0 || isLoading) && isFocused && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={`
                absolute top-full left-0 right-0 mt-2 rounded-2xl shadow-2xl overflow-hidden
                ${isDark ? 'bg-gray-900 border border-blue-900/30' : 'bg-white border border-gray-200'}
              `}
            >
              <div className="p-2 max-h-80 overflow-y-auto">
                {suggestions.map((suggestion, index) => (
                  <motion.button
                    key={index}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`
                      w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300
                      ${isDark 
                        ? 'hover:bg-blue-500/10 text-gray-300 hover:text-white' 
                        : 'hover:bg-blue-50 text-gray-700 hover:text-gray-900'
                      }
                    `}
                  >
                    <div className={`p-2 rounded-lg ${getTypeColor(suggestion.type)}`}>
                      {getTypeIcon(suggestion.type)}
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-sm">{suggestion.text}</div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{suggestion.typeLabel}</span>
                        {suggestion.location && (
                          <>
                            <span>•</span>
                            <span>{suggestion.location}</span>
                          </>
                        )}
                        {suggestion.region && (
                          <>
                            <span>•</span>
                            <span>{suggestion.region}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  </motion.button>
                ))}

                {suggestions.length > 0 && (
                  <button
                    onClick={handleSearch}
                    className={`
                      w-full mt-1 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300
                      ${isDark 
                        ? 'text-blue-400 hover:bg-blue-500/10' 
                        : 'text-blue-600 hover:bg-blue-50'
                      }
                    `}
                  >
                    View all results for "{query}"
                  </button>
                )}

                {isLoading && suggestions.length === 0 && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
                    <span className={`ml-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Searching...
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </form>

      {/* Filters Panel - Blue Theme */}
      <AnimatePresence>
        {showFiltersPanel && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={`
              absolute top-full left-0 right-0 mt-2 rounded-2xl shadow-2xl p-4 z-50
              ${isDark ? 'bg-gray-900 border border-blue-900/30' : 'bg-white border border-gray-200'}
            `}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Filter Results
              </h3>
              <button
                onClick={() => setShowFiltersPanel(false)}
                className="p-1 rounded-lg hover:bg-gray-500/10 transition-colors"
              >
                <X className="w-5 h-5 text-gray-400" />
              </button>
            </div>

            {/* Type Filters - Blue Theme */}
            <div className="mb-4">
              <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Types
              </label>
              <div className="flex flex-wrap gap-2 mt-2">
                {['hotel', 'tour', 'destination', 'experience'].map(type => (
                  <button
                    key={type}
                    onClick={() => toggleFilter('types', type)}
                    className={`
                      px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 capitalize
                      ${filters.types.includes(type)
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30'
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

            {/* Price Range - Blue Theme */}
            <div className="mb-4">
              <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Price Range (₵)
              </label>
              <div className="flex gap-3 mt-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                  className={`
                    w-1/2 px-3 py-2 rounded-xl text-sm outline-none transition-all
                    ${isDark 
                      ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' 
                      : 'bg-gray-100 border border-gray-200 text-gray-800 placeholder-gray-400 focus:border-blue-500'
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
                      ? 'bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:border-blue-500' 
                      : 'bg-gray-100 border border-gray-200 text-gray-800 placeholder-gray-400 focus:border-blue-500'
                    }
                  `}
                />
              </div>
            </div>

            {/* Min Rating - Blue Theme */}
            <div className="mb-4">
              <label className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Minimum Rating
              </label>
              <div className="flex gap-2 mt-2">
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
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg shadow-blue-500/30'
                        : isDark 
                          ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }
                    `}
                  >
                    {rating} ⭐
                  </button>
                ))}
              </div>
            </div>

            {/* Apply Filters Button - Blue Theme */}
            <button
              onClick={applyFilters}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/30"
            >
              Apply Filters
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SearchBar;
// pages/user/UserFavorites.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../hooks/useToast";
import {
  Heart,
  MapPin,
  Star,
  Loader2,
  Trash2,
  Plane,
  Hotel,
  ArrowRight,
  Search,
  Filter,
  Grid,
  List,
  RefreshCw,
  Building2,
  Compass,
  Sparkles,
  Clock,
  DollarSign,
  X,
  Check,
  ChevronDown,
  ChevronUp,
  Eye,
  Share2,
  AlertCircle,
  Bookmark,
  Heart as HeartIcon
} from "lucide-react";

const UserFavorites = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const { showToast } = useToast();
  
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedItems, setSelectedItems] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    hotels: 0,
    tours: 0,
    destinations: 0
  });

  useEffect(() => {
    if (!user) {
      showToast("Please login to view your favorites", "info");
      navigate("/login");
      return;
    }
    fetchFavorites();
  }, [user]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get("/favorites");
      
      if (response.data.success) {
        const favoritesData = response.data.favorites || [];
        setFavorites(favoritesData);
        
        // Calculate stats
        const statsData = {
          total: favoritesData.length,
          hotels: favoritesData.filter(f => f.itemType === "hotel").length,
          tours: favoritesData.filter(f => f.itemType === "tour").length,
          destinations: favoritesData.filter(f => f.itemType === "destination").length
        };
        setStats(statsData);
      } else {
        setError("Failed to load favorites");
        showToast("Failed to load favorites", "error");
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
      setError(error.response?.data?.message || "Failed to load favorites");
      showToast("Failed to load favorites", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchFavorites();
    showToast("Refreshing favorites...", "info");
  };

  const removeFavorite = async (favoriteId, itemName) => {
    try {
      await axios.delete(`/favorites/${favoriteId}`);
      setFavorites(favorites.filter(f => f._id !== favoriteId));
      
      // Update stats
      const removedItem = favorites.find(f => f._id === favoriteId);
      if (removedItem) {
        setStats(prev => ({
          ...prev,
          total: prev.total - 1,
          [removedItem.itemType + 's']: prev[removedItem.itemType + 's'] - 1
        }));
      }
      
      showToast(`Removed "${itemName || 'item'}" from favorites`, "success");
      
      // Remove from selected items if in selection mode
      if (isSelectionMode) {
        setSelectedItems(selectedItems.filter(id => id !== favoriteId));
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
      showToast("Failed to remove from favorites", "error");
    }
  };

  const removeSelected = async () => {
    try {
      const idsToRemove = selectedItems;
      const itemsToRemove = favorites.filter(f => idsToRemove.includes(f._id));
      
      await Promise.all(
        idsToRemove.map(id => axios.delete(`/favorites/${id}`))
      );
      
      setFavorites(favorites.filter(f => !idsToRemove.includes(f._id)));
      
      // Update stats
      const removedCount = itemsToRemove.length;
      const removedTypes = itemsToRemove.reduce((acc, f) => {
        acc[f.itemType] = (acc[f.itemType] || 0) + 1;
        return acc;
      }, {});
      
      setStats(prev => ({
        total: prev.total - removedCount,
        hotels: prev.hotels - (removedTypes.hotel || 0),
        tours: prev.tours - (removedTypes.tour || 0),
        destinations: prev.destinations - (removedTypes.destination || 0)
      }));
      
      setSelectedItems([]);
      setIsSelectionMode(false);
      showToast(`Removed ${removedCount} items from favorites`, "success");
    } catch (error) {
      console.error("Error removing selected favorites:", error);
      showToast("Failed to remove selected favorites", "error");
    }
  };

  const toggleSelectItem = (favoriteId) => {
    if (selectedItems.includes(favoriteId)) {
      setSelectedItems(selectedItems.filter(id => id !== favoriteId));
    } else {
      setSelectedItems([...selectedItems, favoriteId]);
    }
  };

  const toggleSelectAll = () => {
    if (selectedItems.length === filteredFavorites.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredFavorites.map(f => f._id));
    }
  };

  const getItemDetails = (favorite) => {
    const item = favorite.item;
    if (!item) return null;
    
    return {
      id: favorite.itemId,
      type: favorite.itemType,
      name: item.name || item.title || "Item",
      location: item.location || item.region || "Ghana",
      image: item.images?.[0] || item.image || "",
      rating: item.rating || 0,
      reviews: item.reviews || 0,
      price: item.price || 0,
      description: item.description || "",
      badge: item.badge || "",
      amenities: item.amenities || item.includes || [],
      addedDate: favorite.addedAt || favorite.createdAt,
      region: item.region || "",
      favoriteId: favorite._id,
      duration: item.duration || "",
      typeLabel: item.type || "",
    };
  };

  const getFilteredFavorites = () => {
    let filtered = [...favorites];
    
    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter(f => f.itemType === filterType);
    }
    
    // Filter by search
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(f => {
        const item = f.item;
        if (!item) return false;
        const name = (item.name || item.title || "").toLowerCase();
        const location = (item.location || item.region || "").toLowerCase();
        return name.includes(search) || location.includes(search);
      });
    }
    
    // Sort
    filtered.sort((a, b) => {
      const dateA = new Date(a.addedAt || a.createdAt);
      const dateB = new Date(b.addedAt || b.createdAt);
      const itemA = a.item;
      const itemB = b.item;
      
      switch(sortBy) {
        case "recent":
          return dateB - dateA;
        case "oldest":
          return dateA - dateB;
        case "rating":
          return (itemB?.rating || 0) - (itemA?.rating || 0);
        case "price-low":
          return (itemA?.price || 0) - (itemB?.price || 0);
        case "price-high":
          return (itemB?.price || 0) - (itemA?.price || 0);
        default:
          return 0;
      }
    });
    
    return filtered;
  };

  const filteredFavorites = getFilteredFavorites();

  const getItemLink = (favorite) => {
    const type = favorite.itemType;
    const id = favorite.itemId;
    switch(type) {
      case "hotel": return `/hotel/${id}`;
      case "tour": return `/tour/${id}`;
      case "destination": return `/destination/${id}`;
      default: return "#";
    }
  };

  const getItemPrice = (item) => {
    if (!item) return "";
    const price = item.price || 0;
    if (item.type === "hotel") {
      return `₵${price} / night`;
    }
    return `₵${price} / person`;
  };

  const getBadgeColor = (type) => {
    switch(type) {
      case "hotel": return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      case "tour": return "bg-green-500/20 text-green-400 border-green-500/30";
      case "destination": return "bg-purple-500/20 text-purple-400 border-purple-500/30";
      default: return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case "hotel": return <Hotel className="h-4 w-4" />;
      case "tour": return <Plane className="h-4 w-4" />;
      case "destination": return <MapPin className="h-4 w-4" />;
      default: return <Heart className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="relative">
          <Loader2 className="h-16 w-16 text-amber-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <HeartIcon className="h-6 w-6 text-amber-400 animate-pulse" />
          </div>
        </div>
        <p className={`mt-6 text-lg font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Loading your favorites...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-8 rounded-2xl ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border text-center`}>
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
          Failed to Load Favorites
        </h3>
        <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>{error}</p>
        <button
          onClick={handleRefresh}
          className="mt-6 px-8 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:scale-105 transition-all flex items-center gap-2 mx-auto shadow-lg shadow-amber-500/30"
        >
          <RefreshCw className="h-5 w-5" />
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className={`text-3xl md:text-4xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            My Favorites
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {favorites.length} items saved across your journeys
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              refreshing 
                ? 'opacity-50 cursor-not-allowed' 
                : isDark 
                  ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                  : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
          {isSelectionMode && selectedItems.length > 0 && (
            <button
              onClick={removeSelected}
              className="px-4 py-2 bg-red-500 text-white rounded-xl font-medium hover:bg-red-600 transition-all flex items-center gap-2 shadow-lg shadow-red-500/30"
            >
              <Trash2 className="h-4 w-4" />
              Remove {selectedItems.length} items
            </button>
          )}
          <button
            onClick={() => {
              setIsSelectionMode(!isSelectionMode);
              if (isSelectionMode) setSelectedItems([]);
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Heart className="h-4 w-4 text-amber-500" />
            </div>
          </div>
          <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            {stats.total}
          </p>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Hotels</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Hotel className="h-4 w-4 text-blue-500" />
            </div>
          </div>
          <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            {stats.hotels}
          </p>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Tours</span>
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
              <Plane className="h-4 w-4 text-green-500" />
            </div>
          </div>
          <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            {stats.tours}
          </p>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Destinations</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <MapPin className="h-4 w-4 text-purple-500" />
            </div>
          </div>
          <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            {stats.destinations}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 ${isDark ? 'text-gray-400' : 'text-gray-400'}`} />
          <input
            type="text"
            placeholder="Search favorites..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-10 py-2.5 rounded-xl border ${
              isDark 
                ? 'bg-gray-800 border-gray-700 text-gray-100' 
                : 'bg-white border-gray-200 text-gray-900'
            } focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all`}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className={`px-4 py-2.5 rounded-xl border ${
              isDark 
                ? 'bg-gray-800 border-gray-700 text-gray-100' 
                : 'bg-white border-gray-200 text-gray-900'
            } focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all`}
          >
            <option value="all">All Types</option>
            <option value="hotel">Hotels</option>
            <option value="tour">Tours</option>
            <option value="destination">Destinations</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`px-4 py-2.5 rounded-xl border ${
              isDark 
                ? 'bg-gray-800 border-gray-700 text-gray-100' 
                : 'bg-white border-gray-200 text-gray-900'
            } focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all`}
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
              className={`p-2.5 transition-all ${
                viewMode === 'grid'
                  ? 'bg-amber-500 text-white'
                  : isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2.5 transition-all ${
                viewMode === 'list'
                  ? 'bg-amber-500 text-white'
                  : isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Select All */}
      {isSelectionMode && filteredFavorites.length > 0 && (
        <div className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
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
                <Check className="h-3 w-3 text-white" />
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
              className="ml-auto px-3 py-1.5 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-all"
            >
              Remove Selected
            </button>
          )}
        </div>
      )}

      {/* Favorites Grid/List */}
      {filteredFavorites.length === 0 ? (
        <div className={`text-center py-16 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="w-24 h-24 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="h-12 w-12 text-amber-400" />
          </div>
          <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            {searchTerm || filterType !== 'all' ? 'No matching favorites' : 'No Favorites Yet'}
          </h3>
          <p className={`mt-2 max-w-md mx-auto ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {searchTerm || filterType !== 'all' 
              ? 'No favorites match your filters. Try adjusting your search or filter criteria.'
              : 'Start exploring tours, hotels, and destinations in Ghana and save your favorites for easy access.'}
          </p>
          {searchTerm || filterType !== 'all' ? (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
              }}
              className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
            >
              <X className="h-5 w-5" />
              Clear Filters
            </button>
          ) : (
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              <button
                onClick={() => navigate("/tours")}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:scale-105 transition-all shadow-lg shadow-amber-500/30"
              >
                <Plane className="h-5 w-5" />
                Browse Tours
              </button>
              <button
                onClick={() => navigate("/hotels")}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium border transition-all hover:scale-105 ${
                  isDark 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-800' 
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Hotel className="h-5 w-5" />
                Browse Hotels
              </button>
              <button
                onClick={() => navigate("/destinations")}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-medium border transition-all hover:scale-105 ${
                  isDark 
                    ? 'border-gray-600 text-gray-300 hover:bg-gray-800' 
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <MapPin className="h-5 w-5" />
                Explore Destinations
              </button>
            </div>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFavorites.map((favorite) => {
            const item = getItemDetails(favorite);
            if (!item) return null;
            
            return (
              <div
                key={favorite._id}
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
                          <Check className="h-4 w-4 text-white" />
                        )}
                      </div>
                    </div>
                  )}

                  {/* Badge and Remove button */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getBadgeColor(favorite.itemType)}`}>
                      {favorite.itemType}
                    </span>
                    {!isSelectionMode && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFavorite(favorite._id, item.name);
                        }}
                        className="p-2 bg-black/50 backdrop-blur-sm rounded-full text-white hover:bg-red-500 transition-all hover:scale-110"
                      >
                        <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                      </button>
                    )}
                  </div>

                  {/* Rating & Price */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <div className="flex items-center gap-1 text-white bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium">{item.rating}</span>
                      <span className="text-xs text-gray-300">({item.reviews})</span>
                    </div>
                    {item.price > 0 && (
                      <span className="text-white bg-black/40 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold">
                        {getItemPrice(item)}
                      </span>
                    )}
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
                        <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
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
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      Added {new Date(item.addedDate).toLocaleDateString()}
                    </span>
                    <div className="flex items-center gap-1">
                      {!isSelectionMode && (
                        <>
                          <button
                            onClick={() => navigate(getItemLink(favorite))}
                            className="p-2 rounded-lg hover:bg-amber-500/10 transition-colors"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4 text-gray-400 hover:text-amber-500 transition-colors" />
                          </button>
                          <button
                            onClick={() => {
                              const url = `${window.location.origin}${getItemLink(favorite)}`;
                              navigator.clipboard.writeText(url);
                              showToast('Link copied to clipboard!', 'success');
                            }}
                            className="p-2 rounded-lg hover:bg-amber-500/10 transition-colors"
                            title="Share"
                          >
                            <Share2 className="h-4 w-4 text-gray-400 hover:text-amber-500 transition-colors" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        // List View
        <div className="space-y-4">
          {filteredFavorites.map((favorite) => {
            const item = getItemDetails(favorite);
            if (!item) return null;
            
            return (
              <div
                key={favorite._id}
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
                          <Check className="h-4 w-4 text-white" />
                        )}
                      </div>
                    </div>
                  )}
                  
                  <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold border ${getBadgeColor(favorite.itemType)}`}>
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
                        <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
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
                            <Clock className="h-4 w-4 mr-1" />
                            <span>{item.duration}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {item.price > 0 && (
                        <div className="text-lg font-bold text-amber-500">{getItemPrice(item)}</div>
                      )}
                      <div className="flex items-center justify-end gap-1 text-amber-400">
                        <Star className="h-4 w-4 fill-current" />
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
                          <button
                            onClick={() => navigate(getItemLink(favorite))}
                            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-medium hover:scale-105 transition-all"
                          >
                            View Details
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeFavorite(favorite._id, item.name);
                            }}
                            className="p-2 text-red-400 hover:text-red-500 transition-colors hover:bg-red-500/10 rounded-lg"
                            title="Remove from favorites"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default UserFavorites;
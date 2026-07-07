// pages/admin/AdminDestinations.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../../api/axios";
import {
  Plus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Loader2,
  MapPin,
  Globe,
  Flag,
  Users,
  Star,
  DollarSign,
  Camera,
  Mountain,
  Waves,
  TreePine,
  Building,
  Coffee,
  Utensils,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Clock,
  X,
  Grid,
  List,
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Save,
  Image,
  Upload,
  Cloud,
  Sun,
  Compass,
  Heart,
  Crown,
  Gem,
  Award,
  Shield,
  Sparkles,
  Calendar,
  Phone,
  Mail,
  Globe2,
  Home
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../hooks/useToast";
import { useSocket } from "../../context/SocketContext";
import { regions } from "../../data/tourismData";

const AdminDestinations = () => {
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const { socket, isConnected } = useSocket();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [destinations, setDestinations] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [totalDestinations, setTotalDestinations] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingDestination, setEditingDestination] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    country: "Ghana",
    region: "greater-accra",
    category: "city",
    description: "",
    image: "",
    rating: 4.5,
    reviews: 0,
    tags: [],
    tourCount: 0,
    popularity: "Popular",
    status: "active",
    bestTimeToVisit: "",
    currency: "GHS",
    language: "English",
    timezone: "GMT"
  });

  const destinationCategories = ["beach", "mountain", "forest", "city", "desert", "lake", "cultural", "historical"];
  const destinationStatuses = ["active", "inactive", "upcoming", "draft"];
  const popularityLevels = ["Popular", "Very Popular", "Trending", "Hidden Gem", "Must Visit"];

  // Socket.IO event listeners
  useEffect(() => {
    if (!socket) return;

    const handleDestinationCreated = (data) => {
      showToast(`✨ New destination "${data.name}" created!`, 'success');
      fetchDestinations();
    };

    const handleDestinationUpdated = (data) => {
      showToast(`🔄 Destination "${data.name}" updated!`, 'info');
      fetchDestinations();
    };

    const handleDestinationDeleted = (data) => {
      showToast(`🗑️ Destination "${data.name}" deleted!`, 'warning');
      fetchDestinations();
    };

    socket.on('destination-created', handleDestinationCreated);
    socket.on('destination-updated', handleDestinationUpdated);
    socket.on('destination-deleted', handleDestinationDeleted);

    return () => {
      socket.off('destination-created', handleDestinationCreated);
      socket.off('destination-updated', handleDestinationUpdated);
      socket.off('destination-deleted', handleDestinationDeleted);
    };
  }, [socket, showToast]);

  const getCategoryIcon = (category) => {
    const iconMap = {
      'beach': Waves,
      'mountain': Mountain,
      'forest': TreePine,
      'city': Building,
      'desert': Sun,
      'lake': Waves,
      'cultural': Compass,
      'historical': Clock
    };
    return iconMap[category] || MapPin;
  };

  // Fetch destinations with filters and pagination
  useEffect(() => {
    fetchDestinations();
  }, [searchTerm, selectedRegion, selectedCategory, selectedStatus, sortBy, sortDirection, currentPage]);

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      params.append('page', currentPage);
      params.append('limit', itemsPerPage);
      if (searchTerm) params.append('search', searchTerm);
      if (selectedRegion !== 'all') params.append('region', selectedRegion);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortDirection);

      const response = await axios.get(`/destinations?${params.toString()}`);
      
      if (response.data.success) {
        setDestinations(response.data.destinations);
        setTotalDestinations(response.data.pagination?.total || 0);
        setTotalPages(response.data.pagination?.pages || 1);
      } else {
        setError("Failed to load destinations");
      }
    } catch (err) {
      console.error("Error fetching destinations:", err);
      setError(err.response?.data?.message || "Failed to load destinations. Please refresh.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchDestinations();
  };

  const handleDelete = (destination) => {
    setSelectedDestination(destination);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedDestination) return;
    try {
      await axios.delete(`/destinations/${selectedDestination._id}`);
      showToast(`"${selectedDestination.name}" deleted successfully`, "success");
      setShowDeleteModal(false);
      setSelectedDestination(null);
      fetchDestinations();
    } catch (err) {
      console.error("Error deleting destination:", err);
      showToast(err.response?.data?.message || "Failed to delete destination", "error");
    }
  };

  const handleEdit = (destination) => {
    setEditingDestination(destination);
    setFormData({
      name: destination.name || "",
      country: destination.country || "Ghana",
      region: destination.region || "greater-accra",
      category: destination.category || "city",
      description: destination.description || "",
      image: destination.image || "",
      rating: destination.rating || 4.5,
      reviews: destination.reviews || 0,
      tags: destination.tags || [],
      tourCount: destination.tourCount || 0,
      popularity: destination.popularity || "Popular",
      status: destination.status || "active",
      bestTimeToVisit: destination.bestTimeToVisit || "",
      currency: destination.currency || "GHS",
      language: destination.language || "English",
      timezone: destination.timezone || "GMT"
    });
    setShowEditModal(true);
  };

  const handleAddNew = () => {
    setEditingDestination(null);
    setFormData({
      name: "",
      country: "Ghana",
      region: "greater-accra",
      category: "city",
      description: "",
      image: "",
      rating: 4.5,
      reviews: 0,
      tags: [],
      tourCount: 0,
      popularity: "Popular",
      status: "active",
      bestTimeToVisit: "",
      currency: "GHS",
      language: "English",
      timezone: "GMT"
    });
    setShowAddModal(true);
  };

  const handleSaveDestination = async (e) => {
    e.preventDefault();
    try {
      const destinationData = {
        ...formData,
        image: formData.image || "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=800&q=80"
      };

      if (editingDestination) {
        await axios.put(`/destinations/${editingDestination._id}`, destinationData);
        showToast(`"${formData.name}" updated successfully`, "success");
      } else {
        await axios.post("/destinations", destinationData);
        showToast(`"${formData.name}" created successfully`, "success");
      }
      setShowAddModal(false);
      setShowEditModal(false);
      fetchDestinations();
    } catch (err) {
      console.error("Error saving destination:", err);
      showToast(err.response?.data?.message || "Failed to save destination", "error");
    }
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedRegion, selectedCategory, selectedStatus, sortBy, sortDirection]);

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedRegion("all");
    setSelectedCategory("all");
    setSelectedStatus("all");
    setSortBy("createdAt");
    setSortDirection("desc");
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'upcoming': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'draft': return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
      case 'inactive': return 'bg-red-500/20 text-red-500 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
    }
  };

  const getStatusLabel = (status) => {
    return status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Active';
  };

  const getCategoryColor = (category) => {
    const colorMap = {
      'beach': 'bg-blue-500/20 text-blue-500',
      'mountain': 'bg-emerald-500/20 text-emerald-500',
      'forest': 'bg-green-500/20 text-green-500',
      'city': 'bg-purple-500/20 text-purple-500',
      'desert': 'bg-amber-500/20 text-amber-500',
      'lake': 'bg-cyan-500/20 text-cyan-500',
      'cultural': 'bg-orange-500/20 text-orange-500',
      'historical': 'bg-red-500/20 text-red-500'
    };
    return colorMap[category] || 'bg-gray-500/20 text-gray-500';
  };

  const getPopularityColor = (popularity) => {
    const colorMap = {
      'Very Popular': 'text-red-500',
      'Popular': 'text-blue-500',
      'Trending': 'text-green-500',
      'Hidden Gem': 'text-amber-500',
      'Must Visit': 'text-purple-500'
    };
    return colorMap[popularity] || 'text-gray-500';
  };

  // Get unique categories from destinations for filter
  const allCategories = [...new Set(destinations.map(d => d.category).filter(Boolean))];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-10 w-10 text-amber-500 animate-spin mb-4" />
        <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Loading destinations...</p>
        {isConnected && (
          <span className="text-xs text-green-500 mt-2">🟢 Live updates enabled</span>
        )}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-8 rounded-2xl ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border text-center`}>
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
          Failed to load destinations
        </h3>
        <p className={isDark ? 'text-gray-400' : 'text-gray-600'}>{error}</p>
        <button
          onClick={handleRefresh}
          className="mt-4 px-6 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-all flex items-center gap-2 mx-auto"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-end gap-2">
        <span className={`text-xs ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
          {isConnected ? '🟢 Live' : '🔴 Offline'}
        </span>
        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          {isConnected ? 'Real-time updates active' : 'Reconnecting...'}
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <MapPin className="h-6 w-6 text-amber-500" />
            Destinations Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage all travel destinations • {totalDestinations} destinations found
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`p-2 rounded-lg transition-all ${
              refreshing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleAddNew}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg hover:shadow-lg hover:shadow-amber-500/30 transition-all hover:scale-105"
          >
            <Plus className="h-4 w-4" />
            Add Destination
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search destinations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 border rounded-xl ${
              isDark 
                ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-400' 
                : 'bg-white border-gray-200 text-gray-900'
            } focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none`}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 text-sm ${
              showFilters
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`px-4 py-2.5 rounded-xl outline-none text-sm appearance-none ${
              isDark 
                ? 'bg-gray-800 text-white border-gray-700' 
                : 'bg-white text-gray-800 border-gray-200'
            } border focus:border-amber-500 transition-colors pr-10`}
          >
            <option value="createdAt">Latest</option>
            <option value="name">Name</option>
            <option value="rating">Rating</option>
            <option value="tourCount">Popularity</option>
            <option value="reviews">Reviews</option>
          </select>
          <button
            onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
            className={`p-2.5 rounded-xl border ${
              isDark ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-100'
            }`}
          >
            <ArrowUpDown className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex border rounded-xl overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2.5 transition-all ${
              viewMode === 'grid'
                ? 'bg-amber-500 text-white'
                : isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2.5 transition-all ${
              viewMode === 'list'
                ? 'bg-amber-500 text-white'
                : isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Region
              </label>
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl outline-none text-sm ${
                  isDark 
                    ? 'bg-gray-700 text-white border-gray-600' 
                    : 'bg-white text-gray-800 border-gray-200'
                } border focus:border-amber-500 transition-colors`}
              >
                <option value="all">All Regions</option>
                {regions.map(region => (
                  <option key={region.id} value={region.id}>{region.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl outline-none text-sm ${
                  isDark 
                    ? 'bg-gray-700 text-white border-gray-600' 
                    : 'bg-white text-gray-800 border-gray-200'
                } border focus:border-amber-500 transition-colors`}
              >
                <option value="all">All Categories</option>
                {allCategories.map(category => (
                  <option key={category} value={category}>{category.charAt(0).toUpperCase() + category.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Status
              </label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl outline-none text-sm ${
                  isDark 
                    ? 'bg-gray-700 text-white border-gray-600' 
                    : 'bg-white text-gray-800 border-gray-200'
                } border focus:border-amber-500 transition-colors`}
              >
                <option value="all">All Status</option>
                {destinationStatuses.map(status => (
                  <option key={status} value={status}>{getStatusLabel(status)}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Destinations Grid/List */}
      {destinations.length === 0 ? (
        <div className={`p-12 rounded-2xl text-center border border-dashed ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
          <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-10 w-10 text-amber-400" />
          </div>
          <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            No destinations found
          </h3>
          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
            Try adjusting your filters or create a new destination
          </p>
          <button
            onClick={handleAddNew}
            className="mt-4 px-6 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-all flex items-center gap-2 mx-auto"
          >
            <Plus className="h-4 w-4" />
            Add Destination
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {destinations.map((destination) => {
            const Icon = getCategoryIcon(destination.category);
            const regionName = regions.find(r => r.id === destination.region)?.name || destination.region;
            return (
              <div
                key={destination._id}
                className={`group rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
                  isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white shadow-lg hover:shadow-2xl'
                }`}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img 
                    src={destination.image || 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=800&q=80'} 
                    alt={destination.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(destination.category)}`}>
                      {destination.category}
                    </span>
                  </div>
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(destination.status)}`}>
                    {getStatusLabel(destination.status)}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-white bg-black/50 px-3 py-1 rounded-full">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium">{destination.rating || 0}</span>
                      <span className="text-xs text-gray-300">({destination.reviews || 0})</span>
                    </div>
                    <span className={`text-xs font-medium bg-black/50 px-3 py-1 rounded-full text-white ${getPopularityColor(destination.popularity)}`}>
                      {destination.popularity || 'Popular'}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-gray-800'} truncate`}>
                    {destination.name}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <Flag className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="truncate">{destination.country}</span>
                    <span className="mx-2">•</span>
                    <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="truncate">{regionName}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(destination.tags || []).slice(0, 3).map((tag, i) => (
                      <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${
                        isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {tag}
                      </span>
                    ))}
                    {(destination.tags || []).length > 3 && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}>
                        +{(destination.tags || []).length - 3}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200/20 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Users className="h-4 w-4" />
                      <span>{destination.tourCount || 0} tours</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Icon className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-end gap-2">
                    <button 
                      onClick={() => handleEdit(destination)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 hover:text-green-500"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(destination)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-3">
          {destinations.map((destination) => {
            const regionName = regions.find(r => r.id === destination.region)?.name || destination.region;
            return (
              <div
                key={destination._id}
                className={`flex flex-col md:flex-row rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.01] ${
                  isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white shadow-lg hover:shadow-2xl'
                }`}
              >
                <div className="relative w-full md:w-48 h-40 md:h-auto flex-shrink-0">
                  <img 
                    src={destination.image || 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=800&q=80'} 
                    alt={destination.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(destination.category)}`}>
                      {destination.category}
                    </span>
                  </div>
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(destination.status)}`}>
                    {getStatusLabel(destination.status)}
                  </div>
                </div>
                <div className="flex-1 p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          {destination.name}
                        </h3>
                        <div className="flex items-center text-sm text-gray-500 mt-1 flex-wrap">
                          <Flag className="w-4 h-4 mr-1 flex-shrink-0" />
                          <span>{destination.country}</span>
                          <span className="mx-2">•</span>
                          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                          <span>{regionName}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-medium ${getPopularityColor(destination.popularity)}`}>
                          {destination.popularity || 'Popular'}
                        </span>
                      </div>
                    </div>
                    <p className={`text-sm mt-2 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {destination.description}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(destination.tags || []).slice(0, 5).map((tag, i) => (
                        <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${
                          isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {tag}
                        </span>
                      ))}
                      {(destination.tags || []).length > 5 && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                        }`}>
                          +{(destination.tags || []).length - 5}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200/20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-amber-400">
                        <Star className="w-4 h-4 fill-current" />
                        <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          {destination.rating || 0}
                        </span>
                        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          ({destination.reviews || 0} reviews)
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Users className="h-4 w-4" />
                        <span>{destination.tourCount || 0} tours</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleEdit(destination)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 hover:text-green-500"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(destination)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 hover:text-red-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className={`p-2 rounded-xl transition-all ${
              currentPage === 1
                ? isDark ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          {[...Array(Math.min(totalPages, 5))].map((_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            return (
              <button
                key={i}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-10 h-10 rounded-xl font-medium transition-all ${
                  currentPage === pageNum
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                    : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-xl transition-all ${
              currentPage === totalPages
                ? isDark ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-amber-500" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Destinations</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalDestinations}</p>
        </div>
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Active</span>
          </div>
          <p className="text-2xl font-bold text-green-500">{destinations.filter(d => d.status === 'active').length}</p>
        </div>
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-500" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Avg Rating</span>
          </div>
          <p className="text-2xl font-bold text-purple-500">
            {(destinations.reduce((acc, d) => acc + (d.rating || 0), 0) / (destinations.length || 1)).toFixed(1)} ★
          </p>
        </div>
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-500" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Tours</span>
          </div>
          <p className="text-2xl font-bold text-blue-500">
            {destinations.reduce((acc, d) => acc + (d.tourCount || 0), 0)}
          </p>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedDestination && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className={`max-w-md w-full mx-4 p-6 rounded-2xl ${isDark ? 'bg-gray-900' : 'bg-white'} shadow-2xl`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Delete Destination
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  This action cannot be undone
                </p>
              </div>
            </div>
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              Are you sure you want to delete <strong>"{selectedDestination.name}"</strong>?
            </p>
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedDestination(null);
                }}
                className={`flex-1 px-4 py-2.5 rounded-xl ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-all`}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={`max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 rounded-2xl ${isDark ? 'bg-gray-900' : 'bg-white'} shadow-2xl`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {editingDestination ? 'Edit Destination' : 'Add New Destination'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowEditModal(false);
                }}
                className={`p-2 rounded-full ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDestination} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Destination Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                      isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
                    } border focus:border-amber-500 transition-colors`}
                    placeholder="Kakum National Park"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Country *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                      isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
                    } border focus:border-amber-500 transition-colors`}
                    placeholder="Ghana"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Region
                  </label>
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData({...formData, region: e.target.value})}
                    className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                      isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
                    } border focus:border-amber-500 transition-colors`}
                  >
                    {regions.map(region => (
                      <option key={region.id} value={region.id}>{region.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                      isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
                    } border focus:border-amber-500 transition-colors`}
                  >
                    {destinationCategories.map(category => (
                      <option key={category} value={category}>{category.charAt(0).toUpperCase() + category.slice(1)}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                      isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
                    } border focus:border-amber-500 transition-colors`}
                  >
                    {destinationStatuses.map(status => (
                      <option key={status} value={status}>{getStatusLabel(status)}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Description *
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                    isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
                  } border focus:border-amber-500 transition-colors resize-none`}
                  placeholder="Detailed description of the destination..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Rating
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={formData.rating}
                    onChange={(e) => setFormData({...formData, rating: parseFloat(e.target.value)})}
                    className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                      isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
                    } border focus:border-amber-500 transition-colors`}
                    placeholder="4.5"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Popularity
                  </label>
                  <select
                    value={formData.popularity}
                    onChange={(e) => setFormData({...formData, popularity: e.target.value})}
                    className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                      isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
                    } border focus:border-amber-500 transition-colors`}
                  >
                    {popularityLevels.map(level => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Tags (comma separated)
                </label>
                <input
                  type="text"
                  value={formData.tags.join(', ')}
                  onChange={(e) => setFormData({...formData, tags: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                  className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                    isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
                  } border focus:border-amber-500 transition-colors`}
                  placeholder="Canopy Walkway, Wildlife, Eco-Tourism"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Image URL
                </label>
                <input
                  type="text"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                    isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
                  } border focus:border-amber-500 transition-colors`}
                  placeholder="https://images.unsplash.com/..."
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Tour Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.tourCount}
                    onChange={(e) => setFormData({...formData, tourCount: parseInt(e.target.value)})}
                    className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                      isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
                    } border focus:border-amber-500 transition-colors`}
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Reviews Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.reviews}
                    onChange={(e) => setFormData({...formData, reviews: parseInt(e.target.value)})}
                    className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                      isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
                    } border focus:border-amber-500 transition-colors`}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Best Time to Visit
                  </label>
                  <input
                    type="text"
                    value={formData.bestTimeToVisit}
                    onChange={(e) => setFormData({...formData, bestTimeToVisit: e.target.value})}
                    className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                      isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
                    } border focus:border-amber-500 transition-colors`}
                    placeholder="November - March"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Currency
                  </label>
                  <input
                    type="text"
                    value={formData.currency}
                    onChange={(e) => setFormData({...formData, currency: e.target.value})}
                    className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                      isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
                    } border focus:border-amber-500 transition-colors`}
                    placeholder="GHS"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Language
                  </label>
                  <input
                    type="text"
                    value={formData.language}
                    onChange={(e) => setFormData({...formData, language: e.target.value})}
                    className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                      isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
                    } border focus:border-amber-500 transition-colors`}
                    placeholder="English"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setShowEditModal(false);
                  }}
                  className={`flex-1 px-4 py-2.5 rounded-xl ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-all`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {editingDestination ? 'Update Destination' : 'Create Destination'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDestinations;
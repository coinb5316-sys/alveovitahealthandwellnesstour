// pages/admin/AdminHotels.jsx - Full Updated with Socket.IO
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
  Hotel,
  MapPin,
  DollarSign,
  Star,
  Wifi,
  Dumbbell,
  Waves,
  Bed,
  Users,
  Coffee,
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
  ChevronRight,
  Phone,
  Mail,
  Globe,
  Crown,
  Gem,
  Award,
  Shield,
  Sparkles,
  Calendar,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Image,
  Upload,
  Save,
  Plus as PlusIcon,
  Minus,
  Building2,
  Home,
  ImagePlus,
  Trash2 as TrashIcon,
  Info,
  FileText
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../hooks/useToast";
import { useSocket } from "../../context/SocketContext";
import { regions } from "../../data/tourismData";

// Predefined amenities list for dropdown
const PREDEFINED_AMENITIES = [
  "Spa", "Pool", "Gym", "Restaurant", "Free WiFi", "Parking", 
  "Conference Rooms", "Bar", "Room Service", "Laundry", 
  "Airport Shuttle", "Business Center", "Fitness Center",
  "Spa Center", "Yoga Studio", "Meditation Garden", "Health Cafe",
  "Concierge Service", "Swimming Pool", "Hot Tub", "Sauna",
  "Steam Room", "Massage Services", "Beach Access", "Water Sports",
  "24/7 Security", "Medical Services", "Pharmacy", "Shopping Area",
  "Children's Play Area", "Pet Friendly", "Wheelchair Accessible"
];

const AdminHotels = () => {
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const { socket, isConnected } = useSocket();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalHotels, setTotalHotels] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingHotel, setEditingHotel] = useState(null);
  const [activeSection, setActiveSection] = useState("basic");
  const [imageInputValue, setImageInputValue] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    region: "greater-accra",
    description: "",
    price: "",
    rating: 4.5,
    reviews: 0,
    badge: "",
    amenities: [],
    images: [],
    phone: "+233 55 123 4567",
    email: "info@hotel.com",
    website: "www.hotel.com",
    checkIn: "2:00 PM",
    checkOut: "12:00 PM",
    rooms: 50,
    status: "active"
  });

  const hotelStatuses = ["active", "inactive", "maintenance", "upcoming"];

  // Socket.IO event listeners
  useEffect(() => {
    if (!socket) return;

    const handleHotelCreated = (data) => {
      showToast(`✨ New hotel "${data.name}" created!`, 'success');
      fetchHotels();
    };

    const handleHotelUpdated = (data) => {
      showToast(`🔄 Hotel "${data.name}" updated!`, 'info');
      fetchHotels();
    };

    const handleHotelDeleted = (data) => {
      showToast(`🗑️ Hotel "${data.name}" deleted!`, 'warning');
      fetchHotels();
    };

    socket.on('hotel-created', handleHotelCreated);
    socket.on('hotel-updated', handleHotelUpdated);
    socket.on('hotel-deleted', handleHotelDeleted);

    return () => {
      socket.off('hotel-created', handleHotelCreated);
      socket.off('hotel-updated', handleHotelUpdated);
      socket.off('hotel-deleted', handleHotelDeleted);
    };
  }, [socket, showToast]);

  // Fetch hotels from backend
  useEffect(() => {
    fetchHotels();
  }, [searchTerm, selectedRegion, selectedStatus, selectedRating, sortBy, sortDirection, currentPage]);

  const fetchHotels = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedRegion !== 'all') params.append('region', selectedRegion);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      if (selectedRating !== 'all') params.append('minRating', selectedRating);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortDirection);
      params.append('page', currentPage);
      params.append('limit', itemsPerPage);

      const response = await axios.get(`/hotels?${params.toString()}`);
      
      if (response.data.success) {
        const formattedHotels = response.data.hotels.map(hotel => ({
          ...hotel,
          id: hotel._id,
          price: `₵${hotel.price.toLocaleString()}`
        }));
        setHotels(formattedHotels);
        setTotalHotels(response.data.pagination?.total || 0);
        setTotalPages(response.data.pagination?.pages || 1);
      }
    } catch (err) {
      console.error("Error fetching hotels:", err);
      setError(err.response?.data?.message || "Failed to load hotels. Please refresh.");
      showToast("Failed to load hotels", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchHotels();
  };

  const handleDelete = async (hotel) => {
    setSelectedHotel(hotel);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedHotel) return;
    try {
      await axios.delete(`/hotels/${selectedHotel._id}`);
      showToast(`"${selectedHotel.name}" deleted successfully`, "success");
      setShowDeleteModal(false);
      setSelectedHotel(null);
      fetchHotels();
    } catch (err) {
      console.error("Error deleting hotel:", err);
      showToast("Failed to delete hotel", "error");
    }
  };

  const handleEdit = (hotel) => {
    setEditingHotel(hotel);
    setFormData({
      name: hotel.name || "",
      location: hotel.location || "",
      region: hotel.region || "greater-accra",
      description: hotel.description || "",
      price: hotel.price || "",
      rating: hotel.rating || 4.5,
      reviews: hotel.reviews || 0,
      badge: hotel.badge || "",
      amenities: hotel.amenities || [],
      images: hotel.images || [],
      phone: hotel.phone || "+233 55 123 4567",
      email: hotel.email || "info@hotel.com",
      website: hotel.website || "www.hotel.com",
      checkIn: hotel.checkIn || "2:00 PM",
      checkOut: hotel.checkOut || "12:00 PM",
      rooms: hotel.rooms || 50,
      status: hotel.status || "active"
    });
    setImageInputValue("");
    setActiveSection("basic");
    setShowEditModal(true);
  };

  const handleAddNew = () => {
    setEditingHotel(null);
    setFormData({
      name: "",
      location: "",
      region: "greater-accra",
      description: "",
      price: "",
      rating: 4.5,
      reviews: 0,
      badge: "",
      amenities: [],
      images: [],
      phone: "+233 55 123 4567",
      email: "info@hotel.com",
      website: "www.hotel.com",
      checkIn: "2:00 PM",
      checkOut: "12:00 PM",
      rooms: 50,
      status: "active"
    });
    setImageInputValue("");
    setActiveSection("basic");
    setShowAddModal(true);
  };

  // Image management functions
  const addImage = () => {
    const url = imageInputValue.trim();
    if (!url) {
      showToast("Please enter an image URL", "error");
      return;
    }
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      showToast("Please enter a valid URL starting with http:// or https://", "error");
      return;
    }
    setFormData({ ...formData, images: [...formData.images, url] });
    setImageInputValue("");
    showToast("Image added successfully", "success");
  };

  const removeImage = (index) => {
    if (formData.images.length <= 1) {
      showToast("You must have at least one image", "error");
      return;
    }
    const updated = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: updated });
  };

  const setMainImage = (index) => {
    const updated = [...formData.images];
    const [selected] = updated.splice(index, 1);
    updated.unshift(selected);
    setFormData({ ...formData, images: updated });
    showToast("Main image updated", "success");
  };

  const handleSaveHotel = async (e) => {
    e.preventDefault();
    try {
      const hotelData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        rating: parseFloat(formData.rating) || 0,
        reviews: parseInt(formData.reviews) || 0,
        rooms: parseInt(formData.rooms) || 50,
        images: formData.images.length ? formData.images : ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80"]
      };

      if (editingHotel) {
        await axios.put(`/hotels/${editingHotel._id}`, hotelData);
        showToast(`"${formData.name}" updated successfully`, "success");
      } else {
        await axios.post("/hotels", hotelData);
        showToast(`"${formData.name}" created successfully`, "success");
      }
      setShowAddModal(false);
      setShowEditModal(false);
      fetchHotels();
    } catch (err) {
      console.error("Error saving hotel:", err);
      showToast(err.response?.data?.message || "Failed to save hotel", "error");
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'active': return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'upcoming': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'maintenance': return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
      case 'inactive': return 'bg-red-500/20 text-red-500 border-red-500/30';
      default: return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
    }
  };

  const getStatusLabel = (status) => {
    const labels = {
      active: 'Active',
      inactive: 'Inactive',
      maintenance: 'Maintenance',
      upcoming: 'Upcoming'
    };
    return labels[status] || status || 'Active';
  };

  const getAmenityIcon = (amenity) => {
    const iconMap = {
      'Spa': Sparkles,
      'Pool': Waves,
      'Gym': Dumbbell,
      'Restaurant': Coffee,
      'Free WiFi': Wifi,
      'Parking': Home,
      'Conference Rooms': Users,
      'Bar': Coffee,
      'Room Service': Hotel,
      'Laundry': Hotel,
      'Airport Shuttle': Home,
      'Business Center': Building2,
      'Fitness Center': Dumbbell,
      'Spa Center': Sparkles,
      'Yoga Studio': Users,
      'Meditation Garden': Sparkles,
      'Health Cafe': Coffee,
      'Concierge Service': Users,
      'Swimming Pool': Waves,
      'Hot Tub': Waves,
      'Sauna': Sparkles,
      'Steam Room': Sparkles,
      'Massage Services': Sparkles,
      'Beach Access': Waves,
      'Water Sports': Waves
    };
    return iconMap[amenity] || CheckCircle;
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedRegion("all");
    setSelectedStatus("all");
    setSelectedRating("all");
    setSortBy("createdAt");
    setSortDirection("desc");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-10 w-10 text-amber-500 animate-spin mb-4" />
        <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Loading hotels...</p>
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
          Failed to load hotels
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
            <Hotel className="h-6 w-6 text-amber-500" />
            Hotels Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage all hotel listings • {totalHotels} hotels found
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
            Add Hotel
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search hotels..."
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
            <option value="price">Price</option>
            <option value="rating">Rating</option>
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
                {hotelStatuses.map(status => (
                  <option key={status} value={status}>{getStatusLabel(status)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Min Rating
              </label>
              <select
                value={selectedRating}
                onChange={(e) => setSelectedRating(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl outline-none text-sm ${
                  isDark 
                    ? 'bg-gray-700 text-white border-gray-600' 
                    : 'bg-white text-gray-800 border-gray-200'
                } border focus:border-amber-500 transition-colors`}
              >
                <option value="all">All Ratings</option>
                <option value="4.5">4.5+ Stars</option>
                <option value="4.0">4.0+ Stars</option>
                <option value="3.5">3.5+ Stars</option>
                <option value="3.0">3.0+ Stars</option>
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

      {/* Hotels Grid/List */}
      {hotels.length === 0 ? (
        <div className={`p-12 rounded-2xl text-center border border-dashed ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
          <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-10 w-10 text-amber-400" />
          </div>
          <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            No hotels found
          </h3>
          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
            Try adjusting your filters or create a new hotel listing
          </p>
          <button
            onClick={handleAddNew}
            className="mt-4 px-6 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-all flex items-center gap-2 mx-auto"
          >
            <Plus className="h-4 w-4" />
            Add Hotel
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {hotels.map((hotel) => (
            <div
              key={hotel._id}
              className={`group rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
                isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white shadow-lg hover:shadow-2xl'
              }`}
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img 
                  src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'} 
                  alt={hotel.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                {hotel.badge && (
                  <div className="absolute top-3 left-3">
                    <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {hotel.badge}
                    </span>
                  </div>
                )}
                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(hotel.status)}`}>
                  {getStatusLabel(hotel.status)}
                </div>
                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                  <div className="flex items-center space-x-1 text-white bg-black/50 px-3 py-1 rounded-full">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-medium">{hotel.rating || 0}</span>
                    <span className="text-xs text-gray-300">({hotel.reviews || 0})</span>
                  </div>
                  <span className="text-white bg-black/50 px-3 py-1 rounded-full text-sm font-bold">
                    {hotel.price || '₵0'}
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-gray-800'} truncate`}>
                  {hotel.name}
                </h3>
                <div className="flex items-center text-sm text-gray-500 mt-1">
                  <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="truncate">{hotel.location}</span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {(hotel.amenities || []).slice(0, 3).map((amenity, i) => {
                    const Icon = getAmenityIcon(amenity);
                    return (
                      <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${
                        isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                      } flex items-center gap-1`}>
                        <Icon className="h-3 w-3" />
                        {amenity}
                      </span>
                    );
                  })}
                  {(hotel.amenities || []).length > 3 && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                    }`}>
                      +{(hotel.amenities || []).length - 3}
                    </span>
                  )}
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200/20 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Bed className="h-4 w-4" />
                    <span>{hotel.rooms || 0} rooms</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(hotel.status)}`}>
                      {getStatusLabel(hotel.status)}
                    </span>
                  </div>
                </div>
                <div className="mt-3 flex items-center justify-end gap-2">
                  <Link to={`/hotel/${hotel._id}`} target="_blank">
                    <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 hover:text-amber-500">
                      <Eye className="h-4 w-4" />
                    </button>
                  </Link>
                  <button 
                    onClick={() => handleEdit(hotel)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 hover:text-green-500"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => handleDelete(hotel)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {hotels.map((hotel) => (
            <div
              key={hotel._id}
              className={`flex flex-col md:flex-row rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.01] ${
                isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white shadow-lg hover:shadow-2xl'
              }`}
            >
              <div className="relative w-full md:w-48 h-40 md:h-auto flex-shrink-0">
                <img 
                  src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80'} 
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                />
                {hotel.badge && (
                  <div className="absolute top-3 left-3">
                    <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {hotel.badge}
                    </span>
                  </div>
                )}
                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(hotel.status)}`}>
                  {getStatusLabel(hotel.status)}
                </div>
              </div>
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {hotel.name}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1 flex-wrap">
                        <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span>{hotel.location}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-amber-500">{hotel.price || '₵0'}</div>
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        per night
                      </div>
                    </div>
                  </div>
                  <p className={`text-sm mt-2 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {hotel.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(hotel.amenities || []).slice(0, 5).map((amenity, i) => {
                      const Icon = getAmenityIcon(amenity);
                      return (
                        <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${
                          isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                        } flex items-center gap-1`}>
                          <Icon className="h-3 w-3" />
                          {amenity}
                        </span>
                      );
                    })}
                    {(hotel.amenities || []).length > 5 && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}>
                        +{(hotel.amenities || []).length - 5}
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {hotel.rating || 0}
                      </span>
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        ({hotel.reviews || 0} reviews)
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Bed className="h-4 w-4" />
                      <span>{hotel.rooms || 0} rooms</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/hotel/${hotel._id}`} target="_blank">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 hover:text-amber-500">
                        <Eye className="h-4 w-4" />
                      </button>
                    </Link>
                    <button 
                      onClick={() => handleEdit(hotel)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 hover:text-green-500"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(hotel)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 hover:text-red-500"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
            <Hotel className="h-4 w-4 text-amber-500" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Hotels</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalHotels}</p>
        </div>
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Active</span>
          </div>
          <p className="text-2xl font-bold text-green-500">{hotels.filter(h => h.status === 'active').length}</p>
        </div>
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-500" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Avg Rating</span>
          </div>
          <p className="text-2xl font-bold text-purple-500">
            {(hotels.reduce((acc, h) => acc + (h.rating || 0), 0) / (hotels.length || 1)).toFixed(1)} ★
          </p>
        </div>
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2">
            <Bed className="h-4 w-4 text-blue-500" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Rooms</span>
          </div>
          <p className="text-2xl font-bold text-blue-500">
            {hotels.reduce((acc, h) => acc + (h.rooms || 0), 0)}
          </p>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedHotel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className={`max-w-md w-full mx-4 p-6 rounded-2xl ${isDark ? 'bg-gray-900' : 'bg-white'} shadow-2xl`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Delete Hotel
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  This action cannot be undone
                </p>
              </div>
            </div>
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              Are you sure you want to delete <strong>"{selectedHotel.name}"</strong>?
            </p>
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedHotel(null);
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
          <div className={`max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 rounded-2xl ${isDark ? 'bg-gray-900' : 'bg-white'} shadow-2xl`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {editingHotel ? 'Edit Hotel' : 'Add New Hotel'}
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

            {/* Section Tabs */}
            <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
              {[
                { id: 'basic', label: 'Basic Info', icon: Info },
                { id: 'details', label: 'Details', icon: FileText },
                { id: 'images', label: 'Images', icon: Image },
                { id: 'amenities', label: 'Amenities', icon: Sparkles },
              ].map((section) => {
                const Icon = section.icon;
                return (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 text-sm ${
                      activeSection === section.id
                        ? 'bg-amber-500 text-white'
                        : isDark
                          ? 'hover:bg-gray-800 text-gray-400'
                          : 'hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {section.label}
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSaveHotel} className="space-y-4">
              {/* BASIC INFO SECTION */}
              {activeSection === 'basic' && (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Hotel Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                          isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
                        } border focus:border-amber-500 transition-colors`}
                        placeholder="Kempinski Hotel"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Location *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                          isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
                        } border focus:border-amber-500 transition-colors`}
                        placeholder="Accra, Ghana"
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
                        Price per Night (₵) *
                      </label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        value={formData.price}
                        onChange={(e) => setFormData({...formData, price: e.target.value})}
                        className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                          isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
                        } border focus:border-amber-500 transition-colors`}
                        placeholder="299"
                      />
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
                        {hotelStatuses.map(status => (
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
                      placeholder="Detailed description of the hotel..."
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
                        Badge (e.g., "Luxury", "Best Seller")
                      </label>
                      <input
                        type="text"
                        value={formData.badge}
                        onChange={(e) => setFormData({...formData, badge: e.target.value})}
                        className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                          isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
                        } border focus:border-amber-500 transition-colors`}
                        placeholder="Luxury"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Phone
                      </label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                          isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
                        } border focus:border-amber-500 transition-colors`}
                        placeholder="+233 55 123 4567"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                          isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
                        } border focus:border-amber-500 transition-colors`}
                        placeholder="info@hotel.com"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Website
                      </label>
                      <input
                        type="text"
                        value={formData.website}
                        onChange={(e) => setFormData({...formData, website: e.target.value})}
                        className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                          isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
                        } border focus:border-amber-500 transition-colors`}
                        placeholder="www.hotel.com"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Check-in Time
                      </label>
                      <input
                        type="text"
                        value={formData.checkIn}
                        onChange={(e) => setFormData({...formData, checkIn: e.target.value})}
                        className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                          isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
                        } border focus:border-amber-500 transition-colors`}
                        placeholder="2:00 PM"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Check-out Time
                      </label>
                      <input
                        type="text"
                        value={formData.checkOut}
                        onChange={(e) => setFormData({...formData, checkOut: e.target.value})}
                        className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                          isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
                        } border focus:border-amber-500 transition-colors`}
                        placeholder="12:00 PM"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Number of Rooms
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.rooms}
                      onChange={(e) => setFormData({...formData, rooms: parseInt(e.target.value)})}
                      className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                        isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
                      } border focus:border-amber-500 transition-colors`}
                      placeholder="50"
                    />
                  </div>
                </>
              )}

              {/* DETAILS SECTION */}
              {activeSection === 'details' && (
                <div className="space-y-4">
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
              )}

              {/* AMENITIES SECTION */}
              {activeSection === 'amenities' && (
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Hotel Amenities
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.amenities.map((amenity, index) => (
                      <span key={index} className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${isDark ? 'bg-amber-900/30 text-amber-400 border border-amber-800' : 'bg-amber-100 text-amber-700 border border-amber-200'}`}>
                        {amenity}
                        <button
                          type="button"
                          onClick={() => {
                            const updated = formData.amenities.filter((_, i) => i !== index);
                            setFormData({...formData, amenities: updated});
                          }}
                          className="hover:text-red-500 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                  <select
                    onChange={(e) => {
                      if (e.target.value && !formData.amenities.includes(e.target.value)) {
                        setFormData({...formData, amenities: [...formData.amenities, e.target.value]});
                      }
                      e.target.value = "";
                    }}
                    className={`w-full px-4 py-2.5 rounded-xl outline-none ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'} border focus:border-amber-500 transition-colors`}
                  >
                    <option value="">Select an amenity...</option>
                    {PREDEFINED_AMENITIES.filter(a => !formData.amenities.includes(a)).map((amenity, i) => (
                      <option key={i} value={amenity}>{amenity}</option>
                    ))}
                  </select>
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                    Select amenities from the dropdown, or type custom ones below
                  </p>
                  <input
                    type="text"
                    placeholder="Or type custom amenity and press Enter"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const value = e.target.value.trim();
                        if (value && !formData.amenities.includes(value)) {
                          setFormData({...formData, amenities: [...formData.amenities, value]});
                          e.target.value = "";
                        }
                      }
                    }}
                    className={`w-full mt-2 px-4 py-2.5 rounded-xl outline-none ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'} border focus:border-amber-500 transition-colors`}
                    placeholder="Enter custom amenity..."
                  />
                </div>
              )}

              {/* IMAGES SECTION */}
              {activeSection === 'images' && (
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Hotel Images (First image is the main banner)
                    </label>
                    
                    {/* Image Gallery Preview */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                      {formData.images.map((url, index) => (
                        <div key={index} className={`relative group rounded-xl overflow-hidden border-2 ${index === 0 ? 'border-amber-500 ring-2 ring-amber-500/30' : isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                          <img 
                            src={url} 
                            alt={`Hotel image ${index + 1}`}
                            className="w-full h-32 object-cover"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80';
                            }}
                          />
                          {index === 0 && (
                            <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                              Main
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                            {index !== 0 && (
                              <button
                                type="button"
                                onClick={() => setMainImage(index)}
                                className="p-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all text-xs"
                              >
                                Set as Main
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-all text-xs"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          <div className={`absolute bottom-0 left-0 right-0 h-1 ${index === 0 ? 'bg-amber-500' : isDark ? 'bg-gray-600' : 'bg-gray-300'}`} />
                        </div>
                      ))}
                    </div>

                    {/* Add Image Input */}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={imageInputValue}
                        onChange={(e) => setImageInputValue(e.target.value)}
                        placeholder="Enter image URL (https://...)"
                        className={`flex-1 px-4 py-2.5 rounded-xl outline-none ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'} border focus:border-amber-500 transition-colors`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addImage();
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={addImage}
                        className="px-4 py-2.5 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-all flex items-center gap-2 whitespace-nowrap"
                      >
                        <ImagePlus className="w-4 h-4" />
                        Add Image
                      </button>
                    </div>
                    <p className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                      <span className="font-semibold">Tip:</span> The first image is the main banner. Add multiple images for the slider carousel.
                      {formData.images.length > 1 && ` (${formData.images.length - 1} slider images)`}
                    </p>
                    {formData.images.length > 1 && (
                      <div className={`p-3 rounded-xl ${isDark ? 'bg-blue-900/20 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
                        <p className={`text-sm ${isDark ? 'text-blue-400' : 'text-blue-600'}`}>
                          <span className="font-semibold">✓</span> {formData.images.length - 1} additional images will appear in the slider
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

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
                  {editingHotel ? 'Update Hotel' : 'Create Hotel'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminHotels;
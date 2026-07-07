// pages/admin/AdminTours.jsx
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
  Plane,
  MapPin,
  Calendar,
  DollarSign,
  Clock,
  Star,
  ChevronDown,
  ChevronUp,
  X,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Users,
  Award,
  Sparkles,
  Compass,
  Heart,
  Mountain,
  Leaf,
  TreePine,
  Waves,
  Building2,
  Grid,
  List,
  ArrowUpDown,
  ChevronRight,
  Image,
  Video,
  FileText,
  Upload,
  Save,
  Copy,
  Globe,
  User,
  Phone,
  Mail,
  MessageSquare,
  Bus,
  Train,
  Car,
  Ship,
  Utensils,
  Bed,
  Hotel,
  Info,
  Plus as PlusIcon,
  Minus,
  Trash2 as TrashIcon,
  GripVertical,
  ImagePlus
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../hooks/useToast";
import { useSocket } from "../../context/SocketContext";
import { regions } from "../../data/tourismData";

// Predefined amenities list for dropdown
const PREDEFINED_AMENITIES = [
  "Swimming Pool", "Spa Center", "Gym/Fitness Center", "Yoga Studio",
  "Meditation Garden", "Wellness Library", "Health Cafe", "Concierge Service",
  "Free WiFi", "Parking", "Airport Shuttle", "Business Center",
  "Conference Rooms", "Bar/Lounge", "Room Service", "Laundry Service",
  "Beach Access", "Water Sports", "Hiking Trails", "Bicycle Rental",
  "Children's Play Area", "Pet Friendly", "Wheelchair Accessible",
  "24/7 Security", "Medical Services", "Pharmacy", "Shopping Area"
];

const AdminTours = () => {
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const { socket, isConnected } = useSocket();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [tours, setTours] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTours, setTotalTours] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTour, setSelectedTour] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingTour, setEditingTour] = useState(null);
  const [activeSection, setActiveSection] = useState("basic");
  const [imageInputValue, setImageInputValue] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    location: "",
    region: "greater-accra",
    type: "Cultural",
    difficulty: "Moderate",
    price: "",
    duration: "",
    rating: 5,
    reviews: 0,
    description: "",
    longDescription: "",
    includes: [],
    excludes: [],
    amenities: [],
    images: [],
    itinerary: [{ day: 1, title: "", activities: [] }],
    availableDates: [],
    maxGroup: 20,
    minGroup: 2,
    badge: "",
    status: "active",
    category: "wellness",
    guide: {
      name: "",
      bio: "",
      experience: 0,
      languages: [],
      avatar: "",
      phone: "",
      email: "",
      rating: 0,
    },
    transport: {
      type: "Bus",
      description: "",
      included: true,
      details: ""
    },
    entryFees: {
      included: true,
      amount: 0,
      description: "",
      sites: []
    },
    meals: {
      included: true,
      count: 0,
      type: "All Meals",
      description: ""
    },
    accommodation: {
      included: true,
      type: "",
      description: "",
      nights: 0
    },
    groupSize: {
      min: 2,
      max: 20
    },
    languages: []
  });

  const tourTypes = ["Cultural", "Adventure", "Nature", "Historical", "Wellness", "Wildlife", "Beach", "City"];
  const tourDifficulties = ["Easy", "Moderate", "Challenging"];
  const tourStatuses = ["active", "inactive", "upcoming", "draft"];
  const tourCategories = ["wellness", "medical", "corporate", "special"];
  const transportTypes = ["Bus", "Van", "Car", "Train", "Ship", "Flight", "Walking", "Bicycle"];
  const mealTypes = ["All Meals", "Breakfast Only", "Half Board", "Full Board"];

  // Socket.IO event listeners
  useEffect(() => {
    if (!socket) return;

    const handleTourCreated = (data) => {
      showToast(`✨ New tour "${data.title}" created!`, 'success');
      fetchTours();
    };

    const handleTourUpdated = (data) => {
      showToast(`🔄 Tour "${data.title}" updated!`, 'info');
      fetchTours();
    };

    const handleTourDeleted = (data) => {
      showToast(`🗑️ Tour "${data.title}" deleted!`, 'warning');
      fetchTours();
    };

    socket.on('tour-created', handleTourCreated);
    socket.on('tour-updated', handleTourUpdated);
    socket.on('tour-deleted', handleTourDeleted);

    return () => {
      socket.off('tour-created', handleTourCreated);
      socket.off('tour-updated', handleTourUpdated);
      socket.off('tour-deleted', handleTourDeleted);
    };
  }, [socket, showToast]);

  useEffect(() => {
    fetchTours();
  }, [searchTerm, selectedRegion, selectedType, selectedStatus, sortBy, sortDirection, currentPage]);

  const fetchTours = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (selectedRegion !== 'all') params.append('region', selectedRegion);
      if (selectedType !== 'all') params.append('type', selectedType);
      if (selectedStatus !== 'all') params.append('status', selectedStatus);
      params.append('sortBy', sortBy);
      params.append('sortOrder', sortDirection);
      params.append('page', currentPage);
      params.append('limit', itemsPerPage);

      const response = await axios.get(`/tours?${params.toString()}`);
      
      if (response.data.success) {
        const formattedTours = response.data.tours.map(tour => ({
          ...tour,
          id: tour._id,
          price: `₵${tour.price.toLocaleString()}`
        }));
        setTours(formattedTours);
        setTotalTours(response.data.pagination?.total || 0);
        setTotalPages(response.data.pagination?.pages || 1);
      }
    } catch (err) {
      console.error("Error fetching tours:", err);
      setError(err.response?.data?.message || "Failed to load tours. Please refresh.");
      showToast("Failed to load tours", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchTours();
  };

  const handleDelete = async (tour) => {
    setSelectedTour(tour);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedTour) return;
    try {
      await axios.delete(`/tours/${selectedTour._id}`);
      showToast(`"${selectedTour.title}" deleted successfully`, "success");
      setShowDeleteModal(false);
      setSelectedTour(null);
      fetchTours();
    } catch (err) {
      console.error("Error deleting tour:", err);
      showToast("Failed to delete tour", "error");
    }
  };

  const handleEdit = (tour) => {
    setEditingTour(tour);
    setFormData({
      title: tour.title || "",
      location: tour.location || "",
      region: tour.region || "greater-accra",
      type: tour.type || "Cultural",
      difficulty: tour.difficulty || "Moderate",
      price: tour.price || "",
      duration: tour.duration || "",
      rating: tour.rating || 5,
      reviews: tour.reviews || 0,
      description: tour.description || "",
      longDescription: tour.longDescription || "",
      includes: tour.includes || [],
      excludes: tour.excludes || [],
      amenities: tour.amenities || [],
      images: tour.images || [],
      itinerary: tour.itinerary || [{ day: 1, title: "", activities: [] }],
      availableDates: tour.availableDates || [],
      maxGroup: tour.maxGroup || 20,
      minGroup: tour.minGroup || 2,
      badge: tour.badge || "",
      status: tour.status || "active",
      category: tour.category || "wellness",
      guide: tour.guide || { name: "", bio: "", experience: 0, languages: [], avatar: "", phone: "", email: "", rating: 0 },
      transport: tour.transport || { type: "Bus", description: "", included: true, details: "" },
      entryFees: tour.entryFees || { included: true, amount: 0, description: "", sites: [] },
      meals: tour.meals || { included: true, count: 0, type: "All Meals", description: "" },
      accommodation: tour.accommodation || { included: true, type: "", description: "", nights: 0 },
      groupSize: tour.groupSize || { min: 2, max: 20 },
      languages: tour.languages || []
    });
    setImageInputValue("");
    setActiveSection("basic");
    setShowEditModal(true);
  };

  const handleAddNew = () => {
    setEditingTour(null);
    setFormData({
      title: "",
      location: "",
      region: "greater-accra",
      type: "Cultural",
      difficulty: "Moderate",
      price: "",
      duration: "",
      rating: 5,
      reviews: 0,
      description: "",
      longDescription: "",
      includes: [],
      excludes: [],
      amenities: [],
      images: [],
      itinerary: [{ day: 1, title: "", activities: [] }],
      availableDates: [],
      maxGroup: 20,
      minGroup: 2,
      badge: "",
      status: "active",
      category: "wellness",
      guide: { name: "", bio: "", experience: 0, languages: [], avatar: "", phone: "", email: "", rating: 0 },
      transport: { type: "Bus", description: "", included: true, details: "" },
      entryFees: { included: true, amount: 0, description: "", sites: [] },
      meals: { included: true, count: 0, type: "All Meals", description: "" },
      accommodation: { included: true, type: "", description: "", nights: 0 },
      groupSize: { min: 2, max: 20 },
      languages: []
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
    showToast("Main banner image updated", "success");
  };

  // Itinerary functions
  const addItineraryDay = () => {
    const newDay = {
      day: formData.itinerary.length + 1,
      title: "",
      activities: []
    };
    setFormData({ ...formData, itinerary: [...formData.itinerary, newDay] });
  };

  const removeItineraryDay = (index) => {
    if (formData.itinerary.length <= 1) {
      showToast("You must have at least one day", "error");
      return;
    }
    const updated = formData.itinerary.filter((_, i) => i !== index);
    const renumbered = updated.map((day, i) => ({ ...day, day: i + 1 }));
    setFormData({ ...formData, itinerary: renumbered });
  };

  const updateItineraryDay = (index, field, value) => {
    const updated = [...formData.itinerary];
    updated[index] = { ...updated[index], [field]: value };
    setFormData({ ...formData, itinerary: updated });
  };

  const addItineraryActivity = (index, activity) => {
    if (!activity.trim()) return;
    const updated = [...formData.itinerary];
    updated[index].activities = [...updated[index].activities, activity.trim()];
    setFormData({ ...formData, itinerary: updated });
  };

  const removeItineraryActivity = (dayIndex, activityIndex) => {
    const updated = [...formData.itinerary];
    updated[dayIndex].activities = updated[dayIndex].activities.filter((_, i) => i !== activityIndex);
    setFormData({ ...formData, itinerary: updated });
  };

  const handleSaveTour = async (e) => {
    e.preventDefault();
    try {
      const tourData = {
        ...formData,
        price: parseFloat(formData.price) || 0,
        rating: parseFloat(formData.rating) || 0,
        reviews: parseInt(formData.reviews) || 0,
        maxGroup: parseInt(formData.maxGroup) || 20,
        minGroup: parseInt(formData.minGroup) || 2,
        images: formData.images.length ? formData.images : ["https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=800&q=80"],
        guide: {
          ...formData.guide,
          experience: parseInt(formData.guide.experience) || 0,
          rating: parseFloat(formData.guide.rating) || 0,
          languages: formData.guide.languages || []
        },
        entryFees: {
          ...formData.entryFees,
          amount: parseFloat(formData.entryFees.amount) || 0,
          sites: formData.entryFees.sites || []
        },
        meals: {
          ...formData.meals,
          count: parseInt(formData.meals.count) || 0
        },
        accommodation: {
          ...formData.accommodation,
          nights: parseInt(formData.accommodation.nights) || 0
        },
        groupSize: {
          min: parseInt(formData.groupSize.min) || 2,
          max: parseInt(formData.groupSize.max) || 20
        },
        itinerary: formData.itinerary.map(day => ({
          ...day,
          activities: day.activities.filter(a => a.trim())
        }))
      };

      if (editingTour) {
        await axios.put(`/tours/${editingTour._id}`, tourData);
        showToast(`"${formData.title}" updated successfully`, "success");
      } else {
        await axios.post("/tours", tourData);
        showToast(`"${formData.title}" created successfully`, "success");
      }
      setShowAddModal(false);
      setShowEditModal(false);
      fetchTours();
    } catch (err) {
      console.error("Error saving tour:", err);
      showToast(err.response?.data?.message || "Failed to save tour", "error");
    }
  };

  const getTypeIcon = (type) => {
    const iconMap = {
      'Cultural': Compass,
      'Adventure': Mountain,
      'Nature': Leaf,
      'Historical': Clock,
      'Wellness': Heart,
      'Wildlife': TreePine,
      'Beach': Waves,
      'City': Building2
    };
    return iconMap[type] || Plane;
  };

  const getDifficultyColor = (difficulty) => {
    switch(difficulty) {
      case 'Easy': return 'bg-green-500/20 text-green-500';
      case 'Moderate': return 'bg-yellow-500/20 text-yellow-500';
      case 'Challenging': return 'bg-red-500/20 text-red-500';
      default: return 'bg-gray-500/20 text-gray-500';
    }
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

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedRegion("all");
    setSelectedType("all");
    setSelectedStatus("all");
    setSortBy("createdAt");
    setSortDirection("desc");
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-10 w-10 text-amber-500 animate-spin mb-4" />
        <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Loading tours...</p>
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
          Failed to load tours
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
            <Plane className="h-6 w-6 text-amber-500" />
            Tours Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage all tour packages • {totalTours} tours found
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
            Add Tour
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search tours..."
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
            <option value="title">Title</option>
            <option value="price">Price</option>
            <option value="rating">Rating</option>
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
                Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl outline-none text-sm ${
                  isDark 
                    ? 'bg-gray-700 text-white border-gray-600' 
                    : 'bg-white text-gray-800 border-gray-200'
                } border focus:border-amber-500 transition-colors`}
              >
                <option value="all">All Types</option>
                {tourTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
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
                {tourStatuses.map(status => (
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

      {/* Tours Grid/List - Same as original */}
      {tours.length === 0 ? (
        <div className={`p-12 rounded-2xl text-center border border-dashed ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
          <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-10 w-10 text-amber-400" />
          </div>
          <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            No tours found
          </h3>
          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
            Try adjusting your filters or create a new tour
          </p>
          <button
            onClick={handleAddNew}
            className="mt-4 px-6 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 transition-all flex items-center gap-2 mx-auto"
          >
            <Plus className="h-4 w-4" />
            Add Tour
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {tours.map((tour) => {
            const Icon = getTypeIcon(tour.type);
            return (
              <div
                key={tour._id}
                className={`group rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
                  isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white shadow-lg hover:shadow-2xl'
                }`}
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <img 
                    src={tour.images?.[0] || 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=800&q=80'} 
                    alt={tour.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                      {tour.type}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(tour.difficulty)}`}>
                      {tour.difficulty}
                    </span>
                  </div>
                  <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(tour.status)}`}>
                    {getStatusLabel(tour.status)}
                  </div>
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
                    <div className="flex items-center space-x-1 text-white bg-black/50 px-3 py-1 rounded-full">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                      <span className="text-sm font-medium">{tour.rating || 0}</span>
                      <span className="text-xs text-gray-300">({tour.reviews || 0})</span>
                    </div>
                    <span className="text-white bg-black/50 px-3 py-1 rounded-full text-sm font-bold">
                      {tour.price || '₵0'}
                    </span>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className={`font-bold text-base ${isDark ? 'text-white' : 'text-gray-800'} truncate`}>
                    {tour.title}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500 mt-1">
                    <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span className="truncate">{tour.location}</span>
                    <span className="mx-2">•</span>
                    <Clock className="w-4 h-4 mr-1 flex-shrink-0" />
                    <span>{tour.duration}</span>
                  </div>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(tour.includes || []).slice(0, 2).map((item, i) => (
                      <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${
                        isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}>
                        ✓ {item}
                      </span>
                    ))}
                    {(tour.includes || []).length > 2 && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}>
                        +{(tour.includes || []).length - 2}
                      </span>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200/20 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Icon className={`w-4 h-4 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {tour.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getDifficultyColor(tour.difficulty)}`}>
                        {tour.difficulty}
                      </span>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-end gap-2">
                    <Link to={`/tour/${tour._id}`} target="_blank">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 hover:text-amber-500">
                        <Eye className="h-4 w-4" />
                      </button>
                    </Link>
                    <button 
                      onClick={() => handleEdit(tour)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 hover:text-green-500"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(tour)}
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
          {tours.map((tour) => (
            <div
              key={tour._id}
              className={`flex flex-col md:flex-row rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.01] ${
                isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white shadow-lg hover:shadow-2xl'
              }`}
            >
              <div className="relative w-full md:w-48 h-40 md:h-auto flex-shrink-0">
                <img 
                  src={tour.images?.[0] || 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=800&q=80'} 
                  alt={tour.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                  <span className="bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    {tour.type}
                  </span>
                </div>
                <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(tour.status)}`}>
                  {getStatusLabel(tour.status)}
                </div>
              </div>
              <div className="flex-1 p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`font-bold text-lg ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {tour.title}
                      </h3>
                      <div className="flex items-center text-sm text-gray-500 mt-1 flex-wrap">
                        <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span>{tour.location}</span>
                        <span className="mx-2">•</span>
                        <Clock className="w-4 h-4 mr-1 flex-shrink-0" />
                        <span>{tour.duration}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-amber-500">{tour.price || '₵0'}</div>
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        per person
                      </div>
                    </div>
                  </div>
                  <p className={`text-sm mt-2 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    {tour.description}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(tour.includes || []).slice(0, 4).map((item, i) => (
                      <span key={i} className={`text-xs px-2 py-0.5 rounded-full ${
                        isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}>
                        ✓ {item}
                      </span>
                    ))}
                    {(tour.includes || []).length > 4 && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                      }`}>
                        +{(tour.includes || []).length - 4}
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-gray-200/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-amber-400">
                      <Star className="w-4 h-4 fill-current" />
                      <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {tour.rating || 0}
                      </span>
                      <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        ({tour.reviews || 0} reviews)
                      </span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor(tour.difficulty)}`}>
                      {tour.difficulty}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/tour/${tour._id}`} target="_blank">
                      <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 hover:text-amber-500">
                        <Eye className="h-4 w-4" />
                      </button>
                    </Link>
                    <button 
                      onClick={() => handleEdit(tour)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 hover:text-green-500"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(tour)}
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
            <ChevronDown className="w-5 h-5 rotate-90" />
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
            <ChevronDown className="w-5 h-5 -rotate-90" />
          </button>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2">
            <Plane className="h-4 w-4 text-amber-500" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Tours</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalTours}</p>
        </div>
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Active</span>
          </div>
          <p className="text-2xl font-bold text-green-500">{tours.filter(t => t.status === 'active').length}</p>
        </div>
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-blue-500" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Upcoming</span>
          </div>
          <p className="text-2xl font-bold text-blue-500">{tours.filter(t => t.status === 'upcoming').length}</p>
        </div>
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-500" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Avg Rating</span>
          </div>
          <p className="text-2xl font-bold text-purple-500">
            {(tours.reduce((acc, t) => acc + (t.rating || 0), 0) / (tours.length || 1)).toFixed(1)} ★
          </p>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedTour && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className={`max-w-md w-full mx-4 p-6 rounded-2xl ${isDark ? 'bg-gray-900' : 'bg-white'} shadow-2xl`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Delete Tour
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  This action cannot be undone
                </p>
              </div>
            </div>
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              Are you sure you want to delete <strong>"{selectedTour.title}"</strong>?
            </p>
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedTour(null);
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

      {/* Add/Edit Modal - Same as original with all sections */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={`max-w-5xl w-full max-h-[90vh] overflow-y-auto p-6 rounded-2xl ${isDark ? 'bg-gray-900' : 'bg-white'} shadow-2xl`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {editingTour ? 'Edit Tour' : 'Add New Tour'}
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
                { id: 'itinerary', label: 'Itinerary', icon: Calendar },
                { id: 'guide', label: 'Guide', icon: User },
                { id: 'transport', label: 'Transport', icon: Bus },
                { id: 'fees', label: 'Entry Fees', icon: DollarSign },
                { id: 'meals', label: 'Meals', icon: Utensils },
                { id: 'accommodation', label: 'Accommodation', icon: Hotel },
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

            <form onSubmit={handleSaveTour} className="space-y-4">
              {/* BASIC INFO SECTION */}
              {activeSection === 'basic' && (
                <>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Title *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                          isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
                        } border focus:border-amber-500 transition-colors`}
                        placeholder="Executive Wellness Retreat"
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
                        Type
                      </label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value})}
                        className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                          isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
                        } border focus:border-amber-500 transition-colors`}
                      >
                        {tourTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Difficulty
                      </label>
                      <select
                        value={formData.difficulty}
                        onChange={(e) => setFormData({...formData, difficulty: e.target.value})}
                        className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                          isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
                        } border focus:border-amber-500 transition-colors`}
                      >
                        {tourDifficulties.map(diff => (
                          <option key={diff} value={diff}>{diff}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Price (₵) *
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
                        placeholder="2499"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Duration *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.duration}
                        onChange={(e) => setFormData({...formData, duration: e.target.value})}
                        className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                          isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
                        } border focus:border-amber-500 transition-colors`}
                        placeholder="5 Days, 4 Nights"
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
                        {tourStatuses.map(status => (
                          <option key={status} value={status}>{getStatusLabel(status)}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Short Description *
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                        isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
                      } border focus:border-amber-500 transition-colors resize-none`}
                      placeholder="Brief description of the tour..."
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Long Description
                    </label>
                    <textarea
                      rows={4}
                      value={formData.longDescription}
                      onChange={(e) => setFormData({...formData, longDescription: e.target.value})}
                      className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                        isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
                      } border focus:border-amber-500 transition-colors resize-none`}
                      placeholder="Detailed description of the tour experience..."
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
                </>
              )}

              {/* DETAILS SECTION */}
              {activeSection === 'details' && (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Includes (comma separated)
                      </label>
                      <input
                        type="text"
                        value={formData.includes.join(', ')}
                        onChange={(e) => setFormData({...formData, includes: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                        className={`w-full px-4 py-2.5 rounded-xl outline-none ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'} border focus:border-amber-500 transition-colors`}
                        placeholder="Health Screening, Spa Treatments, Wellness Coach"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Excludes (comma separated)
                      </label>
                      <input
                        type="text"
                        value={formData.excludes.join(', ')}
                        onChange={(e) => setFormData({...formData, excludes: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                        className={`w-full px-4 py-2.5 rounded-xl outline-none ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'} border focus:border-amber-500 transition-colors`}
                        placeholder="Flights, Insurance, Personal Expenses"
                      />
                    </div>
                  </div>

                  {/* Amenities */}
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Amenities (Select from dropdown)
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

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Languages Available (comma separated)
                    </label>
                    <input
                      type="text"
                      value={formData.languages.join(', ')}
                      onChange={(e) => setFormData({...formData, languages: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                      className={`w-full px-4 py-2.5 rounded-xl outline-none ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'} border focus:border-amber-500 transition-colors`}
                      placeholder="English, French, Twi"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Max Group Size
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.maxGroup}
                        onChange={(e) => setFormData({...formData, maxGroup: parseInt(e.target.value)})}
                        className={`w-full px-4 py-2.5 rounded-xl outline-none ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'} border focus:border-amber-500 transition-colors`}
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Min Group Size
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.minGroup}
                        onChange={(e) => setFormData({...formData, minGroup: parseInt(e.target.value)})}
                        className={`w-full px-4 py-2.5 rounded-xl outline-none ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'} border focus:border-amber-500 transition-colors`}
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Badge (e.g., "Most Popular", "Best Seller")
                    </label>
                    <input
                      type="text"
                      value={formData.badge}
                      onChange={(e) => setFormData({...formData, badge: e.target.value})}
                      className={`w-full px-4 py-2.5 rounded-xl outline-none ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'} border focus:border-amber-500 transition-colors`}
                      placeholder="Most Popular"
                    />
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Available Dates (comma separated, YYYY-MM-DD)
                    </label>
                    <input
                      type="text"
                      value={formData.availableDates.join(', ')}
                      onChange={(e) => setFormData({...formData, availableDates: e.target.value.split(',').map(s => s.trim()).filter(Boolean)})}
                      className={`w-full px-4 py-2.5 rounded-xl outline-none ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'} border focus:border-amber-500 transition-colors`}
                      placeholder="2025-01-15, 2025-01-22, 2025-02-05"
                    />
                  </div>
                </div>
              )}

              {/* IMAGES SECTION */}
              {activeSection === 'images' && (
                <div className="space-y-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Tour Images (First image is the main banner)
                    </label>
                    
                    {/* Image Gallery Preview */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                      {formData.images.map((url, index) => (
                        <div key={index} className={`relative group rounded-xl overflow-hidden border-2 ${index === 0 ? 'border-amber-500 ring-2 ring-amber-500/30' : isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                          <img 
                            src={url} 
                            alt={`Tour image ${index + 1}`}
                            className="w-full h-32 object-cover"
                            onError={(e) => {
                              e.target.src = 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=800&q=80';
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

              {/* ITINERARY SECTION */}
              {activeSection === 'itinerary' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      Tour Itinerary
                    </h3>
                    <button
                      type="button"
                      onClick={addItineraryDay}
                      className="px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all flex items-center gap-2 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      Add Day
                    </button>
                  </div>

                  {formData.itinerary.map((day, index) => (
                    <div key={index} className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2 flex-1">
                          <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            Day {day.day}
                          </span>
                          <input
                            type="text"
                            value={day.title}
                            onChange={(e) => updateItineraryDay(index, 'title', e.target.value)}
                            placeholder="Day title..."
                            className={`flex-1 px-3 py-1 rounded-lg text-sm outline-none ${
                              isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-200'
                            } border focus:border-amber-500 transition-colors`}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeItineraryDay(index)}
                          className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-500 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-2">
                        <div className="flex gap-2">
                          <input
                            type="text"
                            placeholder="Add activity..."
                            className={`flex-1 px-3 py-2 rounded-lg text-sm outline-none ${
                              isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-200'
                            } border focus:border-amber-500 transition-colors`}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addItineraryActivity(index, e.target.value);
                                e.target.value = '';
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={(e) => {
                              const input = e.target.parentElement.querySelector('input');
                              if (input) {
                                addItineraryActivity(index, input.value);
                                input.value = '';
                              }
                            }}
                            className="px-3 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-all text-sm"
                          >
                            Add
                          </button>
                        </div>

                        <div className="space-y-1 max-h-40 overflow-y-auto">
                          {day.activities.map((activity, actIndex) => (
                            <div key={actIndex} className={`flex items-center justify-between px-3 py-1.5 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'}`}>
                              <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                                • {activity}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeItineraryActivity(index, actIndex)}
                                className="text-red-500 hover:text-red-600 transition-colors"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* GUIDE SECTION - FIXED */}
              {activeSection === 'guide' && (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Guide Name
                      </label>
                      <input
                        type="text"
                        value={formData.guide.name}
                        onChange={(e) => setFormData({...formData, guide: {...formData.guide, name: e.target.value}})}
                        className={`w-full px-4 py-2.5 rounded-xl outline-none ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'} border focus:border-amber-500 transition-colors`}
                        placeholder="John Doe"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Guide Avatar URL
                      </label>
                      <input
                        type="text"
                        value={formData.guide.avatar}
                        onChange={(e) => setFormData({...formData, guide: {...formData.guide, avatar: e.target.value}})}
                        className={`w-full px-4 py-2.5 rounded-xl outline-none ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'} border focus:border-amber-500 transition-colors`}
                        placeholder="https://images.unsplash.com/..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Guide Bio
                    </label>
                    <textarea
                      rows={2}
                      value={formData.guide.bio}
                      onChange={(e) => setFormData({...formData, guide: {...formData.guide, bio: e.target.value}})}
                      className={`w-full px-4 py-2.5 rounded-xl outline-none ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'} border focus:border-amber-500 transition-colors resize-none`}
                      placeholder="Experienced guide with 10+ years in eco-tourism..."
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.guide.experience}
                        onChange={(e) => setFormData({...formData, guide: {...formData.guide, experience: parseInt(e.target.value)}})}
                        className={`w-full px-4 py-2.5 rounded-xl outline-none ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'} border focus:border-amber-500 transition-colors`}
                        placeholder="5"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Guide Rating
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={formData.guide.rating}
                        onChange={(e) => setFormData({...formData, guide: {...formData.guide, rating: parseFloat(e.target.value)}})}
                        className={`w-full px-4 py-2.5 rounded-xl outline-none ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'} border focus:border-amber-500 transition-colors`}
                        placeholder="4.8"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Guide Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.guide.phone}
                        onChange={(e) => setFormData({...formData, guide: {...formData.guide, phone: e.target.value}})}
                        className={`w-full px-4 py-2.5 rounded-xl outline-none ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'} border focus:border-amber-500 transition-colors`}
                        placeholder="+233 55 123 4567"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Guide Email
                      </label>
                      <input
                        type="email"
                        value={formData.guide.email}
                        onChange={(e) => setFormData({...formData, guide: {...formData.guide, email: e.target.value}})}
                        className={`w-full px-4 py-2.5 rounded-xl outline-none ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'} border focus:border-amber-500 transition-colors`}
                        placeholder="guide@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Guide Languages (comma separated)
                    </label>
                    <input
                      type="text"
                      value={formData.guide.languages.join(', ')}
                      onChange={(e) => setFormData({...formData, guide: {...formData.guide, languages: e.target.value.split(',').map(s => s.trim()).filter(Boolean)}})}
                      className={`w-full px-4 py-2.5 rounded-xl outline-none ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'} border focus:border-amber-500 transition-colors`}
                      placeholder="English, French, Twi"
                    />
                  </div>
                </div>
              )}

              {/* TRANSPORT SECTION */}
              {activeSection === 'transport' && (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Transport Type
                      </label>
                      <select
                        value={formData.transport.type}
                        onChange={(e) => setFormData({...formData, transport: {...formData.transport, type: e.target.value}})}
                        className={`w-full px-4 py-2.5 rounded-xl outline-none ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'} border focus:border-amber-500 transition-colors`}
                      >
                        {transportTypes.map(type => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex items-center gap-3">
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Included?
                      </label>
                      <input
                        type="checkbox"
                        checked={formData.transport.included}
                        onChange={(e) => setFormData({...formData, transport: {...formData.transport, included: e.target.checked}})}
                        className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Transport Description
                    </label>
                    <textarea
                      rows={2}
                      value={formData.transport.description}
                      onChange={(e) => setFormData({...formData, transport: {...formData.transport, description: e.target.value}})}
                      className={`w-full px-4 py-2.5 rounded-xl outline-none ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'} border focus:border-amber-500 transition-colors resize-none`}
                      placeholder="Describe the transport arrangement..."
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Transport Details
                    </label>
                    <input
                      type="text"
                      value={formData.transport.details}
                      onChange={(e) => setFormData({...formData, transport: {...formData.transport, details: e.target.value}})}
                      className={`w-full px-4 py-2.5 rounded-xl outline-none ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'} border focus:border-amber-500 transition-colors`}
                      placeholder="e.g., Air-conditioned bus, WiFi on board..."
                    />
                  </div>
                </div>
              )}

              {/* ENTRY FEES SECTION */}
              {activeSection === 'fees' && (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Included?
                      </label>
                      <input
                        type="checkbox"
                        checked={formData.entryFees.included}
                        onChange={(e) => setFormData({...formData, entryFees: {...formData.entryFees, included: e.target.checked}})}
                        className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Fee Amount (₵)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.entryFees.amount}
                        onChange={(e) => setFormData({...formData, entryFees: {...formData.entryFees, amount: parseFloat(e.target.value)}})}
                        className={`w-full px-4 py-2.5 rounded-xl outline-none ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'} border focus:border-amber-500 transition-colors`}
                        placeholder="50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Fee Description
                    </label>
                    <textarea
                      rows={2}
                      value={formData.entryFees.description}
                      onChange={(e) => setFormData({...formData, entryFees: {...formData.entryFees, description: e.target.value}})}
                      className={`w-full px-4 py-2.5 rounded-xl outline-none ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'} border focus:border-amber-500 transition-colors resize-none`}
                      placeholder="Describe what the entry fees cover..."
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Sites (comma separated)
                    </label>
                    <input
                      type="text"
                      value={formData.entryFees.sites.join(', ')}
                      onChange={(e) => setFormData({...formData, entryFees: {...formData.entryFees, sites: e.target.value.split(',').map(s => s.trim()).filter(Boolean)}})}
                      className={`w-full px-4 py-2.5 rounded-xl outline-none ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'} border focus:border-amber-500 transition-colors`}
                      placeholder="Kakum National Park, Elmina Castle"
                    />
                  </div>
                </div>
              )}

              {/* MEALS SECTION */}
              {activeSection === 'meals' && (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Included?
                      </label>
                      <input
                        type="checkbox"
                        checked={formData.meals.included}
                        onChange={(e) => setFormData({...formData, meals: {...formData.meals, included: e.target.checked}})}
                        className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Number of Meals
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.meals.count}
                        onChange={(e) => setFormData({...formData, meals: {...formData.meals, count: parseInt(e.target.value)}})}
                        className={`w-full px-4 py-2.5 rounded-xl outline-none ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'} border focus:border-amber-500 transition-colors`}
                        placeholder="3"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Meal Type
                    </label>
                    <select
                      value={formData.meals.type}
                      onChange={(e) => setFormData({...formData, meals: {...formData.meals, type: e.target.value}})}
                      className={`w-full px-4 py-2.5 rounded-xl outline-none ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'} border focus:border-amber-500 transition-colors`}
                    >
                      {mealTypes.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Meal Description
                    </label>
                    <textarea
                      rows={2}
                      value={formData.meals.description}
                      onChange={(e) => setFormData({...formData, meals: {...formData.meals, description: e.target.value}})}
                      className={`w-full px-4 py-2.5 rounded-xl outline-none ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'} border focus:border-amber-500 transition-colors resize-none`}
                      placeholder="Describe the meal arrangements..."
                    />
                  </div>
                </div>
              )}

              {/* ACCOMMODATION SECTION */}
              {activeSection === 'accommodation' && (
                <div className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-3">
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Included?
                      </label>
                      <input
                        type="checkbox"
                        checked={formData.accommodation.included}
                        onChange={(e) => setFormData({...formData, accommodation: {...formData.accommodation, included: e.target.checked}})}
                        className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500"
                      />
                    </div>
                    <div>
                      <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        Number of Nights
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.accommodation.nights}
                        onChange={(e) => setFormData({...formData, accommodation: {...formData.accommodation, nights: parseInt(e.target.value)}})}
                        className={`w-full px-4 py-2.5 rounded-xl outline-none ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'} border focus:border-amber-500 transition-colors`}
                        placeholder="3"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Accommodation Type
                    </label>
                    <input
                      type="text"
                      value={formData.accommodation.type}
                      onChange={(e) => setFormData({...formData, accommodation: {...formData.accommodation, type: e.target.value}})}
                      className={`w-full px-4 py-2.5 rounded-xl outline-none ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'} border focus:border-amber-500 transition-colors`}
                      placeholder="Hotel, Guest House, Camping, etc."
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Accommodation Description
                    </label>
                    <textarea
                      rows={2}
                      value={formData.accommodation.description}
                      onChange={(e) => setFormData({...formData, accommodation: {...formData.accommodation, description: e.target.value}})}
                      className={`w-full px-4 py-2.5 rounded-xl outline-none ${isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'} border focus:border-amber-500 transition-colors resize-none`}
                      placeholder="Describe the accommodation arrangements..."
                    />
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
                  {editingTour ? 'Update Tour' : 'Create Tour'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTours;
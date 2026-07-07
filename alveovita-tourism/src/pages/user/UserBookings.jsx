// pages/user/UserBookings.jsx
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../hooks/useToast";
import {
  Plane,
  Hotel,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  Eye,
  Search,
  Filter,
  ArrowRight,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Heart,
  Star,
  Building2,
  Users,
  Bed,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  CreditCard,
  Receipt,
  Download,
  Printer,
  Share2,
  Info,
  ChevronLeft,
  ChevronRight,
  Menu,
  Grid,
  List,
  LayoutGrid,
  LayoutList,
  Filter as FilterIcon,
  SortAsc,
  SortDesc,
  CalendarDays,
  Clock4,
  CircleCheck,
  CircleX,
  CircleAlert,
  RefreshCw,
  ExternalLink,
  Phone,
  Mail,
  User as UserIcon,
  Briefcase,
  Tag,
  ReceiptText,
  Banknote,
  Wallet,
  Landmark,
  Building,
  House,
  Tent,
  Castle,
  TreePine,
  Waves,
  Mountain,
  Compass,
  Sparkles,
  Crown,
  Gem,
  Rocket,
  Zap,
  Gift,
  Award,
  Shield,
  Star as StarIcon,
  Clock as TimerIcon,
  Trash2
} from "lucide-react";

const UserBookings = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    totalSpent: 0
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/bookings/mine");
      
      if (response.data.success) {
        const bookingsData = response.data.bookings || [];
        setBookings(bookingsData);
        
        const statsData = {
          total: bookingsData.length,
          pending: bookingsData.filter(b => b.status === "pending").length,
          confirmed: bookingsData.filter(b => b.status === "confirmed").length,
          completed: bookingsData.filter(b => b.status === "completed").length,
          cancelled: bookingsData.filter(b => b.status === "cancelled").length,
          totalSpent: bookingsData
            .filter(b => b.status === "confirmed" || b.status === "completed")
            .reduce((sum, b) => sum + (b.totalAmount || 0), 0)
        };
        setStats(statsData);
        
        if (bookingsData.length > 0) {
          showToast(`✅ ${bookingsData.length} bookings loaded successfully`, "success");
        }
      }
    } catch (error) {
      console.error("Error fetching bookings:", error);
      showToast("Failed to load bookings", "error");
    } finally {
      setLoading(false);
    }
  };

  // In UserBookings.jsx - Replace the deleteBooking function

const deleteBooking = async (id) => {
  try {
    // Use soft-delete endpoint
    await axios.delete(`/bookings/${id}/soft-delete`);
    setBookings(bookings.filter(b => b._id !== id));
    showToast("Booking deleted successfully", "success");
    setShowDeleteModal(null);
    setShowDetailsModal(false);
    
    // Update stats
    const updatedStats = {
      total: bookings.length - 1,
      pending: bookings.filter(b => b.status === "pending" && b._id !== id).length,
      confirmed: bookings.filter(b => b.status === "confirmed" && b._id !== id).length,
      completed: bookings.filter(b => b.status === "completed" && b._id !== id).length,
      cancelled: bookings.filter(b => b.status === "cancelled" && b._id !== id).length,
      totalSpent: bookings
        .filter(b => (b.status === "confirmed" || b.status === "completed") && b._id !== id)
        .reduce((sum, b) => sum + (b.totalAmount || 0), 0)
    };
    setStats(updatedStats);
  } catch (error) {
    console.error("Error deleting booking:", error);
    showToast("Failed to delete booking", "error");
  }
};

  const getStatusConfig = (status) => {
    const configs = {
      pending: {
        color: "bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-400",
        borderColor: "border-yellow-300 dark:border-yellow-700",
        icon: <Clock className="h-4 w-4" />,
        label: "Pending",
        badgeColor: "from-yellow-500 to-orange-500"
      },
      confirmed: {
        color: "bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400",
        borderColor: "border-green-300 dark:border-green-700",
        icon: <CheckCircle className="h-4 w-4" />,
        label: "Confirmed",
        badgeColor: "from-green-500 to-emerald-500"
      },
      completed: {
        color: "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400",
        borderColor: "border-blue-300 dark:border-blue-700",
        icon: <CircleCheck className="h-4 w-4" />,
        label: "Completed",
        badgeColor: "from-blue-500 to-cyan-500"
      },
      cancelled: {
        color: "bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400",
        borderColor: "border-red-300 dark:border-red-700",
        icon: <XCircle className="h-4 w-4" />,
        label: "Cancelled",
        badgeColor: "from-red-500 to-rose-500"
      }
    };
    return configs[status] || configs.pending;
  };

  const getTypeConfig = (type) => {
    return {
      tour: {
        icon: <Plane className="h-6 w-6" />,
        color: "bg-green-100 dark:bg-green-950/30 text-green-600",
        label: "Tour"
      },
      hotel: {
        icon: <Hotel className="h-6 w-6" />,
        color: "bg-yellow-100 dark:bg-yellow-950/30 text-yellow-600",
        label: "Hotel"
      }
    }[type] || { icon: <Building2 className="h-6 w-6" />, color: "bg-gray-100 dark:bg-gray-800 text-gray-600", label: "Booking" };
  };

  // In both AdminBookings.jsx and UserBookings.jsx

const getDestinationDisplay = (booking) => {
  // Use the booking's own destination field
  if (booking.destination) return booking.destination;
  
  // Try to get from tourId or hotelId if populated
  if (booking.tourId?.location) return booking.tourId.location;
  if (booking.hotelId?.location) return booking.hotelId.location;
  
  // Fallback
  return "—";
};
  const filteredBookings = bookings
    .filter(booking => {
      const searchLower = searchTerm.toLowerCase();
      const destinationDisplay = getDestinationDisplay(booking).toLowerCase();
      const matchesSearch = 
        booking.customerName?.toLowerCase().includes(searchLower) ||
        destinationDisplay.includes(searchLower) ||
        booking.tourTitle?.toLowerCase().includes(searchLower) ||
        booking.hotelName?.toLowerCase().includes(searchLower) ||
        booking._id?.toLowerCase().includes(searchLower);
      const matchesStatus = filterStatus === "all" || booking.status === filterStatus;
      const matchesType = filterType === "all" || booking.type === filterType;
      return matchesSearch && matchesStatus && matchesType;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt) - new Date(a.createdAt);
        case "oldest":
          return new Date(a.createdAt) - new Date(b.createdAt);
        case "highest":
          return (b.totalAmount || 0) - (a.totalAmount || 0);
        case "lowest":
          return (a.totalAmount || 0) - (b.totalAmount || 0);
        default:
          return 0;
      }
    });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-amber-500 animate-spin mx-auto mb-4" />
          <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Loading your bookings...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className={`text-3xl md:text-4xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            My Bookings
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            View and manage all your tour and hotel bookings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchBookings}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              isDark 
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <Link
            to="/tours"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:scale-105 transition-all"
          >
            <Plane className="h-4 w-4" />
            <span>Book New</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Calendar className="h-4 w-4 text-blue-500" />
            </div>
          </div>
          <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            {stats.total}
          </p>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Pending</span>
            <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Clock className="h-4 w-4 text-yellow-500" />
            </div>
          </div>
          <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            {stats.pending}
          </p>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Confirmed</span>
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
          </div>
          <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            {stats.confirmed}
          </p>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Completed</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <CircleCheck className="h-4 w-4 text-blue-500" />
            </div>
          </div>
          <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            {stats.completed}
          </p>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Cancelled</span>
            <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center">
              <XCircle className="h-4 w-4 text-red-500" />
            </div>
          </div>
          <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            {stats.cancelled}
          </p>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Spent</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-purple-500" />
            </div>
          </div>
          <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            ₵{stats.totalSpent.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search bookings by name, destination, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 rounded-xl border ${
              isDark 
                ? 'bg-gray-800 border-gray-700 text-gray-100' 
                : 'bg-white border-gray-200 text-gray-900'
            } focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all`}
          />
        </div>
        
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`px-4 py-2.5 rounded-xl border ${
              isDark 
                ? 'bg-gray-800 border-gray-700 text-gray-100' 
                : 'bg-white border-gray-200 text-gray-900'
            } focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all`}
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

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
            <option value="tour">Tours</option>
            <option value="hotel">Hotels</option>
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
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Price</option>
            <option value="lowest">Lowest Price</option>
          </select>

          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${
                viewMode === "grid" 
                  ? 'bg-white dark:bg-gray-700 shadow-md' 
                  : 'hover:bg-white/50 dark:hover:bg-gray-700/50'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all ${
                viewMode === "list" 
                  ? 'bg-white dark:bg-gray-700 shadow-md' 
                  : 'hover:bg-white/50 dark:hover:bg-gray-700/50'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bookings Display */}
      {filteredBookings.length === 0 ? (
        <div className={`text-center py-16 ${isDark ? 'bg-gray-800' : 'bg-white'} rounded-2xl border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-10 w-10 text-gray-400" />
          </div>
          <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            No Bookings Found
          </h3>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            {searchTerm || filterStatus !== "all" || filterType !== "all" 
              ? "No bookings match your filters. Try adjusting your search criteria." 
              : "You haven't made any bookings yet. Start exploring amazing tours and hotels!"}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              to="/tours"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl hover:scale-105 transition-all"
            >
              <Plane className="h-5 w-5" />
              Browse Tours
            </Link>
            <Link
              to="/hotels"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:scale-105 transition-all"
            >
              <Hotel className="h-5 w-5" />
              Browse Hotels
            </Link>
          </div>
        </div>
      ) : (
        <div className={viewMode === "grid" 
          ? "grid md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {filteredBookings.map((booking) => {
            const statusConfig = getStatusConfig(booking.status);
            const typeConfig = getTypeConfig(booking.type);
            const destinationDisplay = getDestinationDisplay(booking);
            
            return (
              <div
                key={booking._id}
                className={`group rounded-2xl overflow-hidden transition-all duration-300 ${
                  viewMode === "grid"
                    ? `${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg hover:shadow-2xl hover:-translate-y-1`
                    : `${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg hover:shadow-xl flex flex-col md:flex-row`
                } border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
              >
                {/* Booking Card Header */}
                <div className={`${viewMode === "grid" ? '' : 'md:w-48 md:flex-shrink-0'} ${
                  isDark ? 'bg-gray-800' : 'bg-gray-50'
                } p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-100'} md:border-b-0 md:border-r`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${typeConfig.color}`}>
                      {typeConfig.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${typeConfig.color}`}>
                          {typeConfig.label}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${statusConfig.color}`}>
                          {statusConfig.label}
                        </span>
                      </div>
                      <p className={`text-sm font-medium truncate mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {booking.tourTitle || booking.hotelName || destinationDisplay || "Booking"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Booking Card Body */}
                <div className={`flex-1 p-4 ${viewMode === "grid" ? '' : 'flex flex-col md:flex-row md:items-center md:justify-between'}`}>
                  <div className={`space-y-2 ${viewMode === "grid" ? '' : 'flex-1'}`}>
                    <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 flex-wrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5" />
                        {destinationDisplay}
                      </span>
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="h-3.5 w-3.5" />
                        {new Date(booking.date).toLocaleDateString()}
                      </span>
                      {booking.nights > 0 && (
                        <span className="flex items-center gap-1">
                          <Bed className="h-3.5 w-3.5" />
                          {booking.nights} night{booking.nights > 1 ? 's' : ''}
                        </span>
                      )}
                      {booking.guests > 0 && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3.5 w-3.5" />
                          {booking.guests} guest{booking.guests > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1 text-amber-500 font-bold">
                        <DollarSign className="h-4 w-4" />
                        ₵{booking.totalAmount?.toLocaleString() || 0}
                      </span>
                      <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  <div className={`flex items-center gap-2 mt-3 ${viewMode === "grid" ? '' : 'md:mt-0 md:ml-4'} flex-wrap`}>
                    <button
                      onClick={() => {
                        setSelectedBooking(booking);
                        setShowDetailsModal(true);
                      }}
                      className={`p-2 rounded-xl transition-all ${
                        isDark 
                          ? 'hover:bg-gray-700 text-gray-400 hover:text-amber-400' 
                          : 'hover:bg-gray-100 text-gray-500 hover:text-amber-500'
                      }`}
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        const url = `/booking/${booking._id}`;
                        navigator.clipboard.writeText(`${window.location.origin}${url}`);
                        showToast("Booking link copied!", "success");
                      }}
                      className={`p-2 rounded-xl transition-all ${
                        isDark 
                          ? 'hover:bg-gray-700 text-gray-400 hover:text-amber-400' 
                          : 'hover:bg-gray-100 text-gray-500 hover:text-amber-500'
                      }`}
                      title="Share"
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setShowDeleteModal(booking._id)}
                      className={`p-2 rounded-xl transition-all ${
                        isDark 
                          ? 'hover:bg-red-500/20 text-red-400 hover:text-red-300' 
                          : 'hover:bg-red-100 text-red-500 hover:text-red-600'
                      }`}
                      title="Delete Booking"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    {booking.paymentReference && (
                      <span className={`text-xs px-2 py-1 rounded-lg ${
                        isDark ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-500'
                      }`}>
                        Ref: {booking.paymentReference.slice(0, 8)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={`max-w-md w-full p-6 rounded-2xl ${isDark ? 'bg-gray-900' : 'bg-white'} shadow-2xl`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-red-500" />
              </div>
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Delete Booking
              </h3>
            </div>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Are you sure you want to delete this booking? This action cannot be undone.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setShowDeleteModal(null)}
                className={`flex-1 px-4 py-2.5 rounded-xl ${
                  isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                } transition-all`}
              >
                Cancel
              </button>
              <button
                onClick={() => deleteBooking(showDeleteModal)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`max-w-2xl w-full max-h-[90vh] overflow-y-auto rounded-2xl ${isDark ? 'bg-gray-900' : 'bg-white'} shadow-2xl`}>
            <div className={`sticky top-0 z-10 flex items-center justify-between p-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'} ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${getTypeConfig(selectedBooking.type).color}`}>
                  {getTypeConfig(selectedBooking.type).icon}
                </div>
                <div>
                  <h3 className={`font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Booking Details
                  </h3>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    #{selectedBooking._id.slice(0, 10)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowDeleteModal(selectedBooking._id)}
                  className={`p-2 rounded-full transition-all ${
                    isDark 
                      ? 'hover:bg-red-500/20 text-red-400 hover:text-red-300' 
                      : 'hover:bg-red-100 text-red-500 hover:text-red-600'
                  }`}
                  title="Delete Booking"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Status Badge */}
              <div className={`p-4 rounded-xl ${getStatusConfig(selectedBooking.status).color} border ${getStatusConfig(selectedBooking.status).borderColor}`}>
                <div className="flex items-center gap-3">
                  {getStatusConfig(selectedBooking.status).icon}
                  <div>
                    <p className="font-medium">Status: {getStatusConfig(selectedBooking.status).label}</p>
                    <p className="text-sm opacity-80">
                      {selectedBooking.status === "pending" && "Your booking is being processed"}
                      {selectedBooking.status === "confirmed" && "Your booking has been confirmed"}
                      {selectedBooking.status === "completed" && "Your booking has been completed"}
                      {selectedBooking.status === "cancelled" && "Your booking has been cancelled"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Booking Info */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <p className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Booking Details
                  </p>
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Type</span>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {getTypeConfig(selectedBooking.type).label}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Name</span>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {selectedBooking.tourTitle || selectedBooking.hotelName || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Destination</span>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {getDestinationDisplay(selectedBooking)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Date</span>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {new Date(selectedBooking.date).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <p className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Customer Info
                  </p>
                  <div className="mt-2 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Name</span>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {selectedBooking.customerName || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Email</span>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {selectedBooking.customerEmail || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Phone</span>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {selectedBooking.customerPhone || "—"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Guests</span>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {selectedBooking.guests || 1}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <p className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Payment Information
                </p>
                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Total Amount</span>
                    <span className="font-bold text-amber-500 text-lg">
                      ₵{selectedBooking.totalAmount?.toLocaleString() || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Payment Status</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      selectedBooking.paymentStatus === 'paid' 
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400'
                        : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400'
                    }`}>
                      {selectedBooking.paymentStatus || "Pending"}
                    </span>
                  </div>
                  {selectedBooking.paymentReference && (
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Reference</span>
                      <span className={`font-mono text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {selectedBooking.paymentReference}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Special Requests */}
              {selectedBooking.specialRequests && (
                <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <p className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Special Requests
                  </p>
                  <p className={`mt-1 text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {selectedBooking.specialRequests}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200/20">
                {selectedBooking.status === "pending" && (
                  <button
                    onClick={async () => {
                      try {
                        await axios.post(`/bookings/${selectedBooking._id}/cancel`);
                        showToast("Booking cancelled successfully", "success");
                        fetchBookings();
                        setShowDetailsModal(false);
                      } catch (error) {
                        showToast("Failed to cancel booking", "error");
                      }
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all"
                  >
                    Cancel Booking
                  </button>
                )}
                <button
                  onClick={() => window.print()}
                  className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                    isDark 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Printer className="h-4 w-4" />
                  Print
                </button>
                <button
                  onClick={() => {
                    const url = `/booking/${selectedBooking._id}`;
                    navigator.clipboard.writeText(`${window.location.origin}${url}`);
                    showToast("Booking link copied!", "success");
                  }}
                  className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                    isDark 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <Share2 className="h-4 w-4" />
                  Share
                </button>
                <button
                  onClick={() => setShowDeleteModal(selectedBooking._id)}
                  className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 ${
                    isDark 
                      ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                      : 'bg-red-50 text-red-500 hover:bg-red-100'
                  }`}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserBookings;
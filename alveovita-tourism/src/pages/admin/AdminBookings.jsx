// pages/admin/AdminBookings.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../../api/axios";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../hooks/useToast";
import {
  Calendar,
  Search,
  Filter,
  Loader2,
  Plane,
  Hotel,
  User,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  Clock as PendingIcon,
  ChevronDown,
  ChevronUp,
  Eye,
  RefreshCw,
  Users,
  TrendingUp,
  CreditCard,
  AlertCircle,
  FileText,
  Printer,
  Download,
  Share2,
  MoreVertical,
  Edit,
  Trash2,
  ArrowUpRight,
  ArrowDownLeft,
  PieChart,
  BarChart3,
  LayoutGrid,
  LayoutList,
  Filter as FilterIcon,
  SortAsc,
  SortDesc,
  CalendarDays,
  Receipt,
  Building2,
  Briefcase,
  Tag,
  Wallet,
  Landmark,
  Banknote,
  CircleDollarSign,
  Award,
  Shield,
  Star,
  Crown,
  Gem,
  Sparkles,
  Zap,
  Rocket,
  Gift,
  Heart,
  ThumbsUp,
  MessageCircle,
  Phone,
  Mail,
  Globe,
  ExternalLink,
  Clock as TimerIcon,
  CircleCheck as CheckIcon,
  CircleX as XIcon,
  CircleAlert as AlertIcon,
  Info,
  Settings,
  DownloadCloud,
  FileBarChart,
  TrendingUp as TrendingUpIcon,
  Flag,
  CheckCheck,
  RotateCcw,
  Trash2 as TrashIcon,
  EyeOff,
  Eye as EyeIcon,
  RotateCcw as RestoreIcon
} from "lucide-react";

const AdminBookings = () => {
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("list");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(null);
  const [showAdminDeleteModal, setShowAdminDeleteModal] = useState(null);
  const [deleteOptions, setDeleteOptions] = useState({
    permanent: false,
    hideFrom: 'all'
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    totalRevenue: 0,
    tourBookings: 0,
    hotelBookings: 0,
    todayBookings: 0,
    thisWeek: 0,
    thisMonth: 0
  });

  useEffect(() => {
    fetchBookings();
    fetchStats();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching admin bookings...');
      
      const response = await axios.get("/bookings/admin");
      
      console.log('📊 Admin bookings response:', response.data);
      
      if (response.data.success) {
        setBookings(response.data.bookings || []);
        showToast(`✅ ${response.data.bookings?.length || 0} bookings loaded`, "success");
      } else {
        showToast("Failed to fetch bookings", "error");
      }
    } catch (error) {
      console.error("❌ Error fetching bookings:", error);
      console.error("Error details:", error.response?.data || error.message);
      showToast(error.response?.data?.message || "Failed to fetch bookings", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      console.log('🔍 Fetching admin stats...');
      const response = await axios.get("/bookings/admin/stats");
      
      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error("❌ Error fetching stats:", error);
    }
  };

  const updateBookingStatus = async (id, status) => {
    try {
      await axios.patch(`/bookings/${id}/status`, { status });
      setBookings(bookings.map(b => 
        b._id === id ? { ...b, status } : b
      ));
      showToast(`Booking ${status} successfully`, "success");
      fetchStats();
      setShowConfirmModal(null);
    } catch (error) {
      console.error("Error updating booking:", error);
      showToast("Failed to update booking", "error");
    }
  };

  const completeBooking = async (id) => {
    try {
      await axios.patch(`/bookings/${id}/complete`);
      setBookings(bookings.map(b => 
        b._id === id ? { ...b, status: 'completed', completedAt: new Date() } : b
      ));
      showToast("Booking marked as completed", "success");
      fetchStats();
    } catch (error) {
      console.error("Error completing booking:", error);
      showToast("Failed to complete booking", "error");
    }
  };

  const deleteBooking = async (id) => {
    try {
      await axios.delete(`/bookings/${id}`);
      setBookings(bookings.filter(b => b._id !== id));
      showToast("Booking deleted successfully", "success");
      fetchStats();
      setShowDeleteModal(null);
      setShowDetailsModal(false);
    } catch (error) {
      console.error("Error deleting booking:", error);
      showToast("Failed to delete booking", "error");
    }
  };

  const handleAdminDelete = async (id, options) => {
    try {
      const params = new URLSearchParams();
      params.append('permanent', options.permanent ? 'true' : 'false');
      params.append('hideFrom', options.hideFrom || 'all');
      
      await axios.delete(`/bookings/admin/${id}?${params.toString()}`);
      setBookings(bookings.filter(b => b._id !== id));
      
      let message = '';
      if (options.permanent) {
        message = 'Booking permanently deleted';
      } else if (options.hideFrom === 'all') {
        message = 'Booking hidden from everyone';
      } else {
        message = 'Booking hidden from admin view';
      }
      
      showToast(message, "success");
      setShowAdminDeleteModal(null);
      fetchStats();
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
        icon: <PendingIcon className="h-4 w-4" />,
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
        icon: <CheckIcon className="h-4 w-4" />,
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
        icon: <Plane className="h-5 w-5" />,
        color: "bg-green-100 dark:bg-green-950/30 text-green-600",
        label: "Tour"
      },
      hotel: {
        icon: <Hotel className="h-5 w-5" />,
        color: "bg-yellow-100 dark:bg-yellow-950/30 text-yellow-600",
        label: "Hotel"
      }
    }[type] || {
      icon: <Building2 className="h-5 w-5" />,
      color: "bg-gray-100 dark:bg-gray-800 text-gray-600",
      label: "Booking"
    };
  };

  const getDestinationDisplay = (booking) => {
    if (booking.destination) return booking.destination;
    if (booking.tourId?.location) return booking.tourId.location;
    if (booking.hotelId?.location) return booking.hotelId.location;
    if (booking.tourId?.destination?.name) return booking.tourId.destination.name;
    if (booking.hotelId?.destination?.name) return booking.hotelId.destination.name;
    return "—";
  };

  const filteredBookings = bookings
    .filter(booking => {
      const searchLower = searchTerm.toLowerCase();
      const destinationDisplay = getDestinationDisplay(booking).toLowerCase();
      const matchesSearch = 
        booking.customerName?.toLowerCase().includes(searchLower) ||
        booking.customerEmail?.toLowerCase().includes(searchLower) ||
        destinationDisplay.includes(searchLower) ||
        booking.tourTitle?.toLowerCase().includes(searchLower) ||
        booking.hotelName?.toLowerCase().includes(searchLower) ||
        booking._id?.toLowerCase().includes(searchLower) ||
        booking.user?.name?.toLowerCase().includes(searchLower);
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
            Loading bookings...
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
            Bookings Management
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Manage all customer tour and hotel bookings
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { fetchBookings(); fetchStats(); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              isDark 
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => {
              const headers = ["ID", "Customer", "Email", "Type", "Destination", "Date", "Amount", "Status", "Created"];
              const rows = filteredBookings.map(b => [
                b._id.slice(0, 8),
                b.customerName || b.user?.name || "",
                b.customerEmail || b.user?.email || "",
                b.type || "",
                getDestinationDisplay(b),
                new Date(b.date).toLocaleDateString(),
                b.totalAmount || 0,
                b.status || "",
                new Date(b.createdAt).toLocaleDateString()
              ]);
              const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
              const blob = new Blob([csv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `bookings-${new Date().toISOString().slice(0,10)}.csv`;
              a.click();
              URL.revokeObjectURL(url);
              showToast("Bookings exported successfully!", "success");
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              isDark 
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <DownloadCloud className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
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
              <PendingIcon className="h-4 w-4 text-yellow-500" />
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
              <CheckIcon className="h-4 w-4 text-blue-500" />
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
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Revenue</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-purple-500" />
            </div>
          </div>
          <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            ₵{stats.totalRevenue?.toLocaleString() || 0}
          </p>
        </div>

        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-lg border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Today</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <Clock className="h-4 w-4 text-amber-500" />
            </div>
          </div>
          <p className={`text-2xl font-bold mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            {stats.todayBookings || 0}
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search bookings by customer, destination, or ID..."
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
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-lg transition-all ${
                viewMode === "list" 
                  ? 'bg-white dark:bg-gray-700 shadow-md' 
                  : 'hover:bg-white/50 dark:hover:bg-gray-700/50'
              }`}
            >
              <LayoutList className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-lg transition-all ${
                viewMode === "grid" 
                  ? 'bg-white dark:bg-gray-700 shadow-md' 
                  : 'hover:bg-white/50 dark:hover:bg-gray-700/50'
              }`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bookings Table/Grid */}
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
              : "There are no bookings in the system yet."}
          </p>
        </div>
      ) : viewMode === "list" ? (
        <div className={`rounded-2xl border ${isDark ? 'border-gray-700' : 'border-gray-200'} overflow-hidden`}>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className={isDark ? 'bg-gray-800' : 'bg-gray-50'}>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Booking</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Destination</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDark ? 'divide-gray-700' : 'divide-gray-200'}`}>
                {filteredBookings.map((booking) => {
                  const statusConfig = getStatusConfig(booking.status);
                  const typeConfig = getTypeConfig(booking.type);
                  const destinationDisplay = getDestinationDisplay(booking);
                  
                  return (
                    <tr key={booking._id} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors`}>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${typeConfig.color}`}>
                            {typeConfig.icon}
                          </div>
                          <div>
                            <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
                              {typeConfig.label} Booking
                            </p>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              #{booking._id.slice(0, 8)}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
                              {booking.customerName || booking.user?.name || "—"}
                            </p>
                            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                              {booking.customerEmail || booking.user?.email || "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <MapPin className="h-4 w-4" />
                          {destinationDisplay}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm">
                          <div className={isDark ? 'text-white' : 'text-gray-800'}>
                            {new Date(booking.date).toLocaleDateString()}
                          </div>
                          <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {booking.guests} guest{booking.guests > 1 ? 's' : ''}
                            {booking.nights > 0 && ` • ${booking.nights} night${booking.nights > 1 ? 's' : ''}`}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-medium text-amber-500">
                          ₵{booking.totalAmount?.toLocaleString() || 0}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${statusConfig.color}`}>
                          {statusConfig.icon}
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowDetailsModal(true);
                            }}
                            className={`p-1.5 rounded-lg transition-all ${
                              isDark 
                                ? 'hover:bg-gray-700 text-gray-400 hover:text-amber-400' 
                                : 'hover:bg-gray-100 text-gray-500 hover:text-amber-500'
                            }`}
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {booking.status === "pending" && (
                            <>
                              <button
                                onClick={() => setShowConfirmModal({ id: booking._id, action: "confirmed" })}
                                className="p-1.5 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors"
                                title="Confirm Booking"
                              >
                                <CheckCircle className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => setShowConfirmModal({ id: booking._id, action: "cancelled" })}
                                className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                                title="Cancel Booking"
                              >
                                <XCircle className="h-4 w-4" />
                              </button>
                            </>
                          )}
                          {booking.status === "confirmed" && (
                            <button
                              onClick={() => completeBooking(booking._id)}
                              className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
                              title="Mark as Completed"
                            >
                              <CheckIcon className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setShowAdminDeleteModal(booking._id)}
                            className={`p-1.5 rounded-lg transition-all ${
                              isDark 
                                ? 'hover:bg-red-500/20 text-red-400 hover:text-red-300' 
                                : 'hover:bg-red-100 text-red-500 hover:text-red-600'
                            }`}
                            title="Delete Booking"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookings.map((booking) => {
            const statusConfig = getStatusConfig(booking.status);
            const typeConfig = getTypeConfig(booking.type);
            const destinationDisplay = getDestinationDisplay(booking);
            
            return (
              <div
                key={booking._id}
                className={`rounded-2xl overflow-hidden transition-all duration-300 ${
                  isDark ? 'bg-gray-800' : 'bg-white'
                } shadow-lg hover:shadow-2xl hover:-translate-y-1 border ${isDark ? 'border-gray-700' : 'border-gray-100'}`}
              >
                <div className="p-4 border-b border-gray-200/20 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${typeConfig.color}`}>
                      {typeConfig.icon}
                    </div>
                    <div>
                      <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {typeConfig.label} Booking
                      </p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        #{booking._id.slice(0, 8)}
                      </p>
                    </div>
                  </div>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-full ${statusConfig.color}`}>
                    {statusConfig.icon}
                    {statusConfig.label}
                  </span>
                </div>
                
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-gray-400" />
                    <div>
                      <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {booking.customerName || booking.user?.name || "—"}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {booking.customerEmail || booking.user?.email || "—"}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4" />
                    {destinationDisplay}
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4" />
                      {new Date(booking.date).toLocaleDateString()}
                    </div>
                    <span className="font-bold text-amber-500">
                      ₵{booking.totalAmount?.toLocaleString() || 0}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Users className="h-3.5 w-3.5" />
                    {booking.guests} guest{booking.guests > 1 ? 's' : ''}
                    {booking.nights > 0 && ` • ${booking.nights} night${booking.nights > 1 ? 's' : ''}`}
                  </div>
                </div>
                
                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-1">
                    {booking.status === "pending" && (
                      <>
                        <button
                          onClick={() => setShowConfirmModal({ id: booking._id, action: "confirmed" })}
                          className="p-1.5 rounded-lg bg-green-500/10 text-green-500 hover:bg-green-500/20 transition-colors"
                          title="Confirm"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setShowConfirmModal({ id: booking._id, action: "cancelled" })}
                          className="p-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                          title="Cancel"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      </>
                    )}
                    {booking.status === "confirmed" && (
                      <button
                        onClick={() => completeBooking(booking._id)}
                        className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 transition-colors"
                        title="Mark as Completed"
                      >
                        <CheckIcon className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => setShowAdminDeleteModal(booking._id)}
                      className={`p-1.5 rounded-lg transition-all ${
                        isDark 
                          ? 'hover:bg-red-500/20 text-red-400 hover:text-red-300' 
                          : 'hover:bg-red-100 text-red-500 hover:text-red-600'
                      }`}
                      title="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedBooking(booking);
                      setShowDetailsModal(true);
                    }}
                    className={`p-1.5 rounded-lg transition-all ${
                      isDark 
                        ? 'hover:bg-gray-700 text-gray-400 hover:text-amber-400' 
                        : 'hover:bg-gray-100 text-gray-500 hover:text-amber-500'
                    }`}
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={`max-w-md w-full p-6 rounded-2xl ${isDark ? 'bg-gray-900' : 'bg-white'} shadow-2xl`}>
            <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {showConfirmModal.action === "confirmed" ? "Confirm Booking" : "Cancel Booking"}
            </h3>
            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Are you sure you want to {showConfirmModal.action === "confirmed" ? "confirm" : "cancel"} this booking?
            </p>
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setShowConfirmModal(null)}
                className={`flex-1 px-4 py-2.5 rounded-xl ${
                  isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                } transition-all`}
              >
                Cancel
              </button>
              <button
                onClick={() => updateBookingStatus(showConfirmModal.id, showConfirmModal.action)}
                className={`flex-1 px-4 py-2.5 rounded-xl text-white ${
                  showConfirmModal.action === "confirmed"
                    ? 'bg-green-500 hover:bg-green-600'
                    : 'bg-red-500 hover:bg-red-600'
                } transition-all`}
              >
                {showConfirmModal.action === "confirmed" ? "Confirm" : "Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Delete Confirmation Modal with Options */}
      {showAdminDeleteModal && (
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
            
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'} mb-4`}>
              Choose how you want to delete this booking:
            </p>
            
            <div className="space-y-3 mb-4">
              <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <input
                  type="radio"
                  name="deleteOption"
                  checked={deleteOptions.hideFrom === 'all' && deleteOptions.permanent === false}
                  onChange={() => setDeleteOptions({ permanent: false, hideFrom: 'all' })}
                  className="form-radio text-yellow-500"
                />
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Hide from everyone
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Booking will be hidden from all users and admin views
                  </p>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <input
                  type="radio"
                  name="deleteOption"
                  checked={deleteOptions.hideFrom === 'admin' && deleteOptions.permanent === false}
                  onChange={() => setDeleteOptions({ permanent: false, hideFrom: 'admin' })}
                  className="form-radio text-blue-500"
                />
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Hide from admin only
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Booking will be hidden from admin but visible to users
                  </p>
                </div>
              </label>
              
              <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors">
                <input
                  type="radio"
                  name="deleteOption"
                  checked={deleteOptions.permanent === true}
                  onChange={() => setDeleteOptions({ permanent: true, hideFrom: 'all' })}
                  className="form-radio text-red-600"
                />
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Permanently delete
                  </p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    This will permanently remove the booking from the database
                  </p>
                </div>
              </label>
            </div>
            
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setShowAdminDeleteModal(null)}
                className={`flex-1 px-4 py-2.5 rounded-xl ${
                  isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                } transition-all`}
              >
                Cancel
              </button>
              <button
                onClick={() => handleAdminDelete(showAdminDeleteModal, deleteOptions)}
                className={`flex-1 px-4 py-2.5 rounded-xl text-white ${
                  deleteOptions.permanent
                    ? 'bg-red-500 hover:bg-red-600'
                    : deleteOptions.hideFrom === 'all'
                    ? 'bg-yellow-500 hover:bg-yellow-600'
                    : 'bg-blue-500 hover:bg-blue-600'
                } transition-all`}
              >
                {deleteOptions.permanent ? 'Permanently Delete' : 
                 deleteOptions.hideFrom === 'all' ? 'Hide from All' : 'Hide from Admin'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Booking Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className={`max-w-3xl w-full max-h-[90vh] overflow-y-auto rounded-2xl ${isDark ? 'bg-gray-900' : 'bg-white'} shadow-2xl`}>
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
                    #{selectedBooking._id}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowAdminDeleteModal(selectedBooking._id)}
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
              {/* Status and Quick Actions */}
              <div className={`p-4 rounded-xl ${getStatusConfig(selectedBooking.status).color} border ${getStatusConfig(selectedBooking.status).borderColor}`}>
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    {getStatusConfig(selectedBooking.status).icon}
                    <div>
                      <p className="font-medium">Status: {getStatusConfig(selectedBooking.status).label}</p>
                      <p className="text-sm opacity-80">
                        {selectedBooking.status === "pending" && "Awaiting confirmation"}
                        {selectedBooking.status === "confirmed" && "Booking confirmed"}
                        {selectedBooking.status === "completed" && "Booking completed"}
                        {selectedBooking.status === "cancelled" && "Booking cancelled"}
                      </p>
                    </div>
                  </div>
                  {selectedBooking.status === "pending" && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setShowConfirmModal({ id: selectedBooking._id, action: "confirmed" });
                          setShowDetailsModal(false);
                        }}
                        className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => {
                          setShowConfirmModal({ id: selectedBooking._id, action: "cancelled" });
                          setShowDetailsModal(false);
                        }}
                        className="px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  )}
                  {selectedBooking.status === "confirmed" && (
                    <button
                      onClick={() => {
                        completeBooking(selectedBooking._id);
                        setShowDetailsModal(false);
                      }}
                      className="px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                    >
                      Mark as Completed
                    </button>
                  )}
                </div>
              </div>

              {/* Booking Info Grid */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <p className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Booking Information
                  </p>
                  <div className="mt-3 space-y-2 text-sm">
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
                    <div className="flex justify-between">
                      <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Created</span>
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {new Date(selectedBooking.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                  <p className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Customer Information
                  </p>
                  <div className="mt-3 space-y-2 text-sm">
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
                        {selectedBooking.guests}
                      </span>
                    </div>
                    {selectedBooking.nights > 0 && (
                      <div className="flex justify-between">
                        <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Nights</span>
                        <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          {selectedBooking.nights}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <p className={`text-xs font-medium uppercase tracking-wider ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Payment Information
                </p>
                <div className="mt-3 grid md:grid-cols-2 gap-2 text-sm">
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
                    <div className="flex justify-between col-span-2">
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
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookings;
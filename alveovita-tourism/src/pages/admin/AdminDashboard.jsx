// pages/admin/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../../api/axios";
import {
  Users,
  Hotel,
  Plane,
  DollarSign,
  Calendar,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Clock,
  Loader2,
  MapPin,
  Star,
  MessageSquare,
  CheckCircle,
  XCircle,
  AlertCircle,
  RefreshCw,
  BarChart3,
  PieChart,
  LineChart,
  UserPlus,
  BookOpen,
  CreditCard,
  Award,
  Crown,
  Gem,
  Sparkles,
  Zap,
  Rocket,
  Gift,
  Heart,
  ThumbsUp,
  Eye,
  Share2,
  Bell,
  Settings,
  HelpCircle,
  Info,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Download,
  Printer,
  Filter,
  Search,
  Grid,
  List
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../hooks/useToast";
import { useAuth } from "../../context/AuthContext";

const AdminDashboard = () => {
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTours: 0,
    totalHotels: 0,
    totalBookings: 0,
    totalRevenue: 0,
    pendingBookings: 0,
    confirmedBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    activePercentage: 0,
    tourBookings: 0,
    hotelBookings: 0,
    todayBookings: 0,
    thisWeek: 0,
    thisMonth: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);
  const [topTours, setTopTours] = useState([]);
  const [topHotels, setTopHotels] = useState([]);
  const [timeframe, setTimeframe] = useState("monthly");
  const [showAllActivities, setShowAllActivities] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, [timeframe]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setRefreshing(true);

      // Fetch bookings stats
      const statsRes = await axios.get("/bookings/admin/stats").catch(() => ({ data: { success: false } }));
      
      if (statsRes.data.success) {
        const statsData = statsRes.data.stats;
        setStats(prev => ({
          ...prev,
          totalBookings: statsData.total || 0,
          pendingBookings: statsData.pending || 0,
          confirmedBookings: statsData.confirmed || 0,
          completedBookings: statsData.completed || 0,
          cancelledBookings: statsData.cancelled || 0,
          totalRevenue: statsData.totalRevenue || 0,
          tourBookings: statsData.tourBookings || 0,
          hotelBookings: statsData.hotelBookings || 0,
          todayBookings: statsData.todayBookings || 0,
          thisWeek: statsData.thisWeek || 0,
          thisMonth: statsData.thisMonth || 0
        }));
      }

      // Fetch all bookings for recent activity
      const bookingsRes = await axios.get("/bookings/admin?limit=10").catch(() => ({ data: { success: false, bookings: [] } }));
      if (bookingsRes.data.success) {
        setRecentBookings(bookingsRes.data.bookings || []);
        
        // Create recent activities from bookings
        const activities = (bookingsRes.data.bookings || []).slice(0, 10).map(b => ({
          id: b._id,
          action: `${b.customerName || b.user?.name || 'Someone'} booked a ${b.type || 'tour'}`,
          user: b.customerName || b.user?.name || 'Anonymous',
          time: b.createdAt || b.date || new Date(),
          status: b.status || 'pending',
          type: b.type || 'tour',
          amount: b.totalAmount || 0
        }));
        setRecentActivities(activities);
      }

      // Fetch tours for top tours
      const toursRes = await axios.get("/tours?limit=5&sortBy=rating&sortOrder=desc").catch(() => ({ data: { success: false, tours: [] } }));
      if (toursRes.data.success) {
        setTopTours(toursRes.data.tours || []);
      }

      // Fetch hotels for top hotels
      const hotelsRes = await axios.get("/hotels?limit=5&sortBy=rating&sortOrder=desc").catch(() => ({ data: { success: false, hotels: [] } }));
      if (hotelsRes.data.success) {
        setTopHotels(hotelsRes.data.hotels || []);
      }

      // Update user stats from auth or fallback
      setStats(prev => ({
        ...prev,
        totalUsers: 0, // Will be updated from users endpoint
        activeUsers: 0,
        inactiveUsers: 0,
        activePercentage: 0
      }));

    } catch (error) {
      console.error("Dashboard error:", error);
      showToast("Failed to load dashboard data", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchDashboardData();
    showToast("Dashboard refreshed", "success");
  };

  const statCards = [
    { 
      title: "Total Revenue", 
      value: `₵${stats.totalRevenue.toLocaleString()}`, 
      icon: DollarSign, 
      change: "+23.1%", 
      color: "blue",
      gradient: "from-blue-500 to-blue-600"
    },
    { 
      title: "Total Bookings", 
      value: stats.totalBookings, 
      icon: Calendar, 
      change: "+15.3%", 
      color: "green",
      gradient: "from-green-500 to-green-600"
    },
    { 
      title: "Pending Bookings", 
      value: stats.pendingBookings, 
      icon: Clock, 
      change: "+8.2%", 
      color: "yellow",
      gradient: "from-yellow-500 to-orange-500"
    },
    { 
      title: "Total Tours", 
      value: stats.tourBookings, 
      icon: Plane, 
      change: "+12.5%", 
      color: "purple",
      gradient: "from-purple-500 to-purple-600"
    },
    { 
      title: "Total Hotels", 
      value: stats.hotelBookings, 
      icon: Hotel, 
      change: "+10.7%", 
      color: "red",
      gradient: "from-red-500 to-red-600"
    },
    { 
      title: "Today's Bookings", 
      value: stats.todayBookings, 
      icon: TrendingUp, 
      change: "+5.2%", 
      color: "indigo",
      gradient: "from-indigo-500 to-indigo-600"
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed": return "bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400";
      case "pending": return "bg-yellow-100 dark:bg-yellow-950/50 text-yellow-700 dark:text-yellow-400";
      case "completed": return "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400";
      case "cancelled": return "bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-400";
      default: return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="h-12 w-12 text-amber-500 animate-spin mb-4" />
        <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Loading dashboard data...
        </p>
        <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
          Fetching analytics and insights
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className={`text-3xl md:text-4xl font-display font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Dashboard Overview
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Welcome back, {user?.name || 'Admin'}! Here's your business at a glance
          </p>
        </div>
        <div className="flex items-center gap-3">
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
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            {["daily", "weekly", "monthly", "yearly"].map((period) => (
              <button
                key={period}
                onClick={() => setTimeframe(period)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                  timeframe === period
                    ? "bg-white dark:bg-gray-700 shadow-md text-gray-900 dark:text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50"
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          const colorMap = {
            blue: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
            green: "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400",
            yellow: "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400",
            purple: "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400",
            red: "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400",
            indigo: "bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400"
          };
          return (
            <div
              key={idx}
              className={`group relative overflow-hidden rounded-xl border ${
                isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'
              } p-5 transition-all hover:shadow-lg hover:-translate-y-1 duration-300`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-800/50 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative flex items-start justify-between">
                <div>
                  <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {card.title}
                  </p>
                  <p className={`mt-1 text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {card.value}
                  </p>
                  <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                    <ArrowUpRight className="h-3 w-3" />
                    {card.change}
                  </div>
                </div>
                <div className={`rounded-lg p-2.5 ${colorMap[card.color]}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Stats Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className={`rounded-xl border ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'} p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Completed</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {stats.completedBookings}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-500" />
            </div>
          </div>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div 
              className="bg-green-500 h-1.5 rounded-full" 
              style={{ width: `${stats.totalBookings > 0 ? (stats.completedBookings / stats.totalBookings) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className={`rounded-xl border ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'} p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Pending</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {stats.pendingBookings}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
          </div>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div 
              className="bg-yellow-500 h-1.5 rounded-full" 
              style={{ width: `${stats.totalBookings > 0 ? (stats.pendingBookings / stats.totalBookings) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className={`rounded-xl border ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'} p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>This Week</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {stats.thisWeek}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <Calendar className="h-5 w-5 text-blue-500" />
            </div>
          </div>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div 
              className="bg-blue-500 h-1.5 rounded-full" 
              style={{ width: `${stats.totalBookings > 0 ? (stats.thisWeek / stats.totalBookings) * 100 : 0}%` }}
            />
          </div>
        </div>

        <div className={`rounded-xl border ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'} p-4`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>This Month</p>
              <p className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {stats.thisMonth}
              </p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-purple-500" />
            </div>
          </div>
          <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div 
              className="bg-purple-500 h-1.5 rounded-full" 
              style={{ width: `${stats.totalBookings > 0 ? (stats.thisMonth / stats.totalBookings) * 100 : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Recent Bookings & Top Items */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Recent Bookings */}
        <div className="lg:col-span-2">
          <div className={`rounded-xl border ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'} overflow-hidden`}>
            <div className="flex items-center justify-between p-4 border-b border-gray-200/20">
              <div>
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Recent Bookings
                </h3>
                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Latest customer bookings
                </p>
              </div>
              <Link 
                to="/admin/bookings" 
                className={`text-sm ${isDark ? 'text-amber-400 hover:text-amber-300' : 'text-amber-500 hover:text-amber-600'} transition-colors flex items-center gap-1`}
              >
                View All <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="divide-y divide-gray-200/20 max-h-[400px] overflow-y-auto">
              {recentBookings.length === 0 ? (
                <div className="p-8 text-center">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No recent bookings</p>
                </div>
              ) : (
                recentBookings.slice(0, 6).map((booking) => (
                  <div key={booking._id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          booking.type === "tour" 
                            ? "bg-green-100 dark:bg-green-950/30 text-green-600"
                            : "bg-yellow-100 dark:bg-yellow-950/30 text-yellow-600"
                        }`}>
                          {booking.type === "tour" ? (
                            <Plane className="h-5 w-5" />
                          ) : (
                            <Hotel className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <p className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            {booking.customerName || booking.user?.name || 'Anonymous'}
                          </p>
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span>{booking.destination || 'Location'}</span>
                            <span>•</span>
                            <span>₵{booking.totalAmount?.toLocaleString() || 0}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status || 'Pending'}
                        </span>
                        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                          {new Date(booking.createdAt || booking.date).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Top Tours & Hotels */}
        <div className="space-y-6">
          {/* Top Tours */}
          <div className={`rounded-xl border ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'} overflow-hidden`}>
            <div className="p-4 border-b border-gray-200/20">
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Top Tours
              </h3>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Highest rated tours
              </p>
            </div>
            <div className="divide-y divide-gray-200/20">
              {topTours.length === 0 ? (
                <div className="p-6 text-center">
                  <Plane className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No tours available</p>
                </div>
              ) : (
                topTours.slice(0, 4).map((tour, idx) => (
                  <div key={tour._id || idx} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={tour.images?.[0] || 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=100&q=80'} 
                          alt={tour.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          {tour.title || 'Tour'}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <div className="flex items-center">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span className="ml-0.5">{tour.rating || 0}</span>
                          </div>
                          <span>•</span>
                          <span>₵{tour.price?.toLocaleString() || 0}</span>
                        </div>
                      </div>
                      <div className="text-xs font-medium text-amber-500">
                        #{idx + 1}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Hotels */}
          <div className={`rounded-xl border ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'} overflow-hidden`}>
            <div className="p-4 border-b border-gray-200/20">
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Top Hotels
              </h3>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Highest rated hotels
              </p>
            </div>
            <div className="divide-y divide-gray-200/20">
              {topHotels.length === 0 ? (
                <div className="p-6 text-center">
                  <Hotel className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No hotels available</p>
                </div>
              ) : (
                topHotels.slice(0, 4).map((hotel, idx) => (
                  <div key={hotel._id || idx} className="p-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                        <img 
                          src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=100&q=80'} 
                          alt={hotel.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          {hotel.name || 'Hotel'}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <div className="flex items-center">
                            <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                            <span className="ml-0.5">{hotel.rating || 0}</span>
                          </div>
                          <span>•</span>
                          <span>₵{hotel.price?.toLocaleString() || 0}</span>
                        </div>
                      </div>
                      <div className="text-xs font-medium text-amber-500">
                        #{idx + 1}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className={`rounded-xl border ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'} overflow-hidden`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-200/20">
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Recent Activity
            </h3>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Latest actions on your platform
            </p>
          </div>
          <button
            onClick={() => setShowAllActivities(!showAllActivities)}
            className={`text-sm ${isDark ? 'text-amber-400 hover:text-amber-300' : 'text-amber-500 hover:text-amber-600'} transition-colors flex items-center gap-1`}
          >
            {showAllActivities ? 'Show Less' : 'View All'}
            {showAllActivities ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
        <div className="divide-y divide-gray-200/20 max-h-[300px] overflow-y-auto">
          {recentActivities.length === 0 ? (
            <div className="p-8 text-center">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No recent activity</p>
            </div>
          ) : (
            (showAllActivities ? recentActivities : recentActivities.slice(0, 5)).map((activity) => (
              <div key={activity.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    activity.status === 'confirmed' 
                      ? 'bg-green-100 dark:bg-green-950/30 text-green-600'
                      : activity.status === 'pending'
                      ? 'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-600'
                      : activity.status === 'cancelled'
                      ? 'bg-red-100 dark:bg-red-950/30 text-red-600'
                      : 'bg-blue-100 dark:bg-blue-950/30 text-blue-600'
                  }`}>
                    {activity.type === 'tour' ? (
                      <Plane className="h-4 w-4" />
                    ) : (
                      <Hotel className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      {activity.action}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>{activity.user}</span>
                      <span>•</span>
                      <span>₵{activity.amount?.toLocaleString() || 0}</span>
                      <span>•</span>
                      <span>{new Date(activity.time).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getStatusColor(activity.status)}`}>
                    {activity.status || 'Pending'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
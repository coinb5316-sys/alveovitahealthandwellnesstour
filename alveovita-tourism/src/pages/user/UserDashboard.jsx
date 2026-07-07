// pages/user/UserDashboard.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/axios";
import {
  Plane,
  Hotel,
  Calendar,
  Heart,
  MapPin,
  Star,
  DollarSign,
  Users,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Loader2,
  User,
  Mail,
  Phone,
  Award,
  TrendingUp,
  Compass,
  Palmtree,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";

const UserDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [pastBookings, setPastBookings] = useState([]);
  const [stats, setStats] = useState({
    totalBookings: 0,
    totalTours: 0,
    totalHotels: 0,
    totalSpent: 0
  });
  const [favorites, setFavorites] = useState([]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Get user data from auth context instead of API call
      setUserData(user);
      
      // Fetch bookings - handle empty response properly
      let bookings = [];
      try {
        const bookingsRes = await axios.get("/bookings/mine");
        // Check if the response has the expected structure
        if (bookingsRes.data && bookingsRes.data.success) {
          bookings = bookingsRes.data.bookings || [];
        } else if (Array.isArray(bookingsRes.data)) {
          bookings = bookingsRes.data;
        } else if (bookingsRes.data && Array.isArray(bookingsRes.data.bookings)) {
          bookings = bookingsRes.data.bookings;
        } else {
          bookings = [];
        }
      } catch (bookingErr) {
        console.warn("Could not fetch bookings:", bookingErr);
        bookings = [];
      }
      
      // Ensure bookings is always an array
      if (!Array.isArray(bookings)) {
        bookings = [];
      }
      
      const now = new Date();
      const upcoming = bookings.filter(b => new Date(b.date) > now);
      const past = bookings.filter(b => new Date(b.date) <= now);
      
      setUpcomingBookings(upcoming);
      setPastBookings(past);

      const totalBookings = bookings.length;
      const totalSpent = bookings.reduce((acc, b) => acc + (b.totalAmount || b.totalPrice || 0), 0);
      const tours = bookings.filter(b => b.type === "tour").length;
      const hotels = bookings.filter(b => b.type === "hotel").length;

      setStats({ totalBookings, totalTours: tours, totalHotels: hotels, totalSpent });
      
      // Fetch favorites - handle gracefully
      try {
        const favoritesRes = await axios.get("/favorites");
        if (favoritesRes.data && favoritesRes.data.success) {
          setFavorites(favoritesRes.data.favorites || []);
        } else if (Array.isArray(favoritesRes.data)) {
          setFavorites(favoritesRes.data);
        } else if (favoritesRes.data && Array.isArray(favoritesRes.data.favorites)) {
          setFavorites(favoritesRes.data.favorites);
        } else {
          setFavorites([]);
        }
      } catch (favErr) {
        console.warn("Could not fetch favorites:", favErr);
        setFavorites([]);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to load dashboard data. Please refresh.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
        <p className={`mt-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          Loading your dashboard...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-6 rounded-2xl ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border text-center`}>
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
          Something went wrong
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

  const statCards = [
    { title: "Total Bookings", value: stats.totalBookings, icon: Calendar, color: "blue" },
    { title: "Tours", value: stats.totalTours, icon: Plane, color: "green" },
    { title: "Hotels", value: stats.totalHotels, icon: Hotel, color: "yellow" },
    { title: "Total Spent", value: `₵${stats.totalSpent.toLocaleString()}`, icon: DollarSign, color: "purple" }
  ];

  const quickActions = [
    { title: "Book a Tour", description: "Explore amazing destinations", icon: Compass, color: "blue", path: "/tours" },
    { title: "Find Hotels", description: "Book comfortable stays", icon: Hotel, color: "green", path: "/hotels" },
    { title: "My Favorites", description: "View saved places", icon: Heart, color: "red", path: "/favorites" },
    { title: "Explore Map", description: "Discover new locations", icon: MapPin, color: "purple", path: "/map" }
  ];

  const getInitials = (name) => {
    if (!name) return "U";
    return name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  };

  const colorMap = {
    blue: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
    green: "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400",
    yellow: "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400",
    purple: "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400",
    red: "bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400"
  };

  const gradientMap = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    red: "from-red-500 to-red-600",
    purple: "from-purple-500 to-purple-600"
  };

  return (
    <div className="space-y-6">
      {/* Refresh Button */}
      <div className="flex justify-end">
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className={`p-2 rounded-lg transition-all flex items-center gap-2 ${
            refreshing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span className="text-sm text-gray-500 dark:text-gray-400">Refresh</span>
        </button>
      </div>

      {/* Welcome Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 p-6 md:p-8 text-white">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <Palmtree className="h-5 w-5 text-yellow-300" />
            <span className="text-sm font-medium">Travel Explorer</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold border-2 border-white/30">
              {getInitials(user?.name)}
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Welcome back, {user?.name?.split(" ")[0] || "Traveler"}! 🌍
              </h1>
              <p className="text-amber-100/80 text-sm max-w-md">
                Ready for your next adventure? Explore amazing destinations and book your dream trip.
              </p>
            </div>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full -ml-24 -mb-24" />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 transition-all hover:shadow-lg hover:-translate-y-1 duration-300"
            >
              <div className="relative flex items-start justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{card.title}</p>
                  <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-gray-100">{card.value}</p>
                </div>
                <div className={`rounded-lg p-2.5 ${colorMap[card.color]}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          Quick Actions
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <button
                key={idx}
                onClick={() => navigate(action.path)}
                className="group text-left p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-lg transition-all hover:scale-[1.02]"
              >
                <div className={`w-10 h-10 rounded-lg bg-gradient-to-r ${gradientMap[action.color]} flex items-center justify-center mb-3`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{action.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">{action.description}</p>
                <div className="mt-3 flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity">
                  Get started <ChevronRight className="h-3 w-3" />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Upcoming Bookings */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-amber-500" />
          Upcoming Bookings {upcomingBookings.length > 0 && `(${upcomingBookings.length})`}
        </h2>
        {upcomingBookings.length > 0 ? (
          <div className="space-y-3">
            {upcomingBookings.slice(0, 3).map((booking) => (
              <div
                key={booking._id || booking.id || Math.random().toString()}
                className="flex items-center justify-between p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white">
                    {booking.type === "tour" ? <Plane className="h-6 w-6" /> : <Hotel className="h-6 w-6" />}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {booking.name || booking.destination || booking.tourTitle || "Booking"}
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(booking.date).toLocaleDateString()}
                      </span>
                      {booking.guests && (
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {booking.guests} guest{booking.guests > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/booking/${booking._id || booking.id}`)}
                  className="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 font-medium flex items-center gap-1"
                >
                  View Details <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            ))}
            {upcomingBookings.length > 3 && (
              <button
                onClick={() => navigate('/dashboard/bookings')}
                className="text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 font-medium"
              >
                View all {upcomingBookings.length} bookings →
              </button>
            )}
          </div>
        ) : (
          <div className={`p-8 rounded-xl text-center border border-dashed ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>No upcoming bookings</p>
            <button
              onClick={() => navigate('/tours')}
              className="mt-3 text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 font-medium"
            >
              Book your first adventure →
            </button>
          </div>
        )}
      </div>

      {/* Favorites Preview */}
      {favorites.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500" />
            Your Favorites
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.slice(0, 3).map((item, idx) => (
              <div
                key={idx}
                className="relative rounded-xl overflow-hidden group cursor-pointer"
                onClick={() => navigate(item.type === 'tour' ? `/tour/${item.id}` : `/hotel/${item.id}`)}
              >
                <img 
                  src={item.image || item.thumbnail || 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=800&q=80'} 
                  alt={item.name || item.title}
                  className="w-full h-40 object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-white font-semibold">{item.name || item.title}</p>
                  <p className="text-white/70 text-sm">{item.location || 'Ghana'}</p>
                </div>
                <div className="absolute top-3 right-3">
                  <Heart className="h-5 w-5 text-red-500 fill-red-500" />
                </div>
              </div>
            ))}
          </div>
          {favorites.length > 3 && (
            <button
              onClick={() => navigate('/favorites')}
              className="mt-3 text-sm text-amber-600 dark:text-amber-400 hover:text-amber-700 font-medium"
            >
              View all {favorites.length} favorites →
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default UserDashboard;
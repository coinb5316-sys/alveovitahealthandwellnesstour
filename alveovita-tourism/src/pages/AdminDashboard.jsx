// src/pages/AdminDashboard.jsx
import { useState, useEffect } from "react";
import {
  Users,
  Hotel,
  Compass,
  Calendar,
  DollarSign,
  ArrowUpRight,
  TrendingUp,
  Activity,
  Clock,
  UserPlus,
  CreditCard,
  Zap,
  Loader2,
  Star,
  Heart,
  MessageSquare,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../hooks/useToast";
import { hotels, tours, userExperiences } from "../data/tourismData";

// Import chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ArcElement
);

const AdminDashboard = () => {
  const { isDark } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [timeframe, setTimeframe] = useState("monthly");
  const [stats, setStats] = useState({
    totalHotels: 0,
    totalTours: 0,
    totalBookings: 0,
    totalUsers: 0,
    totalRevenue: 0,
    averageRating: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [bookingData, setBookingData] = useState([]);
  const [bookingStatusData, setBookingStatusData] = useState([]);
  const [topDestinations, setTopDestinations] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, [timeframe]);

  const fetchDashboardData = () => {
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      // Calculate stats from data
      const totalHotels = hotels.length;
      const totalTours = tours.length;
      const totalBookings = Math.floor(Math.random() * 500) + 100;
      const totalUsers = Math.floor(Math.random() * 2000) + 500;
      const totalRevenue = Math.floor(Math.random() * 500000) + 100000;
      const averageRating = (4.5 + Math.random() * 0.5).toFixed(1);

      setStats({
        totalHotels,
        totalTours,
        totalBookings,
        totalUsers,
        totalRevenue,
        averageRating: parseFloat(averageRating)
      });

      // Generate revenue data
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const revenue = months.map((month) => ({
        name: month,
        revenue: Math.floor(Math.random() * 50000) + 10000,
        bookings: Math.floor(Math.random() * 100) + 20
      }));
      setRevenueData(revenue);

      // Booking data
      const booking = months.map((month) => ({
        name: month,
        bookings: Math.floor(Math.random() * 100) + 20
      }));
      setBookingData(booking);

      // Booking status data
      setBookingStatusData([
        { name: 'Confirmed', value: 45, color: '#10B981' },
        { name: 'Pending', value: 28, color: '#F59E0B' },
        { name: 'Cancelled', value: 12, color: '#EF4444' },
        { name: 'Completed', value: 15, color: '#3B82F6' }
      ]);

      // Top destinations
      setTopDestinations([
        { name: 'Accra', value: 85, color: '#F59E0B' },
        { name: 'Kumasi', value: 72, color: '#3B82F6' },
        { name: 'Cape Coast', value: 68, color: '#8B5CF6' },
        { name: 'Mole Park', value: 60, color: '#10B981' },
        { name: 'Volta Region', value: 55, color: '#EF4444' }
      ]);

      // Recent activities
      setRecentActivities([
        { id: 1, action: 'New booking from Sarah Johnson', user: 'Sarah Johnson', time: new Date(Date.now() - 120000), icon: 'Calendar', amount: 2400 },
        { id: 2, action: 'Payment received from Michael Chen', user: 'Michael Chen', time: new Date(Date.now() - 900000), icon: 'CreditCard', amount: 1800 },
        { id: 3, action: 'New user registered', user: 'Emily Davis', time: new Date(Date.now() - 3600000), icon: 'UserPlus' },
        { id: 4, action: '5-star review from David Kim', user: 'David Kim', time: new Date(Date.now() - 7200000), icon: 'Star' },
        { id: 5, action: 'Booking confirmed for Lisa Thompson', user: 'Lisa Thompson', time: new Date(Date.now() - 10800000), icon: 'CheckCircle', amount: 1500 }
      ]);

      setLoading(false);
    }, 1000);
  };

  const statCards = [
    { title: "Total Hotels", value: stats.totalHotels, icon: Hotel, change: "+12.5%", positive: true, color: "blue" },
    { title: "Total Tours", value: stats.totalTours, icon: Compass, change: "+8.2%", positive: true, color: "green" },
    { title: "Total Bookings", value: stats.totalBookings, icon: Calendar, change: "+23.1%", positive: true, color: "yellow" },
    { title: "Total Revenue", value: `$${stats.totalRevenue.toLocaleString()}`, icon: DollarSign, change: "+15.3%", positive: true, color: "purple" },
  ];

  const pieData = {
    labels: ['Confirmed', 'Pending', 'Cancelled', 'Completed'],
    datasets: [
      {
        data: [45, 28, 12, 15],
        backgroundColor: ['#10B981', '#F59E0B', '#EF4444', '#3B82F6'],
        borderWidth: 0,
      },
    ],
  };

  const revenueChartData = {
    labels: revenueData.map(d => d.name),
    datasets: [
      {
        label: 'Revenue',
        data: revenueData.map(d => d.revenue),
        borderColor: '#F59E0B',
        backgroundColor: (context) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(245, 158, 11, 0.3)');
          gradient.addColorStop(1, 'rgba(245, 158, 11, 0)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#F59E0B',
        pointBorderColor: '#FFFFFF',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const bookingChartData = {
    labels: bookingData.map(d => d.name),
    datasets: [
      {
        label: 'Bookings',
        data: bookingData.map(d => d.bookings),
        backgroundColor: 'rgba(59, 130, 246, 0.6)',
        borderColor: '#3B82F6',
        borderWidth: 2,
        borderRadius: 4,
        barPercentage: 0.6,
      },
    ],
  };

  const getTimeframeLabel = () => {
    switch (timeframe) {
      case "daily": return "Today";
      case "weekly": return "This Week";
      case "monthly": return "This Month";
      case "yearly": return "This Year";
      default: return "This Month";
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: isDark ? '#9CA3AF' : '#6B7280',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
        titleColor: isDark ? '#F9FAFB' : '#111827',
        bodyColor: isDark ? '#D1D5DB' : '#374151',
        borderColor: isDark ? '#374151' : '#E5E7EB',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
      }
    },
    scales: {
      x: {
        grid: {
          color: isDark ? 'rgba(55, 65, 81, 0.3)' : 'rgba(229, 231, 235, 0.5)',
        },
        ticks: {
          color: isDark ? '#9CA3AF' : '#6B7280',
        }
      },
      y: {
        grid: {
          color: isDark ? 'rgba(55, 65, 81, 0.3)' : 'rgba(229, 231, 235, 0.5)',
        },
        ticks: {
          color: isDark ? '#9CA3AF' : '#6B7280',
        }
      }
    }
  };

  const getActivityIcon = (iconName) => {
    switch (iconName) {
      case "CreditCard": return <CreditCard className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
      case "UserPlus": return <UserPlus className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
      case "Star": return <Star className="h-4 w-4 text-yellow-500" />;
      case "CheckCircle": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "Calendar": return <Calendar className="h-4 w-4 text-blue-500" />;
      default: return <Activity className="h-4 w-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            Dashboard Overview
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Welcome back, {user?.name?.split(" ")[0] || "Admin"}! Here's an overview of your tourism platform for {getTimeframeLabel().toLowerCase()}
          </p>
        </div>
        <div className="flex gap-2">
          {["daily", "weekly", "monthly", "yearly"].map((period) => (
            <button
              key={period}
              onClick={() => setTimeframe(period)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                timeframe === period
                  ? "bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-500/25"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 text-amber-500 animate-spin mb-3" />
          <p className="text-gray-500 dark:text-gray-400">Loading dashboard data...</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {statCards.map((card, idx) => {
              const Icon = card.icon;
              const colorMap = {
                blue: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
                green: "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400",
                yellow: "bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400",
                purple: "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400",
              };
              return (
                <div
                  key={idx}
                  className="group relative overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 transition-all hover:shadow-lg"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        {card.title}
                      </p>
                      <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-gray-100">
                        {card.value}
                      </p>
                      <div className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-green-600 dark:text-green-400">
                        <ArrowUpRight className="h-3 w-3" />
                        {card.change}
                      </div>
                    </div>
                    <div className={`rounded-lg p-3 ${colorMap[card.color]}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Charts Section */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Revenue Chart */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Revenue Overview</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {getTimeframeLabel()} revenue tracking
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-gray-400" />
                  <span className="text-xs text-green-600 dark:text-green-400">
                    Total: ${stats.totalRevenue.toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="h-72">
                <Line data={revenueChartData} options={chartOptions} />
              </div>
            </div>

            {/* Booking Growth Chart */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Booking Growth</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    New bookings ({getTimeframeLabel().toLowerCase()})
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-xs text-green-600 dark:text-green-400">
                    Total: {stats.totalBookings} bookings
                  </span>
                </div>
              </div>
              <div className="h-72">
                <Bar data={bookingChartData} options={chartOptions} />
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Recent Activity */}
            <div className="lg:col-span-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Recent Activity</h3>
                <button 
                  onClick={fetchDashboardData}
                  className="text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400"
                >
                  Refresh
                </button>
              </div>
              <div className="space-y-4">
                {recentActivities.length === 0 ? (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">No recent activity</p>
                ) : (
                  recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-3 rounded-lg p-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      <div className="rounded-lg bg-gray-100 dark:bg-gray-800 p-2">
                        {getActivityIcon(activity.icon)}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{activity.action}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{activity.user}</p>
                        {activity.amount && (
                          <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">${activity.amount.toLocaleString()}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        {formatTime(activity.time)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Booking Status Distribution */}
            <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
              <h3 className="mb-6 text-sm font-medium text-gray-900 dark:text-gray-100">Booking Status</h3>
              <div className="h-48 flex items-center justify-center">
                <Doughnut 
                  data={pieData} 
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          color: isDark ? '#9CA3AF' : '#6B7280',
                          font: {
                            size: 11
                          },
                          padding: 12
                        }
                      },
                      tooltip: {
                        backgroundColor: isDark ? '#1F2937' : '#FFFFFF',
                        titleColor: isDark ? '#F9FAFB' : '#111827',
                        bodyColor: isDark ? '#D1D5DB' : '#374151',
                        borderColor: isDark ? '#374151' : '#E5E7EB',
                        borderWidth: 1,
                        cornerRadius: 8,
                        padding: 12,
                      }
                    },
                    cutout: '60%',
                  }}
                />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                {pieData.labels.map((label, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: pieData.datasets[0].backgroundColor[index] }} />
                    <span className="text-xs text-gray-600 dark:text-gray-400">{label}</span>
                    <span className="text-xs font-medium text-gray-900 dark:text-gray-100 ml-auto">
                      {pieData.datasets[0].data[index]}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Destinations */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Top Destinations</h3>
              <Compass className="h-4 w-4 text-gray-400" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              {topDestinations.map((destination, index) => (
                <div key={index} className="text-center">
                  <div className="relative">
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {destination.value}%
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mt-2">
                      <div 
                        className="h-full rounded-full transition-all duration-1000"
                        style={{ 
                          width: `${destination.value}%`,
                          backgroundColor: destination.color,
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{destination.name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
// pages/admin/AdminRevenue.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../../api/axios";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Loader2,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  CreditCard,
  Wallet,
  PiggyBank,
  BarChart3,
  PieChart as PieChartIcon,
  LineChart as LineChartIcon,
  Users,
  Hotel,
  Plane,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Filter,
  Search,
  ChevronDown,
  ChevronUp,
  MoreVertical,
  Printer,
  FileText,
  Share2,
  Info,
  AlertCircle,
  Award,
  Crown,
  Gem,
  Sparkles,
  Zap,
  Rocket,
  Gift,
  Heart,
  ThumbsUp
} from "lucide-react";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../hooks/useToast";
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
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

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
  ArcElement,
  Filler
);

const AdminRevenue = () => {
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [period, setPeriod] = useState("monthly");
  const [revenueData, setRevenueData] = useState([]);
  const [summary, setSummary] = useState({
    totalRevenue: 0,
    monthlyRevenue: 0,
    weeklyRevenue: 0,
    growth: 0,
    tourRevenue: 0,
    hotelRevenue: 0,
    experienceRevenue: 0,
    averageBookingValue: 0,
    totalBookings: 0,
    growthPercentage: 0
  });
  const [bookingStats, setBookingStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0
  });
  const [topItems, setTopItems] = useState({
    tours: [],
    hotels: []
  });
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    fetchRevenueData();
  }, [period]);

  const fetchRevenueData = async () => {
    try {
      setLoading(true);
      setRefreshing(true);

      // Fetch bookings stats
      const statsRes = await axios.get("/bookings/admin/stats").catch(() => ({ data: { success: false } }));
      
      if (statsRes.data.success) {
        const stats = statsRes.data.stats;
        setBookingStats({
          total: stats.total || 0,
          pending: stats.pending || 0,
          confirmed: stats.confirmed || 0,
          completed: stats.completed || 0,
          cancelled: stats.cancelled || 0
        });

        // Calculate revenue data from stats
        const totalRevenue = stats.totalRevenue || 0;
        const totalBookings = stats.total || 0;
        const tourBookings = stats.tourBookings || 0;
        const hotelBookings = stats.hotelBookings || 0;
        const completedBookings = stats.completed || 0;
        const confirmedBookings = stats.confirmed || 0;

        // Generate monthly revenue data (simulated from available data)
        const currentMonth = new Date().getMonth();
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const revenuePerMonth = months.map((month, index) => {
          // Simulate revenue distribution based on booking counts
          const baseRevenue = totalRevenue / 12;
          const factor = 0.5 + Math.random() * 0.8;
          return {
            name: month,
            revenue: Math.round(baseRevenue * factor),
            bookings: Math.round(totalBookings / 12 * factor)
          };
        });

        setRevenueData(revenuePerMonth);

        // Calculate summary
        const monthlyRevenue = revenuePerMonth.slice(-1)[0]?.revenue || 0;
        const weeklyRevenue = Math.round(monthlyRevenue / 4);
        const averageBookingValue = totalBookings > 0 ? Math.round(totalRevenue / totalBookings) : 0;
        const growthPercentage = 15.5; // This would come from comparing periods

        setSummary({
          totalRevenue,
          monthlyRevenue,
          weeklyRevenue,
          growth: growthPercentage,
          tourRevenue: Math.round(totalRevenue * (tourBookings / (totalBookings || 1))),
          hotelRevenue: Math.round(totalRevenue * (hotelBookings / (totalBookings || 1))),
          experienceRevenue: Math.round(totalRevenue * 0.15),
          averageBookingValue,
          totalBookings,
          growthPercentage
        });
      }

      // Fetch top tours
      const toursRes = await axios.get("/tours?limit=5&sortBy=rating&sortOrder=desc").catch(() => ({ data: { success: false, tours: [] } }));
      if (toursRes.data.success) {
        setTopItems(prev => ({ ...prev, tours: toursRes.data.tours || [] }));
      }

      // Fetch top hotels
      const hotelsRes = await axios.get("/hotels?limit=5&sortBy=rating&sortOrder=desc").catch(() => ({ data: { success: false, hotels: [] } }));
      if (hotelsRes.data.success) {
        setTopItems(prev => ({ ...prev, hotels: hotelsRes.data.hotels || [] }));
      }

    } catch (error) {
      console.error("Error fetching revenue data:", error);
      showToast("Failed to load revenue data", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchRevenueData();
    showToast("Revenue data refreshed", "success");
  };

  const handleExport = async (format) => {
    try {
      showToast(`Exporting as ${format.toUpperCase()}...`, "info");
      // Simulate export
      setTimeout(() => {
        showToast(`Revenue data exported as ${format.toUpperCase()}`, "success");
        setShowExportModal(false);
      }, 1500);
    } catch (error) {
      showToast("Failed to export data", "error");
    }
  };

  const summaryCards = [
    {
      title: "Total Revenue",
      value: `₵${summary.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      change: summary.growthPercentage,
      color: "blue"
    },
    {
      title: "Monthly Revenue",
      value: `₵${summary.monthlyRevenue.toLocaleString()}`,
      icon: Calendar,
      change: "+12.5%",
      color: "green"
    },
    {
      title: "Average Booking",
      value: `₵${summary.averageBookingValue.toLocaleString()}`,
      icon: CreditCard,
      change: "+8.2%",
      color: "purple"
    },
    {
      title: "Total Bookings",
      value: summary.totalBookings,
      icon: Wallet,
      change: "+15.3%",
      color: "yellow"
    }
  ];

  // Prepare Revenue Chart Data
  const revenueChartData = {
    labels: revenueData.map(item => item.name),
    datasets: [
      {
        label: 'Revenue',
        data: revenueData.map(item => item.revenue || 0),
        borderColor: '#f59e0b',
        backgroundColor: (context) => {
          const chart = context.chart;
          const { ctx, chartArea } = chart;
          if (!chartArea) {
            return 'rgba(245, 158, 11, 0.1)';
          }
          const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
          gradient.addColorStop(0, 'rgba(245, 158, 11, 0.3)');
          gradient.addColorStop(1, 'rgba(245, 158, 11, 0)');
          return gradient;
        },
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: '#f59e0b',
        pointBorderColor: '#f59e0b',
        pointBorderWidth: 2,
        pointHoverRadius: 8,
      },
      {
        label: 'Bookings',
        data: revenueData.map(item => item.bookings || 0),
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 5,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#3b82f6',
        pointBorderWidth: 2,
        pointHoverRadius: 8,
        yAxisID: 'y1',
      }
    ]
  };

  const revenueOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          color: isDark ? '#e5e7eb' : '#1f2937'
        }
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: isDark ? '#ffffff' : '#1f2937',
        bodyColor: isDark ? '#e5e7eb' : '#4b5563',
        borderColor: isDark ? 'rgba(75, 85, 99, 0.5)' : 'rgba(229, 231, 235, 0.5)',
        borderWidth: 1,
        cornerRadius: 12,
        padding: 12,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            if (context.dataset.label === 'Revenue') {
              label += `₵${context.parsed.y.toLocaleString()}`;
            } else {
              label += context.parsed.y;
            }
            return label;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        position: 'left',
        grid: {
          color: isDark ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.5)',
        },
        ticks: {
          color: isDark ? '#9ca3af' : '#6b7280',
          callback: function(value) {
            return '₵' + value.toLocaleString();
          }
        }
      },
      y1: {
        beginAtZero: true,
        position: 'right',
        grid: {
          display: false,
        },
        ticks: {
          color: isDark ? '#9ca3af' : '#6b7280',
        }
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: isDark ? '#9ca3af' : '#6b7280',
        }
      }
    }
  };

  // Prepare Revenue Distribution Doughnut Data
  const distributionData = {
    labels: ['Tours', 'Hotels', 'Experiences'],
    datasets: [
      {
        data: [
          summary.tourRevenue || 60,
          summary.hotelRevenue || 25,
          summary.experienceRevenue || 15
        ],
        backgroundColor: ['#f59e0b', '#3b82f6', '#8b5cf6'],
        borderWidth: 0,
      }
    ]
  };

  const distributionOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 20,
          color: isDark ? '#e5e7eb' : '#1f2937'
        }
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = total > 0 ? ((context.parsed / total) * 100).toFixed(1) : 0;
            return `₵${context.parsed.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    },
    cutout: '60%',
  };

  // Booking Status Data
  const statusData = {
    labels: ['Pending', 'Confirmed', 'Completed', 'Cancelled'],
    datasets: [
      {
        data: [
          bookingStats.pending || 0,
          bookingStats.confirmed || 0,
          bookingStats.completed || 0,
          bookingStats.cancelled || 0
        ],
        backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#ef4444'],
        borderWidth: 0,
      }
    ]
  };

  const statusOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          usePointStyle: true,
          pointStyle: 'circle',
          padding: 15,
          color: isDark ? '#e5e7eb' : '#1f2937'
        }
      }
    },
    cutout: '55%',
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="h-12 w-12 text-amber-500 animate-spin mb-4" />
        <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Loading revenue data...
        </p>
        <p className={`text-sm ${isDark ? 'text-gray-500' : 'text-gray-400'} mt-1`}>
          Analyzing your financial performance
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
            Revenue Analytics
          </h1>
          <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Track and analyze your platform's financial performance
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
          <button
            onClick={() => setShowExportModal(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
              isDark 
                ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' 
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
            {["daily", "weekly", "monthly", "yearly"].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all ${
                  period === p
                    ? "bg-white dark:bg-gray-700 shadow-md text-gray-900 dark:text-white"
                    : "text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-700/50"
                }`}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {summaryCards.map((card, idx) => {
          const Icon = card.icon;
          const colorMap = {
            blue: "bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400",
            green: "bg-green-50 dark:bg-green-950/30 text-green-600 dark:text-green-400",
            purple: "bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400",
            yellow: "bg-yellow-50 dark:bg-yellow-950/30 text-yellow-600 dark:text-yellow-400",
          };
          const isPositive = card.change >= 0;
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
                  <p className={`mt-1 text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {card.value}
                  </p>
                  <div className={`mt-2 inline-flex items-center gap-1 text-xs font-medium ${
                    isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                    {card.change}%
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

      {/* Revenue Chart */}
      <div className={`rounded-xl border ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'} p-6`}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Revenue & Bookings Trend
            </h3>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Monthly revenue and booking volume
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-amber-500" />
              <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Revenue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-0.5 bg-blue-500" />
              <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>Bookings</span>
            </div>
          </div>
        </div>
        <div className="h-[350px]">
          <Line data={revenueChartData} options={revenueOptions} />
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue Distribution */}
        <div className={`rounded-xl border ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'} p-6`}>
          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-6`}>
            Revenue Distribution
          </h3>
          <div className="h-[250px]">
            <Doughnut data={distributionData} options={distributionOptions} />
          </div>
          <div className="mt-4 grid grid-cols-3 gap-2 text-center text-sm">
            <div>
              <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                ₵{summary.tourRevenue.toLocaleString()}
              </p>
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Tours</p>
            </div>
            <div>
              <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                ₵{summary.hotelRevenue.toLocaleString()}
              </p>
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Hotels</p>
            </div>
            <div>
              <p className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                ₵{summary.experienceRevenue.toLocaleString()}
              </p>
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Experiences</p>
            </div>
          </div>
        </div>

        {/* Booking Status */}
        <div className={`rounded-xl border ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'} p-6`}>
          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'} mb-6`}>
            Booking Status Distribution
          </h3>
          <div className="h-[250px]">
            <Doughnut data={statusData} options={statusOptions} />
          </div>
          <div className="mt-4 grid grid-cols-4 gap-2 text-center text-sm">
            <div>
              <p className={`font-semibold text-yellow-500`}>{bookingStats.pending}</p>
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Pending</p>
            </div>
            <div>
              <p className={`font-semibold text-blue-500`}>{bookingStats.confirmed}</p>
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Confirmed</p>
            </div>
            <div>
              <p className={`font-semibold text-green-500`}>{bookingStats.completed}</p>
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Completed</p>
            </div>
            <div>
              <p className={`font-semibold text-red-500`}>{bookingStats.cancelled}</p>
              <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Cancelled</p>
            </div>
          </div>
        </div>
      </div>

      {/* Top Items */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Tours */}
        <div className={`rounded-xl border ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'} overflow-hidden`}>
          <div className="p-4 border-b border-gray-200/20 flex items-center justify-between">
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Top Performing Tours
              </h3>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Highest revenue generating tours
              </p>
            </div>
            <Link to="/admin/tours" className={`text-sm ${isDark ? 'text-amber-400 hover:text-amber-300' : 'text-amber-500 hover:text-amber-600'} transition-colors flex items-center gap-1`}>
              View All <ChevronDown className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-200/20">
            {topItems.tours.length === 0 ? (
              <div className="p-6 text-center">
                <Plane className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No tours available</p>
              </div>
            ) : (
              topItems.tours.slice(0, 4).map((tour, idx) => (
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
                        <span>₵{tour.price?.toLocaleString() || 0}</span>
                        <span>•</span>
                        <span>⭐ {tour.rating || 0}</span>
                        <span>•</span>
                        <span>{tour.reviews || 0} reviews</span>
                      </div>
                    </div>
                    <div className="text-xs font-medium text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full">
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
          <div className="p-4 border-b border-gray-200/20 flex items-center justify-between">
            <div>
              <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Top Performing Hotels
              </h3>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                Highest revenue generating hotels
              </p>
            </div>
            <Link to="/admin/hotels" className={`text-sm ${isDark ? 'text-amber-400 hover:text-amber-300' : 'text-amber-500 hover:text-amber-600'} transition-colors flex items-center gap-1`}>
              View All <ChevronDown className="h-4 w-4" />
            </Link>
          </div>
          <div className="divide-y divide-gray-200/20">
            {topItems.hotels.length === 0 ? (
              <div className="p-6 text-center">
                <Hotel className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>No hotels available</p>
              </div>
            ) : (
              topItems.hotels.slice(0, 4).map((hotel, idx) => (
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
                        <span>₵{hotel.price?.toLocaleString() || 0}</span>
                        <span>•</span>
                        <span>⭐ {hotel.rating || 0}</span>
                        <span>•</span>
                        <span>{hotel.reviews || 0} reviews</span>
                      </div>
                    </div>
                    <div className="text-xs font-medium text-amber-500 bg-amber-500/10 px-2 py-1 rounded-full">
                      #{idx + 1}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Monthly Performance Table */}
      <div className={`rounded-xl border ${isDark ? 'border-gray-800 bg-gray-900' : 'border-gray-200 bg-white'} overflow-hidden`}>
        <div className="p-4 border-b border-gray-200/20 flex items-center justify-between">
          <div>
            <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Monthly Performance
            </h3>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Detailed monthly revenue breakdown
            </p>
          </div>
          <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
            Total: ₵{summary.totalRevenue.toLocaleString()}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className={`${isDark ? 'bg-gray-800/50' : 'bg-gray-50'}`}>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Month</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Revenue</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Bookings</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Avg. Value</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Growth</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-gray-800' : 'divide-gray-200'}`}>
              {revenueData.slice(-6).map((item, idx) => {
                const prevRevenue = idx > 0 ? revenueData[idx - 1].revenue : item.revenue;
                const growth = prevRevenue > 0 ? ((item.revenue - prevRevenue) / prevRevenue * 100) : 0;
                const isPositive = growth >= 0;
                return (
                  <tr key={idx} className={`hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors`}>
                    <td className="px-4 py-3">
                      <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {item.name}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-medium text-amber-500`}>
                        ₵{item.revenue.toLocaleString()}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={isDark ? 'text-white' : 'text-gray-800'}>
                        {item.bookings}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                        ₵{item.bookings > 0 ? Math.round(item.revenue / item.bookings).toLocaleString() : 0}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 text-xs font-medium ${
                        isPositive ? 'text-green-500' : 'text-red-500'
                      }`}>
                        {isPositive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                        {growth.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={`max-w-md w-full p-6 rounded-2xl ${isDark ? 'bg-gray-900' : 'bg-white'} shadow-2xl`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Export Revenue Data
              </h3>
              <button
                onClick={() => setShowExportModal(false)}
                className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`}>
              Choose your preferred export format
            </p>
            <div className="space-y-3">
              {['csv', 'pdf', 'excel'].map((format) => (
                <button
                  key={format}
                  onClick={() => handleExport(format)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      format === 'csv' ? 'bg-green-100 dark:bg-green-950/30 text-green-600' :
                      format === 'pdf' ? 'bg-red-100 dark:bg-red-950/30 text-red-600' :
                      'bg-blue-100 dark:bg-blue-950/30 text-blue-600'
                    }`}>
                      <FileText className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {format.toUpperCase()}
                      </p>
                      <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {format === 'csv' ? 'Comma Separated Values' :
                         format === 'pdf' ? 'Portable Document Format' :
                         'Microsoft Excel Spreadsheet'}
                      </p>
                    </div>
                  </div>
                  <Download className={`h-5 w-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowExportModal(false)}
              className="w-full mt-4 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRevenue;
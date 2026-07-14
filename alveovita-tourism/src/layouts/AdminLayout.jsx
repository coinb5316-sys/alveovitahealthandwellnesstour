// layouts/AdminLayout.jsx - COMPLETE with Alveoly Notification Pattern
import { useState, useEffect } from "react";
import { Outlet, useLocation, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Hotel,
  Plane,
  Users,
  DollarSign,
  Calendar,
  Menu,
  X,
  Bell,
  Moon,
  Sun,
  LogOut,
  ChevronRight,
  Settings,
  LifeBuoy,
  Shield,
  MapPin,
  Star,
  BarChart3,
  Palmtree,
  MessageSquare,
  User,
  FileText,
  CreditCard,
  TrendingUp,
  Award,
  Gift,
  Heart,
  Compass,
  Globe,
  Camera,
  Video,
  Image,
  Upload,
  Plus,
  Minus,
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Grid,
  List,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  X as XIcon,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Loader2,
  Sparkles,
  Crown,
  Gem,
  Rocket,
  Zap,
  Coffee,
  Sun as SunIcon,
  Moon as MoonIcon,
  Monitor,
  Palette,
  Activity,
  Award as AwardIcon,
  Users as UsersIcon,
  MessageSquare as MessageSquareIcon,
  Settings as SettingsIcon,
  LogOut as LogOutIcon,
  UserPlus,
  UserCheck,
  UserX,
  ShieldCheck,
  Fingerprint,
  Smartphone,
  Globe as GlobeIcon,
  Languages,
  Bell as BellIcon,
  Mail,
  Phone,
  MapPin as MapPinIcon,
  Calendar as CalendarIcon,
  Clock,
  Briefcase,
  Building2,
  Home,
  Wifi,
  Utensils,
  Dumbbell,
  Waves,
  TreePine,
  Leaf,
  Mountain,
  Compass as CompassIcon
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import NotificationPanel from "../components/NotificationPanel";

const AdminLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const { logout, user } = useAuth();
  const { unreadCount } = useSocket();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = savedTheme === "dark" || (!savedTheme && systemPrefersDark);
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem("theme", newDarkMode ? "dark" : "light");
    if (newDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  const menuItems = [
    { 
      section: "Dashboard", 
      items: [
        { to: "/admin", label: "Overview", icon: LayoutDashboard, color: "text-amber-500" },
      ]
    },
    { 
      section: "Content", 
      items: [
        { to: "/admin/tours", label: "Tours", icon: Plane, color: "text-green-500" },
        { to: "/admin/hotels", label: "Hotels", icon: Hotel, color: "text-yellow-500" },
        { to: "/admin/destinations", label: "Destinations", icon: MapPin, color: "text-red-500" },
      ]
    },
    { 
      section: "Bookings & Revenue", 
      items: [
        { to: "/admin/bookings", label: "Bookings", icon: Calendar, color: "text-indigo-500" },
        { to: "/admin/revenue", label: "Revenue Analytics", icon: TrendingUp, color: "text-purple-500" },
      ]
    },
    { 
      section: "Users & Reviews", 
      items: [
        { to: "/admin/users", label: "Users", icon: Users, color: "text-cyan-500" },
        { to: "/admin/reviews", label: "Reviews", icon: Star, color: "text-amber-500" },
      ]
    },
    { 
      section: "Communications", 
      items: [
        { to: "/admin/contact", label: "Contact & Chat", icon: MessageSquare, color: "text-blue-500" },
      ]
    },
    { 
      section: "Account", 
      items: [
        { to: "/admin/profile", label: "Profile", icon: User, color: "text-cyan-500" },
        { to: "/admin/settings", label: "Settings", icon: Settings, color: "text-gray-500" },
        { to: "/admin/security", label: "Security", icon: Shield, color: "text-gray-500" },
      ]
    },
    { 
      section: "Support", 
      items: [
        { to: "/admin/help", label: "Help & Support", icon: LifeBuoy, color: "text-gray-500" },
      ]
    },
  ];

  const getUserInitials = () => {
    if (!user?.name) return "A";
    return user.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);
  };

  // Get notification badge count
  const notificationBadge = unreadCount || 0;

  return (
    <div className="h-full flex bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-out md:relative md:translate-x-0 flex flex-col h-full ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        {/* Logo */}
        <div className="flex-shrink-0 flex h-16 items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25">
              <Palmtree className="h-4 w-4 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-amber-600 to-orange-500 bg-clip-text text-transparent">
              TourVibe
            </span>
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
              Admin
            </span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-6 px-3 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
          {menuItems.map((section) => (
            <div key={section.section} className="mb-6">
              <div className="px-3 mb-2 text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                {section.section}
              </div>
              <div className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.to || location.pathname.startsWith(item.to + '/');
                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setSidebarOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                          isActive
                            ? "bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 text-amber-700 dark:text-amber-400 shadow-sm"
                            : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200"
                        }`
                      }
                    >
                      <Icon className={`h-4 w-4 transition-colors ${
                        isActive ? item.color : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                      }`} />
                      <span className="flex-1">{item.label}</span>
                      {isActive && (
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-lg shadow-amber-500/50" />
                      )}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* User Profile */}
        <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-800/30 p-3">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/25 flex-shrink-0">
              <span className="text-white text-sm font-bold">{getUserInitials()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {user?.name || "Admin User"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email || "admin@tourvibe.com"}
              </p>
            </div>
            <button 
              onClick={logout} 
              className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400"
              title="Logout"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className={`flex-shrink-0 sticky top-0 z-30 transition-all duration-200 ${
          scrolled
            ? "bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200 dark:border-gray-800 shadow-sm"
            : "bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm"
        }`}>
          <div className="flex h-16 items-center justify-between px-4 md:px-6">
            <div className="flex items-center gap-4 flex-1">
              <button 
                onClick={() => setSidebarOpen(true)} 
                className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500"
              >
                <Menu className="h-5 w-5" />
              </button>
              <div className="hidden md:block">
                <p className="text-xs text-gray-400 dark:text-gray-500">Welcome back,</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {user?.name?.split(" ")[0] || "Admin"} 👋
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Theme Toggle */}
              <button 
                onClick={toggleDarkMode} 
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
                aria-label="Toggle theme"
              >
                {darkMode ? 
                  <Sun className="h-4 w-4 text-yellow-500" /> : 
                  <Moon className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                }
              </button>
              
              {/* Notifications */}
              <button 
                onClick={() => setNotificationsOpen(true)} 
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4 text-gray-600 dark:text-gray-400" />
                {notificationBadge > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-gray-900 animate-pulse" />
                )}
              </button>
              
              <div className="h-6 w-px bg-gray-200 dark:bg-gray-700 mx-1" />
              
              {/* Logout Button */}
              <button 
                onClick={logout} 
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white text-sm font-medium transition-all shadow-lg shadow-red-500/25 hover:shadow-red-500/40"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>

      {/* Notification Panel */}
      <NotificationPanel isOpen={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </div>
  );
};

export default AdminLayout;
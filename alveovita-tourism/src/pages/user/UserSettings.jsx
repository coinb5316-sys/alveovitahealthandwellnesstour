// pages/user/UserSettings.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../hooks/useToast";
import {
  Settings,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  User,
  Mail,
  Phone,
  Globe,
  Lock,
  Shield,
  Bell,
  Moon,
  Sun,
  Monitor,
  Palette,
  Languages,
  Clock,
  Calendar,
  DollarSign,
  CreditCard,
  FileText,
  Database,
  Cloud,
  Server,
  Share2,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  X,
  Eye,
  EyeOff,
  Key,
  Fingerprint,
  Smartphone,
  Laptop,
  Wifi,
  Bluetooth,
  Printer,
  Camera,
  Mic,
  Speaker,
  Headphones,
  Monitor as MonitorIcon,
  HardDrive,
  Cpu,
  Zap,
  Battery,
  Thermometer,
  Droplet,
  Wind,
  CloudRain,
  Sun as SunIcon,
  Moon as MoonIcon,
  Palette as PaletteIcon,
  Layout,
  Columns,
  Grid,
  List,
  Check,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Plus,
  Minus,
  Edit,
  Trash2 as TrashIcon,
  Copy,
  ExternalLink,
  Heart,
  Star,
  Award,
  Crown,
  Gem,
  Sparkles,
  Gift,
  Ticket,
  Wallet,
  TrendingUp,
  Users,
  MessageSquare,
  LogOut
} from "lucide-react";
import axios from "../../api/axios";

const UserSettings = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState({
    // General Settings
    name: "",
    email: "",
    phone: "",
    location: "",
    timezone: "Africa/Accra",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
    language: "en",
    
    // Appearance
    theme: "system",
    primaryColor: "#f59e0b",
    fontFamily: "Inter",
    compactMode: false,
    animations: true,
    
    // Privacy & Security
    twoFactorAuth: false,
    sessionTimeout: 60,
    profileVisibility: "public",
    activityStatus: true,
    shareData: true,
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    bookingAlerts: true,
    promotionalEmails: false,
    newsletterSubscription: true,
    
    // Preferences
    currency: "GHS",
    measurementUnit: "metric",
    distanceUnit: "km",
    temperatureUnit: "celsius",
    
    // Booking Preferences
    defaultGuests: 1,
    defaultNights: 1,
    preferredPayment: "card",
    autoConfirm: false,
    travelInsurance: false,
    
    // Accessibility
    fontSize: "medium",
    highContrast: false,
    reduceMotion: false,
    screenReader: false,
    
    // Privacy
    showOnlineStatus: true,
    showBookingHistory: true,
    showReviews: true,
    allowMessages: true
  });

  const [originalSettings, setOriginalSettings] = useState(settings);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  // Load settings from localStorage or API
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const savedSettings = localStorage.getItem('tourvibe_user_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
        setOriginalSettings(prev => ({ ...prev, ...parsed }));
      }

      // If user data is available from auth, use it
      if (user) {
        setSettings(prev => ({
          ...prev,
          name: user.name || prev.name,
          email: user.email || prev.email,
          phone: user.phone || prev.phone,
          location: user.location || prev.location
        }));
      }

      // Try to fetch from API
      try {
        const res = await axios.get("/user/settings");
        if (res.data) {
          setSettings(prev => ({ ...prev, ...res.data }));
          setOriginalSettings(prev => ({ ...prev, ...res.data }));
        }
      } catch (apiError) {
        console.log("API not available, using local settings");
      }
    } catch (error) {
      console.error("Error loading settings:", error);
      showToast("Failed to load settings", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem('tourvibe_user_settings', JSON.stringify(settings));
      setOriginalSettings(settings);
      showToast("Settings saved successfully!", "success");

      try {
        await axios.put("/user/settings", settings);
      } catch (apiError) {
        console.log("API not available, settings saved locally");
      }
    } catch (error) {
      console.error("Error saving settings:", error);
      showToast("Failed to save settings", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(originalSettings);
    showToast("Settings reset to saved state", "info");
  };

  const handlePasswordChange = async () => {
    const errors = {};
    if (!passwordData.currentPassword) errors.currentPassword = "Current password is required";
    if (!passwordData.newPassword) errors.newPassword = "New password is required";
    if (passwordData.newPassword.length < 8) errors.newPassword = "Password must be at least 8 characters";
    if (passwordData.newPassword !== passwordData.confirmPassword) errors.confirmPassword = "Passwords do not match";
    
    if (Object.keys(errors).length > 0) {
      setPasswordErrors(errors);
      return;
    }

    try {
      await axios.post("/user/change-password", passwordData);
      showToast("Password changed successfully!", "success");
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordErrors({});
    } catch (error) {
      showToast("Failed to change password", "error");
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      showToast("Please type DELETE to confirm", "error");
      return;
    }

    try {
      await axios.delete("/user/account");
      showToast("Account deleted successfully", "success");
      localStorage.clear();
      navigate("/");
      window.location.reload();
    } catch (error) {
      showToast("Failed to delete account", "error");
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "privacy", label: "Privacy", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "preferences", label: "Preferences", icon: Globe },
    { id: "accessibility", label: "Accessibility", icon: Monitor },
    { id: "account", label: "Account", icon: User }
  ];

  const isDirty = JSON.stringify(settings) !== JSON.stringify(originalSettings);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <RefreshCw className="h-10 w-10 text-amber-500 animate-spin mb-4" />
        <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Settings className="h-6 w-6 text-amber-500" />
            Settings
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your account preferences and settings
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {isDirty && (
            <div className="flex items-center gap-2 text-amber-500 text-sm">
              <AlertCircle className="w-4 h-4" />
              Unsaved changes
            </div>
          )}
          <button
            onClick={handleReset}
            disabled={!isDirty}
            className={`px-4 py-2 rounded-xl font-medium transition-all ${
              isDirty
                ? "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                : "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
            }`}
          >
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !isDirty}
            className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-amber-500/30 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Settings
              </>
            )}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30"
                  : isDark
                    ? "hover:bg-gray-800 text-gray-400 hover:text-gray-200"
                    : "hover:bg-gray-100 text-gray-600 hover:text-gray-800"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        {activeTab === "general" && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={settings.name}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                    isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-800 border-gray-200'
                  } border focus:border-amber-500 transition-colors`}
                  placeholder="Your full name"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={settings.email}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                    isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-800 border-gray-200'
                  } border focus:border-amber-500 transition-colors`}
                  placeholder="your@email.com"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={settings.phone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                    isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-800 border-gray-200'
                  } border focus:border-amber-500 transition-colors`}
                  placeholder="+233 55 123 4567"
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={settings.location}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                    isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-800 border-gray-200'
                  } border focus:border-amber-500 transition-colors`}
                  placeholder="Accra, Ghana"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Language
                </label>
                <select
                  name="language"
                  value={settings.language}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                    isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-800 border-gray-200'
                  } border focus:border-amber-500 transition-colors`}
                >
                  <option value="en">English</option>
                  <option value="fr">Français</option>
                  <option value="es">Español</option>
                  <option value="pt">Português</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Timezone
                </label>
                <select
                  name="timezone"
                  value={settings.timezone}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                    isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-800 border-gray-200'
                  } border focus:border-amber-500 transition-colors`}
                >
                  <option value="Africa/Accra">Africa/Accra (GMT)</option>
                  <option value="Africa/Lagos">Africa/Lagos (GMT+1)</option>
                  <option value="Africa/Nairobi">Africa/Nairobi (GMT+3)</option>
                  <option value="UTC">UTC</option>
                  <option value="America/New_York">America/New York (EST)</option>
                  <option value="Europe/London">Europe/London (GMT)</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Date Format
                </label>
                <select
                  name="dateFormat"
                  value={settings.dateFormat}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                    isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-800 border-gray-200'
                  } border focus:border-amber-500 transition-colors`}
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  <option value="MMMM D, YYYY">MMMM D, YYYY</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {activeTab === "appearance" && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Theme
                </label>
                <select
                  name="theme"
                  value={settings.theme}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                    isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-800 border-gray-200'
                  } border focus:border-amber-500 transition-colors`}
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System Default</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Primary Color
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    name="primaryColor"
                    value={settings.primaryColor}
                    onChange={handleInputChange}
                    className="w-12 h-12 rounded-xl cursor-pointer border-2 border-gray-200 dark:border-gray-700 p-1"
                  />
                  <input
                    type="text"
                    name="primaryColor"
                    value={settings.primaryColor}
                    onChange={handleInputChange}
                    className={`flex-1 px-4 py-2.5 rounded-xl outline-none ${
                      isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-800 border-gray-200'
                    } border focus:border-amber-500 transition-colors`}
                  />
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Font Family
                </label>
                <select
                  name="fontFamily"
                  value={settings.fontFamily}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                    isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-800 border-gray-200'
                  } border focus:border-amber-500 transition-colors`}
                >
                  <option value="Inter">Inter</option>
                  <option value="Poppins">Poppins</option>
                  <option value="Roboto">Roboto</option>
                  <option value="Open Sans">Open Sans</option>
                </select>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="compactMode"
                      checked={settings.compactMode}
                      onChange={handleInputChange}
                      className="text-amber-500 focus:ring-amber-500 rounded"
                    />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Compact Mode</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="animations"
                      checked={settings.animations}
                      onChange={handleInputChange}
                      className="text-amber-500 focus:ring-amber-500 rounded"
                    />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Animations</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Theme Preview */}
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Theme Preview</h4>
              <div className="flex flex-wrap gap-4">
                <div 
                  className="w-16 h-16 rounded-xl shadow-lg flex items-center justify-center text-white font-bold"
                  style={{ background: settings.primaryColor }}
                >
                  P
                </div>
                <div className={`w-16 h-16 rounded-xl shadow-lg flex items-center justify-center font-bold ${
                  isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-800 border border-gray-200'
                }`}>
                  L
                </div>
                <div className={`w-16 h-16 rounded-xl shadow-lg flex items-center justify-center font-bold ${
                  isDark ? 'bg-gray-900 text-white border border-gray-700' : 'bg-gray-900 text-white'
                }`}>
                  D
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "privacy" && (
          <div className="space-y-6">
            <div className={`p-4 rounded-xl ${isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'} border`}>
              <div className="flex items-center gap-3">
                <Shield className={`w-6 h-6 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                <div>
                  <h4 className={`font-medium ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>Privacy & Security</h4>
                  <p className={`text-sm ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                    Manage your privacy settings and control how your data is used.
                  </p>
                </div>
                <button
                  onClick={() => setShowPasswordModal(true)}
                  className="ml-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl text-sm font-medium hover:scale-105 transition-all"
                >
                  Change Password
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Privacy Settings</h3>
              
              <label className="flex items-center justify-between cursor-pointer p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <Fingerprint className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <div>
                    <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Two-Factor Authentication</div>
                    <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Add an extra layer of security</div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  name="twoFactorAuth"
                  checked={settings.twoFactorAuth}
                  onChange={handleInputChange}
                  className="text-amber-500 focus:ring-amber-500 rounded-lg w-5 h-5"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <User className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <div>
                    <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Profile Visibility</div>
                    <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Control who can see your profile</div>
                  </div>
                </div>
                <select
                  name="profileVisibility"
                  value={settings.profileVisibility}
                  onChange={handleInputChange}
                  className={`px-3 py-1.5 rounded-lg outline-none text-sm ${
                    isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-800 border-gray-200'
                  } border focus:border-amber-500 transition-colors`}
                >
                  <option value="public">Public</option>
                  <option value="private">Private</option>
                  <option value="contacts">Contacts Only</option>
                </select>
              </label>

              <div className="grid md:grid-cols-2 gap-3">
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <input
                    type="checkbox"
                    name="showOnlineStatus"
                    checked={settings.showOnlineStatus}
                    onChange={handleInputChange}
                    className="text-amber-500 focus:ring-amber-500 rounded"
                  />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Show online status</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <input
                    type="checkbox"
                    name="showBookingHistory"
                    checked={settings.showBookingHistory}
                    onChange={handleInputChange}
                    className="text-amber-500 focus:ring-amber-500 rounded"
                  />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Show booking history</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <input
                    type="checkbox"
                    name="showReviews"
                    checked={settings.showReviews}
                    onChange={handleInputChange}
                    className="text-amber-500 focus:ring-amber-500 rounded"
                  />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Show reviews</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <input
                    type="checkbox"
                    name="allowMessages"
                    checked={settings.allowMessages}
                    onChange={handleInputChange}
                    className="text-amber-500 focus:ring-amber-500 rounded"
                  />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Allow messages</span>
                </label>
              </div>
            </div>
          </div>
        )}

        {activeTab === "notifications" && (
          <div className="space-y-4">
            <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Notification Preferences</h3>
            <div className="space-y-3">
              {[
                { id: "emailNotifications", label: "Email Notifications", desc: "Receive notifications via email" },
                { id: "pushNotifications", label: "Push Notifications", desc: "Receive browser push notifications" },
                { id: "bookingAlerts", label: "Booking Alerts", desc: "Get notified about your bookings" },
                { id: "promotionalEmails", label: "Promotional Emails", desc: "Receive special offers and deals" },
                { id: "newsletterSubscription", label: "Newsletter Subscription", desc: "Receive monthly newsletter" }
              ].map(({ id, label, desc }) => (
                <label key={id} className="flex items-center justify-between cursor-pointer p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <div>
                    <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{label}</div>
                    <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{desc}</div>
                  </div>
                  <input
                    type="checkbox"
                    name={id}
                    checked={settings[id]}
                    onChange={handleInputChange}
                    className="text-amber-500 focus:ring-amber-500 rounded-lg w-5 h-5"
                  />
                </label>
              ))}
            </div>
          </div>
        )}

        {activeTab === "preferences" && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Currency
                </label>
                <select
                  name="currency"
                  value={settings.currency}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                    isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-800 border-gray-200'
                  } border focus:border-amber-500 transition-colors`}
                >
                  <option value="GHS">GHS - Ghana Cedis</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Distance Unit
                </label>
                <select
                  name="distanceUnit"
                  value={settings.distanceUnit}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                    isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-800 border-gray-200'
                  } border focus:border-amber-500 transition-colors`}
                >
                  <option value="km">Kilometers</option>
                  <option value="miles">Miles</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Temperature Unit
                </label>
                <select
                  name="temperatureUnit"
                  value={settings.temperatureUnit}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                    isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-800 border-gray-200'
                  } border focus:border-amber-500 transition-colors`}
                >
                  <option value="celsius">Celsius (°C)</option>
                  <option value="fahrenheit">Fahrenheit (°F)</option>
                </select>
              </div>
            </div>

            <div>
              <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Booking Preferences</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Default Guests
                  </label>
                  <input
                    type="number"
                    name="defaultGuests"
                    value={settings.defaultGuests}
                    onChange={handleInputChange}
                    min="1"
                    max="10"
                    className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                      isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-800 border-gray-200'
                    } border focus:border-amber-500 transition-colors`}
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Default Nights
                  </label>
                  <input
                    type="number"
                    name="defaultNights"
                    value={settings.defaultNights}
                    onChange={handleInputChange}
                    min="1"
                    max="30"
                    className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                      isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-800 border-gray-200'
                    } border focus:border-amber-500 transition-colors`}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Preferred Payment Method
                  </label>
                  <select
                    name="preferredPayment"
                    value={settings.preferredPayment}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                      isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-800 border-gray-200'
                    } border focus:border-amber-500 transition-colors`}
                  >
                    <option value="card">Credit/Debit Card</option>
                    <option value="mobile_money">Mobile Money</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="paystack">Paystack</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="autoConfirm"
                      checked={settings.autoConfirm}
                      onChange={handleInputChange}
                      className="text-amber-500 focus:ring-amber-500 rounded"
                    />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Auto-confirm bookings</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      name="travelInsurance"
                      checked={settings.travelInsurance}
                      onChange={handleInputChange}
                      className="text-amber-500 focus:ring-amber-500 rounded"
                    />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Add travel insurance by default</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "accessibility" && (
          <div className="space-y-6">
            <div>
              <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Accessibility Settings</h3>
              <div className="space-y-3">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Font Size
                  </label>
                  <select
                    name="fontSize"
                    value={settings.fontSize}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                      isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-800 border-gray-200'
                    } border focus:border-amber-500 transition-colors`}
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="xlarge">Extra Large</option>
                  </select>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <input
                      type="checkbox"
                      name="highContrast"
                      checked={settings.highContrast}
                      onChange={handleInputChange}
                      className="text-amber-500 focus:ring-amber-500 rounded"
                    />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>High Contrast</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <input
                      type="checkbox"
                      name="reduceMotion"
                      checked={settings.reduceMotion}
                      onChange={handleInputChange}
                      className="text-amber-500 focus:ring-amber-500 rounded"
                    />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Reduce Motion</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <input
                      type="checkbox"
                      name="screenReader"
                      checked={settings.screenReader}
                      onChange={handleInputChange}
                      className="text-amber-500 focus:ring-amber-500 rounded"
                    />
                    <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Screen Reader Optimized</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "account" && (
          <div className="space-y-6">
            <div className={`p-4 rounded-xl ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border`}>
              <div className="flex items-center gap-3">
                <AlertTriangle className={`w-6 h-6 ${isDark ? 'text-red-400' : 'text-red-600'}`} />
                <div>
                  <h4 className={`font-medium ${isDark ? 'text-red-300' : 'text-red-800'}`}>Danger Zone</h4>
                  <p className={`text-sm ${isDark ? 'text-red-400' : 'text-red-600'}`}>
                    Deleting your account is permanent and cannot be undone.
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Account Management</h3>
              <div className="space-y-4">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    showToast("Link copied to clipboard!", "success");
                  }}
                  className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'} transition-all flex items-center justify-center gap-2`}
                >
                  <Share2 className="w-4 h-4" />
                  Share Profile Link
                </button>

                <button
                  onClick={() => {
                    const data = JSON.stringify(settings, null, 2);
                    const blob = new Blob([data], { type: 'application/json' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'user_settings_backup.json';
                    a.click();
                    URL.revokeObjectURL(url);
                    showToast("Settings exported successfully!", "success");
                  }}
                  className={`w-full px-4 py-3 rounded-xl border ${isDark ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-200 text-gray-700 hover:bg-gray-50'} transition-all flex items-center justify-center gap-2`}
                >
                  <Download className="w-4 h-4" />
                  Export My Data
                </button>

                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="w-full px-4 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={`max-w-md w-full p-6 rounded-2xl ${isDark ? 'bg-gray-900' : 'bg-white'} shadow-2xl`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Change Password
              </h3>
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                  setPasswordErrors({});
                }}
                className={`p-2 rounded-full ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Current Password *
                </label>
                <div className="relative">
                  <input
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                    className={`w-full px-4 py-2.5 rounded-xl outline-none pr-12 ${
                      isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
                    } border ${passwordErrors.currentPassword ? 'border-red-500' : 'focus:border-amber-500'} transition-colors`}
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordErrors.currentPassword && (
                  <p className="text-red-500 text-xs mt-1">{passwordErrors.currentPassword}</p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  New Password *
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                    className={`w-full px-4 py-2.5 rounded-xl outline-none pr-12 ${
                      isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
                    } border ${passwordErrors.newPassword ? 'border-red-500' : 'focus:border-amber-500'} transition-colors`}
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordErrors.newPassword && (
                  <p className="text-red-500 text-xs mt-1">{passwordErrors.newPassword}</p>
                )}
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Password must be at least 8 characters
                </p>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Confirm New Password *
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                    className={`w-full px-4 py-2.5 rounded-xl outline-none pr-12 ${
                      isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
                    } border ${passwordErrors.confirmPassword ? 'border-red-500' : 'focus:border-amber-500'} transition-colors`}
                    placeholder="Confirm new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordErrors.confirmPassword && (
                  <p className="text-red-500 text-xs mt-1">{passwordErrors.confirmPassword}</p>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
                    setPasswordErrors({});
                  }}
                  className={`flex-1 px-4 py-2.5 rounded-xl ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-all`}
                >
                  Cancel
                </button>
                <button
                  onClick={handlePasswordChange}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:scale-105 transition-all"
                >
                  Change Password
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={`max-w-md w-full p-6 rounded-2xl ${isDark ? 'bg-gray-900' : 'bg-white'} shadow-2xl`}>
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <div>
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Delete Account
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  This action is permanent and cannot be undone
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                Deleting your account will permanently remove all your data including:
              </p>
              <ul className={`list-disc list-inside text-sm space-y-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <li>Profile information</li>
                <li>Booking history</li>
                <li>Favorites and saved items</li>
                <li>Reviews and ratings</li>
                <li>All personal data</li>
              </ul>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Type <span className="font-bold text-red-500">DELETE</span> to confirm
                </label>
                <input
                  type="text"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                    isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
                  } border focus:border-red-500 transition-colors`}
                  placeholder="Type DELETE here"
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeleteConfirmText("");
                  }}
                  className={`flex-1 px-4 py-2.5 rounded-xl ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-all`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserSettings;
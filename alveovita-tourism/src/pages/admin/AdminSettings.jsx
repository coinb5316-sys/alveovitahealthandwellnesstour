// pages/admin/AdminSettings.jsx
import { useState, useEffect } from "react";
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
  ExternalLink
} from "lucide-react";
import axios from "../../api/axios";

const AdminSettings = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [settings, setSettings] = useState({
    // General Settings
    siteName: "TourVibe",
    siteDescription: "Discover amazing tours, hotels, and destinations in Ghana",
    siteEmail: "info@tourvibe.com",
    sitePhone: "+233 55 123 4567",
    siteAddress: "123 Independence Avenue, Accra, Ghana",
    timezone: "Africa/Accra",
    dateFormat: "MM/DD/YYYY",
    timeFormat: "12h",
    
    // Appearance
    primaryColor: "#f59e0b",
    secondaryColor: "#f97316",
    accentColor: "#8b5cf6",
    fontFamily: "Inter",
    layoutStyle: "modern",
    sidebarBehavior: "collapsible",
    animations: true,
    glassmorphism: true,
    
    // Security
    twoFactorAuth: false,
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    passwordPolicy: "strong",
    sessionTracking: true,
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    bookingAlerts: true,
    userActivityAlerts: true,
    systemAlerts: true,
    marketingEmails: false,
    
    // Booking Settings
    defaultCurrency: "GHS",
    taxRate: 7.5,
    serviceFee: 10,
    maxBookingsPerUser: 10,
    bookingCancellationWindow: 24,
    refundPolicy: "full",
    
    // Integrations
    paystackEnabled: true,
    paystackPublicKey: "",
    paystackSecretKey: "",
    googleAnalytics: "",
    facebookPixel: "",
    sendgridApiKey: "",
    
    // Backup
    autoBackup: true,
    backupFrequency: "daily",
    backupRetention: 30,
    
    // SEO
    metaTitle: "TourVibe - Wellness Tourism in Ghana",
    metaDescription: "Discover the best wellness tours, hotels, and destinations in Ghana",
    metaKeywords: "wellness tourism, ghana tours, hotels, destinations",
    ogImage: "",
    twitterCard: "summary_large_image"
  });

  const [originalSettings, setOriginalSettings] = useState(settings);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
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

  // Load settings from localStorage or API
  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const savedSettings = localStorage.getItem('tourvibe_admin_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        setSettings(prev => ({ ...prev, ...parsed }));
        setOriginalSettings(prev => ({ ...prev, ...parsed }));
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
      // Save to localStorage
      localStorage.setItem('tourvibe_admin_settings', JSON.stringify(settings));
      setOriginalSettings(settings);
      showToast("Settings saved successfully!", "success");
      
      // If API is available, save to backend
      try {
        await axios.post("/admin/settings", settings);
      } catch (apiError) {
        // API not available, but settings saved locally
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
    setShowResetModal(false);
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
      await axios.post("/admin/change-password", passwordData);
      showToast("Password changed successfully!", "success");
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordErrors({});
    } catch (error) {
      showToast("Failed to change password", "error");
    }
  };

  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "appearance", label: "Appearance", icon: Palette },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "integrations", label: "Integrations", icon: Share2 },
    { id: "backup", label: "Backup", icon: Database },
    { id: "seo", label: "SEO", icon: Globe },
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleArrayInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value.split(',').map(item => item.trim()).filter(Boolean)
    }));
  };

  const isDirty = JSON.stringify(settings) !== JSON.stringify(originalSettings);

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Site Name *
          </label>
          <input
            type="text"
            name="siteName"
            value={settings.siteName}
            onChange={handleInputChange}
            className={`w-full px-4 py-2.5 rounded-xl outline-none ${
              isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
            } border focus:border-amber-500 transition-colors`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Site Email *
          </label>
          <input
            type="email"
            name="siteEmail"
            value={settings.siteEmail}
            onChange={handleInputChange}
            className={`w-full px-4 py-2.5 rounded-xl outline-none ${
              isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
            } border focus:border-amber-500 transition-colors`}
          />
        </div>
      </div>

      <div>
        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Site Description
        </label>
        <textarea
          name="siteDescription"
          value={settings.siteDescription}
          onChange={handleInputChange}
          rows={2}
          className={`w-full px-4 py-2.5 rounded-xl outline-none ${
            isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
          } border focus:border-amber-500 transition-colors resize-none`}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Phone Number
          </label>
          <input
            type="tel"
            name="sitePhone"
            value={settings.sitePhone}
            onChange={handleInputChange}
            className={`w-full px-4 py-2.5 rounded-xl outline-none ${
              isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
            } border focus:border-amber-500 transition-colors`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Address
          </label>
          <input
            type="text"
            name="siteAddress"
            value={settings.siteAddress}
            onChange={handleInputChange}
            className={`w-full px-4 py-2.5 rounded-xl outline-none ${
              isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
            } border focus:border-amber-500 transition-colors`}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Timezone
          </label>
          <select
            name="timezone"
            value={settings.timezone}
            onChange={handleInputChange}
            className={`w-full px-4 py-2.5 rounded-xl outline-none ${
              isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
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
              isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
            } border focus:border-amber-500 transition-colors`}
          >
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            <option value="MMMM D, YYYY">MMMM D, YYYY</option>
          </select>
        </div>
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Time Format
          </label>
          <select
            name="timeFormat"
            value={settings.timeFormat}
            onChange={handleInputChange}
            className={`w-full px-4 py-2.5 rounded-xl outline-none ${
              isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
            } border focus:border-amber-500 transition-colors`}
          >
            <option value="12h">12-hour (AM/PM)</option>
            <option value="24h">24-hour</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
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
                isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
              } border focus:border-amber-500 transition-colors`}
            />
          </div>
        </div>
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Secondary Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              name="secondaryColor"
              value={settings.secondaryColor}
              onChange={handleInputChange}
              className="w-12 h-12 rounded-xl cursor-pointer border-2 border-gray-200 dark:border-gray-700 p-1"
            />
            <input
              type="text"
              name="secondaryColor"
              value={settings.secondaryColor}
              onChange={handleInputChange}
              className={`flex-1 px-4 py-2.5 rounded-xl outline-none ${
                isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
              } border focus:border-amber-500 transition-colors`}
            />
          </div>
        </div>
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Accent Color
          </label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              name="accentColor"
              value={settings.accentColor}
              onChange={handleInputChange}
              className="w-12 h-12 rounded-xl cursor-pointer border-2 border-gray-200 dark:border-gray-700 p-1"
            />
            <input
              type="text"
              name="accentColor"
              value={settings.accentColor}
              onChange={handleInputChange}
              className={`flex-1 px-4 py-2.5 rounded-xl outline-none ${
                isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
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
              isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
            } border focus:border-amber-500 transition-colors`}
          >
            <option value="Inter">Inter</option>
            <option value="Poppins">Poppins</option>
            <option value="Roboto">Roboto</option>
            <option value="Open Sans">Open Sans</option>
            <option value="Playfair Display">Playfair Display</option>
          </select>
        </div>
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Layout Style
          </label>
          <select
            name="layoutStyle"
            value={settings.layoutStyle}
            onChange={handleInputChange}
            className={`w-full px-4 py-2.5 rounded-xl outline-none ${
              isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
            } border focus:border-amber-500 transition-colors`}
          >
            <option value="modern">Modern</option>
            <option value="classic">Classic</option>
            <option value="minimal">Minimal</option>
            <option value="bold">Bold</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Theme Options</h3>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="sidebarBehavior"
              value="collapsible"
              checked={settings.sidebarBehavior === "collapsible"}
              onChange={handleInputChange}
              className="text-amber-500 focus:ring-amber-500"
            />
            <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Collapsible Sidebar</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="sidebarBehavior"
              value="permanent"
              checked={settings.sidebarBehavior === "permanent"}
              onChange={handleInputChange}
              className="text-amber-500 focus:ring-amber-500"
            />
            <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Permanent Sidebar</span>
          </label>
        </div>
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="animations"
              checked={settings.animations}
              onChange={handleInputChange}
              className="text-amber-500 focus:ring-amber-500 rounded"
            />
            <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Enable Animations</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              name="glassmorphism"
              checked={settings.glassmorphism}
              onChange={handleInputChange}
              className="text-amber-500 focus:ring-amber-500 rounded"
            />
            <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Glassmorphism Effects</span>
          </label>
        </div>
      </div>

      {/* Theme Preview */}
      <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Theme Preview</h4>
        <div className="flex flex-wrap gap-4">
          <div 
            className="w-16 h-16 rounded-xl shadow-lg flex items-center justify-center text-white font-bold"
            style={{ background: settings.primaryColor }}
          >
            P
          </div>
          <div 
            className="w-16 h-16 rounded-xl shadow-lg flex items-center justify-center text-white font-bold"
            style={{ background: settings.secondaryColor }}
          >
            S
          </div>
          <div 
            className="w-16 h-16 rounded-xl shadow-lg flex items-center justify-center text-white font-bold"
            style={{ background: settings.accentColor }}
          >
            A
          </div>
          <div className={`w-16 h-16 rounded-xl shadow-lg flex items-center justify-center font-bold ${isDark ? 'bg-gray-700 text-white' : 'bg-white text-gray-800 border border-gray-200'}`}>
            B
          </div>
        </div>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className={`p-4 rounded-xl ${isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'} border`}>
        <div className="flex items-center gap-3">
          <Shield className={`w-6 h-6 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
          <div>
            <h4 className={`font-medium ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>Security Alert</h4>
            <p className={`text-sm ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
              Change your password regularly to keep your account secure.
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

      <div className="space-y-3">
        <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Security Settings</h3>
        <div className="space-y-3">
          <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
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

          <label className="flex items-center justify-between cursor-pointer p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            <div className="flex items-center gap-3">
              <Eye className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
              <div>
                <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Session Tracking</div>
                <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Monitor active sessions</div>
              </div>
            </div>
            <input
              type="checkbox"
              name="sessionTracking"
              checked={settings.sessionTracking}
              onChange={handleInputChange}
              className="text-amber-500 focus:ring-amber-500 rounded-lg w-5 h-5"
            />
          </label>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Session Timeout (minutes)
            </label>
            <input
              type="number"
              name="sessionTimeout"
              value={settings.sessionTimeout}
              onChange={handleInputChange}
              min="5"
              max="480"
              className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
              } border focus:border-amber-500 transition-colors`}
            />
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Max Login Attempts
            </label>
            <input
              type="number"
              name="maxLoginAttempts"
              value={settings.maxLoginAttempts}
              onChange={handleInputChange}
              min="3"
              max="10"
              className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
              } border focus:border-amber-500 transition-colors`}
            />
          </div>
        </div>

        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Password Policy
          </label>
          <select
            name="passwordPolicy"
            value={settings.passwordPolicy}
            onChange={handleInputChange}
            className={`w-full px-4 py-2.5 rounded-xl outline-none ${
              isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
            } border focus:border-amber-500 transition-colors`}
          >
            <option value="weak">Weak (6+ characters)</option>
            <option value="medium">Medium (8+ characters, mixed case)</option>
            <option value="strong">Strong (10+ characters, mixed case, numbers, symbols)</option>
          </select>
        </div>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-4">
      <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Notification Preferences</h3>
      <div className="space-y-3">
        {[
          { id: "emailNotifications", label: "Email Notifications", desc: "Receive notifications via email" },
          { id: "pushNotifications", label: "Push Notifications", desc: "Receive browser push notifications" },
          { id: "bookingAlerts", label: "Booking Alerts", desc: "Get notified about new bookings" },
          { id: "userActivityAlerts", label: "User Activity Alerts", desc: "Monitor user activity on the site" },
          { id: "systemAlerts", label: "System Alerts", desc: "Receive system maintenance alerts" },
          { id: "marketingEmails", label: "Marketing Emails", desc: "Receive promotional content" },
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
  );

  const renderBookingSettings = () => (
    <div className="space-y-6">
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Default Currency
          </label>
          <select
            name="defaultCurrency"
            value={settings.defaultCurrency}
            onChange={handleInputChange}
            className={`w-full px-4 py-2.5 rounded-xl outline-none ${
              isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
            } border focus:border-amber-500 transition-colors`}
          >
            <option value="GHS">GHS - Ghana Cedis</option>
            <option value="USD">USD - US Dollar</option>
            <option value="EUR">EUR - Euro</option>
            <option value="GBP">GBP - British Pound</option>
            <option value="NGN">NGN - Nigerian Naira</option>
          </select>
        </div>
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Tax Rate (%)
          </label>
          <input
            type="number"
            name="taxRate"
            value={settings.taxRate}
            onChange={handleInputChange}
            min="0"
            max="100"
            step="0.5"
            className={`w-full px-4 py-2.5 rounded-xl outline-none ${
              isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
            } border focus:border-amber-500 transition-colors`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Service Fee ($)
          </label>
          <input
            type="number"
            name="serviceFee"
            value={settings.serviceFee}
            onChange={handleInputChange}
            min="0"
            step="0.5"
            className={`w-full px-4 py-2.5 rounded-xl outline-none ${
              isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
            } border focus:border-amber-500 transition-colors`}
          />
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Max Bookings Per User
          </label>
          <input
            type="number"
            name="maxBookingsPerUser"
            value={settings.maxBookingsPerUser}
            onChange={handleInputChange}
            min="1"
            className={`w-full px-4 py-2.5 rounded-xl outline-none ${
              isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
            } border focus:border-amber-500 transition-colors`}
          />
        </div>
        <div>
          <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            Cancellation Window (hours)
          </label>
          <input
            type="number"
            name="bookingCancellationWindow"
            value={settings.bookingCancellationWindow}
            onChange={handleInputChange}
            min="1"
            className={`w-full px-4 py-2.5 rounded-xl outline-none ${
              isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
            } border focus:border-amber-500 transition-colors`}
          />
        </div>
      </div>

      <div>
        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Refund Policy
        </label>
        <select
          name="refundPolicy"
          value={settings.refundPolicy}
          onChange={handleInputChange}
          className={`w-full px-4 py-2.5 rounded-xl outline-none ${
            isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
          } border focus:border-amber-500 transition-colors`}
        >
          <option value="full">Full Refund</option>
          <option value="partial">Partial Refund</option>
          <option value="non-refundable">Non-Refundable</option>
        </select>
      </div>
    </div>
  );

  const renderIntegrationSettings = () => (
    <div className="space-y-6">
      <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center gap-3 mb-4">
          <CreditCard className={`w-6 h-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Paystack Payment</h3>
          <label className="ml-auto flex items-center gap-2 cursor-pointer">
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Enabled</span>
            <input
              type="checkbox"
              name="paystackEnabled"
              checked={settings.paystackEnabled}
              onChange={handleInputChange}
              className="text-amber-500 focus:ring-amber-500 rounded-lg w-5 h-5"
            />
          </label>
        </div>
        <div className="space-y-3">
          <input
            type="text"
            name="paystackPublicKey"
            value={settings.paystackPublicKey}
            onChange={handleInputChange}
            placeholder="Paystack Public Key"
            className={`w-full px-4 py-2.5 rounded-xl outline-none ${
              isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-200'
            } border focus:border-amber-500 transition-colors`}
          />
          <input
            type="password"
            name="paystackSecretKey"
            value={settings.paystackSecretKey}
            onChange={handleInputChange}
            placeholder="Paystack Secret Key"
            className={`w-full px-4 py-2.5 rounded-xl outline-none ${
              isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-200'
            } border focus:border-amber-500 transition-colors`}
          />
        </div>
      </div>

      <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center gap-3 mb-4">
          <Share2 className={`w-6 h-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Analytics & Tracking</h3>
        </div>
        <div className="space-y-3">
          <input
            type="text"
            name="googleAnalytics"
            value={settings.googleAnalytics}
            onChange={handleInputChange}
            placeholder="Google Analytics Tracking ID (UA-XXXXX-X)"
            className={`w-full px-4 py-2.5 rounded-xl outline-none ${
              isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-200'
            } border focus:border-amber-500 transition-colors`}
          />
          <input
            type="text"
            name="facebookPixel"
            value={settings.facebookPixel}
            onChange={handleInputChange}
            placeholder="Facebook Pixel ID"
            className={`w-full px-4 py-2.5 rounded-xl outline-none ${
              isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-200'
            } border focus:border-amber-500 transition-colors`}
          />
        </div>
      </div>

      <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center gap-3 mb-4">
          <Mail className={`w-6 h-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Email Service</h3>
        </div>
        <input
          type="password"
          name="sendgridApiKey"
          value={settings.sendgridApiKey}
          onChange={handleInputChange}
          placeholder="SendGrid API Key"
          className={`w-full px-4 py-2.5 rounded-xl outline-none ${
            isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-200'
          } border focus:border-amber-500 transition-colors`}
        />
      </div>
    </div>
  );

  const renderBackupSettings = () => (
    <div className="space-y-6">
      <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex items-center gap-3 mb-4">
          <Database className={`w-6 h-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
          <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Backup Settings</h3>
        </div>
        <div className="space-y-4">
          <label className="flex items-center justify-between cursor-pointer">
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Auto Backup</span>
            <input
              type="checkbox"
              name="autoBackup"
              checked={settings.autoBackup}
              onChange={handleInputChange}
              className="text-amber-500 focus:ring-amber-500 rounded-lg w-5 h-5"
            />
          </label>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Backup Frequency
            </label>
            <select
              name="backupFrequency"
              value={settings.backupFrequency}
              onChange={handleInputChange}
              className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-200'
              } border focus:border-amber-500 transition-colors`}
            >
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <div>
            <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Backup Retention (days)
            </label>
            <input
              type="number"
              name="backupRetention"
              value={settings.backupRetention}
              onChange={handleInputChange}
              min="1"
              className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-100 text-gray-800 border-gray-200'
              } border focus:border-amber-500 transition-colors`}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button className="flex-1 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:scale-105 transition-all flex items-center justify-center gap-2">
          <Download className="w-5 h-5" />
          Download Backup
        </button>
        <button className="flex-1 px-4 py-3 border-2 border-amber-500 text-amber-500 rounded-xl font-medium hover:bg-amber-500/10 transition-all flex items-center justify-center gap-2">
          <Upload className="w-5 h-5" />
          Restore Backup
        </button>
      </div>
    </div>
  );

  const renderSEOSettings = () => (
    <div className="space-y-6">
      <div>
        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Meta Title
        </label>
        <input
          type="text"
          name="metaTitle"
          value={settings.metaTitle}
          onChange={handleInputChange}
          className={`w-full px-4 py-2.5 rounded-xl outline-none ${
            isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
          } border focus:border-amber-500 transition-colors`}
        />
        <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          Recommended length: 50-60 characters
        </p>
      </div>

      <div>
        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Meta Description
        </label>
        <textarea
          name="metaDescription"
          value={settings.metaDescription}
          onChange={handleInputChange}
          rows={2}
          className={`w-full px-4 py-2.5 rounded-xl outline-none ${
            isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
          } border focus:border-amber-500 transition-colors resize-none`}
        />
        <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          Recommended length: 150-160 characters
        </p>
      </div>

      <div>
        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Meta Keywords (comma separated)
        </label>
        <input
          type="text"
          name="metaKeywords"
          value={settings.metaKeywords}
          onChange={handleInputChange}
          className={`w-full px-4 py-2.5 rounded-xl outline-none ${
            isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
          } border focus:border-amber-500 transition-colors`}
          placeholder="wellness tourism, ghana tours, hotels"
        />
      </div>

      <div>
        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Open Graph Image URL
        </label>
        <input
          type="text"
          name="ogImage"
          value={settings.ogImage}
          onChange={handleInputChange}
          className={`w-full px-4 py-2.5 rounded-xl outline-none ${
            isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
          } border focus:border-amber-500 transition-colors`}
          placeholder="https://tourvibe.com/og-image.jpg"
        />
      </div>

      <div>
        <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Twitter Card Type
        </label>
        <select
          name="twitterCard"
          value={settings.twitterCard}
          onChange={handleInputChange}
          className={`w-full px-4 py-2.5 rounded-xl outline-none ${
            isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
          } border focus:border-amber-500 transition-colors`}
        >
          <option value="summary">Summary</option>
          <option value="summary_large_image">Summary with Large Image</option>
          <option value="app">App Card</option>
        </select>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch(activeTab) {
      case "general": return renderGeneralSettings();
      case "appearance": return renderAppearanceSettings();
      case "security": return renderSecuritySettings();
      case "notifications": return renderNotificationSettings();
      case "bookings": return renderBookingSettings();
      case "integrations": return renderIntegrationsSettings();
      case "backup": return renderBackupSettings();
      case "seo": return renderSEOSettings();
      default: return renderGeneralSettings();
    }
  };

  // Fix: Use renderIntegrationsSettings instead of renderIntegrationSettings
  const renderIntegrationsSettings = renderIntegrationSettings;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
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
            Manage your site configuration and preferences
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isDirty && (
            <div className="flex items-center gap-2 text-amber-500 text-sm">
              <AlertCircle className="w-4 h-4" />
              Unsaved changes
            </div>
          )}
          <button
            onClick={() => setShowResetModal(true)}
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
        {renderTabContent()}
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

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={`max-w-md w-full p-6 rounded-2xl ${isDark ? 'bg-gray-900' : 'bg-white'} shadow-2xl`}>
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-amber-500" />
              <div>
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Reset Settings?
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  This will discard all unsaved changes.
                </p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowResetModal(false)}
                className={`flex-1 px-4 py-2.5 rounded-xl ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-all`}
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettings;
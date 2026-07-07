// pages/user/UserProfile.jsx
import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../hooks/useToast";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Save,
  Edit,
  Camera,
  X,
  Check,
  Loader2,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  Shield,
  Key,
  Smartphone,
  Globe,
  Languages,
  Bell,
  Moon,
  Sun,
  Monitor,
  Activity,
  Heart,
  Star,
  TrendingUp,
  Users,
  MessageSquare,
  Settings,
  LogOut,
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  Plane,
  Hotel,
  Calendar as CalendarIcon,
  Clock as ClockIcon,
  UserPlus,
  UserCheck,
  UserX,
  ShieldCheck,
  Fingerprint,
  Smartphone as SmartphoneIcon,
  Globe as GlobeIcon,
  Languages as LanguagesIcon,
  Bell as BellIcon,
  Mail as MailIcon,
  Phone as PhoneIcon,
  MapPin as MapPinIcon,
  Award,
  Crown,
  Gem,
  Sparkles,
  Gift,
  Ticket,
  Wallet,
  CreditCard,
  Bookmark,
  Heart as HeartIcon,
  Star as StarIcon,
  Users as UsersIcon,
  TrendingUp as TrendingUpIcon,
  Activity as ActivityIcon,
  Settings as SettingsIcon,
  LogOut as LogOutIcon
} from "lucide-react";
import axios from "../../api/axios";

const UserProfile = () => {
  const { isDark } = useTheme();
  const { user, logout, uploadAvatar } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [profileImage, setProfileImage] = useState(null);
  // imagePreview should be null initially, then set from user avatar
  const [imagePreview, setImagePreview] = useState(null);

  // Profile Data
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    bio: "",
    avatar: "",
    joinDate: new Date().toISOString(),
    lastActive: new Date().toISOString(),
    timezone: "Africa/Accra",
    language: "English",
    twoFactorEnabled: false,
    emailVerified: true,
    phoneVerified: false,
    preferences: {
      theme: "system",
      language: "en",
      timezone: "Africa/Accra",
      dateFormat: "MM/DD/YYYY",
      timeFormat: "12h"
    },
    notifications: {
      email: true,
      push: true,
      sms: false,
      marketing: false
    },
    stats: {
      totalBookings: 0,
      totalTours: 0,
      totalHotels: 0,
      totalSpent: 0,
      favorites: 0,
      reviews: 0,
      loyaltyPoints: 0,
      membershipTier: "Bronze"
    },
    recentActivity: []
  });

  const [originalData, setOriginalData] = useState(profileData);
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

  // Load profile data
  useEffect(() => {
    loadProfile();
  }, []);

  // Update imagePreview when user avatar changes
  useEffect(() => {
    if (user?.avatar) {
      setImagePreview(user.avatar);
    }
  }, [user?.avatar]);

  const loadProfile = async () => {
    try {
      setLoading(true);
      // Try to load from localStorage
      const savedProfile = localStorage.getItem('tourvibe_user_profile');
      if (savedProfile) {
        const parsed = JSON.parse(savedProfile);
        setProfileData(prev => ({ ...prev, ...parsed }));
        setOriginalData(prev => ({ ...prev, ...parsed }));
      }

      // If user data is available from auth, use it
      if (user) {
        setProfileData(prev => ({
          ...prev,
          name: user.name || prev.name,
          email: user.email || prev.email,
          location: user.location || prev.location,
          avatar: user.avatar || prev.avatar
        }));
        
        // Set image preview from user avatar
        if (user.avatar) {
          setImagePreview(user.avatar);
        }
      }

      // Try to fetch from API
      try {
        const res = await axios.get("/users/profile");
        if (res.data && res.data.success) {
          const userData = res.data.user || res.data;
          setProfileData(prev => ({ ...prev, ...userData }));
          setOriginalData(prev => ({ ...prev, ...userData }));
          if (userData.avatar) {
            setImagePreview(userData.avatar);
          }
        }
      } catch (apiError) {
        // API not available, using local data
        console.log("API not available, using local profile data");
      }

      // Generate mock activity
      const mockActivity = [
        { id: 1, action: "Logged in", timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), icon: "login" },
        { id: 2, action: "Booked a tour", timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), icon: "booking" },
        { id: 3, action: "Added hotel to favorites", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), icon: "favorite" },
        { id: 4, action: "Left a review", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), icon: "review" },
        { id: 5, action: "Updated profile", timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), icon: "edit" },
      ];
      setProfileData(prev => ({ ...prev, recentActivity: mockActivity }));

    } catch (error) {
      console.error("Error loading profile:", error);
      showToast("Failed to load profile", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save to localStorage
      localStorage.setItem('tourvibe_user_profile', JSON.stringify(profileData));
      setOriginalData(profileData);
      setEditMode(false);
      showToast("Profile updated successfully!", "success");

      // Try to save to API
      try {
        await axios.put("/users/profile", profileData);
      } catch (apiError) {
        // API not available, saved locally
        console.log("API not available, profile saved locally");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      showToast("Failed to save profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setProfileData(originalData);
    setEditMode(false);
    // Reset image preview to user avatar if available
    if (user?.avatar) {
      setImagePreview(user.avatar);
    } else {
      setImagePreview(null);
    }
  };

  // UserProfile.jsx - Updated handleImageUpload
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast("Please upload an image file", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("Image size should be less than 5MB", "error");
      return;
    }

    setProfileImage(file);
    
    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Upload to backend using AuthContext
    const result = await uploadAvatar(file);
    
    if (result.success) {
      showToast('Avatar updated successfully!', 'success');
      // The user is automatically updated in AuthContext
      // Update profileData with new avatar
      if (result.user?.avatar) {
        setProfileData(prev => ({ ...prev, avatar: result.user.avatar }));
        setImagePreview(result.user.avatar);
      }
    } else {
      showToast(result.error || 'Failed to upload avatar', 'error');
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox") {
      setProfileData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setProfileData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleNestedInputChange = (section, field, value) => {
    setProfileData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
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
      await axios.post("/users/change-password", passwordData);
      showToast("Password changed successfully!", "success");
      setShowPasswordModal(false);
      setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordErrors({});
    } catch (error) {
      const errorMsg = error.response?.data?.message || "Failed to change password";
      showToast(errorMsg, "error");
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type) => {
    const icons = {
      login: <LogOut className="w-4 h-4 text-green-500" />,
      edit: <Edit className="w-4 h-4 text-blue-500" />,
      booking: <Calendar className="w-4 h-4 text-amber-500" />,
      favorite: <Heart className="w-4 h-4 text-red-500" />,
      review: <Star className="w-4 h-4 text-yellow-500" />,
      setting: <Settings className="w-4 h-4 text-gray-500" />
    };
    return icons[type] || <Activity className="w-4 h-4 text-gray-500" />;
  };

  const getMembershipBadge = (tier) => {
    const badges = {
      Bronze: { color: "bg-amber-700/20 text-amber-700 border-amber-700/30", icon: Crown },
      Silver: { color: "bg-gray-400/20 text-gray-400 border-gray-400/30", icon: Crown },
      Gold: { color: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30", icon: Crown },
      Platinum: { color: "bg-cyan-500/20 text-cyan-500 border-cyan-500/30", icon: Crown },
      Diamond: { color: "bg-blue-500/20 text-blue-500 border-blue-500/30", icon: Gem }
    };
    return badges[tier] || badges.Bronze;
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: User },
    { id: "security", label: "Security", icon: Shield },
    { id: "preferences", label: "Preferences", icon: Settings },
    { id: "activity", label: "Activity", icon: Activity },
    { id: "stats", label: "Statistics", icon: TrendingUp }
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-10 w-10 text-amber-500 animate-spin mb-4" />
        <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Loading profile...</p>
      </div>
    );
  }

  const MembershipBadge = getMembershipBadge(profileData.stats?.membershipTier || "Bronze");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <User className="h-6 w-6 text-amber-500" />
            My Profile
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage your personal information and preferences
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {editMode ? (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 rounded-xl font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
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
                    Save Changes
                  </>
                )}
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="inline-flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-amber-500/30 transition-all hover:scale-105"
            >
              <Edit className="h-4 w-4" />
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Profile Header Card */}
      <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          {/* Avatar - FIXED: Now shows uploaded image from user.avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-amber-500/30 overflow-hidden">
              {imagePreview ? (
                <img 
                  src={imagePreview} 
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover" 
                />
              ) : user?.avatar ? (
                <img 
                  src={user.avatar} 
                  alt="Profile" 
                  className="w-full h-full rounded-full object-cover" 
                />
              ) : (
                profileData.name?.charAt(0) || 'U'
              )}
            </div>
            {editMode && (
              <>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-0 right-0 p-2 bg-amber-500 rounded-full text-white hover:bg-amber-600 transition-all shadow-lg"
                >
                  <Camera className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {profileData.name || "Traveler"}
              </h2>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${MembershipBadge.color} flex items-center gap-1`}>
                <MembershipBadge.icon className="w-3 h-3" />
                {profileData.stats?.membershipTier || "Bronze"} Member
              </span>
              {profileData.emailVerified && (
                <span className="flex items-center gap-1 text-xs text-green-500">
                  <CheckCircle className="w-3 h-3" />
                  Verified
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1">
                <MailIcon className="w-4 h-4" />
                {profileData.email || "user@tourvibe.com"}
              </span>
              {profileData.phone && (
                <span className="flex items-center gap-1">
                  <PhoneIcon className="w-4 h-4" />
                  {profileData.phone}
                </span>
              )}
              {profileData.location && (
                <span className="flex items-center gap-1">
                  <MapPinIcon className="w-4 h-4" />
                  {profileData.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <CalendarIcon className="w-4 h-4" />
                Joined {formatDate(profileData.joinDate)}
              </span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex gap-4">
            <div className={`px-4 py-2 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'} text-center`}>
              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Points</div>
              <div className="text-lg font-bold text-amber-500">
                {profileData.stats?.loyaltyPoints || 0}
              </div>
            </div>
            <button
              onClick={() => setShowPasswordModal(true)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 hover:text-amber-500"
            >
              <Key className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs - Rest of the component remains the same */}
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

      {/* Tab Content - Rest of the tabs remain the same */}
      <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
        {/* Profile tab content - same as before */}
        {activeTab === "profile" && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                    editMode
                      ? isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-800 border-gray-200'
                      : isDark ? 'bg-gray-700/50 text-gray-400 border-gray-600 cursor-not-allowed' : 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
                  } border focus:border-amber-500 transition-colors`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={profileData.email}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                    editMode
                      ? isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-800 border-gray-200'
                      : isDark ? 'bg-gray-700/50 text-gray-400 border-gray-600 cursor-not-allowed' : 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
                  } border focus:border-amber-500 transition-colors`}
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
                  value={profileData.phone}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                    editMode
                      ? isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-800 border-gray-200'
                      : isDark ? 'bg-gray-700/50 text-gray-400 border-gray-600 cursor-not-allowed' : 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
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
                  value={profileData.location}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                    editMode
                      ? isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-800 border-gray-200'
                      : isDark ? 'bg-gray-700/50 text-gray-400 border-gray-600 cursor-not-allowed' : 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
                  } border focus:border-amber-500 transition-colors`}
                  placeholder="Accra, Ghana"
                />
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Bio
              </label>
              <textarea
                name="bio"
                value={profileData.bio}
                onChange={handleInputChange}
                disabled={!editMode}
                rows={3}
                className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                  editMode
                    ? isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-800 border-gray-200'
                    : isDark ? 'bg-gray-700/50 text-gray-400 border-gray-600 cursor-not-allowed' : 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
                } border focus:border-amber-500 transition-colors resize-none`}
                placeholder="Tell us about your travel interests..."
              />
            </div>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === "security" && (
          <div className="space-y-6">
            <div className={`p-4 rounded-xl ${isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'} border`}>
              <div className="flex items-center gap-3">
                <Shield className={`w-6 h-6 ${isDark ? 'text-amber-400' : 'text-amber-600'}`} />
                <div>
                  <h4 className={`font-medium ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>Security Tip</h4>
                  <p className={`text-sm ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                    Use a strong password and enable two-factor authentication for better security.
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
              <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Security Settings</h3>
              
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
                  checked={profileData.twoFactorEnabled}
                  onChange={(e) => setProfileData(prev => ({ ...prev, twoFactorEnabled: e.target.checked }))}
                  disabled={!editMode}
                  className="text-amber-500 focus:ring-amber-500 rounded-lg w-5 h-5 disabled:opacity-50"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <SmartphoneIcon className={`w-5 h-5 ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
                  <div>
                    <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Phone Verification</div>
                    <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Verify your phone number</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {profileData.phoneVerified ? (
                    <span className="text-xs text-green-500 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Verified
                    </span>
                  ) : (
                    <button className="text-xs text-amber-500 hover:text-amber-600 transition-colors">
                      Verify Now
                    </button>
                  )}
                </div>
              </label>
            </div>
          </div>
        )}

        {/* Preferences Tab */}
        {activeTab === "preferences" && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Language
                </label>
                <select
                  value={profileData.preferences?.language || 'en'}
                  onChange={(e) => handleNestedInputChange('preferences', 'language', e.target.value)}
                  disabled={!editMode}
                  className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                    editMode
                      ? isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-800 border-gray-200'
                      : isDark ? 'bg-gray-700/50 text-gray-400 border-gray-600 cursor-not-allowed' : 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
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
                  value={profileData.preferences?.timezone || 'Africa/Accra'}
                  onChange={(e) => handleNestedInputChange('preferences', 'timezone', e.target.value)}
                  disabled={!editMode}
                  className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                    editMode
                      ? isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-800 border-gray-200'
                      : isDark ? 'bg-gray-700/50 text-gray-400 border-gray-600 cursor-not-allowed' : 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
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
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Date Format
                </label>
                <select
                  value={profileData.preferences?.dateFormat || 'MM/DD/YYYY'}
                  onChange={(e) => handleNestedInputChange('preferences', 'dateFormat', e.target.value)}
                  disabled={!editMode}
                  className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                    editMode
                      ? isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-800 border-gray-200'
                      : isDark ? 'bg-gray-700/50 text-gray-400 border-gray-600 cursor-not-allowed' : 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
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
                  value={profileData.preferences?.timeFormat || '12h'}
                  onChange={(e) => handleNestedInputChange('preferences', 'timeFormat', e.target.value)}
                  disabled={!editMode}
                  className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                    editMode
                      ? isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-800 border-gray-200'
                      : isDark ? 'bg-gray-700/50 text-gray-400 border-gray-600 cursor-not-allowed' : 'bg-gray-100 text-gray-500 border-gray-200 cursor-not-allowed'
                  } border focus:border-amber-500 transition-colors`}
                >
                  <option value="12h">12-hour (AM/PM)</option>
                  <option value="24h">24-hour</option>
                </select>
              </div>
            </div>

            <div>
              <h3 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Notification Preferences</h3>
              <div className="space-y-3">
                {[
                  { key: 'email', label: 'Email Notifications', desc: 'Receive notifications via email' },
                  { key: 'push', label: 'Push Notifications', desc: 'Receive browser push notifications' },
                  { key: 'sms', label: 'SMS Notifications', desc: 'Receive notifications via SMS' },
                  { key: 'marketing', label: 'Marketing Emails', desc: 'Receive promotional content' }
                ].map(({ key, label, desc }) => (
                  <label key={key} className="flex items-center justify-between cursor-pointer p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div>
                      <div className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{label}</div>
                      <div className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{desc}</div>
                    </div>
                    <input
                      type="checkbox"
                      checked={profileData.notifications?.[key] || false}
                      onChange={(e) => setProfileData(prev => ({
                        ...prev,
                        notifications: {
                          ...prev.notifications,
                          [key]: e.target.checked
                        }
                      }))}
                      disabled={!editMode}
                      className="text-amber-500 focus:ring-amber-500 rounded-lg w-5 h-5 disabled:opacity-50"
                    />
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Activity Tab */}
        {activeTab === "activity" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>Recent Activity</h3>
              <button
                onClick={() => {
                  const newActivity = [
                    { id: Date.now(), action: "Refreshed activity log", timestamp: new Date().toISOString(), icon: "refresh" },
                    ...profileData.recentActivity
                  ];
                  setProfileData(prev => ({ ...prev, recentActivity: newActivity }));
                  showToast("Activity log refreshed", "success");
                }}
                className="text-xs text-amber-500 hover:text-amber-600 transition-colors flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" />
                Refresh
              </button>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {profileData.recentActivity && profileData.recentActivity.length > 0 ? (
                profileData.recentActivity.map((activity) => (
                  <div key={activity.id} className={`flex items-center gap-3 p-3 rounded-xl ${isDark ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}>
                    <div className={`w-10 h-10 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-100'} flex items-center justify-center`}>
                      {getActivityIcon(activity.icon)}
                    </div>
                    <div className="flex-1">
                      <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        {activity.action}
                      </div>
                      <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        {formatDate(activity.timestamp)} at {formatTime(activity.timestamp)}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Activity className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No activity recorded yet</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats Tab */}
        {activeTab === "stats" && (
          <div className="space-y-6">
            {/* Membership Progress */}
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {profileData.stats?.membershipTier || "Bronze"} Member
                  </h4>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {profileData.stats?.loyaltyPoints || 0} points earned
                  </p>
                </div>
                <div className="flex gap-1">
                  {["Bronze", "Silver", "Gold", "Platinum", "Diamond"].map((tier, index) => {
                    const currentTier = profileData.stats?.membershipTier || "Bronze";
                    const tiers = ["Bronze", "Silver", "Gold", "Platinum", "Diamond"];
                    const isActive = tiers.indexOf(tier) <= tiers.indexOf(currentTier);
                    return (
                      <div
                        key={tier}
                        className={`w-8 h-2 rounded-full ${isActive ? 'bg-amber-500' : isDark ? 'bg-gray-600' : 'bg-gray-300'}`}
                        title={tier}
                      />
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>Next: {profileData.stats?.membershipTier === "Diamond" ? "Max Level" : "Silver"}</span>
                <span>{profileData.stats?.loyaltyPoints || 0} / 500 pts</span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-amber-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Bookings</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profileData.stats?.totalBookings || 0}
                </p>
              </div>
              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                  <Plane className="h-4 w-4 text-blue-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Tours</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profileData.stats?.totalTours || 0}
                </p>
              </div>
              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                  <Hotel className="h-4 w-4 text-green-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Hotels</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profileData.stats?.totalHotels || 0}
                </p>
              </div>
              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Favorites</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profileData.stats?.favorites || 0}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-green-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Spent</span>
                </div>
                <p className="text-2xl font-bold text-green-500">
                  ₵{(profileData.stats?.totalSpent || 0).toLocaleString()}
                </p>
              </div>
              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Reviews</span>
                </div>
                <p className="text-2xl font-bold text-yellow-500">
                  {profileData.stats?.reviews || 0}
                </p>
              </div>
              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-purple-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Loyalty Points</span>
                </div>
                <p className="text-2xl font-bold text-purple-500">
                  {profileData.stats?.loyaltyPoints || 0}
                </p>
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
    </div>
  );
};

export default UserProfile;
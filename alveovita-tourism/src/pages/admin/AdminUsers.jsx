// pages/admin/AdminUsers.jsx
import { useState, useEffect } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../hooks/useToast";
import axios from "../../api/axios";
import {
  Search,
  Filter,
  Loader2,
  User,
  Mail,
  Calendar,
  Shield,
  Ban,
  CheckCircle,
  Edit,
  Trash2,
  MoreVertical,
  Users as UsersIcon,
  RefreshCw,
  AlertCircle,
  X,
  Save,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowUpDown,
  Grid,
  List,
  Eye,
  Phone,
  MapPin,
  Star,
  Crown,
  Gem,
  Award,
  TrendingUp,
  Clock,
  Check,
  AlertTriangle,
  Image as ImageIcon
} from "lucide-react";

const AdminUsers = () => {
  const { isDark } = useTheme();
  const { showToast } = useToast();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [viewMode, setViewMode] = useState("grid");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    role: "user",
    phone: "",
    location: "",
    bio: "",
    status: "active"
  });
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [roleChangeData, setRoleChangeData] = useState({
    userId: null,
    newRole: "user"
  });
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    inactive: 0,
    admins: 0,
    users: 0
  });
  const [avatarErrors, setAvatarErrors] = useState({});

  useEffect(() => {
    fetchUsers();
  }, []);

  // Reset avatar error when users change
  useEffect(() => {
    setAvatarErrors({});
  }, [users]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query params
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (filterRole && filterRole !== 'all') params.append('role', filterRole);
      if (filterStatus && filterStatus !== 'all') params.append('status', filterStatus);
      params.append('page', currentPage);
      params.append('limit', itemsPerPage);

      const res = await axios.get(`/admin/users?${params.toString()}`);
      
      if (res.data.success) {
        const userData = res.data.users || [];
        setUsers(userData);
        updateStats(userData);
        
        // Handle pagination if needed
        if (res.data.pagination) {
          // Handle pagination from backend
        }
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err.response?.data?.message || "Failed to load users. Please refresh.");
      showToast("Failed to load users", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateStats = (userList) => {
    const total = userList.length;
    const active = userList.filter(u => u.status === "active").length;
    const inactive = userList.filter(u => u.status === "inactive" || u.status === "suspended").length;
    const admins = userList.filter(u => u.role === "admin").length;
    const users = userList.filter(u => u.role === "user").length;
    setStats({ total, active, inactive, admins, users });
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const handleDelete = async (user) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedUser) return;
    try {
      await axios.delete(`/admin/users/${selectedUser._id}`);
      const updatedUsers = users.filter(u => u._id !== selectedUser._id);
      setUsers(updatedUsers);
      updateStats(updatedUsers);
      showToast(`User "${selectedUser.name}" deleted successfully`, "success");
      setShowDeleteModal(false);
      setSelectedUser(null);
    } catch (err) {
      console.error("Error deleting user:", err);
      showToast("Failed to delete user", "error");
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setEditFormData({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "user",
      phone: user.phone || "",
      location: user.location || "",
      bio: user.bio || "",
      status: user.status || "active"
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedUser) return;
    try {
      const response = await axios.put(`/admin/users/${selectedUser._id}`, editFormData);
      const updatedUser = response.data.user || response.data;
      const updatedUsers = users.map(u => 
        u._id === selectedUser._id ? { ...u, ...updatedUser } : u
      );
      setUsers(updatedUsers);
      updateStats(updatedUsers);
      showToast(`User "${editFormData.name}" updated successfully`, "success");
      setShowEditModal(false);
      setSelectedUser(null);
    } catch (err) {
      console.error("Error updating user:", err);
      showToast("Failed to update user", "error");
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const response = await axios.patch(`/admin/users/${userId}/role`, { role: newRole });
      const updatedUsers = users.map(u => 
        u._id === userId ? { ...u, role: newRole } : u
      );
      setUsers(updatedUsers);
      updateStats(updatedUsers);
      showToast(`User role updated to ${newRole}`, "success");
    } catch (err) {
      console.error("Error updating role:", err);
      showToast("Failed to update role", "error");
    }
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    try {
      await axios.patch(`/admin/users/${userId}/status`, { status: newStatus });
      const updatedUsers = users.map(u => 
        u._id === userId ? { ...u, status: newStatus } : u
      );
      setUsers(updatedUsers);
      updateStats(updatedUsers);
      showToast(`User ${newStatus === "active" ? "activated" : "deactivated"}`, "success");
    } catch (err) {
      console.error("Error updating status:", err);
      showToast("Failed to update status", "error");
    }
  };

  // Filter and sort users
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.location?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === "all" || user.role === filterRole;
    const matchesStatus = filterStatus === "all" || user.status === filterStatus;
    return matchesSearch && matchesRole && matchesStatus;
  }).sort((a, b) => {
    let aVal, bVal;
    switch(sortBy) {
      case "name":
        aVal = a.name || "";
        bVal = b.name || "";
        break;
      case "email":
        aVal = a.email || "";
        bVal = b.email || "";
        break;
      case "role":
        aVal = a.role || "";
        bVal = b.role || "";
        break;
      case "createdAt":
      default:
        aVal = new Date(a.createdAt || 0);
        bVal = new Date(b.createdAt || 0);
        break;
    }
    if (sortDirection === "asc") {
      return aVal > bVal ? 1 : -1;
    }
    return aVal < bVal ? 1 : -1;
  });

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRole, filterStatus, sortBy, sortDirection]);

  const clearFilters = () => {
    setSearchTerm("");
    setFilterRole("all");
    setFilterStatus("all");
    setSortBy("createdAt");
    setSortDirection("desc");
  };

  const getRoleColor = (role) => {
    const colors = {
      admin: "bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
      user: "bg-blue-100 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
      guide: "bg-green-100 dark:bg-green-950/50 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
      agent: "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800"
    };
    return colors[role] || colors.user;
  };

  const getStatusColor = (status) => {
    const colors = {
      active: "bg-green-500/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800",
      inactive: "bg-gray-500/20 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-800",
      suspended: "bg-red-500/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800",
      pending: "bg-yellow-500/20 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800"
    };
    return colors[status] || colors.inactive;
  };

  const getStatusLabel = (status) => {
    return status ? status.charAt(0).toUpperCase() + status.slice(1) : "Active";
  };

  const getMembershipColor = (tier) => {
    const colors = {
      Bronze: "text-amber-700 dark:text-amber-400",
      Silver: "text-gray-500 dark:text-gray-400",
      Gold: "text-yellow-500 dark:text-yellow-400",
      Platinum: "text-cyan-500 dark:text-cyan-400",
      Diamond: "text-blue-500 dark:text-blue-400"
    };
    return colors[tier] || colors.Bronze;
  };

  // Get user initials for avatar fallback
  const getUserInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  // Professional User Avatar Component
  const UserAvatar = ({ user, size = 'md', className = '' }) => {
    const [avatarError, setAvatarError] = useState(false);
    const avatarUrl = user?.avatar && !avatarError ? user.avatar : null;
    const initials = getUserInitials(user?.name);
    
    const sizeClasses = {
      sm: 'w-10 h-10 text-xs',
      md: 'w-14 h-14 text-lg',
      lg: 'w-16 h-16 text-xl'
    };

    return (
      <div className={`relative flex-shrink-0 ${className}`}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={user?.name || 'User'}
            className={`${sizeClasses[size]} rounded-full object-cover ring-2 ring-amber-400/30 ring-offset-2 ring-offset-${isDark ? 'gray-800' : 'white'} shadow-lg shadow-amber-500/20 transition-all duration-300 hover:ring-amber-400/60 hover:shadow-amber-500/40`}
            onError={() => setAvatarError(true)}
          />
        ) : (
          <div className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold shadow-lg shadow-amber-500/30 ring-2 ring-amber-400/30 ring-offset-2 ring-offset-${isDark ? 'gray-800' : 'white'} transition-all duration-300 hover:ring-amber-400/60 hover:shadow-amber-500/40`}>
            {initials}
          </div>
        )}
        {/* Status dot */}
        <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-${isDark ? 'gray-800' : 'white'} ${
          user?.status === "active" ? "bg-green-500" : "bg-red-500"
        } shadow-lg`} />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-10 w-10 text-amber-500 animate-spin mb-4" />
        <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-8 rounded-2xl ${isDark ? 'bg-red-900/20 border-red-800' : 'bg-red-50 border-red-200'} border text-center`}>
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
        <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
          Failed to load users
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <UsersIcon className="h-6 w-6 text-amber-500" />
            Users Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage all platform users • {filteredUsers.length} users found
          </p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className={`p-2 rounded-lg transition-all ${
              refreshing ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
            }`}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-2">
            <UsersIcon className="h-4 w-4 text-amber-500" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
        </div>
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Active</span>
          </div>
          <p className="text-2xl font-bold text-green-500">{stats.active}</p>
        </div>
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-2">
            <Ban className="h-4 w-4 text-red-500" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Inactive</span>
          </div>
          <p className="text-2xl font-bold text-red-500">{stats.inactive}</p>
        </div>
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-purple-500" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Admins</span>
          </div>
          <p className="text-2xl font-bold text-purple-500">{stats.admins}</p>
        </div>
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-blue-500" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Users</span>
          </div>
          <p className="text-2xl font-bold text-blue-500">{stats.users}</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 border rounded-xl ${
              isDark 
                ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-400' 
                : 'bg-white border-gray-200 text-gray-900'
            } focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none`}
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`px-4 py-2.5 rounded-xl font-medium transition-all flex items-center gap-2 text-sm ${
              showFilters
                ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Filter className="h-4 w-4" />
            Filters
            <ChevronDown className={`h-4 w-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={`px-4 py-2.5 rounded-xl outline-none text-sm appearance-none ${
              isDark 
                ? 'bg-gray-800 text-white border-gray-700' 
                : 'bg-white text-gray-800 border-gray-200'
            } border focus:border-amber-500 transition-colors pr-10`}
          >
            <option value="createdAt">Latest</option>
            <option value="name">Name</option>
            <option value="email">Email</option>
            <option value="role">Role</option>
          </select>
          <button
            onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
            className={`p-2.5 rounded-xl border ${
              isDark ? 'border-gray-700 hover:bg-gray-800' : 'border-gray-200 hover:bg-gray-100'
            }`}
          >
            <ArrowUpDown className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex border rounded-xl overflow-hidden">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2.5 transition-all ${
              viewMode === 'grid'
                ? 'bg-amber-500 text-white'
                : isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2.5 transition-all ${
              viewMode === 'list'
                ? 'bg-amber-500 text-white'
                : isDark ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Expanded Filters */}
      {showFilters && (
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-gray-50'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Role
              </label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl outline-none text-sm ${
                  isDark 
                    ? 'bg-gray-700 text-white border-gray-600' 
                    : 'bg-white text-gray-800 border-gray-200'
                } border focus:border-amber-500 transition-colors`}
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl outline-none text-sm ${
                  isDark 
                    ? 'bg-gray-700 text-white border-gray-600' 
                    : 'bg-white text-gray-800 border-gray-200'
                } border focus:border-amber-500 transition-colors`}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={clearFilters}
                className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Grid/List */}
      {filteredUsers.length === 0 ? (
        <div className={`p-12 rounded-2xl text-center border border-dashed ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
          <div className="w-20 h-20 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="h-10 w-10 text-amber-400" />
          </div>
          <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            No users found
          </h3>
          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
            Try adjusting your filters or search terms
          </p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {currentUsers.map((user) => (
            <div
              key={user._id}
              className={`group rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] ${
                isDark ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white shadow-lg hover:shadow-2xl'
              }`}
            >
              <div className="relative p-4">
                {/* User Avatar with Profile Picture */}
                <div className="flex items-start gap-4">
                  <UserAvatar user={user} size="md" />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className={`font-semibold text-gray-900 dark:text-gray-100 truncate`}>
                          {user.name}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                          <Mail className="h-3 w-3 flex-shrink-0" />
                          <span className="truncate">{user.email}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                    {user.role || "User"}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(user.status)}`}>
                    {getStatusLabel(user.status)}
                  </span>
                  {user.emailVerified && (
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-500 border border-green-500/30">
                      ✓ Verified
                    </span>
                  )}
                </div>

                <div className="mt-3 flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                  {user.stats?.membershipTier && (
                    <span className={`flex items-center gap-1 ${getMembershipColor(user.stats.membershipTier)}`}>
                      <Crown className="h-3 w-3" />
                      {user.stats.membershipTier}
                    </span>
                  )}
                </div>

                {user.stats && (
                  <div className="mt-3 pt-3 border-t border-gray-200/20 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <span className="text-gray-500">
                        <TrendingUp className="h-3 w-3 inline mr-1" />
                        {user.stats.totalBookings || 0} bookings
                      </span>
                      <span className="text-amber-500">
                        <Star className="h-3 w-3 inline mr-1" />
                        {user.stats.loyaltyPoints || 0} pts
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-3 flex items-center justify-end gap-2">
                  <button
                    onClick={() => handleEdit(user)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 hover:text-blue-500"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => toggleUserStatus(user._id, user.status)}
                    className={`p-1.5 rounded-lg transition-colors ${
                      user.status === "active"
                        ? "text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                        : "text-gray-500 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-950/30"
                    }`}
                  >
                    {user.status === "active" ? (
                      <Ban className="h-4 w-4" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => handleDelete(user)}
                    className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 hover:text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {currentUsers.map((user) => (
            <div
              key={user._id}
              className={`flex flex-col md:flex-row items-start md:items-center gap-4 p-4 rounded-xl border ${
                isDark ? 'border-gray-700 bg-gray-800 hover:bg-gray-700' : 'border-gray-200 bg-white hover:bg-gray-50'
              } transition-all duration-300 hover:shadow-lg`}
            >
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <UserAvatar user={user} size="sm" />
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className={`font-semibold text-gray-900 dark:text-gray-100`}>
                      {user.name}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getRoleColor(user.role)}`}>
                      {user.role || "User"}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(user.status)}`}>
                      {getStatusLabel(user.status)}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </span>
                    {user.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {user.phone}
                      </span>
                    )}
                    {user.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {user.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Joined {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                    {user.stats?.membershipTier && (
                      <span className={`flex items-center gap-1 ${getMembershipColor(user.stats.membershipTier)}`}>
                        <Crown className="h-3 w-3" />
                        {user.stats.membershipTier}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleEdit(user)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 hover:text-blue-500"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => toggleUserStatus(user._id, user.status)}
                  className={`p-1.5 rounded-lg transition-colors ${
                    user.status === "active"
                      ? "text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                      : "text-gray-500 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-950/30"
                  }`}
                >
                  {user.status === "active" ? (
                    <Ban className="h-4 w-4" />
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                </button>
                <button
                  onClick={() => handleDelete(user)}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-500 hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            disabled={currentPage === 1}
            className={`p-2 rounded-xl transition-all ${
              currentPage === 1
                ? isDark ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          {[...Array(Math.min(totalPages, 5))].map((_, i) => {
            let pageNum;
            if (totalPages <= 5) {
              pageNum = i + 1;
            } else if (currentPage <= 3) {
              pageNum = i + 1;
            } else if (currentPage >= totalPages - 2) {
              pageNum = totalPages - 4 + i;
            } else {
              pageNum = currentPage - 2 + i;
            }
            return (
              <button
                key={i}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-10 h-10 rounded-xl font-medium transition-all ${
                  currentPage === pageNum
                    ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                    : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {pageNum}
              </button>
            );
          })}
          <button
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-xl transition-all ${
              currentPage === totalPages
                ? isDark ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className={`max-w-md w-full mx-4 p-6 rounded-2xl ${isDark ? 'bg-gray-900' : 'bg-white'} shadow-2xl`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Delete User
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  This action cannot be undone
                </p>
              </div>
            </div>
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              Are you sure you want to delete <strong>"{selectedUser.name}"</strong>?
              This will permanently remove their account and all associated data.
            </p>
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedUser(null);
                }}
                className={`flex-1 px-4 py-2.5 rounded-xl ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-all`}
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={`max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 rounded-2xl ${isDark ? 'bg-gray-900' : 'bg-white'} shadow-2xl`}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <UserAvatar user={selectedUser} size="sm" />
                <div>
                  <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    Edit User
                  </h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {selectedUser.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedUser(null);
                }}
                className={`p-2 rounded-full ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }} className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Full Name *
                </label>
                <input
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({...editFormData, name: e.target.value})}
                  className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                    isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
                  } border focus:border-amber-500 transition-colors`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Email *
                </label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({...editFormData, email: e.target.value})}
                  className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                    isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
                  } border focus:border-amber-500 transition-colors`}
                  required
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Role
                </label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({...editFormData, role: e.target.value})}
                  className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                    isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
                  } border focus:border-amber-500 transition-colors`}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Status
                </label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                  className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                    isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
                  } border focus:border-amber-500 transition-colors`}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Phone
                </label>
                <input
                  type="tel"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({...editFormData, phone: e.target.value})}
                  className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                    isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
                  } border focus:border-amber-500 transition-colors`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Location
                </label>
                <input
                  type="text"
                  value={editFormData.location}
                  onChange={(e) => setEditFormData({...editFormData, location: e.target.value})}
                  className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                    isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
                  } border focus:border-amber-500 transition-colors`}
                />
              </div>
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Bio
                </label>
                <textarea
                  rows={2}
                  value={editFormData.bio}
                  onChange={(e) => setEditFormData({...editFormData, bio: e.target.value})}
                  className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                    isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
                  } border focus:border-amber-500 transition-colors resize-none`}
                />
              </div>
              <div className="flex items-center gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedUser(null);
                  }}
                  className={`flex-1 px-4 py-2.5 rounded-xl ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-all`}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
// pages/admin/AdminContact.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../hooks/useToast";
import {
  MessageSquare,
  Mail,
  Send,
  Reply,
  Archive,
  Trash2,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  User,
  Phone,
  Calendar,
  Star,
  Flag,
  Paperclip,
  Smile,
  MoreVertical,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  X,
  Eye,
  EyeOff,
  Bot,
  Sparkles,
  Settings as SettingsIcon,
  Plus,
  Edit,
  Delete,
  Copy,
  Zap,
  Shield,
  MessageCircle,
  Users,
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Clock as ClockIcon,
  Check,
  AlertTriangle,
  Info,
  FileText,
  Download,
  Upload,
  Printer,
  Share2,
  Link2,
  ExternalLink,
  Globe,
  MapPin,
  Building2,
  Briefcase,
  Heart,
  Award,
  Crown,
  Gem,
  Save,
} from "lucide-react";
import axios from "../../api/axios";
import { useSocket } from '../../context/SocketContext';

const AdminContact = () => {
  const { isDark } = useTheme();
  const { showToast } = useToast();
  
  // States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("messages");
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showBulkAction, setShowBulkAction] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const { socket, isConnected, sendAdminMessage } = useSocket();
  const [stats, setStats] = useState({
    total: 0,
    unread: 0,
    replied: 0,
    archived: 0,
    spam: 0
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalMessages, setTotalMessages] = useState(0);
  const [itemsPerPage] = useState(20);

  // Auto-reply rules (AI Bot) - fetched from backend
  const [autoReplyRules, setAutoReplyRules] = useState([]);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [editingRule, setEditingRule] = useState(null);
  const [ruleFormData, setRuleFormData] = useState({
    name: "",
    trigger: "",
    reply: "",
    category: "general",
    enabled: true,
    priority: 1
  });
  const [showAutoReplyToggle, setShowAutoReplyToggle] = useState(true);
  const [autoReplyStats, setAutoReplyStats] = useState({
    totalReplies: 0,
    successfulReplies: 0,
    failedReplies: 0,
    lastReplyTime: null
  });

  // Chat Sessions States
  const [chatSessions, setChatSessions] = useState([]);
  const [chatStats, setChatStats] = useState({
    total: 0,
    active: 0,
    resolved: 0,
    pending: 0,
    closed: 0
  });
  const [chatSearchTerm, setChatSearchTerm] = useState("");
  const [chatFilterStatus, setChatFilterStatus] = useState("all");
  const [chatCurrentPage, setChatCurrentPage] = useState(1);
  const [chatTotalPages, setChatTotalPages] = useState(1);
  const [chatTotalMessages, setChatTotalMessages] = useState(0);
  const [showChatDetailModal, setShowChatDetailModal] = useState(false);
  const [selectedChatSession, setSelectedChatSession] = useState(null);
  const [showCreateRuleFromChat, setShowCreateRuleFromChat] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState("");
  const [adminReplyText, setAdminReplyText] = useState("");
  const [isSendingAdminReply, setIsSendingAdminReply] = useState(false);

  // Live Chat Settings
  const [liveChatSettings, setLiveChatSettings] = useState({
    enabled: true,
    autoResponse: true,
    responseDelay: 2,
    greetingMessage: "👋 Hello! Welcome to Alveovita Wellness. How can I help you today?",
    offlineMessage: "We're currently offline. Please leave a message and we'll get back to you within 24 hours.",
    workingHours: {
      start: "09:00",
      end: "18:00",
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    }
  });

  const destinationCategories = ["wellness", "medical", "corporate", "special", "general"];
  const destinationStatuses = ["active", "inactive", "upcoming", "draft"];

  // ========== FUNCTION DEFINITIONS ==========
  
  const updateStats = (messageList) => {
    const total = messageList.length;
    const unread = messageList.filter(m => m.status === "unread").length;
    const replied = messageList.filter(m => m.replies && m.replies.length > 0).length;
    const archived = messageList.filter(m => m.isArchived).length;
    const spam = messageList.filter(m => m.isSpam).length;
    setStats({ total, unread, replied, archived, spam });
  };

  const updateChatStats = (sessions) => {
    setChatStats({
      total: sessions.length,
      active: sessions.filter(s => s.status === 'active').length,
      resolved: sessions.filter(s => s.status === 'resolved').length,
      pending: sessions.filter(s => s.status === 'pending').length,
      closed: sessions.filter(s => s.status === 'closed').length
    });
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      
      const params = new URLSearchParams();
      params.append('page', currentPage);
      params.append('limit', itemsPerPage);
      if (searchTerm) params.append('search', searchTerm);
      if (filterStatus !== 'all') params.append('status', filterStatus);
      if (filterCategory !== 'all') params.append('category', filterCategory);

      const response = await axios.get(`/contact?${params.toString()}`);
      
      if (response.data.success) {
        setMessages(response.data.contacts || []);
        setTotalMessages(response.data.pagination?.total || 0);
        setTotalPages(response.data.pagination?.pages || 1);
        updateStats(response.data.contacts || []);
      }
    } catch (error) {
      console.error("Error loading messages:", error);
      showToast("Failed to load messages", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadAutoReplyRules = async () => {
    try {
      const response = await axios.get('/auto-reply');
      if (response.data.success) {
        setAutoReplyRules(response.data.rules || []);
      }
    } catch (error) {
      console.error("Error loading auto-reply rules:", error);
    }
  };

  const loadChatSessions = async () => {
    try {
      const params = new URLSearchParams();
      params.append('page', chatCurrentPage);
      params.append('limit', 20);
      if (chatSearchTerm) params.append('search', chatSearchTerm);
      if (chatFilterStatus !== 'all') params.append('status', chatFilterStatus);

      const response = await axios.get(`/chat-sessions?${params.toString()}`);
      if (response.data.success) {
        setChatSessions(response.data.sessions || []);
        setChatTotalMessages(response.data.pagination?.total || 0);
        setChatTotalPages(response.data.pagination?.pages || 1);
        updateChatStats(response.data.sessions || []);
      }
    } catch (error) {
      console.error("Error loading chat sessions:", error);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadMessages();
    loadAutoReplyRules();
    loadChatSessions();
  };

  const handleMessageClick = async (message) => {
    setSelectedMessage(message);
    if (message.status === "unread" && !message.isSpam) {
      try {
        await axios.put(`/contact/${message._id}/status`, { status: "read" });
        loadMessages();
      } catch (error) {
        console.error("Error updating message status:", error);
      }
    }
  };

  const handleReply = async () => {
    if (!replyText.trim()) {
      showToast("Please enter a reply message", "error");
      return;
    }

    try {
      await axios.post(`/contact/${selectedMessage._id}/reply`, { content: replyText });
      showToast("Reply sent successfully!", "success");
      setReplyText("");
      setShowReplyModal(false);
      loadMessages();
    } catch (error) {
      console.error("Error sending reply:", error);
      showToast("Failed to send reply", "error");
    }
  };

  const handleDelete = async (messageId) => {
    try {
      await axios.delete(`/contact/${messageId}`);
      showToast("Message deleted", "success");
      setShowDeleteModal(false);
      setSelectedMessage(null);
      loadMessages();
    } catch (error) {
      console.error("Error deleting message:", error);
      showToast("Failed to delete message", "error");
    }
  };

  const handleArchive = async (messageId) => {
    try {
      await axios.post(`/contact/${messageId}/archive`);
      showToast("Message archived/unarchived", "success");
      loadMessages();
    } catch (error) {
      console.error("Error archiving message:", error);
      showToast("Failed to archive message", "error");
    }
  };

  const handleMarkSpam = async (messageId) => {
    try {
      await axios.post(`/contact/${messageId}/spam`);
      showToast("Spam status toggled", "success");
      loadMessages();
    } catch (error) {
      console.error("Error marking spam:", error);
      showToast("Failed to mark as spam", "error");
    }
  };

  // Auto-reply CRUD with backend API
  const handleAddRule = async () => {
    try {
      const response = await axios.post('/auto-reply', ruleFormData);
      if (response.data.success) {
        setAutoReplyRules([...autoReplyRules, response.data.rule]);
        setShowRuleModal(false);
        setRuleFormData({ name: "", trigger: "", reply: "", category: "general", enabled: true, priority: 1 });
        showToast("Auto-reply rule added successfully!", "success");
      }
    } catch (error) {
      console.error("Error adding rule:", error);
      showToast(error.response?.data?.message || "Failed to add rule", "error");
    }
  };

  const handleEditRule = (rule) => {
    setEditingRule(rule);
    setRuleFormData({
      name: rule.name || "",
      trigger: rule.trigger || "",
      reply: rule.reply || "",
      category: rule.category || "general",
      enabled: rule.enabled !== undefined ? rule.enabled : true,
      priority: rule.priority || 1
    });
    setShowRuleModal(true);
  };

  const handleUpdateRule = async () => {
    try {
      const response = await axios.put(`/auto-reply/${editingRule._id}`, ruleFormData);
      if (response.data.success) {
        const updatedRules = autoReplyRules.map(r => 
          r._id === editingRule._id ? response.data.rule : r
        );
        setAutoReplyRules(updatedRules);
        setShowRuleModal(false);
        setEditingRule(null);
        setRuleFormData({ name: "", trigger: "", reply: "", category: "general", enabled: true, priority: 1 });
        showToast("Auto-reply rule updated successfully!", "success");
      }
    } catch (error) {
      console.error("Error updating rule:", error);
      showToast(error.response?.data?.message || "Failed to update rule", "error");
    }
  };

  const handleDeleteRule = async (ruleId) => {
    try {
      await axios.delete(`/auto-reply/${ruleId}`);
      const updatedRules = autoReplyRules.filter(r => r._id !== ruleId);
      setAutoReplyRules(updatedRules);
      showToast("Auto-reply rule deleted", "success");
    } catch (error) {
      console.error("Error deleting rule:", error);
      showToast(error.response?.data?.message || "Failed to delete rule", "error");
    }
  };

  const handleToggleRule = async (ruleId) => {
    try {
      const response = await axios.post(`/auto-reply/${ruleId}/toggle`);
      if (response.data.success) {
        const updatedRules = autoReplyRules.map(r => 
          r._id === ruleId ? response.data.rule : r
        );
        setAutoReplyRules(updatedRules);
        showToast("Rule toggled", "success");
      }
    } catch (error) {
      console.error("Error toggling rule:", error);
      showToast(error.response?.data?.message || "Failed to toggle rule", "error");
    }
  };

  // Chat Session Handlers
  const handleChatSessionClick = async (session) => {
    try {
      const response = await axios.get(`/chat-sessions/${session._id}`);
      if (response.data.success) {
        setSelectedChatSession(response.data.session);
        setShowChatDetailModal(true);
        setAdminReplyText("");
      }
    } catch (error) {
      console.error("Error loading chat session detail:", error);
      showToast("Failed to load chat session", "error");
    }
  };

  const handleViewChatSession = (session) => {
    handleChatSessionClick(session);
  };

  const handleDeleteChatSession = async (sessionId) => {
    if (!window.confirm('Are you sure you want to delete this chat session?')) return;
    try {
      await axios.delete(`/chat-sessions/${sessionId}`);
      showToast("Chat session deleted", "success");
      loadChatSessions();
    } catch (error) {
      console.error("Error deleting chat session:", error);
      showToast("Failed to delete chat session", "error");
    }
  };

  const handleResolveChatSession = async (sessionId) => {
    try {
      await axios.put(`/chat-sessions/${sessionId}/status`, { status: 'resolved' });
      
      // Notify via Socket.IO
      if (socket && isConnected) {
        socket.emit('resolve-session', { sessionId });
      }
      
      showToast('Chat session resolved', 'success');
      loadChatSessions();
      setShowChatDetailModal(false);
    } catch (error) {
      console.error("Error resolving session:", error);
      showToast("Failed to resolve session", "error");
    }
  };

  const handleResolveQuestion = async (sessionId, questionIndex) => {
    try {
      await axios.post(`/chat-sessions/${sessionId}/resolve-question`, {
        questionIndex
      });
      // Refresh session
      const response = await axios.get(`/chat-sessions/${sessionId}`);
      if (response.data.success) {
        setSelectedChatSession(response.data.session);
      }
      showToast('Question marked as resolved', 'success');
    } catch (error) {
      console.error("Error resolving question:", error);
      showToast("Failed to resolve question", "error");
    }
  };

  const handleCreateRuleFromQuestion = (question) => {
    setSelectedQuestion(question);
    setRuleFormData({
      name: `Auto-reply for: ${question.substring(0, 40)}${question.length > 40 ? '...' : ''}`,
      trigger: question,
      reply: '',
      category: 'general',
      enabled: true,
      priority: autoReplyRules.length + 1
    });
    setShowRuleModal(true);
    setShowChatDetailModal(false);
  };

  const handleCreateRulesFromAllQuestions = () => {
    if (!selectedChatSession) return;
    
    const questions = selectedChatSession.unresolvedQuestions?.filter(q => !q.resolved) || [];
    if (questions.length === 0) {
      showToast("No unanswered questions to create rules from", "info");
      return;
    }

    // Create rules for each question with a delay
    questions.forEach((q, idx) => {
      setTimeout(() => {
        handleCreateRuleFromQuestion(q.question);
      }, idx * 800);
    });
    
    showToast(`Creating rules for ${questions.length} unanswered questions...`, "success");
  };

  const handleAdminReply = async () => {
    if (!adminReplyText.trim() || !selectedChatSession) return;
    
    setIsSendingAdminReply(true);
    try {
      // Send via Socket.IO for real-time delivery
      sendAdminMessage({
        sessionId: selectedChatSession._id,
        text: adminReplyText.trim(),
        adminName: 'Admin'
      });
      
      // Also save to database via API
      await axios.post(`/chat-sessions/${selectedChatSession._id}/messages`, {
        text: adminReplyText.trim(),
        sender: 'admin'
      });
      
      // Refresh session
      const response = await axios.get(`/chat-sessions/${selectedChatSession._id}`);
      if (response.data.success) {
        setSelectedChatSession(response.data.session);
      }
      
      setAdminReplyText('');
      showToast('Reply sent to user!', 'success');
    } catch (error) {
      console.error('Error sending admin reply:', error);
      showToast('Failed to send reply', 'error');
    } finally {
      setIsSendingAdminReply(false);
    }
  };

  // Get status badge
  const getStatusBadge = (message) => {
    if (message.isSpam) {
      return { color: "bg-red-500/20 text-red-500 border-red-500/30", label: "Spam" };
    }
    if (message.isArchived) {
      return { color: "bg-gray-500/20 text-gray-500 border-gray-500/30", label: "Archived" };
    }
    if (message.replies && message.replies.length > 0) {
      return { color: "bg-green-500/20 text-green-500 border-green-500/30", label: "Replied" };
    }
    if (message.status === "unread") {
      return { color: "bg-amber-500/20 text-amber-500 border-amber-500/30", label: "Unread" };
    }
    return { color: "bg-blue-500/20 text-blue-500 border-blue-500/30", label: "Read" };
  };

  // Get category color
  const getCategoryColor = (category) => {
    const colors = {
      wellness: "bg-emerald-500/20 text-emerald-500",
      medical: "bg-blue-500/20 text-blue-500",
      corporate: "bg-purple-500/20 text-purple-500",
      special: "bg-amber-500/20 text-amber-500",
      general: "bg-gray-500/20 text-gray-500"
    };
    return colors[category] || colors.general;
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return `${diff} seconds ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
    return date.toLocaleDateString();
  };

  // ========== USE EFFECTS ==========
  
  // Load initial data
  useEffect(() => {
    loadMessages();
    loadAutoReplyRules();
    loadChatSessions();
  }, [searchTerm, filterStatus, filterCategory, currentPage, chatSearchTerm, chatFilterStatus, chatCurrentPage]);

  // Socket event listeners - MOVED AFTER all function definitions
  useEffect(() => {
    if (!socket) return;

    // Listen for new chat sessions
    socket.on('new-chat-session', (data) => {
      showToast(`New chat from ${data.userName}`, 'info');
      loadChatSessions(); // Refresh the list
    });

    // Listen for unanswered questions
    socket.on('admin-notification', (data) => {
      if (data.type === 'unanswered-question') {
        showToast(`New question from ${data.userName}: "${data.question}"`, 'warning');
      }
    });

    // Listen for session updates
    socket.on('session-updated', (data) => {
      loadChatSessions(); // Refresh the list
    });

    return () => {
      socket.off('new-chat-session');
      socket.off('admin-notification');
      socket.off('session-updated');
    };
  }, [socket, showToast]); // Removed loadChatSessions from deps to avoid re-subscription

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-10 w-10 text-amber-500 animate-spin mb-4" />
        <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Loading messages...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-amber-500" />
            Contact Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage customer messages and live chat automation • {totalMessages} total messages
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

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-amber-500" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{totalMessages}</p>
        </div>
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-amber-500" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Unread</span>
          </div>
          <p className="text-2xl font-bold text-amber-500">{stats.unread}</p>
        </div>
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Replied</span>
          </div>
          <p className="text-2xl font-bold text-green-500">{stats.replied}</p>
        </div>
        <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="flex items-center gap-2">
            <Flag className="h-4 w-4 text-red-500" />
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Spam</span>
          </div>
          <p className="text-2xl font-bold text-red-500">{stats.spam}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-800 pb-2">
        <button
          onClick={() => setActiveTab("messages")}
          className={`px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
            activeTab === "messages"
              ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30"
              : isDark
                ? "hover:bg-gray-800 text-gray-400 hover:text-gray-200"
                : "hover:bg-gray-100 text-gray-600 hover:text-gray-800"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Messages ({totalMessages})
        </button>
        <button
          onClick={() => setActiveTab("auto-reply")}
          className={`px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
            activeTab === "auto-reply"
              ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30"
              : isDark
                ? "hover:bg-gray-800 text-gray-400 hover:text-gray-200"
                : "hover:bg-gray-100 text-gray-600 hover:text-gray-800"
          }`}
        >
          <Bot className="w-4 h-4" />
          Auto-Reply Rules ({autoReplyRules.length})
        </button>
        <button
          onClick={() => setActiveTab("chat-sessions")}
          className={`px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
            activeTab === "chat-sessions"
              ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30"
              : isDark
                ? "hover:bg-gray-800 text-gray-400 hover:text-gray-200"
                : "hover:bg-gray-100 text-gray-600 hover:text-gray-800"
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          Chat Sessions ({chatStats.total})
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`px-4 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
            activeTab === "settings"
              ? "bg-amber-500 text-white shadow-lg shadow-amber-500/30"
              : isDark
                ? "hover:bg-gray-800 text-gray-400 hover:text-gray-200"
                : "hover:bg-gray-100 text-gray-600 hover:text-gray-800"
          }`}
        >
          <SettingsIcon className="w-4 h-4" />
          Settings
        </button>
      </div>

      {/* Tab Content - Messages */}
      {activeTab === "messages" && (
        <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-xl ${
                    isDark 
                      ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400' 
                      : 'bg-gray-50 text-gray-800 border-gray-200'
                  } focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none`}
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className={`px-4 py-2.5 rounded-xl outline-none text-sm ${
                    isDark 
                      ? 'bg-gray-700 text-white border-gray-600' 
                      : 'bg-gray-50 text-gray-800 border-gray-200'
                  } border focus:border-amber-500 transition-colors`}
                >
                  <option value="all">All Status</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                  <option value="replied">Replied</option>
                  <option value="spam">Spam</option>
                </select>
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className={`px-4 py-2.5 rounded-xl outline-none text-sm ${
                    isDark 
                      ? 'bg-gray-700 text-white border-gray-600' 
                      : 'bg-gray-50 text-gray-800 border-gray-200'
                  } border focus:border-amber-500 transition-colors`}
                >
                  <option value="all">All Categories</option>
                  <option value="wellness">Wellness</option>
                  <option value="medical">Medical</option>
                  <option value="corporate">Corporate</option>
                  <option value="special">Special</option>
                  <option value="general">General</option>
                </select>
              </div>
            </div>

            {/* Messages List */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {messages.length === 0 ? (
                <div className={`p-12 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No messages found</p>
                </div>
              ) : (
                messages.map((message) => {
                  const status = getStatusBadge(message);
                  const categoryColor = getCategoryColor(message.category);
                  return (
                    <div
                      key={message._id}
                      onClick={() => handleMessageClick(message)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                        message.status === "unread" && !message.isSpam && !message.isArchived
                          ? `${isDark ? 'bg-amber-900/20 border-amber-800' : 'bg-amber-50 border-amber-200'}`
                          : isDark 
                            ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700' 
                            : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                                {message.name.charAt(0)}
                              </div>
                              <div>
                                <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                  {message.name}
                                </p>
                                <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                  {message.email}
                                </p>
                              </div>
                            </div>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${status.color}`}>
                              {status.label}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${categoryColor}`}>
                              {message.category}
                            </span>
                            {message.replies && message.replies.length > 0 && (
                              <span className="flex items-center gap-1 text-xs text-green-500">
                                <CheckCircle className="w-3 h-3" />
                                {message.replies.length} reply
                              </span>
                            )}
                          </div>
                          <p className={`font-medium mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            {message.subject}
                          </p>
                          <p className={`text-sm mt-1 line-clamp-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            {message.message}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                            <span className="flex items-center gap-1">
                              <ClockIcon className="w-3 h-3" />
                              {formatDate(message.createdAt)}
                            </span>
                            {message.phone && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {message.phone}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                          {!message.isSpam && !message.isArchived && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMessage(message);
                                setReplyText("");
                                setShowReplyModal(true);
                              }}
                              className="p-2 rounded-lg hover:bg-amber-500/10 text-amber-500 transition-colors"
                            >
                              <Reply className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleArchive(message._id);
                            }}
                            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-500 transition-colors"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkSpam(message._id);
                            }}
                            className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                          >
                            <Flag className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMessage(message);
                              setShowDeleteModal(true);
                            }}
                            className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

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
          </div>
        </div>
      )}

      {/* Tab Content - Auto-Reply */}
      {activeTab === "auto-reply" && (
        <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="space-y-6">
            {/* Auto-reply Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                  <Bot className="h-4 w-4 text-amber-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total Replies</span>
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{autoReplyStats.totalReplies}</p>
              </div>
              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Successful</span>
                </div>
                <p className="text-2xl font-bold text-green-500">{autoReplyStats.successfulReplies}</p>
              </div>
              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Failed</span>
                </div>
                <p className="text-2xl font-bold text-red-500">{autoReplyStats.failedReplies}</p>
              </div>
              <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                  <ClockIcon className="h-4 w-4 text-blue-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Last Reply</span>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {autoReplyStats.lastReplyTime ? formatDate(autoReplyStats.lastReplyTime) : "Never"}
                </p>
              </div>
            </div>

            {/* Auto-reply Toggle */}
            <div className={`p-4 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'} flex items-center justify-between`}>
              <div className="flex items-center gap-3">
                <Zap className="w-6 h-6 text-amber-500" />
                <div>
                  <h3 className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Auto-Reply System</h3>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Automatically reply to customer messages based on keywords
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showAutoReplyToggle}
                  onChange={() => setShowAutoReplyToggle(!showAutoReplyToggle)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 dark:peer-focus:ring-amber-800 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-amber-500"></div>
              </label>
            </div>

            {/* Add Rule Button */}
            <button
              onClick={() => {
                setEditingRule(null);
                setRuleFormData({ name: "", trigger: "", reply: "", category: "general", enabled: true, priority: 1 });
                setShowRuleModal(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:scale-105 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Auto-Reply Rule
            </button>

            {/* Rules List */}
            <div className="space-y-3">
              {autoReplyRules.length === 0 ? (
                <div className={`p-8 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <Bot className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No auto-reply rules created yet.</p>
                  <p className="text-sm">Create rules to automate responses to common customer questions.</p>
                </div>
              ) : (
                autoReplyRules.map((rule) => (
                  <div
                    key={rule._id}
                    className={`p-4 rounded-xl border ${
                      rule.enabled 
                        ? isDark ? 'border-green-700 bg-green-900/10' : 'border-green-200 bg-green-50'
                        : isDark ? 'border-gray-600 bg-gray-700/30' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h4 className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            {rule.name}
                          </h4>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(rule.category)}`}>
                            {rule.category}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            rule.enabled 
                              ? 'bg-green-500/20 text-green-500' 
                              : 'bg-gray-500/20 text-gray-500'
                          }`}>
                            {rule.enabled ? 'Active' : 'Disabled'}
                          </span>
                          <span className="text-xs text-gray-400">Priority: {rule.priority}</span>
                        </div>
                        <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <span className="font-medium">Trigger:</span> {rule.trigger}
                        </p>
                        <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <span className="font-medium">Reply:</span> {rule.reply}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                        <button
                          onClick={() => handleToggleRule(rule._id)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            rule.enabled
                              ? 'text-green-500 hover:bg-green-500/10'
                              : 'text-gray-500 hover:bg-gray-500/10'
                          }`}
                        >
                          {rule.enabled ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
                        </button>
                        <button
                          onClick={() => handleEditRule(rule)}
                          className="p-1.5 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteRule(rule._id)}
                          className="p-1.5 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content - Chat Sessions */}
      {activeTab === "chat-sessions" && (
        <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="space-y-4">
            {/* Chat Sessions Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-amber-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Total</span>
                </div>
                <p className="text-xl font-bold text-gray-900 dark:text-white">{chatStats.total}</p>
              </div>
              <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-green-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Active</span>
                </div>
                <p className="text-xl font-bold text-green-500">{chatStats.active}</p>
              </div>
              <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Resolved</span>
                </div>
                <p className="text-xl font-bold text-blue-500">{chatStats.resolved}</p>
              </div>
              <div className={`p-3 rounded-xl ${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-amber-500" />
                  <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Pending</span>
                </div>
                <p className="text-xl font-bold text-amber-500">{chatStats.pending}</p>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="flex flex-col gap-4 md:flex-row md:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search chat sessions..."
                  value={chatSearchTerm}
                  onChange={(e) => setChatSearchTerm(e.target.value)}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-xl ${
                    isDark 
                      ? 'bg-gray-700 text-white border-gray-600 placeholder-gray-400' 
                      : 'bg-gray-50 text-gray-800 border-gray-200'
                  } focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none`}
                />
              </div>
              <select
                value={chatFilterStatus}
                onChange={(e) => setChatFilterStatus(e.target.value)}
                className={`px-4 py-2.5 rounded-xl outline-none text-sm ${
                  isDark 
                    ? 'bg-gray-700 text-white border-gray-600' 
                    : 'bg-gray-50 text-gray-800 border-gray-200'
                } border focus:border-amber-500 transition-colors`}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Chat Sessions List */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
              {chatSessions.length === 0 ? (
                <div className={`p-12 text-center ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  <MessageCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No chat sessions found</p>
                </div>
              ) : (
                chatSessions.map((session) => (
                  <div
                    key={session._id}
                    onClick={() => handleChatSessionClick(session)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all hover:shadow-md ${
                      session.status === 'active'
                        ? `${isDark ? 'bg-green-900/20 border-green-800' : 'bg-green-50 border-green-200'}`
                        : isDark 
                          ? 'bg-gray-700/50 border-gray-600 hover:bg-gray-700' 
                          : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 flex-wrap">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                              {session.userName.charAt(0)}
                            </div>
                            <div>
                              <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                {session.userName}
                              </p>
                              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {session.userEmail}
                              </p>
                            </div>
                          </div>
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${
                            session.status === 'active' ? 'bg-green-500/20 text-green-500 border-green-500/30' :
                            session.status === 'resolved' ? 'bg-blue-500/20 text-blue-500 border-blue-500/30' :
                            session.status === 'closed' ? 'bg-gray-500/20 text-gray-500 border-gray-500/30' :
                            'bg-amber-500/20 text-amber-500 border-amber-500/30'
                          }`}>
                            {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                          </span>
                          <span className="text-xs text-gray-400">
                            {session.messages?.length || 0} messages
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <ClockIcon className="w-3 h-3" />
                            {formatDate(session.openedAt)}
                          </span>
                          {session.unresolvedQuestions && session.unresolvedQuestions.filter(q => !q.resolved).length > 0 && (
                            <span className="flex items-center gap-1 text-amber-500">
                              <AlertCircle className="w-3 h-3" />
                              {session.unresolvedQuestions.filter(q => !q.resolved).length} unanswered
                            </span>
                          )}
                        </div>
                        {session.messages && session.messages.length > 0 && (
                          <p className={`text-sm mt-2 line-clamp-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                            <span className="font-medium">Last:</span> {session.messages[session.messages.length - 1].text}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewChatSession(session);
                          }}
                          className="p-2 rounded-lg hover:bg-blue-500/10 text-blue-500 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteChatSession(session._id);
                          }}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Pagination */}
            {chatTotalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <button
                  onClick={() => setChatCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={chatCurrentPage === 1}
                  className={`p-2 rounded-xl transition-all ${
                    chatCurrentPage === 1
                      ? isDark ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                {[...Array(Math.min(chatTotalPages, 5))].map((_, i) => {
                  let pageNum;
                  if (chatTotalPages <= 5) {
                    pageNum = i + 1;
                  } else if (chatCurrentPage <= 3) {
                    pageNum = i + 1;
                  } else if (chatCurrentPage >= chatTotalPages - 2) {
                    pageNum = chatTotalPages - 4 + i;
                  } else {
                    pageNum = chatCurrentPage - 2 + i;
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => setChatCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-xl font-medium transition-all ${
                        chatCurrentPage === pageNum
                          ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/30'
                          : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setChatCurrentPage(prev => Math.min(chatTotalPages, prev + 1))}
                  disabled={chatCurrentPage === chatTotalPages}
                  className={`p-2 rounded-xl transition-all ${
                    chatCurrentPage === chatTotalPages
                      ? isDark ? 'bg-gray-800 text-gray-500 cursor-not-allowed' : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : isDark ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab Content - Settings */}
      {activeTab === "settings" && (
        <div className={`p-6 rounded-2xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className="space-y-6">
            <div>
              <h3 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-4`}>Live Chat Settings</h3>
              <div className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div>
                    <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Enable Live Chat</div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Allow customers to chat with support</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={liveChatSettings.enabled}
                    onChange={(e) => {
                      const newSettings = {...liveChatSettings, enabled: e.target.checked};
                      setLiveChatSettings(newSettings);
                      localStorage.setItem('alveovita_livechat_settings', JSON.stringify(newSettings));
                    }}
                    className="text-amber-500 focus:ring-amber-500 rounded-lg w-5 h-5"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                  <div>
                    <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>Auto-Response</div>
                    <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Send automatic responses to chat messages</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={liveChatSettings.autoResponse}
                    onChange={(e) => {
                      const newSettings = {...liveChatSettings, autoResponse: e.target.checked};
                      setLiveChatSettings(newSettings);
                      localStorage.setItem('alveovita_livechat_settings', JSON.stringify(newSettings));
                    }}
                    className="text-amber-500 focus:ring-amber-500 rounded-lg w-5 h-5"
                  />
                </label>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Response Delay (seconds)
                  </label>
                  <input
                    type="number"
                    value={liveChatSettings.responseDelay}
                    onChange={(e) => {
                      const newSettings = {...liveChatSettings, responseDelay: parseInt(e.target.value)};
                      setLiveChatSettings(newSettings);
                      localStorage.setItem('alveovita_livechat_settings', JSON.stringify(newSettings));
                    }}
                    min="1"
                    max="10"
                    className={`w-32 px-4 py-2.5 rounded-xl outline-none ${
                      isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-800 border-gray-200'
                    } border focus:border-amber-500 transition-colors`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Greeting Message
                  </label>
                  <textarea
                    rows={2}
                    value={liveChatSettings.greetingMessage}
                    onChange={(e) => {
                      const newSettings = {...liveChatSettings, greetingMessage: e.target.value};
                      setLiveChatSettings(newSettings);
                      localStorage.setItem('alveovita_livechat_settings', JSON.stringify(newSettings));
                    }}
                    className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                      isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-800 border-gray-200'
                    } border focus:border-amber-500 transition-colors resize-none`}
                  />
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Offline Message
                  </label>
                  <textarea
                    rows={2}
                    value={liveChatSettings.offlineMessage}
                    onChange={(e) => {
                      const newSettings = {...liveChatSettings, offlineMessage: e.target.value};
                      setLiveChatSettings(newSettings);
                      localStorage.setItem('alveovita_livechat_settings', JSON.stringify(newSettings));
                    }}
                    className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                      isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-800 border-gray-200'
                    } border focus:border-amber-500 transition-colors resize-none`}
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      Start Time
                    </label>
                    <input
                      type="time"
                      value={liveChatSettings.workingHours.start}
                      onChange={(e) => {
                        const newSettings = {
                          ...liveChatSettings,
                          workingHours: {...liveChatSettings.workingHours, start: e.target.value}
                        };
                        setLiveChatSettings(newSettings);
                        localStorage.setItem('alveovita_livechat_settings', JSON.stringify(newSettings));
                      }}
                      className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                        isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-800 border-gray-200'
                      } border focus:border-amber-500 transition-colors`}
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                      End Time
                    </label>
                    <input
                      type="time"
                      value={liveChatSettings.workingHours.end}
                      onChange={(e) => {
                        const newSettings = {
                          ...liveChatSettings,
                          workingHours: {...liveChatSettings.workingHours, end: e.target.value}
                        };
                        setLiveChatSettings(newSettings);
                        localStorage.setItem('alveovita_livechat_settings', JSON.stringify(newSettings));
                      }}
                      className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                        isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-800 border-gray-200'
                      } border focus:border-amber-500 transition-colors`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Working Days
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map((day) => (
                      <label key={day} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={liveChatSettings.workingHours.days.includes(day)}
                          onChange={(e) => {
                            const days = e.target.checked
                              ? [...liveChatSettings.workingHours.days, day]
                              : liveChatSettings.workingHours.days.filter(d => d !== day);
                            const newSettings = {
                              ...liveChatSettings,
                              workingHours: {...liveChatSettings.workingHours, days}
                            };
                            setLiveChatSettings(newSettings);
                            localStorage.setItem('alveovita_livechat_settings', JSON.stringify(newSettings));
                          }}
                          className="text-amber-500 focus:ring-amber-500 rounded"
                        />
                        <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{day}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => {
                    showToast("Live chat settings saved!", "success");
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:scale-105 transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply Modal */}
      {showReplyModal && selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={`max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 rounded-2xl ${isDark ? 'bg-gray-900' : 'bg-white'} shadow-2xl`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Reply to {selectedMessage.name}
              </h3>
              <button
                onClick={() => setShowReplyModal(false)}
                className={`p-2 rounded-full ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Original Message */}
            <div className={`p-4 rounded-xl mb-4 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-3 mb-2">
                <div className={`w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm`}>
                  {selectedMessage.name.charAt(0)}
                </div>
                <div>
                  <p className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {selectedMessage.name}
                  </p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    {selectedMessage.email} • {formatDate(selectedMessage.createdAt)}
                  </p>
                </div>
              </div>
              <p className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {selectedMessage.subject}
              </p>
              <p className={`text-sm mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {selectedMessage.message}
              </p>
            </div>

            {/* Reply Input */}
            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Your Reply *
              </label>
              <textarea
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                  isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
                } border focus:border-amber-500 transition-colors resize-none`}
                placeholder="Type your reply here..."
              />
            </div>

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowReplyModal(false)}
                className={`flex-1 px-4 py-2.5 rounded-xl ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-all`}
              >
                Cancel
              </button>
              <button
                onClick={handleReply}
                disabled={!replyText.trim()}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Send Reply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedMessage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={`max-w-md w-full p-6 rounded-2xl ${isDark ? 'bg-gray-900' : 'bg-white'} shadow-2xl`}>
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="w-8 h-8 text-red-500" />
              <div>
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Delete Message
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  This action cannot be undone
                </p>
              </div>
            </div>
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              Are you sure you want to delete this message from <strong>{selectedMessage.name}</strong>?
            </p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className={`flex-1 px-4 py-2.5 rounded-xl ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-all`}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(selectedMessage._id)}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Detail Modal with Admin Reply */}
      {showChatDetailModal && selectedChatSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={`max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 rounded-2xl ${isDark ? 'bg-gray-900' : 'bg-white'} shadow-2xl`}>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Chat Session - {selectedChatSession.userName}
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {selectedChatSession.userEmail} • {selectedChatSession.userPhone || 'No phone'}
                </p>
                {/* Socket Connection Status */}
                <div className="flex items-center gap-2 text-xs mt-1">
                  <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></span>
                  <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>
                    {isConnected ? '🟢 Live Connection' : '🔴 Offline'}
                  </span>
                  {isConnected && (
                    <span className="text-green-400 text-xs animate-pulse">●</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setShowChatDetailModal(false)}
                className={`p-2 rounded-full ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Chat Messages */}
            <div className={`rounded-xl p-4 max-h-80 overflow-y-auto space-y-3 ${
              isDark ? 'bg-gray-800' : 'bg-gray-50'
            }`}>
              {selectedChatSession.messages && selectedChatSession.messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-tr-none'
                        : msg.sender === 'admin'
                          ? isDark ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-700'
                          : isDark
                            ? 'bg-gray-700 text-gray-300 rounded-tl-none'
                            : 'bg-white text-gray-700 rounded-tl-none shadow-sm'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                    <span className={`text-[10px] mt-1 block ${
                      msg.sender === 'user' ? 'text-white/70' : 'text-gray-400'
                    }`}>
                      {new Date(msg.timestamp).toLocaleTimeString()}
                      {msg.isAutoReply && ' 🤖'}
                      {msg.matchedRule && ' (Auto)'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Admin Reply Section */}
            <div className="mt-4 pt-4 border-t border-gray-200/20">
              <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Reply as Admin
              </label>
              <div className="flex gap-2">
                <textarea
                  rows={2}
                  value={adminReplyText}
                  onChange={(e) => setAdminReplyText(e.target.value)}
                  placeholder="Type your reply to the user..."
                  className={`flex-1 px-4 py-2.5 rounded-xl outline-none text-sm resize-none ${
                    isDark ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-800 border-gray-200'
                  } border focus:border-amber-500 transition-colors`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && e.shiftKey) {
                      e.preventDefault();
                      handleAdminReply();
                    }
                  }}
                />
                <button
                  onClick={handleAdminReply}
                  disabled={!adminReplyText.trim() || isSendingAdminReply}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSendingAdminReply ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Send
                </button>
              </div>
              <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Shift + Enter to send
              </p>
            </div>

            {/* Unresolved Questions */}
            {selectedChatSession.unresolvedQuestions && selectedChatSession.unresolvedQuestions.filter(q => !q.resolved).length > 0 && (
              <div className="mt-6">
                <h4 className={`font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Unanswered Questions
                </h4>
                <div className="space-y-3">
                  {selectedChatSession.unresolvedQuestions.filter(q => !q.resolved).map((q, idx) => (
                    <div key={idx} className={`p-3 rounded-xl ${isDark ? 'bg-amber-900/20' : 'bg-amber-50'} border border-amber-500/30`}>
                      <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        <span className="font-medium">Q:</span> {q.question}
                      </p>
                      <div className="flex gap-2 mt-2">
                        <button
                          onClick={() => handleCreateRuleFromQuestion(q.question)}
                          className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 transition-all"
                        >
                          Create Rule
                        </button>
                        <button
                          onClick={() => handleResolveQuestion(selectedChatSession._id, idx)}
                          className="px-3 py-1.5 bg-green-500 text-white rounded-lg text-sm hover:bg-green-600 transition-all"
                        >
                          Mark Resolved
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Create Rules from All Unanswered Questions */}
                <button
                  onClick={handleCreateRulesFromAllQuestions}
                  className="w-full mt-3 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Rules from All Unanswered Questions
                </button>
              </div>
            )}

            {/* Session Info */}
            <div className="mt-4 pt-4 border-t border-gray-200/20">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Status:</span>
                  <span className={`ml-2 font-medium ${
                    selectedChatSession.status === 'active' ? 'text-green-500' :
                    selectedChatSession.status === 'resolved' ? 'text-blue-500' :
                    selectedChatSession.status === 'closed' ? 'text-gray-500' :
                    'text-amber-500'
                  }`}>
                    {selectedChatSession.status.charAt(0).toUpperCase() + selectedChatSession.status.slice(1)}
                  </span>
                </div>
                <div>
                  <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Messages:</span>
                  <span className="ml-2 font-medium">{selectedChatSession.messages?.length || 0}</span>
                </div>
                <div>
                  <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Opened:</span>
                  <span className="ml-2 font-medium">{formatDate(selectedChatSession.openedAt)}</span>
                </div>
                <div>
                  <span className={`${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Last Activity:</span>
                  <span className="ml-2 font-medium">{formatDate(selectedChatSession.lastMessageAt)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowChatDetailModal(false)}
                className={`flex-1 px-4 py-2.5 rounded-xl ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-all`}
              >
                Close
              </button>
              {selectedChatSession.status === 'active' && (
                <button
                  onClick={() => handleResolveChatSession(selectedChatSession._id)}
                  className="flex-1 px-4 py-2.5 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-all"
                >
                  Resolve Session
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Rule Modal */}
      {showRuleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={`max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 rounded-2xl ${isDark ? 'bg-gray-900' : 'bg-white'} shadow-2xl`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {editingRule ? 'Edit Auto-Reply Rule' : 'Add Auto-Reply Rule'}
              </h3>
              <button
                onClick={() => {
                  setShowRuleModal(false);
                  setEditingRule(null);
                  setRuleFormData({ name: "", trigger: "", reply: "", category: "general", enabled: true, priority: 1 });
                }}
                className={`p-2 rounded-full ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Rule Name *
                </label>
                <input
                  type="text"
                  value={ruleFormData.name}
                  onChange={(e) => setRuleFormData({...ruleFormData, name: e.target.value})}
                  className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                    isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
                  } border focus:border-amber-500 transition-colors`}
                  placeholder="e.g., Wellness Retreat Inquiry"
                />
                {selectedQuestion && (
                  <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Based on user question: "{selectedQuestion}"
                  </p>
                )}
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Trigger Keywords (separate with | for OR)
                </label>
                <input
                  type="text"
                  value={ruleFormData.trigger}
                  onChange={(e) => setRuleFormData({...ruleFormData, trigger: e.target.value})}
                  className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                    isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
                  } border focus:border-amber-500 transition-colors`}
                  placeholder="wellness retreat|spa|relaxation"
                />
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                  Separate multiple keywords with |
                </p>
              </div>

              <div>
                <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Auto-Reply Message *
                </label>
                <textarea
                  rows={3}
                  value={ruleFormData.reply}
                  onChange={(e) => setRuleFormData({...ruleFormData, reply: e.target.value})}
                  className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                    isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
                  } border focus:border-amber-500 transition-colors resize-none`}
                  placeholder="Thank you for your inquiry... We will get back to you soon."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Category
                  </label>
                  <select
                    value={ruleFormData.category}
                    onChange={(e) => setRuleFormData({...ruleFormData, category: e.target.value})}
                    className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                      isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
                    } border focus:border-amber-500 transition-colors`}
                  >
                    <option value="wellness">Wellness</option>
                    <option value="medical">Medical</option>
                    <option value="corporate">Corporate</option>
                    <option value="special">Special</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                    Priority
                  </label>
                  <input
                    type="number"
                    value={ruleFormData.priority}
                    onChange={(e) => setRuleFormData({...ruleFormData, priority: parseInt(e.target.value)})}
                    min="1"
                    max="10"
                    className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                      isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
                    } border focus:border-amber-500 transition-colors`}
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ruleFormData.enabled}
                  onChange={(e) => setRuleFormData({...ruleFormData, enabled: e.target.checked})}
                  className="text-amber-500 focus:ring-amber-500 rounded w-5 h-5"
                />
                <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Enable this rule</span>
              </label>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => {
                    setShowRuleModal(false);
                    setEditingRule(null);
                    setRuleFormData({ name: "", trigger: "", reply: "", category: "general", enabled: true, priority: 1 });
                  }}
                  className={`flex-1 px-4 py-2.5 rounded-xl ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-all`}
                >
                  Cancel
                </button>
                <button
                  onClick={editingRule ? handleUpdateRule : handleAddRule}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:scale-105 transition-all flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingRule ? 'Update Rule' : 'Add Rule'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContact;
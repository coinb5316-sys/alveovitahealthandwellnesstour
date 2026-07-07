// pages/admin/AdminReviews.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "../../api/axios";
import { useTheme } from "../../context/ThemeContext";
import { useToast } from "../../hooks/useToast";
import { useSocket } from "../../context/SocketContext";
import {
  Star,
  MessageSquare,
  Search,
  Filter,
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Mail,
  Calendar,
  RefreshCw,
  AlertCircle,
  Trash2,
  Check,
  X,
  Eye,
  Reply,
  ThumbsUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Image as ImageIcon,
  Hotel,
  Plane
} from "lucide-react";

const AdminReviews = () => {
  const { isDark } = useTheme();
  const { showToast } = useToast();
  const { socket, isConnected } = useSocket();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [totalReviews, setTotalReviews] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedReview, setSelectedReview] = useState(null);
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notification, setNotification] = useState(null);

  // Socket.IO event listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewReview = (data) => {
      setNotification({
        type: 'new',
        message: `⭐ New review from ${data.userName} on "${data.itemName}"`,
        data
      });
      // Refresh the list if we're on the first page
      if (currentPage === 1) {
        fetchReviews();
      } else {
        setCurrentPage(1);
      }
      showToast(`⭐ New review from ${data.userName}`, 'info');
    };

    const handleReviewStatusChanged = (data) => {
      setNotification({
        type: 'status',
        message: `📝 Review from ${data.userName} was ${data.newStatus}`,
        data
      });
      fetchReviews();
      showToast(`📝 Review ${data.newStatus}`, 'info');
    };

    const handleReviewDeleted = (data) => {
      setNotification({
        type: 'deleted',
        message: `🗑️ Review from ${data.userName} was deleted`,
        data
      });
      fetchReviews();
      showToast(`🗑️ Review deleted`, 'warning');
    };

    socket.on('new-review', handleNewReview);
    socket.on('review-status-changed', handleReviewStatusChanged);
    socket.on('review-deleted', handleReviewDeleted);

    return () => {
      socket.off('new-review', handleNewReview);
      socket.off('review-status-changed', handleReviewStatusChanged);
      socket.off('review-deleted', handleReviewDeleted);
    };
  }, [socket, showToast, currentPage]);

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    fetchReviews();
  }, [currentPage, filterStatus, filterType, searchTerm]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filterStatus !== "all") params.append("status", filterStatus);
      if (filterType !== "all") params.append("type", filterType);
      if (searchTerm) params.append("search", searchTerm);
      params.append("page", currentPage);
      params.append("limit", itemsPerPage);

      const response = await axios.get(`/admin/reviews?${params.toString()}`);
      if (response.data.success) {
        setReviews(response.data.reviews);
        setTotalReviews(response.data.pagination?.total || 0);
        setTotalPages(response.data.pagination?.pages || 1);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      showToast("Failed to load reviews", "error");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchReviews();
  };

  const handleStatusChange = async (reviewId, newStatus) => {
    setActionLoading(true);
    try {
      await axios.put(`/admin/reviews/${reviewId}/status`, { status: newStatus });
      showToast(`Review ${newStatus} successfully`, "success");
      fetchReviews();
    } catch (error) {
      showToast("Failed to update review status", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReply = async (reviewId) => {
    if (!replyText.trim()) {
      showToast("Please enter a reply", "error");
      return;
    }
    setActionLoading(true);
    try {
      await axios.put(`/admin/reviews/${reviewId}/status`, {
        status: "approved",
        reply: replyText
      });
      showToast("Reply added successfully", "success");
      setShowReplyModal(false);
      setReplyText("");
      fetchReviews();
    } catch (error) {
      showToast("Failed to add reply", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (reviewId) => {
    setActionLoading(true);
    try {
      await axios.delete(`/admin/reviews/${reviewId}`);
      showToast("Review deleted successfully", "success");
      setShowDeleteModal(false);
      fetchReviews();
    } catch (error) {
      showToast("Failed to delete review", "error");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: {
        color: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30",
        icon: Clock,
        label: "Pending"
      },
      approved: {
        color: "bg-green-500/20 text-green-500 border-green-500/30",
        icon: CheckCircle,
        label: "Approved"
      },
      rejected: {
        color: "bg-red-500/20 text-red-500 border-red-500/30",
        icon: XCircle,
        label: "Rejected"
      }
    };
    return badges[status] || badges.pending;
  };

  const getTypeBadge = (type) => {
    if (type === 'tour') {
      return {
        color: "bg-green-500/20 text-green-500 border-green-500/30",
        icon: Plane,
        label: "Tour"
      };
    } else {
      return {
        color: "bg-blue-500/20 text-blue-500 border-blue-500/30",
        icon: Hotel,
        label: "Hotel"
      };
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-10 w-10 text-amber-500 animate-spin mb-4" />
        <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Loading reviews...</p>
        {isConnected && (
          <span className="text-xs text-green-500 mt-2">🟢 Live updates enabled</span>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-end gap-2">
        <span className={`text-xs ${isConnected ? 'text-green-500' : 'text-red-500'}`}>
          {isConnected ? '🟢 Live' : '🔴 Offline'}
        </span>
        <span className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          {isConnected ? 'Real-time review updates active' : 'Reconnecting...'}
        </span>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className={`p-4 rounded-xl border ${
          notification.type === 'new'
            ? isDark ? 'bg-green-900/20 border-green-700' : 'bg-green-50 border-green-200'
            : notification.type === 'status'
            ? isDark ? 'bg-blue-900/20 border-blue-700' : 'bg-blue-50 border-blue-200'
            : isDark ? 'bg-red-900/20 border-red-700' : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-3">
            <span className="text-lg">
              {notification.type === 'new' ? '⭐' : notification.type === 'status' ? '📝' : '🗑️'}
            </span>
            <span className={isDark ? 'text-gray-200' : 'text-gray-700'}>
              {notification.message}
            </span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <MessageSquare className="h-6 w-6 text-amber-500" />
            Reviews Management
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage all tour and hotel reviews • {totalReviews} reviews
          </p>
        </div>
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

      {/* Filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search reviews by user or comment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={`w-full pl-10 pr-4 py-2.5 border rounded-xl ${
              isDark 
                ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-400' 
                : 'bg-white border-gray-200 text-gray-900'
            } focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all outline-none`}
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className={`px-4 py-2.5 rounded-xl outline-none ${
            isDark 
              ? 'bg-gray-800 text-white border-gray-700' 
              : 'bg-white text-gray-800 border-gray-200'
          } border focus:border-amber-500 transition-colors`}
        >
          <option value="all">All Types</option>
          <option value="tour">Tours</option>
          <option value="hotel">Hotels</option>
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className={`px-4 py-2.5 rounded-xl outline-none ${
            isDark 
              ? 'bg-gray-800 text-white border-gray-700' 
              : 'bg-white text-gray-800 border-gray-200'
          } border focus:border-amber-500 transition-colors`}
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Reviews List */}
      {reviews.length === 0 ? (
        <div className={`p-12 rounded-2xl text-center border border-dashed ${isDark ? 'border-gray-700' : 'border-gray-300'}`}>
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <h3 className={`text-xl font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            No reviews found
          </h3>
          <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
            {filterStatus === 'pending' 
              ? 'No pending reviews to moderate'
              : 'No reviews available'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => {
            const StatusBadge = getStatusBadge(review.status);
            const StatusIcon = StatusBadge.icon;
            const TypeBadge = getTypeBadge(review.type || review.itemType || 'tour');
            const TypeIcon = TypeBadge.icon;
            const itemId = review.itemId || review.tourId || review.hotelId;
            const itemName = review.itemName || review.tourTitle || review.hotelName;
            const type = review.type || review.itemType || 'tour';
            
            return (
              <div
                key={review._id}
                className={`p-4 rounded-xl ${isDark ? 'bg-gray-800' : 'bg-white'} border ${isDark ? 'border-gray-700' : 'border-gray-200'} shadow-sm hover:shadow-md transition-all`}
              >
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Review Content */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
                        {review.userAvatar ? (
                          <img src={review.userAvatar} alt={review.userName} className="w-full h-full object-cover" />
                        ) : (
                          review.userName?.charAt(0) || 'U'
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between flex-wrap gap-2">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                {review.userName}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${StatusBadge.color} flex items-center gap-1`}>
                                <StatusIcon className="w-3 h-3" />
                                {StatusBadge.label}
                              </span>
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${TypeBadge.color} flex items-center gap-1`}>
                                <TypeIcon className="w-3 h-3" />
                                {TypeBadge.label}
                              </span>
                            </div>
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="flex gap-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3.5 h-3.5 ${
                                      i < review.rating
                                        ? 'fill-amber-400 text-amber-400'
                                        : 'text-gray-300 dark:text-gray-600'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {new Date(review.date).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                          <Link
                            to={type === 'tour' ? `/tour/${itemId}` : `/hotel/${itemId}`}
                            target="_blank"
                            className={`text-xs flex items-center gap-1 ${isDark ? 'text-amber-400 hover:text-amber-300' : 'text-amber-500 hover:text-amber-600'} transition-colors`}
                          >
                            <Eye className="w-3 h-3" />
                            View {type === 'tour' ? 'Tour' : 'Hotel'}
                          </Link>
                        </div>
                        <h4 className={`font-semibold mt-1 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          {review.title}
                        </h4>
                        <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          {review.comment}
                        </p>
                        <div className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          <span className="font-medium">Item:</span> {itemName}
                        </div>
                        {review.images && review.images.length > 0 && (
                          <div className="flex gap-2 mt-2">
                            {review.images.slice(0, 3).map((img, i) => (
                              <img
                                key={i}
                                src={img}
                                alt={`Review image ${i + 1}`}
                                className="w-12 h-12 object-cover rounded-lg"
                              />
                            ))}
                          </div>
                        )}
                        {review.reply && review.reply.admin && (
                          <div className={`mt-2 p-2 rounded-lg ${isDark ? 'bg-gray-700' : 'bg-gray-100'} border-l-2 border-amber-500 text-sm`}>
                            <span className={`font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                              Admin Reply:
                            </span>
                            <span className={isDark ? 'text-gray-300' : 'text-gray-600'}>
                              {review.reply.admin}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex md:flex-col items-center gap-2">
                    <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {type === 'tour' ? 'Tour' : 'Hotel'}: {itemName}
                    </span>
                    <div className="flex items-center gap-2">
                      {review.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusChange(review._id, 'approved')}
                            disabled={actionLoading}
                            className="p-1.5 rounded-lg bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-white transition-all"
                            title="Approve"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusChange(review._id, 'rejected')}
                            disabled={actionLoading}
                            className="p-1.5 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                            title="Reject"
                          >
                            <X className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedReview(review);
                              setShowReplyModal(true);
                            }}
                            className="p-1.5 rounded-lg bg-blue-500/20 text-blue-500 hover:bg-blue-500 hover:text-white transition-all"
                            title="Reply"
                          >
                            <Reply className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {review.status === 'approved' && (
                        <button
                          onClick={() => handleStatusChange(review._id, 'rejected')}
                          disabled={actionLoading}
                          className="p-1.5 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                          title="Reject"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      {review.status === 'rejected' && (
                        <button
                          onClick={() => handleStatusChange(review._id, 'approved')}
                          disabled={actionLoading}
                          className="p-1.5 rounded-lg bg-green-500/20 text-green-500 hover:bg-green-500 hover:text-white transition-all"
                          title="Approve"
                        >
                          <Check className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => {
                          setSelectedReview(review);
                          setShowDeleteModal(true);
                        }}
                        className="p-1.5 rounded-lg bg-red-500/20 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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

      {/* Reply Modal */}
      {showReplyModal && selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className={`max-w-lg w-full p-6 rounded-2xl ${isDark ? 'bg-gray-900' : 'bg-white'} shadow-2xl`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Reply to Review
              </h3>
              <button
                onClick={() => {
                  setShowReplyModal(false);
                  setReplyText("");
                }}
                className={`p-2 rounded-full ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className={`p-4 rounded-xl mb-4 ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-xs overflow-hidden">
                  {selectedReview.userAvatar ? (
                    <img src={selectedReview.userAvatar} alt={selectedReview.userName} className="w-full h-full object-cover" />
                  ) : (
                    selectedReview.userName?.charAt(0) || 'U'
                  )}
                </div>
                <div>
                  <div className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {selectedReview.userName}
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < selectedReview.rating
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
              <p className={`text-sm mt-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {selectedReview.comment}
              </p>
              <div className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                <span className="font-medium">Type:</span> {selectedReview.type === 'tour' ? 'Tour' : 'Hotel'} - {selectedReview.itemName || selectedReview.tourTitle || selectedReview.hotelName}
              </div>
            </div>

            <div>
              <label className={`block text-sm font-medium mb-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Reply Message
              </label>
              <textarea
                rows={4}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className={`w-full px-4 py-2.5 rounded-xl outline-none ${
                  isDark ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-50 text-gray-800 border-gray-200'
                } border focus:border-amber-500 transition-colors resize-none`}
                placeholder="Write your reply to this review..."
              />
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => {
                  setShowReplyModal(false);
                  setReplyText("");
                }}
                className={`flex-1 px-4 py-2.5 rounded-xl ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-all`}
              >
                Cancel
              </button>
              <button
                onClick={() => handleReply(selectedReview._id)}
                disabled={actionLoading}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-medium hover:scale-105 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Reply className="w-4 h-4" />
                    Send Reply
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className={`max-w-md w-full mx-4 p-6 rounded-2xl ${isDark ? 'bg-gray-900' : 'bg-white'} shadow-2xl`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center">
                <Trash2 className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Delete Review
                </h3>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  This action cannot be undone
                </p>
              </div>
            </div>
            <p className={isDark ? 'text-gray-300' : 'text-gray-600'}>
              Are you sure you want to delete the review from <strong>"{selectedReview.userName}"</strong>?
            </p>
            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className={`flex-1 px-4 py-2.5 rounded-xl ${isDark ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-all`}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(selectedReview._id)}
                disabled={actionLoading}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all flex items-center justify-center gap-2"
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
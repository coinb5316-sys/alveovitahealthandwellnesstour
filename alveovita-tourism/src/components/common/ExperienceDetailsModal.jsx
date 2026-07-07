// src/components/common/ExperienceDetailsModal.jsx
import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Heart, MessageCircle, Share2, Bookmark, Eye, 
  MapPin, Calendar, Clock, User, Play, Image, Mic,
  ThumbsUp, Reply, Send, ChevronDown, ChevronUp,
  Loader2, Check, AlertCircle, LogIn, Trash2,
  MoreVertical, Edit
} from 'lucide-react'
import { formatDate, getRegionName } from '../../utils/helpers'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../hooks/useToast'
import { useSocket } from '../../context/SocketContext'
import axios from '../../api/axios'

// Local formatTime function since it's not imported from helpers
const formatTime = (date) => {
  if (!date) return ''
  const d = new Date(date)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const ExperienceDetailsModal = ({
  isOpen,
  onClose,
  experience,
  isDark,
  onLike,
  onBookmark,
  onShare,
  isLiked,
  isBookmarked,
  onAddComment,
  onAddReply,
  onDeleteExperience,
  onEdit
}) => {
  const { user } = useAuth()
  const { showToast } = useToast()
  const { socket, isConnected } = useSocket()
  const [commentText, setCommentText] = useState('')
  const [replyText, setReplyText] = useState('')
  const [replyToCommentId, setReplyToCommentId] = useState(null)
  const [replyToReplyId, setReplyToReplyId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [localComments, setLocalComments] = useState([])
  const [showAllComments, setShowAllComments] = useState(false)
  const [localLikes, setLocalLikes] = useState(0)
  const [localIsLiked, setLocalIsLiked] = useState(false)
  const commentsRef = useRef(null)

  // Initialize local states from props
  useEffect(() => {
    if (experience) {
      setLocalComments(experience.comments || [])
      setLocalLikes(experience.likes?.length || 0)
      setLocalIsLiked(isLiked || false)
    }
  }, [experience, isLiked])

  // Socket.IO event listeners for real-time updates
  useEffect(() => {
    if (!socket || !experience) return

    const handleCommentAdded = (data) => {
      if (data.experienceId === experience._id) {
        // Add the new comment to local state
        setLocalComments(prev => [...prev, data.comment])
        showToast(`💬 New comment from ${data.userName}`, 'info')
      }
    }

    const handleReplyAdded = (data) => {
      if (data.experienceId === experience._id) {
        // Find the comment and add the reply
        setLocalComments(prev => {
          const updated = [...prev]
          const commentIndex = updated.findIndex(c => c._id === data.commentId)
          if (commentIndex !== -1) {
            if (!updated[commentIndex].replies) {
              updated[commentIndex].replies = []
            }
            updated[commentIndex].replies.push(data.reply)
          }
          return updated
        })
        showToast(`💬 New reply from ${data.userName}`, 'info')
      }
    }

    const handleNestedReplyAdded = (data) => {
      if (data.experienceId === experience._id) {
        // Recursively find and add nested reply
        const addNestedReply = (items) => {
          for (let item of items) {
            if (item._id === data.commentId) {
              // Find the parent reply in this comment's replies
              const findAndAddReply = (replies) => {
                for (let reply of replies) {
                  if (reply._id === data.parentReplyId) {
                    if (!reply.replies) reply.replies = []
                    reply.replies.push(data.reply)
                    return true
                  }
                  if (reply.replies && reply.replies.length > 0) {
                    if (findAndAddReply(reply.replies)) return true
                  }
                }
                return false
              }
              if (item.replies) {
                findAndAddReply(item.replies)
              }
              return true
            }
            if (item.replies && item.replies.length > 0) {
              if (addNestedReply(item.replies)) return true
            }
          }
          return false
        }

        setLocalComments(prev => {
          const updated = [...prev]
          addNestedReply(updated)
          return updated
        })
        showToast(`💬 New reply from ${data.userName}`, 'info')
      }
    }

    const handleCommentDeleted = (data) => {
      if (data.experienceId === experience._id) {
        setLocalComments(prev => prev.filter(c => c._id !== data.commentId))
        showToast(`🗑️ A comment was deleted`, 'info')
      }
    }

    const handleReplyDeleted = (data) => {
      if (data.experienceId === experience._id) {
        // Recursively find and remove reply
        const removeReply = (items) => {
          for (let item of items) {
            if (item._id === data.commentId) {
              const removeFromReplies = (replies) => {
                const index = replies.findIndex(r => r._id === data.replyId)
                if (index !== -1) {
                  replies.splice(index, 1)
                  return true
                }
                for (let reply of replies) {
                  if (reply.replies && reply.replies.length > 0) {
                    if (removeFromReplies(reply.replies)) return true
                  }
                }
                return false
              }
              if (item.replies) {
                removeFromReplies(item.replies)
              }
              return true
            }
            if (item.replies && item.replies.length > 0) {
              if (removeReply(item.replies)) return true
            }
          }
          return false
        }

        setLocalComments(prev => {
          const updated = [...prev]
          removeReply(updated)
          return updated
        })
        showToast(`🗑️ A reply was deleted`, 'info')
      }
    }

    const handleLikeToggled = (data) => {
      if (data.experienceId === experience._id) {
        setLocalLikes(data.totalLikes)
        if (data.userId === user?.id) {
          setLocalIsLiked(data.liked)
        }
      }
    }

    socket.on('experience-comment-added', handleCommentAdded)
    socket.on('experience-reply-added', handleReplyAdded)
    socket.on('experience-nested-reply-added', handleNestedReplyAdded)
    socket.on('experience-comment-deleted', handleCommentDeleted)
    socket.on('experience-reply-deleted', handleReplyDeleted)
    socket.on('experience-like-toggled', handleLikeToggled)

    return () => {
      socket.off('experience-comment-added', handleCommentAdded)
      socket.off('experience-reply-added', handleReplyAdded)
      socket.off('experience-nested-reply-added', handleNestedReplyAdded)
      socket.off('experience-comment-deleted', handleCommentDeleted)
      socket.off('experience-reply-deleted', handleReplyDeleted)
      socket.off('experience-like-toggled', handleLikeToggled)
    }
  }, [socket, experience, user, showToast])

  // Refresh comments function
  const refreshComments = async () => {
    try {
      const response = await axios.get(`/experiences/${experience._id}`)
      if (response.data.success) {
        setLocalComments(response.data.experience.comments || [])
      }
    } catch (error) {
      console.error('Error refreshing comments:', error)
    }
  }

  const handleAddComment = async (e) => {
    e.preventDefault()
    if (!user) {
      showToast('Please login to comment', 'info')
      return
    }
    if (!commentText.trim()) {
      showToast('Please enter a comment', 'error')
      return
    }

    setSubmitting(true)
    try {
      if (onAddComment) {
        await onAddComment(experience._id, commentText.trim())
        setCommentText('')
        await refreshComments()
        showToast('Comment added successfully', 'success')
      }
    } catch (error) {
      console.error('Error adding comment:', error)
      showToast('Failed to add comment', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleAddReply = async (commentId, parentReplyId = null) => {
    if (!user) {
      showToast('Please login to reply', 'info')
      return
    }
    if (!replyText.trim()) {
      showToast('Please enter a reply', 'error')
      return
    }

    setSubmitting(true)
    try {
      let url = `/experiences/${experience._id}/comments/${commentId}/replies`
      if (parentReplyId) {
        url = `/experiences/${experience._id}/comments/${commentId}/replies/${parentReplyId}/replies`
      }
      
      await axios.post(url, { content: replyText.trim() })
      setReplyText('')
      setReplyToCommentId(null)
      setReplyToReplyId(null)
      
      // Refresh comments to show the new reply
      await refreshComments()
      showToast('Reply added successfully', 'success')
    } catch (error) {
      console.error('Error adding reply:', error)
      showToast(error.response?.data?.message || 'Failed to add reply', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteExperience = async () => {
    if (!user) {
      showToast('Please login to delete', 'info')
      return
    }
    if (!window.confirm('Are you sure you want to delete this experience?')) {
      return
    }

    setSubmitting(true)
    try {
      await axios.delete(`/experiences/${experience._id}`)
      showToast('Experience deleted successfully', 'success')
      if (onDeleteExperience) {
        onDeleteExperience(experience._id)
      }
      onClose()
    } catch (error) {
      console.error('Error deleting experience:', error)
      showToast('Failed to delete experience', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLike = () => {
    if (!user) {
      showToast('Please login to like', 'info')
      return
    }
    if (onLike) {
      onLike(experience._id)
    }
  }

  const handleBookmark = () => {
    if (!user) {
      showToast('Please login to bookmark', 'info')
      return
    }
    if (onBookmark) {
      onBookmark(experience._id)
    }
  }

  const handleShare = () => {
    if (onShare) {
      onShare(experience._id)
    }
  }

  // Recursive component to render nested replies with infinite depth
  const ReplyItem = ({ reply, depth = 0, commentId }) => {
    const [showReplyInput, setShowReplyInput] = useState(false)
    const [localReplyText, setLocalReplyText] = useState('')
    const [isSubmittingReply, setIsSubmittingReply] = useState(false)

    const handleSubmitReply = async () => {
      if (!localReplyText.trim()) return
      setIsSubmittingReply(true)
      try {
        await axios.post(
          `/experiences/${experience._id}/comments/${commentId}/replies/${reply._id}/replies`,
          { content: localReplyText.trim() }
        )
        setLocalReplyText('')
        setShowReplyInput(false)
        await refreshComments()
        showToast('Reply added successfully', 'success')
      } catch (error) {
        console.error('Error adding nested reply:', error)
        showToast('Failed to add reply', 'error')
      } finally {
        setIsSubmittingReply(false)
      }
    }

    const indentClass = depth > 0 ? `ml-${Math.min(depth * 4, 12)}` : ''

    return (
      <div className={`${indentClass} mt-2 ${depth > 0 ? 'pl-4 border-l-2 border-amber-500/30' : ''}`}>
        <div className="flex items-start gap-3">
          <img 
            src={reply.user?.avatar || `https://ui-avatars.com/api/?name=${reply.userName || 'U'}&background=random`} 
            alt={reply.userName || 'User'}
            className="w-6 h-6 rounded-full object-cover"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`font-medium text-xs ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {reply.userName || reply.user?.name || 'Anonymous'}
              </span>
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                {formatDate(reply.createdAt)}
              </span>
            </div>
            <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {reply.content}
            </p>
            <button
              onClick={() => {
                setShowReplyInput(!showReplyInput)
                if (!showReplyInput) {
                  setReplyToCommentId(commentId)
                  setReplyToReplyId(reply._id)
                }
              }}
              className={`text-xs mt-1 ${isDark ? 'text-amber-400 hover:text-amber-300' : 'text-amber-500 hover:text-amber-600'} transition-colors flex items-center gap-1`}
            >
              <Reply className="w-3 h-3" />
              Reply
            </button>
            {showReplyInput && (
              <div className="mt-2 flex gap-2">
                <input
                  type="text"
                  value={localReplyText}
                  onChange={(e) => setLocalReplyText(e.target.value)}
                  placeholder="Write a reply..."
                  className={`flex-1 px-3 py-1.5 rounded-lg outline-none text-sm ${
                    isDark 
                      ? 'bg-gray-700 text-white placeholder-gray-400 border-gray-600' 
                      : 'bg-gray-100 text-gray-800 placeholder-gray-400 border-gray-200'
                  } border focus:border-amber-500 transition-colors`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleSubmitReply()
                    }
                    if (e.key === 'Escape') {
                      setShowReplyInput(false)
                      setLocalReplyText('')
                    }
                  }}
                  disabled={isSubmittingReply}
                />
                <button
                  onClick={handleSubmitReply}
                  disabled={isSubmittingReply || !localReplyText.trim()}
                  className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 transition-all disabled:opacity-50"
                >
                  {isSubmittingReply ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Reply'}
                </button>
                <button
                  onClick={() => {
                    setShowReplyInput(false)
                    setLocalReplyText('')
                  }}
                  className="px-3 py-1.5 text-gray-400 hover:text-gray-600 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            )}
            {reply.replies && reply.replies.length > 0 && (
              <div className="mt-2 space-y-2">
                {reply.replies.map((nestedReply) => (
                  <ReplyItem 
                    key={nestedReply._id} 
                    reply={nestedReply} 
                    depth={depth + 1}
                    commentId={commentId}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!experience) return null

  const displayedComments = showAllComments ? localComments : localComments.slice(0, 3)
  const userId = user?.id || user?._id
  const experienceUserId = experience.user?._id
  const canDelete = user && userId && experienceUserId && 
    userId.toString() === experienceUserId.toString()

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`max-w-4xl w-full max-h-[90vh] rounded-2xl overflow-hidden ${
              isDark ? 'bg-gray-900' : 'bg-white'
            } shadow-2xl flex flex-col`}
          >
            {/* Connection Status */}
            {isConnected && (
              <div className={`px-4 py-1 text-center text-xs ${
                isDark ? 'bg-green-500/10 text-green-400' : 'bg-green-100 text-green-600'
              }`}>
                🔴 Live • Real-time updates active
              </div>
            )}

            {/* Header */}
            <div className={`flex items-center justify-between p-4 border-b ${
              isDark ? 'border-gray-800' : 'border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                <img 
                  src={experience.user?.avatar || `https://ui-avatars.com/api/?name=${experience.user?.name || 'Anonymous'}&background=random`} 
                  alt={experience.user?.name || 'User'}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                    {experience.user?.name || 'Anonymous'}
                  </h4>
                  <div className="flex items-center text-xs text-gray-500">
                    <MapPin className="w-3 h-3 mr-1" />
                    {experience.user?.location || 'Ghana'}
                    <span className="mx-2">•</span>
                    {formatDate(experience.createdAt)}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {canDelete && (
                  <button
                    onClick={onEdit}
                    disabled={submitting}
                    className={`p-2 rounded-full hover:bg-blue-500/20 text-blue-500 transition-colors ${
                      submitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    title="Edit experience"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={handleDeleteExperience}
                    disabled={submitting}
                    className={`p-2 rounded-full hover:bg-red-500/20 text-red-500 transition-colors ${
                      submitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    title="Delete experience"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
                <button
                  onClick={onClose}
                  className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content - Rest remains the same */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Media */}
              {experience.type === 'video' && experience.mediaUrl && (
                <div className="relative aspect-video rounded-xl overflow-hidden bg-black/50 mb-4">
                  <video 
                    src={experience.mediaUrl} 
                    controls 
                    className="w-full h-full object-cover"
                    poster={experience.thumbnail}
                  />
                </div>
              )}

              {experience.type === 'image' && experience.mediaUrl && (
                <div className="rounded-xl overflow-hidden mb-4">
                  <img 
                    src={experience.mediaUrl} 
                    alt={experience.title}
                    className="w-full h-auto object-cover"
                  />
                </div>
              )}

              {experience.type === 'audio' && experience.mediaUrl && (
                <div className={`p-4 rounded-xl mb-4 ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
                  <audio controls className="w-full" src={experience.mediaUrl} />
                </div>
              )}

              {/* Title & Content */}
              <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {experience.title}
              </h2>
              <p className={`mt-2 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                {experience.content || experience.description}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mt-4">
                <span className={`text-xs px-3 py-1 rounded-full ${
                  isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
                }`}>
                  {getRegionName(experience.region)}
                </span>
                <span className={`text-xs px-3 py-1 rounded-full ${
                  isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
                }`}>
                  {experience.tourName || 'General Experience'}
                </span>
                <span className={`text-xs px-3 py-1 rounded-full ${
                  isDark ? 'bg-gray-800 text-gray-300' : 'bg-gray-100 text-gray-600'
                }`}>
                  {experience.type || 'text'}
                </span>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {experience.views || 0} views
                </span>
                <span className="flex items-center gap-1">
                  <Heart className={`w-4 h-4 ${localIsLiked ? 'fill-amber-500 text-amber-500' : ''}`} />
                  {localLikes} likes
                </span>
                <span className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  {localComments?.length || 0} comments
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200/20">
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    localIsLiked
                      ? 'bg-amber-500/20 text-amber-500'
                      : isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${localIsLiked ? 'fill-amber-500' : ''}`} />
                  <span>{localIsLiked ? 'Liked' : 'Like'}</span>
                </button>
                <button
                  onClick={handleBookmark}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isBookmarked
                      ? 'bg-amber-500/20 text-amber-500'
                      : isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
                  <span>{isBookmarked ? 'Saved' : 'Save'}</span>
                </button>
                <button
                  onClick={handleShare}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                    isDark ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <Share2 className="w-4 h-4" />
                  <span>Share</span>
                </button>
              </div>

              {/* Comments Section - Rest remains the same */}
              <div className="mt-6 pt-4 border-t border-gray-200/20">
                <h3 className={`font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Comments ({localComments?.length || 0})
                </h3>

                <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Write a comment..."
                    className={`flex-1 px-4 py-2 rounded-lg outline-none ${
                      isDark 
                        ? 'bg-gray-800 text-white placeholder-gray-400 border-gray-700' 
                        : 'bg-gray-100 text-gray-800 placeholder-gray-400 border-gray-200'
                    } border focus:border-amber-500 transition-colors`}
                    disabled={submitting}
                  />
                  <button
                    type="submit"
                    disabled={submitting || !commentText.trim()}
                    className={`px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 flex items-center gap-2`}
                  >
                    {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </form>

                {/* Comments List */}
                <div className="space-y-4 max-h-[400px] overflow-y-auto" ref={commentsRef}>
                  {displayedComments.length === 0 ? (
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      No comments yet. Be the first to comment!
                    </p>
                  ) : (
                    displayedComments.map((comment) => (
                      <div key={comment._id} className={`p-3 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-50'}`}>
                        <div className="flex items-start gap-3">
                          <img 
                            src={comment.user?.avatar || `https://ui-avatars.com/api/?name=${comment.userName || 'U'}&background=random`} 
                            alt={comment.userName || 'User'}
                            className="w-8 h-8 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`font-medium text-sm ${isDark ? 'text-white' : 'text-gray-800'}`}>
                                {comment.userName || comment.user?.name || 'Anonymous'}
                              </span>
                              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {formatDate(comment.createdAt)} at {formatTime(comment.createdAt)}
                              </span>
                            </div>
                            <p className={`text-sm mt-0.5 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                              {comment.content}
                            </p>
                            <button
                              onClick={() => {
                                setReplyToCommentId(comment._id)
                                setReplyToReplyId(null)
                                setReplyText('')
                                setTimeout(() => {
                                  document.getElementById('reply-input')?.focus()
                                }, 100)
                              }}
                              className={`text-xs mt-1 ${isDark ? 'text-amber-400 hover:text-amber-300' : 'text-amber-500 hover:text-amber-600'} transition-colors flex items-center gap-1`}
                            >
                              <Reply className="w-3 h-3" />
                              Reply
                            </button>

                            {comment.replies && comment.replies.length > 0 && (
                              <div className="mt-2 space-y-2">
                                {comment.replies.map((reply) => (
                                  <ReplyItem 
                                    key={reply._id} 
                                    reply={reply} 
                                    depth={1}
                                    commentId={comment._id}
                                  />
                                ))}
                              </div>
                            )}

                            {replyToCommentId === comment._id && !replyToReplyId && (
                              <div className="mt-2 flex gap-2" id="reply-input">
                                <input
                                  type="text"
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  placeholder="Write a reply..."
                                  className={`flex-1 px-3 py-1.5 rounded-lg outline-none text-sm ${
                                    isDark 
                                      ? 'bg-gray-700 text-white placeholder-gray-400 border-gray-600' 
                                      : 'bg-gray-100 text-gray-800 placeholder-gray-400 border-gray-200'
                                  } border focus:border-amber-500 transition-colors`}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault()
                                      handleAddReply(comment._id)
                                    }
                                    if (e.key === 'Escape') {
                                      setReplyToCommentId(null)
                                      setReplyText('')
                                    }
                                  }}
                                  disabled={submitting}
                                />
                                <button
                                  onClick={() => handleAddReply(comment._id)}
                                  disabled={submitting || !replyText.trim()}
                                  className="px-3 py-1.5 bg-amber-500 text-white rounded-lg text-sm hover:bg-amber-600 transition-all disabled:opacity-50"
                                >
                                  {submitting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Reply'}
                                </button>
                                <button
                                  onClick={() => {
                                    setReplyToCommentId(null)
                                    setReplyText('')
                                  }}
                                  className="px-3 py-1.5 text-gray-400 hover:text-gray-600 transition-colors text-sm"
                                >
                                  Cancel
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {localComments.length > 3 && (
                  <button
                    onClick={() => setShowAllComments(!showAllComments)}
                    className={`mt-3 text-sm ${isDark ? 'text-amber-400 hover:text-amber-300' : 'text-amber-500 hover:text-amber-600'} transition-colors flex items-center gap-1`}
                  >
                    {showAllComments ? (
                      <>Show Less <ChevronUp className="w-4 h-4" /></>
                    ) : (
                      <>View All {localComments.length} Comments <ChevronDown className="w-4 h-4" /></>
                    )}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

export default ExperienceDetailsModal
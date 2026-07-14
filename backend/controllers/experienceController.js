// controllers/experienceController.js - COMPLETE with Alveoly Notification Pattern
import Experience from '../models/Experience.js';
import { v2 as cloudinaryV2 } from 'cloudinary';
import fs from 'fs';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { createNotification } from './notificationController.js';

// Helper function to populate user data in nested replies recursively
const populateReplyUsers = async (replies) => {
  if (!replies || replies.length === 0) return replies;
  
  for (const reply of replies) {
    if (reply.user) {
      const user = await User.findById(reply.user).select('name avatar');
      if (user) {
        reply.user = user;
        reply.userName = user.name;
        reply.userAvatar = user.avatar || '';
      }
    }
    if (reply.replies && reply.replies.length > 0) {
      await populateReplyUsers(reply.replies);
    }
  }
  return replies;
};

// Helper function to populate all comment users and their replies
const populateCommentUsers = async (comments) => {
  if (!comments || comments.length === 0) return comments;
  
  for (const comment of comments) {
    if (comment.user) {
      const user = await User.findById(comment.user).select('name avatar');
      if (user) {
        comment.user = user;
        comment.userName = user.name;
        comment.userAvatar = user.avatar || '';
      }
    }
    if (comment.replies && comment.replies.length > 0) {
      await populateReplyUsers(comment.replies);
    }
  }
  return comments;
};

// @desc    Get all experiences
// @route   GET /api/experiences
export const getExperiences = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, region, type } = req.query;
    
    const query = { status: 'active' };
    if (search) {
      query.$text = { $search: search };
    }
    if (region && region !== 'all') query.region = region;
    if (type && type !== 'all') query.type = type;

    const experiences = await Experience.find(query)
      .populate('user', 'name avatar location')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    // Manually populate comment users for each experience
    for (const exp of experiences) {
      if (exp.comments && exp.comments.length > 0) {
        await populateCommentUsers(exp.comments);
      }
    }

    const total = await Experience.countDocuments(query);

    res.json({
      success: true,
      experiences,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get experiences error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single experience
// @route   GET /api/experiences/:id
export const getExperienceById = async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id)
      .populate('user', 'name avatar location');

    if (!experience) {
      return res.status(404).json({ success: false, message: 'Experience not found' });
    }

    // Manually populate comment users
    if (experience.comments && experience.comments.length > 0) {
      await populateCommentUsers(experience.comments);
    }

    experience.views += 1;
    await experience.save();

    res.json({ success: true, experience });
  } catch (error) {
    console.error('Get experience error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create experience
// @route   POST /api/experiences
export const createExperience = async (req, res) => {
  try {
    const io = req.app.get('io');
    const { title, content, type, region, tourName } = req.body;
    let mediaUrl = null;
    let thumbnail = null;
    let mediaType = type || 'text';

    if (req.file) {
      try {
        const result = await cloudinaryV2.uploader.upload(req.file.path, {
          folder: 'tourvibe/experiences',
          resource_type: 'auto',
          transformation: [
            { quality: 'auto', fetch_format: 'auto' }
          ],
          eager_async: true,
          eager: req.file.mimetype?.startsWith('video/') ? [
            { quality: 'auto', fetch_format: 'auto', format: 'mp4' }
          ] : undefined
        });
        
        mediaUrl = result.secure_url;
        
        if (result.resource_type === 'video') {
          mediaType = 'video';
          thumbnail = result.secure_url.replace('/upload/', '/upload/so_0/');
        } else if (result.resource_type === 'image') {
          mediaType = 'image';
        } else if (result.resource_type === 'raw' && result.format === 'mp3') {
          mediaType = 'audio';
        }
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload media file. Please try again.'
        });
      }
    }

    const experience = await Experience.create({
      user: req.user.id,
      title,
      content,
      type: mediaType,
      mediaUrl,
      thumbnail,
      region,
      tourName: tourName || 'General Experience',
      likes: [],
      bookmarks: [],
      comments: []
    });

    await experience.populate('user', 'name avatar location');

    // Create notification for user
    await createNotification(
      req.user.id,
      'user',
      'success',
      `📝 Experience Shared: ${title}`,
      `Your experience "${title}" has been shared successfully!`,
      `/experiences/${experience._id}`,
      { experienceId: experience._id, action: 'experience_created' }
    );

    // Create notification for admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await createNotification(
        admin._id,
        'admin',
        'info',
        `📝 New Experience: ${title}`,
        `${req.user.name} shared a new experience: "${title}"`,
        `/admin/experiences/${experience._id}`,
        { experienceId: experience._id, action: 'new_experience' }
      );
    }

    // Emit socket event for new experience
    if (io) {
      io.emit('experience-created', {
        experienceId: experience._id,
        userId: experience.user._id,
        userName: experience.user.name,
        userAvatar: experience.user.avatar || '',
        title: experience.title,
        content: experience.content,
        type: experience.type,
        mediaUrl: experience.mediaUrl,
        thumbnail: experience.thumbnail,
        region: experience.region,
        tourName: experience.tourName,
        createdAt: experience.createdAt,
        likes: 0,
        comments: 0
      });

      io.to('admin-room').emit('admin-notification', {
        type: 'experience-created',
        experienceId: experience._id,
        userName: experience.user.name,
        message: `New experience "${experience.title}" shared by ${experience.user.name}`,
        timestamp: new Date()
      });
    }

    res.status(201).json({
      success: true,
      experience,
      message: 'Experience shared successfully!'
    });
  } catch (error) {
    console.error('Create experience error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update experience (with media upload support)
// @route   PUT /api/experiences/:id
export const updateExperience = async (req, res) => {
  try {
    const io = req.app.get('io');
    const experience = await Experience.findById(req.params.id);
    if (!experience) {
      return res.status(404).json({ success: false, message: 'Experience not found' });
    }

    if (experience.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this experience' });
    }

    const { title, content, type, region, tourName } = req.body;
    
    const oldTitle = experience.title;
    experience.title = title || experience.title;
    experience.content = content || experience.content;
    experience.type = type || experience.type;
    experience.region = region || experience.region;
    experience.tourName = tourName || experience.tourName;

    if (req.file) {
      try {
        if (experience.mediaUrl) {
          try {
            const publicId = experience.mediaUrl.split('/').slice(-2).join('/').split('.')[0];
            await cloudinaryV2.uploader.destroy(`tourvibe/experiences/${publicId}`);
          } catch (cloudinaryError) {
            console.error('Cloudinary delete error:', cloudinaryError);
          }
        }

        const result = await cloudinaryV2.uploader.upload(req.file.path, {
          folder: 'tourvibe/experiences',
          resource_type: 'auto',
          transformation: [
            { quality: 'auto', fetch_format: 'auto' }
          ],
          eager_async: true,
          eager: req.file.mimetype?.startsWith('video/') ? [
            { quality: 'auto', fetch_format: 'auto', format: 'mp4' }
          ] : undefined
        });
        
        experience.mediaUrl = result.secure_url;
        
        if (result.resource_type === 'video') {
          experience.type = 'video';
          experience.thumbnail = result.secure_url.replace('/upload/', '/upload/so_0/');
        } else if (result.resource_type === 'image') {
          experience.type = 'image';
        } else if (result.resource_type === 'raw' && result.format === 'mp3') {
          experience.type = 'audio';
        }

        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (uploadError) {
        console.error('Cloudinary upload error:', uploadError);
        return res.status(500).json({
          success: false,
          message: 'Failed to upload media file. Please try again.'
        });
      }
    }

    await experience.save();
    await experience.populate('user', 'name avatar location');

    // Create notification for user
    await createNotification(
      req.user.id,
      'user',
      'info',
      `✏️ Experience Updated: ${experience.title}`,
      `Your experience "${oldTitle}" has been updated.`,
      `/experiences/${experience._id}`,
      { experienceId: experience._id, action: 'experience_updated' }
    );

    // Emit socket event for experience update
    if (io) {
      io.emit('experience-updated', {
        experienceId: experience._id,
        userId: experience.user._id,
        userName: experience.user.name,
        userAvatar: experience.user.avatar || '',
        title: experience.title,
        oldTitle: oldTitle,
        content: experience.content,
        type: experience.type,
        mediaUrl: experience.mediaUrl,
        thumbnail: experience.thumbnail,
        region: experience.region,
        tourName: experience.tourName,
        updatedAt: new Date()
      });

      io.to('admin-room').emit('admin-notification', {
        type: 'experience-updated',
        experienceId: experience._id,
        userName: experience.user.name,
        message: `Experience "${experience.title}" updated by ${experience.user.name}`,
        timestamp: new Date()
      });
    }

    res.json({ 
      success: true, 
      experience,
      message: 'Experience updated successfully!' 
    });
  } catch (error) {
    console.error('Update experience error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete experience
// @route   DELETE /api/experiences/:id
export const deleteExperience = async (req, res) => {
  try {
    const io = req.app.get('io');
    const experience = await Experience.findById(req.params.id);
    if (!experience) {
      return res.status(404).json({ success: false, message: 'Experience not found' });
    }

    if (experience.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this experience' });
    }

    const experienceTitle = experience.title;
    const userId = experience.user;

    if (experience.mediaUrl) {
      try {
        const publicId = experience.mediaUrl.split('/').slice(-2).join('/').split('.')[0];
        await cloudinaryV2.uploader.destroy(`tourvibe/experiences/${publicId}`);
      } catch (cloudinaryError) {
        console.error('Cloudinary delete error:', cloudinaryError);
      }
    }

    await experience.deleteOne();

    // Create notification for user
    await createNotification(
      req.user.id,
      'user',
      'warning',
      `🗑️ Experience Deleted: ${experienceTitle}`,
      `Your experience "${experienceTitle}" has been deleted.`,
      `/experiences`,
      { experienceId: req.params.id, action: 'experience_deleted' }
    );

    // Emit socket event for experience deletion
    if (io) {
      io.emit('experience-deleted', {
        experienceId: req.params.id,
        userId: userId,
        title: experienceTitle
      });

      io.to('admin-room').emit('admin-notification', {
        type: 'experience-deleted',
        experienceId: req.params.id,
        userName: req.user.name,
        message: `Experience "${experienceTitle}" deleted by ${req.user.name}`,
        timestamp: new Date()
      });
    }

    res.json({ success: true, message: 'Experience deleted successfully' });
  } catch (error) {
    console.error('Delete experience error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Like/unlike experience
// @route   POST /api/experiences/:id/like
export const toggleLike = async (req, res) => {
  try {
    const io = req.app.get('io');
    const experience = await Experience.findById(req.params.id).populate('user', 'name avatar');
    if (!experience) {
      return res.status(404).json({ success: false, message: 'Experience not found' });
    }

    const userId = req.user.id;
    const hasLiked = experience.likes.some(id => id.toString() === userId.toString());

    if (hasLiked) {
      experience.likes = experience.likes.filter(id => id.toString() !== userId.toString());
    } else {
      experience.likes.push(userId);
    }

    await experience.save();

    // Create notification for experience owner if someone liked their post
    if (!hasLiked && experience.user._id.toString() !== userId) {
      await createNotification(
        experience.user._id,
        'user',
        'info',
        `❤️ ${req.user.name} liked your experience`,
        `${req.user.name} liked your experience "${experience.title}"`,
        `/experiences/${experience._id}`,
        { experienceId: experience._id, action: 'experience_liked' }
      );
    }

    // Emit socket event for like toggle
    if (io) {
      io.emit('experience-like-toggled', {
        experienceId: experience._id,
        userId: userId,
        userName: req.user.name,
        userAvatar: req.user.avatar || '',
        liked: !hasLiked,
        totalLikes: experience.likes.length
      });
    }

    res.json({
      success: true,
      liked: !hasLiked,
      likes: experience.likes.length,
    });
  } catch (error) {
    console.error('Toggle like error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Bookmark/unbookmark experience
// @route   POST /api/experiences/:id/bookmark
export const toggleBookmark = async (req, res) => {
  try {
    const io = req.app.get('io');
    const experience = await Experience.findById(req.params.id);
    if (!experience) {
      return res.status(404).json({ success: false, message: 'Experience not found' });
    }

    const userId = req.user.id;
    const hasBookmarked = experience.bookmarks.some(id => id.toString() === userId.toString());

    if (hasBookmarked) {
      experience.bookmarks = experience.bookmarks.filter(id => id.toString() !== userId.toString());
    } else {
      experience.bookmarks.push(userId);
    }

    await experience.save();

    // Create notification for experience owner if someone bookmarked their post
    if (!hasBookmarked && experience.user.toString() !== userId) {
      await createNotification(
        experience.user,
        'user',
        'info',
        `🔖 ${req.user.name} bookmarked your experience`,
        `${req.user.name} bookmarked your experience "${experience.title}"`,
        `/experiences/${experience._id}`,
        { experienceId: experience._id, action: 'experience_bookmarked' }
      );
    }

    // Emit socket event for bookmark toggle
    if (io) {
      io.emit('experience-bookmark-toggled', {
        experienceId: experience._id,
        userId: userId,
        userName: req.user.name,
        bookmarked: !hasBookmarked,
        totalBookmarks: experience.bookmarks.length
      });
    }

    res.json({
      success: true,
      bookmarked: !hasBookmarked,
      bookmarks: experience.bookmarks.length,
    });
  } catch (error) {
    console.error('Toggle bookmark error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add comment to experience
// @route   POST /api/experiences/:id/comments
export const addComment = async (req, res) => {
  try {
    const io = req.app.get('io');
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, message: 'Comment content is required' });
    }

    const experience = await Experience.findById(req.params.id);
    if (!experience) {
      return res.status(404).json({ success: false, message: 'Experience not found' });
    }

    if (!experience.comments) {
      experience.comments = [];
    }

    const comment = {
      _id: new mongoose.Types.ObjectId(),
      user: req.user.id,
      userName: req.user.name,
      userAvatar: req.user.avatar || '',
      content,
      createdAt: new Date(),
      replies: []
    };

    experience.comments.push(comment);
    await experience.save();

    // Get the saved comment with populated user data
    const savedComment = experience.comments[experience.comments.length - 1];
    const userData = await User.findById(req.user.id).select('name avatar');
    if (userData) {
      savedComment.user = userData;
      savedComment.userName = userData.name;
      savedComment.userAvatar = userData.avatar || '';
    }

    // Create notification for experience owner if someone commented
    if (experience.user.toString() !== req.user.id) {
      await createNotification(
        experience.user,
        'user',
        'info',
        `💬 ${req.user.name} commented on your experience`,
        `${req.user.name}: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
        `/experiences/${experience._id}`,
        { experienceId: experience._id, action: 'experience_commented' }
      );
    }

    // Emit socket event for new comment
    if (io) {
      io.emit('experience-comment-added', {
        experienceId: experience._id,
        comment: savedComment,
        userId: req.user.id,
        userName: req.user.name,
        userAvatar: req.user.avatar || '',
        totalComments: experience.comments.length
      });
    }

    res.status(201).json({
      success: true,
      comment: savedComment,
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add reply to comment
// @route   POST /api/experiences/:id/comments/:commentId/replies
export const addReply = async (req, res) => {
  try {
    const io = req.app.get('io');
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ success: false, message: 'Reply content is required' });
    }

    const experience = await Experience.findById(req.params.id);
    if (!experience) {
      return res.status(404).json({ success: false, message: 'Experience not found' });
    }

    const comment = experience.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    if (!comment.replies) {
      comment.replies = [];
    }

    const reply = {
      _id: new mongoose.Types.ObjectId(),
      user: req.user.id,
      userName: req.user.name,
      userAvatar: req.user.avatar || '',
      content,
      createdAt: new Date(),
      replies: []
    };

    comment.replies.push(reply);
    await experience.save();

    // Return the saved reply with populated user data
    const savedReply = comment.replies[comment.replies.length - 1];
    const userData = await User.findById(req.user.id).select('name avatar');
    if (userData) {
      savedReply.user = userData;
      savedReply.userName = userData.name;
      savedReply.userAvatar = userData.avatar || '';
    }

    // Create notification for comment owner if someone replied
    if (comment.user && comment.user.toString() !== req.user.id) {
      await createNotification(
        comment.user,
        'user',
        'info',
        `💬 ${req.user.name} replied to your comment`,
        `${req.user.name}: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
        `/experiences/${experience._id}`,
        { experienceId: experience._id, action: 'comment_replied' }
      );
    }

    // Emit socket event for new reply
    if (io) {
      io.emit('experience-reply-added', {
        experienceId: experience._id,
        commentId: comment._id,
        reply: savedReply,
        userId: req.user.id,
        userName: req.user.name,
        userAvatar: req.user.avatar || ''
      });
    }

    res.status(201).json({
      success: true,
      reply: savedReply,
    });
  } catch (error) {
    console.error('Add reply error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add nested reply (reply to a reply)
// @route   POST /api/experiences/:id/comments/:commentId/replies/:replyId/replies
export const addNestedReply = async (req, res) => {
  try {
    const io = req.app.get('io');
    const { content } = req.body;
    if (!content) {
      return res.status(400).json({ 
        success: false, 
        message: 'Reply content is required' 
      });
    }

    const experience = await Experience.findById(req.params.id);
    if (!experience) {
      return res.status(404).json({ 
        success: false, 
        message: 'Experience not found' 
      });
    }

    const comment = experience.comments.id(req.params.commentId);
    if (!comment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Comment not found' 
      });
    }

    if (!comment.replies) {
      comment.replies = [];
    }

    // Recursive function to find a reply by id at any depth
    const findReplyById = (replies, replyId) => {
      if (!replies || replies.length === 0) return null;
      for (const reply of replies) {
        if (reply._id && reply._id.toString() === replyId) {
          return reply;
        }
        if (reply.replies && reply.replies.length > 0) {
          const found = findReplyById(reply.replies, replyId);
          if (found) return found;
        }
      }
      return null;
    };

    const parentReply = findReplyById(comment.replies, req.params.replyId);
    if (!parentReply) {
      return res.status(404).json({ 
        success: false, 
        message: 'Parent reply not found' 
      });
    }

    if (!parentReply.replies) {
      parentReply.replies = [];
    }

    const newReply = {
      _id: new mongoose.Types.ObjectId(),
      user: req.user.id,
      userName: req.user.name,
      userAvatar: req.user.avatar || '',
      content,
      createdAt: new Date(),
      replies: []
    };

    parentReply.replies.push(newReply);
    await experience.save();

    // Return the saved reply with populated user data
    const userData = await User.findById(req.user.id).select('name avatar');
    if (userData) {
      newReply.user = userData;
      newReply.userName = userData.name;
      newReply.userAvatar = userData.avatar || '';
    }

    // Create notification for parent reply owner if someone replied
    if (parentReply.user && parentReply.user.toString() !== req.user.id) {
      await createNotification(
        parentReply.user,
        'user',
        'info',
        `💬 ${req.user.name} replied to your comment`,
        `${req.user.name}: "${content.substring(0, 50)}${content.length > 50 ? '...' : ''}"`,
        `/experiences/${experience._id}`,
        { experienceId: experience._id, action: 'nested_reply' }
      );
    }

    // Emit socket event for nested reply
    if (io) {
      io.emit('experience-nested-reply-added', {
        experienceId: experience._id,
        commentId: comment._id,
        parentReplyId: parentReply._id,
        reply: newReply,
        userId: req.user.id,
        userName: req.user.name,
        userAvatar: req.user.avatar || ''
      });
    }

    res.status(201).json({
      success: true,
      reply: newReply,
    });
  } catch (error) {
    console.error('Add nested reply error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to add nested reply' 
    });
  }
};

// @desc    Get user's liked experiences
// @route   GET /api/experiences/liked
export const getLikedExperiences = async (req, res) => {
  try {
    const experiences = await Experience.find({
      likes: req.user.id,
      status: 'active',
    }).select('_id');
    
    res.json({
      success: true,
      liked: experiences.map(e => e._id),
    });
  } catch (error) {
    console.error('Get liked experiences error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user's bookmarked experiences
// @route   GET /api/experiences/bookmarked
export const getBookmarkedExperiences = async (req, res) => {
  try {
    const experiences = await Experience.find({
      bookmarks: req.user.id,
      status: 'active',
    }).select('_id');
    
    res.json({
      success: true,
      bookmarked: experiences.map(e => e._id),
    });
  } catch (error) {
    console.error('Get bookmarked experiences error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete comment (Admin or Owner)
// @route   DELETE /api/experiences/:id/comments/:commentId
export const deleteComment = async (req, res) => {
  try {
    const io = req.app.get('io');
    const { id, commentId } = req.params;
    
    const experience = await Experience.findById(id);
    if (!experience) {
      return res.status(404).json({ success: false, message: 'Experience not found' });
    }

    const comment = experience.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    // Check if user is authorized to delete
    const isOwner = experience.user.toString() === req.user.id;
    const isCommentOwner = comment.user && comment.user.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isCommentOwner && !isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this comment' 
      });
    }

    const deletedComment = {
      _id: comment._id,
      userName: comment.userName,
      content: comment.content
    };

    // Remove the comment
    experience.comments = experience.comments.filter(c => c._id.toString() !== commentId);
    await experience.save();

    // Emit socket event for comment deletion
    if (io) {
      io.emit('experience-comment-deleted', {
        experienceId: experience._id,
        commentId: commentId,
        deletedBy: req.user.name
      });
    }

    res.json({
      success: true,
      message: 'Comment deleted successfully',
      deletedComment
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete reply (Admin or Owner)
// @route   DELETE /api/experiences/:id/comments/:commentId/replies/:replyId
export const deleteReply = async (req, res) => {
  try {
    const io = req.app.get('io');
    const { id, commentId, replyId } = req.params;
    
    const experience = await Experience.findById(id);
    if (!experience) {
      return res.status(404).json({ success: false, message: 'Experience not found' });
    }

    const comment = experience.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    // Recursive function to find and remove a reply
    const findAndRemoveReply = (replies, replyId) => {
      if (!replies || replies.length === 0) return null;
      
      const index = replies.findIndex(r => r._id && r._id.toString() === replyId);
      if (index !== -1) {
        const removed = replies[index];
        replies.splice(index, 1);
        return removed;
      }
      
      for (const reply of replies) {
        if (reply.replies && reply.replies.length > 0) {
          const found = findAndRemoveReply(reply.replies, replyId);
          if (found) return found;
        }
      }
      return null;
    };

    const removedReply = findAndRemoveReply(comment.replies, replyId);
    if (!removedReply) {
      return res.status(404).json({ 
        success: false, 
        message: 'Reply not found' 
      });
    }

    // Check if user is authorized to delete
    const isOwner = experience.user.toString() === req.user.id;
    const isReplyOwner = removedReply.user && removedReply.user.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isReplyOwner && !isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this reply' 
      });
    }

    await experience.save();

    // Emit socket event for reply deletion
    if (io) {
      io.emit('experience-reply-deleted', {
        experienceId: experience._id,
        commentId: commentId,
        replyId: replyId,
        deletedBy: req.user.name
      });
    }

    res.json({
      success: true,
      message: 'Reply deleted successfully',
      deletedReply: removedReply
    });
  } catch (error) {
    console.error('Delete reply error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
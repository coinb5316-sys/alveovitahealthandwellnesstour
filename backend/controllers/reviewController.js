// backend/controllers/reviewController.js
import Tour from '../models/Tour.js';
import Hotel from '../models/Hotel.js';
import Notification from '../models/Notification.js';

// ============================================
// NOTIFICATION HELPERS
// ============================================

const createReviewNotification = async (io, userId, review, itemType, itemName, itemId, rating) => {
  try {
    const notificationData = {
      user: userId,
      type: 'review',
      title: `New ${itemType} Review`,
      message: `Your review "${review.title}" for ${itemType} "${itemName}" has been submitted`,
      icon: 'Star',
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      actionUrl: `/${itemType}s/${itemId}`,
      actionLabel: 'View Review',
      priority: 'medium',
      metadata: { 
        reviewId: review._id,
        itemId,
        itemType,
        rating 
      }
    };
    
    const notification = await Notification.create(notificationData);
    
    if (io) {
      const unreadCount = await Notification.getUnreadCount(userId);
      io.to(`user-${userId}`).emit('new-notification', {
        notification,
        unreadCount
      });
    }
    
    return notification;
  } catch (error) {
    console.error('❌ Create review notification error:', error);
    return null;
  }
};

const createAdminReviewNotification = async (io, review, itemType, itemName, userName) => {
  try {
    // Find admin users
    const adminUsers = await User.find({ role: 'admin' });
    
    for (const admin of adminUsers) {
      const notificationData = {
        user: admin._id,
        type: 'review',
        title: `New ${itemType} Review`,
        message: `${userName} reviewed "${itemName}" with ${review.rating} stars`,
        icon: 'Star',
        color: 'text-amber-500',
        bgColor: 'bg-amber-500/10',
        actionUrl: `/admin/reviews`,
        actionLabel: 'View Review',
        priority: 'medium',
        metadata: { 
          reviewId: review._id,
          itemId: review.itemId,
          itemType,
          rating: review.rating 
        }
      };
      
      const notification = await Notification.create(notificationData);
      
      if (io) {
        const unreadCount = await Notification.getUnreadCount(admin._id);
        io.to(`user-${admin._id}`).emit('new-notification', {
          notification,
          unreadCount
        });
      }
    }
  } catch (error) {
    console.error('❌ Create admin review notification error:', error);
  }
};

// ============================================
// CONTROLLER FUNCTIONS
// ============================================

export const getTourReviews = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id)
      .populate('reviewList.user', 'name avatar');

    if (!tour) {
      return res.status(404).json({ success: false, message: 'Tour not found' });
    }

    const approvedReviews = tour.reviewList.filter(r => r.status === 'approved');
    const distribution = {};
    approvedReviews.forEach(r => {
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
    });

    res.json({
      success: true,
      reviews: approvedReviews,
      total: approvedReviews.length,
      rating: tour.rating || 0,
      distribution
    });
  } catch (error) {
    console.error('Get tour reviews error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getHotelReviews = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id)
      .populate('reviewList.user', 'name avatar');

    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    const approvedReviews = hotel.reviewList.filter(r => r.status === 'approved');
    const distribution = {};
    approvedReviews.forEach(r => {
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
    });

    res.json({
      success: true,
      reviews: approvedReviews,
      total: approvedReviews.length,
      rating: hotel.rating || 0,
      distribution
    });
  } catch (error) {
    console.error('Get hotel reviews error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addTourReview = async (req, res) => {
  try {
    const { rating, title, comment, images } = req.body;
    const tourId = req.params.id;
    const io = req.app.get('io');

    if (!rating || !title || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide rating, title, and comment'
      });
    }

    const tour = await Tour.findById(tourId);
    if (!tour) {
      return res.status(404).json({ success: false, message: 'Tour not found' });
    }

    const existingReview = tour.reviewList.find(
      r => r.user && r.user.toString() === req.user.id
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this tour'
      });
    }

    const newReview = {
      user: req.user.id,
      userName: req.user.name,
      userEmail: req.user.email,
      userAvatar: req.user.avatar || '',
      rating: parseInt(rating),
      title,
      comment,
      images: images || [],
      verified: false,
      status: 'pending',
      date: new Date()
    };

    tour.reviewList.push(newReview);

    const allApproved = tour.reviewList.filter(r => r.status === 'approved');
    if (allApproved.length > 0) {
      const avgRating = allApproved.reduce((sum, r) => sum + r.rating, 0) / allApproved.length;
      tour.rating = Math.round(avgRating * 10) / 10;
      tour.reviews = allApproved.length;
    }

    await tour.save();

    // Get the saved review
    const savedReview = tour.reviewList[tour.reviewList.length - 1];

    // Create notification for user
    await createReviewNotification(io, req.user.id, savedReview, 'tour', tour.title, tourId, rating);

    // Create notification for admins
    await createAdminReviewNotification(io, savedReview, 'tour', tour.title, req.user.name);

    // Emit admin notification via socket
    if (io) {
      io.to('admin-room').emit('admin-notification', {
        type: 'new-review',
        reviewType: 'tour',
        itemId: tourId,
        itemName: tour.title,
        userName: req.user.name,
        rating: rating,
        title: title,
        message: `New tour review from ${req.user.name} on "${tour.title}"`,
        timestamp: new Date()
      });
    }

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully and is pending approval',
      review: newReview
    });
  } catch (error) {
    console.error('Add tour review error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addHotelReview = async (req, res) => {
  try {
    const { rating, title, comment, images } = req.body;
    const hotelId = req.params.id;
    const io = req.app.get('io');

    if (!rating || !title || !comment) {
      return res.status(400).json({
        success: false,
        message: 'Please provide rating, title, and comment'
      });
    }

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    const existingReview = hotel.reviewList.find(
      r => r.user && r.user.toString() === req.user.id
    );

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this hotel'
      });
    }

    const newReview = {
      user: req.user.id,
      userName: req.user.name,
      userEmail: req.user.email,
      userAvatar: req.user.avatar || '',
      rating: parseInt(rating),
      title,
      comment,
      images: images || [],
      verified: false,
      status: 'pending',
      date: new Date()
    };

    hotel.reviewList.push(newReview);

    const allApproved = hotel.reviewList.filter(r => r.status === 'approved');
    if (allApproved.length > 0) {
      const avgRating = allApproved.reduce((sum, r) => sum + r.rating, 0) / allApproved.length;
      hotel.rating = Math.round(avgRating * 10) / 10;
      hotel.reviews = allApproved.length;
    }

    await hotel.save();

    const savedReview = hotel.reviewList[hotel.reviewList.length - 1];

    // Create notification for user
    await createReviewNotification(io, req.user.id, savedReview, 'hotel', hotel.name, hotelId, rating);

    // Create notification for admins
    await createAdminReviewNotification(io, savedReview, 'hotel', hotel.name, req.user.name);

    if (io) {
      io.to('admin-room').emit('admin-notification', {
        type: 'new-review',
        reviewType: 'hotel',
        itemId: hotelId,
        itemName: hotel.name,
        userName: req.user.name,
        rating: rating,
        title: title,
        message: `New hotel review from ${req.user.name} on "${hotel.name}"`,
        timestamp: new Date()
      });
    }

    res.status(201).json({
      success: true,
      message: 'Review submitted successfully and is pending approval',
      review: newReview
    });
  } catch (error) {
    console.error('Add hotel review error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getAdminReviews = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, type } = req.query;

    let allReviews = [];

    const tours = await Tour.find({ 'reviewList.0': { $exists: true } })
      .populate('reviewList.user', 'name avatar email')
      .lean();

    tours.forEach(tour => {
      tour.reviewList.forEach(review => {
        allReviews.push({
          ...review,
          tourId: tour._id,
          tourTitle: tour.title,
          tourImage: tour.images?.[0] || '',
          type: 'tour',
          itemType: 'tour',
          itemName: tour.title,
          itemId: tour._id,
        });
      });
    });

    const hotels = await Hotel.find({ 'reviewList.0': { $exists: true } })
      .populate('reviewList.user', 'name avatar email')
      .lean();

    hotels.forEach(hotel => {
      hotel.reviewList.forEach(review => {
        allReviews.push({
          ...review,
          hotelId: hotel._id,
          hotelName: hotel.name,
          hotelImage: hotel.images?.[0] || '',
          type: 'hotel',
          itemType: 'hotel',
          itemName: hotel.name,
          itemId: hotel._id,
        });
      });
    });

    if (type && type !== 'all') {
      allReviews = allReviews.filter(r => r.type === type);
    }

    if (status && status !== 'all') {
      allReviews = allReviews.filter(r => r.status === status);
    }

    allReviews.sort((a, b) => new Date(b.date) - new Date(a.date));

    const total = allReviews.length;
    const start = (parseInt(page) - 1) * parseInt(limit);
    const paginatedReviews = allReviews.slice(start, start + parseInt(limit));

    res.json({
      success: true,
      reviews: paginatedReviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get admin reviews error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateReviewStatus = async (req, res) => {
  try {
    const { status, reply } = req.body;
    const { reviewId } = req.params;
    const io = req.app.get('io');

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status'
      });
    }

    let tour = await Tour.findOne({ 'reviewList._id': reviewId });
    let item = tour;
    let itemType = 'tour';

    if (!tour) {
      const hotel = await Hotel.findOne({ 'reviewList._id': reviewId });
      if (hotel) {
        item = hotel;
        itemType = 'hotel';
      }
    }

    if (!item) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const review = item.reviewList.id(reviewId);
    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const oldStatus = review.status;
    review.status = status;
    if (reply) {
      review.reply = { admin: reply, date: new Date() };
    }

    const allApproved = item.reviewList.filter(r => r.status === 'approved');
    if (allApproved.length > 0) {
      const avgRating = allApproved.reduce((sum, r) => sum + r.rating, 0) / allApproved.length;
      item.rating = Math.round(avgRating * 10) / 10;
      item.reviews = allApproved.length;
    } else {
      item.rating = 0;
      item.reviews = 0;
    }

    await item.save();

    // Create notification for the review author
    if (review.user) {
      const notificationData = {
        user: review.user,
        type: 'review',
        title: `Review ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        message: `Your review "${review.title}" for ${itemType} "${itemType === 'tour' ? item.title : item.name}" has been ${status}`,
        icon: 'Star',
        color: status === 'approved' ? 'text-green-500' : 'text-red-500',
        bgColor: status === 'approved' ? 'bg-green-500/10' : 'bg-red-500/10',
        actionUrl: `/${itemType}s/${item._id}`,
        actionLabel: 'View Review',
        priority: 'medium',
        metadata: { reviewId, status }
      };
      
      const notification = await Notification.create(notificationData);
      
      if (io) {
        const unreadCount = await Notification.getUnreadCount(review.user);
        io.to(`user-${review.user}`).emit('new-notification', {
          notification,
          unreadCount
        });
      }
    }

    if (io) {
      io.to('admin-room').emit('admin-notification', {
        type: 'review-status-changed',
        reviewId: reviewId,
        itemType: itemType,
        itemName: itemType === 'tour' ? item.title : item.name,
        userName: review.userName,
        oldStatus: oldStatus,
        newStatus: status,
        message: `Review from ${review.userName} was ${status} by ${req.user.name}`,
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      message: `Review ${status} successfully`,
      review,
      itemType
    });
  } catch (error) {
    console.error('Update review status error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const io = req.app.get('io');

    let tour = await Tour.findOne({ 'reviewList._id': reviewId });
    let item = tour;
    let itemType = 'tour';

    if (!tour) {
      const hotel = await Hotel.findOne({ 'reviewList._id': reviewId });
      if (hotel) {
        item = hotel;
        itemType = 'hotel';
      }
    }

    if (!item) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    const review = item.reviewList.id(reviewId);
    const userName = review?.userName || 'Unknown';

    item.reviewList = item.reviewList.filter(r => r._id.toString() !== reviewId);

    const allApproved = item.reviewList.filter(r => r.status === 'approved');
    if (allApproved.length > 0) {
      const avgRating = allApproved.reduce((sum, r) => sum + r.rating, 0) / allApproved.length;
      item.rating = Math.round(avgRating * 10) / 10;
      item.reviews = allApproved.length;
    } else {
      item.rating = 0;
      item.reviews = 0;
    }

    await item.save();

    if (io) {
      io.to('admin-room').emit('admin-notification', {
        type: 'review-deleted',
        reviewId: reviewId,
        itemType: itemType,
        userName: userName,
        message: `Review from ${userName} was deleted by ${req.user.name}`,
        timestamp: new Date()
      });
    }

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
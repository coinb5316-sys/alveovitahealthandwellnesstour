// controllers/reviewController.js - COMPLETE with Alveoly Notification Pattern
import Tour from '../models/Tour.js';
import Hotel from '../models/Hotel.js';
import User from '../models/User.js';
import { createNotification } from './notificationController.js';

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

    const savedReview = tour.reviewList[tour.reviewList.length - 1];

    // Create notification for user
    await createNotification(
      req.user.id,
      'user',
      'info',
      `⭐ Review Submitted: ${tour.title}`,
      `Your review "${title}" for "${tour.title}" has been submitted and is pending approval.`,
      `/tour/${tourId}`,
      { reviewId: savedReview._id, itemId: tourId, itemType: 'tour', action: 'review_submitted' }
    );

    // Create notification for admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await createNotification(
        admin._id,
        'admin',
        'info',
        `⭐ New Tour Review from ${req.user.name}`,
        `${req.user.name} reviewed "${tour.title}" with ${rating} stars.`,
        `/admin/reviews`,
        { reviewId: savedReview._id, itemId: tourId, itemType: 'tour', action: 'new_review' }
      );
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
    await createNotification(
      req.user.id,
      'user',
      'info',
      `⭐ Review Submitted: ${hotel.name}`,
      `Your review "${title}" for "${hotel.name}" has been submitted and is pending approval.`,
      `/hotel/${hotelId}`,
      { reviewId: savedReview._id, itemId: hotelId, itemType: 'hotel', action: 'review_submitted' }
    );

    // Create notification for admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await createNotification(
        admin._id,
        'admin',
        'info',
        `⭐ New Hotel Review from ${req.user.name}`,
        `${req.user.name} reviewed "${hotel.name}" with ${rating} stars.`,
        `/admin/reviews`,
        { reviewId: savedReview._id, itemId: hotelId, itemType: 'hotel', action: 'new_review' }
      );
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
      const statusMessages = {
        approved: '✅ Your review has been approved!',
        rejected: '❌ Your review has been rejected.',
        pending: '⏳ Your review is pending approval.'
      };

      await createNotification(
        review.user,
        'user',
        status === 'approved' ? 'success' : status === 'rejected' ? 'warning' : 'info',
        `📋 Review ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        `${statusMessages[status]} "${review.title}" for ${itemType === 'tour' ? item.title : item.name}`,
        `/${itemType}s/${item._id}`,
        { reviewId, status, itemId: item._id, itemType, action: 'review_status_update' }
      );
    }

    // Create notification for admin
    await createNotification(
      req.user.id,
      'admin',
      'success',
      `✅ Review ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      `You ${status} ${review.userName}'s review for ${itemType === 'tour' ? item.title : item.name}.`,
      `/admin/reviews`,
      { reviewId, status, itemId: item._id, itemType, action: 'review_status_admin' }
    );

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

    // Create notification for admin
    await createNotification(
      req.user.id,
      'admin',
      'warning',
      `🗑️ Review Deleted`,
      `You deleted ${userName}'s review for ${itemType === 'tour' ? item.title : item.name}.`,
      `/admin/reviews`,
      { reviewId, itemId: item._id, itemType, action: 'review_deleted' }
    );

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
import Booking from '../models/Booking.js';
import Revenue from '../models/Revenue.js';
import Tour from '../models/Tour.js';
import Hotel from '../models/Hotel.js';
import mongoose from 'mongoose';
import { createNotification } from '../utils/notificationHelper.js';

// @desc    Get all bookings (admin)
// @route   GET /api/bookings/admin
export const getAdminBookings = async (req, res) => {
  try {
    console.log('🔍 Admin fetching all bookings - User:', req.user?.id, 'Role:', req.user?.role);
    
    const { page = 1, limit = 20, status, type, search, showDeleted = 'false' } = req.query;
    
    const query = {};
    
    if (showDeleted !== 'true') {
      query.isDeleted = { $ne: true };
    }
    
    if (status && status !== 'all') query.status = status;
    if (type && type !== 'all') query.type = type;
    if (search) {
      query.$or = [
        { customerName: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } },
        { tourTitle: { $regex: search, $options: 'i' } },
        { hotelName: { $regex: search, $options: 'i' } },
        { destination: { $regex: search, $options: 'i' } },
      ];
    }

    const bookings = await Booking.find(query)
      .populate('user', 'name email avatar')
      .populate('tourId', 'title location price images')
      .populate('hotelId', 'name location price images')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Booking.countDocuments(query);

    console.log(`📊 Found ${bookings.length} bookings for admin`);

    res.json({
      success: true,
      bookings,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('❌ Get admin bookings error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to fetch bookings'
    });
  }
};

// @desc    Get user bookings (excludes soft-deleted)
// @route   GET /api/bookings/mine
export const getUserBookings = async (req, res) => {
  try {
    console.log('🔍 User fetching bookings - User:', req.user?.id);
    
    const bookings = await Booking.find({ 
      user: req.user.id,
      isDeleted: { $ne: true }
    })
      .populate('tourId', 'title location price images duration rating')
      .populate('hotelId', 'name location price images rating')
      .sort({ createdAt: -1 });

    console.log(`📊 Found ${bookings.length} bookings for user ${req.user?.id}`);

    res.json({ 
      success: true, 
      bookings: bookings || [] 
    });
  } catch (error) {
    console.error('❌ Get user bookings error:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message || 'Failed to fetch bookings'
    });
  }
};

// @desc    User soft delete - hides from user only
// @route   DELETE /api/bookings/:id/soft-delete
export const softDeleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.user.toString() !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this booking' 
      });
    }

    if (booking.isDeleted && booking.deletedFor === 'user') {
      booking.isDeleted = false;
      booking.deletedAt = null;
      booking.deletedBy = null;
      booking.deletedFor = null;
      await booking.save();
      
      return res.json({ 
        success: true, 
        message: 'Booking restored successfully' 
      });
    }

    booking.isDeleted = true;
    booking.deletedAt = new Date();
    booking.deletedBy = req.user.id;
    booking.deletedFor = 'user';
    await booking.save();

    console.log(`✅ Booking ${booking._id} soft deleted by user ${req.user.id}`);

    res.json({ 
      success: true, 
      message: 'Booking deleted successfully' 
    });
  } catch (error) {
    console.error('❌ Soft delete booking error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Admin delete with options
// @route   DELETE /api/bookings/:id/admin-delete
export const adminDeleteBooking = async (req, res) => {
  try {
    const { permanent = 'false', hideFrom = 'all' } = req.query;
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (permanent === 'true') {
      await Revenue.findOneAndDelete({ bookingId: booking._id });
      await booking.deleteOne();
      
      console.log(`✅ Booking ${booking._id} permanently deleted by admin ${req.user.id}`);
      
      return res.json({ 
        success: true, 
        message: 'Booking permanently deleted successfully' 
      });
    }

    if (hideFrom === 'all') {
      booking.isDeleted = true;
      booking.deletedAt = new Date();
      booking.deletedBy = req.user.id;
      booking.deletedFor = 'all';
      await booking.save();
      
      console.log(`✅ Booking ${booking._id} hidden from everyone by admin ${req.user.id}`);
      
      return res.json({ 
        success: true, 
        message: 'Booking hidden from everyone successfully' 
      });
    }

    if (hideFrom === 'admin') {
      booking.deletedAt = new Date();
      booking.deletedBy = req.user.id;
      booking.deletedFor = 'admin';
      await booking.save();
      
      console.log(`✅ Booking ${booking._id} hidden from admin view by admin ${req.user.id}`);
      
      return res.json({ 
        success: true, 
        message: 'Booking hidden from admin view successfully' 
      });
    }

    res.status(400).json({
      success: false,
      message: 'Invalid delete option'
    });
  } catch (error) {
    console.error('❌ Admin delete booking error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Restore a soft-deleted booking
// @route   POST /api/bookings/:id/restore
export const restoreBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    booking.isDeleted = false;
    booking.deletedAt = null;
    booking.deletedBy = null;
    booking.deletedFor = null;
    await booking.save();

    console.log(`✅ Booking ${booking._id} restored by ${req.user.role}: ${req.user.id}`);

    res.json({ 
      success: true, 
      booking,
      message: 'Booking restored successfully' 
    });
  } catch (error) {
    console.error('❌ Restore booking error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get deleted bookings (admin only)
// @route   GET /api/bookings/deleted
export const getDeletedBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ 
      isDeleted: true 
    })
      .populate('user', 'name email avatar')
      .populate('tourId', 'title location price images')
      .populate('hotelId', 'name location price images')
      .sort({ deletedAt: -1 });

    res.json({
      success: true,
      bookings,
    });
  } catch (error) {
    console.error('❌ Get deleted bookings error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a booking (legacy - kept for backward compatibility)
// @route   DELETE /api/bookings/:id
export const deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    
    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const isOwner = booking.user.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ 
        success: false, 
        message: 'Not authorized to delete this booking' 
      });
    }

    if (isOwner && !isAdmin) {
      booking.isDeleted = true;
      booking.deletedAt = new Date();
      booking.deletedBy = req.user.id;
      booking.deletedFor = 'user';
      await booking.save();
      
      return res.json({ 
        success: true, 
        message: 'Booking deleted successfully' 
      });
    }

    await Revenue.findOneAndDelete({ bookingId: booking._id });
    await booking.deleteOne();

    console.log(`✅ Booking ${booking._id} deleted by ${req.user.role}: ${req.user.id}`);

    res.json({ 
      success: true, 
      message: 'Booking deleted successfully' 
    });
  } catch (error) {
    console.error('❌ Delete booking error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Mark booking as completed (admin only)
// @route   PATCH /api/bookings/:id/complete
export const completeBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'completed',
        completedAt: new Date()
      },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    console.log(`✅ Booking ${booking._id} marked as completed`);

    res.json({ 
      success: true, 
      booking,
      message: 'Booking marked as completed successfully'
    });
  } catch (error) {
    console.error('❌ Complete booking error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single booking
// @route   GET /api/bookings/:id
export const getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('user', 'name email avatar')
      .populate('tourId', 'title location price images duration rating description')
      .populate('hotelId', 'name location price images rating description');

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    if (booking.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, booking });
  } catch (error) {
    console.error('❌ Get booking error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create booking
// @route   POST /api/bookings
export const createBooking = async (req, res) => {
  try {
    const bookingData = {
      ...req.body,
      user: req.user.id,
      customerName: req.body.customerName || req.user.name,
      customerEmail: req.body.customerEmail || req.user.email,
    };

    const booking = await Booking.create(bookingData);
    await booking.populate('user', 'name email');

    const io = req.app.get('io');

    // ✅ Notify user about booking
    await createNotification(io, req.user.id, {
      type: 'booking',
      title: '📅 Booking Confirmed!',
      message: `Your ${booking.type} booking has been confirmed.`,
      icon: 'Calendar',
      color: 'text-indigo-500',
      bgColor: 'bg-indigo-500/10',
      actionUrl: `/bookings/${booking._id}`,
      actionLabel: 'View Booking',
      priority: 'high'
    });

    // ✅ Notify admins about new booking
    if (io) {
      io.to('admin-room').emit('admin-notification', {
        type: 'new-booking',
        bookingId: booking._id,
        userName: req.user.name,
        userEmail: req.user.email,
        message: `📋 New ${booking.type} booking from ${req.user.name}`,
        timestamp: new Date()
      });
    }

    console.log(`✅ Booking created successfully: ${booking._id}`);

    res.status(201).json({ 
      success: true, 
      booking,
      message: 'Booking created successfully'
    });
  } catch (error) {
    console.error('❌ Create booking error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update booking status
// @route   PATCH /api/bookings/:id/status
export const updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    const io = req.app.get('io');

    // ✅ Notify user when booking is confirmed
    if (status === 'confirmed') {
      await createNotification(io, booking.user, {
        type: 'booking',
        title: '✅ Booking Approved!',
        message: `Your ${booking.type} booking has been approved.`,
        icon: 'CheckCircle',
        color: 'text-green-500',
        bgColor: 'bg-green-500/10',
        actionUrl: `/bookings/${booking._id}`,
        actionLabel: 'View Booking',
        priority: 'high'
      });
    }

    // ✅ Notify user when booking is cancelled
    if (status === 'cancelled') {
      await createNotification(io, booking.user, {
        type: 'booking',
        title: '❌ Booking Cancelled',
        message: `Your ${booking.type} booking has been cancelled.`,
        icon: 'AlertCircle',
        color: 'text-red-500',
        bgColor: 'bg-red-500/10',
        actionUrl: `/bookings/${booking._id}`,
        actionLabel: 'View Details',
        priority: 'high'
      });
    }

    if (status === 'confirmed') {
      await Revenue.findOneAndUpdate(
        { bookingId: booking._id },
        { status: 'completed' }
      );
    }

    console.log(`✅ Booking ${booking._id} status updated to: ${status}`);

    res.json({ 
      success: true, 
      booking,
      message: `Booking ${status} successfully`
    });
  } catch (error) {
    console.error('❌ Update booking status error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel booking
// @route   POST /api/bookings/:id/cancel
export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: 'cancelled' },
      { new: true }
    );

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // ✅ Notify user about cancellation
    const io = req.app.get('io');
    await createNotification(io, booking.user, {
      type: 'booking',
      title: '❌ Booking Cancelled',
      message: `Your ${booking.type} booking has been cancelled.`,
      icon: 'AlertCircle',
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      actionUrl: `/bookings/${booking._id}`,
      actionLabel: 'View Details',
      priority: 'high'
    });

    await Revenue.findOneAndUpdate(
      { bookingId: booking._id },
      { status: 'refunded' }
    );

    console.log(`✅ Booking ${booking._id} cancelled`);

    res.json({ 
      success: true, 
      booking,
      message: 'Booking cancelled successfully'
    });
  } catch (error) {
    console.error('❌ Cancel booking error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get booking stats for admin
// @route   GET /api/bookings/admin/stats
export const getBookingStats = async (req, res) => {
  try {
    const total = await Booking.countDocuments();
    const pending = await Booking.countDocuments({ status: 'pending' });
    const confirmed = await Booking.countDocuments({ status: 'confirmed' });
    const completed = await Booking.countDocuments({ status: 'completed' });
    const cancelled = await Booking.countDocuments({ status: 'cancelled' });

    const totalRevenue = await Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayBookings = await Booking.countDocuments({
      createdAt: { $gte: today, $lt: tomorrow }
    });

    const weekStart = new Date(today);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);
    
    const thisWeek = await Booking.countDocuments({
      createdAt: { $gte: weekStart, $lt: weekEnd }
    });

    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    
    const thisMonth = await Booking.countDocuments({
      createdAt: { $gte: monthStart, $lt: monthEnd }
    });

    const tourBookings = await Booking.countDocuments({ type: 'tour' });
    const hotelBookings = await Booking.countDocuments({ type: 'hotel' });

    res.json({
      success: true,
      stats: {
        total,
        pending,
        confirmed,
        completed,
        cancelled,
        totalRevenue: totalRevenue[0]?.total || 0,
        tourBookings,
        hotelBookings,
        todayBookings,
        thisWeek,
        thisMonth
      }
    });
  } catch (error) {
    console.error('❌ Get booking stats error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
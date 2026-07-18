// controllers/bookingController.js - COMPLETE with Alveoly Notification Pattern
import Booking from '../models/Booking.js';
import Revenue from '../models/Revenue.js';
import Tour from '../models/Tour.js';
import Hotel from '../models/Hotel.js';
import User from '../models/User.js';
import { createNotification } from './notificationController.js';

// ============================================
// CONTROLLER FUNCTIONS
// ============================================

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

    // Create notification for user
    await createNotification(
      booking.user,
      'user',
      "success",
      `✅ Booking Completed: ${booking.tourTitle || booking.hotelName || 'Booking'}`,
      `Your booking has been marked as completed. Thank you for choosing Alveovita!`,
      `/bookings/${booking._id}`,
      { bookingId: booking._id, action: "booking_completed" }
    );

    // Create notification for admin
    await createNotification(
      req.user.id,
      "admin",
      "success",
      `✅ Booking Completed: #${booking._id.toString().slice(-6)}`,
      `Booking for ${booking.customerName} has been marked as completed.`,
      `/admin/bookings/${booking._id}`,
      { bookingId: booking._id, action: "booking_completed_admin" }
    );

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

    // Create notification for user
    await createNotification(
      req.user.id,
      'user',
      "info",
      `📅 New Booking Created: ${booking.tourTitle || booking.hotelName || 'Booking'}`,
      `Your booking has been created and is pending confirmation.`,
      `/bookings/${booking._id}`,
      { bookingId: booking._id, action: "booking_created" }
    );

    // Create notification for admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await createNotification(
        admin._id,
        'admin',
        "info",
        `📅 New Booking: ${booking.customerName}`,
        `${booking.customerName} booked ${booking.tourTitle || booking.hotelName || 'a service'}.`,
        `/admin/bookings/${booking._id}`,
        { bookingId: booking._id, action: "new_booking_admin" }
      );
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

    if (status === 'confirmed') {
      await Revenue.findOneAndUpdate(
        { bookingId: booking._id },
        { status: 'completed' }
      );
    }

    // Create notification for user
    const statusMessages = {
      confirmed: 'Your booking has been confirmed! 🎉',
      pending: 'Your booking is pending confirmation.',
      cancelled: 'Your booking has been cancelled.',
      completed: 'Your booking has been completed. Thank you!'
    };

    await createNotification(
      booking.user,
      'user',
      status === 'confirmed' ? "success" : status === 'cancelled' ? "warning" : "info",
      `📊 Booking ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      statusMessages[status] || `Your booking status has been updated to ${status}.`,
      `/bookings/${booking._id}`,
      { bookingId: booking._id, action: "booking_status_update", status }
    );

    // Create notification for admin
    await createNotification(
      req.user.id,
      "admin",
      "info",
      `✅ Booking Status Updated: #${booking._id.toString().slice(-6)}`,
      `Booking for ${booking.customerName} is now ${status}.`,
      `/admin/bookings/${booking._id}`,
      { bookingId: booking._id, action: "booking_status_admin", status }
    );

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

    await Revenue.findOneAndUpdate(
      { bookingId: booking._id },
      { status: 'refunded' }
    );

    // Create notification for user
    await createNotification(
      booking.user,
      'user',
      "warning",
      `❌ Booking Cancelled: ${booking.tourTitle || booking.hotelName || 'Booking'}`,
      `Your booking has been cancelled. Please contact support if you have any questions.`,
      `/bookings/${booking._id}`,
      { bookingId: booking._id, action: "booking_cancelled" }
    );

    // Create notification for admin
    await createNotification(
      req.user.id,
      "admin",
      "warning",
      `❌ Booking Cancelled: #${booking._id.toString().slice(-6)}`,
      `Booking for ${booking.customerName} has been cancelled.`,
      `/admin/bookings/${booking._id}`,
      { bookingId: booking._id, action: "booking_cancelled_admin" }
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
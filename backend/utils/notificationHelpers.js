// backend/utils/notificationHelpers.js
import Notification from '../models/Notification.js';

/**
 * Create a notification for a user with socket emission
 * @param {Object} io - Socket.IO instance
 * @param {string} userId - User ID
 * @param {Object} data - Notification data
 */
export const createNotification = async (io, userId, data) => {
  try {
    const notification = await Notification.create({
      user: userId,
      type: data.type || 'system',
      title: data.title,
      message: data.message,
      icon: data.icon || 'Bell',
      color: data.color || 'text-amber-500',
      bgColor: data.bgColor || 'bg-amber-500/10',
      priority: data.priority || 'medium',
      actionUrl: data.actionUrl || null,
      actionLabel: data.actionLabel || null,
      metadata: data.metadata || {}
    });
    
    // Emit socket event
    if (io) {
      const unreadCount = await Notification.getUnreadCount(userId);
      io.to(`user-${userId}`).emit('new-notification', {
        notification,
        unreadCount
      });
    }
    
    return notification;
  } catch (error) {
    console.error('❌ Create notification error:', error);
    return null;
  }
};

/**
 * Create booking notifications
 */
export const createBookingNotifications = async (io, booking, user) => {
  const notifications = [];
  
  // User notification
  const userNotif = await createNotification(io, user._id, {
    type: 'booking',
    title: `Booking ${booking.status}`,
    message: `Your ${booking.type} booking for ${booking.tourTitle || booking.hotelName || 'Alveovita'} has been ${booking.status}`,
    icon: 'Calendar',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    actionUrl: `/bookings/${booking._id}`,
    actionLabel: 'View Booking',
    priority: 'high',
    metadata: { bookingId: booking._id }
  });
  if (userNotif) notifications.push(userNotif);
  
  return notifications;
};

/**
 * Create payment notifications
 */
export const createPaymentNotifications = async (io, booking, user) => {
  const notifications = [];
  
  // User notification
  const userNotif = await createNotification(io, user._id, {
    type: 'payment',
    title: 'Payment Successful',
    message: `Your payment of $${booking.totalAmount} for ${booking.tourTitle || booking.hotelName || 'Alveovita'} has been confirmed`,
    icon: 'CreditCard',
    color: 'text-green-500',
    bgColor: 'bg-green-500/10',
    actionUrl: `/bookings/${booking._id}`,
    actionLabel: 'View Booking',
    priority: 'high',
    metadata: { bookingId: booking._id, amount: booking.totalAmount }
  });
  if (userNotif) notifications.push(userNotif);
  
  return notifications;
};

/**
 * Create review notifications
 */
export const createReviewNotifications = async (io, review, item, itemName, user) => {
  const notifications = [];
  
  // Admin notification
  const adminNotif = await createNotification(io, 'admin', {
    type: 'review',
    title: `New Review: ${review.title}`,
    message: `${user.name} reviewed "${itemName}" with ${review.rating} stars`,
    icon: 'Star',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
    actionUrl: `/admin/reviews`,
    actionLabel: 'View Review',
    priority: 'medium',
    metadata: { reviewId: review._id, itemId: item._id }
  });
  if (adminNotif) notifications.push(adminNotif);
  
  return notifications;
};
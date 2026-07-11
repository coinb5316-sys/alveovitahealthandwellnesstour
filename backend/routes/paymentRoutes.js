// backend/routes/paymentRoutes.js
import express from 'express';
import paystack from '../config/paystack.js';
import { protect } from '../middleware/auth.js';
import Booking from '../models/Booking.js';
import Revenue from '../models/Revenue.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// ============================================
// NOTIFICATION HELPERS
// ============================================

const createPaymentNotification = async (io, userId, booking, status, amount) => {
  try {
    const itemName = booking.tourTitle || booking.hotelName || 'Alveovita';
    const type = booking.type || 'tour';
    
    const notificationData = {
      user: userId,
      type: 'payment',
      title: status === 'success' ? 'Payment Successful' : 'Payment Failed',
      message: status === 'success' 
        ? `Your payment of $${amount} for "${itemName}" has been confirmed`
        : `Payment of $${amount} for "${itemName}" failed. Please try again.`,
      icon: 'CreditCard',
      color: status === 'success' ? 'text-green-500' : 'text-red-500',
      bgColor: status === 'success' ? 'bg-green-500/10' : 'bg-red-500/10',
      actionUrl: `/bookings/${booking._id}`,
      actionLabel: status === 'success' ? 'View Booking' : 'Retry Payment',
      priority: status === 'success' ? 'high' : 'urgent',
      metadata: { 
        bookingId: booking._id, 
        amount,
        status 
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
    console.error('❌ Create payment notification error:', error);
    return null;
  }
};

// ============================================
// ROUTES
// ============================================

router.get('/test', async (req, res) => {
  try {
    const response = await paystack.bank.list();
    res.json({
      success: true,
      message: 'Paystack connection successful!',
      banks: response.data?.slice(0, 5) || []
    });
  } catch (error) {
    console.error('❌ Paystack test failed:', error.response?.data || error.message);
    res.status(500).json({
      success: false,
      message: 'Paystack connection failed',
      error: error.response?.data?.message || error.message
    });
  }
});

router.post('/initialize', protect, async (req, res) => {
  try {
    const io = req.app.get('io');
    const { email, amount, tourTitle, hotelName, customerName, bookingData } = req.body;

    console.log('📝 Payment initialization request:', {
      email: email || req.user.email,
      amount,
      tourTitle,
      hotelName,
      userId: req.user.id
    });

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount. Please provide a valid amount.'
      });
    }

    const existingBooking = await Booking.findOne({
      user: req.user.id,
      type: bookingData?.type || 'tour',
      status: 'pending',
      ...(bookingData?.tourId && { tourId: bookingData.tourId }),
      ...(bookingData?.hotelId && { hotelId: bookingData.hotelId }),
    }).sort({ createdAt: -1 });

    let booking;

    if (existingBooking) {
      booking = existingBooking;
      booking.totalAmount = amount;
      booking.guests = bookingData?.guests || 1;
      booking.nights = bookingData?.nights || 1;
      booking.date = bookingData?.date || new Date();
      booking.customerName = bookingData?.customerName || customerName || req.user.name;
      booking.customerEmail = bookingData?.customerEmail || email || req.user.email;
      booking.customerPhone = bookingData?.customerPhone || '';
      booking.specialRequests = bookingData?.specialRequests || '';
      await booking.save();
      console.log('🔄 Updated existing booking:', booking._id);
    } else {
      booking = await Booking.create({
        user: req.user.id,
        type: bookingData?.type || 'tour',
        tourId: bookingData?.tourId || null,
        hotelId: bookingData?.hotelId || null,
        tourTitle: bookingData?.tourTitle || tourTitle || null,
        hotelName: bookingData?.hotelName || hotelName || null,
        destination: bookingData?.destination || bookingData?.location || '',
        date: bookingData?.date || new Date(),
        nights: bookingData?.nights || 1,
        guests: bookingData?.guests || 1,
        totalAmount: amount,
        status: 'pending',
        paymentStatus: 'pending',
        customerName: bookingData?.customerName || customerName || req.user.name,
        customerEmail: bookingData?.customerEmail || email || req.user.email,
        customerPhone: bookingData?.customerPhone || '',
        specialRequests: bookingData?.specialRequests || '',
      });
      console.log('✅ Created new booking:', booking._id);
    }

    const reference = `ALV-${Date.now()}-${Math.random().toString(36).substring(7)}`;

    const paystackPayload = {
      email: email || req.user.email,
      amount: Math.round(amount * 100),
      reference: reference,
      callback_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment/verify`,
      metadata: {
        custom_fields: [
          {
            display_name: 'Customer Name',
            variable_name: 'customer_name',
            value: customerName || req.user.name,
          },
          {
            display_name: 'Booking ID',
            variable_name: 'booking_id',
            value: booking._id.toString(),
          },
          {
            display_name: 'User ID',
            variable_name: 'user_id',
            value: req.user.id,
          },
        ],
      },
    };

    console.log('📦 Sending to Paystack:', {
      ...paystackPayload,
      amount: paystackPayload.amount / 100
    });

    const response = await paystack.transaction.initialize(paystackPayload);

    console.log('📤 Paystack response status:', response.status);
    console.log('📤 Paystack response message:', response.message);

    if (!response.status) {
      if (!existingBooking) {
        await Booking.findByIdAndDelete(booking._id);
      }
      
      return res.status(400).json({
        success: false,
        message: response.message || 'Payment initialization failed',
        details: response
      });
    }

    await Booking.findByIdAndUpdate(booking._id, {
      paymentReference: reference,
    });

    res.json({
      success: true,
      authorization_url: response.data.authorization_url,
      reference: reference,
      bookingId: booking._id,
    });
  } catch (error) {
    console.error('❌ Payment initialization error:', error);
    
    if (error.response) {
      console.error('Paystack API error:', {
        status: error.response.status,
        data: error.response.data
      });
      
      return res.status(error.response.status || 500).json({
        success: false,
        message: error.response.data?.message || 'Payment gateway error',
        details: error.response.data
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to initialize payment'
    });
  }
});

router.get('/verify/:reference', async (req, res) => {
  try {
    const io = req.app.get('io');
    console.log('🔍 Verifying payment:', req.params.reference);

    const response = await paystack.transaction.verify({
      reference: req.params.reference,
    });

    console.log('📤 Verification response:', {
      status: response.status,
      message: response.message
    });

    if (!response.status) {
      return res.status(400).json({
        success: false,
        message: response.message || 'Payment verification failed'
      });
    }

    if (response.data.status === 'success') {
      const booking = await Booking.findOneAndUpdate(
        { paymentReference: req.params.reference },
        { 
          status: 'confirmed',
          paymentStatus: 'paid'
        },
        { new: true }
      );

      if (booking) {
        const existingRevenue = await Revenue.findOne({ bookingId: booking._id });
        if (!existingRevenue) {
          await Revenue.create({
            bookingId: booking._id,
            userId: booking.user,
            type: booking.type,
            amount: booking.totalAmount,
            paymentReference: req.params.reference,
            status: 'completed',
          });
        }

        // Create payment success notification
        await createPaymentNotification(io, booking.user, booking, 'success', booking.totalAmount);
      }

      res.json({
        success: true,
        data: response.data,
        booking: booking,
      });
    } else {
      const booking = await Booking.findOneAndUpdate(
        { paymentReference: req.params.reference },
        { 
          status: 'cancelled',
          paymentStatus: 'failed'
        },
        { new: true }
      );

      if (booking) {
        // Create payment failure notification
        await createPaymentNotification(io, booking.user, booking, 'failed', booking.totalAmount);
      }

      res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        data: response.data,
      });
    }
  } catch (error) {
    console.error('❌ Payment verification error:', error);
    
    if (error.response) {
      console.error('Paystack API error:', {
        status: error.response.status,
        data: error.response.data
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Payment verification failed'
    });
  }
});

router.post('/webhook', async (req, res) => {
  try {
    const io = req.app.get('io');
    const signature = req.headers['x-paystack-signature'];
    const crypto = await import('crypto');
    const hash = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (hash !== signature) {
      return res.status(401).json({ success: false, message: 'Invalid signature' });
    }

    const event = req.body;
    console.log('📥 Webhook event:', event.event);
    
    switch (event.event) {
      case 'charge.success':
        const existingBooking = await Booking.findOne({ paymentReference: event.data.reference });
        if (existingBooking && existingBooking.status !== 'confirmed') {
          await Booking.findOneAndUpdate(
            { paymentReference: event.data.reference },
            { 
              status: 'confirmed',
              paymentStatus: 'paid'
            }
          );
          
          // Create payment success notification from webhook
          await createPaymentNotification(io, existingBooking.user, existingBooking, 'success', existingBooking.totalAmount);
          console.log('✅ Payment successful:', event.data.reference);
        }
        break;
      case 'charge.failed':
        const failedBooking = await Booking.findOneAndUpdate(
          { paymentReference: event.data.reference },
          { 
            status: 'cancelled',
            paymentStatus: 'failed'
          },
          { new: true }
        );
        
        if (failedBooking) {
          await createPaymentNotification(io, failedBooking.user, failedBooking, 'failed', failedBooking.totalAmount);
        }
        console.log('❌ Payment failed:', event.data.reference);
        break;
      default:
        console.log('📝 Unhandled event:', event.event);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
// backend/routes/paymentRoutes.js
import express from 'express';
import paystack from '../config/paystack.js';
import { protect } from '../middleware/auth.js';
import Booking from '../models/Booking.js';
import Revenue from '../models/Revenue.js';
import { createNotification } from '../utils/notificationHelper.js';

const router = express.Router();

// @desc    Test Paystack connection
// @route   GET /api/payments/test
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

// @desc    Initialize payment
// @route   POST /api/payments/initialize
router.post('/initialize', protect, async (req, res) => {
  try {
    const { email, amount, tourTitle, hotelName, customerName, bookingData } = req.body;

    console.log('📝 Payment initialization request:', {
      email: email || req.user.email,
      amount,
      tourTitle,
      hotelName,
      userId: req.user.id
    });

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid amount. Please provide a valid amount.'
      });
    }

    // Check if there's already a pending booking for this user and tour/hotel
    const existingBooking = await Booking.findOne({
      user: req.user.id,
      type: bookingData?.type || 'tour',
      status: 'pending',
      ...(bookingData?.tourId && { tourId: bookingData.tourId }),
      ...(bookingData?.hotelId && { hotelId: bookingData.hotelId }),
    }).sort({ createdAt: -1 });

    let booking;

    if (existingBooking) {
      // Update existing booking instead of creating a new one
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
      // Create a new booking only if none exists
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
      // Only delete if it's a new booking and payment failed
      if (!existingBooking) {
        await Booking.findByIdAndDelete(booking._id);
      }
      
      return res.status(400).json({
        success: false,
        message: response.message || 'Payment initialization failed',
        details: response
      });
    }

    // Update booking with payment reference
    await Booking.findByIdAndUpdate(booking._id, {
      paymentReference: reference,
    });

    // ✅ Notify user that payment is pending
    const io = req.app.get('io');
    await createNotification(io, req.user.id, {
      type: 'payment',
      title: '💳 Payment Initialized',
      message: `Your payment of $${amount} for ${booking.type} booking is being processed.`,
      icon: 'CreditCard',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      actionUrl: `/bookings/${booking._id}`,
      actionLabel: 'View Booking',
      priority: 'high'
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

// @desc    Verify payment
// @route   GET /api/payments/verify/:reference
router.get('/verify/:reference', async (req, res) => {
  try {
    console.log('🔍 Verifying payment:', req.params.reference);

    const response = await paystack.transaction.verify({
      reference: req.params.reference,
    });

    console.log('📤 Verification response:', {
      status: response.status,
      message: response.message
    });

    if (!response.status) {
      // ✅ Notify user about verification failure
      const failedBooking = await Booking.findOne({ paymentReference: req.params.reference });
      if (failedBooking) {
        const io = req.app.get('io');
        await createNotification(io, failedBooking.user, {
          type: 'payment',
          title: '❌ Payment Verification Failed',
          message: `Your payment verification failed. Please try again or contact support.`,
          icon: 'AlertCircle',
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          actionUrl: `/bookings/${failedBooking._id}`,
          actionLabel: 'Retry Payment',
          priority: 'high'
        });
      }

      return res.status(400).json({
        success: false,
        message: response.message || 'Payment verification failed'
      });
    }

    if (response.data.status === 'success') {
      // Update booking status
      const booking = await Booking.findOneAndUpdate(
        { paymentReference: req.params.reference },
        { 
          status: 'confirmed',
          paymentStatus: 'paid'
        },
        { new: true }
      );

      const io = req.app.get('io');

      // Create revenue record if booking exists
      if (booking) {
        // Check if revenue record already exists to avoid duplicates
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

        // ✅ Notify user about successful payment
        await createNotification(io, booking.user, {
          type: 'payment',
          title: '✅ Payment Successful!',
          message: `Payment of $${booking.totalAmount} for your ${booking.type} booking was successful.`,
          icon: 'CreditCard',
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
          actionUrl: `/bookings/${booking._id}`,
          actionLabel: 'View Booking',
          priority: 'high'
        });

        // ✅ Notify admins about payment
        if (io) {
          io.to('admin-room').emit('admin-notification', {
            type: 'payment-success',
            bookingId: booking._id,
            amount: booking.totalAmount,
            userName: booking.customerName,
            userEmail: booking.customerEmail,
            message: `💰 Payment of $${booking.totalAmount} received from ${booking.customerName}`,
            timestamp: new Date()
          });
        }

        // ✅ Notify about booking confirmation
        await createNotification(io, booking.user, {
          type: 'booking',
          title: '📅 Booking Confirmed!',
          message: `Your ${booking.type} booking has been confirmed after successful payment.`,
          icon: 'Calendar',
          color: 'text-indigo-500',
          bgColor: 'bg-indigo-500/10',
          actionUrl: `/bookings/${booking._id}`,
          actionLabel: 'View Booking',
          priority: 'high'
        });
      }

      res.json({
        success: true,
        data: response.data,
        booking: booking,
      });
    } else {
      // Update booking as failed
      const booking = await Booking.findOneAndUpdate(
        { paymentReference: req.params.reference },
        { 
          status: 'cancelled',
          paymentStatus: 'failed'
        },
        { new: true }
      );

      // ✅ Notify user about payment failure
      if (booking) {
        const io = req.app.get('io');
        await createNotification(io, booking.user, {
          type: 'payment',
          title: '❌ Payment Failed',
          message: `Your payment of $${booking.totalAmount} for ${booking.type} booking failed.`,
          icon: 'AlertCircle',
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          actionUrl: `/bookings/${booking._id}`,
          actionLabel: 'Retry Payment',
          priority: 'high'
        });

        // ✅ Notify admins about payment failure
        if (io) {
          io.to('admin-room').emit('admin-notification', {
            type: 'payment-failed',
            bookingId: booking._id,
            amount: booking.totalAmount,
            userName: booking.customerName,
            userEmail: booking.customerEmail,
            message: `❌ Payment of $${booking.totalAmount} failed for ${booking.customerName}`,
            timestamp: new Date()
          });
        }
      }

      res.status(400).json({
        success: false,
        message: 'Payment verification failed',
        data: response.data,
      });
    }
  } catch (error) {
    console.error('❌ Payment verification error:', error);
    
    // ✅ Notify user about verification error
    try {
      const booking = await Booking.findOne({ paymentReference: req.params.reference });
      if (booking) {
        const io = req.app.get('io');
        await createNotification(io, booking.user, {
          type: 'payment',
          title: '⚠️ Payment Verification Error',
          message: 'There was an error verifying your payment. Please contact support.',
          icon: 'AlertCircle',
          color: 'text-orange-500',
          bgColor: 'bg-orange-500/10',
          actionUrl: `/bookings/${booking._id}`,
          actionLabel: 'Contact Support',
          priority: 'high'
        });
      }
    } catch (notifError) {
      console.error('❌ Notification error:', notifError);
    }

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

// @desc    Webhook for Paystack events
// @route   POST /api/payments/webhook
router.post('/webhook', async (req, res) => {
  try {
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
    
    const io = req.app.get('io');

    switch (event.event) {
      case 'charge.success':
        // Check if booking already exists with this reference
        const existingBooking = await Booking.findOne({ paymentReference: event.data.reference });
        if (existingBooking && existingBooking.status !== 'confirmed') {
          const booking = await Booking.findOneAndUpdate(
            { paymentReference: event.data.reference },
            { 
              status: 'confirmed',
              paymentStatus: 'paid'
            },
            { new: true }
          );

          // ✅ Create revenue record
          if (booking) {
            const existingRevenue = await Revenue.findOne({ bookingId: booking._id });
            if (!existingRevenue) {
              await Revenue.create({
                bookingId: booking._id,
                userId: booking.user,
                type: booking.type,
                amount: booking.totalAmount,
                paymentReference: event.data.reference,
                status: 'completed',
              });
            }

            // ✅ Notify user about successful payment via webhook
            await createNotification(io, booking.user, {
              type: 'payment',
              title: '✅ Payment Successful (Webhook)',
              message: `Payment of $${booking.totalAmount} for your ${booking.type} booking was successful.`,
              icon: 'CreditCard',
              color: 'text-green-500',
              bgColor: 'bg-green-500/10',
              actionUrl: `/bookings/${booking._id}`,
              actionLabel: 'View Booking',
              priority: 'high'
            });

            // ✅ Notify admins about payment
            io.to('admin-room').emit('admin-notification', {
              type: 'payment-success-webhook',
              bookingId: booking._id,
              amount: booking.totalAmount,
              userName: booking.customerName,
              userEmail: booking.customerEmail,
              message: `💰 Payment of $${booking.totalAmount} received from ${booking.customerName} (Webhook)`,
              timestamp: new Date()
            });
          }

          console.log('✅ Payment successful (webhook):', event.data.reference);
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

        // ✅ Notify user about payment failure
        if (failedBooking) {
          await createNotification(io, failedBooking.user, {
            type: 'payment',
            title: '❌ Payment Failed (Webhook)',
            message: `Your payment of $${failedBooking.totalAmount} for ${failedBooking.type} booking failed.`,
            icon: 'AlertCircle',
            color: 'text-red-500',
            bgColor: 'bg-red-500/10',
            actionUrl: `/bookings/${failedBooking._id}`,
            actionLabel: 'Retry Payment',
            priority: 'high'
          });

          io.to('admin-room').emit('admin-notification', {
            type: 'payment-failed-webhook',
            bookingId: failedBooking._id,
            amount: failedBooking.totalAmount,
            userName: failedBooking.customerName,
            message: `❌ Payment of $${failedBooking.totalAmount} failed for ${failedBooking.customerName} (Webhook)`,
            timestamp: new Date()
          });
        }

        console.log('❌ Payment failed (webhook):', event.data.reference);
        break;

      case 'charge.pending':
        const pendingBooking = await Booking.findOne({ paymentReference: event.data.reference });
        if (pendingBooking) {
          // ✅ Notify user about pending payment
          await createNotification(io, pendingBooking.user, {
            type: 'payment',
            title: '⏳ Payment Pending',
            message: `Your payment of $${pendingBooking.totalAmount} is pending confirmation.`,
            icon: 'Clock',
            color: 'text-yellow-500',
            bgColor: 'bg-yellow-500/10',
            actionUrl: `/bookings/${pendingBooking._id}`,
            actionLabel: 'Check Status',
            priority: 'medium'
          });
        }
        console.log('⏳ Payment pending:', event.data.reference);
        break;

      case 'charge.refunded':
        const refundedBooking = await Booking.findOne({ paymentReference: event.data.reference });
        if (refundedBooking) {
          // ✅ Notify user about refund
          await createNotification(io, refundedBooking.user, {
            type: 'payment',
            title: '💰 Payment Refunded',
            message: `Your payment of $${refundedBooking.totalAmount} has been refunded.`,
            icon: 'CreditCard',
            color: 'text-orange-500',
            bgColor: 'bg-orange-500/10',
            actionUrl: `/bookings/${refundedBooking._id}`,
            actionLabel: 'View Details',
            priority: 'high'
          });

          io.to('admin-room').emit('admin-notification', {
            type: 'payment-refunded',
            bookingId: refundedBooking._id,
            amount: refundedBooking.totalAmount,
            userName: refundedBooking.customerName,
            message: `💰 Payment of $${refundedBooking.totalAmount} refunded for ${refundedBooking.customerName}`,
            timestamp: new Date()
          });
        }
        console.log('💰 Payment refunded:', event.data.reference);
        break;

      case 'transfer.success':
        // Handle transfer success notifications
        io.to('admin-room').emit('admin-notification', {
          type: 'transfer-success',
          reference: event.data.reference,
          amount: event.data.amount / 100,
          recipient: event.data.recipient?.details?.account_name || 'Unknown',
          message: `💸 Transfer of $${event.data.amount / 100} was successful`,
          timestamp: new Date()
        });
        console.log('💸 Transfer successful:', event.data.reference);
        break;

      default:
        console.log('📝 Unhandled webhook event:', event.event);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get payment history for a user
// @route   GET /api/payments/history
router.get('/history', protect, async (req, res) => {
  try {
    const bookings = await Booking.find({
      user: req.user.id,
      paymentStatus: { $in: ['paid', 'failed'] }
    })
      .select('_id type tourTitle hotelName totalAmount paymentStatus paymentReference createdAt')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      payments: bookings
    });
  } catch (error) {
    console.error('❌ Get payment history error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch payment history'
    });
  }
});

// @desc    Get payment details by reference
// @route   GET /api/payments/details/:reference
router.get('/details/:reference', protect, async (req, res) => {
  try {
    const booking = await Booking.findOne({
      paymentReference: req.params.reference,
      user: req.user.id
    })
      .populate('user', 'name email avatar')
      .populate('tourId', 'title location price images')
      .populate('hotelId', 'name location price images');

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      payment: booking
    });
  } catch (error) {
    console.error('❌ Get payment details error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to fetch payment details'
    });
  }
});

export default router;
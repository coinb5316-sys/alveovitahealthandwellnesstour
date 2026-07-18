// backend/routes/paymentRoutes.js - COMPLETE FIXED
import express from 'express';
import paystack from '../config/paystack.js';
import { protect } from '../middleware/auth.js';
import Booking from '../models/Booking.js';
import Revenue from '../models/Revenue.js';
import User from '../models/User.js';
import { createNotification } from '../controllers/notificationController.js';

const router = express.Router();

// ============================================
// TEST ROUTE
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

// ============================================
// INITIATE PAYMENT (REDIRECT METHOD)
// ============================================
router.post('/initiate', protect, async (req, res) => {
  try {
    const { email, amount, tourTitle, hotelName, customerName, bookingData } = req.body;

    console.log('📝 Payment initiation request:', {
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

    // Check for existing pending booking
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

    // Update booking with reference
    await Booking.findByIdAndUpdate(booking._id, {
      paymentReference: reference,
    });

    // Build callback URL with reference and booking ID
    const frontendUrl = process.env.FRONTEND_URL || 'https://www.alveovitahealthandwellnesstour.com';
    const callbackUrl = `${frontendUrl}/payment-success?reference=${reference}&bookingId=${booking._id}`;
    
    console.log('🔗 Callback URL:', callbackUrl);

    // Initialize payment with Paystack
    const paystackPayload = {
      email: email || req.user.email,
      amount: Math.round(amount * 100),
      currency: 'GHS',
      reference: reference,
      callback_url: callbackUrl,
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
          {
            display_name: 'Type',
            variable_name: 'type',
            value: bookingData?.type || 'tour',
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

    res.json({
      success: true,
      authorization_url: response.data.authorization_url,
      reference: reference,
      bookingId: booking._id,
    });
  } catch (error) {
    console.error('❌ Payment initiation error:', error);
    
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

// ============================================
// REDIRECT PAYMENT INITIALIZE (LEGACY - KEPT FOR COMPATIBILITY)
// ============================================
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
      currency: 'GHS',
      reference: reference,
      callback_url: `${process.env.FRONTEND_URL || 'https://www.alveovitahealthandwellnesstour.com/'}/payment/verify`,
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
      amount: paystackPayload.amount / 100,
      currency: paystackPayload.currency
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

// ============================================
// VERIFY PAYMENT - FIXED
// ============================================
router.get('/verify/:reference', async (req, res) => {
  try {
    const io = req.app.get('io');
    console.log('🔍 Verifying payment:', req.params.reference);

    const response = await paystack.transaction.verify({
      reference: req.params.reference,
    });

    console.log('📤 Verification response:', {
      status: response.status,
      message: response.message,
      dataStatus: response.data?.status,
      currency: response.data?.currency
    });

    if (!response.status) {
      return res.status(400).json({
        success: false,
        message: response.message || 'Payment verification failed'
      });
    }

    if (response.data.status === 'success') {
      // Find and update the booking
      let booking = await Booking.findOne({ paymentReference: req.params.reference });
      
      if (!booking) {
        console.log('⚠️ Booking not found with paymentReference:', req.params.reference);
        return res.status(404).json({
          success: false,
          message: 'Booking not found for this reference'
        });
      }

      // Update booking status to confirmed
      booking.status = 'confirmed';
      booking.paymentStatus = 'paid';
      await booking.save();
      
      // Populate user data
      await booking.populate('user', 'name email');

      // Create revenue record
      const existingRevenue = await Revenue.findOne({ bookingId: booking._id });
      if (!existingRevenue) {
        await Revenue.create({
          bookingId: booking._id,
          userId: booking.user._id,
          type: booking.type,
          amount: booking.totalAmount,
          paymentReference: req.params.reference,
          status: 'completed',
        });
      }

      // Create payment success notification for user
      const itemName = booking.tourTitle || booking.hotelName || 'Alveovita';
      await createNotification(
        booking.user._id,
        'user',
        'success',
        `✅ Payment Successful: ${itemName}`,
        `Your payment of ₵${booking.totalAmount} for "${itemName}" has been confirmed.`,
        `/bookings/${booking._id}`,
        { bookingId: booking._id, amount: booking.totalAmount, action: 'payment_success' }
      );

      // Create notification for admins
      const admins = await User.find({ role: 'admin' });
      for (const admin of admins) {
        await createNotification(
          admin._id,
          'admin',
          'success',
          `💰 Payment Received: ₵${booking.totalAmount}`,
          `Payment of ₵${booking.totalAmount} received from ${booking.customerName} for "${itemName}".`,
          `/admin/payments`,
          { bookingId: booking._id, amount: booking.totalAmount, action: 'payment_received' }
        );
      }

      // Emit socket event for real-time updates
      if (io) {
        io.emit('payment-success', {
          bookingId: booking._id,
          userId: booking.user._id,
          amount: booking.totalAmount,
          type: booking.type,
          itemName: itemName,
          customerName: booking.customerName
        });
      }

      console.log('✅ Booking confirmed:', booking._id);

      // Return success response with booking data
      return res.json({
        success: true,
        message: 'Payment verified successfully',
        data: response.data,
        booking: {
          id: booking._id,
          type: booking.type,
          status: booking.status,
          totalAmount: booking.totalAmount,
          tourTitle: booking.tourTitle,
          hotelName: booking.hotelName,
          customerName: booking.customerName,
          customerEmail: booking.customerEmail,
          destination: booking.destination,
          date: booking.date,
          guests: booking.guests,
          nights: booking.nights,
          paymentReference: booking.paymentReference,
          paymentStatus: booking.paymentStatus
        }
      });
    } else {
      // Payment failed
      const booking = await Booking.findOneAndUpdate(
        { paymentReference: req.params.reference },
        { 
          status: 'cancelled',
          paymentStatus: 'failed'
        },
        { new: true }
      );

      if (booking) {
        // Create payment failure notification for user
        const itemName = booking.tourTitle || booking.hotelName || 'Alveovita';
        await createNotification(
          booking.user,
          'user',
          'error',
          `❌ Payment Failed: ${itemName}`,
          `Payment of ₵${booking.totalAmount} for "${itemName}" failed. Please try again.`,
          `/bookings/${booking._id}`,
          { bookingId: booking._id, amount: booking.totalAmount, action: 'payment_failed' }
        );
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

// ============================================
// WEBHOOK FOR PAYSTACK CALLBACKS
// ============================================
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
          existingBooking.status = 'confirmed';
          existingBooking.paymentStatus = 'paid';
          await existingBooking.save();
          
          // Create payment success notification from webhook
          const itemName = existingBooking.tourTitle || existingBooking.hotelName || 'Alveovita';
          await createNotification(
            existingBooking.user,
            'user',
            'success',
            `✅ Payment Successful: ${itemName}`,
            `Your payment of ₵${existingBooking.totalAmount} for "${itemName}" has been confirmed.`,
            `/bookings/${existingBooking._id}`,
            { bookingId: existingBooking._id, amount: existingBooking.totalAmount, action: 'payment_success' }
          );
          
          // Emit socket event
          if (io) {
            io.emit('payment-success', {
              bookingId: existingBooking._id,
              userId: existingBooking.user,
              amount: existingBooking.totalAmount,
              type: existingBooking.type,
              itemName: itemName
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
        
        if (failedBooking) {
          const itemName = failedBooking.tourTitle || failedBooking.hotelName || 'Alveovita';
          await createNotification(
            failedBooking.user,
            'user',
            'error',
            `❌ Payment Failed: ${itemName}`,
            `Payment of ₵${failedBooking.totalAmount} for "${itemName}" failed. Please try again.`,
            `/bookings/${failedBooking._id}`,
            { bookingId: failedBooking._id, amount: failedBooking.totalAmount, action: 'payment_failed' }
          );
        }
        console.log('❌ Payment failed (webhook):', event.data.reference);
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

export default router;
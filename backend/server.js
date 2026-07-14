// server.js - COMPLETE (Alveoly Pattern + All Original Configurations)
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import jwt from 'jsonwebtoken';

// Import configurations
import connectDB from './config/database.js';
import cloudinary from './config/cloudinary.js';
import paystack from './config/paystack.js';
import { sendEmail } from './config/email.js';

// Import models for Socket.IO
import User from './models/User.js';
import Notification from './models/Notification.js';

// ==================== IMPORT ROUTES ====================
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import adminProfileRoutes from './routes/adminProfileRoutes.js';
import tourRoutes from './routes/tourRoutes.js';
import hotelRoutes from './routes/hotelRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import destinationRoutes from './routes/destinationRoutes.js';
import revenueRoutes from './routes/revenueRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import experienceRoutes from './routes/experienceRoutes.js';
import contactRoutes from './routes/contactRoutes.js';
import autoReplyRoutes from './routes/autoReplyRoutes.js';
import chatSessionRoutes from './routes/chatSessionRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import searchRoutes from './routes/searchRoutes.js';

// ==================== SOCKET.IO IMPORTS ====================
import { setupSocketIO } from './routes/socketRoutes.js';

// Load environment variables
dotenv.config();

// Initialize express app
const app = express();
const server = createServer(app);

// ==================== CORS CONFIGURATION - FIXED FOR MOBILE ====================
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'https://6c78f0e0.alveovita-frontend.pages.dev',
  'https://alveovita-frontend.pages.dev',
  'https://alveovitahealthandwellnesstour.onrender.com',
  process.env.FRONTEND_URL
].filter(Boolean);

// ==================== SOCKET.IO SETUP WITH AUTHENTICATION ====================
// Changed from 'const io' to 'export const io' so it can be imported
export const io = new SocketServer(server, {
  cors: {
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin']
  },
  path: '/socket.io/',
  transports: ['websocket', 'polling'],
  pingTimeout: 60000,
  pingInterval: 25000,
  allowEIO3: true,
  cookie: {
    name: 'io',
    httpOnly: true,
    sameSite: 'lax'
  }
});

// ==================== SOCKET.IO AUTHENTICATION MIDDLEWARE ====================
io.use(async (socket, next) => {
  try {
    // Get token from multiple possible sources
    let token = socket.handshake.auth?.token ||
                socket.handshake.headers?.authorization?.split(' ')[1];

    // Also check query params for token (for mobile apps)
    if (!token && socket.handshake.query?.token) {
      token = socket.handshake.query.token;
    }

    if (!token) {
      console.log('🔴 Socket connection rejected: No token provided');
      const err = new Error('Authentication required');
      err.data = { type: 'auth_error', message: 'No token provided' };
      return next(err);
    }

    // Verify JWT token
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (jwtError) {
      console.log('🔴 Socket JWT verification failed:', jwtError.message);
      const err = new Error('Invalid token');
      err.data = { type: 'auth_error', message: 'Invalid token' };
      return next(err);
    }

    // Get user from database
    const user = await User.findById(decoded.id).select('id name email role avatar');

    if (!user) {
      console.log('🔴 Socket connection rejected: User not found');
      const err = new Error('User not found');
      err.data = { type: 'auth_error', message: 'User not found' };
      return next(err);
    }

    // Attach user to socket
    socket.userId = user.id;
    socket.user = user;
    socket.userData = user;

    console.log(`✅ Socket authenticated: ${user.name} (${user.id}) - Role: ${user.role}`);

    next();
  } catch (error) {
    console.log('🔴 Socket authentication error:', error.message);
    const err = new Error('Authentication failed');
    err.data = { type: 'auth_error', message: error.message };
    next(err);
  }
});

// ==================== SOCKET.IO CONNECTION HANDLER ====================
io.on('connection', (socket) => {
  console.log(`🟢 Socket connected: ${socket.id} - User: ${socket.userId}`);

  // If userId is not set but we have user data, set it
  if (!socket.userId && socket.user) {
    socket.userId = socket.user.id;
  }

  // ================= USER ROOM JOINING (ALVEOLY PATTERN) =================
  socket.on("join:user", (userId) => {
    if (!userId) return;
    socket.join(userId.toString());
    console.log(`👤 User ${userId} joined room: ${userId}`);
    socket.emit("joined:user", { userId, success: true });
  });

  socket.on("join:admin", () => {
    socket.join("admin");
    socket.join("admin_notifications");
    console.log("🛠️ Admin joined admin rooms");
    socket.emit("joined:admin", { success: true });
  });

  // ================= NOTIFICATION ROOMS (ALVEOLY PATTERN) =================
  socket.on("join:notifications", (userId) => {
    if (userId) {
      socket.join(`user_${userId}`);
      console.log(`📢 User ${userId} joined notification room`);
      socket.emit("joined:notifications", { success: true });
    }
  });

  socket.on("join:admin_notifications", () => {
    socket.join("admin_notifications");
    console.log("📢 Admin joined admin notification room");
    socket.emit("joined:admin_notifications", { success: true });
  });

  // ================= LEGACY SUPPORT (for existing frontend) =================
  socket.on('join-user-room', (userId) => {
    if (socket.userId === userId) {
      socket.join(`user-${userId}`);
      socket.join(userId.toString());
      console.log(`📌 User ${userId} manually joined their room`);

      // Send fresh unread count
      Notification.countDocuments({
        userId: userId,
        read: false
      })
      .then(count => {
        socket.emit('unread-count', { count });
      })
      .catch(err => {
        console.error('❌ Error getting unread count on join:', err);
      });
    } else {
      console.log(`⚠️ User ${socket.userId} tried to join room for ${userId} - Access denied`);
    }
  });

  // ================= GET UNREAD COUNT =================
  socket.on('get-unread-count', async () => {
    if (socket.userId) {
      try {
        const count = await Notification.countDocuments({
          userId: socket.userId,
          read: false
        });
        socket.emit('unread-count', { count });
        console.log(`📊 User ${socket.userId} unread count: ${count}`);
      } catch (error) {
        console.error('❌ Error getting unread count:', error);
        socket.emit('unread-count', { count: 0, error: true });
      }
    } else {
      console.warn('⚠️ get-unread-count called without userId');
      socket.emit('unread-count', { count: 0, error: true });
    }
  });

  // ================= GET ADMIN UNREAD COUNT =================
  socket.on('get-admin-unread-count', async () => {
    if (socket.user?.role === 'admin') {
      try {
        const count = await Notification.countDocuments({
          read: false
        });
        socket.emit('admin-unread-count', { count });
        console.log(`📊 Admin unread count: ${count}`);
      } catch (error) {
        console.error('❌ Error getting admin unread count:', error);
        socket.emit('admin-unread-count', { count: 0, error: true });
      }
    } else {
      console.warn('⚠️ get-admin-unread-count called without admin role');
      socket.emit('admin-unread-count', { count: 0, error: true });
    }
  });

  // ================= DISCONNECT =================
  socket.on('disconnect', () => {
    console.log(`🔴 Socket disconnected: ${socket.id} - User: ${socket.userId}`);
    if (socket.sessionId) {
      io.emit('user-disconnected', {
        sessionId: socket.sessionId,
        socketId: socket.id
      });
    }
  });

  socket.on('error', (error) => {
    console.error(`❌ Socket error for ${socket.id}:`, error);
  });
});

// ================= HELPER FUNCTIONS (ALVEOLY PATTERN) =================
// These are now exported so they can be imported by notificationController
export const emitNotification = (userId, notification) => {
  io.to(userId.toString()).emit("new_notification", notification);
  io.to(`user_${userId}`).emit("new_notification", notification);
};

export const emitAdminNotification = (notification) => {
  io.to("admin").emit("new_admin_notification", notification);
  io.to("admin_notifications").emit("new_admin_notification", notification);
};

export const emitToRoom = (room, event, data) => {
  io.to(room).emit(event, data);
};

export const emitToAll = (event, data) => {
  io.emit(event, data);
};

// Make io accessible to routes
app.set('io', io);

// ==================== MIDDLEWARE ====================
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: [
        "'self'",
        "https://*.onrender.com",
        "https://*.pages.dev",
        "https://api.paystack.co",
        "https://*.cloudinary.com"
      ],
      imgSrc: ["'self'", "data:", "https://*.cloudinary.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://js.paystack.co"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      frameSrc: ["'self'", "https://*.paystack.com"]
    }
  }
}));

// ==================== FIXED CORS FOR MOBILE ====================
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  } else {
    res.header('Access-Control-Allow-Origin', '*');
  }

  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, x-auth-token');
  res.header('Access-Control-Expose-Headers', 'Authorization, x-auth-token');

  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }

  next();
});

// Also use the cors middleware as a fallback
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS', 'HEAD'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'x-auth-token'],
  exposedHeaders: ['Authorization', 'x-auth-token']
}));

// Trust proxy for Render
app.set('trust proxy', 1);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Morgan logging with environment awareness
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ==================== REQUEST LOGGING FOR DEBUGGING ====================
app.use((req, res, next) => {
  console.log(`📱 ${req.method} ${req.originalUrl} - Origin: ${req.headers.origin || 'unknown'}`);
  next();
});

// ==================== API ROUTES ====================

// Auth routes - Register, Login, Google Auth, Refresh Token
app.use('/api/auth', authRoutes);

// User routes - Profile, Settings, etc.
app.use('/api/users', userRoutes);
app.use('/api/admin', adminProfileRoutes);

// Admin routes - Admin only
app.use('/api/admin', adminRoutes);

// Tour routes
app.use('/api/tours', tourRoutes);

// Hotel routes
app.use('/api/hotels', hotelRoutes);

// Booking routes
app.use('/api/bookings', bookingRoutes);

// Payment routes
app.use('/api/payments', paymentRoutes);

// Destination routes
app.use('/api/destinations', destinationRoutes);

app.use('/api/analytics', revenueRoutes);

app.use('/api', reviewRoutes);

app.use('/api/experiences', experienceRoutes);

// Contact routes
app.use('/api/contact', contactRoutes);

app.use('/api/auto-reply', autoReplyRoutes);

app.use('/api/chat-sessions', chatSessionRoutes);

app.use('/api/favorites', favoriteRoutes);

app.use('/api/notifications', notificationRoutes);

app.use('/api/search', searchRoutes);

// ==================== TEST ROUTES ====================

// Health check - Tests if server is running
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState;
  const dbStatusText = {
    0: 'Disconnected',
    1: 'Connected',
    2: 'Connecting',
    3: 'Disconnecting'
  };

  res.json({
    success: true,
    status: 'OK',
    message: 'TourVibe API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      server: '✅ Running',
      database: dbStatus === 1 ? '✅ Connected' : `⏳ ${dbStatusText[dbStatus] || 'Unknown'}`,
      cloudinary: '⏳ Pending',
      paystack: '⏳ Pending',
      email: '⏳ Pending',
      socket: '✅ Ready'
    }
  });
});

// Test MongoDB Connection
app.get('/api/test/database', async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      return res.json({
        success: true,
        message: '✅ MongoDB Already Connected',
        host: mongoose.connection.host,
        database: mongoose.connection.name,
        connectionState: mongoose.connection.readyState
      });
    }

    const conn = await connectDB();
    res.json({
      success: true,
      message: '✅ MongoDB Connected Successfully',
      host: conn.connection.host,
      database: conn.connection.name,
      connectionState: conn.connection.readyState
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '❌ MongoDB Connection Failed',
      error: error.message
    });
  }
});

// Test Cloudinary Connection
app.get('/api/test/cloudinary', async (req, res) => {
  try {
    const result = await cloudinary.api.ping();
    res.json({
      success: true,
      message: '✅ Cloudinary Connected Successfully',
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      status: result.status
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '❌ Cloudinary Connection Failed',
      error: error.message,
      hint: 'Check your CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in .env'
    });
  }
});

// Test Paystack Connection
app.get('/api/test/paystack', async (req, res) => {
  try {
    const banks = await paystack.bank.list();
    res.json({
      success: true,
      message: '✅ Paystack Connected Successfully',
      banksCount: banks.data?.length || 0,
      status: 'API Key is valid'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '❌ Paystack Connection Failed',
      error: error.message,
      hint: 'Check your PAYSTACK_SECRET_KEY in .env'
    });
  }
});

// Test Email Connection
app.post('/api/test/email', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address'
      });
    }

    const result = await sendEmail({
      to: email,
      subject: 'TourVibe Test Email 📧',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; padding: 20px 0;">
            <h1 style="color: #f59e0b;">✅ Test Email Successful!</h1>
          </div>
          <div style="background-color: white; padding: 30px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <p>Your TourVibe email configuration is working perfectly.</p>
            <p style="color: #6b7280; font-size: 14px;">
              Sent at: ${new Date().toLocaleString()}
            </p>
            <hr style="border: 1px solid #f3f4f6; margin: 20px 0;">
            <p style="color: #9ca3af; font-size: 12px;">
              TourVibe Backend Test
            </p>
          </div>
        </div>
      `
    });

    res.json({
      success: true,
      message: '✅ Test Email Sent Successfully',
      to: email,
      messageId: result.messageId
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: '❌ Email Sending Failed',
      error: error.message,
      hint: 'Check your EMAIL_USER and EMAIL_PASS in .env'
    });
  }
});

// Test Socket.IO
app.get('/api/test/socket', (req, res) => {
  res.json({
    success: true,
    message: '✅ Socket.IO Server Ready',
    socketPath: '/socket.io/',
    transports: ['websocket', 'polling'],
    activeConnections: io.sockets.sockets.size,
    authenticatedUsers: io.sockets.sockets.size
  });
});

// ==================== TEST NOTIFICATIONS ENDPOINT ====================
app.get('/api/test/notifications', async (req, res) => {
  try {
    const total = await Notification.countDocuments({ isDeleted: false });
    const unread = await Notification.countDocuments({ read: false, isDeleted: false });
    const sample = await Notification.findOne({ isDeleted: false })
      .populate('user', 'name email')
      .lean();

    res.json({
      success: true,
      stats: {
        total,
        unread,
        hasNotifications: total > 0
      },
      sample: sample || 'No notifications found',
      modelExists: true
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      modelExists: false
    });
  }
});

// ==================== TEST ALL SERVICES ====================
app.get('/api/test/all', async (req, res) => {
  const results = {
    server: { status: '✅ Running', timestamp: new Date().toISOString() },
    database: { status: '⏳ Testing...' },
    cloudinary: { status: '⏳ Testing...' },
    paystack: { status: '⏳ Testing...' },
    email: { status: '⏳ Testing...' },
    socket: { status: '✅ Ready', connections: io.sockets.sockets.size },
    notifications: { status: '⏳ Testing...' }
  };

  // Test Database
  try {
    if (mongoose.connection.readyState === 1) {
      results.database = {
        status: '✅ Already Connected',
        host: mongoose.connection.host,
        database: mongoose.connection.name
      };
    } else {
      const conn = await connectDB();
      results.database = {
        status: '✅ Connected',
        host: conn.connection.host,
        database: conn.connection.name
      };
    }
  } catch (error) {
    results.database = {
      status: '❌ Failed',
      error: error.message
    };
  }

  // Test Cloudinary
  try {
    await cloudinary.api.ping();
    results.cloudinary = {
      status: '✅ Connected',
      cloudName: process.env.CLOUDINARY_CLOUD_NAME
    };
  } catch (error) {
    results.cloudinary = {
      status: '❌ Failed',
      error: error.message
    };
  }

  // Test Paystack
  try {
    const paystackResult = await paystack.bank.list();
    results.paystack = {
      status: '✅ Connected',
      banksCount: paystackResult.data?.length || 0
    };
  } catch (error) {
    results.paystack = {
      status: '❌ Failed',
      error: error.message
    };
  }

  // Email
  results.email = {
    status: '✅ Configured',
    host: process.env.EMAIL_HOST,
    from: process.env.EMAIL_FROM
  };

  // Notifications
  try {
    const total = await Notification.countDocuments({ isDeleted: false });
    results.notifications = {
      status: '✅ Connected',
      total: total,
      modelExists: true
    };
  } catch (error) {
    results.notifications = {
      status: '❌ Failed',
      error: error.message,
      modelExists: false
    };
  }

  res.json({
    success: true,
    message: 'Service Test Results',
    services: results
  });
});

// ==================== SOCKET.IO STATUS ENDPOINT ====================
app.get('/api/socket-status', (req, res) => {
  const authUsers = new Set();
  io.sockets.sockets.forEach(socket => {
    if (socket.userId) {
      authUsers.add(socket.userId);
    }
  });

  res.json({
    success: true,
    status: 'Socket.IO Server Running',
    totalConnections: io.sockets.sockets.size,
    authenticatedUsers: authUsers.size,
    rooms: Array.from(io.sockets.adapter.rooms.keys()).length,
    uptime: process.uptime()
  });
});

// ==================== 404 HANDLER ====================
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// ==================== GLOBAL ERROR HANDLER ====================
app.use((err, req, res, next) => {
  console.error('❌ Global Error:', err);

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }

  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: 'Duplicate key error',
      field: Object.keys(err.keyPattern)[0]
    });
  }

  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// ==================== START SERVER ====================
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log('');
    console.log('🔄 Connecting to MongoDB...');
    await connectDB();
    console.log('✅ MongoDB connected successfully');

    server.listen(PORT, '0.0.0.0', () => {
      const environment = process.env.NODE_ENV || 'development';
      const baseUrl = environment === 'production'
        ? 'https://alveovitahealthandwellnesstour.onrender.com'
        : `http://localhost:${PORT}`;

      console.log('');
      console.log('🚀 =========================================');
      console.log('🚀 Alveovita Backend Server');
      console.log('🚀 =========================================');
      console.log(`📍 Server running on port: ${PORT}`);
      console.log(`🔗 API URL: ${baseUrl}/api`);
      console.log(`🌐 Environment: ${environment}`);
      console.log(`🔒 CORS: Allow all origins (mobile compatible)`);
      console.log(`🔐 Socket Auth: JWT token required`);
      console.log('🚀 =========================================');
      console.log('');
      console.log('📢 Notification System (Alveoly Pattern):');
      console.log('   - User rooms: userId, user_{userId}');
      console.log('   - Admin rooms: admin, admin_notifications');
      console.log('   - Events: new_notification, new_admin_notification');
      console.log('   - Helper: emitNotification(), emitAdminNotification()');
      console.log('');
      console.log('📡 Available Endpoints:');
      console.log(`  🏥 Health Check:       GET  ${baseUrl}/api/health`);
      console.log(`  🔐 Auth Register:     POST ${baseUrl}/api/auth/register`);
      console.log(`  🔐 Auth Login:        POST ${baseUrl}/api/auth/login`);
      console.log(`  🔐 Google Auth:       POST ${baseUrl}/api/auth/google`);
      console.log(`  🔐 Refresh Token:     POST ${baseUrl}/api/auth/refresh-token`);
      console.log(`  🔐 Verify Token:      GET  ${baseUrl}/api/auth/verify`);
      console.log(`  🔐 Logout:            POST ${baseUrl}/api/auth/logout`);
      console.log(`  🔔 Notifications:     GET  ${baseUrl}/api/notifications`);
      console.log(`  🔔 Notifications:     POST ${baseUrl}/api/notifications (admin)`);
      console.log(`  🔔 Admin Notif:       GET  ${baseUrl}/api/notifications/admin (admin)`);
      console.log('');
      console.log('📡 Test Endpoints:');
      console.log(`  🗄️  Database:        GET  ${baseUrl}/api/test/database`);
      console.log(`  ☁️  Cloudinary:      GET  ${baseUrl}/api/test/cloudinary`);
      console.log(`  💳  Paystack:        GET  ${baseUrl}/api/test/paystack`);
      console.log(`  📧  Email:           POST ${baseUrl}/api/test/email`);
      console.log(`  📡  Socket.IO:       GET  ${baseUrl}/api/test/socket`);
      console.log(`  🔔  Notifications:   GET  ${baseUrl}/api/test/notifications`);
      console.log(`  🔄  All Services:    GET  ${baseUrl}/api/test/all`);
      console.log(`  📡  Socket Status:   GET  ${baseUrl}/api/socket-status`);
      console.log('');
      console.log('📡 Socket.IO Events:');
      console.log(`  📤 join:user         - Join user room (Alveoly pattern)`);
      console.log(`  📤 join:admin        - Join admin room (Alveoly pattern)`);
      console.log(`  📤 join:notifications - Join notification room (Alveoly pattern)`);
      console.log(`  📤 join:admin_notifications - Join admin notification room (Alveoly pattern)`);
      console.log(`  📤 get-unread-count  - Get unread notification count`);
      console.log(`  📤 get-admin-unread-count - Get admin unread count`);
      console.log(`  📤 join-user-room    - Legacy user room join`);
      console.log(`  📥 new-notification  - Receive new notification`);
      console.log(`  📥 notification-read - Notification read`);
      console.log(`  📥 all-notifications-read - All read`);
      console.log(`  📥 notification-deleted - Notification deleted`);
      console.log(`  📥 unread-count      - Unread count update`);
      console.log(`  📥 admin-unread-count - Admin unread count`);
      console.log(`  📥 admin-notification - Admin notification`);
      console.log('');
      console.log('🚀 =========================================');
      console.log('✅ Server ready! Waiting for requests...');
      console.log('🚀 =========================================');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    console.error('Please check your .env file and database credentials');
    process.exit(1);
  }
};

// Start the server
startServer();

// ==================== GRACEFUL SHUTDOWN ====================
const shutdown = () => {
  console.log('');
  console.log('🛑 Shutting down gracefully...');

  io.close(() => {
    console.log('✅ Socket.IO closed');
  });

  server.close(() => {
    console.log('✅ Server closed');
    mongoose.connection.close(() => {
      console.log('✅ MongoDB connection closed');
      process.exit(0);
    });
  });

  setTimeout(() => {
    console.error('⚠️ Force closing...');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default app;
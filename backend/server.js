// server.js
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';

// Import configurations
import connectDB from './config/database.js';
import cloudinary from './config/cloudinary.js';
import paystack from './config/paystack.js';
import { sendEmail } from './config/email.js';

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

// ==================== SOCKET.IO SETUP ====================
const io = new SocketServer(server, {
  cors: {
    origin: function (origin, callback) {
      // Allow all origins for socket.io on mobile
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

// Setup Socket.IO with custom handlers
setupSocketIO(io);

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
  // Get the origin from the request
  const origin = req.headers.origin;
  
  // Allow all origins for API requests (this is safe for public APIs)
  // For production with sensitive data, you'd want to be more restrictive
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
    res.header('Access-Control-Allow-Credentials', 'true');
  } else {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    res.header('Access-Control-Allow-Origin', '*');
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, x-auth-token');
  res.header('Access-Control-Expose-Headers', 'Authorization, x-auth-token');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }
  
  next();
});

// Also use the cors middleware as a fallback
app.use(cors({
  origin: function (origin, callback) {
    // Allow all origins for now to fix mobile issues
    // You can restrict this later if needed
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
    activeConnections: io.sockets.sockets.size
  });
});

// ==================== TEST ALL SERVICES ====================
app.get('/api/test/all', async (req, res) => {
  const results = {
    server: { status: '✅ Running', timestamp: new Date().toISOString() },
    database: { status: '⏳ Testing...' },
    cloudinary: { status: '⏳ Testing...' },
    paystack: { status: '⏳ Testing...' },
    email: { status: '⏳ Testing...' },
    socket: { status: '✅ Ready', connections: io.sockets.sockets.size }
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

  res.json({
    success: true,
    message: 'Service Test Results',
    services: results
  });
});

// ==================== SOCKET.IO STATUS ENDPOINT ====================
app.get('/api/socket-status', (req, res) => {
  res.json({
    success: true,
    status: 'Socket.IO Server Running',
    connections: io.sockets.sockets.size,
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
  
  // Handle specific error types
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
      console.log('🚀 TourVibe Backend Server');
      console.log('🚀 =========================================');
      console.log(`📍 Server running on port: ${PORT}`);
      console.log(`🔗 API URL: ${baseUrl}/api`);
      console.log(`🌐 Environment: ${environment}`);
      console.log(`🔒 CORS: Allow all origins (mobile compatible)`);
      console.log('🚀 =========================================');
      console.log('');
      console.log('📡 Available Endpoints:');
      console.log(`  🏥 Health Check:       GET  ${baseUrl}/api/health`);
      console.log(`  🔐 Auth Register:     POST ${baseUrl}/api/auth/register`);
      console.log(`  🔐 Auth Login:        POST ${baseUrl}/api/auth/login`);
      console.log(`  🔐 Google Auth:       POST ${baseUrl}/api/auth/google`);
      console.log(`  🔐 Refresh Token:     POST ${baseUrl}/api/auth/refresh-token`);
      console.log(`  🔐 Verify Token:      GET  ${baseUrl}/api/auth/verify`);
      console.log(`  🔐 Logout:            POST ${baseUrl}/api/auth/logout`);
      console.log('');
      console.log('📡 Test Endpoints:');
      console.log(`  🗄️  Database:        GET  ${baseUrl}/api/test/database`);
      console.log(`  ☁️  Cloudinary:      GET  ${baseUrl}/api/test/cloudinary`);
      console.log(`  💳  Paystack:        GET  ${baseUrl}/api/test/paystack`);
      console.log(`  📧  Email:           POST ${baseUrl}/api/test/email`);
      console.log(`  📡  Socket.IO:       GET  ${baseUrl}/api/test/socket`);
      console.log(`  🔄  All Services:    GET  ${baseUrl}/api/test/all`);
      console.log(`  📡  Socket Status:   GET  ${baseUrl}/api/socket-status`);
      console.log('');
      console.log('📡 Socket.IO Events:');
      console.log(`  📤 join-chat         - Join a chat room`);
      console.log(`  📤 send-message      - Send a message`);
      console.log(`  📤 admin-message     - Send admin message`);
      console.log(`  📤 typing            - Typing indicator`);
      console.log(`  📤 resolve-session   - Resolve chat session`);
      console.log(`  📥 new-message       - Receive new message`);
      console.log(`  📥 user-typing       - Receive typing indicator`);
      console.log(`  📥 chat-joined       - Chat joined confirmation`);
      console.log(`  📥 session-resolved  - Session resolved`);
      console.log(`  📥 admin-notification- Admin notification`);
      console.log(`  📥 chat-error        - Error message`);
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

// Graceful shutdown
const shutdown = () => {
  console.log('');
  console.log('🛑 Shutting down gracefully...');
  
  // Close socket connections
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

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('⚠️ Force closing...');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default app;
import User from '../models/User.js';
import { generateToken, generateRefreshToken } from '../utils/generateToken.js';
import { OAuth2Client } from 'google-auth-library';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { createNotification } from '../utils/notificationHelper.js';

dotenv.config();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register - Manual password hashing
export const register = async (req, res) => {
  try {
    const { name, email, password, phone, location } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email and password are required'
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      location
    });

    await user.save();

    const io = req.app.get('io');

    // ✅ Send welcome notification to user
    await createNotification(io, user._id, {
      type: 'welcome',
      title: '🎉 Welcome to Alveovita!',
      message: `Thank you for joining us, ${name}! Start exploring wellness tours and destinations.`,
      icon: 'Award',
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      actionUrl: '/dashboard',
      actionLabel: 'Go to Dashboard',
      priority: 'high'
    });

    // ✅ Notify admins about new user
    if (io) {
      io.to('admin-room').emit('admin-notification', {
        type: 'new-user',
        userId: user._id,
        userName: user.name,
        userEmail: user.email,
        message: `🆕 New user registered: ${user.name} (${user.email})`,
        timestamp: new Date()
      });
    }

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    await user.save();

    res.status(201).json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// Login - Add login notification
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    if (!user.password) {
      return res.status(401).json({
        success: false,
        message: 'This account uses Google login. Please sign in with Google.'
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    user.lastLogin = new Date();
    await user.save();

    // ✅ Notify about login from new device
    const io = req.app.get('io');
    await createNotification(io, user._id, {
      type: 'security',
      title: '🔐 New Login Detected',
      message: `You logged in from ${req.headers['user-agent']?.substring(0, 50) || 'a new device'}`,
      icon: 'Shield',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      actionUrl: '/security',
      actionLabel: 'Review Activity',
      priority: 'medium'
    });

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    await user.save();

    res.json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Google Login
export const googleLogin = async (req, res) => {
  try {
    const { credential } = req.body;

    if (!credential) {
      return res.status(400).json({
        success: false,
        message: 'Google credential is required'
      });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email not provided by Google'
      });
    }

    let user = await User.findOne({ email });

    const io = req.app.get('io');

    if (!user) {
      user = new User({
        name: name || email.split('@')[0],
        email,
        googleId,
        avatar: picture || '',
        emailVerified: true,
      });
      await user.save();

      // ✅ Welcome notification for Google signup
      await createNotification(io, user._id, {
        type: 'welcome',
        title: '🎉 Welcome to Alveovita!',
        message: `Thank you for joining us, ${user.name}! Start exploring wellness tours.`,
        icon: 'Award',
        color: 'text-amber-500',
        bgColor: 'bg-amber-500/10',
        actionUrl: '/dashboard',
        actionLabel: 'Go to Dashboard',
        priority: 'high'
      });

      if (io) {
        io.to('admin-room').emit('admin-notification', {
          type: 'new-user',
          userId: user._id,
          userName: user.name,
          userEmail: user.email,
          message: `🆕 New Google user registered: ${user.name} (${user.email})`,
          timestamp: new Date()
        });
      }
    } else if (!user.googleId) {
      user.googleId = googleId;
      user.avatar = user.avatar || picture || '';
      await user.save();
    }

    user.lastLogin = new Date();
    await user.save();

    // ✅ Notify about Google login
    await createNotification(io, user._id, {
      type: 'security',
      title: '🔐 Google Login',
      message: 'You signed in with Google successfully.',
      icon: 'Shield',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      actionUrl: '/security',
      actionLabel: 'View Activity',
      priority: 'low'
    });

    const token = generateToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    user.refreshTokens.push({
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    await user.save();

    res.json({
      success: true,
      token,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        location: user.location
      }
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Google authentication failed'
    });
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No user found with this email address'
      });
    }

    if (user.googleId && !user.password) {
      return res.status(400).json({
        success: false,
        message: 'This account uses Google login. Please sign in with Google.'
      });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000;

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(resetTokenExpiry);
    await user.save();

    // ✅ Notify about password reset request
    const io = req.app.get('io');
    await createNotification(io, user._id, {
      type: 'security',
      title: '🔐 Password Reset Requested',
      message: 'A password reset was requested for your account.',
      icon: 'Key',
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
      actionUrl: '/reset-password',
      actionLabel: 'Reset Password',
      priority: 'high'
    });

    const { sendPasswordResetEmail } = await import('../config/email.js');
    const result = await sendPasswordResetEmail(user, resetToken);

    res.json({
      success: true,
      message: result.messageId 
        ? 'Password reset link sent to your email' 
        : 'Password reset link generated. Please check your console for the link.',
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and password are required'
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // ✅ Notify about successful password reset
    const io = req.app.get('io');
    await createNotification(io, user._id, {
      type: 'security',
      title: '✅ Password Reset Successful',
      message: 'Your password has been changed successfully.',
      icon: 'CheckCircle',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      actionUrl: '/login',
      actionLabel: 'Login Now',
      priority: 'high'
    });

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// Refresh Token
export const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    const user = await User.findOne({
      'refreshTokens.token': refreshToken,
      'refreshTokens.expiresAt': { $gt: new Date() }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token'
      });
    }

    const newToken = generateToken(user._id);
    const newRefreshToken = generateRefreshToken(user._id);

    user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== refreshToken);
    user.refreshTokens.push({
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
    await user.save();

    res.json({
      success: true,
      token: newToken,
      refreshToken: newRefreshToken
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Verify Token
export const verifyToken = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -refreshTokens');
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        location: user.location,
        avatar: user.avatar
      }
    });
  } catch (error) {
    console.error('Verify token error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// Logout
export const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await User.updateOne(
        { _id: req.user.id },
        { $pull: { refreshTokens: { token: refreshToken } } }
      );
    }

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
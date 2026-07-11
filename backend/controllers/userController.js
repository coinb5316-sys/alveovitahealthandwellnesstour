import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';
import bcrypt from 'bcryptjs';
import { createNotification } from '../utils/notificationHelper.js';

// @desc    Get user profile
// @route   GET /api/users/profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -refreshTokens');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, location, bio, preferences, notifications } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const oldName = user.name;
    const oldLocation = user.location;

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (location) user.location = location;
    if (bio) user.bio = bio;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };
    if (notifications) user.notifications = { ...user.notifications, ...notifications };

    await user.save();

    const io = req.app.get('io');

    // ✅ Notify about profile update
    if (name && oldName !== name) {
      await createNotification(io, user._id, {
        type: 'profile',
        title: '👤 Profile Updated',
        message: `Your profile name has been updated to "${name}".`,
        icon: 'User',
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        actionUrl: '/profile',
        actionLabel: 'View Profile',
        priority: 'low'
      });
    }

    if (location && oldLocation !== location) {
      await createNotification(io, user._id, {
        type: 'profile',
        title: '📍 Location Updated',
        message: `Your location has been updated to "${location}".`,
        icon: 'MapPin',
        color: 'text-blue-500',
        bgColor: 'bg-blue-500/10',
        actionUrl: '/profile',
        actionLabel: 'View Profile',
        priority: 'low'
      });
    }

    const updatedUser = await User.findById(req.user.id).select('-password -refreshTokens');

    res.json({
      success: true,
      user: updatedUser,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Upload profile avatar
// @route   POST /api/users/avatar
export const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user.avatar && user.avatar.includes('cloudinary')) {
      try {
        const publicId = user.avatar.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`tourvibe/avatars/${publicId}`);
      } catch (error) {
        console.log('Error deleting old avatar:', error);
      }
    }

    user.avatar = req.file.path;
    await user.save();

    const io = req.app.get('io');

    // ✅ Notify about avatar update
    await createNotification(io, user._id, {
      type: 'profile',
      title: '📸 Avatar Updated',
      message: 'Your profile picture has been updated successfully.',
      icon: 'Image',
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
      actionUrl: '/profile',
      actionLabel: 'View Profile',
      priority: 'low'
    });

    const updatedUser = await User.findById(req.user.id).select('-password -refreshTokens');

    res.json({
      success: true,
      avatar: user.avatar,
      user: updatedUser,
      message: 'Avatar uploaded successfully'
    });
  } catch (error) {
    console.error('Upload avatar error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Change password
// @route   POST /api/users/change-password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters'
      });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.password) {
      return res.status(400).json({
        success: false,
        message: 'This account uses Google login. Password change not available.'
      });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    await user.save();

    const io = req.app.get('io');

    // ✅ Notify about password change
    await createNotification(io, user._id, {
      type: 'security',
      title: '🔑 Password Changed',
      message: 'Your password was changed successfully.',
      icon: 'Key',
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
      actionUrl: '/security',
      actionLabel: 'View Activity',
      priority: 'high'
    });

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get user stats
// @route   GET /api/users/stats
export const getUserStats = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      stats: user.stats || {
        totalBookings: 0,
        totalSpent: 0,
        loyaltyPoints: 0,
        membershipTier: 'Bronze',
        favorites: 0,
        reviews: 0
      }
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};
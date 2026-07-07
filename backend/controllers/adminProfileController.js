// backend/controllers/adminProfileController.js
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';
import bcrypt from 'bcryptjs';

// @desc    Get admin profile
// @route   GET /api/admin/profile
export const getAdminProfile = async (req, res) => {
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
    console.error('Get admin profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Update admin profile
// @route   PUT /api/admin/profile
export const updateAdminProfile = async (req, res) => {
  try {
    const { name, phone, location, bio, department, role, preferences, notifications } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (location) user.location = location;
    if (bio) user.bio = bio;
    if (department) user.department = department;
    if (role) user.role = role;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };
    if (notifications) user.notifications = { ...user.notifications, ...notifications };

    await user.save();

    const updatedUser = await User.findById(req.user.id).select('-password -refreshTokens');

    res.json({
      success: true,
      user: updatedUser,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update admin profile error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// backend/controllers/adminProfileController.js - Updated uploadAdminAvatar

// @desc    Upload admin avatar
// @route   POST /api/admin/avatar
export const uploadAdminAvatar = async (req, res) => {
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

    // Delete old avatar from Cloudinary if exists
    if (user.avatar && user.avatar.includes('cloudinary')) {
      try {
        const publicId = user.avatar.split('/').pop().split('.')[0];
        await cloudinary.uploader.destroy(`tourvibe/admin/avatars/${publicId}`);
      } catch (error) {
        console.log('Error deleting old avatar:', error);
      }
    }

    user.avatar = req.file.path;
    await user.save();

    const updatedUser = await User.findById(req.user.id).select('-password -refreshTokens');

    res.json({
      success: true,
      avatar: user.avatar,
      user: updatedUser,
      message: 'Avatar uploaded successfully'
    });
  } catch (error) {
    console.error('Upload admin avatar error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Change admin password
// @route   POST /api/admin/change-password
export const changeAdminPassword = async (req, res) => {
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

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    console.error('Change admin password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};
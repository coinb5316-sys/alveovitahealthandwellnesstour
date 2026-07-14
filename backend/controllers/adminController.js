// controllers/adminController.js - COMPLETE with Alveoly Notification Pattern
import User from '../models/User.js';
import { createNotification } from './notificationController.js';

// @desc    Get all users (Admin only)
// @route   GET /api/admin/users
export const getUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', role = '', status = '' } = req.query;
    
    // Build query
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }
    if (role && role !== 'all') {
      query.role = role;
    }
    if (status && status !== 'all') {
      query.status = status;
    }

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    const users = await User.find(query)
      .select('-password -refreshTokens')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(total / limitNum),
        totalItems: total,
        itemsPerPage: limitNum
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get single user (Admin only)
// @route   GET /api/admin/users/:id
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -refreshTokens');
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
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Update user (Admin only)
// @route   PUT /api/admin/users/:id
export const updateUser = async (req, res) => {
  try {
    const { name, email, role, phone, location, bio, status } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;
    if (phone) user.phone = phone;
    if (location) user.location = location;
    if (bio) user.bio = bio;
    if (status) user.status = status;

    await user.save();

    const updatedUser = await User.findById(req.params.id).select('-password -refreshTokens');

    // Create notification for user
    await createNotification(
      user._id,
      user.role,
      "info",
      "👤 Profile Updated by Admin",
      `Your profile has been updated by an administrator.`,
      "/profile",
      { action: "admin_profile_update", adminId: req.user.id }
    );

    // Create notification for admin
    await createNotification(
      req.user.id,
      "admin",
      "success",
      `✅ User Updated: ${user.name}`,
      `You successfully updated ${user.name}'s profile.`,
      `/admin/users/${user._id}`,
      { action: "user_updated", userId: user._id }
    );

    res.json({
      success: true,
      user: updatedUser,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Delete user (Admin only)
// @route   DELETE /api/admin/users/:id
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting the last admin
    if (user.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete the last admin user'
        });
      }
    }

    const deletedUserName = user.name;
    const deletedUserId = user._id;

    await User.findByIdAndDelete(req.params.id);

    // Create notification for admin
    await createNotification(
      req.user.id,
      "admin",
      "warning",
      `🗑️ User Deleted: ${deletedUserName}`,
      `You successfully deleted ${deletedUserName}'s account.`,
      `/admin/users`,
      { action: "user_deleted", userId: deletedUserId }
    );

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Update user role (Admin only)
// @route   PATCH /api/admin/users/:id/role
export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;

    if (!role || !['user', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid role. Must be user or admin'
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent changing last admin's role
    if (user.role === 'admin' && role !== 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot change the last admin user\'s role'
        });
      }
    }

    const oldRole = user.role;
    user.role = role;
    await user.save();

    const updatedUser = await User.findById(req.params.id).select('-password -refreshTokens');

    // Create notification for user
    await createNotification(
      user._id,
      user.role,
      "info",
      "🔄 Role Updated",
      `Your account role has been changed from ${oldRole} to ${role}.`,
      "/profile",
      { action: "role_change", oldRole, newRole: role }
    );

    // Create notification for admin
    await createNotification(
      req.user.id,
      "admin",
      "success",
      `✅ Role Changed: ${user.name}`,
      `You changed ${user.name}'s role from ${oldRole} to ${role}.`,
      `/admin/users/${user._id}`,
      { action: "role_changed", userId: user._id, oldRole, newRole: role }
    );

    res.json({
      success: true,
      user: updatedUser,
      message: 'User role updated successfully'
    });
  } catch (error) {
    console.error('Update role error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Update user status (Admin only)
// @route   PATCH /api/admin/users/:id/status
export const updateUserStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be active, inactive, or suspended'
      });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deactivating last admin
    if (user.role === 'admin' && status !== 'active') {
      const adminCount = await User.countDocuments({ role: 'admin' });
      if (adminCount <= 1) {
        return res.status(400).json({
          success: false,
          message: 'Cannot deactivate the last admin user'
        });
      }
    }

    const oldStatus = user.status || 'active';
    user.status = status;
    await user.save();

    const updatedUser = await User.findById(req.params.id).select('-password -refreshTokens');

    // Create notification for user
    await createNotification(
      user._id,
      user.role,
      status === 'active' ? "success" : "warning",
      `📊 Account ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      `Your account has been ${status} by an administrator.`,
      "/profile",
      { action: "status_change", oldStatus, newStatus: status }
    );

    // Create notification for admin
    await createNotification(
      req.user.id,
      "admin",
      "info",
      `✅ Status Changed: ${user.name}`,
      `You changed ${user.name}'s status from ${oldStatus} to ${status}.`,
      `/admin/users/${user._id}`,
      { action: "status_changed", userId: user._id, oldStatus, newStatus: status }
    );

    res.json({
      success: true,
      user: updatedUser,
      message: `User ${status === 'active' ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Update status error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error'
    });
  }
};

// @desc    Get user statistics (Admin only)
// @route   GET /api/admin/users/stats
export const getUserStats = async (req, res) => {
  try {
    const total = await User.countDocuments();
    const active = await User.countDocuments({ status: 'active' });
    const inactive = await User.countDocuments({ status: { $in: ['inactive', 'suspended'] } });
    const admins = await User.countDocuments({ role: 'admin' });
    const users = await User.countDocuments({ role: 'user' });
    
    // New users in last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newUsers = await User.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    res.json({
      success: true,
      stats: {
        total,
        active,
        inactive,
        admins,
        users,
        newUsers
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
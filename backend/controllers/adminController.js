// backend/controllers/adminController.js
import User from '../models/User.js';
import bcrypt from 'bcryptjs';

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
    const io = req.app.get('io');

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

    // Emit user update notification
    if (io) {
      io.emit('user-updated', {
        userId: user._id,
        userName: user.name,
        userEmail: user.email,
        role: user.role,
        status: user.status,
        updatedBy: req.user.id,
        timestamp: new Date()
      });

      // Also emit to admin room
      io.to('admin-room').emit('admin-notification', {
        type: 'user-updated',
        userId: user._id,
        userName: user.name,
        message: `${user.name} was updated by ${req.user.name}`,
        timestamp: new Date()
      });
    }

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

    const io = req.app.get('io');
    const deletedUserName = user.name;

    await User.findByIdAndDelete(req.params.id);

    // Emit user deletion notification
    if (io) {
      io.emit('user-deleted', {
        userId: req.params.id,
        userName: deletedUserName,
        deletedBy: req.user.id,
        timestamp: new Date()
      });

      io.to('admin-room').emit('admin-notification', {
        type: 'user-deleted',
        userName: deletedUserName,
        message: `${deletedUserName} was deleted by ${req.user.name}`,
        timestamp: new Date()
      });
    }

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
    const io = req.app.get('io');

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

    // Emit role change notification
    if (io) {
      io.emit('user-role-changed', {
        userId: user._id,
        userName: user.name,
        oldRole: oldRole,
        newRole: role,
        updatedBy: req.user.id,
        timestamp: new Date()
      });

      io.to('admin-room').emit('admin-notification', {
        type: 'user-role-changed',
        userId: user._id,
        userName: user.name,
        message: `${user.name}'s role changed from ${oldRole} to ${role} by ${req.user.name}`,
        timestamp: new Date()
      });
    }

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
    const io = req.app.get('io');

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

    const oldStatus = user.status;
    user.status = status;
    await user.save();

    const updatedUser = await User.findById(req.params.id).select('-password -refreshTokens');

    // Emit status change notification
    if (io) {
      io.emit('user-status-changed', {
        userId: user._id,
        userName: user.name,
        oldStatus: oldStatus,
        newStatus: status,
        updatedBy: req.user.id,
        timestamp: new Date()
      });

      io.to('admin-room').emit('admin-notification', {
        type: 'user-status-changed',
        userId: user._id,
        userName: user.name,
        message: `${user.name}'s status changed from ${oldStatus} to ${status} by ${req.user.name}`,
        timestamp: new Date()
      });
    }

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
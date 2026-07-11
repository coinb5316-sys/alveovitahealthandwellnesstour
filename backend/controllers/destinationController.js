import Destination from '../models/Destination.js';
import { notifyAllUsers, createNotification } from '../utils/notificationHelper.js';

// @desc    Get all destinations
// @route   GET /api/destinations
export const getDestinations = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, region, category, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const query = {};
    if (search) {
      query.$text = { $search: search };
    }
    if (region && region !== 'all') query.region = region;
    if (category && category !== 'all') query.category = category;
    if (status && status !== 'all') query.status = status;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const destinations = await Destination.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Destination.countDocuments(query);

    res.json({
      success: true,
      destinations,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get destinations error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single destination
// @route   GET /api/destinations/:id
export const getDestinationById = async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination not found' });
    }
    res.json({ success: true, destination });
  } catch (error) {
    console.error('Get destination error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create destination
// @route   POST /api/destinations
export const createDestination = async (req, res) => {
  try {
    const io = req.app.get('io');
    
    const destinationData = {
      ...req.body,
      createdBy: req.user.id,
    };
    const destination = await Destination.create(destinationData);

    // ✅ Notify all users about new destination
    await notifyAllUsers(io, {
      type: 'destination',
      title: `📍 New Destination: ${destination.name}`,
      message: `Explore "${destination.name}" in ${destination.region}. Start planning your visit!`,
      icon: 'MapPin',
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
      actionUrl: `/destinations/${destination._id}`,
      actionLabel: 'View Destination',
      priority: 'medium'
    });

    if (io) {
      io.to('admin-room').emit('admin-notification', {
        type: 'destination-created',
        destinationId: destination._id,
        message: `📍 New destination "${destination.name}" created by ${req.user.name}`,
        timestamp: new Date()
      });
    }

    res.status(201).json({ success: true, destination });
  } catch (error) {
    console.error('Create destination error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update destination
// @route   PUT /api/destinations/:id
export const updateDestination = async (req, res) => {
  try {
    const io = req.app.get('io');
    
    const destination = await Destination.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination not found' });
    }

    // ✅ Notify about destination update
    await notifyAllUsers(io, {
      type: 'destination',
      title: `📝 Destination Updated: ${destination.name}`,
      message: `"${destination.name}" has been updated. Check out the new details!`,
      icon: 'Edit',
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
      actionUrl: `/destinations/${destination._id}`,
      actionLabel: 'View Updates',
      priority: 'medium'
    });

    if (io) {
      io.to('admin-room').emit('admin-notification', {
        type: 'destination-updated',
        destinationId: destination._id,
        message: `📝 Destination "${destination.name}" updated by ${req.user.name}`,
        timestamp: new Date()
      });
    }

    res.json({ success: true, destination });
  } catch (error) {
    console.error('Update destination error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete destination
// @route   DELETE /api/destinations/:id
export const deleteDestination = async (req, res) => {
  try {
    const io = req.app.get('io');
    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination not found' });
    }

    const destinationName = destination.name;
    await Destination.findByIdAndDelete(req.params.id);

    if (io) {
      io.emit('destination-deleted', {
        destinationId: req.params.id,
        name: destinationName,
        deletedBy: req.user.name,
        timestamp: new Date()
      });

      io.to('admin-room').emit('admin-notification', {
        type: 'destination-deleted',
        destinationId: req.params.id,
        message: `🗑️ Destination "${destinationName}" deleted by ${req.user.name}`,
        timestamp: new Date()
      });
    }

    res.json({ success: true, message: 'Destination deleted successfully' });
  } catch (error) {
    console.error('Delete destination error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// controllers/destinationController.js - Alveoly Pattern (COMPLETE)
import Destination from '../models/Destination.js';
import User from '../models/User.js';
import { createNotification } from './notificationController.js';

// ================= GET ALL DESTINATIONS =================
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

// ================= GET SINGLE DESTINATION =================
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

// ================= CREATE DESTINATION =================
export const createDestination = async (req, res) => {
  try {
    const destinationData = {
      ...req.body,
      createdBy: req.user.id,
    };
    const destination = await Destination.create(destinationData);

    // Notify admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await createNotification(
        admin._id,
        'admin',
        'success',
        `📍 New Destination Created: ${destination.name}`,
        `Destination "${destination.name}" has been created in ${destination.region}.`,
        `/admin/destinations/${destination._id}`,
        { destinationId: destination._id, action: 'destination_created' }
      );
    }

    // Notify all users
    const users = await User.find({ role: 'user' });
    for (const user of users) {
      await createNotification(
        user._id,
        'user',
        'info',
        `📍 New Destination: ${destination.name}`,
        `Explore "${destination.name}" in ${destination.region}. Plan your visit!`,
        `/destinations/${destination._id}`,
        { destinationId: destination._id, action: 'new_destination' }
      );
    }

    res.status(201).json({ success: true, destination });
  } catch (error) {
    console.error('Create destination error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= UPDATE DESTINATION =================
export const updateDestination = async (req, res) => {
  try {
    const destination = await Destination.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination not found' });
    }

    // Notify admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await createNotification(
        admin._id,
        'admin',
        'info',
        `✏️ Destination Updated: ${destination.name}`,
        `Destination "${destination.name}" has been updated.`,
        `/admin/destinations/${destination._id}`,
        { destinationId: destination._id, action: 'destination_updated' }
      );
    }

    res.json({ success: true, destination });
  } catch (error) {
    console.error('Update destination error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= DELETE DESTINATION =================
export const deleteDestination = async (req, res) => {
  try {
    const destination = await Destination.findById(req.params.id);
    if (!destination) {
      return res.status(404).json({ success: false, message: 'Destination not found' });
    }

    const destinationName = destination.name;
    await Destination.findByIdAndDelete(req.params.id);

    // Notify admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await createNotification(
        admin._id,
        'admin',
        'warning',
        `🗑️ Destination Deleted: ${destinationName}`,
        `Destination "${destinationName}" has been deleted.`,
        `/admin/destinations`,
        { destinationId: req.params.id, action: 'destination_deleted' }
      );
    }

    res.json({ success: true, message: 'Destination deleted successfully' });
  } catch (error) {
    console.error('Delete destination error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
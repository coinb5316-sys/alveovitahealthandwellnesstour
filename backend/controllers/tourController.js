// controllers/tourController.js - Alveoly Pattern (COMPLETE)
import Tour from '../models/Tour.js';
import User from '../models/User.js';
import { createNotification } from './notificationController.js';

// ================= GET ALL TOURS =================
export const getTours = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, region, type, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const query = {};
    if (search) {
      query.$text = { $search: search };
    }
    if (region && region !== 'all') query.region = region;
    if (type && type !== 'all') query.type = type;
    if (status && status !== 'all') query.status = status;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const tours = await Tour.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Tour.countDocuments(query);

    res.json({
      success: true,
      tours,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get tours error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= GET SINGLE TOUR =================
export const getTourById = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      return res.status(404).json({ success: false, message: 'Tour not found' });
    }
    res.json({ success: true, tour });
  } catch (error) {
    console.error('Get tour error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= CREATE TOUR =================
export const createTour = async (req, res) => {
  try {
    const tourData = {
      ...req.body,
      createdBy: req.user.id,
    };
    const tour = await Tour.create(tourData);

    // Notify admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await createNotification(
        admin._id,
        'admin',
        'success',
        `📌 New Tour Created: ${tour.title}`,
        `Tour "${tour.title}" has been created in ${tour.region}.`,
        `/admin/tours/${tour._id}`,
        { tourId: tour._id, action: 'tour_created' }
      );
    }

    // Notify all users (bulk notification)
    const users = await User.find({ role: 'user' });
    for (const user of users) {
      await createNotification(
        user._id,
        'user',
        'info',
        `🌍 New Tour Available: ${tour.title}`,
        `Explore "${tour.title}" in ${tour.region}. Book now!`,
        `/tours/${tour._id}`,
        { tourId: tour._id, action: 'new_tour' }
      );
    }

    res.status(201).json({ success: true, tour });
  } catch (error) {
    console.error('Create tour error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= UPDATE TOUR =================
export const updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!tour) {
      return res.status(404).json({ success: false, message: 'Tour not found' });
    }

    // Notify admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await createNotification(
        admin._id,
        'admin',
        'info',
        `✏️ Tour Updated: ${tour.title}`,
        `Tour "${tour.title}" has been updated.`,
        `/admin/tours/${tour._id}`,
        { tourId: tour._id, action: 'tour_updated' }
      );
    }

    res.json({ success: true, tour });
  } catch (error) {
    console.error('Update tour error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= DELETE TOUR =================
export const deleteTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      return res.status(404).json({ success: false, message: 'Tour not found' });
    }

    const tourTitle = tour.title;
    await Tour.findByIdAndDelete(req.params.id);

    // Notify admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await createNotification(
        admin._id,
        'admin',
        'warning',
        `🗑️ Tour Deleted: ${tourTitle}`,
        `Tour "${tourTitle}" has been deleted.`,
        `/admin/tours`,
        { tourId: req.params.id, action: 'tour_deleted' }
      );
    }

    res.json({ success: true, message: 'Tour deleted successfully' });
  } catch (error) {
    console.error('Delete tour error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
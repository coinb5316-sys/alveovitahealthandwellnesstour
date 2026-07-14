// controllers/hotelController.js - Alveoly Pattern (COMPLETE)
import Hotel from '../models/Hotel.js';
import User from '../models/User.js';
import { createNotification } from './notificationController.js';

// ================= GET ALL HOTELS =================
export const getHotels = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, region, status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    const query = {};
    if (search) {
      query.$text = { $search: search };
    }
    if (region && region !== 'all') query.region = region;
    if (status && status !== 'all') query.status = status;

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const hotels = await Hotel.find(query)
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Hotel.countDocuments(query);

    res.json({
      success: true,
      hotels,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get hotels error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= GET SINGLE HOTEL =================
export const getHotelById = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }
    res.json({ success: true, hotel });
  } catch (error) {
    console.error('Get hotel error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= CREATE HOTEL =================
export const createHotel = async (req, res) => {
  try {
    const hotelData = {
      ...req.body,
      createdBy: req.user.id,
    };
    const hotel = await Hotel.create(hotelData);

    // Notify admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await createNotification(
        admin._id,
        'admin',
        'success',
        `🏨 New Hotel Created: ${hotel.name}`,
        `Hotel "${hotel.name}" has been created in ${hotel.region}.`,
        `/admin/hotels/${hotel._id}`,
        { hotelId: hotel._id, action: 'hotel_created' }
      );
    }

    // Notify all users
    const users = await User.find({ role: 'user' });
    for (const user of users) {
      await createNotification(
        user._id,
        'user',
        'info',
        `🏨 New Hotel Available: ${hotel.name}`,
        `Discover "${hotel.name}" in ${hotel.region}. Book your stay now!`,
        `/hotels/${hotel._id}`,
        { hotelId: hotel._id, action: 'new_hotel' }
      );
    }

    res.status(201).json({ success: true, hotel });
  } catch (error) {
    console.error('Create hotel error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= UPDATE HOTEL =================
export const updateHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    // Notify admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await createNotification(
        admin._id,
        'admin',
        'info',
        `✏️ Hotel Updated: ${hotel.name}`,
        `Hotel "${hotel.name}" has been updated.`,
        `/admin/hotels/${hotel._id}`,
        { hotelId: hotel._id, action: 'hotel_updated' }
      );
    }

    res.json({ success: true, hotel });
  } catch (error) {
    console.error('Update hotel error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= DELETE HOTEL =================
export const deleteHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    const hotelName = hotel.name;
    await Hotel.findByIdAndDelete(req.params.id);

    // Notify admins
    const admins = await User.find({ role: 'admin' });
    for (const admin of admins) {
      await createNotification(
        admin._id,
        'admin',
        'warning',
        `🗑️ Hotel Deleted: ${hotelName}`,
        `Hotel "${hotelName}" has been deleted.`,
        `/admin/hotels`,
        { hotelId: req.params.id, action: 'hotel_deleted' }
      );
    }

    res.json({ success: true, message: 'Hotel deleted successfully' });
  } catch (error) {
    console.error('Delete hotel error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
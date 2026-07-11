// backend/controllers/hotelController.js
import Hotel from '../models/Hotel.js';

// @desc    Get all hotels
// @route   GET /api/hotels
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

// @desc    Get single hotel
// @route   GET /api/hotels/:id
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

// @desc    Create hotel
// @route   POST /api/hotels
export const createHotel = async (req, res) => {
  try {
    const io = req.app.get('io');
    
    const hotelData = {
      ...req.body,
      createdBy: req.user.id,
    };
    const hotel = await Hotel.create(hotelData);

    // Emit hotel creation notification
    if (io) {
      io.emit('hotel-created', {
        hotelId: hotel._id,
        name: hotel.name,
        region: hotel.region,
        createdBy: req.user.name,
        timestamp: new Date()
      });

      io.to('admin-room').emit('admin-notification', {
        type: 'hotel-created',
        hotelId: hotel._id,
        message: `New hotel "${hotel.name}" created by ${req.user.name}`,
        timestamp: new Date()
      });
    }

    res.status(201).json({ success: true, hotel });
  } catch (error) {
    console.error('Create hotel error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update hotel
// @route   PUT /api/hotels/:id
export const updateHotel = async (req, res) => {
  try {
    const io = req.app.get('io');
    
    const hotel = await Hotel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    // Emit hotel update notification
    if (io) {
      io.emit('hotel-updated', {
        hotelId: hotel._id,
        name: hotel.name,
        region: hotel.region,
        updatedBy: req.user.name,
        timestamp: new Date()
      });

      io.to('admin-room').emit('admin-notification', {
        type: 'hotel-updated',
        hotelId: hotel._id,
        message: `Hotel "${hotel.name}" updated by ${req.user.name}`,
        timestamp: new Date()
      });
    }

    res.json({ success: true, hotel });
  } catch (error) {
    console.error('Update hotel error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete hotel
// @route   DELETE /api/hotels/:id
export const deleteHotel = async (req, res) => {
  try {
    const io = req.app.get('io');
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ success: false, message: 'Hotel not found' });
    }

    const hotelName = hotel.name;
    await Hotel.findByIdAndDelete(req.params.id);

    // Emit hotel deletion notification
    if (io) {
      io.emit('hotel-deleted', {
        hotelId: req.params.id,
        name: hotelName,
        deletedBy: req.user.name,
        timestamp: new Date()
      });

      io.to('admin-room').emit('admin-notification', {
        type: 'hotel-deleted',
        hotelId: req.params.id,
        message: `Hotel "${hotelName}" deleted by ${req.user.name}`,
        timestamp: new Date()
      });
    }

    res.json({ success: true, message: 'Hotel deleted successfully' });
  } catch (error) {
    console.error('Delete hotel error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
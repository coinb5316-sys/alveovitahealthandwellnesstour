// backend/controllers/tourController.js
import Tour from '../models/Tour.js';

// @desc    Get all tours
// @route   GET /api/tours
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

// @desc    Get single tour
// @route   GET /api/tours/:id
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

// @desc    Create tour
// @route   POST /api/tours
export const createTour = async (req, res) => {
  try {
    const io = req.app.get('io');
    
    const tourData = {
      ...req.body,
      createdBy: req.user.id,
    };
    const tour = await Tour.create(tourData);

    // Emit tour creation notification
    if (io) {
      io.emit('tour-created', {
        tourId: tour._id,
        title: tour.title,
        region: tour.region,
        createdBy: req.user.name,
        timestamp: new Date()
      });

      io.to('admin-room').emit('admin-notification', {
        type: 'tour-created',
        tourId: tour._id,
        message: `New tour "${tour.title}" created by ${req.user.name}`,
        timestamp: new Date()
      });
    }

    res.status(201).json({ success: true, tour });
  } catch (error) {
    console.error('Create tour error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update tour
// @route   PUT /api/tours/:id
export const updateTour = async (req, res) => {
  try {
    const io = req.app.get('io');
    
    const tour = await Tour.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!tour) {
      return res.status(404).json({ success: false, message: 'Tour not found' });
    }

    // Emit tour update notification
    if (io) {
      io.emit('tour-updated', {
        tourId: tour._id,
        title: tour.title,
        region: tour.region,
        updatedBy: req.user.name,
        timestamp: new Date()
      });

      io.to('admin-room').emit('admin-notification', {
        type: 'tour-updated',
        tourId: tour._id,
        message: `Tour "${tour.title}" updated by ${req.user.name}`,
        timestamp: new Date()
      });
    }

    res.json({ success: true, tour });
  } catch (error) {
    console.error('Update tour error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete tour
// @route   DELETE /api/tours/:id
export const deleteTour = async (req, res) => {
  try {
    const io = req.app.get('io');
    const tour = await Tour.findById(req.params.id);
    if (!tour) {
      return res.status(404).json({ success: false, message: 'Tour not found' });
    }

    const tourTitle = tour.title;
    await Tour.findByIdAndDelete(req.params.id);

    // Emit tour deletion notification
    if (io) {
      io.emit('tour-deleted', {
        tourId: req.params.id,
        title: tourTitle,
        deletedBy: req.user.name,
        timestamp: new Date()
      });

      io.to('admin-room').emit('admin-notification', {
        type: 'tour-deleted',
        tourId: req.params.id,
        message: `Tour "${tourTitle}" deleted by ${req.user.name}`,
        timestamp: new Date()
      });
    }

    res.json({ success: true, message: 'Tour deleted successfully' });
  } catch (error) {
    console.error('Delete tour error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
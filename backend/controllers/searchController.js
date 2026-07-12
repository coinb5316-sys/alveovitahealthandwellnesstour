// backend/controllers/searchController.js
import Hotel from '../models/Hotel.js';
import Tour from '../models/Tour.js';
import Destination from '../models/Destination.js';
import Experience from '../models/Experience.js';
import mongoose from 'mongoose';

// @desc    Global search across all modules
// @route   GET /api/search
export const globalSearch = async (req, res) => {
  try {
    const { q, type, region, limit = 20, page = 1 } = req.query;
    
    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters'
      });
    }

    const searchTerm = q.trim();
    const searchRegex = new RegExp(searchTerm, 'i');
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let results = [];
    let total = 0;

    // Search Hotels
    if (!type || type === 'hotels' || type === 'all') {
      const hotelQuery = {
        $or: [
          { name: searchRegex },
          { description: searchRegex },
          { location: searchRegex },
          { region: searchRegex },
          { amenities: { $elemMatch: { $regex: searchTerm, $options: 'i' } } }
        ]
      };
      if (region && region !== 'all') hotelQuery.region = region;

      const hotels = await Hotel.find(hotelQuery)
        .select('name location region description price rating images amenities')
        .limit(limitNum)
        .skip(skip)
        .lean();

      const hotelCount = await Hotel.countDocuments(hotelQuery);

      results = results.concat(hotels.map(h => ({
        ...h,
        _type: 'hotel',
        typeLabel: 'Hotel',
        icon: '🏨',
        url: `/hotel/${h._id}`
      })));
      total += hotelCount;
    }

    // Search Tours
    if (!type || type === 'tours' || type === 'all') {
      const tourQuery = {
        $or: [
          { title: searchRegex },
          { description: searchRegex },
          { location: searchRegex },
          { region: searchRegex },
          { type: searchRegex },
          { includes: { $elemMatch: { $regex: searchTerm, $options: 'i' } } }
        ]
      };
      if (region && region !== 'all') tourQuery.region = region;

      const tours = await Tour.find(tourQuery)
        .select('title description location region price rating images duration type')
        .limit(limitNum)
        .skip(skip)
        .lean();

      const tourCount = await Tour.countDocuments(tourQuery);

      results = results.concat(tours.map(t => ({
        ...t,
        _type: 'tour',
        typeLabel: 'Tour',
        icon: '🧭',
        url: `/tour/${t._id}`
      })));
      total += tourCount;
    }

    // Search Destinations
    if (!type || type === 'destinations' || type === 'all') {
      const destQuery = {
        $or: [
          { name: searchRegex },
          { description: searchRegex },
          { region: searchRegex },
          { attractions: { $elemMatch: { $regex: searchTerm, $options: 'i' } } },
          { tags: { $elemMatch: { $regex: searchTerm, $options: 'i' } } }
        ]
      };
      if (region && region !== 'all') destQuery.region = region;

      const destinations = await Destination.find(destQuery)
        .select('name description region image rating tags attractions')
        .limit(limitNum)
        .skip(skip)
        .lean();

      const destCount = await Destination.countDocuments(destQuery);

      results = results.concat(destinations.map(d => ({
        ...d,
        _type: 'destination',
        typeLabel: 'Destination',
        icon: '📍',
        url: `/destination/${d._id}`
      })));
      total += destCount;
    }

    // Search Experiences
    if (!type || type === 'experiences' || type === 'all') {
      const expQuery = {
        status: 'active',
        $or: [
          { title: searchRegex },
          { content: searchRegex },
          { region: searchRegex },
          { tourName: searchRegex },
          { type: searchRegex }
        ]
      };
      if (region && region !== 'all') expQuery.region = region;

      const experiences = await Experience.find(expQuery)
        .populate('user', 'name avatar')
        .select('title content region type mediaUrl thumbnail tourName user likes comments createdAt')
        .limit(limitNum)
        .skip(skip)
        .lean();

      const expCount = await Experience.countDocuments(expQuery);

      results = results.concat(experiences.map(e => ({
        ...e,
        _type: 'experience',
        typeLabel: 'Experience',
        icon: '✨',
        url: `/experience/${e._id}`
      })));
      total += expCount;
    }

    // Sort by relevance - items with exact matches first
    results.sort((a, b) => {
      const aExact = (a.name || a.title || '').toLowerCase() === searchTerm.toLowerCase();
      const bExact = (b.name || b.title || '').toLowerCase() === searchTerm.toLowerCase();
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return 0;
    });

    // Paginate combined results
    const paginatedResults = results.slice(0, limitNum);

    res.json({
      success: true,
      results: paginatedResults,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      },
      query: searchTerm,
      type: type || 'all',
      region: region || 'all'
    });
  } catch (error) {
    console.error('Global search error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Search failed'
    });
  }
};

// @desc    Search suggestions / autocomplete
// @route   GET /api/search/suggestions
export const getSearchSuggestions = async (req, res) => {
  try {
    const { q, limit = 5 } = req.query;
    
    if (!q || q.trim().length < 1) {
      return res.json({
        success: true,
        suggestions: []
      });
    }

    const searchTerm = q.trim();
    const searchRegex = new RegExp(searchTerm, 'i');
    const limitNum = parseInt(limit);

    // Get suggestions from all collections
    const [hotels, tours, destinations, experiences] = await Promise.all([
      Hotel.find(
        { name: searchRegex },
        { name: 1, location: 1, region: 1, _id: 1 }
      ).limit(limitNum).lean(),
      Tour.find(
        { title: searchRegex },
        { title: 1, location: 1, region: 1, _id: 1 }
      ).limit(limitNum).lean(),
      Destination.find(
        { name: searchRegex },
        { name: 1, region: 1, _id: 1 }
      ).limit(limitNum).lean(),
      Experience.find(
        { title: searchRegex, status: 'active' },
        { title: 1, region: 1, _id: 1 }
      ).limit(limitNum).lean()
    ]);

    const suggestions = [
      ...hotels.map(h => ({
        text: h.name,
        type: 'hotel',
        typeLabel: 'Hotel',
        location: h.location,
        region: h.region,
        id: h._id,
        icon: '🏨'
      })),
      ...tours.map(t => ({
        text: t.title,
        type: 'tour',
        typeLabel: 'Tour',
        location: t.location,
        region: t.region,
        id: t._id,
        icon: '🧭'
      })),
      ...destinations.map(d => ({
        text: d.name,
        type: 'destination',
        typeLabel: 'Destination',
        region: d.region,
        id: d._id,
        icon: '📍'
      })),
      ...experiences.map(e => ({
        text: e.title,
        type: 'experience',
        typeLabel: 'Experience',
        region: e.region,
        id: e._id,
        icon: '✨'
      }))
    ];

    // Sort by relevance and limit
    suggestions.sort((a, b) => {
      const aExact = a.text.toLowerCase() === searchTerm.toLowerCase();
      const bExact = b.text.toLowerCase() === searchTerm.toLowerCase();
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      return a.text.length - b.text.length;
    });

    res.json({
      success: true,
      suggestions: suggestions.slice(0, limitNum * 2)
    });
  } catch (error) {
    console.error('Search suggestions error:', error);
    res.json({
      success: true,
      suggestions: []
    });
  }
};

// @desc    Filter search with advanced options
// @route   POST /api/search/filter
export const filterSearch = async (req, res) => {
  try {
    const {
      q,
      types = [],
      regions = [],
      minPrice,
      maxPrice,
      minRating,
      amenities = [],
      sortBy = 'relevance',
      limit = 20,
      page = 1
    } = req.body;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    let results = [];
    let total = 0;

    const searchRegex = q && q.trim().length >= 2 ? new RegExp(q.trim(), 'i') : null;

    // Search Hotels
    if (types.length === 0 || types.includes('hotel')) {
      const hotelQuery = {};
      if (searchRegex) {
        hotelQuery.$or = [
          { name: searchRegex },
          { description: searchRegex },
          { location: searchRegex },
          { region: searchRegex }
        ];
      }
      if (regions.length > 0) hotelQuery.region = { $in: regions };
      if (minPrice || maxPrice) {
        hotelQuery.price = {};
        if (minPrice) hotelQuery.price.$gte = parseFloat(minPrice);
        if (maxPrice) hotelQuery.price.$lte = parseFloat(maxPrice);
      }
      if (minRating) hotelQuery.rating = { $gte: parseFloat(minRating) };
      if (amenities.length > 0) {
        hotelQuery.amenities = { $all: amenities };
      }

      const hotels = await Hotel.find(hotelQuery)
        .select('name location region description price rating images amenities')
        .sort(sortBy === 'price' ? { price: 1 } : sortBy === 'rating' ? { rating: -1 } : { createdAt: -1 })
        .limit(limitNum)
        .skip(skip)
        .lean();

      const hotelCount = await Hotel.countDocuments(hotelQuery);

      results = results.concat(hotels.map(h => ({
        ...h,
        _type: 'hotel',
        typeLabel: 'Hotel',
        icon: '🏨',
        url: `/hotel/${h._id}`
      })));
      total += hotelCount;
    }

    // Search Tours
    if (types.length === 0 || types.includes('tour')) {
      const tourQuery = {};
      if (searchRegex) {
        tourQuery.$or = [
          { title: searchRegex },
          { description: searchRegex },
          { location: searchRegex },
          { region: searchRegex }
        ];
      }
      if (regions.length > 0) tourQuery.region = { $in: regions };
      if (minPrice || maxPrice) {
        tourQuery.price = {};
        if (minPrice) tourQuery.price.$gte = parseFloat(minPrice);
        if (maxPrice) tourQuery.price.$lte = parseFloat(maxPrice);
      }
      if (minRating) tourQuery.rating = { $gte: parseFloat(minRating) };

      const tours = await Tour.find(tourQuery)
        .select('title location region description price rating images duration type')
        .sort(sortBy === 'price' ? { price: 1 } : sortBy === 'rating' ? { rating: -1 } : { createdAt: -1 })
        .limit(limitNum)
        .skip(skip)
        .lean();

      const tourCount = await Tour.countDocuments(tourQuery);

      results = results.concat(tours.map(t => ({
        ...t,
        _type: 'tour',
        typeLabel: 'Tour',
        icon: '🧭',
        url: `/tour/${t._id}`
      })));
      total += tourCount;
    }

    // Search Destinations
    if (types.length === 0 || types.includes('destination')) {
      const destQuery = {};
      if (searchRegex) {
        destQuery.$or = [
          { name: searchRegex },
          { description: searchRegex },
          { region: searchRegex }
        ];
      }
      if (regions.length > 0) destQuery.region = { $in: regions };
      if (minRating) destQuery.rating = { $gte: parseFloat(minRating) };

      const destinations = await Destination.find(destQuery)
        .select('name region description image rating tags attractions')
        .sort(sortBy === 'rating' ? { rating: -1 } : { createdAt: -1 })
        .limit(limitNum)
        .skip(skip)
        .lean();

      const destCount = await Destination.countDocuments(destQuery);

      results = results.concat(destinations.map(d => ({
        ...d,
        _type: 'destination',
        typeLabel: 'Destination',
        icon: '📍',
        url: `/destination/${d._id}`
      })));
      total += destCount;
    }

    // Search Experiences
    if (types.length === 0 || types.includes('experience')) {
      const expQuery = { status: 'active' };
      if (searchRegex) {
        expQuery.$or = [
          { title: searchRegex },
          { content: searchRegex },
          { region: searchRegex }
        ];
      }
      if (regions.length > 0) expQuery.region = { $in: regions };

      const experiences = await Experience.find(expQuery)
        .populate('user', 'name avatar')
        .select('title content region type mediaUrl thumbnail tourName user likes comments createdAt')
        .sort({ createdAt: -1 })
        .limit(limitNum)
        .skip(skip)
        .lean();

      const expCount = await Experience.countDocuments(expQuery);

      results = results.concat(experiences.map(e => ({
        ...e,
        _type: 'experience',
        typeLabel: 'Experience',
        icon: '✨',
        url: `/experience/${e._id}`
      })));
      total += expCount;
    }

    res.json({
      success: true,
      results,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      },
      filters: { types, regions, minPrice, maxPrice, minRating, amenities }
    });
  } catch (error) {
    console.error('Filter search error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Filter search failed'
    });
  }
};
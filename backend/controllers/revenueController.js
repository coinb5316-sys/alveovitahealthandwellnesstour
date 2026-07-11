// backend/controllers/revenueController.js
import Revenue from '../models/Revenue.js';

// @desc    Get revenue analytics
// @route   GET /api/analytics/revenue
export const getRevenueAnalytics = async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;

    // Determine date range based on period
    let dateRange = {};
    const now = new Date();
    
    if (period === 'daily') {
      dateRange = {
        $gte: new Date(now.setDate(now.getDate() - 30)),
      };
    } else if (period === 'weekly') {
      dateRange = {
        $gte: new Date(now.setDate(now.getDate() - 90)),
      };
    } else if (period === 'yearly') {
      dateRange = {
        $gte: new Date(now.setFullYear(now.getFullYear() - 1)),
      };
    } else { // monthly default
      dateRange = {
        $gte: new Date(now.setMonth(now.getMonth() - 6)),
      };
    }

    // Get revenue data
    const revenueData = await Revenue.aggregate([
      {
        $match: {
          status: 'completed',
          date: { $gte: dateRange.$gte },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
            day: { $dayOfMonth: '$date' },
          },
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 },
      },
    ]);

    // Format chart data
    const chartData = revenueData.map(item => ({
      name: `${item._id.month}/${item._id.day}/${item._id.year}`,
      revenue: item.total,
      count: item.count,
    }));

    // Get summary stats
    const summary = await Revenue.aggregate([
      {
        $match: {
          status: 'completed',
        },
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' },
          averageRevenue: { $avg: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    // Get monthly revenue
    const monthlyRevenue = await Revenue.aggregate([
      {
        $match: {
          status: 'completed',
          date: {
            $gte: new Date(now.getFullYear(), now.getMonth() - 1, 1),
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    // Get weekly revenue
    const weeklyRevenue = await Revenue.aggregate([
      {
        $match: {
          status: 'completed',
          date: {
            $gte: new Date(now.setDate(now.getDate() - 7)),
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    // Calculate growth
    const lastMonth = await Revenue.aggregate([
      {
        $match: {
          status: 'completed',
          date: {
            $gte: new Date(now.getFullYear(), now.getMonth() - 2, 1),
            $lt: new Date(now.getFullYear(), now.getMonth() - 1, 1),
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    const currentMonth = await Revenue.aggregate([
      {
        $match: {
          status: 'completed',
          date: {
            $gte: new Date(now.getFullYear(), now.getMonth() - 1, 1),
          },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    const growth = currentMonth[0]?.total || 0 - (lastMonth[0]?.total || 0);

    res.json({
      success: true,
      chartData,
      summary: {
        totalRevenue: summary[0]?.totalRevenue || 0,
        monthlyRevenue: monthlyRevenue[0]?.total || 0,
        weeklyRevenue: weeklyRevenue[0]?.total || 0,
        growth: summary[0]?.totalRevenue > 0 ? 
          Math.round((growth / (lastMonth[0]?.total || 1)) * 100) : 0,
      },
    });
  } catch (error) {
    console.error('Get revenue analytics error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
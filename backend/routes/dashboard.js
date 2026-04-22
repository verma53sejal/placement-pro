const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { Submission, Credit, Company, Redemption, Reward } = require('../models/index');
const { protect } = require('../middleware/auth');

// Dashboard summary
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('targetCompanies', 'name logo tier');
    const recentSubmissions = await Submission.find({ user: req.user._id })
      .populate('problem', 'title difficulty')
      .sort({ createdAt: -1 }).limit(10);

    // Activity heatmap - last 52 weeks
    const oneYearAgo = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
    const activity = await Submission.aggregate([
      { $match: { user: user._id, status: 'Accepted', createdAt: { $gte: oneYearAgo } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Weekly chart - last 7 days
    const weeklyActivity = await Submission.aggregate([
      { $match: { user: user._id, createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 }, accepted: { $sum: { $cond: [{ $eq: ['$status', 'Accepted'] }, 1, 0] } } } },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      user: { ...user.toObject(), password: undefined },
      recentSubmissions,
      activityHeatmap: activity,
      weeklyActivity
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

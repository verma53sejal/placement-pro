const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Problem = require('../models/Problem');
const { Submission, Company, MockInterview } = require('../models/index');
const { protect, adminOnly } = require('../middleware/auth');

router.use(protect, adminOnly);

router.get('/analytics', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'student' });
    const totalProblems = await Problem.countDocuments();
    const totalSubmissions = await Submission.countDocuments();
    const totalCompanies = await Company.countDocuments();
    const recentUsers = await User.find({ role: 'student' }).sort({ createdAt: -1 }).limit(10).select('username email profile.college stats.totalSolved credits createdAt');
    const topProblems = await Submission.aggregate([
      { $group: { _id: '$problem', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'problems', localField: '_id', foreignField: '_id', as: 'problem' } },
      { $unwind: '$problem' }
    ]);
    res.json({ totalUsers, totalProblems, totalSubmissions, totalCompanies, recentUsers, topProblems });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/users', async (req, res) => {
  try {
    const users = await User.find({ role: 'student' }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

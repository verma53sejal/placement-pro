const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const { type = 'credits', limit = 50 } = req.query;
    const sortField = type === 'streak' ? 'stats.streak' : type === 'solved' ? 'stats.totalSolved' : 'credits';
    const users = await User.find({ role: 'student' })
      .select('username profile.fullName profile.college stats credits placementReadinessScore readinessLevel')
      .sort({ [sortField]: -1 })
      .limit(Number(limit));

    const leaderboard = users.map((u, i) => ({ rank: i + 1, ...u.toObject() }));
    const myRank = leaderboard.findIndex(u => u._id.toString() === req.user._id.toString()) + 1;

    res.json({ leaderboard, myRank });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

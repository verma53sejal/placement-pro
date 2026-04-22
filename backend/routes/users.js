// users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { Submission } = require('../models/index');
const { protect } = require('../middleware/auth');

router.get('/me/stats', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    const topicBreakdown = await Submission.aggregate([
      { $match: { user: user._id, status: 'Accepted' } },
      { $lookup: { from: 'problems', localField: 'problem', foreignField: '_id', as: 'problemData' } },
      { $unwind: '$problemData' },
      { $group: { _id: '$problemData.topic', count: { $sum: 1 } } }
    ]);
    res.json({ user, topicBreakdown });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/upload-resume', protect, async (req, res) => {
  try {
    const { resumeData } = req.body;
    // Simulate ATS scoring
    const keywords = ['React', 'Node.js', 'Python', 'JavaScript', 'SQL', 'Git', 'REST API', 'MongoDB'];
    const found = keywords.filter(k => resumeData?.toLowerCase().includes(k.toLowerCase()));
    const atsScore = Math.round((found.length / keywords.length) * 100);
    const missing = keywords.filter(k => !resumeData?.toLowerCase().includes(k.toLowerCase()));

    const user = await User.findByIdAndUpdate(req.user._id, {
      resumeUploaded: true,
      resumeScore: atsScore,
      $inc: { credits: 25 }
    }, { new: true });

    res.json({ atsScore, missingKeywords: missing, foundKeywords: found, newBalance: user.credits });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

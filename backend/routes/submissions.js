// submissions.js
const express = require('express');
const router = express.Router();
const { Submission } = require('../models/index');
const { protect } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const submissions = await Submission.find({ user: req.user._id })
      .populate('problem', 'title difficulty slug').sort({ createdAt: -1 }).limit(50);
    res.json(submissions);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

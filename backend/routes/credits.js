const express = require('express');
const router = express.Router();
const { Credit } = require('../models/index');
const { protect } = require('../middleware/auth');

router.get('/history', protect, async (req, res) => {
  try {
    const history = await Credit.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(50);
    res.json(history);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

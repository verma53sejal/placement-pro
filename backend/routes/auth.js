const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { Credit } = require('../models/index');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// Register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, fullName, college } = req.body;
    const userExists = await User.findOne({ $or: [{ email }, { username }] });
    if (userExists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({
      username, email, password,
      profile: { fullName, college }
    });

    // Award welcome credits
    await Credit.create({ user: user._id, amount: 50, type: 'earn', reason: 'Welcome bonus', balance: 50 });
    await User.findByIdAndUpdate(user._id, { credits: 50 });

    res.status(201).json({
      _id: user._id, username: user.username, email: user.email,
      role: user.role, credits: 50,
      token: generateToken(user._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid credentials' });

    // Daily login streak & credits
    const today = new Date().toDateString();
    const lastActive = user.stats.lastActive ? new Date(user.stats.lastActive).toDateString() : null;

    if (lastActive !== today) {
      const yesterday = new Date(Date.now() - 86400000).toDateString();
      const newStreak = lastActive === yesterday ? user.stats.streak + 1 : 1;
      const bonusCredits = newStreak % 7 === 0 ? 50 : 5;

      await User.findByIdAndUpdate(user._id, {
        'stats.lastActive': new Date(),
        'stats.streak': newStreak,
        'stats.longestStreak': Math.max(newStreak, user.stats.longestStreak),
        $inc: { credits: bonusCredits }
      });

      await Credit.create({
        user: user._id, amount: bonusCredits, type: 'earn',
        reason: `Daily login${newStreak % 7 === 0 ? ' + streak bonus' : ''}`,
        balance: user.credits + bonusCredits
      });
    }

    const updatedUser = await User.findById(user._id).select('-password');
    res.json({
      _id: updatedUser._id, username: updatedUser.username, email: updatedUser.email,
      role: updatedUser.role, credits: updatedUser.credits,
      profile: updatedUser.profile, stats: updatedUser.stats,
      placementReadinessScore: updatedUser.placementReadinessScore,
      readinessLevel: updatedUser.readinessLevel,
      token: generateToken(updatedUser._id)
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get profile
router.get('/profile', protect, async (req, res) => {
  const user = await User.findById(req.user._id).select('-password').populate('targetCompanies');
  res.json(user);
});

// Update profile
router.put('/profile', protect, async (req, res) => {
  try {
    const { fullName, college, bio, linkedIn, github, graduationYear, studyHoursPerDay } = req.body;
    const user = await User.findByIdAndUpdate(req.user._id, {
      'profile.fullName': fullName,
      'profile.college': college,
      'profile.bio': bio,
      'profile.linkedIn': linkedIn,
      'profile.github': github,
      'profile.graduationYear': graduationYear,
      'preferences.studyHoursPerDay': studyHoursPerDay
    }, { new: true }).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;

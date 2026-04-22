const express = require('express');
const router = express.Router();
const { Reward, Redemption, Credit } = require('../models/index');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const rewards = await Reward.find({ available: true });
    const myRedemptions = await Redemption.find({ user: req.user._id }).populate('reward', 'title type');
    res.json({ rewards, myRedemptions });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:id/redeem', protect, async (req, res) => {
  try {
    const reward = await Reward.findById(req.params.id);
    if (!reward) return res.status(404).json({ message: 'Reward not found' });
    const user = await User.findById(req.user._id);
    if (user.credits < reward.creditCost) return res.status(400).json({ message: 'Insufficient credits' });

    await User.findByIdAndUpdate(req.user._id, { $inc: { credits: -reward.creditCost } });
    await Reward.findByIdAndUpdate(reward._id, { $inc: { totalRedeemed: 1 } });

    const updatedUser = await User.findById(req.user._id);
    await Credit.create({ user: req.user._id, amount: -reward.creditCost, type: 'spend', reason: `Redeemed: ${reward.title}`, balance: updatedUser.credits });
    const redemption = await Redemption.create({ user: req.user._id, reward: reward._id, creditsSpent: reward.creditCost });

    res.json({ redemption, newBalance: updatedUser.credits });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const reward = await Reward.create(req.body);
    res.status(201).json(reward);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

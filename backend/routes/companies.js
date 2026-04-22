// companies.js
const express = require('express');
const router = express.Router();
const { Company } = require('../models/index');
const { Submission } = require('../models/index');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

router.get('/', protect, async (req, res) => {
  try {
    const companies = await Company.find().populate('problems', 'title difficulty');
    res.json(companies);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id/progress', protect, async (req, res) => {
  try {
    const company = await Company.findById(req.params.id).populate('problems');
    if (!company) return res.status(404).json({ message: 'Company not found' });
    const solvedIds = await Submission.find({ user: req.user._id, status: 'Accepted' }).distinct('problem');
    const solvedSet = new Set(solvedIds.map(id => id.toString()));
    const progress = company.problems.map(p => ({ ...p.toObject(), solved: solvedSet.has(p._id.toString()) }));
    const solvedCount = progress.filter(p => p.solved).length;
    res.json({ company, problems: progress, solvedCount, totalCount: progress.length, percentage: Math.round((solvedCount / progress.length) * 100) || 0 });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:id/select', protect, async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { $addToSet: { targetCompanies: req.params.id } });
    res.json({ message: 'Company added to targets' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const company = await Company.create(req.body);
    res.status(201).json(company);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

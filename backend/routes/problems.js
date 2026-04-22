const express = require('express');
const router = express.Router();
const Problem = require('../models/Problem');
const { Submission, Credit } = require('../models/index');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');

// Get all problems with filters
router.get('/', protect, async (req, res) => {
  try {
    const { difficulty, tags, company, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (difficulty) filter.difficulty = difficulty;
    if (tags) filter.tags = { $in: tags.split(',') };
    if (company) filter.companies = company;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const problems = await Problem.find(filter)
      .populate('companies', 'name logo')
      .sort({ order: 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Problem.countDocuments(filter);

    // Mark solved status for current user
    const solvedProblems = await Submission.find({ user: req.user._id, status: 'Accepted' }).distinct('problem');
    const solvedSet = new Set(solvedProblems.map(id => id.toString()));

    const problemsWithStatus = problems.map(p => ({
      ...p.toObject(),
      solved: solvedSet.has(p._id.toString())
    }));

    res.json({ problems: problemsWithStatus, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get daily challenge
router.get('/daily', protect, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const problem = await Problem.findOne({ isDaily: true, dailyDate: { $gte: today } }).populate('companies', 'name');
    if (!problem) return res.status(404).json({ message: 'No daily challenge today' });
    res.json(problem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single problem
router.get('/:slug', protect, async (req, res) => {
  try {
    const problem = await Problem.findOne({ slug: req.params.slug }).populate('companies', 'name logo');
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    const solved = await Submission.findOne({ user: req.user._id, problem: problem._id, status: 'Accepted' });
    const userSubmissions = await Submission.find({ user: req.user._id, problem: problem._id }).sort({ createdAt: -1 }).limit(5);

    res.json({ ...problem.toObject(), solved: !!solved, userSubmissions });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Submit solution
router.post('/:id/submit', protect, async (req, res) => {
  try {
    const { code, language, status, runtime, memory } = req.body;
    const problem = await Problem.findById(req.params.id);
    if (!problem) return res.status(404).json({ message: 'Problem not found' });

    // Check if already solved
    const alreadySolved = await Submission.findOne({ user: req.user._id, problem: problem._id, status: 'Accepted' });

    const submission = await Submission.create({
      user: req.user._id, problem: problem._id,
      code, language, status, runtime, memory
    });

    // Update problem stats
    await Problem.findByIdAndUpdate(problem._id, {
      $inc: { totalSubmissions: 1, correctSubmissions: status === 'Accepted' ? 1 : 0 }
    });

    let creditsEarned = 0;
    if (status === 'Accepted' && !alreadySolved) {
      const creditMap = { Easy: 10, Medium: 20, Hard: 40 };
      creditsEarned = creditMap[problem.difficulty] || 10;

      await User.findByIdAndUpdate(req.user._id, {
        $inc: {
          credits: creditsEarned,
          'stats.totalSolved': 1,
          [`stats.${problem.difficulty.toLowerCase()}Solved`]: 1
        }
      });

      const user = await User.findById(req.user._id);
      await Credit.create({
        user: req.user._id, amount: creditsEarned, type: 'earn',
        reason: `Solved ${problem.difficulty} problem: ${problem.title}`,
        balance: user.credits
      });

      // Recalculate readiness
      await recalculateReadiness(req.user._id);
    }

    res.json({ submission, creditsEarned, message: status === 'Accepted' ? '🎉 Accepted!' : 'Try again!' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Bookmark problem
router.post('/:id/bookmark', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const problemId = req.params.id;
    const isBookmarked = user.bookmarks.includes(problemId);

    if (isBookmarked) {
      await User.findByIdAndUpdate(req.user._id, { $pull: { bookmarks: problemId } });
    } else {
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { bookmarks: problemId } });
    }

    res.json({ bookmarked: !isBookmarked });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: Add problem
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const problem = await Problem.create(req.body);
    res.status(201).json(problem);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Readiness calculation helper
async function recalculateReadiness(userId) {
  const user = await User.findById(userId);
  const { stats, resumeUploaded, aptitudeScore } = user;

  const dsaScore = Math.min(100, (stats.totalSolved / 150) * 100);
  const aptScore = aptitudeScore;
  const mockScore = Math.min(100, stats.mockInterviewsDone * 10);
  const resumeScore = resumeUploaded ? 100 : 0;
  const contestScore = Math.min(100, stats.contestsParticipated * 20);
  const streakScore = Math.min(100, stats.streak * 3);

  const total = Math.round(
    dsaScore * 0.35 + aptScore * 0.20 + mockScore * 0.20 +
    resumeScore * 0.10 + contestScore * 0.10 + streakScore * 0.05
  );

  let level = 'Beginner';
  if (total >= 80) level = 'Placement Ready';
  else if (total >= 65) level = 'Interview Ready';
  else if (total >= 45) level = 'Ready';
  else if (total >= 25) level = 'Intermediate';

  await User.findByIdAndUpdate(userId, { placementReadinessScore: total, readinessLevel: level });
}

module.exports = router;

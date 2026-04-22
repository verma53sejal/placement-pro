// studyPlans.js
const express = require('express');
const router = express.Router();
const { StudyPlan } = require('../models/index');
const User = require('../models/User');
const Problem = require('../models/Problem');
const { protect } = require('../middleware/auth');

const topicRoadmap = {
  'Arrays': ['Two Pointers', 'Sliding Window', 'Prefix Sum'],
  'Strings': ['Pattern Matching', 'Palindromes', 'Anagrams'],
  'Linked Lists': ['Reversal', 'Two Pointer', 'Cycle Detection'],
  'Trees': ['DFS', 'BFS', 'Binary Search Tree'],
  'Graphs': ['BFS/DFS', 'Shortest Path', 'Union Find'],
  'Dynamic Programming': ['Memoization', 'Tabulation', 'Optimization'],
  'Sorting': ['Quick Sort', 'Merge Sort', 'Heap Sort'],
  'Recursion': ['Backtracking', 'Divide and Conquer']
};

router.post('/generate', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('targetCompanies');
    const { studyHours = user.preferences.studyHoursPerDay || 2 } = req.body;

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const topics = Object.keys(topicRoadmap);
    const dailyTasks = days.map((day, i) => {
      const topic = topics[i % topics.length];
      return {
        day,
        date: new Date(Date.now() + i * 24 * 60 * 60 * 1000),
        tasks: [{
          topic,
          description: `Focus on ${topic}: ${topicRoadmap[topic].join(', ')}`,
          estimatedHours: studyHours,
          completed: false
        }]
      };
    });

    const startDate = new Date();
    const endDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const plan = await StudyPlan.create({
      user: req.user._id,
      weekNumber: Math.ceil((Date.now() - new Date(new Date().getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000)),
      startDate,
      endDate,
      dailyTasks,
      targetCompanies: user.targetCompanies.map(c => c._id)
    });

    res.json(plan);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/current', protect, async (req, res) => {
  try {
    const plan = await StudyPlan.findOne({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(plan);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/:id/task', protect, async (req, res) => {
  try {
    const { dayIndex, taskIndex, completed } = req.body;
    const plan = await StudyPlan.findById(req.params.id);
    plan.dailyTasks[dayIndex].tasks[taskIndex].completed = completed;
    await plan.save();
    res.json(plan);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

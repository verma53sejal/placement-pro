const express = require('express');
const router = express.Router();
const { MockInterview, Credit } = require('../models/index');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const sampleQuestions = {
  MCQ: [
    { question: 'What is the time complexity of binary search?', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], correctAnswer: 'O(log n)', type: 'MCQ' },
    { question: 'Which data structure uses LIFO principle?', options: ['Queue', 'Stack', 'Heap', 'Tree'], correctAnswer: 'Stack', type: 'MCQ' },
    { question: 'What does HTTP stand for?', options: ['HyperText Transfer Protocol', 'High Transfer Text Protocol', 'Hyper Transfer Tech Protocol', 'None'], correctAnswer: 'HyperText Transfer Protocol', type: 'MCQ' },
    { question: 'Which sorting algorithm has O(n log n) average case?', options: ['Bubble Sort', 'Insertion Sort', 'Merge Sort', 'Selection Sort'], correctAnswer: 'Merge Sort', type: 'MCQ' },
    { question: 'What is a primary key in a database?', options: ['Foreign key reference', 'Unique identifier for a record', 'Index on a column', 'None of the above'], correctAnswer: 'Unique identifier for a record', type: 'MCQ' }
  ],
  HR: [
    { question: 'Tell me about yourself.', type: 'HR' },
    { question: 'Where do you see yourself in 5 years?', type: 'HR' },
    { question: 'What is your greatest strength?', type: 'HR' },
    { question: 'Why do you want to work for this company?', type: 'HR' },
    { question: 'Describe a challenge you faced and how you overcame it.', type: 'HR' }
  ],
  Coding: [
    { question: 'Write a function to reverse a string.', type: 'Coding' },
    { question: 'Find the maximum element in an array.', type: 'Coding' },
    { question: 'Check if a number is prime.', type: 'Coding' }
  ]
};

router.post('/start', protect, async (req, res) => {
  try {
    const { type = 'Mixed' } = req.body;
    let questions = [];
    if (type === 'Mixed' || type === 'DSA') questions = [...sampleQuestions.MCQ.slice(0, 3), ...sampleQuestions.Coding.slice(0, 2)];
    if (type === 'HR') questions = sampleQuestions.HR;
    if (type === 'Aptitude') questions = sampleQuestions.MCQ;

    const interview = await MockInterview.create({ user: req.user._id, type, questions, maxScore: questions.length * 10, startTime: new Date() });
    res.json(interview);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:id/submit', protect, async (req, res) => {
  try {
    const { answers } = req.body;
    const interview = await MockInterview.findById(req.params.id);
    if (!interview) return res.status(404).json({ message: 'Interview not found' });

    let score = 0;
    const updatedQuestions = interview.questions.map((q, i) => {
      const answer = answers[i];
      const isCorrect = q.type === 'MCQ' && answer === q.correctAnswer;
      if (isCorrect) score += 10;
      return { ...q.toObject(), userAnswer: answer, isCorrect };
    });

    const percentage = Math.round((score / interview.maxScore) * 100);
    const feedback = percentage >= 80 ? 'Excellent performance! Keep it up.' : percentage >= 60 ? 'Good effort! Review weak areas.' : 'Needs improvement. Focus on fundamentals.';

    const updatedInterview = await MockInterview.findByIdAndUpdate(req.params.id, {
      questions: updatedQuestions, score, percentage, feedback,
      completed: true, endTime: new Date(),
      duration: Math.round((new Date() - interview.startTime) / 1000)
    }, { new: true });

    // Award credits
    await User.findByIdAndUpdate(req.user._id, { $inc: { credits: 50, 'stats.mockInterviewsDone': 1 } });
    const user = await User.findById(req.user._id);
    await Credit.create({ user: req.user._id, amount: 50, type: 'earn', reason: 'Mock interview completed', balance: user.credits });

    res.json(updatedInterview);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/history', protect, async (req, res) => {
  try {
    const interviews = await MockInterview.find({ user: req.user._id, completed: true }).sort({ createdAt: -1 }).limit(20);
    res.json(interviews);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

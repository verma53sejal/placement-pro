const mongoose = require('mongoose');

// Submission Schema
const submissionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  problem: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem', required: true },
  code: String,
  language: { type: String, default: 'javascript' },
  status: { type: String, enum: ['Accepted', 'Wrong Answer', 'TLE', 'MLE', 'Runtime Error'], required: true },
  runtime: Number,
  memory: Number,
  notes: String,
  isBookmarked: { type: Boolean, default: false }
}, { timestamps: true });

// Credit Transaction Schema
const creditSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  type: { type: String, enum: ['earn', 'spend'], required: true },
  reason: { type: String, required: true },
  balance: Number,
  reference: String
}, { timestamps: true });

// Company Schema
const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  logo: String,
  tier: { type: String, enum: ['FAANG', 'Top MNC', 'Product', 'Service', 'Startup'], default: 'Product' },
  requiredTopics: [String],
  avgPackage: String,
  problems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],
  interviewProcess: [String],
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Medium' }
}, { timestamps: true });

// Mock Interview Schema
const mockInterviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['DSA', 'HR', 'Aptitude', 'Mixed'], default: 'Mixed' },
  questions: [{
    question: String,
    type: { type: String, enum: ['MCQ', 'Coding', 'HR'] },
    options: [String],
    correctAnswer: String,
    userAnswer: String,
    isCorrect: Boolean,
    timeTaken: Number
  }],
  score: { type: Number, default: 0 },
  maxScore: { type: Number, default: 100 },
  percentage: Number,
  duration: Number,
  feedback: String,
  completed: { type: Boolean, default: false },
  startTime: Date,
  endTime: Date
}, { timestamps: true });

// Study Plan Schema
const studyPlanSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  weekNumber: Number,
  startDate: Date,
  endDate: Date,
  dailyTasks: [{
    day: String,
    date: Date,
    tasks: [{
      topic: String,
      description: String,
      problems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],
      estimatedHours: Number,
      completed: { type: Boolean, default: false }
    }]
  }],
  targetCompanies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Company' }],
  generatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Reward Schema
const rewardSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  type: { type: String, enum: ['resume_review', 'mock_token', 'premium_set', 'badge', 'certificate'], required: true },
  creditCost: { type: Number, required: true },
  icon: String,
  available: { type: Boolean, default: true },
  totalRedeemed: { type: Number, default: 0 }
}, { timestamps: true });

// User Reward Redemption
const redemptionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reward: { type: mongoose.Schema.Types.ObjectId, ref: 'Reward', required: true },
  creditsSpent: Number,
  redeemedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['pending', 'fulfilled'], default: 'pending' }
}, { timestamps: true });

module.exports = {
  Submission: mongoose.model('Submission', submissionSchema),
  Credit: mongoose.model('Credit', creditSchema),
  Company: mongoose.model('Company', companySchema),
  MockInterview: mongoose.model('MockInterview', mockInterviewSchema),
  StudyPlan: mongoose.model('StudyPlan', studyPlanSchema),
  Reward: mongoose.model('Reward', rewardSchema),
  Redemption: mongoose.model('Redemption', redemptionSchema)
};

# MongoDB Schema Reference

## Collections Overview

| Collection | Purpose |
|---|---|
| users | Student and admin accounts |
| problems | DSA/aptitude problem bank |
| submissions | Code submissions per user |
| credits | Credit transaction ledger |
| companies | Target companies |
| mockinterviews | Mock interview sessions |
| studyplans | Generated weekly study plans |
| rewards | Available reward items |
| redemptions | User reward redemptions |

---

## users
```js
{
  _id: ObjectId,
  username: String (unique),
  email: String (unique),
  password: String (bcrypt hashed),
  role: "student" | "admin",
  profile: {
    fullName: String,
    avatar: String,
    college: String,
    graduationYear: Number,
    bio: String,
    linkedIn: String,
    github: String
  },
  stats: {
    easySolved: Number,
    mediumSolved: Number,
    hardSolved: Number,
    totalSolved: Number,
    streak: Number,
    longestStreak: Number,
    lastActive: Date,
    contestsParticipated: Number,
    mockInterviewsDone: Number
  },
  credits: Number,
  placementReadinessScore: Number (0-100),
  readinessLevel: "Beginner"|"Intermediate"|"Ready"|"Interview Ready"|"Placement Ready",
  targetCompanies: [ObjectId → companies],
  resumeUploaded: Boolean,
  resumeScore: Number,
  bookmarks: [ObjectId → problems],
  dailyChallengeDone: Boolean,
  aptitudeScore: Number,
  preferences: {
    studyHoursPerDay: Number,
    notifications: Boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

## problems
```js
{
  _id: ObjectId,
  title: String,
  slug: String (unique),
  description: String,
  difficulty: "Easy" | "Medium" | "Hard",
  tags: [String],
  companies: [ObjectId → companies],
  examples: [{ input, output, explanation }],
  constraints: [String],
  hints: [String],
  solution: String,
  solutionExplanation: String,
  credits: Number,
  acceptanceRate: Number,
  totalSubmissions: Number,
  correctSubmissions: Number,
  isDaily: Boolean,
  dailyDate: Date,
  isPremium: Boolean,
  topic: String,
  order: Number,
  createdAt: Date
}
```

## submissions
```js
{
  _id: ObjectId,
  user: ObjectId → users,
  problem: ObjectId → problems,
  code: String,
  language: String,
  status: "Accepted"|"Wrong Answer"|"TLE"|"MLE"|"Runtime Error",
  runtime: Number (ms),
  memory: Number (MB),
  notes: String,
  isBookmarked: Boolean,
  createdAt: Date
}
```

## credits
```js
{
  _id: ObjectId,
  user: ObjectId → users,
  amount: Number (positive=earn, negative=spend),
  type: "earn" | "spend",
  reason: String,
  balance: Number (balance after transaction),
  reference: String,
  createdAt: Date
}
```

## companies
```js
{
  _id: ObjectId,
  name: String,
  logo: String,
  tier: "FAANG"|"Top MNC"|"Product"|"Service"|"Startup",
  requiredTopics: [String],
  avgPackage: String,
  problems: [ObjectId → problems],
  interviewProcess: [String],
  difficulty: "Easy"|"Medium"|"Hard",
  createdAt: Date
}
```

## mockinterviews
```js
{
  _id: ObjectId,
  user: ObjectId → users,
  type: "DSA"|"HR"|"Aptitude"|"Mixed",
  questions: [{
    question: String,
    type: "MCQ"|"Coding"|"HR",
    options: [String],
    correctAnswer: String,
    userAnswer: String,
    isCorrect: Boolean,
    timeTaken: Number
  }],
  score: Number,
  maxScore: Number,
  percentage: Number,
  duration: Number (seconds),
  feedback: String,
  completed: Boolean,
  startTime: Date,
  endTime: Date,
  createdAt: Date
}
```

## studyplans
```js
{
  _id: ObjectId,
  user: ObjectId → users,
  weekNumber: Number,
  startDate: Date,
  endDate: Date,
  dailyTasks: [{
    day: String,
    date: Date,
    tasks: [{
      topic: String,
      description: String,
      problems: [ObjectId → problems],
      estimatedHours: Number,
      completed: Boolean
    }]
  }],
  targetCompanies: [ObjectId → companies],
  generatedAt: Date,
  createdAt: Date
}
```

## rewards
```js
{
  _id: ObjectId,
  title: String,
  description: String,
  type: "resume_review"|"mock_token"|"premium_set"|"badge"|"certificate",
  creditCost: Number,
  icon: String,
  available: Boolean,
  totalRedeemed: Number,
  createdAt: Date
}
```

## redemptions
```js
{
  _id: ObjectId,
  user: ObjectId → users,
  reward: ObjectId → rewards,
  creditsSpent: Number,
  redeemedAt: Date,
  status: "pending" | "fulfilled",
  createdAt: Date
}
```

---

## Indexes Recommended
```js
// For performance
db.submissions.createIndex({ user: 1, problem: 1 })
db.submissions.createIndex({ user: 1, createdAt: -1 })
db.credits.createIndex({ user: 1, createdAt: -1 })
db.problems.createIndex({ difficulty: 1, tags: 1 })
db.users.createIndex({ credits: -1 })
db.users.createIndex({ "stats.totalSolved": -1 })
```

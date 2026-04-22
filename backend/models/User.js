const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['student', 'admin'], default: 'student' },
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
    easySolved: { type: Number, default: 0 },
    mediumSolved: { type: Number, default: 0 },
    hardSolved: { type: Number, default: 0 },
    totalSolved: { type: Number, default: 0 },
    streak: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now },
    contestsParticipated: { type: Number, default: 0 },
    mockInterviewsDone: { type: Number, default: 0 }
  },
  credits: { type: Number, default: 0 },
  placementReadinessScore: { type: Number, default: 0 },
  readinessLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Ready', 'Interview Ready', 'Placement Ready'],
    default: 'Beginner'
  },
  targetCompanies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Company' }],
  resumeUploaded: { type: Boolean, default: false },
  resumeScore: { type: Number, default: 0 },
  bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Problem' }],
  dailyChallengeDone: { type: Boolean, default: false },
  aptitudeScore: { type: Number, default: 0 },
  preferences: {
    studyHoursPerDay: { type: Number, default: 2 },
    notifications: { type: Boolean, default: true }
  }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);

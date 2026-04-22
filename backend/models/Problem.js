const mongoose = require('mongoose');

const problemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], required: true },
  tags: [String],
  companies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Company' }],
  examples: [{
    input: String,
    output: String,
    explanation: String
  }],
  constraints: [String],
  hints: [String],
  solution: String,
  solutionExplanation: String,
  credits: { type: Number, default: 10 },
  acceptanceRate: { type: Number, default: 0 },
  totalSubmissions: { type: Number, default: 0 },
  correctSubmissions: { type: Number, default: 0 },
  isDaily: { type: Boolean, default: false },
  dailyDate: Date,
  isPremium: { type: Boolean, default: false },
  topic: String,
  order: Number
}, { timestamps: true });

module.exports = mongoose.model('Problem', problemSchema);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/problems', require('./routes/problems'));
app.use('/api/submissions', require('./routes/submissions'));
app.use('/api/credits', require('./routes/credits'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/leaderboard', require('./routes/leaderboard'));
app.use('/api/mock-interviews', require('./routes/mockInterviews'));
app.use('/api/study-plans', require('./routes/studyPlans'));
app.use('/api/rewards', require('./routes/rewards'));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/dashboard', require('./routes/dashboard'));

// Health check — also reports DB connection state
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = { 0: 'disconnected', 1: 'connected', 2: 'connecting', 3: 'disconnecting' };
  res.json({
    status: dbState === 1 ? 'OK' : 'DB_NOT_CONNECTED',
    db: states[dbState] || 'unknown',
    timestamp: new Date()
  });
});

// MongoDB Connection with retry logic
const MONGO_URI = process.env.MONGODB_URI;

if (!MONGO_URI || MONGO_URI.includes('localhost')) {
  console.error('❌ CRITICAL: MONGODB_URI is not set or still points to localhost!');
  console.error('   Set MONGODB_URI to your MongoDB Atlas connection string in Render env vars.');
  // Don't exit — let the process stay up so Render doesn't restart loop
}

const connectWithRetry = () => {
  console.log('🔄 Attempting MongoDB connection...');
  mongoose.connect(MONGO_URI || 'mongodb://localhost:27017/placement-tracker', {
    serverSelectionTimeoutMS: 10000,  // fail fast if Atlas unreachable
    socketTimeoutMS: 45000,
    connectTimeoutMS: 10000,
  })
    .then(() => console.log('✅ MongoDB Connected successfully'))
    .catch(err => {
      console.error('❌ MongoDB Connection Error:', err.message);
      console.log('⏳ Retrying connection in 5 seconds...');
      setTimeout(connectWithRetry, 5000);
    });
};

connectWithRetry();

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected. Attempting reconnect...');
  setTimeout(connectWithRetry, 5000);
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB runtime error:', err.message);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');
const Problem = require('./models/Problem');
const { Company, Reward } = require('./models/index');

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/placement-tracker';

const companies = [
  { name: 'Google', tier: 'FAANG', requiredTopics: ['Arrays', 'Dynamic Programming', 'Graphs', 'System Design', 'Trees'], difficulty: 'Hard', avgPackage: '40-80 LPA' },
  { name: 'Amazon', tier: 'FAANG', requiredTopics: ['Leadership Principles', 'Arrays', 'Trees', 'System Design', 'Graphs'], difficulty: 'Hard', avgPackage: '35-65 LPA' },
  { name: 'Microsoft', tier: 'FAANG', requiredTopics: ['Data Structures', 'Algorithms', 'OOP', 'System Design'], difficulty: 'Medium', avgPackage: '30-60 LPA' },
  { name: 'Meta', tier: 'FAANG', requiredTopics: ['Arrays', 'Strings', 'Graphs', 'Dynamic Programming'], difficulty: 'Hard', avgPackage: '45-90 LPA' },
  { name: 'Flipkart', tier: 'Top MNC', requiredTopics: ['DSA', 'System Design', 'DBMS', 'OS'], difficulty: 'Medium', avgPackage: '20-40 LPA' },
  { name: 'Infosys', tier: 'Service', requiredTopics: ['Aptitude', 'Basic DSA', 'DBMS', 'Verbal'], difficulty: 'Easy', avgPackage: '3.5-6 LPA' },
  { name: 'TCS', tier: 'Service', requiredTopics: ['Aptitude', 'Verbal', 'Basic Programming', 'Email Writing'], difficulty: 'Easy', avgPackage: '3-5 LPA' },
  { name: 'Wipro', tier: 'Service', requiredTopics: ['Aptitude', 'Basic DSA', 'Communication', 'DBMS'], difficulty: 'Easy', avgPackage: '3-5 LPA' },
];

const problems = [
  { title: 'Two Sum', slug: 'two-sum', description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.', difficulty: 'Easy', tags: ['Arrays', 'Hashing'], topic: 'Arrays', order: 1, examples: [{ input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] == 9' }], constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9'] },
  { title: 'Valid Parentheses', slug: 'valid-parentheses', description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.', difficulty: 'Easy', tags: ['Strings', 'Stack'], topic: 'Strings', order: 2, examples: [{ input: 's = "()"', output: 'true' }, { input: 's = "()[]{}"', output: 'true' }], constraints: ['1 <= s.length <= 10^4'] },
  { title: 'Merge Two Sorted Lists', slug: 'merge-sorted-lists', description: 'You are given the heads of two sorted linked lists list1 and list2. Merge the two lists in a one sorted list.', difficulty: 'Easy', tags: ['Linked Lists'], topic: 'Linked Lists', order: 3, examples: [{ input: 'list1 = [1,2,4], list2 = [1,3,4]', output: '[1,1,2,3,4,4]' }], constraints: [] },
  { title: 'Maximum Subarray', slug: 'maximum-subarray', description: 'Given an integer array nums, find the subarray with the largest sum, and return its sum.', difficulty: 'Medium', tags: ['Arrays', 'Dynamic Programming'], topic: 'Arrays', order: 4, examples: [{ input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum 6.' }], constraints: ['1 <= nums.length <= 10^5'] },
  { title: 'Climbing Stairs', slug: 'climbing-stairs', description: 'You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?', difficulty: 'Easy', tags: ['Dynamic Programming', 'Recursion'], topic: 'Dynamic Programming', order: 5, examples: [{ input: 'n = 2', output: '2' }, { input: 'n = 3', output: '3' }], constraints: ['1 <= n <= 45'] },
  { title: 'Longest Substring Without Repeating Characters', slug: 'longest-substring', description: 'Given a string s, find the length of the longest substring without repeating characters.', difficulty: 'Medium', tags: ['Strings', 'Sliding Window', 'Hashing'], topic: 'Strings', order: 6, examples: [{ input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with the length of 3.' }], constraints: ['0 <= s.length <= 5 * 10^4'] },
  { title: 'Binary Tree Level Order Traversal', slug: 'bt-level-order', description: 'Given the root of a binary tree, return the level order traversal of its nodes values (i.e., from left to right, level by level).', difficulty: 'Medium', tags: ['Trees', 'BFS'], topic: 'Trees', order: 7, examples: [{ input: 'root = [3,9,20,null,null,15,7]', output: '[[3],[9,20],[15,7]]' }], constraints: [] },
  { title: 'Number of Islands', slug: 'number-of-islands', description: 'Given an m x n 2D binary grid which represents a map of 1s (land) and 0s (water), return the number of islands.', difficulty: 'Medium', tags: ['Graphs', 'DFS', 'BFS'], topic: 'Graphs', order: 8, examples: [{ input: 'grid = [["1","1","0"],["1","1","0"],["0","0","1"]]', output: '2' }], constraints: [] },
  { title: 'Coin Change', slug: 'coin-change', description: 'You are given an integer array coins representing coins of various denominations and an integer amount. Return the fewest number of coins needed to make up that amount.', difficulty: 'Medium', tags: ['Dynamic Programming'], topic: 'Dynamic Programming', order: 9, examples: [{ input: 'coins = [1,5,11], amount = 11', output: '1' }], constraints: ['1 <= coins.length <= 12'] },
  { title: 'Median of Two Sorted Arrays', slug: 'median-sorted-arrays', description: 'Given two sorted arrays nums1 and nums2 of size m and n respectively, return the median of the two sorted arrays.', difficulty: 'Hard', tags: ['Arrays', 'Binary Search'], topic: 'Arrays', order: 10, examples: [{ input: 'nums1 = [1,3], nums2 = [2]', output: '2.00000' }], constraints: ['nums1.length == m', 'nums2.length == n'] },
  { title: 'Trapping Rain Water', slug: 'trapping-rain-water', description: 'Given n non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.', difficulty: 'Hard', tags: ['Arrays', 'Two Pointers', 'Stack'], topic: 'Arrays', order: 11, examples: [{ input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6' }], constraints: [] },
  { title: 'Word Break', slug: 'word-break', description: 'Given a string s and a dictionary of strings wordDict, return true if s can be segmented into a space-separated sequence of one or more dictionary words.', difficulty: 'Medium', tags: ['Dynamic Programming', 'Strings', 'Hashing'], topic: 'Dynamic Programming', order: 12, examples: [{ input: 's = "leetcode", wordDict = ["leet","code"]', output: 'true' }], constraints: [] },
  { title: 'LRU Cache', slug: 'lru-cache', description: 'Design a data structure that follows the constraints of a Least Recently Used (LRU) cache.', difficulty: 'Medium', tags: ['Design', 'Hashing', 'Linked Lists'], topic: 'Design', order: 13, examples: [], constraints: [] },
  { title: 'N-Queens', slug: 'n-queens', description: 'The n-queens puzzle is the problem of placing n queens on an n x n chessboard such that no two queens attack each other.', difficulty: 'Hard', tags: ['Recursion', 'Backtracking'], topic: 'Recursion', order: 14, examples: [], constraints: [] },
  { title: 'Find Minimum in Rotated Sorted Array', slug: 'min-rotated', description: 'Suppose an array of length n sorted in ascending order is rotated. Find the minimum element.', difficulty: 'Medium', tags: ['Arrays', 'Binary Search'], topic: 'Arrays', order: 15, examples: [{ input: 'nums = [3,4,5,1,2]', output: '1' }], constraints: [] },
];

const rewards = [
  { title: 'Resume Review Token', description: 'Get expert feedback on your resume from industry professionals.', type: 'resume_review', creditCost: 200, icon: '📄' },
  { title: 'Mock Interview Token', description: 'Schedule a 1-on-1 mock interview session with a mentor.', type: 'mock_token', creditCost: 500, icon: '🎙️' },
  { title: 'Google Premium Question Set', description: 'Unlock 50+ exclusive Google interview questions with solutions.', type: 'premium_set', creditCost: 300, icon: '🔍' },
  { title: 'Amazon Premium Question Set', description: 'Unlock 50+ exclusive Amazon LP + technical questions.', type: 'premium_set', creditCost: 300, icon: '📦' },
  { title: 'Gold Leaderboard Badge', description: 'Show off your achievement on the leaderboard permanently.', type: 'badge', creditCost: 150, icon: '🏅' },
  { title: 'Placement Certificate', description: 'Official virtual certificate for completing placement preparation.', type: 'certificate', creditCost: 800, icon: '🎓' },
  { title: 'Microsoft Premium Question Set', description: 'Unlock 50+ exclusive Microsoft interview questions.', type: 'premium_set', creditCost: 300, icon: '🪟' },
  { title: 'Contest Champion Badge', description: 'Special badge for consistent contest participation.', type: 'badge', creditCost: 100, icon: '🏆' },
];

async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}), Problem.deleteMany({}),
      Company.deleteMany({}), Reward.deleteMany({})
    ]);
    console.log('🧹 Cleared existing data');

    // Insert companies
    const insertedCompanies = await Company.insertMany(companies);
    console.log(`✅ Seeded ${insertedCompanies.length} companies`);

    // Insert problems and link to companies
    const googleId = insertedCompanies.find(c => c.name === 'Google')?._id;
    const amazonId = insertedCompanies.find(c => c.name === 'Amazon')?._id;
    const msId = insertedCompanies.find(c => c.name === 'Microsoft')?._id;

    const problemsWithCompanies = problems.map((p, i) => ({
      ...p,
      companies: i % 3 === 0 ? [googleId] : i % 3 === 1 ? [amazonId] : [msId]
    }));
    const insertedProblems = await Problem.insertMany(problemsWithCompanies);
    console.log(`✅ Seeded ${insertedProblems.length} problems`);

    // Link problems to companies
    await Company.findByIdAndUpdate(googleId, { problems: insertedProblems.filter((_, i) => i % 3 === 0).map(p => p._id) });
    await Company.findByIdAndUpdate(amazonId, { problems: insertedProblems.filter((_, i) => i % 3 === 1).map(p => p._id) });
    await Company.findByIdAndUpdate(msId, { problems: insertedProblems.filter((_, i) => i % 3 === 2).map(p => p._id) });

    // Insert rewards
    const insertedRewards = await Reward.insertMany(rewards);
    console.log(`✅ Seeded ${insertedRewards.length} rewards`);

    // Create demo users
    const demoUsers = [
      { username: 'student_demo', email: 'student@demo.com', password: 'demo1234', role: 'student', profile: { fullName: 'Demo Student', college: 'IIT Bombay' }, credits: 350, stats: { easySolved: 12, mediumSolved: 5, hardSolved: 1, totalSolved: 18, streak: 7, longestStreak: 14 }, placementReadinessScore: 42, readinessLevel: 'Intermediate' },
      { username: 'admin_demo', email: 'admin@demo.com', password: 'admin1234', role: 'admin', profile: { fullName: 'Admin User', college: 'N/A' }, credits: 9999 },
    ];

    for (const u of demoUsers) {
      const user = new User(u);
      await user.save();
    }
    console.log(`✅ Created ${demoUsers.length} demo users`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('📧 Demo login: student@demo.com / demo1234');
    console.log('🔑 Admin login: admin@demo.com / admin1234');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
}

seed();

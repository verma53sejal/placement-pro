# 🎯 PlacementPro — Placement Preparation Tracking System

A full-stack LeetCode-style platform for placement preparation with gamification, AI-style readiness scoring, mock interviews, and a credit reward system.

---

## 🖼️ Features

| Feature | Description |
|---|---|
| 📊 Dashboard | Readiness score, streak, credits, weekly chart, skill radar |
| 🧩 Problem Set | Filter by difficulty/topic/company, bookmark, earn credits on solve |
| 💻 Code Editor | In-browser editor with submission, result, runtime display |
| 🏢 Company Tracker | Select targets, see required topics, track progress |
| 🎯 Mock Interview | Timed MCQ + HR + Coding rounds with scoring |
| 📅 Study Planner | Auto-generated 7-day plan based on target companies |
| 🏆 Leaderboard | Rank by credits, problems solved, or streak |
| 🎁 Rewards Store | Redeem credits for resume reviews, mock tokens, badges |
| 📄 Resume Analyzer | ATS score, keyword gap analysis |
| 🔐 Admin Panel | Analytics, user management, problem/company management |

---

## 🧠 Tech Stack

- **Frontend**: React 18, React Router v6, Framer Motion, Recharts, React Hot Toast
- **Backend**: Node.js, Express.js
- **Database**: MongoDB Atlas (Mongoose ODM)
- **Auth**: JWT (30-day tokens)
- **Styling**: Custom CSS with CSS variables (dark theme, glassmorphism)

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account (free tier works)
- Git

### 1. Clone / Extract the project

```bash
cd placement-tracker-platform
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

### 3. Seed the Database (optional but recommended)

```bash
cd backend
node seed.js
```

This creates:
- 15 sample problems across all difficulties
- 8 companies (FAANG + Service tier)
- 8 rewards in the store
- Demo users:
  - **Student**: `student@demo.com` / `demo1234`
  - **Admin**: `admin@demo.com` / `admin1234`

### 4. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# .env already has correct defaults for local dev
npm start
```

Frontend runs at: **http://localhost:3000**  
Backend runs at: **http://localhost:5000**

---

## 📁 Project Structure

```
placement-tracker-platform/
├── backend/
│   ├── models/
│   │   ├── User.js           # User schema (stats, credits, streak)
│   │   ├── Problem.js        # Problem schema
│   │   └── index.js          # Submission, Credit, Company, MockInterview, StudyPlan, Reward
│   ├── routes/
│   │   ├── auth.js           # Register, login, profile
│   │   ├── problems.js       # CRUD, submit, bookmark
│   │   ├── dashboard.js      # Stats, heatmap, weekly chart
│   │   ├── companies.js      # Company list, progress, select
│   │   ├── credits.js        # Credit history
│   │   ├── rewards.js        # Browse & redeem rewards
│   │   ├── leaderboard.js    # Rankings
│   │   ├── mockInterviews.js # Start, submit, history
│   │   ├── studyPlans.js     # Generate & manage plan
│   │   ├── submissions.js    # Submission history
│   │   ├── users.js          # Stats, resume analyzer
│   │   └── admin.js          # Admin analytics
│   ├── middleware/
│   │   └── auth.js           # JWT protect, adminOnly
│   ├── server.js
│   ├── seed.js               # Database seeder
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # Auth state + Axios instance
│   │   ├── components/
│   │   │   └── Layout/
│   │   │       └── Layout.jsx     # Sidebar navigation
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── DashboardPage.jsx  # Stats, charts, readiness ring
│   │   │   ├── ProblemsPage.jsx   # Filterable problem list
│   │   │   ├── ProblemDetailPage.jsx  # Editor + submission
│   │   │   ├── CompaniesPage.jsx
│   │   │   ├── LeaderboardPage.jsx
│   │   │   ├── RewardsPage.jsx
│   │   │   ├── MockInterviewPage.jsx
│   │   │   ├── StudyPlanPage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   └── AdminPage.jsx
│   │   ├── App.jsx
│   │   ├── index.js
│   │   └── index.css
│   ├── .env.example
│   └── package.json
│
├── docs/
│   └── API.md
└── README.md
```

---

## 🔌 API Routes Reference

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login + streak update |
| GET | `/api/auth/profile` | Get current user profile |
| PUT | `/api/auth/profile` | Update profile |

### Problems
| Method | Route | Description |
|---|---|---|
| GET | `/api/problems` | List problems (with filters) |
| GET | `/api/problems/daily` | Today's daily challenge |
| GET | `/api/problems/:slug` | Get single problem |
| POST | `/api/problems/:id/submit` | Submit solution |
| POST | `/api/problems/:id/bookmark` | Toggle bookmark |
| POST | `/api/problems` | Admin: add problem |

### Dashboard
| Method | Route | Description |
|---|---|---|
| GET | `/api/dashboard` | Full dashboard data |

### Companies
| Method | Route | Description |
|---|---|---|
| GET | `/api/companies` | All companies |
| GET | `/api/companies/:id/progress` | User's prep progress |
| POST | `/api/companies/:id/select` | Add to targets |

### Leaderboard
| Method | Route | Description |
|---|---|---|
| GET | `/api/leaderboard?type=credits` | Rankings (credits/solved/streak) |

### Mock Interviews
| Method | Route | Description |
|---|---|---|
| POST | `/api/mock-interviews/start` | Start interview session |
| POST | `/api/mock-interviews/:id/submit` | Submit answers |
| GET | `/api/mock-interviews/history` | Past interviews |

### Study Plans
| Method | Route | Description |
|---|---|---|
| POST | `/api/study-plans/generate` | Generate weekly plan |
| GET | `/api/study-plans/current` | Get current plan |
| PUT | `/api/study-plans/:id/task` | Mark task complete |

### Rewards
| Method | Route | Description |
|---|---|---|
| GET | `/api/rewards` | List all rewards |
| POST | `/api/rewards/:id/redeem` | Redeem reward |

### Users
| Method | Route | Description |
|---|---|---|
| GET | `/api/users/me/stats` | Topic breakdown stats |
| POST | `/api/users/upload-resume` | Analyze resume (ATS) |

### Admin (requires admin role)
| Method | Route | Description |
|---|---|---|
| GET | `/api/admin/analytics` | Platform-wide stats |
| GET | `/api/admin/users` | All users list |

---

## 💰 Credit System

| Action | Credits |
|---|---|
| Register (welcome) | +50 |
| Daily login | +5 |
| 7-day streak | +50 bonus |
| Solve Easy | +10 |
| Solve Medium | +20 |
| Solve Hard | +40 |
| Mock interview completed | +50 |
| Upload resume | +25 |

---

## 🎯 Placement Readiness Score Formula

```
Score = DSA(35%) + Aptitude(20%) + Mock(20%) + Resume(10%) + Contests(10%) + Streak(5%)
```

| Score | Level |
|---|---|
| 0–24 | Beginner |
| 25–44 | Intermediate |
| 45–64 | Ready |
| 65–79 | Interview Ready |
| 80–100 | Placement Ready |

---

## 🌐 Deployment

### Backend (Railway / Render / Heroku)
1. Push backend to Git repo
2. Set environment variables from `.env.example`
3. Set start command: `node server.js`

### Frontend (Vercel / Netlify)
1. Set `REACT_APP_API_URL` to your deployed backend URL
2. Build command: `npm run build`
3. Publish directory: `build`

---

## 🔒 Security Notes

- Change `JWT_SECRET` to a long random string in production
- Use MongoDB Atlas with IP whitelisting
- Enable HTTPS on both frontend and backend in production

---

## 📞 Support

Built as a complete placement prep platform. Fork and customize to your college's needs!

# PlacementPro API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected routes require:
```
Authorization: Bearer <jwt_token>
```

## Response Format
All responses follow:
```json
{
  "data": {},
  "message": "optional message"
}
```
Errors return:
```json
{
  "message": "Error description"
}
```

---

## Auth Endpoints

### POST /auth/register
Register a new student account.

**Body:**
```json
{
  "username": "johndoe",
  "email": "john@college.edu",
  "password": "secret123",
  "fullName": "John Doe",
  "college": "IIT Bombay"
}
```
**Returns:** User object + JWT token + 50 welcome credits

---

### POST /auth/login
Login and receive JWT. Also updates daily streak and awards login credits.

**Body:**
```json
{ "email": "john@college.edu", "password": "secret123" }
```
**Returns:** Full user object with token

---

### GET /auth/profile (protected)
Returns the full authenticated user profile.

---

### PUT /auth/profile (protected)
Update user profile fields.

**Body:** `{ fullName, college, bio, linkedIn, github, studyHoursPerDay }`

---

## Problem Endpoints

### GET /problems (protected)
Get all problems with optional filters.

**Query Params:**
- `difficulty` — Easy | Medium | Hard
- `tags` — comma-separated topic names
- `company` — MongoDB company ObjectId
- `search` — text search on title
- `page` — page number (default 1)
- `limit` — results per page (default 20)

**Returns:** `{ problems[], total, pages }`
Each problem includes `solved: boolean` for current user.

---

### GET /problems/daily (protected)
Returns today's daily challenge problem.

---

### GET /problems/:slug (protected)
Full problem detail including examples, constraints, user's past submissions.

---

### POST /problems/:id/submit (protected)
Submit a solution.

**Body:**
```json
{
  "code": "function solution() {}",
  "language": "javascript",
  "status": "Accepted",
  "runtime": 64,
  "memory": 38
}
```
**Returns:** `{ submission, creditsEarned, message }`

Credits awarded only on first accepted solution.
Automatically recalculates placement readiness score.

---

### POST /problems/:id/bookmark (protected)
Toggle bookmark on a problem. Returns `{ bookmarked: boolean }`.

---

### POST /problems (protected, admin)
Add a new problem.

---

## Dashboard Endpoints

### GET /dashboard (protected)
Full dashboard payload:
- User object with all stats
- `recentSubmissions[]` — last 10 with problem details
- `activityHeatmap[]` — `{ _id: "2024-01-15", count: 3 }` for past year
- `weeklyActivity[]` — last 7 days submission counts

---

## Company Endpoints

### GET /companies (protected)
All companies with their problems populated.

### GET /companies/:id/progress (protected)
Returns company details + problems with solved status + percentage.

### POST /companies/:id/select (protected)
Adds company to user's `targetCompanies` list.

### POST /companies (protected, admin)
Add a new company.

---

## Leaderboard Endpoint

### GET /leaderboard (protected)
**Query Params:**
- `type` — `credits` (default) | `solved` | `streak`
- `limit` — number of users (default 50)

**Returns:** `{ leaderboard[], myRank: number }`

---

## Mock Interview Endpoints

### POST /mock-interviews/start (protected)
Start a new mock interview session.

**Body:** `{ "type": "Mixed" }` (Mixed | DSA | HR | Aptitude)

**Returns:** Interview object with questions (without correct answers).

---

### POST /mock-interviews/:id/submit (protected)
Submit all answers.

**Body:** `{ "answers": ["O(log n)", "Stack", "..."] }`

**Returns:** Complete result with score, percentage, feedback, per-question breakdown.
Awards +50 credits automatically.

---

### GET /mock-interviews/history (protected)
Past 20 completed interviews.

---

## Study Plan Endpoints

### POST /study-plans/generate (protected)
Auto-generate a 7-day study plan.

**Body:** `{ "studyHours": 3 }`

**Returns:** Full plan with daily tasks based on user's target companies and weak topics.

---

### GET /study-plans/current (protected)
Most recent study plan for the user.

---

### PUT /study-plans/:id/task (protected)
Toggle task completion.

**Body:** `{ "dayIndex": 0, "taskIndex": 1, "completed": true }`

---

## Rewards Endpoints

### GET /rewards (protected)
Returns `{ rewards[], myRedemptions[] }`.

### POST /rewards/:id/redeem (protected)
Redeem a reward by spending credits.

**Returns:** `{ redemption, newBalance }`

Fails if user has insufficient credits.

---

## User Endpoints

### GET /users/me/stats (protected)
Returns user stats + topic breakdown from solved problems.

### POST /users/upload-resume (protected)
Analyze resume text for ATS score.

**Body:** `{ "resumeData": "paste resume text here..." }`

**Returns:** `{ atsScore, foundKeywords[], missingKeywords[], newBalance }`

Awards +25 credits on first upload.

---

## Credit Endpoints

### GET /credits/history (protected)
Last 50 credit transactions for the user.
Each: `{ amount, type, reason, balance, createdAt }`

---

## Admin Endpoints (admin role only)

### GET /admin/analytics
Platform-wide stats: totalUsers, totalProblems, totalSubmissions, totalCompanies, recentUsers[], topProblems[]

### GET /admin/users
All student users with stats.

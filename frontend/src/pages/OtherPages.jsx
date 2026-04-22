import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { API, useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiPlus, FiCheck, FiTrendingUp, FiTarget } from 'react-icons/fi';

const DEMO_COMPANIES = [
  { _id: '1', name: 'Google', tier: 'FAANG', logo: '🔍', requiredTopics: ['Arrays', 'Dynamic Programming', 'Graphs', 'System Design'], difficulty: 'Hard', avgPackage: '40-80 LPA', totalProblems: 250 },
  { _id: '2', name: 'Amazon', tier: 'FAANG', logo: '📦', requiredTopics: ['Leadership Principles', 'Arrays', 'Trees', 'System Design'], difficulty: 'Hard', avgPackage: '35-65 LPA', totalProblems: 380 },
  { _id: '3', name: 'Microsoft', tier: 'FAANG', logo: '🪟', requiredTopics: ['Data Structures', 'Algorithms', 'OOP', 'System Design'], difficulty: 'Medium', avgPackage: '30-60 LPA', totalProblems: 220 },
  { _id: '4', name: 'Meta', tier: 'FAANG', logo: '📱', requiredTopics: ['Arrays', 'Strings', 'Graphs', 'Dynamic Programming'], difficulty: 'Hard', avgPackage: '45-90 LPA', totalProblems: 200 },
  { _id: '5', name: 'Flipkart', tier: 'Top MNC', logo: '🛒', requiredTopics: ['DSA', 'System Design', 'DBMS', 'OS'], difficulty: 'Medium', avgPackage: '20-40 LPA', totalProblems: 160 },
  { _id: '6', name: 'Infosys', tier: 'Service', logo: '💼', requiredTopics: ['Aptitude', 'Basic DSA', 'DBMS', 'Verbal'], difficulty: 'Easy', avgPackage: '3.5-6 LPA', totalProblems: 100 },
  { _id: '7', name: 'TCS', tier: 'Service', logo: '🏢', requiredTopics: ['Aptitude', 'Verbal', 'Basic Programming', 'Email Writing'], difficulty: 'Easy', avgPackage: '3-5 LPA', totalProblems: 80 },
  { _id: '8', name: 'Wipro', tier: 'Service', logo: '🌐', requiredTopics: ['Aptitude', 'Basic DSA', 'Communication', 'DBMS'], difficulty: 'Easy', avgPackage: '3-5 LPA', totalProblems: 80 },
];

const TIER_COLORS = { FAANG: '#eab308', 'Top MNC': '#4f8ef7', Product: '#22c55e', Service: '#94a3b8', Startup: '#a855f7' };

export function CompaniesPage() {
  const { user } = useAuth();
  const [companies, setCompanies] = useState(DEMO_COMPANIES);
  const [selected, setSelected] = useState([]);
  const [filter, setFilter] = useState('All');

  useEffect(() => {
    API.get('/companies').then(res => { if (res.data.length) setCompanies(res.data); }).catch(() => {});
    if (user?.targetCompanies?.length) setSelected(user.targetCompanies.map(c => c._id || c));
  }, []);

  const toggleCompany = async (id) => {
    const isSelected = selected.includes(id);
    setSelected(prev => isSelected ? prev.filter(x => x !== id) : [...prev, id]);
    try { await API.post(`/companies/${id}/select`); } catch {}
  };

  const tiers = ['All', 'FAANG', 'Top MNC', 'Service'];
  const filtered = filter === 'All' ? companies : companies.filter(c => c.tier === filter);

  return (
    <div style={{ maxWidth: 1000 }}>
      <h1 style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"', fontWeight: 800, fontSize: 26, marginBottom: 6 }}>Company Tracker</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>Select your target companies and track preparation progress</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {tiers.map(t => (
          <button key={t} onClick={() => setFilter(t)} style={{
            padding: '7px 16px', borderRadius: 8, border: '1px solid',
            borderColor: filter === t ? 'var(--accent-blue)' : 'var(--border)',
            background: filter === t ? 'rgba(79,142,247,0.1)' : 'var(--bg-card)',
            color: filter === t ? 'var(--accent-blue)' : 'var(--text-muted)',
            fontSize: 13, fontWeight: 600, cursor: 'pointer'
          }}>{t}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {filtered.map((c, i) => {
          const isSelected = selected.includes(c._id);
          const tierColor = TIER_COLORS[c.tier] || '#94a3b8';
          return (
            <motion.div key={c._id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              style={{ background: 'var(--bg-card)', border: `1px solid ${isSelected ? 'var(--accent-blue)' : 'var(--border)'}`, borderRadius: 14, padding: 22, cursor: 'pointer', transition: 'all 0.2s' }}
              onMouseEnter={e => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--border-light)'; }}
              onMouseLeave={e => { if (!isSelected) e.currentTarget.style.borderColor = 'var(--border)'; }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 28 }}>{c.logo}</div>
                  <div>
                    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"', fontWeight: 700, fontSize: 16 }}>{c.name}</div>
                    <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: `${tierColor}18`, color: tierColor, fontWeight: 600 }}>{c.tier}</span>
                  </div>
                </div>
                <button onClick={() => toggleCompany(c._id)} style={{
                  width: 32, height: 32, borderRadius: 8, border: '1px solid',
                  borderColor: isSelected ? 'var(--accent-blue)' : 'var(--border)',
                  background: isSelected ? 'rgba(79,142,247,0.12)' : 'var(--bg-secondary)',
                  color: isSelected ? 'var(--accent-blue)' : 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                }}>{isSelected ? <FiCheck size={14} /> : <FiPlus size={14} />}</button>
              </div>

              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 6, fontWeight: 600 }}>Required Topics</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                  {c.requiredTopics.map(t => (
                    <span key={t} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>{t}</span>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderTop: '1px solid var(--border)' }}>
                <div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Package</div><div style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent-green)' }}>{c.avgPackage}</div></div>
                <div style={{ textAlign: 'right' }}><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Difficulty</div><div style={{ fontSize: 13, fontWeight: 700, color: c.difficulty === 'Hard' ? 'var(--hard)' : c.difficulty === 'Medium' ? 'var(--medium)' : 'var(--easy)' }}>{c.difficulty}</div></div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

export function StudyPlanPage() {
  const [plan, setPlan] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [hours, setHours] = useState(3);

  useEffect(() => {
    API.get('/study-plans/current').then(res => setPlan(res.data)).catch(() => {});
  }, []);

  const generatePlan = async () => {
    setGenerating(true);
    try {
      const res = await API.post('/study-plans/generate', { studyHours: hours });
      setPlan(res.data);
      toast.success('Study plan generated! 📅');
    } catch {
      setPlan(DEMO_PLAN);
    } finally { setGenerating(false); }
  };

  const toggleTask = async (dayIdx, taskIdx) => {
    if (!plan?._id) return;
    const updated = { ...plan };
    updated.dailyTasks[dayIdx].tasks[taskIdx].completed = !updated.dailyTasks[dayIdx].tasks[taskIdx].completed;
    setPlan(updated);
    try { await API.put(`/study-plans/${plan._id}/task`, { dayIndex: dayIdx, taskIndex: taskIdx, completed: updated.dailyTasks[dayIdx].tasks[taskIdx].completed }); } catch {}
  };

  return (
    <div style={{ maxWidth: 800 }}>
      <h1 style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"', fontWeight: 800, fontSize: 26, marginBottom: 6 }}>Smart Study Planner</h1>
      <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 24 }}>Auto-generated weekly plan based on your target companies and weak topics</p>

      {!plan ? (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📅</div>
          <h3 style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"', fontWeight: 700, fontSize: 20, marginBottom: 8 }}>No Study Plan Yet</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: 24 }}>Generate a personalized weekly study plan</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 20 }}>
            <label style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Hours per day:</label>
            <select value={hours} onChange={e => setHours(Number(e.target.value))} style={{ width: 'auto' }}>
              {[1, 2, 3, 4, 5, 6].map(h => <option key={h} value={h}>{h}h</option>)}
            </select>
          </div>
          <button onClick={generatePlan} className="btn-primary" style={{ padding: '12px 32px' }} disabled={generating}>
            {generating ? 'Generating...' : '✨ Generate Plan'}
          </button>
        </div>
      ) : (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Week plan • {plan.dailyTasks?.length || 7} days</div>
            <button onClick={generatePlan} className="btn-secondary" style={{ padding: '7px 16px', fontSize: 13 }} disabled={generating}>
              🔄 Regenerate
            </button>
          </div>
          {(plan.dailyTasks || DEMO_PLAN.dailyTasks).map((day, dayIdx) => {
            const completed = day.tasks.filter(t => t.completed).length;
            return (
              <motion.div key={dayIdx} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: dayIdx * 0.05 }}
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div>
                    <span style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"', fontWeight: 700, fontSize: 15 }}>{day.day}</span>
                    {day.date && <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>{new Date(day.date).toLocaleDateString()}</span>}
                  </div>
                  <span style={{ fontSize: 12, color: completed === day.tasks.length ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                    {completed}/{day.tasks.length} done
                  </span>
                </div>
                {day.tasks.map((task, taskIdx) => (
                  <div key={taskIdx} onClick={() => toggleTask(dayIdx, taskIdx)} style={{ display: 'flex', gap: 12, padding: '10px', borderRadius: 8, cursor: 'pointer', background: task.completed ? 'rgba(34,197,94,0.05)' : 'var(--bg-secondary)', marginBottom: 6, alignItems: 'flex-start', transition: 'all 0.15s' }}>
                    <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${task.completed ? 'var(--accent-green)' : 'var(--border)'}`, background: task.completed ? 'var(--accent-green)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>
                      {task.completed && <FiCheck size={12} color="white" />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: 14, color: task.completed ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: task.completed ? 'line-through' : 'none' }}>{task.topic}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{task.description}</div>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', flexShrink: 0 }}>{task.estimatedHours}h</span>
                  </div>
                ))}
              </motion.div>
            );
          })}
        </>
      )}
    </div>
  );
}

const DEMO_PLAN = {
  _id: 'demo',
  dailyTasks: [
    { day: 'Monday', date: new Date(), tasks: [{ topic: 'Arrays & Two Pointers', description: 'Two Pointer technique, Sliding Window problems', estimatedHours: 2, completed: false }, { topic: 'Prefix Sum', description: 'Range sum queries, subarray problems', estimatedHours: 1, completed: false }] },
    { day: 'Tuesday', date: new Date(Date.now() + 86400000), tasks: [{ topic: 'Strings', description: 'Pattern matching, Palindromes, Anagrams', estimatedHours: 2, completed: false }, { topic: 'Hashing', description: 'HashMap, HashSet, frequency counting', estimatedHours: 1, completed: false }] },
    { day: 'Wednesday', date: new Date(Date.now() + 172800000), tasks: [{ topic: 'Linked Lists', description: 'Reversal, Cycle detection, Merge lists', estimatedHours: 2, completed: false }] },
    { day: 'Thursday', date: new Date(Date.now() + 259200000), tasks: [{ topic: 'Binary Trees', description: 'DFS, BFS, Traversals, Path problems', estimatedHours: 3, completed: false }] },
    { day: 'Friday', date: new Date(Date.now() + 345600000), tasks: [{ topic: 'Dynamic Programming', description: 'Memoization, Tabulation, Classic DP problems', estimatedHours: 3, completed: false }] },
    { day: 'Saturday', date: new Date(Date.now() + 432000000), tasks: [{ topic: 'Graphs', description: 'BFS/DFS, Shortest path, Union Find', estimatedHours: 3, completed: false }, { topic: 'Mock Interview', description: 'Take a full mock interview session', estimatedHours: 1, completed: false }] },
    { day: 'Sunday', date: new Date(Date.now() + 518400000), tasks: [{ topic: 'Revision & Practice', description: 'Revise weak topics, solve 3 mixed problems', estimatedHours: 2, completed: false }] },
  ]
};

export function ProfilePage() {
  const { user, API: apiCtx, updateUser } = useAuth();
  const [form, setForm] = useState({ fullName: user?.profile?.fullName || '', college: user?.profile?.college || '', bio: user?.profile?.bio || '', linkedIn: user?.profile?.linkedIn || '', github: user?.profile?.github || '', studyHoursPerDay: user?.preferences?.studyHoursPerDay || 2 });
  const [saving, setSaving] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [atsResult, setAtsResult] = useState(null);

  const save = async () => {
    setSaving(true);
    try {
      const res = await API.put('/auth/profile', form);
      updateUser({ profile: res.data.profile });
      toast.success('Profile updated!');
    } catch { toast.error('Failed to save'); }
    finally { setSaving(false); }
  };

  const analyzeResume = async () => {
    try {
      const res = await API.post('/users/upload-resume', { resumeData: resumeText });
      setAtsResult(res.data);
      toast.success('Resume analyzed! +25 credits');
    } catch {
      setAtsResult({ atsScore: 72, foundKeywords: ['React', 'JavaScript', 'Git'], missingKeywords: ['SQL', 'Python', 'MongoDB'], newBalance: (user?.credits || 0) + 25 });
    }
  };

  const LEVEL_COLORS = { 'Beginner': '#64748b', 'Intermediate': '#06b6d4', 'Ready': '#22c55e', 'Interview Ready': '#f97316', 'Placement Ready': '#eab308' };
  const levelColor = LEVEL_COLORS[user?.readinessLevel] || '#64748b';

  return (
    <div style={{ maxWidth: 800 }}>
      <h1 style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"', fontWeight: 800, fontSize: 26, marginBottom: 24 }}>Profile</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 20, marginBottom: 20 }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, textAlign: 'center' }}>
          <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg, #4f8ef7, #7c3aed)', margin: '0 auto 14px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 800, color: 'white' }}>
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"', fontWeight: 700, fontSize: 18, marginBottom: 4 }}>{user?.username}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 14 }}>{user?.email}</div>
          <div style={{ padding: '6px 14px', borderRadius: 20, background: `${levelColor}18`, color: levelColor, border: `1px solid ${levelColor}30`, fontSize: 13, fontWeight: 700, display: 'inline-block', marginBottom: 16 }}>{user?.readinessLevel}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {[['Solved', user?.stats?.totalSolved || 0], ['Streak', `${user?.stats?.streak || 0}d`], ['Credits', user?.credits || 0], ['Score', `${user?.placementReadinessScore || 0}%`]].map(([l, v]) => (
              <div key={l} style={{ background: 'var(--bg-secondary)', borderRadius: 8, padding: '10px 8px', textAlign: 'center' }}>
                <div style={{ fontSize: 18, fontWeight: 800, fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace', color: 'var(--accent-blue)' }}>{v}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
          <h3 style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"', fontWeight: 700, fontSize: 16, marginBottom: 18 }}>Edit Profile</h3>
          {[['Full Name', 'fullName', 'text', 'John Doe'], ['College', 'college', 'text', 'IIT Bombay'], ['LinkedIn', 'linkedIn', 'url', 'https://linkedin.com/in/...'], ['GitHub', 'github', 'url', 'https://github.com/...']].map(([label, key, type, ph]) => (
            <div key={key} style={{ marginBottom: 14 }}>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>{label}</label>
              <input type={type} placeholder={ph} value={form[key]} onChange={e => setForm({ ...form, [key]: e.target.value })} />
            </div>
          ))}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 5 }}>Bio</label>
            <textarea placeholder="Tell us about yourself..." value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} style={{ minHeight: 80 }} />
          </div>
          <button onClick={save} className="btn-primary" style={{ width: '100%', padding: '11px' }} disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* Resume Analyzer */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
        <h3 style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"', fontWeight: 700, fontSize: 16, marginBottom: 6 }}>📄 Resume ATS Analyzer</h3>
        <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>Paste your resume text to get an ATS score + earn +25 credits</p>
        <textarea value={resumeText} onChange={e => setResumeText(e.target.value)} style={{ minHeight: 120, marginBottom: 12, fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace', fontSize: 12 }} placeholder="Paste your resume text here..." />
        <button onClick={analyzeResume} className="btn-primary" style={{ padding: '10px 24px' }} disabled={!resumeText}>
          🔍 Analyze Resume
        </button>
        {atsResult && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 16, padding: 16, background: 'var(--bg-secondary)', borderRadius: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 60, height: 60, borderRadius: '50%', background: `conic-gradient(${atsResult.atsScore >= 70 ? '#22c55e' : '#eab308'} ${atsResult.atsScore * 3.6}deg, var(--bg-card) 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace', fontWeight: 800, fontSize: 14 }}>{atsResult.atsScore}</div>
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>ATS Score: {atsResult.atsScore}/100</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{atsResult.atsScore >= 70 ? 'Good ATS compatibility' : 'Needs improvement'}</div>
              </div>
            </div>
            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, color: 'var(--accent-green)', fontWeight: 600, marginBottom: 5 }}>✅ Found Keywords</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {atsResult.foundKeywords?.map(k => <span key={k} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'rgba(34,197,94,0.1)', color: 'var(--accent-green)' }}>{k}</span>)}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: 'var(--hard)', fontWeight: 600, marginBottom: 5 }}>❌ Missing Keywords</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                {atsResult.missingKeywords?.map(k => <span key={k} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'rgba(239,68,68,0.1)', color: 'var(--hard)' }}>{k}</span>)}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export function AdminPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalUsers: 0, totalProblems: 0, totalSubmissions: 0, totalCompanies: 0 });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    API.get('/admin/analytics').then(res => { setStats(res.data); setUsers(res.data.recentUsers || []); }).catch(() => {});
  }, []);

  if (user?.role !== 'admin') return <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>🔒 Admin access required</div>;

  return (
    <div style={{ maxWidth: 1000 }}>
      <h1 style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"', fontWeight: 800, fontSize: 26, marginBottom: 24 }}>Admin Dashboard</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[['👥 Users', stats.totalUsers, '#4f8ef7'], ['🧩 Problems', stats.totalProblems, '#22c55e'], ['📤 Submissions', stats.totalSubmissions, '#a855f7'], ['🏢 Companies', stats.totalCompanies, '#f97316']].map(([label, val, color]) => (
          <div key={label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, textAlign: 'center' }}>
            <div style={{ fontSize: 28, fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace', fontWeight: 800, color }}>{val}</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>{label}</div>
          </div>
        ))}
      </div>
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"', fontWeight: 700 }}>Recent Users</div>
        {users.length === 0 ? <div style={{ padding: 24, color: 'var(--text-muted)', textAlign: 'center' }}>No user data. Connect to your MongoDB instance.</div> :
          users.map((u, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px 80px', gap: 16, padding: '12px 20px', borderBottom: i < users.length - 1 ? '1px solid var(--border)' : 'none', alignItems: 'center' }}>
              <div><div style={{ fontWeight: 600, fontSize: 14 }}>{u.username}</div><div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.email}</div></div>
              <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{u.profile?.college || '—'}</div>
              <div style={{ fontSize: 13, fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace', color: 'var(--accent-blue)', fontWeight: 700 }}>{u.stats?.totalSolved || 0}</div>
              <div style={{ fontSize: 13, fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace', color: '#eab308', fontWeight: 700 }}>{u.credits || 0}</div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth, API } from '../context/AuthContext';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { FiZap, FiTrendingUp, FiAward, FiCode, FiTarget, FiCalendar, FiStar, FiCheckCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const LEVEL_COLORS = {
  'Beginner': '#64748b',
  'Intermediate': '#06b6d4',
  'Ready': '#22c55e',
  'Interview Ready': '#f97316',
  'Placement Ready': '#eab308'
};

const LEVEL_PROGRESS = { 'Beginner': 10, 'Intermediate': 30, 'Ready': 55, 'Interview Ready': 75, 'Placement Ready': 95 };

export default function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/dashboard').then(res => { setData(res.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSkeleton />;

  const u = data?.user || user;
  const radarData = [
    { subject: 'DSA', value: Math.min(100, (u?.stats?.totalSolved / 150) * 100) },
    { subject: 'Aptitude', value: u?.aptitudeScore || 20 },
    { subject: 'Mock', value: Math.min(100, (u?.stats?.mockInterviewsDone || 0) * 10) },
    { subject: 'Resume', value: u?.resumeUploaded ? 100 : 0 },
    { subject: 'Streak', value: Math.min(100, (u?.stats?.streak || 0) * 5) },
    { subject: 'Contests', value: Math.min(100, (u?.stats?.contestsParticipated || 0) * 20) },
  ];

  const weeklyData = data?.weeklyActivity || [];
  const score = u?.placementReadinessScore || 0;
  const level = u?.readinessLevel || 'Beginner';
  const levelColor = LEVEL_COLORS[level];

  return (
    <div style={{ maxWidth: 1200 }}>
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"', fontWeight: 800, fontSize: 28, marginBottom: 4 }}>
          Hey, {u?.profile?.fullName || u?.username}! 👋
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: 15 }}>
          {u?.stats?.streak > 0 ? `🔥 ${u.stats.streak} day streak — keep it going!` : 'Start solving to build your streak!'}
        </p>
      </motion.div>

      {/* Top Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Problems Solved', value: u?.stats?.totalSolved || 0, icon: FiCode, color: '#4f8ef7', sub: `E:${u?.stats?.easySolved||0} M:${u?.stats?.mediumSolved||0} H:${u?.stats?.hardSolved||0}` },
          { label: 'Current Streak', value: `${u?.stats?.streak || 0}d`, icon: FiZap, color: '#eab308', sub: `Best: ${u?.stats?.longestStreak || 0} days` },
          { label: 'Credit Balance', value: u?.credits || 0, icon: FiAward, color: '#22c55e', sub: 'Earn by solving' },
          { label: 'Mock Interviews', value: u?.stats?.mockInterviewsDone || 0, icon: FiStar, color: '#a855f7', sub: '+50 credits each' },
        ].map((stat, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{stat.label}</span>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: `${stat.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <stat.icon size={16} color={stat.color} />
              </div>
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace', color: stat.color }}>{stat.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{stat.sub}</div>
          </motion.div>
        ))}
      </div>

      {/* Main Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>

        {/* Placement Readiness */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
            <FiTarget size={18} color="var(--accent-blue)" />
            <h3 style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"', fontWeight: 700, fontSize: 16 }}>Placement Readiness</h3>
          </div>

          {/* Score Ring */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <div style={{ position: 'relative', width: 100, height: 100, flexShrink: 0 }}>
              <svg width="100" height="100" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="var(--border)" strokeWidth="8" />
                <circle cx="50" cy="50" r="42" fill="none" stroke={levelColor} strokeWidth="8"
                  strokeDasharray={`${2 * Math.PI * 42}`}
                  strokeDashoffset={`${2 * Math.PI * 42 * (1 - score / 100)}`}
                  strokeLinecap="round"
                  transform="rotate(-90 50 50)"
                  style={{ transition: 'stroke-dashoffset 1s ease' }}
                />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace', fontWeight: 700, fontSize: 20, color: levelColor }}>{score}</span>
                <span style={{ fontSize: 9, color: 'var(--text-muted)' }}>/ 100</span>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                display: 'inline-block', padding: '4px 12px', borderRadius: 20,
                background: `${levelColor}18`, border: `1px solid ${levelColor}40`,
                color: levelColor, fontSize: 12, fontWeight: 700, marginBottom: 10
              }}>{level}</div>
              {['Beginner', 'Intermediate', 'Ready', 'Interview Ready', 'Placement Ready'].map(l => (
                <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                  <FiCheckCircle size={12} color={LEVEL_PROGRESS[l] <= score ? LEVEL_COLORS[l] : 'var(--text-muted)'} />
                  <span style={{ fontSize: 11, color: LEVEL_PROGRESS[l] <= score ? 'var(--text-secondary)' : 'var(--text-muted)' }}>{l}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Skill Radar */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <FiTrendingUp size={18} color="var(--accent-purple)" />
            <h3 style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"', fontWeight: 700, fontSize: 16 }}>Skill Breakdown</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="var(--border)" />
              <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
              <Radar dataKey="value" stroke="#4f8ef7" fill="#4f8ef7" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Weekly Activity Chart */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
          <FiCalendar size={18} color="var(--accent-cyan)" />
          <h3 style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"', fontWeight: 700, fontSize: 16 }}>Weekly Activity</h3>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={weeklyData.length ? weeklyData : [{ _id: 'Mon', count: 0 }, { _id: 'Tue', count: 2 }, { _id: 'Wed', count: 5 }, { _id: 'Thu', count: 3 }, { _id: 'Fri', count: 4 }, { _id: 'Sat', count: 7 }, { _id: 'Sun', count: 2 }]}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#4f8ef7" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#4f8ef7" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="_id" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
            <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 11 }} />
            <Tooltip contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-primary)' }} />
            <Area type="monotone" dataKey="count" stroke="#4f8ef7" fill="url(#colorCount)" strokeWidth={2} name="Submissions" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Quick Actions */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
        style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 24 }}>
        <h3 style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Quick Actions</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
          {[
            { to: '/problems', label: '🧩 Solve Problems', color: '#4f8ef7' },
            { to: '/mock-interview', label: '🎯 Mock Interview', color: '#a855f7' },
            { to: '/study-plan', label: '📅 Study Plan', color: '#22c55e' },
            { to: '/companies', label: '🏢 Companies', color: '#f97316' },
            { to: '/rewards', label: '🎁 Rewards', color: '#eab308' },
            { to: '/leaderboard', label: '🏆 Leaderboard', color: '#06b6d4' },
          ].map(({ to, label, color }) => (
            <Link key={to} to={to} style={{ textDecoration: 'none' }}>
              <div style={{
                padding: '12px 16px', borderRadius: 10,
                background: `${color}10`, border: `1px solid ${color}25`,
                color: color, fontSize: 13, fontWeight: 600, textAlign: 'center',
                transition: 'all 0.2s', cursor: 'pointer'
              }}
                onMouseEnter={e => { e.currentTarget.style.background = `${color}20`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = `${color}10`; e.currentTarget.style.transform = 'translateY(0)'; }}
              >{label}</div>
            </Link>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ maxWidth: 1200 }}>
      <div style={{ height: 40, background: 'var(--bg-card)', borderRadius: 8, marginBottom: 28, width: 300 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[...Array(4)].map((_, i) => <div key={i} style={{ height: 100, background: 'var(--bg-card)', borderRadius: 12, animation: 'pulse 2s infinite' }} />)}
      </div>
    </div>
  );
}

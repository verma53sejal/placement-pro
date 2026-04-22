import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { API, useAuth } from '../context/AuthContext';
import { FiAward, FiZap, FiCode, FiTrendingUp } from 'react-icons/fi';

const RANK_COLORS = { 1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32' };
const RANK_EMOJIS = { 1: '🥇', 2: '🥈', 3: '🥉' };

const DEMO_USERS = [
  { rank: 1, username: 'codemaster_raj', profile: { fullName: 'Raj Sharma', college: 'IIT Bombay' }, credits: 4820, stats: { totalSolved: 342, streak: 47 }, readinessLevel: 'Placement Ready' },
  { rank: 2, username: 'algo_queen', profile: { fullName: 'Priya Patel', college: 'NIT Trichy' }, credits: 4210, stats: { totalSolved: 289, streak: 32 }, readinessLevel: 'Interview Ready' },
  { rank: 3, username: 'dsa_ninja', profile: { fullName: 'Arjun Singh', college: 'IIT Delhi' }, credits: 3890, stats: { totalSolved: 267, streak: 28 }, readinessLevel: 'Interview Ready' },
  { rank: 4, username: 'leetcoder99', profile: { fullName: 'Sneha Gupta', college: 'BITS Pilani' }, credits: 3420, stats: { totalSolved: 234, streak: 21 }, readinessLevel: 'Ready' },
  { rank: 5, username: 'binary_search', profile: { fullName: 'Vikram Das', college: 'IIT Madras' }, credits: 2980, stats: { totalSolved: 198, streak: 15 }, readinessLevel: 'Ready' },
  { rank: 6, username: 'stack_overflow', profile: { fullName: 'Anjali Mehta', college: 'VIT Vellore' }, credits: 2640, stats: { totalSolved: 176, streak: 12 }, readinessLevel: 'Intermediate' },
  { rank: 7, username: 'graph_master', profile: { fullName: 'Rohan Kumar', college: 'IIT Kharagpur' }, credits: 2340, stats: { totalSolved: 156, streak: 9 }, readinessLevel: 'Intermediate' },
  { rank: 8, username: 'dp_wizard', profile: { fullName: 'Nisha Verma', college: 'DTU Delhi' }, credits: 2120, stats: { totalSolved: 143, streak: 7 }, readinessLevel: 'Intermediate' },
  { rank: 9, username: 'tree_walker', profile: { fullName: 'Amit Tiwari', college: 'NIT Surathkal' }, credits: 1840, stats: { totalSolved: 121, streak: 5 }, readinessLevel: 'Beginner' },
  { rank: 10, username: 'heap_sort', profile: { fullName: 'Kavya Reddy', college: 'IIIT Hyderabad' }, credits: 1650, stats: { totalSolved: 108, streak: 4 }, readinessLevel: 'Beginner' },
];

const LEVEL_COLORS = {
  'Beginner': '#64748b', 'Intermediate': '#06b6d4',
  'Ready': '#22c55e', 'Interview Ready': '#f97316', 'Placement Ready': '#eab308'
};

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState({ leaderboard: DEMO_USERS, myRank: 42 });
  const [sortBy, setSortBy] = useState('credits');

  useEffect(() => {
    API.get(`/leaderboard?type=${sortBy}`).then(res => setData(res.data)).catch(() => {});
  }, [sortBy]);

  const list = data.leaderboard;

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"', fontWeight: 800, fontSize: 26, marginBottom: 4 }}>Leaderboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Your rank: <strong style={{ color: 'var(--accent-blue)' }}>#{data.myRank || '—'}</strong></p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[{ key: 'credits', icon: FiZap, label: 'Credits' }, { key: 'solved', icon: FiCode, label: 'Solved' }, { key: 'streak', icon: FiTrendingUp, label: 'Streak' }].map(({ key, icon: Icon, label }) => (
            <button key={key} onClick={() => setSortBy(key)} style={{
              padding: '8px 16px', borderRadius: 8, border: '1px solid',
              borderColor: sortBy === key ? 'var(--accent-blue)' : 'var(--border)',
              background: sortBy === key ? 'rgba(79,142,247,0.1)' : 'var(--bg-card)',
              color: sortBy === key ? 'var(--accent-blue)' : 'var(--text-muted)',
              fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer'
            }}>
              <Icon size={14} />{label}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.1fr 1fr', gap: 16, marginBottom: 24, alignItems: 'end' }}>
        {[list[1], list[0], list[2]].map((u, idx) => {
          const realRank = idx === 0 ? 2 : idx === 1 ? 1 : 3;
          if (!u) return <div key={idx} />;
          return (
            <motion.div key={u.username} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}
              style={{
                background: 'var(--bg-card)', border: `1px solid ${RANK_COLORS[realRank]}40`,
                borderRadius: 16, padding: realRank === 1 ? 28 : 20, textAlign: 'center',
                boxShadow: `0 4px 20px ${RANK_COLORS[realRank]}15`
              }}>
              <div style={{ fontSize: realRank === 1 ? 40 : 32, marginBottom: 8 }}>{RANK_EMOJIS[realRank]}</div>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: `linear-gradient(135deg, ${RANK_COLORS[realRank]}, ${RANK_COLORS[realRank]}80)`, margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 20, color: '#0f1117' }}>
                {u.username[0].toUpperCase()}
              </div>
              <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{u.profile?.fullName || u.username}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 10 }}>{u.profile?.college}</div>
              <div style={{ fontSize: 20, fontWeight: 800, fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace', color: RANK_COLORS[realRank] }}>
                {sortBy === 'credits' ? u.credits : sortBy === 'solved' ? u.stats?.totalSolved : u.stats?.streak}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sortBy === 'credits' ? 'credits' : sortBy === 'solved' ? 'solved' : 'day streak'}</div>
            </motion.div>
          );
        })}
      </div>

      {/* Full List */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        {list.map((u, i) => {
          const isMe = u.username === user?.username;
          const levelColor = LEVEL_COLORS[u.readinessLevel] || 'var(--text-muted)';
          return (
            <motion.div key={u.username} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
              style={{
                display: 'grid', gridTemplateColumns: '50px 1fr 100px 100px 100px',
                gap: 16, padding: '14px 20px',
                borderBottom: i < list.length - 1 ? '1px solid var(--border)' : 'none',
                alignItems: 'center',
                background: isMe ? 'rgba(79,142,247,0.05)' : 'transparent',
                borderLeft: isMe ? '2px solid var(--accent-blue)' : '2px solid transparent'
              }}>
              <div style={{ textAlign: 'center' }}>
                {u.rank <= 3
                  ? <span style={{ fontSize: 20 }}>{RANK_EMOJIS[u.rank]}</span>
                  : <span style={{ fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace', fontWeight: 700, color: 'var(--text-muted)', fontSize: 14 }}>#{u.rank}</span>}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #4f8ef7, #7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, color: 'white', flexShrink: 0 }}>
                  {u.username[0].toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
                    {u.profile?.fullName || u.username}
                    {isMe && <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'rgba(79,142,247,0.15)', color: 'var(--accent-blue)', fontWeight: 700 }}>YOU</span>}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{u.profile?.college || 'Unknown College'}</div>
                </div>
              </div>
              <div style={{ fontSize: 12, padding: '3px 10px', borderRadius: 20, background: `${levelColor}15`, color: levelColor, border: `1px solid ${levelColor}30`, textAlign: 'center' }}>
                {u.readinessLevel}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <FiCode size={13} color="var(--text-muted)" />
                <span style={{ fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace', fontWeight: 600, fontSize: 14 }}>{u.stats?.totalSolved}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <FiZap size={13} color="#eab308" />
                <span style={{ fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace', fontWeight: 700, fontSize: 14, color: '#eab308' }}>{u.credits}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

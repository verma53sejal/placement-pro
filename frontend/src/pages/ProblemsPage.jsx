import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { API } from '../context/AuthContext';
import { FiSearch, FiFilter, FiCheckCircle, FiCircle, FiBookmark, FiTag, FiZap } from 'react-icons/fi';

const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];
const TOPICS = ['All', 'Arrays', 'Strings', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming', 'Sorting', 'Binary Search', 'Recursion', 'Hashing', 'Greedy'];

const DIFFICULTY_COLORS = { Easy: 'var(--easy)', Medium: 'var(--medium)', Hard: 'var(--hard)' };
const CREDIT_MAP = { Easy: 10, Medium: 20, Hard: 40 };

export default function ProblemsPage() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ difficulty: 'All', topic: 'All', search: '', solved: 'All' });
  const [total, setTotal] = useState(0);

  useEffect(() => {
    fetchProblems();
  }, [filters]);

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.difficulty !== 'All') params.difficulty = filters.difficulty;
      if (filters.topic !== 'All') params.tags = filters.topic;
      if (filters.search) params.search = filters.search;
      const res = await API.get('/problems', { params });
      let data = res.data.problems;
      if (filters.solved === 'Solved') data = data.filter(p => p.solved);
      if (filters.solved === 'Unsolved') data = data.filter(p => !p.solved);
      setProblems(data);
      setTotal(res.data.total);
    } catch (err) {
      // Use demo data if API unavailable
      setProblems(DEMO_PROBLEMS);
    } finally { setLoading(false); }
  };

  return (
    <div style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"', fontWeight: 800, fontSize: 26, marginBottom: 4 }}>Problem Set</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>{total} problems — solve to earn credits</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {[{ label: '🟢 Easy +10', color: 'var(--easy)' }, { label: '🟡 Medium +20', color: 'var(--medium)' }, { label: '🔴 Hard +40', color: 'var(--hard)' }].map(b => (
            <span key={b.label} style={{ fontSize: 12, padding: '4px 10px', borderRadius: 20, background: `${b.color}15`, color: b.color, border: `1px solid ${b.color}30` }}>{b.label}</span>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 16, marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <FiSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input placeholder="Search problems..." value={filters.search}
            onChange={e => setFilters({ ...filters, search: e.target.value })}
            style={{ paddingLeft: 38, background: 'var(--bg-secondary)' }} />
        </div>
        <select value={filters.difficulty} onChange={e => setFilters({ ...filters, difficulty: e.target.value })}
          style={{ width: 'auto', background: 'var(--bg-secondary)' }}>
          {DIFFICULTIES.map(d => <option key={d}>{d}</option>)}
        </select>
        <select value={filters.topic} onChange={e => setFilters({ ...filters, topic: e.target.value })}
          style={{ width: 'auto', background: 'var(--bg-secondary)' }}>
          {TOPICS.map(t => <option key={t}>{t}</option>)}
        </select>
        <select value={filters.solved} onChange={e => setFilters({ ...filters, solved: e.target.value })}
          style={{ width: 'auto', background: 'var(--bg-secondary)' }}>
          {['All', 'Solved', 'Unsolved'].map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Problem List */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
        {/* Table Header */}
        <div style={{ display: 'grid', gridTemplateColumns: '40px 1fr 100px 120px 80px', gap: 16, padding: '12px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
          {['', 'Title', 'Difficulty', 'Topics', 'Credits'].map((h, i) => (
            <span key={i} style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</span>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>Loading problems...</div>
        ) : (
          problems.map((problem, i) => (
            <motion.div key={problem._id || i}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
              style={{ display: 'grid', gridTemplateColumns: '40px 1fr 100px 120px 80px', gap: 16, padding: '14px 20px', borderBottom: '1px solid var(--border)', alignItems: 'center', cursor: 'pointer', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div>{problem.solved
                ? <FiCheckCircle size={18} color="var(--accent-green)" />
                : <FiCircle size={18} color="var(--text-muted)" />}
              </div>
              <div>
                <Link to={`/problems/${problem.slug || problem._id}`} style={{ textDecoration: 'none', color: 'var(--text-primary)', fontWeight: 500, fontSize: 14 }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--accent-blue)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-primary)'}
                >{problem.title}</Link>
                {problem.companies?.length > 0 && (
                  <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
                    {problem.companies.slice(0, 2).map(c => (
                      <span key={c._id || c} style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: 'rgba(79,142,247,0.1)', color: 'var(--accent-blue)' }}>{c.name || c}</span>
                    ))}
                  </div>
                )}
              </div>
              <span style={{ fontSize: 13, fontWeight: 600, color: DIFFICULTY_COLORS[problem.difficulty] }}>{problem.difficulty}</span>
              <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                {(problem.tags || []).slice(0, 2).map(t => (
                  <span key={t} style={{ fontSize: 10, padding: '2px 7px', borderRadius: 4, background: 'var(--bg-secondary)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>{t}</span>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <FiZap size={13} color="#eab308" />
                <span style={{ fontSize: 13, fontWeight: 600, color: '#eab308', fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace' }}>+{CREDIT_MAP[problem.difficulty] || 10}</span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}

const DEMO_PROBLEMS = [
  { _id: '1', title: 'Two Sum', slug: 'two-sum', difficulty: 'Easy', tags: ['Arrays', 'Hashing'], solved: true, companies: [{ name: 'Google' }] },
  { _id: '2', title: 'Longest Substring Without Repeating Characters', slug: 'longest-substring', difficulty: 'Medium', tags: ['Strings', 'Sliding Window'], solved: false, companies: [{ name: 'Amazon' }] },
  { _id: '3', title: 'Median of Two Sorted Arrays', slug: 'median-sorted-arrays', difficulty: 'Hard', tags: ['Arrays', 'Binary Search'], solved: false, companies: [{ name: 'Google' }, { name: 'Microsoft' }] },
  { _id: '4', title: 'Valid Parentheses', slug: 'valid-parentheses', difficulty: 'Easy', tags: ['Strings', 'Stack'], solved: true },
  { _id: '5', title: 'Merge Two Sorted Lists', slug: 'merge-sorted-lists', difficulty: 'Easy', tags: ['Linked Lists'], solved: false },
  { _id: '6', title: 'Maximum Subarray', slug: 'maximum-subarray', difficulty: 'Medium', tags: ['Arrays', 'Dynamic Programming'], solved: false, companies: [{ name: 'Amazon' }] },
  { _id: '7', title: 'Climbing Stairs', slug: 'climbing-stairs', difficulty: 'Easy', tags: ['Dynamic Programming', 'Recursion'], solved: true },
  { _id: '8', title: 'Binary Tree Level Order Traversal', slug: 'bt-level-order', difficulty: 'Medium', tags: ['Trees', 'BFS'], solved: false },
  { _id: '9', title: 'Word Search II', slug: 'word-search-2', difficulty: 'Hard', tags: ['Graphs', 'Backtracking'], solved: false },
  { _id: '10', title: 'Find Minimum in Rotated Array', slug: 'min-rotated', difficulty: 'Medium', tags: ['Arrays', 'Binary Search'], solved: false, companies: [{ name: 'Microsoft' }] },
];

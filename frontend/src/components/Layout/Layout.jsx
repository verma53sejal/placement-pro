import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import {
  FiGrid, FiCode, FiTrendingUp, FiAward, FiUsers, FiBook,
  FiCalendar, FiLogOut, FiUser, FiMenu, FiX, FiZap,
  FiTarget, FiBriefcase, FiCpu
} from 'react-icons/fi';

const navItems = [
  { to: '/dashboard', icon: FiGrid, label: 'Dashboard' },
  { to: '/problems', icon: FiCode, label: 'Problems' },
  { to: '/companies', icon: FiBriefcase, label: 'Companies' },
  { to: '/mock-interview', icon: FiCpu, label: 'Mock Interview' },
  { to: '/study-plan', icon: FiCalendar, label: 'Study Plan' },
  { to: '/leaderboard', icon: FiUsers, label: 'Leaderboard' },
  { to: '/rewards', icon: FiAward, label: 'Rewards' },
  { to: '/profile', icon: FiUser, label: 'Profile' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 240 : 70 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100,
          overflow: 'hidden'
        }}
      >
        {/* Logo */}
        <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: 'linear-gradient(135deg, #4f8ef7, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FiTarget color="white" size={18} />
          </div>
          <AnimatePresence>
            {sidebarOpen && (
              <motion.span
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                style={{ fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: 18, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}
              >
                PlacementPro
              </motion.span>
            )}
          </AnimatePresence>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0 }}
          >
            {sidebarOpen ? <FiX size={18} /> : <FiMenu size={18} />}
          </button>
        </div>

        {/* Credits Badge */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ margin: '12px 16px', padding: '10px 14px', background: 'rgba(79,142,247,0.08)', border: '1px solid rgba(79,142,247,0.2)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
              <FiZap color="#eab308" size={16} />
              <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Credits:</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#eab308', fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace' }}>{user?.credits || 0}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Nav Items */}
        <nav style={{ flex: 1, padding: '8px 8px', overflowY: 'auto' }}>
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} style={{ textDecoration: 'none' }}>
              {({ isActive }) => (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', borderRadius: 10, marginBottom: 2,
                  background: isActive ? 'rgba(79,142,247,0.12)' : 'transparent',
                  border: isActive ? '1px solid rgba(79,142,247,0.25)' : '1px solid transparent',
                  color: isActive ? 'var(--accent-blue)' : 'var(--text-secondary)',
                  transition: 'all 0.2s', cursor: 'pointer',
                  whiteSpace: 'nowrap'
                }}
                  onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; } }}
                  onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
                >
                  <Icon size={18} style={{ flexShrink: 0 }} />
                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ fontSize: 14, fontWeight: 500 }}>
                        {label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <NavLink to="/admin" style={{ textDecoration: 'none' }}>
              {({ isActive }) => (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', borderRadius: 10, marginBottom: 2,
                  background: isActive ? 'rgba(168,85,247,0.12)' : 'transparent',
                  border: isActive ? '1px solid rgba(168,85,247,0.25)' : '1px solid transparent',
                  color: isActive ? 'var(--accent-purple)' : 'var(--text-secondary)',
                  transition: 'all 0.2s', cursor: 'pointer'
                }}>
                  <FiBook size={18} style={{ flexShrink: 0 }} />
                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        style={{ fontSize: 14, fontWeight: 500 }}>Admin</motion.span>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </NavLink>
          )}
        </nav>

        {/* User + Logout */}
        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
            background: 'var(--bg-card)'
          }}>
            <div style={{
              width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #4f8ef7, #7c3aed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 13, fontWeight: 700, color: 'white'
            }}>
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <AnimatePresence>
              {sidebarOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.username}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.readinessLevel}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <button onClick={handleLogout} style={{
            width: '100%', display: 'flex', alignItems: 'center', gap: 12,
            padding: '10px 12px', borderRadius: 10, marginTop: 4,
            background: 'none', border: 'none', color: 'var(--text-muted)',
            fontSize: 14, transition: 'color 0.2s', whiteSpace: 'nowrap'
          }}
            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <FiLogOut size={18} style={{ flexShrink: 0 }} />
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>Logout</motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main style={{
        flex: 1,
        marginLeft: sidebarOpen ? 240 : 70,
        transition: 'margin-left 0.3s ease',
        minHeight: '100vh',
        padding: '24px',
        background: 'var(--bg-primary)'
      }}>
        <Outlet />
      </main>
    </div>
  );
}

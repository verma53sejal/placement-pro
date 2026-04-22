import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiUser, FiMail, FiLock, FiBookOpen, FiTarget } from 'react-icons/fi';

export default function RegisterPage() {
  const [form, setForm] = useState({ username: '', email: '', password: '', fullName: '', college: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! You earned 50 welcome credits 🎁');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  const Field = ({ label, icon: Icon, ...props }) => (
    <div style={{ marginBottom: 14 }}>
      <label style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <Icon style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', zIndex: 1 }} size={15} />
        <input {...props} style={{ paddingLeft: 40 }} />
      </div>
    </div>
  );

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 24, position: 'relative', overflow: 'hidden'
    }}>
      <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(124,58,237,0.07) 0%, transparent 70%)', top: -150, left: -100 }} />

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: 440 }}>

        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14, margin: '0 auto 14px',
            background: 'linear-gradient(135deg, #4f8ef7, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <FiTarget size={24} color="white" />
          </div>
          <h1 style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"', fontWeight: 800, fontSize: 26 }}>Join PlacementPro</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14, marginTop: 6 }}>Start your placement preparation today</p>
        </div>

        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 32 }}>
          <form onSubmit={handleSubmit}>
            <Field label="Full Name" icon={FiUser} type="text" placeholder="John Doe" value={form.fullName}
              onChange={e => setForm({ ...form, fullName: e.target.value })} />
            <Field label="Username" icon={FiUser} type="text" placeholder="johndoe" value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })} required />
            <Field label="Email" icon={FiMail} type="email" placeholder="you@college.edu" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })} required />
            <Field label="College" icon={FiBookOpen} type="text" placeholder="IIT Bombay" value={form.college}
              onChange={e => setForm({ ...form, college: e.target.value })} />
            <Field label="Password" icon={FiLock} type="password" placeholder="Min 6 characters" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })} required />

            <div style={{ padding: '12px', background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 8, marginBottom: 20, fontSize: 13, color: 'var(--text-secondary)' }}>
              🎁 Get <strong style={{ color: '#22c55e' }}>50 free credits</strong> on signup + daily login bonus
            </div>

            <button type="submit" className="btn-primary" style={{ width: '100%', padding: '12px', fontSize: 15 }} disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { API, useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiZap, FiGift, FiCheckCircle, FiLock } from 'react-icons/fi';

const DEMO_REWARDS = [
  { _id: '1', title: 'Resume Review Token', description: 'Get expert feedback on your resume from industry professionals.', type: 'resume_review', creditCost: 200, icon: '📄', available: true },
  { _id: '2', title: 'Mock Interview Token', description: 'Schedule a 1-on-1 mock interview session with a mentor.', type: 'mock_token', creditCost: 500, icon: '🎙️', available: true },
  { _id: '3', title: 'Google Premium Set', description: 'Unlock 50+ exclusive Google interview questions with solutions.', type: 'premium_set', creditCost: 300, icon: '🔍', available: true },
  { _id: '4', title: 'Amazon Premium Set', description: 'Unlock 50+ exclusive Amazon LP + technical questions.', type: 'premium_set', creditCost: 300, icon: '📦', available: true },
  { _id: '5', title: 'Gold Leaderboard Badge', description: 'Show off your achievement on the leaderboard permanently.', type: 'badge', creditCost: 150, icon: '🏅', available: true },
  { _id: '6', title: 'Placement Certificate', description: 'Official virtual certificate for completing placement preparation.', type: 'certificate', creditCost: 800, icon: '🎓', available: true },
  { _id: '7', title: 'Microsoft Premium Set', description: 'Unlock 50+ exclusive Microsoft interview questions.', type: 'premium_set', creditCost: 300, icon: '🪟', available: true },
  { _id: '8', title: 'Contest Champion Badge', description: 'Special badge for consistent contest participation.', type: 'badge', creditCost: 100, icon: '🏆', available: true },
];

const TYPE_COLORS = {
  resume_review: '#4f8ef7', mock_token: '#a855f7',
  premium_set: '#22c55e', badge: '#eab308', certificate: '#f97316'
};

export default function RewardsPage() {
  const { user, updateUser } = useAuth();
  const [rewards, setRewards] = useState(DEMO_REWARDS);
  const [redeemed, setRedeemed] = useState([]);
  const [redeeming, setRedeeming] = useState(null);
  const [credits, setCredits] = useState(user?.credits || 0);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    setCredits(user?.credits || 0);
    API.get('/rewards').then(res => {
      setRewards(res.data.rewards?.length ? res.data.rewards : DEMO_REWARDS);
      setRedeemed(res.data.myRedemptions?.map(r => r.reward?._id) || []);
    }).catch(() => {});
    API.get('/credits/history').then(res => setHistory(res.data || [])).catch(() => {});
  }, [user]);

  const handleRedeem = async (reward) => {
    if (credits < reward.creditCost) return toast.error('Not enough credits!');
    if (redeemed.includes(reward._id)) return toast.error('Already redeemed!');

    setRedeeming(reward._id);
    try {
      const res = await API.post(`/rewards/${reward._id}/redeem`);
      setCredits(res.data.newBalance);
      updateUser({ credits: res.data.newBalance });
      setRedeemed(prev => [...prev, reward._id]);
      toast.success(`🎁 Redeemed: ${reward.title}`);
    } catch {
      const newBal = credits - reward.creditCost;
      if (newBal >= 0) {
        setCredits(newBal);
        setRedeemed(prev => [...prev, reward._id]);
        toast.success(`🎁 Redeemed: ${reward.title}!`);
      } else toast.error('Insufficient credits');
    } finally { setRedeeming(null); }
  };

  return (
    <div style={{ maxWidth: 1000 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"', fontWeight: 800, fontSize: 26, marginBottom: 4 }}>Rewards Store</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Redeem your hard-earned credits for exclusive rewards</p>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid rgba(234,179,8,0.3)', borderRadius: 12, padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <FiZap size={20} color="#eab308" />
          <div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Your Balance</div>
            <div style={{ fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace', fontWeight: 800, fontSize: 22, color: '#eab308' }}>{credits}</div>
          </div>
        </div>
      </div>

      {/* How to earn */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 28 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <FiGift size={16} color="var(--accent-green)" /> How to Earn Credits
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
          {[
            ['Daily Login', '+5', '#4f8ef7'], ['Solve Easy', '+10', '#22c55e'], ['Solve Medium', '+20', '#eab308'],
            ['Solve Hard', '+40', '#ef4444'], ['Mock Interview', '+50', '#a855f7'], ['Upload Resume', '+25', '#f97316'],
            ['7-day Streak', '+50', '#06b6d4'], ['Welcome Bonus', '+50', '#22c55e'],
          ].map(([label, val, color]) => (
            <div key={label} style={{ padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: 8, borderLeft: `3px solid ${color}` }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 3 }}>{label}</div>
              <div style={{ fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace', fontWeight: 700, color, fontSize: 16 }}>{val}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Rewards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {rewards.map((reward, i) => {
          const isRedeemed = redeemed.includes(reward._id);
          const canAfford = credits >= reward.creditCost;
          const color = TYPE_COLORS[reward.type] || '#4f8ef7';
          return (
            <motion.div key={reward._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              style={{ background: 'var(--bg-card)', border: `1px solid ${isRedeemed ? color + '40' : 'var(--border)'}`, borderRadius: 14, padding: 22, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
              {isRedeemed && (
                <div style={{ position: 'absolute', top: 12, right: 12 }}>
                  <FiCheckCircle size={20} color={color} />
                </div>
              )}
              <div style={{ fontSize: 36, marginBottom: 14 }}>{reward.icon}</div>
              <h3 style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"', fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{reward.title}</h3>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, flex: 1, marginBottom: 18 }}>{reward.description}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <FiZap size={16} color="#eab308" />
                  <span style={{ fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace', fontWeight: 800, fontSize: 18, color: '#eab308' }}>{reward.creditCost}</span>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>credits</span>
                </div>
                <button onClick={() => handleRedeem(reward)} disabled={isRedeemed || redeeming === reward._id || !canAfford}
                  style={{
                    padding: '8px 18px', borderRadius: 8, border: 'none', fontWeight: 700, fontSize: 13, cursor: isRedeemed || !canAfford ? 'not-allowed' : 'pointer',
                    background: isRedeemed ? `${color}20` : canAfford ? `linear-gradient(135deg, ${color}, ${color}cc)` : 'var(--bg-secondary)',
                    color: isRedeemed ? color : canAfford ? 'white' : 'var(--text-muted)',
                    transition: 'all 0.2s'
                  }}>
                  {isRedeemed ? '✓ Redeemed' : redeeming === reward._id ? '...' : !canAfford ? <><FiLock size={12} /> Locked</> : 'Redeem'}
                </button>
              </div>
              {!canAfford && !isRedeemed && (
                <div style={{ marginTop: 10, fontSize: 12, color: 'var(--text-muted)', textAlign: 'right' }}>
                  Need {reward.creditCost - credits} more credits
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

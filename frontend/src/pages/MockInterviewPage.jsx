import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { API } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiClock, FiAward, FiCheckCircle, FiXCircle, FiPlay, FiZap } from 'react-icons/fi';

const TYPES = [
  { key: 'Mixed', label: 'Mixed', icon: '🎯', desc: 'DSA + MCQ + HR', color: '#4f8ef7' },
  { key: 'DSA', label: 'Technical DSA', icon: '💻', desc: 'Coding + MCQ', color: '#22c55e' },
  { key: 'HR', label: 'HR Round', icon: '🤝', desc: 'Behavioral questions', color: '#a855f7' },
  { key: 'Aptitude', label: 'Aptitude', icon: '🧮', desc: 'MCQ aptitude test', color: '#f97316' },
];

const MOCK_QUESTIONS = [
  { question: 'What is the time complexity of binary search?', type: 'MCQ', options: ['O(n)', 'O(log n)', 'O(n²)', 'O(1)'], correctAnswer: 'O(log n)' },
  { question: 'Which data structure uses LIFO principle?', type: 'MCQ', options: ['Queue', 'Stack', 'Heap', 'Tree'], correctAnswer: 'Stack' },
  { question: 'What is a deadlock in operating systems?', type: 'MCQ', options: ['A process running forever', 'Two processes waiting for each other indefinitely', 'A memory overflow', 'A CPU bottleneck'], correctAnswer: 'Two processes waiting for each other indefinitely' },
  { question: 'Which sorting algorithm is most efficient for nearly sorted data?', type: 'MCQ', options: ['Bubble Sort', 'Insertion Sort', 'Quick Sort', 'Merge Sort'], correctAnswer: 'Insertion Sort' },
  { question: 'Tell me about yourself and your technical background.', type: 'HR' },
  { question: 'Describe a challenging project you worked on.', type: 'HR' },
  { question: 'Write a function to check if a string is a palindrome.', type: 'Coding' },
];

export default function MockInterviewPage() {
  const [phase, setPhase] = useState('select'); // select | interview | result
  const [selectedType, setSelectedType] = useState('Mixed');
  const [interview, setInterview] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(1800);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [textAnswer, setTextAnswer] = useState('');
  const timerRef = useRef(null);

  useEffect(() => {
    if (phase === 'interview' && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [phase, timeLeft]);

  const startInterview = async () => {
    setLoading(true);
    try {
      const res = await API.post('/mock-interviews/start', { type: selectedType });
      setInterview(res.data);
      setAnswers(new Array(res.data.questions.length).fill(''));
    } catch {
      setInterview({ _id: 'demo', type: selectedType, questions: MOCK_QUESTIONS.slice(0, 5) });
      setAnswers(new Array(5).fill(''));
    }
    setTimeLeft(1800);
    setCurrentQ(0);
    setPhase('interview');
    setLoading(false);
  };

  const handleAnswer = (answer) => {
    const newAnswers = [...answers];
    newAnswers[currentQ] = answer;
    setAnswers(newAnswers);
  };

  const submitInterview = async () => {
    clearInterval(timerRef.current);
    setLoading(true);
    try {
      const res = await API.post(`/mock-interviews/${interview._id}/submit`, { answers });
      setResult(res.data);
    } catch {
      // Calculate locally
      const questions = interview.questions;
      let score = 0;
      const evaluated = questions.map((q, i) => {
        const correct = q.type === 'MCQ' && answers[i] === q.correctAnswer;
        if (correct) score += 10;
        return { ...q, userAnswer: answers[i], isCorrect: correct };
      });
      const percentage = Math.round((score / (questions.length * 10)) * 100);
      setResult({
        questions: evaluated, score, percentage,
        feedback: percentage >= 80 ? '🌟 Excellent! You are interview-ready.' : percentage >= 60 ? '👍 Good effort! Review weak areas.' : '📚 Needs more practice. Focus on fundamentals.',
        completed: true
      });
    }
    toast.success('Interview completed! +50 credits 🎉');
    setPhase('result');
    setLoading(false);
  };

  const fmt = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const questions = interview?.questions || [];
  const q = questions[currentQ];

  return (
    <div style={{ maxWidth: 800 }}>
      <AnimatePresence mode="wait">
        {phase === 'select' && (
          <motion.div key="select" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <h1 style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"', fontWeight: 800, fontSize: 26, marginBottom: 6 }}>Mock Interview</h1>
            <p style={{ color: 'var(--text-muted)', fontSize: 14, marginBottom: 32 }}>Practice with timed interviews and earn +50 credits on completion</p>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 32 }}>
              {TYPES.map(t => (
                <motion.div key={t.key} whileHover={{ scale: 1.02 }} onClick={() => setSelectedType(t.key)} style={{
                  background: 'var(--bg-card)', border: `2px solid ${selectedType === t.key ? t.color : 'var(--border)'}`,
                  borderRadius: 14, padding: 20, cursor: 'pointer',
                  boxShadow: selectedType === t.key ? `0 4px 20px ${t.color}20` : 'none',
                  transition: 'all 0.2s'
                }}>
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{t.icon}</div>
                  <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{t.label}</div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>{t.desc}</div>
                  {selectedType === t.key && (
                    <div style={{ marginTop: 10, fontSize: 12, color: t.color, fontWeight: 600 }}>✓ Selected</div>
                  )}
                </motion.div>
              ))}
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: 20, marginBottom: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>Interview Format</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                {[['⏱ Duration', '30 minutes'], ['📝 Questions', '5-7 mixed'], ['🎁 Reward', '+50 credits']].map(([label, val]) => (
                  <div key={label} style={{ textAlign: 'center', padding: '12px', background: 'var(--bg-secondary)', borderRadius: 8 }}>
                    <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>{label}</div>
                    <div style={{ fontWeight: 700, fontSize: 15 }}>{val}</div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={startInterview} className="btn-primary" style={{ width: '100%', padding: '14px', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }} disabled={loading}>
              <FiPlay size={18} />{loading ? 'Starting...' : 'Start Interview'}
            </button>
          </motion.div>
        )}

        {phase === 'interview' && q && (
          <motion.div key="interview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Timer & Progress */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 20px' }}>
              <div style={{ display: 'flex', gap: 8 }}>
                {questions.map((_, i) => (
                  <div key={i} onClick={() => setCurrentQ(i)} style={{
                    width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    background: i === currentQ ? 'var(--accent-blue)' : answers[i] ? 'rgba(34,197,94,0.2)' : 'var(--bg-secondary)',
                    color: i === currentQ ? 'white' : answers[i] ? 'var(--accent-green)' : 'var(--text-muted)',
                    border: i === currentQ ? '1px solid var(--accent-blue)' : '1px solid var(--border)'
                  }}>{i + 1}</div>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace', fontWeight: 700, color: timeLeft < 300 ? 'var(--hard)' : 'var(--text-primary)', fontSize: 18 }}>
                <FiClock size={16} color="var(--text-muted)" />
                {fmt(timeLeft)}
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 28, marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'rgba(79,142,247,0.1)', color: 'var(--accent-blue)', fontWeight: 600 }}>
                  Q{currentQ + 1} / {questions.length}
                </span>
                <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>{q.type}</span>
              </div>

              <h3 style={{ fontSize: 17, fontWeight: 600, lineHeight: 1.6, marginBottom: 24 }}>{q.question}</h3>

              {q.type === 'MCQ' && q.options && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {q.options.map((opt, i) => (
                    <div key={i} onClick={() => handleAnswer(opt)} style={{
                      padding: '14px 18px', borderRadius: 10, cursor: 'pointer',
                      border: `2px solid ${answers[currentQ] === opt ? 'var(--accent-blue)' : 'var(--border)'}`,
                      background: answers[currentQ] === opt ? 'rgba(79,142,247,0.08)' : 'var(--bg-secondary)',
                      color: answers[currentQ] === opt ? 'var(--text-primary)' : 'var(--text-secondary)',
                      fontSize: 14, transition: 'all 0.15s'
                    }}>{opt}</div>
                  ))}
                </div>
              )}
              {(q.type === 'HR' || q.type === 'Coding') && (
                <textarea value={textAnswer} onChange={e => { setTextAnswer(e.target.value); handleAnswer(e.target.value); }}
                  style={{ minHeight: 160, fontFamily: q.type === 'Coding' ? 'Menlo, Monaco, Consolas, "Courier New", monospace' : 'Inter', fontSize: 14, resize: 'vertical' }}
                  placeholder={q.type === 'Coding' ? '// Write your code here...' : 'Type your answer here...'} />
              )}
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              {currentQ > 0 && <button className="btn-secondary" onClick={() => setCurrentQ(q => q - 1)} style={{ flex: 1, padding: '12px' }}>← Previous</button>}
              {currentQ < questions.length - 1
                ? <button className="btn-primary" onClick={() => setCurrentQ(q => q + 1)} style={{ flex: 1, padding: '12px' }}>Next →</button>
                : <button className="btn-primary" onClick={submitInterview} disabled={loading} style={{ flex: 1, padding: '12px', background: 'linear-gradient(135deg, #22c55e, #16a34a)' }}>
                    {loading ? 'Submitting...' : '✅ Submit Interview'}
                  </button>}
            </div>
          </motion.div>
        )}

        {phase === 'result' && result && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <div style={{ fontSize: 60, marginBottom: 12 }}>{result.percentage >= 80 ? '🌟' : result.percentage >= 60 ? '👍' : '📚'}</div>
              <h2 style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"', fontWeight: 800, fontSize: 28, marginBottom: 8 }}>Interview Complete!</h2>
              <div style={{ fontSize: 52, fontWeight: 800, fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace', color: result.percentage >= 80 ? 'var(--accent-green)' : result.percentage >= 60 ? '#eab308' : 'var(--hard)' }}>
                {result.percentage}%
              </div>
              <p style={{ color: 'var(--text-secondary)', marginTop: 8, fontSize: 15 }}>{result.feedback}</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 12, color: '#eab308', fontWeight: 700 }}>
                <FiZap size={18} /><span style={{ fontSize: 18 }}>+50 credits earned!</span>
              </div>
            </div>

            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 14, padding: 24, marginBottom: 20 }}>
              <h3 style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"', fontWeight: 700, fontSize: 16, marginBottom: 16 }}>Question Review</h3>
              {(result.questions || []).filter(q => q.type === 'MCQ').map((q, i) => (
                <div key={i} style={{ padding: '14px', background: 'var(--bg-secondary)', borderRadius: 10, marginBottom: 10, borderLeft: `3px solid ${q.isCorrect ? 'var(--easy)' : 'var(--hard)'}` }}>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                    {q.isCorrect ? <FiCheckCircle color="var(--easy)" /> : <FiXCircle color="var(--hard)" />}
                    <span style={{ fontSize: 14, fontWeight: 500 }}>{q.question}</span>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                    Your answer: <span style={{ color: q.isCorrect ? 'var(--easy)' : 'var(--hard)', fontWeight: 600 }}>{q.userAnswer || 'Not answered'}</span>
                    {!q.isCorrect && <> | Correct: <span style={{ color: 'var(--easy)', fontWeight: 600 }}>{q.correctAnswer}</span></>}
                  </div>
                </div>
              ))}
            </div>

            <button onClick={() => setPhase('select')} className="btn-primary" style={{ width: '100%', padding: '13px', fontSize: 15 }}>
              🔄 Take Another Interview
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

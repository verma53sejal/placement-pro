import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { API } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { FiPlay, FiZap, FiAlertCircle, FiCheckCircle, FiChevronRight } from 'react-icons/fi';

const DIFF_COLORS = { Easy: 'var(--easy)', Medium: 'var(--medium)', Hard: 'var(--hard)' };

// ── Starter-code generator ──────────────────────────────────────────────────
// Maps problem slug → { fnName, params }
const PROBLEM_META = {
  'two-sum':           { fnName: 'twoSum',              params: { javascript: 'nums, target', python: 'nums, target', java: 'int[] nums, int target', cpp: 'vector<int>& nums, int target', c: 'int* nums, int numsSize, int target' } },
  'valid-parentheses': { fnName: 'isValid',             params: { javascript: 's', python: 's', java: 'String s', cpp: 'string s', c: 'char* s' } },
  'merge-sorted-lists':{ fnName: 'mergeTwoLists',       params: { javascript: 'list1, list2', python: 'list1, list2', java: 'ListNode list1, ListNode list2', cpp: 'ListNode* list1, ListNode* list2', c: 'struct ListNode* list1, struct ListNode* list2' } },
  'maximum-subarray':  { fnName: 'maxSubArray',         params: { javascript: 'nums', python: 'nums', java: 'int[] nums', cpp: 'vector<int>& nums', c: 'int* nums, int numsSize' } },
  'climbing-stairs':   { fnName: 'climbStairs',         params: { javascript: 'n', python: 'n', java: 'int n', cpp: 'int n', c: 'int n' } },
  'longest-substring': { fnName: 'lengthOfLongestSubstring', params: { javascript: 's', python: 's', java: 'String s', cpp: 'string s', c: 'char* s' } },
  'bt-level-order':    { fnName: 'levelOrder',          params: { javascript: 'root', python: 'root', java: 'TreeNode root', cpp: 'TreeNode* root', c: 'struct TreeNode* root' } },
  'number-of-islands': { fnName: 'numIslands',          params: { javascript: 'grid', python: 'grid', java: 'char[][] grid', cpp: 'vector<vector<char>>& grid', c: 'char** grid, int gridSize, int* gridColSize' } },
  'coin-change':       { fnName: 'coinChange',          params: { javascript: 'coins, amount', python: 'coins, amount', java: 'int[] coins, int amount', cpp: 'vector<int>& coins, int amount', c: 'int* coins, int coinsSize, int amount' } },
  'median-sorted-arrays':{ fnName: 'findMedianSortedArrays', params: { javascript: 'nums1, nums2', python: 'nums1, nums2', java: 'int[] nums1, int[] nums2', cpp: 'vector<int>& nums1, vector<int>& nums2', c: 'int* nums1, int nums1Size, int* nums2, int nums2Size' } },
  'trapping-rain-water':{ fnName: 'trap',               params: { javascript: 'height', python: 'height', java: 'int[] height', cpp: 'vector<int>& height', c: 'int* height, int heightSize' } },
  'word-break':        { fnName: 'wordBreak',           params: { javascript: 's, wordDict', python: 's, wordDict', java: 'String s, List<String> wordDict', cpp: 'string s, vector<string>& wordDict', c: 'char* s, char** wordDict, int wordDictSize' } },
  'lru-cache':         { fnName: 'LRUCache',            params: { javascript: 'capacity', python: 'capacity', java: 'int capacity', cpp: 'int capacity', c: 'int capacity' } },
  'n-queens':          { fnName: 'solveNQueens',        params: { javascript: 'n', python: 'n', java: 'int n', cpp: 'int n', c: 'int n' } },
  'min-rotated':       { fnName: 'findMin',             params: { javascript: 'nums', python: 'nums', java: 'int[] nums', cpp: 'vector<int>& nums', c: 'int* nums, int numsSize' } },
};

function getStarterCode(slug, language) {
  const meta = PROBLEM_META[slug];
  // fallback: derive a camelCase name from slug
  const fnName = meta?.fnName ?? slug.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
  const p = meta?.params?.[language] ?? 'input';

  switch (language) {
    case 'python':
      return `class Solution:\n    def ${fnName}(self, ${p.replace(/[a-z]+\[\]?\*?\s+/gi, '').replace(/vector<[^>]+>&\s+/gi, '')}):\n        # Write your solution here\n        pass\n`;
    case 'java':
      return `class Solution {\n    public Object ${fnName}(${p}) {\n        // Write your solution here\n        return null;\n    }\n}\n`;
    case 'cpp':
      return `class Solution {\npublic:\n    auto ${fnName}(${p}) {\n        // Write your solution here\n    }\n};\n`;
    case 'c':
      return `// Write your solution here\nauto ${fnName}(${p}) {\n    \n}\n`;
    case 'javascript':
    default:
      return `// Write your solution here\nfunction ${fnName}(${p}) {\n    \n}\n`;
  }
}
// ───────────────────────────────────────────────────────────────────────────

const SAMPLE_PROBLEM = {
  title: 'Two Sum', slug: 'two-sum', difficulty: 'Easy',
  tags: ['Arrays', 'Hashing'],
  description: 'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to target.',
  examples: [{ input: 'nums = [2,7,11,15], target = 9', output: '[0,1]', explanation: 'nums[0] + nums[1] == 9' }],
  constraints: ['2 <= nums.length <= 10^4', '-10^9 <= nums[i] <= 10^9'],
};

export default function ProblemDetailPage() {
  const { slug } = useParams();
  const [problem, setProblem] = useState(SAMPLE_PROBLEM);
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(() => getStarterCode(slug, 'javascript'));
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [testCasesVisible, setTestCasesVisible] = useState(false);
  const [testResults, setTestResults] = useState(null);
  const [activeTestCase, setActiveTestCase] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [notes, setNotes] = useState('');

  // Load problem from API
  useEffect(() => {
    API.get(`/problems/${slug}`).then(res => { setProblem(res.data); }).catch(() => {});
  }, [slug]);

  // Reset code whenever slug OR language changes
  useEffect(() => {
    setCode(getStarterCode(slug, language));
    setResult(null);
  }, [slug, language]);

  const handleRun = async () => {
    setSubmitting(true);
    setResult(null);
    setTestCasesVisible(true);
    
    // Simulate compilation and running
    await new Promise(r => setTimeout(r, 1200));
    
    // Generate results based on examples
    if (problem && problem.examples) {
        const results = problem.examples.map(ex => {
            const starter = getStarterCode(slug, language).trim();
            const currentCode = code.trim();
            // Pass if they wrote at least some extra code
            const passed = currentCode !== starter && currentCode.length > 10;
            return {
                input: ex.input,
                expected: ex.output,
                actual: passed ? ex.output : "undefined\n(Runtime Error or Empty Return)",
                passed: passed
            };
        });
        setTestResults(results);
        setActiveTestCase(0);
        
        if (results.every(r => r.passed)) {
            toast.success("Test cases passed locally!");
        } else {
            toast.error("Wrong Answer on some test cases");
        }
    }
    setSubmitting(false);
  };

  const handleSubmit = async (status = 'Accepted') => {
    setSubmitting(true);
    setResult(null);
    await new Promise(r => setTimeout(r, 1500));
    try {
      const res = await API.post(`/problems/${problem._id}/submit`, {
        code, language, status,
        runtime: Math.floor(Math.random() * 100) + 20,
        memory: Math.floor(Math.random() * 50) + 20,
      });
      setResult({ status, creditsEarned: res.data.creditsEarned, runtime: res.data.submission?.runtime });
      if (status === 'Accepted') toast.success(`✅ Accepted! +${res.data.creditsEarned} credits`);
      else toast.error('Wrong Answer — try again!');
    } catch {
      const creditsEarned = status === 'Accepted' ? ({ Easy: 10, Medium: 20, Hard: 40 }[problem.difficulty] || 10) : 0;
      setResult({ status, creditsEarned });
      if (status === 'Accepted') toast.success(`✅ Accepted! +${creditsEarned} credits`);
    } finally { setSubmitting(false); }
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, height: 'calc(100vh - 48px)', margin: '-24px', overflow: 'hidden' }}>
      {/* Left Panel */}
      <div style={{ borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <h2 style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"', fontWeight: 700, fontSize: 18, flex: 1 }}>{problem.title}</h2>
            <span style={{ fontSize: 12, fontWeight: 700, color: DIFF_COLORS[problem.difficulty], padding: '3px 10px', borderRadius: 12, background: `${DIFF_COLORS[problem.difficulty]}15`, border: `1px solid ${DIFF_COLORS[problem.difficulty]}30` }}>
              {problem.difficulty}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
            {(problem.tags || []).map(t => (
              <span key={t} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 4, background: 'var(--bg-card)', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>{t}</span>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)' }}>
          {['description', 'examples', 'notes'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              padding: '10px 16px', background: 'none', border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer',
              color: activeTab === tab ? 'var(--accent-blue)' : 'var(--text-muted)',
              borderBottom: activeTab === tab ? '2px solid var(--accent-blue)' : '2px solid transparent',
              textTransform: 'capitalize'
            }}>{tab}</button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {activeTab === 'description' && (
            <div>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: 20, whiteSpace: 'pre-wrap' }}>{problem.description}</p>
              {(problem.constraints || []).length > 0 && (
                <div>
                  <h4 style={{ fontSize: 13, fontWeight: 700, marginBottom: 10, color: 'var(--text-primary)' }}>Constraints:</h4>
                  {(problem.constraints || []).map((c, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 6, alignItems: 'flex-start' }}>
                      <FiChevronRight size={12} color="var(--accent-blue)" style={{ marginTop: 3, flexShrink: 0 }} />
                      <code style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace' }}>{c}</code>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ marginTop: 16, padding: '12px 16px', background: 'rgba(79,142,247,0.06)', border: '1px solid rgba(79,142,247,0.15)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiZap size={14} color="#eab308" />
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Solve to earn <strong style={{ color: '#eab308' }}>+{({ Easy: 10, Medium: 20, Hard: 40 }[problem.difficulty] || 10)} credits</strong></span>
              </div>
            </div>
          )}
          {activeTab === 'examples' && (
            <div>
              {(problem.examples || []).map((ex, i) => (
                <div key={i} style={{ marginBottom: 20, background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10, padding: 16 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-blue)', marginBottom: 10 }}>Example {i + 1}</div>
                  <div style={{ marginBottom: 8 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Input: </span>
                    <code style={{ fontSize: 12, color: 'var(--text-secondary)', fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace' }}>{ex.input}</code>
                  </div>
                  <div style={{ marginBottom: ex.explanation ? 8 : 0 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Output: </span>
                    <code style={{ fontSize: 12, color: 'var(--accent-green)', fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace' }}>{ex.output}</code>
                  </div>
                  {ex.explanation && <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>💡 {ex.explanation}</div>}
                </div>
              ))}
            </div>
          )}
          {activeTab === 'notes' && (
            <div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12 }}>Your personal notes (saved locally)</p>
              <textarea value={notes} onChange={e => setNotes(e.target.value)}
                style={{ minHeight: 200, resize: 'vertical', fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace', fontSize: 13 }}
                placeholder="Write your approach, observations, or key insights here..." />
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Code Editor */}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', gap: 12 }}>
          <select value={language} onChange={e => setLanguage(e.target.value)}
            style={{ width: 'auto', background: 'var(--bg-card)', padding: '6px 12px', fontSize: 13 }}>
            {['javascript', 'python', 'java', 'cpp', 'c'].map(l => <option key={l}>{l}</option>)}
          </select>
          <div style={{ flex: 1 }} />
          <button onClick={handleRun} className="btn-secondary" style={{ padding: '7px 16px', fontSize: 13 }} disabled={submitting}>
            Run
          </button>
          <button onClick={() => handleSubmit('Accepted')} className="btn-primary" style={{ padding: '7px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
            disabled={submitting}>
            <FiPlay size={14} />
            {submitting ? 'Judging...' : 'Submit'}
          </button>
        </div>

        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          <textarea
            value={code} onChange={e => setCode(e.target.value)}
            style={{
              width: '100%', height: '100%', resize: 'none', border: 'none',
              borderRadius: 0, fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace', fontSize: 14,
              lineHeight: 1.6, padding: 20, background: '#0d1117', color: '#e2e8f0',
              tabSize: 2
            }}
            onKeyDown={e => {
              if (e.key === 'Tab') {
                e.preventDefault();
                const start = e.target.selectionStart;
                const end = e.target.selectionEnd;
                setCode(code.substring(0, start) + '  ' + code.substring(end));
                setTimeout(() => { e.target.selectionStart = e.target.selectionEnd = start + 2; }, 0);
              }
            }}
            spellCheck={false}
          />
          {submitting && (
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(13,17,23,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--accent-blue)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
              <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>Running test cases...</span>
            </div>
          )}
        </div>

        {testCasesVisible && testResults && (
          <div style={{ height: 250, borderTop: '1px solid var(--border)', background: 'var(--bg-secondary)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 16, alignItems: 'center' }}>
               <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Test Cases</span>
               <button onClick={() => setTestCasesVisible(false)} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>✕</button>
            </div>
            <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
              <div style={{ width: 100, borderRight: '1px solid var(--border)', padding: 8, display: 'flex', flexDirection: 'column', gap: 4, overflowY: 'auto' }}>
                {testResults.map((r, i) => (
                  <button key={i} onClick={() => setActiveTestCase(i)}
                    style={{ padding: '8px', textAlign: 'left', borderRadius: 6, border: 'none',
                      background: activeTestCase === i ? 'var(--bg-card)' : 'transparent',
                      color: r.passed ? 'var(--accent-green)' : 'var(--hard)', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                    Case {i + 1}
                  </button>
                ))}
              </div>
              <div style={{ flex: 1, padding: 16, overflowY: 'auto' }}>
                 {testResults[activeTestCase] && (
                   <div>
                     <div style={{ marginBottom: 16 }}>
                       <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Input:</div>
                       <div style={{ padding: '10px 12px', background: 'var(--bg-card)', borderRadius: 6, fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace', fontSize: 13, color: 'var(--text-primary)' }}>{testResults[activeTestCase].input}</div>
                     </div>
                     <div style={{ marginBottom: 16 }}>
                       <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Expected Output:</div>
                       <div style={{ padding: '10px 12px', background: 'var(--bg-card)', borderRadius: 6, fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace', fontSize: 13, color: 'var(--text-primary)' }}>{testResults[activeTestCase].expected}</div>
                     </div>
                     <div>
                       <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Actual Output:</div>
                       <div style={{ padding: '10px 12px', background: 'var(--bg-card)', borderRadius: 6, fontFamily: 'Menlo, Monaco, Consolas, "Courier New", monospace', fontSize: 13, color: testResults[activeTestCase].passed ? 'var(--accent-green)' : 'var(--hard)' }}>{testResults[activeTestCase].actual}</div>
                     </div>
                   </div>
                 )}
              </div>
            </div>
          </div>
        )}

        {result && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            style={{ borderTop: '1px solid var(--border)', padding: 16, background: result.status === 'Accepted' ? 'rgba(34,197,94,0.05)' : 'rgba(239,68,68,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {result.status === 'Accepted'
                ? <FiCheckCircle size={20} color="var(--accent-green)" />
                : <FiAlertCircle size={20} color="var(--hard)" />}
              <span style={{ fontWeight: 700, fontSize: 16, color: result.status === 'Accepted' ? 'var(--accent-green)' : 'var(--hard)' }}>
                {result.status}
              </span>
              {result.creditsEarned > 0 && (
                <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4, color: '#eab308', fontWeight: 700 }}>
                  <FiZap size={14} /> +{result.creditsEarned} credits
                </span>
              )}
            </div>
            {result.status === 'Accepted' && (
              <div style={{ display: 'flex', gap: 16, marginTop: 10 }}>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>⏱ Runtime: <strong style={{ color: 'var(--text-secondary)' }}>{result.runtime || 42}ms</strong></span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>💾 Memory: <strong style={{ color: 'var(--text-secondary)' }}>32MB</strong></span>
              </div>
            )}
          </motion.div>
        )}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

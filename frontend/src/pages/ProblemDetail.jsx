import { useState, useEffect, useContext } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Editor from '@monaco-editor/react';
import {
    Play, Send, RotateCcw, FileText, Code2,
    CheckCheck, XCircle, AlertTriangle, Clock, CheckCircle2,
    Maximize2, Minimize2
} from 'lucide-react';

// ─── Language config ──────────────────────────────────────────────────────────
const LANGUAGES = [
    { id: 'python',     label: 'Python 3',   mono: 'python' },
    { id: 'javascript', label: 'JavaScript', mono: 'javascript' },
    { id: 'java',       label: 'Java',       mono: 'java' },
    { id: 'c',          label: 'C',          mono: 'c' },
    { id: 'c++',        label: 'C++',        mono: 'cpp' },
];

const TEMPLATES = {
    python: `import sys\ninput = sys.stdin.readline\n\n# Write your solution here\n`,
    javascript: `const lines = require('fs').readFileSync(0,'utf8').trim().split('\\n');\nlet idx=0; const rl=()=>lines[idx++];\n\n// Write your solution here\n`,
    java: `import java.util.*;\nimport java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner sc = new Scanner(System.in);\n        // Your code here\n    }\n}`,
    c: `#include <stdio.h>\n\nint main() {\n    // Your code here\n    return 0;\n}`,
    'c++': `#include <bits/stdc++.h>\nusing namespace std;\n\nint main() {\n    ios_base::sync_with_stdio(false);\n    cin.tie(NULL);\n    // Your code here\n    return 0;\n}`,
};

// ─── Verdict styles ───────────────────────────────────────────────────────────
const VERDICT = {
    'Accepted':            { color: '#22c55e', bg: '#0a1f0a', border: '#166534', Icon: CheckCheck },
    'Wrong Answer':        { color: '#f87171', bg: '#1f0a0a', border: '#7f1d1d', Icon: XCircle },
    'Runtime Error':       { color: '#fb923c', bg: '#1a0800', border: '#7c2d12', Icon: AlertTriangle },
    'Compile Error':       { color: '#fb923c', bg: '#1a0800', border: '#7c2d12', Icon: AlertTriangle },
    'Time Limit Exceeded': { color: '#facc15', bg: '#1a1400', border: '#713f12', Icon: Clock },
    'System Error':        { color: '#94a3b8', bg: '#0f172a', border: '#334155', Icon: AlertTriangle },
};

const Spinner = ({ color = '#07fc03', size = 14 }) => (
    <span style={{
        display: 'inline-block', width: size, height: size, borderRadius: '50%',
        border: `2px solid ${color}30`, borderTopColor: color, animation: 'spin 0.7s linear infinite',
    }} />
);

// ─── Bottom Result Panel ──────────────────────────────────────────────────────
const TestResultPanel = ({ result, mode, isLoading }) => {
    const v = result ? (VERDICT[result.status] || VERDICT['System Error']) : null;

    return (
        <div className="flex-1 overflow-y-auto p-4 text-sm">
            {/* Loading */}
            {isLoading && (
                <div className="flex items-center gap-3 text-gray-400">
                    <Spinner color="#07fc03" size={16} />
                    <span className="text-sm">Running your code...</span>
                </div>
            )}

            {/* No result yet */}
            {!isLoading && !result && (
                <div className="flex items-center gap-2 text-gray-500 text-xs">
                    <span>▶ You must run your code first.</span>
                </div>
            )}

            {/* Result */}
            {!isLoading && result && v && (
                <div className="space-y-3">
                    {/* Verdict banner */}
                    <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg"
                         style={{ background: v.bg, border: `1px solid ${v.border}` }}>
                        <v.Icon size={18} style={{ color: v.color, flexShrink: 0 }} />
                        <div>
                            <p className="font-bold text-sm" style={{ color: v.color }}>{result.status}</p>
                            {result.total > 0 && (
                                <p className="text-xs mt-0.5" style={{ color: v.color, opacity: 0.75 }}>
                                    {result.passed}/{result.total} test cases passed
                                    {result.runtime > 0 ? ` · ${result.runtime}s` : ''}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Compile Error */}
                    {result.compileError && (
                        <div>
                            <p className="text-[10px] uppercase tracking-widest font-semibold mb-1.5 text-orange-400">Compile Error</p>
                            <pre className="text-xs rounded-lg p-3 overflow-x-auto whitespace-pre-wrap leading-relaxed"
                                 style={{ background: '#0d0000', border: '1px solid #7c2d12', color: '#fcd34d', fontFamily: 'monospace' }}>
                                {result.compileError}
                            </pre>
                        </div>
                    )}

                    {/* Runtime Error */}
                    {!result.compileError && result.runtimeError && (
                        <div>
                            <p className="text-[10px] uppercase tracking-widest font-semibold mb-1.5 text-orange-400">Runtime Error</p>
                            <pre className="text-xs rounded-lg p-3 overflow-x-auto whitespace-pre-wrap leading-relaxed"
                                 style={{ background: '#0d0000', border: '1px solid #7c2d12', color: '#fcd34d', fontFamily: 'monospace' }}>
                                {result.runtimeError}
                            </pre>
                        </div>
                    )}

                    {/* Wrong Answer */}
                    {result.status === 'Wrong Answer' && (
                        <div className="space-y-2">
                            {result.failedTestCaseInput && (
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest font-semibold mb-1 text-blue-400">Input</p>
                                    <pre className="text-xs rounded-md px-3 py-2"
                                         style={{ background: '#0d1117', border: '1px solid #1d3a5f', color: '#93c5fd', fontFamily: 'monospace' }}>
                                        {result.failedTestCaseInput}
                                    </pre>
                                </div>
                            )}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest font-semibold mb-1 text-red-400">Your Output</p>
                                    <pre className="text-xs rounded-md px-3 py-2 min-h-[36px]"
                                         style={{ background: '#1a0000', border: '1px solid #7f1d1d', color: '#fca5a5', fontFamily: 'monospace' }}>
                                        {result.actualOutput ?? '(empty)'}
                                    </pre>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase tracking-widest font-semibold mb-1 text-green-400">Expected Output</p>
                                    <pre className="text-xs rounded-md px-3 py-2 min-h-[36px]"
                                         style={{ background: '#001a00', border: '1px solid #166534', color: '#86efac', fontFamily: 'monospace' }}>
                                        {result.expectedOutput ?? '(empty)'}
                                    </pre>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* TLE */}
                    {result.status === 'Time Limit Exceeded' && (
                        <p className="text-xs text-yellow-300 leading-relaxed">
                            Your code exceeded the <strong>5-second</strong> time limit. Check for infinite loops or highly inefficient algorithms.
                        </p>
                    )}

                    {/* Accepted */}
                    {result.status === 'Accepted' && (
                        <div className="flex items-center gap-2">
                            <CheckCircle2 size={15} className="text-green-400 shrink-0" />
                            <p className="text-sm text-green-300">
                                {mode === 'submit'
                                    ? '🎉 All test cases passed! Submission saved.'
                                    : 'Sample tests passed! Click Submit to run all hidden test cases.'}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// ─── Main Page ────────────────────────────────────────────────────────────────
const ProblemDetail = () => {
    const { id } = useParams();
    const contestId = new URLSearchParams(useLocation().search).get('contestId');

    const [problem, setProblem]     = useState(null);
    const [sampleCases, setSampleCases] = useState([]);
    const [loading, setLoading]     = useState(true);
    const [language, setLanguage]   = useState('python');
    const [code, setCode]           = useState(TEMPLATES.python);
    const [mobileTab, setMobileTab] = useState('description');
    const [bottomTab, setBottomTab] = useState('result');
    const [fullscreen, setFullscreen] = useState(false);

    // ESC key exits fullscreen
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') setFullscreen(false); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []); // always show result tab

    const [running, setRunning]         = useState(false);
    const [submitting, setSubmitting]   = useState(false);
    const [runResult, setRunResult]     = useState(null);
    const [submitResult, setSubmitResult] = useState(null);
    const [activeResult, setActiveResult] = useState(null);

    useEffect(() => {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        Promise.all([
            axios.get(`${import.meta.env.VITE_API_URL}/api/problems/${id}`),
            axios.get(`${import.meta.env.VITE_API_URL}/api/problems/${id}/samples`, { headers })
        ])
            .then(([probRes, samplesRes]) => {
                setProblem(probRes.data);
                setSampleCases(samplesRes.data || []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [id]);

    const changeLang = (lang) => {
        setLanguage(lang);
        setCode(TEMPLATES[lang] || '');
        setRunResult(null);
        setSubmitResult(null);
        setActiveResult(null);
    };

    const authHeader = () => ({ Authorization: `Bearer ${localStorage.getItem('token')}` });

    const handleRun = async () => {
        setRunning(true);
        setRunResult(null);
        setSubmitResult(null);
        setActiveResult('run');
        setMobileTab('code');
        setBottomTab('result');
        try {
            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/submissions/run`,
                { problemId: id, language, code },
                { headers: authHeader() }
            );
            setRunResult(data);
        } catch (err) {
            setRunResult({ status: 'System Error', runtimeError: err.response?.data?.details || err.message, passed: 0, total: 0 });
        } finally {
            setRunning(false);
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setRunResult(null);
        setSubmitResult(null);
        setActiveResult('submit');
        setMobileTab('code');
        setBottomTab('result');
        try {
            const payload = { problemId: id, language, code };
            if (contestId) payload.contestId = contestId;
            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/submissions`,
                payload,
                { headers: authHeader() }
            );
            setSubmitResult(data);
        } catch (err) {
            setSubmitResult({ status: 'System Error', runtimeError: err.response?.data?.details || err.message, passed: 0, total: 0 });
        } finally {
            setSubmitting(false);
        }
    };

    const currentResult = activeResult === 'run' ? runResult : submitResult;
    const isBusy = running || submitting;
    const v = currentResult ? (VERDICT[currentResult.status] || VERDICT['System Error']) : null;
    const langConfig = LANGUAGES.find(l => l.id === language) || LANGUAGES[0];

    if (loading) return (
        <div className="flex-grow flex items-center justify-center bg-[#1a1a1a]">
            <div className="flex flex-col items-center gap-3">
                <Spinner color="#07fc03" size={28} />
                <p className="text-gray-400 text-sm">Loading problem...</p>
            </div>
        </div>
    );
    if (!problem) return (
        <div className="flex-grow flex items-center justify-center bg-[#1a1a1a]">
            <p className="text-red-400 text-sm">Problem not found.</p>
        </div>
    );

    /* ── Description panel ─────────────────────────────────────────── */
    const DescPane = (
        <div className="h-full flex flex-col overflow-hidden" style={{ background: '#1a1a1a' }}>
            {/* Header */}
            <div className="px-4 py-2.5 shrink-0 flex items-center gap-2"
                 style={{ background: '#262626', borderBottom: '1px solid #333' }}>
                <FileText size={13} style={{ color: '#07fc03' }} />
                <span className="text-xs font-semibold" style={{ color: '#eee' }}>Description</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
                {/* Title + badge */}
                <div className="flex flex-wrap items-start gap-2 mb-3">
                    <h1 className="text-base sm:text-lg font-bold text-gray-100 leading-tight">
                        {problem.id}. {problem.title}
                    </h1>
                    <span className={`mt-0.5 px-2 py-0.5 text-xs font-bold rounded shrink-0
                        ${problem.difficulty === 'Easy'   ? 'text-green-300  bg-green-900/50'  :
                          problem.difficulty === 'Medium' ? 'text-yellow-300 bg-yellow-900/50' :
                                                            'text-red-300    bg-red-900/50'}`}>
                        {problem.difficulty}
                    </span>
                </div>

                {/* Topics */}
                {(() => {
                    const topicsArr = problem.topics
                        ? (Array.isArray(problem.topics)
                            ? problem.topics
                            : problem.topics.split(',').map(t => t.trim()).filter(Boolean))
                        : [];
                    return topicsArr.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 mb-4">
                            {topicsArr.map(t => (
                                <span key={t} className="px-2 py-0.5 text-[11px] rounded"
                                      style={{ background: '#2a2a2a', border: '1px solid #444', color: '#aaa' }}>
                                    {t}
                                </span>
                            ))}
                        </div>
                    ) : null;
                })()}

                {/* Body */}
                <div className="text-sm text-gray-300 leading-relaxed whitespace-pre-wrap mb-5">
                    {problem.description}
                </div>

                {/* Sample Test Cases */}
                {sampleCases.length > 0 && (
                    <div className="space-y-4">
                        {sampleCases.map((tc, idx) => (
                            <div key={tc.id}
                                 style={{ background: '#212121', border: '1px solid #333', borderRadius: '8px', overflow: 'hidden' }}>
                                <div className="px-3 py-1.5 text-xs font-bold"
                                     style={{ background: '#2a2a2a', borderBottom: '1px solid #333', color: '#aaa', letterSpacing: '0.05em' }}>
                                    Example {idx + 1}
                                </div>
                                <div className="p-3 space-y-2">
                                    <div>
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Input</span>
                                        <pre className="mt-1 text-xs rounded px-3 py-2 whitespace-pre-wrap font-mono leading-relaxed"
                                             style={{ background: '#0d1117', border: '1px solid #1d3a5f', color: '#93c5fd' }}>
                                            {tc.input || '(none)'}
                                        </pre>
                                    </div>
                                    <div>
                                        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Output</span>
                                        <pre className="mt-1 text-xs rounded px-3 py-2 whitespace-pre-wrap font-mono leading-relaxed"
                                             style={{ background: '#001a00', border: '1px solid #166534', color: '#86efac' }}>
                                            {tc.expected_output || '(none)'}
                                        </pre>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    /* ── Editor + Bottom panel ─────────────────────────────────────── */
    const EditorPane = (
        <div className="h-full flex flex-col overflow-hidden" style={{ background: '#1e1e1e' }}>
            {/* Top toolbar: language select + reset */}
            <div className="flex items-center justify-between px-3 py-2 shrink-0"
                 style={{ background: '#2d2d2d', borderBottom: '1px solid #3a3a3a' }}>
                <div className="flex items-center gap-2">
                    <Code2 size={13} style={{ color: '#07fc03' }} />
                    <select
                        value={language}
                        onChange={e => changeLang(e.target.value)}
                        disabled={isBusy}
                        className="text-xs px-2 py-1 rounded outline-none cursor-pointer disabled:opacity-40"
                        style={{ background: '#3c3c3c', color: '#ddd', border: '1px solid #555' }}
                    >
                        {LANGUAGES.map(l => <option key={l.id} value={l.id}>{l.label}</option>)}
                    </select>
                </div>

                {/* Problem title shown inline in fullscreen — no overlap */}
                {fullscreen && (
                    <span className="hidden lg:block text-xs font-semibold truncate max-w-[240px] px-2"
                          style={{ color: '#07fc03', opacity: 0.85 }}>
                        {problem?.id}. {problem?.title}
                    </span>
                )}
                <div className="flex items-center gap-1.5">
                    <button onClick={() => changeLang(language)} disabled={isBusy} title="Reset to template"
                            className="p-1.5 rounded disabled:opacity-40 text-gray-500 hover:text-gray-300 transition-colors">
                        <RotateCcw size={13} />
                    </button>
                    {/* Fullscreen toggle — desktop only */}
                    <button
                        onClick={() => setFullscreen(f => !f)}
                        title={fullscreen ? 'Exit fullscreen (Esc)' : 'Fullscreen editor'}
                        className="hidden lg:flex p-1.5 rounded transition-colors text-gray-500 hover:text-gray-200"
                    >
                        {fullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                    </button>
                </div>
            </div>

            {/* Monaco editor fills remaining space */}
            <div className="flex-1 min-h-0">
                <Editor
                    height="100%"
                    language={langConfig.mono}
                    theme="vs-dark"
                    value={code}
                    onChange={v => setCode(v || '')}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 15,
                        scrollBeyondLastLine: false,
                        padding: { top: 12 },
                        fontFamily: "'JetBrains Mono','Cascadia Code','Fira Code',monospace",
                        fontLigatures: true,
                        tabSize: 4,
                        renderLineHighlight: 'gutter',
                        bracketPairColorization: { enabled: true },
                    }}
                />
            </div>

            {/* Bottom bar: Run + Submit (like LeetCode) */}
            <div className="shrink-0 flex items-center justify-between px-4 py-2.5"
                 style={{ background: '#2d2d2d', borderTop: '1px solid #3a3a3a' }}>
                {/* Left: verdict dot when result exists */}
                <div className="flex items-center gap-2">
                    {v && (
                        <span className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: v.color }}>
                            <span className="w-2 h-2 rounded-full inline-block" style={{ background: v.color }} />
                            {currentResult?.status}
                        </span>
                    )}
                    {!v && !isBusy && (
                        <span className="text-xs text-gray-600">Ready</span>
                    )}
                    {isBusy && (
                        <span className="flex items-center gap-1.5 text-xs text-gray-400">
                            <Spinner color="#07fc03" size={12} />
                            {running ? 'Running...' : 'Submitting...'}
                        </span>
                    )}
                </div>

                {/* Right: Run + Submit */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={handleRun}
                        disabled={isBusy}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        style={{ background: '#3a3a3a', color: '#ddd', border: '1px solid #555' }}
                        onMouseEnter={e => { if (!isBusy) e.currentTarget.style.background = '#4a4a4a'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#3a3a3a'; }}
                    >
                        {running
                            ? <Spinner color="#fff" size={12} />
                            : <Play size={11} fill="#ddd" />
                        }
                        <span>Run</span>
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={isBusy}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded text-xs font-bold transition-all disabled:cursor-not-allowed"
                        style={{
                            background: isBusy ? '#059900' : '#07fc03',
                            color: '#000',
                            boxShadow: isBusy ? 'none' : '0 0 12px #07fc0350',
                        }}
                    >
                        {submitting
                            ? <Spinner color="#003300" size={12} />
                            : <Send size={11} />
                        }
                        <span>Submit</span>
                    </button>
                </div>
            </div>

            {/* Bottom panel: Testcase / Test Result tabs (always visible) */}
            <div className="shrink-0 flex flex-col" style={{ height: '180px', borderTop: '1px solid #3a3a3a', background: '#1a1a1a' }}>
                {/* Tab headers */}
                <div className="flex items-center shrink-0" style={{ borderBottom: '1px solid #333', background: '#222' }}>
                    <button
                        onClick={() => setBottomTab('testcase')}
                        className="px-4 py-2 text-xs font-semibold transition-colors"
                        style={{
                            color: bottomTab === 'testcase' ? '#eee' : '#666',
                            borderBottom: bottomTab === 'testcase' ? '2px solid #07fc03' : '2px solid transparent',
                        }}
                    >
                        Testcase
                    </button>
                    <button
                        onClick={() => setBottomTab('result')}
                        className="px-4 py-2 text-xs font-semibold transition-colors flex items-center gap-1.5"
                        style={{
                            color: bottomTab === 'result' ? '#eee' : '#666',
                            borderBottom: bottomTab === 'result' ? '2px solid #07fc03' : '2px solid transparent',
                        }}
                    >
                        Test Result
                        {v && <span className="w-1.5 h-1.5 rounded-full" style={{ background: v.color }} />}
                    </button>
                </div>

                {/* Tab body */}
                {bottomTab === 'testcase' ? (
                    <div className="flex-1 overflow-y-auto p-3">
                        <p className="text-xs text-gray-500 mb-2">Custom input (stdin):</p>
                        <textarea
                            className="w-full text-xs font-mono rounded p-2 outline-none resize-none"
                            style={{ background: '#0d1117', border: '1px solid #333', color: '#ccc', height: '80px' }}
                            placeholder="Enter custom stdin here..."
                        />
                        <p className="text-[10px] text-gray-600 mt-1">Note: Custom input runs only in Run mode, not Submit.</p>
                    </div>
                ) : (
                    <TestResultPanel result={currentResult} mode={activeResult} isLoading={isBusy} />
                )}
            </div>
        </div>
    );

    return (
        <div className="flex-grow flex flex-col overflow-hidden" style={{ background: '#1a1a1a' }}>
            {/* Mobile tab bar */}
            <div className="flex lg:hidden shrink-0" style={{ background: '#222', borderBottom: '1px solid #333' }}>
                {[{ key: 'description', label: 'Description', Icon: FileText },
                  { key: 'code', label: 'Code', Icon: Code2 }].map(({ key, label, Icon }) => (
                    <button key={key} onClick={() => setMobileTab(key)}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors"
                            style={{
                                color: mobileTab === key ? '#07fc03' : '#666',
                                borderBottom: mobileTab === key ? '2px solid #07fc03' : '2px solid transparent',
                            }}>
                        <Icon size={13} />{label}
                    </button>
                ))}
            </div>

            {/* Mobile: single pane */}
            <div className="flex-1 flex flex-col overflow-hidden lg:hidden">
                <div className={`flex-1 overflow-hidden ${mobileTab === 'description' ? 'flex flex-col' : 'hidden'}`}>
                    {DescPane}
                </div>
                <div className={`flex-1 overflow-hidden ${mobileTab === 'code' ? 'flex flex-col' : 'hidden'}`}>
                    {EditorPane}
                </div>
            </div>

            {/* Desktop: normal split */}
            <div className="hidden lg:flex flex-1 overflow-hidden">
                <div className="flex flex-col overflow-hidden" style={{ width: '40%', borderRight: '1px solid #333' }}>
                    {DescPane}
                </div>
                <div className="flex flex-col overflow-hidden" style={{ width: '60%' }}>
                    {EditorPane}
                </div>
            </div>

            {/* True fullscreen overlay — covers entire viewport including navbar */}
            {fullscreen && (
                <div
                    className="hidden lg:flex flex-col"
                    style={{
                        position: 'fixed',
                        top: 0, left: 0,
                        width: '100vw',
                        height: '100dvh',
                        zIndex: 9999,
                        background: '#1e1e1e',
                    }}
                >
                    {EditorPane}
                </div>
            )}
        </div>
    );
};

// Inject spin animation globally once
if (typeof document !== 'undefined' && !document.getElementById('spin-style')) {
    const s = document.createElement('style');
    s.id = 'spin-style';
    s.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
    document.head.appendChild(s);
}

export default ProblemDetail;

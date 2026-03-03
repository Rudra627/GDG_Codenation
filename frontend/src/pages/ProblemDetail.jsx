import React, { useState, useEffect, useContext } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Editor from '@monaco-editor/react';
import Split from 'react-split';
import {
    Play, Send, RotateCcw, FileText, Code2,
    CheckCheck, XCircle, AlertTriangle, Clock, CheckCircle2,
    Maximize2, Minimize2, TerminalSquare, CheckSquare, Beaker, Terminal, ChevronUp, ChevronDown
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
    const [hasTemplate, setHasTemplate] = useState(false); // Indicates if this is Function Mode
    const [mobileTab, setMobileTab] = useState('description');
    const [bottomTab, setBottomTab] = useState('testcase'); // default to testcase
    const [panelExpanded, setPanelExpanded] = useState(true); // bottom panel toggle (results/testcases)
    const [activeTestCaseTab, setActiveTestCaseTab] = useState(0); // For multiple testcases (-1 means custom)
    const [customInputVal, setCustomInputVal] = useState('');
    const [fullscreen, setFullscreen] = useState(false);

    // ESC key exits fullscreen
    useEffect(() => {
        const onKey = (e) => { if (e.key === 'Escape') setFullscreen(false); };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, []);

    const [running, setRunning]         = useState(false);
    const [submitting, setSubmitting]   = useState(false);
    const [runResult, setRunResult]     = useState(null);
    const [submitResult, setSubmitResult] = useState(null);
    const [activeResult, setActiveResult] = useState(null);

    useEffect(() => {
        setLoading(true);
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Fetch Problem
        axios.get(`${import.meta.env.VITE_API_URL}/api/problems/${id}`)
            .then((probRes) => {
                setProblem(probRes.data);
                
                // 2. Fetch Samples Independently (Do not chain template fetch to this)
                axios.get(`${import.meta.env.VITE_API_URL}/api/problems/${id}/samples`)
                    .then((samplesRes) => {
                        const samples = samplesRes.data || [];
                        setSampleCases(samples);
                        setActiveTestCaseTab(samples.length > 0 ? 0 : -1);
                    })
                    .catch((err) => {
                        console.error('Failed to load samples:', err);
                        setSampleCases([]);
                        setActiveTestCaseTab(-1);
                    });

                // 3. Fetch Template Independently (So a 404 here NEVER clears samples)
                axios.get(`${import.meta.env.VITE_API_URL}/api/problems/${id}/template/${language}`)
                    .then(tplRes => {
                        if (tplRes.data?.starter_code) {
                            setCode(tplRes.data.starter_code);
                            setHasTemplate(true);
                        } else {
                            setCode(TEMPLATES[language] || '');
                            setHasTemplate(false);
                        }
                    })
                    .catch((err) => {
                        setCode(TEMPLATES[language] || '');
                        setHasTemplate(false);
                    });
            })
            .catch((err) => {
                console.error('Failed to load problem:', err);
                setProblem(null);
            })
            .finally(() => setLoading(false));
    }, [id]);

    // Handle template changes when user switches language
    useEffect(() => {
        if (!id || loading) return;
        axios.get(`${import.meta.env.VITE_API_URL}/api/problems/${id}/template/${language}`)
            .then(res => {
                if (res.data?.starter_code) {
                    setCode(res.data.starter_code);
                    setHasTemplate(true);
                } else {
                    setCode(TEMPLATES[language] || '');
                    setHasTemplate(false);
                }
            })
            .catch(() => {
                setCode(TEMPLATES[language] || '');
                setHasTemplate(false);
            });
    }, [language]);


    const changeLang = (lang) => {
        setLanguage(lang);
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
        setPanelExpanded(true);
        try {
            const payload = { problemId: id, language, code };
            // If user is on the Custom Input tab, send that input to override samples
            if (activeTestCaseTab === -1) {
                payload.customInput = customInputVal;
            }
            const { data } = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/submissions/run`,
                payload,
                { headers: authHeader() }
            );
            setRunResult(data);
        } catch (err) {
            const errDetails = err.response?.data?.message || err.response?.data?.details || err.message;
            setRunResult({ status: 'System Error', runtimeError: errDetails, passed: 0, total: 0 });
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
        setPanelExpanded(true);
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
            const errDetails = err.response?.data?.message || err.response?.data?.details || err.message;
            setSubmitResult({ status: 'System Error', runtimeError: errDetails, passed: 0, total: 0 });
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

    /* ── Left Pane (Description Only) ─────────────────────────────────────────── */
    const DescPane = (
        <div className="h-full flex flex-col overflow-hidden" style={{ background: '#1a1a1a' }}>
            {/* Header Tabs */}
            <div className="px-2 py-2 shrink-0 flex flex-nowrap items-center gap-1 overflow-x-auto custom-scrollbar"
                 style={{ background: '#262626', borderBottom: '1px solid #333' }}>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap"
                        style={{ color: '#07fc03', background: '#333' }}>
                    <FileText size={13} /> Description
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-5 flex flex-col">
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

                        {/* Sample Test Cases Header */}
                        {sampleCases.length > 0 && (
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest border-b border-[#333] pb-2">Examples</h3>
                                {sampleCases.map((tc, idx) => (
                                    <div key={tc.id}
                                         style={{ background: '#212121', border: '1px solid #333', borderRadius: '8px', overflow: 'hidden' }}>
                                        <div className="px-3 py-1.5 text-xs font-bold"
                                             style={{ background: '#2a2a2a', borderBottom: '1px solid #333', color: '#aaa', letterSpacing: '0.05em' }}>
                                            Test Case {idx + 1}
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
                    {/* Template mode badge */}
                    {hasTemplate && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider"
                              style={{ background: '#07fc0320', color: '#07fc03', border: '1px solid #07fc0340' }}>
                            ƒ Function Mode
                        </span>
                    )}
                </div>

                {/* Problem title shown inline in fullscreen — no overlap */}
                {fullscreen && (
                    <span className="hidden lg:block text-xs font-semibold truncate max-w-[240px] px-2"
                          style={{ color: '#07fc03', opacity: 0.85 }}>
                        {problem?.id}. {problem?.title}
                    </span>
                )}
                <div className="flex items-center gap-1.5">
                    {/* Render Run/Submit at the top ONLY in fullscreen mode */}
                    {fullscreen && (
                        <div className="flex items-center gap-2 mr-2">
                            <button
                                onClick={handleRun}
                                disabled={isBusy}
                                className="flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-[4px] text-[12px] font-semibold hover:bg-[#4a4a4a] transition-all disabled:opacity-50"
                                style={{ background: '#333', color: '#e5e5e5', border: '1px solid #4d4d4d' }}
                            >
                                {running ? <Spinner color="#fff" size={11} /> : <><Play size={11} fill="#e5e5e5"/> Run</>}
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isBusy}
                                className="flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-[4px] text-[12px] font-semibold transition-all hover:bg-[#00e600] disabled:opacity-50"
                                style={{ background: '#00ff00', color: '#000' }}
                            >
                                {submitting ? <Spinner color="#003300" size={11} /> : <><Send size={11} /> Submit</>}
                            </button>
                            <div className="w-[1px] h-[16px] bg-[#444] mx-1"></div>
                        </div>
                    )}
                    
                    <button
                        onClick={() => {
                            // Re-fetch template (or fall back to generic) on reset
                            axios.get(`${import.meta.env.VITE_API_URL}/api/problems/${id}/template/${language}`)
                                .then(res => setCode(res.data.starter_code))
                                .catch(() => setCode(TEMPLATES[language] || ''));
                        }}
                        disabled={isBusy} title="Reset to starter code"
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

            {fullscreen ? (
                /* Fullscreen View: Just the editor */
                <div className="flex-1 min-h-0 flex flex-col pt-1" style={{ background: '#1e1e1e' }}>
                    <Editor
                        height="100%"
                        language={langConfig.mono}
                        theme="vs-dark"
                        value={code}
                        onChange={v => setCode(v || '')}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
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
            ) : (
                <Split
                    sizes={panelExpanded ? [50, 50] : [100, 0]}
                    minSize={[100, 40]}
                    expandToMin={false}
                    gutterSize={6}
                    gutterAlign="center"
                    snapOffset={25}
                    dragInterval={1}
                    direction="vertical"
                    cursor="row-resize"
                    className="flex flex-col flex-1 h-full min-h-0 overflow-hidden"
                    style={{ display: 'flex' }}
                >
                    {/* Monaco editor top half */}
                    <div className="min-h-0 flex flex-col pt-1" style={{ background: '#1e1e1e' }}>
                        <Editor
                            height="100%"
                            language={langConfig.mono}
                            theme="vs-dark"
                            value={code}
                            onChange={v => setCode(v || '')}
                            options={{
                                minimap: { enabled: false },
                                fontSize: 14,
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

                {/* Bottom Testcase panel half */}
                <div className="flex flex-col min-h-0" style={{ background: '#1e1e1e' }}>
                    
                    {/* Console & Action Bar (Middle Splitter) */}
                    <div className="shrink-0 flex items-center justify-between px-4 py-3" style={{ background: '#262626', borderTop: '1px solid #333', borderBottom: '1px solid #333' }}>
                        {/* Ready Status / Left Side */}
                        <div className="flex items-center gap-2">
                            {isBusy ? (
                                <span className="flex items-center gap-1.5 text-xs text-[#00ff00]">
                                    <Spinner color="#00ff00" size={12} />
                                    {running ? 'Running...' : 'Submitting...'}
                                </span>
                            ) : (
                                <span className="text-[13px] font-semibold text-[#8c8c8c]">Ready</span>
                            )}
                        </div>

                        {/* Run and Submit / Right Side */}
                        <div className="flex items-center gap-2.5">
                            <button
                                onClick={handleRun}
                                disabled={isBusy}
                                className="flex items-center justify-center gap-1.5 px-5 py-1.5 rounded-[6px] text-[13px] font-semibold hover:bg-[#4a4a4a] transition-all disabled:opacity-50"
                                style={{ background: '#3b3b3b', color: '#e5e5e5', border: '1px solid #4d4d4d', minWidth: '70px' }}
                            >
                                {running ? <Spinner color="#fff" size={12} /> : <><Play size={12} fill="#e5e5e5"/> Run</>}
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={isBusy}
                                className="flex items-center justify-center gap-1.5 px-5 py-1.5 rounded-[6px] text-[13px] font-semibold transition-all hover:bg-[#00e600] disabled:opacity-50"
                                style={{ background: '#00ff00', color: '#000', minWidth: '80px' }}
                            >
                                {submitting ? <Spinner color="#003300" size={12} /> : <><Send size={12} /> Submit</>}
                            </button>
                        </div>
                    </div>

                    {/* Tab headers */}
                    <div className="flex items-center justify-between shrink-0 px-2" style={{ background: '#1e1e1e', height: '40px', borderBottom: '1px solid #333' }}>
                        <div className="flex items-center h-full gap-1">
                            <button
                                onClick={() => { setBottomTab('testcase'); setPanelExpanded(true); }}
                                className="px-3 h-full text-[13px] font-semibold transition-colors flex items-center gap-1.5"
                                style={{ color: (bottomTab === 'testcase') ? '#00ff00' : '#8c8c8c' }}
                            >
                                Testcase
                            </button>
                            <button
                                onClick={() => { setBottomTab('result'); setPanelExpanded(true); }}
                                className="px-3 h-full text-[13px] font-semibold transition-colors flex items-center gap-1.5"
                                style={{ color: (bottomTab === 'result') ? '#e5e5e5' : '#8c8c8c' }}
                            >
                                Test Result
                            </button>
                        </div>
                        {/* Expand/Collapse Toggle - Right side of toolbar */}
                        <button 
                            onClick={() => setPanelExpanded(!panelExpanded)}
                            className="p-1.5 text-gray-400 hover:text-white rounded transition-colors hidden lg:block"
                            title={panelExpanded ? "Collapse panel" : "Expand panel"}
                        >
                            {panelExpanded ? (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 15 12 9 18 15"></polyline></svg>
                            ) : (
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
                            )}
                        </button>
                    </div>

                    {/* Tab body (only show if expanded) */}
                    {panelExpanded && (
                        <div className="flex-1 overflow-hidden flex flex-col" style={{ background: '#1e1e1e' }}>
                            {bottomTab === 'testcase' ? (
                                <div className="flex-1 overflow-y-auto p-4 flex flex-col pt-4">
                                    {/* Testcase Pills */}
                                    <div className="flex flex-wrap gap-2 mb-5 shrink-0">
                                        {sampleCases.map((tc, idx) => (
                                                <button
                                                    key={tc.id}
                                                    onClick={() => setActiveTestCaseTab(idx)}
                                                    className="px-4 py-1.5 rounded-[6px] text-[13px] font-semibold whitespace-nowrap transition-colors"
                                                    style={{
                                                        background: activeTestCaseTab === idx ? '#333' : 'transparent',
                                                        color: activeTestCaseTab === idx ? '#fff' : '#8c8c8c',
                                                    }}
                                                >
                                                    Case {idx + 1}
                                                </button>
                                            ))}
                                            <button
                                                onClick={() => setActiveTestCaseTab(-1)}
                                                className="px-4 py-1.5 rounded-[6px] text-sm font-semibold whitespace-nowrap transition-colors flex items-center justify-center"
                                                style={{
                                                    background: activeTestCaseTab === -1 ? '#333' : 'transparent',
                                                    color: activeTestCaseTab === -1 ? '#00b8a3' : '#8c8c8c',
                                                }}
                                            >
                                                +
                                            </button>
                                        </div>
                                        {/* Selected Testcase Content */}
                                        {activeTestCaseTab === -1 ? (
                                            <div className="flex-1 flex flex-col pl-1">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-[10px] uppercase font-bold text-[#00b8a3] tracking-wider">Custom Stdin</span>
                                                </div>
                                                <textarea
                                                    value={customInputVal}
                                                    onChange={(e) => setCustomInputVal(e.target.value)}
                                                    className="w-full flex-1 min-h-[80px] text-[13px] font-mono rounded-[8px] p-3 outline-none resize-none custom-scrollbar"
                                                    style={{ background: '#262626', border: '1px solid #333', color: '#e5e5e5' }}
                                                    placeholder="Enter your custom stdin inputs perfectly here..."
                                                />
                                                <p className="text-[10px] text-gray-500 mt-2">Note: Custom input runs only in "Run" mode. "Submit" tests hidden edge cases.</p>
                                            </div>
                                        ) : (
                                            // Handle missing or loading test cases cleanly without crashing
                                            sampleCases[activeTestCaseTab] ? (
                                                <div className="space-y-4 pl-1">
                                                    {/* Parse lines of input and format as Name = \n [Value] */}
                                                    {(sampleCases[activeTestCaseTab].input || '').split('\n').filter(Boolean).map((line, i) => {
                                                        const eqIdx = line.indexOf('=');
                                                        if (eqIdx !== -1) {
                                                            const name = line.substring(0, eqIdx).trim();
                                                            const val = line.substring(eqIdx + 1).trim();
                                                            return (
                                                                <div key={i}>
                                                                    <p className="text-[12px] font-bold mb-1.5 tracking-wider" style={{ color: '#d4d4d4' }}>{name} =</p>
                                                                    <div className="px-3.5 py-2.5 rounded-[6px] transition-colors" style={{ background: '#2e2e2e', color: '#e5e5e5', fontFamily: 'monospace', fontSize: '13px' }}>
                                                                        {val}
                                                                    </div>
                                                                </div>
                                                            );
                                                        }
                                                        return (
                                                            <div key={i} className="px-3.5 py-2.5 rounded-[6px] transition-colors" style={{ background: '#2e2e2e', color: '#e5e5e5', fontFamily: 'monospace', fontSize: '13px' }}>
                                                                {line}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 p-2">
                                                    <Spinner color="#00ff00" size={14} />
                                                    <span className="text-gray-400 text-xs">Loading test cases...</span>
                                                </div>
                                            )
                                        )}
                                    </div>
                                ) : (
                                    <div className="p-4 flex-1 overflow-y-auto">
                                        <TestResultPanel result={currentResult} mode={activeResult} isLoading={isBusy} />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </Split>
            )}
        </div>
    );

    return (
        <div className="flex-grow flex flex-col overflow-hidden" style={{ background: '#1a1a1a' }}>
            {/* Mobile tab bar */}
            <div className="flex lg:hidden shrink-0 overflow-x-auto custom-scrollbar" style={{ background: '#222', borderBottom: '1px solid #333' }}>
                {[{ key: 'description', label: 'Desc', Icon: FileText },
                  { key: 'code', label: 'Code', Icon: Code2 }].map(({ key, label, Icon }) => (
                    <button key={key} onClick={() => { setMobileTab(key); }}
                            className="flex-1 min-w-[80px] flex items-center justify-center gap-1.5 py-2.5 text-[11px] sm:text-xs font-semibold transition-colors whitespace-nowrap px-2"
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

            {/* Desktop: resizable split */}
            <Split
                sizes={[50, 50]}
                minSize={300}
                expandToMin={false}
                gutterSize={6}
                gutterAlign="center"
                snapOffset={30}
                dragInterval={1}
                direction="horizontal"
                cursor="col-resize"
                className="hidden lg:flex flex-row flex-1 h-full min-h-0 overflow-hidden"
            >
                {/* Left Pane: Description */}
                <div className="flex flex-col h-full min-h-0 overflow-hidden" style={{ minWidth: 0 }}>
                    {DescPane}
                </div>
                {/* Right Pane: Code + Results */}
                <div className="flex flex-col h-full min-h-0 overflow-hidden" style={{ minWidth: 0, borderLeft: '1px solid #333' }}>
                    {EditorPane}
                </div>
            </Split>

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

export default ProblemDetail;

// Inject spin animation globally once
if (typeof document !== 'undefined' && !document.getElementById('spin-style')) {
    const s = document.createElement('style');
    s.id = 'spin-style';
    s.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
    document.head.appendChild(s);
}

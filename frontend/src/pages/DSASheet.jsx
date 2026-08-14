import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Circle, ChevronDown, ChevronUp, ExternalLink,
  Search, BarChart2, Target, Trophy, Zap, Filter, X
} from 'lucide-react';
import { getTopicsWithProblems, getTotalByDifficulty } from '../services/problemService';
import {
  toggleComplete, isCompleted, getCompletedIds, getCompletedByDifficulty
} from '../utils/progress';
import { getAllProblems } from '../services/problemService';

// ── Difficulty badge ──────────────────────────────────────────────────────────
const DifficultyBadge = ({ difficulty }) => {
  const styles = {
    Easy:   'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    Medium: 'text-amber-400  bg-amber-400/10  border-amber-400/20',
    Hard:   'text-red-400    bg-red-400/10    border-red-400/20',
  };
  return (
    <span className={`inline-flex px-2 py-0.5 text-[11px] font-bold rounded border ${styles[difficulty] || 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20'}`}>
      {difficulty}
    </span>
  );
};

// ── Circular progress ring ────────────────────────────────────────────────────
const ProgressRing = ({ solved, total, color, size = 56, stroke = 4 }) => {
  const radius = (size - stroke) / 2;
  const circ = 2 * Math.PI * radius;
  const pct = total > 0 ? (solved / total) : 0;
  const offset = circ * (1 - pct);
  return (
    <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
     <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={stroke} />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  );
};

// ── Stats card ────────────────────────────────────────────────────────────────
const StatCard = ({ label, solved, total, color }) => (
  <div className="relative flex flex-col items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 min-w-[110px] group hover:border-white/10 transition-colors">
    <div className="relative">
      <ProgressRing solved={solved} total={total} color={color} />
      <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'rotate(0deg)' }}>
        <span className="text-xs font-bold text-white">{solved}</span>
      </div>
    </div>
    <div className="text-center">
      <div className="text-[11px] font-semibold" style={{ color }}>{label}</div>
      <div className="text-[10px] text-zinc-600 mt-0.5">{total} total</div>
    </div>
  </div>
);

// ── Topic section row (single problem) ───────────────────────────────────────
const ProblemRow = ({ problem, completed, onToggle }) => {
  const handleToggle = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    onToggle(problem.id);
  }, [problem.id, onToggle]);

  return (
    <motion.div
      layout
      className={`flex items-center gap-3 px-4 py-3 group transition-all duration-150
        ${completed ? 'bg-white/[0.015]' : 'hover:bg-white/[0.025]'}
        border-b border-white/[0.04] last:border-b-0`}
    >
      {/* Checkbox */}
      <button
        onClick={handleToggle}
        aria-label={completed ? 'Mark incomplete' : 'Mark complete'}
        className="shrink-0 text-zinc-600 hover:text-emerald-400 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 rounded-full"
      >
        {completed
          ? <CheckCircle2 size={18} className="text-emerald-400" />
          : <Circle size={18} />
        }
      </button>

      {/* Problem number (within topic) */}
      <span className="text-[11px] text-zinc-700 font-mono w-5 shrink-0 select-none">
        {problem.order}
      </span>

      {/* Title */}
      <span className={`flex-1 text-sm font-medium transition-colors truncate
        ${completed ? 'text-zinc-500 line-through decoration-zinc-600' : 'text-zinc-300 group-hover:text-white'}`}>
        {problem.title}
      </span>

      {/* Tags (desktop) */}
      <div className="hidden lg:flex items-center gap-1.5 mr-2 max-w-[200px] overflow-hidden">
        {problem.tags?.slice(0, 2).map((tag) => (
          <span key={tag} className="shrink-0 text-[10px] text-zinc-600 bg-zinc-800/60 border border-white/[0.04] px-2 py-0.5 rounded-full whitespace-nowrap">
            {tag}
          </span>
        ))}
      </div>

      {/* Difficulty */}
      <div className="shrink-0">
        <DifficultyBadge difficulty={problem.difficulty} />
      </div>

      {/* LeetCode link */}
      {problem.leetcodeUrl && (
        <a
          href={problem.leetcodeUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          aria-label={`Open ${problem.title} on LeetCode`}
          className="shrink-0 p-1.5 rounded-lg text-zinc-700 hover:text-amber-400 hover:bg-amber-400/10 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          title="Open on LeetCode"
        >
          <ExternalLink size={14} />
        </a>
      )}
    </motion.div>
  );
};

// ── Topic section accordion ───────────────────────────────────────────────────
const TopicSection = ({ topic, problems, completedIds, onToggle, defaultOpen }) => {
  const [open, setOpen] = useState(defaultOpen ?? false);

  const solvedCount = useMemo(
    () => problems.filter((p) => completedIds.has(p.id)).length,
    [problems, completedIds]
  );
  const total = problems.length;
  const pct = total > 0 ? Math.round((solvedCount / total) * 100) : 0;
  const allDone = solvedCount === total && total > 0;

  return (
    <div className={`rounded-2xl border overflow-hidden transition-all duration-200
      ${allDone
        ? 'border-emerald-500/20 bg-emerald-500/[0.02]'
        : 'border-white/[0.06] bg-white/[0.02]'
      }`}
    >
      {/* Header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-white/[0.02] transition-colors text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
        aria-expanded={open}
      >
        {/* Color dot */}
        <div className="w-3 h-3 rounded-full shrink-0 shadow-lg" style={{ background: topic.color, boxShadow: `0 0 8px ${topic.color}55` }} />

        {/* Label */}
        <span className="flex-1 text-sm font-bold text-zinc-200 tracking-wide">
          {topic.label}
        </span>

        {/* Sub-info */}
        <span className="text-xs text-zinc-600 mr-3 hidden sm:block">
          {topic.description?.slice(0, 55)}{topic.description?.length > 55 ? '…' : ''}
        </span>

        {/* Progress pill */}
        <div className={`flex items-center gap-2 shrink-0 mr-2 px-3 py-1 rounded-full text-xs font-bold border
          ${allDone
            ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
            : 'bg-white/[0.04] border-white/[0.06] text-zinc-400'
          }`}
        >
          {solvedCount}/{total}
        </div>

        {/* Progress bar (desktop) */}
        <div className="hidden md:flex items-center gap-2 w-24 shrink-0">
          <div className="flex-1 h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
            <motion.div
              className="h-full rounded-full transition-all duration-700"
              style={{ background: allDone ? '#22c55e' : topic.color, width: `${pct}%` }}
            />
          </div>
          <span className="text-[10px] text-zinc-600 w-7 text-right">{pct}%</span>
        </div>

        {/* Chevron */}
        <div className="text-zinc-600">
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </div>
      </button>

      {/* Problems list */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeInOut' }}
            style={{ overflow: 'hidden' }}
          >
            <div className="border-t border-white/[0.04]">
              {problems.map((p) => (
                <ProblemRow
                  key={p.id}
                  problem={p}
                  completed={completedIds.has(p.id)}
                  onToggle={onToggle}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Main DSA Sheet Page ───────────────────────────────────────────────────────
const DSASheet = () => {
  const allProblems = useMemo(() => getAllProblems(), []);
  const topicsWithProblems = useMemo(() => getTopicsWithProblems(), []);
  const totals = useMemo(() => getTotalByDifficulty(), []);

  // Reactive completed set — state triggers re-render on toggle
  const [completedIds, setCompletedIds] = useState(() => new Set(getCompletedIds()));

  const [searchQuery, setSearchQuery] = useState('');
  const [diffFilter, setDiffFilter] = useState(''); // '', 'Easy', 'Medium', 'Hard'
  const [expandAll, setExpandAll] = useState(false);

  // Derived stats
  const solvedByDiff = useMemo(
    () => getCompletedByDifficulty(allProblems),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [completedIds, allProblems]
  );
  const totalSolved = completedIds.size;

  // Handle toggle — update localStorage and React state atomically
  const handleToggle = useCallback((id) => {
    toggleComplete(id); // writes to localStorage
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Filtered topics & problems
  const filteredTopics = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return topicsWithProblems
      .map(({ topic, problems }) => {
        let filtered = problems;
        if (q) {
          filtered = filtered.filter(
            (p) =>
              p.title.toLowerCase().includes(q) ||
              p.tags?.some((t) => t.toLowerCase().includes(q)) ||
              p.subTopic?.toLowerCase().includes(q)
          );
        }
        if (diffFilter) {
          filtered = filtered.filter((p) => p.difficulty === diffFilter);
        }
        return { topic, problems: filtered };
      })
      .filter(({ problems }) => problems.length > 0);
  }, [topicsWithProblems, searchQuery, diffFilter]);

  const isFiltering = !!searchQuery || !!diffFilter;

  return (
    <div className="flex-grow flex flex-col bg-[#09090B] min-h-screen">
      
      {/* ── Hero Header ──────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden border-b border-white/[0.05]" style={{ background: '#0c0c0e' }}>
        {/* Subtle grid background */}
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage: `url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDQpIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=")`,
          }}
        />

        <div className="relative max-w-5xl mx-auto px-6 pt-12 pb-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/[0.06] border border-white/10 px-4 py-1.5 rounded-full mb-5">
            <Target size={13} className="text-white" />
            <span className="text-white text-xs font-semibold tracking-wider">DSA SHEET</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-3 tracking-tight">
            Master Data Structures &amp; Algorithms
          </h1>
          <p className="text-zinc-500 text-sm max-w-xl leading-relaxed mb-8">
            {totals.Total} hand-picked problems across {topicsWithProblems.length} topics. 
            Track your progress locally — no login needed.
          </p>

          {/* Overall progress bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-zinc-500 font-semibold">Overall Progress</span>
              <span className="text-xs text-zinc-400 font-bold">{totalSolved} / {totals.Total} solved</span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/[0.05] overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: 'linear-gradient(90deg, #22c55e, #16a34a)' }}
                initial={{ width: 0 }}
                animate={{ width: `${totals.Total > 0 ? (totalSolved / totals.Total) * 100 : 0}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Difficulty stat cards */}
          <div className="flex gap-3 flex-wrap">
            <StatCard label="Easy"   solved={solvedByDiff.Easy}   total={totals.Easy}   color="#22c55e" />
            <StatCard label="Medium" solved={solvedByDiff.Medium} total={totals.Medium} color="#f59e0b" />
            <StatCard label="Hard"   solved={solvedByDiff.Hard}   total={totals.Hard}   color="#ef4444" />
            <div className="relative flex flex-col items-center gap-2 bg-white/[0.03] border border-white/[0.06] rounded-2xl p-4 min-w-[110px] hover:border-white/10 transition-colors">
              <div className="relative">
                <ProgressRing
                  solved={totalSolved}
                  total={totals.Total}
                  color="#a78bfa"
                  size={56}
                  stroke={4}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">{totalSolved}</span>
                </div>
              </div>
              <div className="text-center">
                <div className="text-[11px] font-semibold text-violet-400">All</div>
                <div className="text-[10px] text-zinc-600 mt-0.5">{totals.Total} total</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Controls ─────────────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto w-full px-6 py-5">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 flex items-center gap-2.5 bg-white/[0.03] border border-white/[0.06] rounded-xl px-4 py-2.5 focus-within:border-white/20 transition-colors">
            <Search size={15} className="text-zinc-600 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search problems, tags…"
              className="flex-1 bg-transparent text-sm text-white placeholder-zinc-700 focus:outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-zinc-600 hover:text-white transition-colors">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Difficulty filter */}
          <div className="flex items-center gap-2">
            <Filter size={14} className="text-zinc-600 shrink-0" />
            {['', 'Easy', 'Medium', 'Hard'].map((d) => (
              <button
                key={d || 'All'}
                onClick={() => setDiffFilter(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 border
                  ${diffFilter === d
                    ? d === 'Easy'   ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                    : d === 'Medium' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                    : d === 'Hard'   ? 'bg-red-500/10 border-red-500/30 text-red-400'
                    : 'bg-white/10 border-white/20 text-white'
                    : 'bg-transparent border-white/[0.06] text-zinc-500 hover:text-white hover:border-white/15'
                  }`}
              >
                {d || 'All'}
              </button>
            ))}
          </div>

          {/* Expand All toggle */}
          <button
            onClick={() => setExpandAll((v) => !v)}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-white/[0.06] text-zinc-500 hover:text-white hover:border-white/15 transition-all bg-white/[0.02] whitespace-nowrap"
          >
            {expandAll ? 'Collapse All' : 'Expand All'}
          </button>
        </div>

        {/* Active filter indicator */}
        {isFiltering && (
          <p className="text-xs text-zinc-600 mt-3">
            Showing <span className="text-zinc-400 font-semibold">{filteredTopics.reduce((s, t) => s + t.problems.length, 0)}</span> problems across <span className="text-zinc-400 font-semibold">{filteredTopics.length}</span> topics
          </p>
        )}
      </div>

      {/* ── Topic Sections ───────────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto w-full px-6 pb-16 flex flex-col gap-3">
        {filteredTopics.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
            <Zap size={32} className="mb-3 opacity-50" />
            <p className="text-sm">No problems match your filters.</p>
            <button
              onClick={() => { setSearchQuery(''); setDiffFilter(''); }}
              className="mt-4 text-xs text-zinc-500 hover:text-white underline transition-colors"
            >
              Clear filters
            </button>
          </div>
        ) : (
          filteredTopics.map(({ topic, problems }, idx) => (
            <TopicSection
              key={topic.id}
              topic={topic}
              problems={problems}
              completedIds={completedIds}
              onToggle={handleToggle}
              defaultOpen={expandAll || isFiltering || idx === 0}
            />
          ))
        )}

        {/* Bottom padding note */}
        {filteredTopics.length > 0 && !isFiltering && (
          <div className="flex items-center justify-center gap-3 pt-6 pb-2">
            <div className="h-px flex-1 bg-white/[0.04]" />
            <div className="flex items-center gap-2 text-zinc-700 text-[11px]">
              <Trophy size={12} className="text-amber-500/60" />
              <span>Progress saved locally in your browser</span>
            </div>
            <div className="h-px flex-1 bg-white/[0.04]" />
          </div>
        )}
      </div>
    </div>
  );
};

export default DSASheet;

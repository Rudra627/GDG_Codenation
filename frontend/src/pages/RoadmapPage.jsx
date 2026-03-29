import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Target } from 'lucide-react';

const roadmapData = [
  { id: 'arrays', label: 'Arrays', x: 50, y: 10, status: 'completed' },
  { id: 'two-pointers', label: 'Two Pointers', x: 30, y: 35, status: 'completed' },
  { id: 'stack', label: 'Stack', x: 70, y: 35, status: 'completed' },
  { id: 'binary-search', label: 'Binary Search', x: 15, y: 60, status: 'completed' },
  { id: 'sliding-window', label: 'Sliding Window', x: 50, y: 60, status: 'completed' },
  { id: 'linked-list', label: 'Linked List', x: 85, y: 60, status: 'completed' },
  { id: 'trees', label: 'Trees', x: 50, y: 85, status: 'completed' },
  { id: 'tries', label: 'Tries', x: 15, y: 110, status: 'completed' },
  { id: 'backtracking', label: 'Backtracking', x: 85, y: 110, status: 'completed' },
  { id: 'heap', label: 'Heap / Priority Queue', x: 30, y: 135, status: 'completed' },
  { id: 'graphs', label: 'Graphs', x: 60, y: 135, status: 'completed' },
  { id: '1d-dp', label: '1-D DP', x: 90, y: 135, status: 'completed' },
  { id: 'intervals', label: 'Intervals', x: 10, y: 160, status: 'completed' },
  { id: 'greedy', label: 'Greedy', x: 30, y: 160, status: 'completed' },
  { id: 'advanced-graphs', label: 'Advanced Graphs', x: 55, y: 160, status: 'completed' },
  { id: '2d-dp', label: '2-D DP', x: 78, y: 160, status: 'completed' },
  { id: 'bit-manip', label: 'Bit Manipulation', x: 95, y: 160, status: 'completed' },
  { id: 'math', label: 'Math & Geometry', x: 85, y: 185, status: 'completed' },
];

const connections = [
  { from: 'arrays', to: 'two-pointers' },
  { from: 'arrays', to: 'stack' },
  { from: 'two-pointers', to: 'binary-search' },
  { from: 'two-pointers', to: 'sliding-window' },
  { from: 'two-pointers', to: 'linked-list' },
  { from: 'binary-search', to: 'trees' },
  { from: 'sliding-window', to: 'trees' },
  { from: 'linked-list', to: 'trees' },
  { from: 'trees', to: 'tries' },
  { from: 'trees', to: 'heap' },
  { from: 'trees', to: 'backtracking' },
  { from: 'backtracking', to: 'graphs' },
  { from: 'backtracking', to: '1d-dp' },
  { from: 'heap', to: 'intervals' },
  { from: 'heap', to: 'greedy' },
  { from: 'heap', to: 'advanced-graphs' },
  { from: 'graphs', to: 'advanced-graphs' },
  { from: 'graphs', to: '2d-dp' },
  { from: '1d-dp', to: '2d-dp' },
  { from: '1d-dp', to: 'bit-manip' },
  { from: '2d-dp', to: 'math' },
  { from: 'bit-manip', to: 'math' }
];

const RoadmapPage = () => {
    const renderConnections = () => {
        return connections.map((conn, i) => {
            const source = roadmapData.find(n => n.id === conn.from);
            const target = roadmapData.find(n => n.id === conn.to);
            if (!source || !target) return null;

            const yOffset = 10;
            const pathData = `M ${source.x} ${source.y + 4} C ${source.x} ${source.y + yOffset}, ${target.x} ${target.y - yOffset}, ${target.x} ${target.y - 4}`;
            
            const isActive = source.status === 'completed';

            return (
                <path
                    key={i}
                    d={pathData}
                    fill="none"
                    stroke={isActive ? '#ffffff' : '#27272a'}
                    strokeWidth="0.5"
                    strokeDasharray={isActive ? "none" : "1,1"}
                    className={`transition-all duration-500 ${isActive ? 'opacity-60' : ''}`}
                />
            );
        });
    };

    const getStatusStyles = (status) => {
        switch(status) {
            case 'completed':
                return 'border-white/40 bg-white/[0.06] text-white';
            case 'in-progress':
                return 'border-amber-400/40 bg-amber-400/[0.06] text-amber-400';
            default:
                return 'border-zinc-700 bg-zinc-900 text-zinc-500 hover:border-zinc-500 hover:text-zinc-300';
        }
    };

    return (
        <div className="flex-grow flex flex-col bg-[#09090B] p-4 md:p-8 relative">
            
            <div className="max-w-7xl mx-auto w-full mb-8 md:mb-12 flex flex-col items-center justify-center text-center">
                <div className="inline-flex items-center justify-center gap-2 bg-white/[0.08] border border-white/20 px-5 py-1.5 rounded-full mb-6">
                    <Target className="text-white" size={14} />
                    <span className="text-white font-semibold text-xs">Learning Roadmap</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Master the Fundamentals</h1>
                <p className="text-zinc-500 max-w-2xl text-sm leading-relaxed px-4">
                    Follow the path below to conquer algorithms and data structures step by step.
                </p>
            </div>

            {/* Graph Area */}
            <div className="relative w-full min-w-[800px] md:min-w-[1000px] h-[900px] md:h-[1000px] mx-auto mt-8 md:mt-4 pb-20">
                
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 120 200" preserveAspectRatio="none">
                    {renderConnections()}
                </svg>

                {roadmapData.map((node) => (
                    <Link
                        to={`/problems?topic=${encodeURIComponent(node.label)}`}
                        key={node.id}
                        className={`absolute transform -translate-x-1/2 -translate-y-1/2 px-3 py-1.5 md:px-4 md:py-2 border rounded-xl flex flex-col items-center justify-center gap-1 min-w-[110px] md:min-w-[140px] transition-all duration-300 hover:scale-110 hover:z-50 cursor-pointer z-10 group bg-[#111113] ${getStatusStyles(node.status)}`}
                        style={{ left: `${node.x}%`, top: `${(node.y / 200) * 100}%` }}
                    >
                        <span className="text-[10px] md:text-xs font-semibold whitespace-nowrap group-hover:-translate-y-0.5 transition-transform">{node.label}</span>
                        {node.status === 'completed' && <div className="w-full h-[3px] mt-0.5 md:mt-1 bg-white/50 rounded-full group-hover:bg-white transition-colors" />}
                        {node.status === 'in-progress' && <div className="w-1/2 h-[3px] mt-0.5 md:mt-1 bg-amber-400/50 rounded-full group-hover:bg-amber-400 transition-colors" />}
                        {node.status === 'locked' && <div className="w-full h-[3px] mt-0.5 md:mt-1 bg-zinc-800 rounded-full group-hover:bg-zinc-600 transition-colors" />}
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default RoadmapPage;

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Target } from 'lucide-react';

const roadmapData = [
  { id: 'arrays', label: 'Arrays', x: 50, y: 10, status: 'completed' },
  { id: 'two-pointers', label: 'Two Pointers', x: 30, y: 30, status: 'in-progress' },
  { id: 'stack', label: 'Stack', x: 70, y: 30, status: 'locked' },
  { id: 'binary-search', label: 'Binary Search', x: 20, y: 50, status: 'locked' },
  { id: 'sliding-window', label: 'Sliding Window', x: 40, y: 50, status: 'locked' },
  { id: 'linked-list', label: 'Linked List', x: 80, y: 50, status: 'locked' },
  { id: 'trees', label: 'Trees', x: 50, y: 70, status: 'locked' },
  { id: 'tries', label: 'Tries', x: 20, y: 90, status: 'locked' },
  { id: 'backtracking', label: 'Backtracking', x: 80, y: 90, status: 'locked' },
  { id: 'heap', label: 'Heap / Priority Queue', x: 35, y: 110, status: 'locked' },
  { id: 'graphs', label: 'Graphs', x: 65, y: 110, status: 'locked' },
  { id: '1d-dp', label: '1-D DP', x: 95, y: 110, status: 'locked' },
  { id: 'intervals', label: 'Intervals', x: 15, y: 130, status: 'locked' },
  { id: 'greedy', label: 'Greedy', x: 35, y: 130, status: 'locked' },
  { id: 'advanced-graphs', label: 'Advanced Graphs', x: 55, y: 130, status: 'locked' },
  { id: '2d-dp', label: '2-D DP', x: 80, y: 130, status: 'locked' },
  { id: 'bit-manip', label: 'Bit Manipulation', x: 105, y: 130, status: 'locked' },
  { id: 'math', label: 'Math & Geometry', x: 90, y: 150, status: 'locked' },
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
    // Generate SVG Paths for connections
    const renderConnections = () => {
        return connections.map((conn, i) => {
            const source = roadmapData.find(n => n.id === conn.from);
            const target = roadmapData.find(n => n.id === conn.to);
            if (!source || !target) return null;

            // Simple bezier curve logic
            const yOffset = 10;
            const pathData = `M ${source.x} ${source.y + 4} C ${source.x} ${source.y + yOffset}, ${target.x} ${target.y - yOffset}, ${target.x} ${target.y - 4}`;
            
            // Check if connection is "active" (source is completed)
            const isActive = source.status === 'completed';

            return (
                <path
                    key={i}
                    d={pathData}
                    fill="none"
                    stroke={isActive ? '#07fc03' : '#333'}
                    strokeWidth="0.5"
                    strokeDasharray={isActive ? "none" : "1,1"}
                    className={`transition-all duration-500 ${isActive ? 'drop-shadow-[0_0_8px_rgba(7,252,3,0.5)]' : ''}`}
                />
            );
        });
    };

    const getStatusStyles = (status) => {
        switch(status) {
            case 'completed':
                return 'border-[#07fc03] bg-[#07fc03]/10 text-[#07fc03] shadow-[0_0_15px_rgba(7,252,3,0.2)]';
            case 'in-progress':
                return 'border-yellow-400 bg-yellow-400/10 text-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.2)]';
            default:
                return 'border-gray-700 bg-gray-900 text-gray-400 hover:border-gray-500 hover:text-gray-300';
        }
    };

    return (
        <div className="flex-grow flex flex-col bg-[#050505] font-mono p-4 md:p-8 min-h-screen relative overflow-x-auto overflow-y-auto">
            
            <div className="max-w-7xl mx-auto w-full mb-8 md:mb-12 flex flex-col items-center justify-center text-center">
                <div className="inline-flex items-center justify-center gap-3 border border-[#07fc03]/30 bg-[#07fc03]/5 px-6 py-2 rounded-full mb-6 shadow-[0_0_20px_rgba(7,252,3,0.1)]">
                    <Target className="text-[#07fc03]" size={18} />
                    <span className="text-[#07fc03] font-bold tracking-[0.2em] text-xs md:text-sm uppercase">Hacker Road Map</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]">Master the Machine</h1>
                <p className="text-gray-400 max-w-2xl text-xs md:text-sm leading-relaxed px-4">
                    Follow the sequential execution path below to conquer fundamental algorithms and data structures. Green signifies complete mastery. Yellow indicates active execution.
                </p>
            </div>

            {/* Legend */}
            <div className="absolute top-4 right-4 md:top-10 md:right-10 flex flex-col gap-2 border border-[#07fc03]/20 bg-black/80 backdrop-blur p-3 md:p-4 rounded-xl z-20 shadow-[0_0_15px_rgba(7,252,3,0.05)] text-[10px] md:text-xs">
                <div className="flex items-center gap-2 md:gap-3 text-gray-400 font-bold uppercase tracking-wider hover:text-[#07fc03] transition-colors cursor-default">
                    <div className="w-2.5 h-2.5 rounded bg-[#07fc03]/20 border border-[#07fc03] shadow-[0_0_5px_#07fc03]"></div> MASTERED
                </div>
                <div className="flex items-center gap-2 md:gap-3 text-gray-400 font-bold uppercase tracking-wider hover:text-yellow-400 transition-colors cursor-default">
                    <div className="w-2.5 h-2.5 rounded bg-yellow-400/20 border border-yellow-400 shadow-[0_0_5px_#facc15]"></div> IN PROGRESS
                </div>
                <div className="flex items-center gap-2 md:gap-3 text-gray-400 font-bold uppercase tracking-wider hover:text-gray-300 transition-colors cursor-default">
                    <div className="w-2.5 h-2.5 rounded bg-gray-900 border border-gray-700"></div> LOCKED
                </div>
            </div>

            {/* Interactive Graph Area */}
            <div className="relative w-full min-w-[800px] md:min-w-[1000px] h-[700px] md:h-[800px] mx-auto mt-8 md:mt-4 pb-20">
                
                {/* SVG Connections Overlay */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 120 160" preserveAspectRatio="none">
                    {renderConnections()}
                </svg>

                {/* Nodes */}
                {roadmapData.map((node) => (
                    <Link
                        to={`/problems?topic=${encodeURIComponent(node.label)}`}
                        key={node.id}
                        className={`absolute transform -translate-x-1/2 -translate-y-1/2 px-3 py-1.5 md:px-4 md:py-2 border-2 rounded-lg flex flex-col items-center justify-center gap-1 min-w-[110px] md:min-w-[140px] transition-all duration-300 hover:scale-[1.15] hover:z-50 cursor-pointer z-10 group bg-[#0a0a0a] ${getStatusStyles(node.status)}`}
                        style={{ left: `${node.x}%`, top: `${(node.y / 160) * 100}%` }}
                    >
                        <span className="text-[10px] md:text-xs font-bold whitespace-nowrap group-hover:-translate-y-0.5 transition-transform">{node.label}</span>
                        {node.status === 'completed' && <div className="w-full h-1 mt-0.5 md:mt-1 bg-[#07fc03] rounded-full shadow-[0_0_5px_#07fc03] group-hover:shadow-[0_0_15px_#07fc03] transition-shadow" />}
                        {node.status === 'in-progress' && <div className="w-1/2 h-1 mt-0.5 md:mt-1 bg-yellow-400 rounded-full shadow-[0_0_5px_#facc15] group-hover:shadow-[0_0_15px_#facc15] transition-shadow" />}
                        {node.status === 'locked' && <div className="w-full h-1 mt-0.5 md:mt-1 bg-gray-800 rounded-full group-hover:bg-gray-600 transition-colors" />}
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default RoadmapPage;

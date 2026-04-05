import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Play, CheckCircle, Search, Star, Tag } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { Skeleton } from 'boneyard-js/react';

const ProblemsPage = () => {
    const [problems, setProblems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTopic, setSelectedTopic] = useState('');
    const [topics, setTopics] = useState([]);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchProblems = async () => {
            try {
                const token = localStorage.getItem('token');
                const headers = { Authorization: `Bearer ${token}` };
                const endpoint = `${import.meta.env.VITE_API_URL}/api/problems/user-status`;
                const res = await axios.get(endpoint, { headers });
                setProblems(res.data);
            } catch (error) {
                console.error("Error fetching problems", error);
                try {
                     const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/problems`);
                     setProblems(res.data);
                } catch(e) {}
            } finally {
                setLoading(false);
            }
        };
        fetchProblems();
    }, [user]);

    useEffect(() => {
        if (problems.length > 0) {
            const allTopics = new Set();
            problems.forEach(p => {
                if (p.topics && typeof p.topics === 'string') {
                    p.topics.split(',').forEach(t => allTopics.add(t.trim()));
                }
            });
            setTopics([...allTopics].filter(Boolean));
        }
    }, [problems]);

    const filteredProblems = problems.filter(prob => {
        const matchesSearch = prob.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTopic = selectedTopic ? (prob.topics && prob.topics.split(',').map(t=>t.trim()).includes(selectedTopic)) : true;
        return matchesSearch && matchesTopic;
    });

    const getDifficultyColor = (difficulty) => {
        switch(difficulty) {
            case 'Easy': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
            case 'Medium': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
            case 'Hard': return 'text-red-500 bg-red-500/10 border-red-500/20';
            default: return 'text-zinc-400 bg-zinc-400/10 border-zinc-400/20';
        }
    };

    return (
        <div className="flex-grow flex flex-col items-center py-16 px-6 bg-[var(--bg-primary)]">
            <div className="text-center max-w-2xl mb-12">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-white tracking-tight">
                    Problem <span className="text-[var(--accent)]">Playground</span>
                </h1>
                <p className="text-lg text-zinc-400">
                    Select a challenge below and test your skills in our futuristic editor environment.
                </p>
            </div>

            {/* Filters */}
            <div className="w-full max-w-4xl mx-auto mb-10 flex flex-col md:flex-row gap-4">
                <div className="bg-[var(--bg-secondary)] p-4 rounded-xl flex-grow md:w-1/3 flex items-center border border-white/[0.04] shadow-[0_0_15px_rgba(255,42,42,0.05)] focus-within:shadow-[0_0_20px_rgba(255,42,42,0.15)] transition-shadow">
                    <Search size={18} className="text-zinc-500 mr-3" />
                    <input 
                        type="text"
                        placeholder="Search problems..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-transparent border-none text-white focus:outline-none placeholder-zinc-600"
                    />
                </div>
                <div className="bg-[var(--bg-secondary)] p-4 rounded-xl flex-grow md:w-2/3 border border-white/[0.04] flex flex-wrap items-center gap-2 overflow-x-auto">
                    <Tag size={18} className="text-[var(--accent)] mr-2 shrink-0" />
                    <button
                        onClick={() => setSelectedTopic('')}
                        className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 whitespace-nowrap ${
                            selectedTopic === '' 
                            ? 'bg-[var(--accent)] text-white shadow-[0_0_10px_rgba(255,42,42,0.4)]' 
                            : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/[0.04]'
                        }`}
                    >
                        All Topics
                    </button>
                    {topics.map(topic => (
                        <button
                            key={topic}
                            onClick={() => setSelectedTopic(topic)}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all duration-200 whitespace-nowrap ${
                                selectedTopic === topic 
                                ? 'bg-[var(--accent)] text-white shadow-[0_0_10px_rgba(255,42,42,0.4)]' 
                                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-white/[0.04]'
                            }`}
                        >
                            {topic}
                        </button>
                    ))}
                </div>
            </div>

            <div className="w-full max-w-4xl mx-auto pb-10">
                <div className="bg-[var(--bg-secondary)] rounded-2xl overflow-hidden min-w-[300px] border border-white/[0.04] shadow-2xl">
                    <div className="hidden md:grid grid-cols-12 gap-4 border-b border-white/[0.04] bg-white/[0.02] p-5 font-semibold text-zinc-400 text-xs tracking-wider uppercase">
                        <div className="col-span-1 text-center">Status</div>
                        <div className="col-span-6 pl-2">Title</div>
                        <div className="col-span-3 text-center">Difficulty</div>
                        <div className="col-span-2 text-center">Action</div>
                    </div>
                    
                    <Skeleton name="problems-table" loading={loading}>
                        {filteredProblems.length === 0 ? (
                            <div className="p-12 text-center text-zinc-500">No problems found matching your criteria.</div>
                        ) : (
                            <div className="divide-y divide-white/[0.04]">
                                {filteredProblems.map((prob) => (
                                    <Link 
                                        to={`/problem/${prob.id}`} 
                                        key={prob.id}
                                        className={`flex flex-col md:grid md:grid-cols-12 gap-4 p-5 items-center hover:bg-white/[0.02] transition-colors duration-200 group ${prob.is_daily ? 'bg-[var(--accent)]/[0.02]' : ''}`}
                                    >
                                        <div className="col-span-1 flex justify-center w-full md:w-auto mb-2 md:mb-0">
                                            {prob.is_solved ? (
                                                <CheckCircle className="text-emerald-500" size={22} />
                                            ) : (
                                                <div className="w-5 h-5 rounded-full border-2 border-zinc-700 group-hover:border-zinc-500 transition-colors" />
                                            )}
                                        </div>
                                        <div className="col-span-6 md:pl-2 font-bold text-zinc-300 group-hover:text-white transition-colors flex items-center justify-center md:justify-start gap-2 w-full md:w-auto text-center md:text-left mb-3 md:mb-0">
                                            <span className="text-[15px]">{prob.title}</span>
                                            {prob.is_daily && (
                                                <span className="flex items-center gap-1 text-[10px] bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded-full">
                                                    <Star size={10} fill="currentColor" />
                                                    <span>Daily</span>
                                                </span>
                                            )}
                                        </div>
                                        <div className="col-span-3 flex justify-center w-full md:w-auto mb-4 md:mb-0">
                                            <span className={`px-3 py-1 rounded-md text-[11px] font-bold border ${getDifficultyColor(prob.difficulty)}`}>
                                                {prob.difficulty}
                                            </span>
                                        </div>
                                        <div className="col-span-2 flex justify-center w-full md:w-auto">
                                            <button className="flex items-center gap-2 text-sm bg-zinc-900 border border-white/[0.08] text-white group-hover:border-[var(--accent)] group-hover:text-[var(--accent)] group-hover:shadow-[0_0_15px_rgba(255,42,42,0.2)] px-4 py-2 rounded-full font-bold transition-all duration-300">
                                                <Play size={14} className="group-hover:fill-[var(--accent)]" />
                                                <span>Solve</span>
                                            </button>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </Skeleton>
                </div>
            </div>
        </div>
    );
};

export default ProblemsPage;

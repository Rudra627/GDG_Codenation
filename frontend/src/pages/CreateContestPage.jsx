import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Target, Search, PlusCircle, Trash, Clock } from 'lucide-react';
import Loader from '../components/Loader';

const CreateContestPage = () => {
    const navigate = useNavigate();
    const { user, token } = useContext(AuthContext);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    
    // Problem Selection
    const [allProblems, setAllProblems] = useState([]);
    const [selectedProblems, setSelectedProblems] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user || user.role !== 'Admin') {
             navigate('/contests');
             return;
        }

        const fetchProblems = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/problems`, {
                    headers: { Authorization: `Bearer ${token || localStorage.getItem('token')}` }
                });
                setAllProblems(res.data);
            } catch (err) {
                console.error("Failed to load problems", err);
            } finally {
                setLoading(false);
            }
        };
        fetchProblems();
    }, [user, navigate, token]);

    const handleAddProblem = (prob) => {
        if (!selectedProblems.find(p => p.id === prob.id)) {
            setSelectedProblems([...selectedProblems, { ...prob, points: 100 }]);
        }
    };

    const handleRemoveProblem = (id) => {
        setSelectedProblems(selectedProblems.filter(p => p.id !== id));
    };

    const handlePointsChange = (id, points) => {
        setSelectedProblems(selectedProblems.map(p => p.id === id ? { ...p, points: parseInt(points) || 0 } : p));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        if (new Date(startTime) >= new Date(endTime)) {
            setError("End time must be after start time");
            setSubmitting(false);
            return;
        }
        
        if (selectedProblems.length === 0) {
            setError("Please select at least one problem");
            setSubmitting(false);
            return;
        }

        try {
            const tk = token || localStorage.getItem('token');
            const payload = {
                title,
                description,
                start_time: new Date(startTime).toISOString().slice(0, 19).replace('T', ' '),
                end_time: new Date(endTime).toISOString().slice(0, 19).replace('T', ' '),
                problems: selectedProblems.map(p => ({ id: p.id, points: p.points }))
            };

            await axios.post(`${import.meta.env.VITE_API_URL}/api/contests`, payload, {
                headers: { Authorization: `Bearer ${tk}` }
            });

            navigate('/contests');
        } catch (err) {
            console.error("Failed to create contest", err);
            setError(err.response?.data?.message || 'Failed to create contest');
            setSubmitting(false);
        }
    };

    const filteredProblems = allProblems.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

    if (loading) return <Loader />;

    return (
        <div className="flex-grow bg-black font-mono text-gray-300 p-6 md:p-12">
            <div className="max-w-4xl mx-auto hud-glass p-8 rounded-xl relative border-[3px] border-[#07fc03]/20 glowing-box">
                 {/* HUD Decorators */}
                <div className="hud-corner-tl !border-[#07fc03]"></div>
                <div className="hud-corner-tr !border-[#07fc03]"></div>
                <div className="hud-corner-bl !border-[#07fc03]"></div>
                <div className="hud-corner-br !border-[#07fc03]"></div>

                <h1 className="text-3xl font-bold text-[#07fc03] uppercase tracking-widest mb-8 flex items-center gap-3">
                    <Target size={32} />
                    Create New Contest
                </h1>

                {error && <div className="bg-red-500/10 border border-red-500 text-red-500 p-4 rounded mb-6 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm text-[#07fc03] mb-2 uppercase tracking-widest">Contest Title</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-black/50 border border-gray-700 text-white rounded px-4 py-2 focus:border-[#07fc03] focus:outline-none"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm text-[#07fc03] mb-2 uppercase tracking-widest">Description</label>
                        <textarea
                            required
                            rows="3"
                            className="w-full bg-black/50 border border-gray-700 text-white rounded px-4 py-2 focus:border-[#07fc03] focus:outline-none"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm text-[#07fc03] mb-2 uppercase tracking-widest flex items-center gap-2"><Clock size={16} /> Start Time (Local)</label>
                            <input
                                type="datetime-local"
                                required
                                className="w-full bg-black/50 border border-gray-700 text-[#07fc03] rounded px-4 py-2 focus:border-[#07fc03] focus:outline-none"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-[#07fc03] mb-2 uppercase tracking-widest flex items-center gap-2"><Clock size={16} /> End Time (Local)</label>
                            <input
                                type="datetime-local"
                                required
                                className="w-full bg-black/50 border border-gray-700 text-[#07fc03] rounded px-4 py-2 focus:border-[#07fc03] focus:outline-none"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Selected Problems Box */}
                    <div className="mt-8 border-t border-gray-800 pt-8">
                        <h2 className="text-xl text-white font-bold mb-4 uppercase tracking-widest">Selected Problems</h2>
                        {selectedProblems.length === 0 && <p className="text-gray-500 italic text-sm">No problems selected yet.</p>}
                        <div className="space-y-3">
                            {selectedProblems.map(p => (
                                <div key={p.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-black border border-[#07fc03]/30 p-3 rounded gap-4 sm:gap-0">
                                    <div className="flex flex-col">
                                        <span className="text-white font-bold">{p.title}</span>
                                        <span className="text-xs text-gray-400">{p.difficulty}</span>
                                    </div>
                                    <div className="flex items-center justify-between w-full sm:w-auto gap-4 self-end sm:self-auto">
                                        <div className="flex items-center gap-2 sm:gap-4 ml-auto sm:ml-0">
                                            <div className="flex flex-col items-center">
                                                <span className="text-xs text-[#07fc03] tracking-widest uppercase">PTS</span>
                                                <input type="number" className="w-20 bg-gray-900 border border-gray-700 text-center text-white py-1 rounded" value={p.points} onChange={(e) => handlePointsChange(p.id, e.target.value)} />
                                            </div>
                                            <button type="button" onClick={() => handleRemoveProblem(p.id)} className="text-red-500 hover:text-red-400 p-2 border border-transparent hover:border-red-500/30 rounded-full">
                                                <Trash size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Problem Arsenal */}
                    <div className="mt-8 border-t border-gray-800 pt-8">
                        <h2 className="text-xl text-white font-bold mb-4 uppercase tracking-widest flex items-center gap-2">
                            Problem Arsenal
                        </h2>
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-3 text-[#07fc03]" size={18} />
                            <input
                                type="text"
                                placeholder="Search repository..."
                                className="w-full bg-black border border-gray-800 rounded-lg pl-10 pr-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-[#07fc03]"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {filteredProblems.filter(p => !selectedProblems.find(sp => sp.id === p.id)).map(p => (
                                <div key={p.id} className="flex justify-between items-center bg-[#111] p-3 rounded hover:bg-[#07fc03]/10 smooth-transition cursor-default group border border-transparent hover:border-[#07fc03]/50">
                                     <div>
                                        <div className="text-gray-300 font-bold group-hover:text-[#07fc03]">{p.title}</div>
                                        <div className="text-xs text-gray-500">{p.difficulty}</div>
                                     </div>
                                     <button type="button" onClick={() => handleAddProblem(p)} className="text-[#07fc03] opacity-50 hover:opacity-100 p-2 rounded-full hover:bg-[#07fc03]/20">
                                         <PlusCircle size={20} />
                                     </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-12 pt-6 flex justify-end">
                        <button type="submit" disabled={submitting} className="bg-[#07fc03] hover:bg-[#00cc00] text-black font-bold uppercase tracking-widest px-10 py-3 rounded shadow-[0_0_15px_rgba(7,252,3,0.4)] disabled:opacity-50">
                            {submitting ? 'Initializing...' : 'Deploy Contest'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateContestPage;

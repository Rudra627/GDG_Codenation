import { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Target, Search, PlusCircle, Trash, Clock } from 'lucide-react';
import Loader from '../components/Loader';

const EditContestPage = () => {
    const { id } = useParams();
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

        const fetchData = async () => {
            try {
                const tk = token || localStorage.getItem('token');
                
                // Fetch contest details
                const contestRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/contests/${id}`, {
                    headers: { Authorization: `Bearer ${tk}` }
                });
                
                const contest = contestRes.data;
                setTitle(contest.title);
                setDescription(contest.description);
                
                // Format dates for datetime-local input
                const formatForInput = (dateString) => {
                    const d = new Date(dateString);
                    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
                    return d.toISOString().slice(0, 16);
                };
                
                if (contest.start_time) setStartTime(formatForInput(contest.start_time));
                if (contest.end_time) setEndTime(formatForInput(contest.end_time));
                
                if (contest.problems) {
                    setSelectedProblems(contest.problems);
                }

                // Fetch all problems
                const probRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/problems`, {
                    headers: { Authorization: `Bearer ${tk}` }
                });
                setAllProblems(probRes.data);
            } catch (err) {
                console.error("Failed to load data", err);
                setError("Failed to load contest details.");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, user, navigate, token]);

    const handleAddProblem = (prob) => {
        if (!selectedProblems.find(p => p.id === prob.id)) {
            setSelectedProblems([...selectedProblems, { ...prob, points: 100 }]);
        }
    };

    const handleRemoveProblem = (probId) => {
        setSelectedProblems(selectedProblems.filter(p => p.id !== probId));
    };

    const handlePointsChange = (probId, points) => {
        setSelectedProblems(selectedProblems.map(p => p.id === probId ? { ...p, points: parseInt(points) || 0 } : p));
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
            const dStart = new Date(startTime);
            const dEnd = new Date(endTime);
            
            const payload = {
                title,
                description,
                start_time: dStart.toISOString().slice(0, 19).replace('T', ' '),
                end_time: dEnd.toISOString().slice(0, 19).replace('T', ' '),
                problems: selectedProblems.map(p => ({ id: p.id, points: p.points }))
            };

            await axios.put(`${import.meta.env.VITE_API_URL}/api/contests/${id}`, payload, {
                headers: { Authorization: `Bearer ${tk}` }
            });

            navigate(`/contests/${id}`);
        } catch (err) {
            console.error("Failed to update contest", err);
            setError(err.response?.data?.message || 'Failed to update contest');
            setSubmitting(false);
        }
    };

    const filteredProblems = allProblems.filter(p => p.title.toLowerCase().includes(searchTerm.toLowerCase()));

    if (loading) return <Loader />;

    return (
        <div className="flex-grow bg-[#09090B] text-zinc-300 p-6 md:p-12 relative">
            {/* Ambient glow */}
            <div className="absolute top-0 right-1/4 w-[400px] h-[400px] bg-white/[0.03] rounded-full blur-[120px] pointer-events-none" />
            
            <div className="max-w-4xl mx-auto bg-[#111113] border border-white/[0.06] p-8 rounded-2xl relative z-10">

                <h1 className="text-2xl md:text-3xl font-extrabold text-white mb-8 flex items-center gap-3">
                    <Target size={28} className="text-white" />
                    Edit Contest
                </h1>

                {error && <div className="bg-red-500/[0.08] border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm text-zinc-400 mb-2 font-medium">Contest Title</label>
                        <input
                            type="text"
                            required
                            className="w-full bg-[#09090B] border border-white/[0.08] text-white rounded-lg px-4 py-2.5 focus:border-white/40 focus:outline-none transition-colors"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm text-zinc-400 mb-2 font-medium">Description</label>
                        <textarea
                            required
                            rows="3"
                            className="w-full bg-[#09090B] border border-white/[0.08] text-white rounded-lg px-4 py-2.5 focus:border-white/40 focus:outline-none transition-colors resize-none"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm text-zinc-400 mb-2 font-medium flex items-center gap-2"><Clock size={14} className="text-white/60" /> Start Time (Local)</label>
                            <input
                                type="datetime-local"
                                required
                                className="w-full bg-[#09090B] border border-white/[0.08] text-white rounded-lg px-4 py-2.5 focus:border-white/40 focus:outline-none transition-colors"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-sm text-zinc-400 mb-2 font-medium flex items-center gap-2"><Clock size={14} className="text-white/60" /> End Time (Local)</label>
                            <input
                                type="datetime-local"
                                required
                                className="w-full bg-[#09090B] border border-white/[0.08] text-white rounded-lg px-4 py-2.5 focus:border-white/40 focus:outline-none transition-colors"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Selected Problems Box */}
                    <div className="mt-8 border-t border-white/[0.06] pt-8">
                        <h2 className="text-lg text-white font-bold mb-4">Selected Problems</h2>
                        {selectedProblems.length === 0 && <p className="text-zinc-500 text-sm">No problems selected yet.</p>}
                        <div className="space-y-3">
                            {selectedProblems.map(p => (
                                <div key={p.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#09090B] border border-white/15 p-4 rounded-xl gap-4 sm:gap-0">
                                    <div className="flex flex-col">
                                        <span className="text-white font-semibold">{p.title}</span>
                                        <span className="text-xs text-zinc-500">{p.difficulty}</span>
                                    </div>
                                    <div className="flex items-center justify-between w-full sm:w-auto gap-4 self-end sm:self-auto">
                                        <div className="flex items-center gap-2 sm:gap-4 ml-auto sm:ml-0">
                                            <div className="flex flex-col items-center">
                                                <span className="text-xs text-white/70 font-medium">PTS</span>
                                                <input type="number" className="w-20 bg-[#111113] border border-white/[0.08] text-center text-white py-1.5 rounded-lg text-sm focus:border-white/40 focus:outline-none" value={p.points} onChange={(e) => handlePointsChange(p.id, e.target.value)} />
                                            </div>
                                            <button type="button" onClick={() => handleRemoveProblem(p.id)} className="text-red-400 hover:text-red-300 p-2 border border-transparent hover:border-red-500/20 rounded-lg transition-all">
                                                <Trash size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Problem Arsenal */}
                    <div className="mt-8 border-t border-white/[0.06] pt-8">
                        <h2 className="text-lg text-white font-bold mb-4 flex items-center gap-2">
                            Available Problems
                        </h2>
                        <div className="relative mb-4">
                            <Search className="absolute left-3 top-3 text-white/50" size={18} />
                            <input
                                type="text"
                                placeholder="Search problems..."
                                className="w-full bg-[#09090B] border border-white/[0.08] rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-zinc-600 focus:outline-none focus:border-white/40 transition-colors"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                            {filteredProblems.filter(p => !selectedProblems.find(sp => sp.id === p.id)).map(p => (
                                <div key={p.id} className="flex justify-between items-center bg-[#0c0c0e] p-3 rounded-xl hover:bg-white/[0.04] transition-all cursor-default group border border-transparent hover:border-white/20">
                                     <div>
                                        <div className="text-zinc-300 font-semibold group-hover:text-white transition-colors text-sm">{p.title}</div>
                                        <div className="text-xs text-zinc-600">{p.difficulty}</div>
                                     </div>
                                     <button type="button" onClick={() => handleAddProblem(p)} className="text-white opacity-50 hover:opacity-100 p-2 rounded-lg hover:bg-white/[0.1] transition-all">
                                         <PlusCircle size={20} />
                                     </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-12 pt-6 flex justify-end gap-3">
                        <button type="button" onClick={() => navigate(`/contests/${id}`)} className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors disabled:opacity-50">
                            Cancel
                        </button>
                        <button type="submit" disabled={submitting} className="bg-white hover:bg-[#00e085] text-[#09090B] font-bold text-sm px-8 py-2.5 rounded-lg shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_28px_rgba(255,255,255,0.3)] transition-all disabled:opacity-50">
                            {submitting ? 'Updating...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditContestPage;

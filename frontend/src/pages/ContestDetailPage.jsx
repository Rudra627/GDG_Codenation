import { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Clock, Users, Trophy, PlayCircle, Loader2 } from 'lucide-react';
import Loader from '../components/Loader';

const ContestDetailPage = () => {
    const { id } = useParams();
    const { user, token } = useContext(AuthContext);
    const [contest, setContest] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);
    const [sendingReminder, setSendingReminder] = useState(false);
    const [joinMessage, setJoinMessage] = useState('');
    const [reminderMessage, setReminderMessage] = useState('');
    const [activeTab, setActiveTab] = useState('problems'); // 'problems' or 'leaderboard'
    const [timeRemaining, setTimeRemaining] = useState('');

    useEffect(() => {
        const fetchContest = async () => {
            try {
                const tk = token || localStorage.getItem('token');
                if (!tk) return;
                
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/contests/${id}`, {
                    headers: { Authorization: `Bearer ${tk}` }
                });
                setContest(res.data);
                
                // Fetch Leaderboard
                const lbRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/contests/${id}/leaderboard`, {
                    headers: { Authorization: `Bearer ${tk}` }
                });
                setLeaderboard(lbRes.data);
                
            } catch (err) {
                console.error("Error fetching contest:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchContest();
    }, [id, token]);

    // Countdown Timer Logic
    useEffect(() => {
        if (!contest) return;

        const interval = setInterval(() => {
            const now = new Date();
            const start = new Date(contest.start_time);
            const end = new Date(contest.end_time);

            if (now < start) {
                const diff = start - now;
                const d = Math.floor(diff / (1000 * 60 * 60 * 24));
                const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
                const m = Math.floor((diff / 1000 / 60) % 60);
                const s = Math.floor((diff / 1000) % 60);
                setTimeRemaining(`STARTS IN: ${d}d ${h}h ${m}m ${s}s`);
            } else if (now >= start && now < end) {
                const diff = end - now;
                const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
                const m = Math.floor((diff / 1000 / 60) % 60);
                const s = Math.floor((diff / 1000) % 60);
                setTimeRemaining(`ENDS IN: ${h}h ${m}m ${s}s`);
            } else {
                setTimeRemaining('CONTEST OVER');
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [contest]);

    const handleJoin = async () => {
        setJoining(true);
        setJoinMessage('');
        try {
            const tk = token || localStorage.getItem('token');
            await axios.post(`${import.meta.env.VITE_API_URL}/api/contests/${id}/join`, {}, {
                headers: { Authorization: `Bearer ${tk}` }
            });
            setJoinMessage('Successfully Joined! You appear on the roster.');
            // Refresh Leaderboard to show user at 0
            const lbRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/contests/${id}/leaderboard`, {
                headers: { Authorization: `Bearer ${tk}` }
            });
            setLeaderboard(lbRes.data);
        } catch (err) {
            setJoinMessage(err.response?.data?.message || 'Failed to join');
        } finally {
            setJoining(false);
        }
    };

    const handleSendReminder = async () => {
        if (!window.confirm("Are you sure you want to email a reminder to EVERY participant?")) return;
        
        setSendingReminder(true);
        setReminderMessage('');
        try {
            const tk = token || localStorage.getItem('token');
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/contests/${id}/remind`, {}, {
                headers: { Authorization: `Bearer ${tk}` }
            });
            setReminderMessage(`Success! Sent ${res.data.successCount} emails. (${res.data.failCount} failed).`);
        } catch (err) {
            setReminderMessage(err.response?.data?.message || 'Failed to send reminders');
        } finally {
            setSendingReminder(false);
        }
    };

    if (loading) return <Loader />;
    if (!contest) return <div className="text-white p-12 text-center">Contest not found.</div>;

    const now = new Date();
    const start = new Date(contest.start_time);
    const status = now < start ? 'upcoming' : now < new Date(contest.end_time) ? 'active' : 'past';

    let statusColor = "text-[#07fc03]";
    if (status === 'active') statusColor = "text-red-500 animate-pulse";
    if (status === 'past') statusColor = "text-gray-500";

    return (
        <div className="flex-grow flex justify-center bg-black min-h-screen text-gray-300 font-mono p-4 md:p-8">
            <div className="w-full max-w-5xl">
                
                {/* Header Section */}
                <div className="border border-[#07fc03]/30 bg-[#0a0a0a] rounded-xl p-8 mb-8 relative overflow-hidden">
                    <div className="absolute -top-10 -right-10 text-[#07fc03]/10">
                        <Trophy size={200} />
                    </div>
                    
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl md:text-5xl font-bold text-white uppercase tracking-tight">{contest.title}</h1>
                                <span className={`border border-current px-3 py-1 text-xs uppercase tracking-widest rounded-full ${statusColor}`}>
                                    {status}
                                </span>
                            </div>
                            <p className="text-gray-400 mt-4 max-w-2xl leading-relaxed">{contest.description}</p>
                        </div>
                        
                        <div className="mt-6 md:mt-0 flex flex-col items-end gap-3">
                            <div className="text-2xl md:text-3xl font-bold text-[#07fc03] tracking-widest bg-black/50 border border-[#07fc03]/50 px-6 py-3 rounded-lg shadow-[0_0_15px_rgba(7,252,3,0.2)]">
                                {timeRemaining || "CALCULATING..."}
                            </div>
                            
                            {user && user.role === 'Admin' && status === 'upcoming' && (
                                <div className="flex flex-col items-end w-full mt-2">
                                     <button 
                                        onClick={handleSendReminder}
                                        disabled={sendingReminder}
                                        className="text-xs bg-red-900/50 hover:bg-red-800 text-red-200 border border-red-500 py-1 px-3 rounded transition-all uppercase tracking-widest disabled:opacity-50"
                                     >
                                         {sendingReminder ? 'SENDING EMAILS...' : 'ADMIN: SEND REMINDER (EMAIL)'}
                                     </button>
                                     {reminderMessage && <span className="text-xs text-red-400 mt-1">{reminderMessage}</span>}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Join Logic Action Center */}
                    {status === 'upcoming' && (
                        <div className="mt-10 border-t border-gray-800 pt-8 flex flex-col items-center">
                            <button 
                                onClick={handleJoin} 
                                disabled={joining}
                                className="bg-[#07fc03] hover:bg-[#00cc00] text-black font-bold uppercase tracking-widest px-12 py-4 shadow-[0_0_20px_rgba(7,252,3,0.4)] transition-all transform hover:scale-105 rounded-sm disabled:opacity-50"
                                style={{ clipPath: 'polygon(5% 0, 100% 0, 95% 100%, 0% 100%)' }}
                            >
                                {joining ? 'ESTABLISHING CONNECTION...' : 'JOIN PROTOCOL'}
                            </button>
                            {joinMessage && <p className="mt-4 text-[#07fc03] tracking-widest">{joinMessage}</p>}
                        </div>
                    )}
                </div>

                {/* Tabs */}
                {status !== 'upcoming' && (
                    <div className="flex space-x-1 mb-6 border-b border-gray-800">
                        <button 
                            className={`px-8 py-3 text-sm font-bold uppercase tracking-widest smooth-transition ${activeTab === 'problems' ? 'text-[#07fc03] border-b-2 border-[#07fc03] bg-[#07fc03]/10' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                            onClick={() => setActiveTab('problems')}
                        >
                            <PlayCircle size={16} className="inline mr-2" />
                            Problems
                        </button>
                        <button 
                            className={`px-8 py-3 text-sm font-bold uppercase tracking-widest smooth-transition ${activeTab === 'leaderboard' ? 'text-[#07fc03] border-b-2 border-[#07fc03] bg-[#07fc03]/10' : 'text-gray-500 hover:text-white hover:bg-white/5'}`}
                            onClick={() => setActiveTab('leaderboard')}
                        >
                            <Trophy size={16} className="inline mr-2" />
                            Leaderboard
                        </button>
                    </div>
                )}

                {/* Tab Views */}
                {status !== 'upcoming' && activeTab === 'problems' && (
                    <div className="space-y-4">
                        {contest.problems && contest.problems.length > 0 ? (
                            contest.problems.map((p, idx) => (
                                <Link 
                                    to={`/problems/${p.id}?contestId=${contest.id}`} 
                                    key={p.id}
                                    className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#0a0a0a] border border-[#07fc03]/20 hover:border-[#07fc03]/80 p-4 sm:p-5 rounded-lg smooth-transition group gap-4 sm:gap-0"
                                >
                                    <div className="flex items-center gap-4 sm:gap-6">
                                        <div className="text-xl sm:text-2xl font-bold text-gray-700 group-hover:text-[#07fc03]/50 w-6 sm:w-8">{idx + 1}</div>
                                        <div>
                                            <h3 className="text-lg sm:text-xl font-bold text-gray-200 group-hover:text-white">{p.title}</h3>
                                            <span className={`text-[10px] sm:text-xs uppercase tracking-widest ${p.difficulty==='Easy'?'text-green-500':p.difficulty==='Medium'?'text-yellow-500':'text-red-500'}`}>
                                                {p.difficulty}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end self-end sm:self-auto">
                                        <span className="text-[#07fc03] tracking-widest font-bold text-sm sm:text-base">{p.points} PTS</span>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <p className="text-gray-500 text-center py-12 border border-dashed border-gray-800 rounded-xl">No problems assigned to this contest.</p>
                        )}
                    </div>
                )}

                {status !== 'upcoming' && activeTab === 'leaderboard' && (
                    <div className="border border-gray-800 bg-[#0a0a0a] rounded-xl overflow-x-auto">
                        <div className="min-w-[600px]">
                            <table className="w-full text-left">
                                <thead className="bg-black border-b border-[#07fc03]/30 text-xs uppercase tracking-widest text-[#07fc03]">
                                    <tr>
                                        <th className="px-6 py-4">Rank</th>
                                        <th className="px-6 py-4">Hacker</th>
                                        <th className="px-6 py-4">Score</th>
                                        <th className="px-6 py-4">Penalty (Mins)</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {leaderboard.map((lb, idx) => (
                                        <tr key={lb.user_id} className="hover:bg-[#07fc03]/5 smooth-transition">
                                            <td className="px-6 py-4">
                                                {idx === 0 ? <span className="text-yellow-500 font-bold text-xl drop-shadow-[0_0_10px_rgba(255,215,0,0.8)]">#1</span> 
                                                : idx === 1 ? <span className="text-gray-300 font-bold text-lg">#2</span>
                                                : idx === 2 ? <span className="text-amber-700 font-bold text-lg">#3</span>
                                                : <span className="text-gray-500 font-bold">#{idx + 1}</span>}
                                            </td>
                                            <td className="px-6 py-4 text-white font-bold">{lb.name}</td>
                                            <td className="px-6 py-4 text-[#07fc03] font-bold">{lb.score}</td>
                                            <td className="px-6 py-4 text-red-400">{lb.penalty}</td>
                                        </tr>
                                    ))}
                                    {leaderboard.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-12 text-center text-gray-500">No participants registered or ranked yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ContestDetailPage;

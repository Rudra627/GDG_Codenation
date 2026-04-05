import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Clock, Users, Trophy, PlayCircle, Loader2 } from 'lucide-react';
import Loader from '../components/Loader';
import { Skeleton } from 'boneyard-js/react';

const ContestDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
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
                setTimeRemaining(`Starts in ${d}d ${h}h ${m}m ${s}s`);
            } else if (now >= start && now < end) {
                const diff = end - now;
                const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
                const m = Math.floor((diff / 1000 / 60) % 60);
                const s = Math.floor((diff / 1000) % 60);
                setTimeRemaining(`Ends in ${h}h ${m}m ${s}s`);
            } else {
                setTimeRemaining('Contest Over');
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
            setJoinMessage('Successfully joined! You appear on the roster.');
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
        if (!window.confirm("Are you sure you want to email a reminder to every participant?")) return;
        
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

    if (loading) return (
        <Skeleton name="contest-detail-page" loading={true}>
            <div className="flex-grow flex justify-center bg-[#09090B] min-h-screen p-4 md:p-8"></div>
        </Skeleton>
    );
    if (!contest) return <div className="text-white p-12 text-center bg-[#09090B] flex-grow flex items-center justify-center">Contest not found.</div>;

    const now = new Date();
    const start = new Date(contest.start_time);
    const status = now < start ? 'upcoming' : now < new Date(contest.end_time) ? 'active' : 'past';

    const statusBadge = status === 'upcoming' 
        ? 'text-white bg-white/[0.08] border-white/20'
        : status === 'active'
        ? 'text-red-400 bg-red-400/[0.08] border-red-400/20 animate-pulse'
        : 'text-zinc-500 bg-zinc-500/[0.08] border-zinc-500/20';

    return (
        <Skeleton name="contest-detail-page" loading={false}>
            <div className="flex-grow flex justify-center bg-[#09090B] text-zinc-300 p-4 md:p-8 relative">
                {/* Ambient glow */}
                <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-white/[0.03] rounded-full blur-[120px] pointer-events-none" />
                
                <div className="w-full max-w-5xl relative z-10">
                    
                    {/* Header Section */}
                    <div className="border border-white/[0.06] bg-[#111113] rounded-2xl p-8 mb-8 relative overflow-hidden">
                        <div className="absolute -top-10 -right-10 text-white/[0.06]">
                            <Trophy size={200} />
                        </div>
                        
                        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center">
                            <div>
                                <div className="flex items-center gap-3 mb-2 flex-wrap">
                                    <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">{contest.title}</h1>
                                    <span className={`border px-3 py-1 text-xs font-semibold uppercase tracking-wider rounded-full ${statusBadge}`}>
                                        {status}
                                    </span>
                                </div>
                                <p className="text-zinc-400 mt-4 max-w-2xl leading-relaxed text-sm">{contest.description}</p>
                                <div className="flex items-center gap-6 mt-5 text-zinc-500 text-sm">
                                    <div className="flex items-center gap-2">
                                        <Clock size={16} className="text-white/50" />
                                        <span>{new Date(contest.start_time).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} - {new Date(contest.end_time).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Users size={16} className="text-white/50" />
                                        <span>{contest.participants_count || 0} Registered</span>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-6 md:mt-0 flex flex-col items-end gap-3">
                                <div className="text-xl md:text-2xl font-bold text-white tracking-wide bg-white/[0.06] border border-white/20 px-6 py-3 rounded-xl shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                                    {timeRemaining || "Calculating..."}
                                </div>
                                
                                {user && user.role === 'Admin' && status === 'upcoming' && (
                                    <div className="flex flex-col items-end w-full mt-2">
                                         <button 
                                            onClick={handleSendReminder}
                                            disabled={sendingReminder}
                                            className="text-xs bg-red-500/[0.08] hover:bg-red-500/[0.15] text-red-400 border border-red-500/20 py-1.5 px-4 rounded-lg transition-all font-medium disabled:opacity-50"
                                         >
                                             {sendingReminder ? 'Sending emails...' : 'Admin: Send reminder email'}
                                         </button>
                                         {reminderMessage && <span className="text-xs text-red-400 mt-1">{reminderMessage}</span>}
                                    </div>
                                )}
                                
                                {user && user.role === 'Admin' && (
                                    <div className="flex flex-row items-end gap-2 mt-2">
                                         <Link 
                                            to={`/contests/${contest.id}/edit`}
                                            className="text-xs bg-[#06B6D4]/[0.08] hover:bg-[#06B6D4]/[0.15] text-[#06B6D4] border border-[#06B6D4]/20 py-1.5 px-4 rounded-lg transition-all font-medium"
                                         >
                                             Edit Contest
                                         </Link>
                                         <button 
                                            onClick={async () => {
                                                if (!window.confirm("Are you sure you want to delete this contest? All related data will be lost.")) return;
                                                try {
                                                    const tk = token || localStorage.getItem('token');
                                                    await axios.delete(`${import.meta.env.VITE_API_URL}/api/contests/${contest.id}`, {
                                                        headers: { Authorization: `Bearer ${tk}` }
                                                    });
                                                    navigate('/contests');
                                                } catch (err) {
                                                    alert(err.response?.data?.message || 'Failed to delete contest');
                                                }
                                            }}
                                            className="text-xs bg-red-500/[0.08] hover:bg-red-500/[0.15] text-red-400 border border-red-500/20 py-1.5 px-4 rounded-lg transition-all font-medium"
                                         >
                                             Delete
                                         </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        
                        {/* Join Logic Action Center */}
                        {status === 'upcoming' && (
                            <div className="mt-10 border-t border-white/[0.06] pt-8 flex flex-col items-center">
                                <button 
                                    onClick={handleJoin} 
                                    disabled={joining}
                                    className="bg-white hover:bg-[#00e085] text-[#09090B] font-bold text-sm px-10 py-3.5 rounded-lg shadow-[0_0_24px_rgba(255,255,255,0.25)] hover:shadow-[0_0_32px_rgba(255,255,255,0.35)] transition-all duration-300 transform hover:scale-105 disabled:opacity-50"
                                >
                                    {joining ? 'Joining...' : 'Join Contest'}
                                </button>
                                {joinMessage && <p className="mt-4 text-white text-sm font-medium">{joinMessage}</p>}
                            </div>
                        )}
                    </div>

                    {/* Tabs */}
                    {status !== 'upcoming' && (
                        <div className="flex space-x-1 mb-6 border-b border-white/[0.06]">
                            <button 
                                className={`px-6 py-3 text-sm font-semibold transition-all ${activeTab === 'problems' ? 'text-white border-b-2 border-white bg-white/[0.04]' : 'text-zinc-500 hover:text-white hover:bg-white/[0.02]'}`}
                                onClick={() => setActiveTab('problems')}
                            >
                                <PlayCircle size={15} className="inline mr-2" />
                                Problems
                            </button>
                            <button 
                                className={`px-6 py-3 text-sm font-semibold transition-all ${activeTab === 'leaderboard' ? 'text-white border-b-2 border-white bg-white/[0.04]' : 'text-zinc-500 hover:text-white hover:bg-white/[0.02]'}`}
                                onClick={() => setActiveTab('leaderboard')}
                            >
                                <Trophy size={15} className="inline mr-2" />
                                Leaderboard
                            </button>
                        </div>
                    )}

                    {/* Tab Views */}
                    {status !== 'upcoming' && activeTab === 'problems' && (
                        <div className="space-y-3">
                            {contest.problems && contest.problems.length > 0 ? (
                                contest.problems.map((p, idx) => (
                                    <Link 
                                        to={`/problem/${p.id}?contestId=${contest.id}`} 
                                        key={p.id}
                                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#111113] border border-white/[0.06] hover:border-white/30 p-4 sm:p-5 rounded-xl transition-all duration-300 group gap-4 sm:gap-0"
                                    >
                                        <div className="flex items-center gap-4 sm:gap-6">
                                            <div className="text-xl sm:text-2xl font-bold text-zinc-700 group-hover:text-white/50 w-6 sm:w-8 transition-colors">{idx + 1}</div>
                                            <div>
                                                <h3 className="text-base sm:text-lg font-semibold text-zinc-200 group-hover:text-white transition-colors">{p.title}</h3>
                                                <span className={`text-xs font-medium ${p.difficulty==='Easy'?'text-zinc-400':p.difficulty==='Medium'?'text-yellow-400':'text-red-400'}`}>
                                                    {p.difficulty}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end self-end sm:self-auto">
                                            <span className="text-white font-bold text-sm sm:text-base">{p.points} pts</span>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                <p className="text-zinc-500 text-center py-12 border border-dashed border-white/[0.06] rounded-xl text-sm">No problems assigned to this contest.</p>
                            )}
                        </div>
                    )}

                    {status !== 'upcoming' && activeTab === 'leaderboard' && (
                        <div className="border border-white/[0.06] bg-[#111113] rounded-2xl overflow-x-auto">
                            <div className="min-w-[600px]">
                                <table className="w-full text-left">
                                    <thead className="bg-[#0c0c0e] border-b border-white/[0.06] text-xs uppercase tracking-wider text-white">
                                        <tr>
                                            <th className="px-6 py-4 font-semibold">Rank</th>
                                            <th className="px-6 py-4 font-semibold">Participant</th>
                                            <th className="px-6 py-4 font-semibold">Score</th>
                                            <th className="px-6 py-4 font-semibold">Penalty (Mins)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/[0.04]">
                                        {leaderboard.map((lb, idx) => (
                                            <tr key={lb.user_id} className="hover:bg-white/[0.02] transition-colors">
                                                <td className="px-6 py-4">
                                                    {idx === 0 ? <span className="text-yellow-400 font-bold text-lg">🥇</span> 
                                                    : idx === 1 ? <span className="text-zinc-300 font-bold text-lg">🥈</span>
                                                    : idx === 2 ? <span className="text-amber-600 font-bold text-lg">🥉</span>
                                                    : <span className="text-zinc-500 font-semibold">#{idx + 1}</span>}
                                                </td>
                                                <td className="px-6 py-4 text-white font-semibold">{lb.name}</td>
                                                <td className="px-6 py-4 text-white font-bold">{lb.score}</td>
                                                <td className="px-6 py-4 text-red-400">{lb.penalty}</td>
                                            </tr>
                                        ))}
                                        {leaderboard.length === 0 && (
                                            <tr>
                                                <td colSpan="4" className="px-6 py-12 text-center text-zinc-500 text-sm">No participants registered or ranked yet.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Skeleton>
    );
};

export default ContestDetailPage;

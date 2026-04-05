import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Trophy, Clock, PlayCircle, Plus, Users } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { Skeleton } from 'boneyard-js/react';
// remove loader import since it's not used here anymore if we like, but it might break if it's not used. Let's keep it.
import Loader from '../components/Loader';

const ContestsPage = () => {
    const [contests, setContests] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchContests = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/contests`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setContests(res.data);
            } catch (err) {
                console.error('Error fetching contests:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchContests();
    }, []);

    const now = new Date();
    
    const upcoming = contests.filter(c => new Date(c.start_time) > now);
    const active = contests.filter(c => new Date(c.start_time) <= now && new Date(c.end_time) > now);
    const past = contests.filter(c => new Date(c.end_time) <= now);

    const ContestCard = ({ contest, status }) => {
        let statusColor = "text-zinc-500";
        let statusBorder = "border-zinc-800";
        let statusBg = "bg-zinc-500/10";
        if (status === 'active') {
             statusColor = "text-red-400 animate-pulse";
             statusBorder = "border-red-500/20";
             statusBg = "bg-red-500/10";
        } else if (status === 'upcoming') {
             statusColor = "text-white";
             statusBorder = "border-white/20";
             statusBg = "bg-white/10";
        }

        return (
            <div className={`bg-[#111113] border border-white/[0.06] rounded-2xl p-6 hover:border-white/15 transition-all duration-300 card-hover relative group`}>
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-semibold text-white group-hover:text-white transition-colors">
                        <Link to={`/contests/${contest.id}`}>{contest.title}</Link>
                    </h3>
                    <span className={`text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full border ${statusBorder} ${statusColor} ${statusBg}`}>
                        {status}
                    </span>
                </div>
                <p className="text-zinc-500 text-sm mb-6 line-clamp-2">{contest.description}</p>
                <div className="flex items-center text-sm text-zinc-500 gap-5">
                    <div className="flex items-center gap-2">
                        <Clock size={14} className="text-zinc-600" />
                        <span>{new Date(contest.start_time).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Users size={14} className="text-zinc-600" />
                        <span>{contest.participants_count || 0}</span>
                    </div>
                </div>
                <div className="mt-6">
                     <Link to={`/contests/${contest.id}`} className="block w-full text-center bg-white/[0.03] hover:bg-white/10 text-white border border-white/[0.06] hover:border-white/20 text-sm py-2.5 rounded-xl transition-all duration-200 font-medium">
                        {status === 'past' ? 'View Results' : 'Enter Arena'}
                     </Link>
                </div>
            </div>
        );
    };

    return (
        <Skeleton name="contests-page" loading={loading}>
            <div className="flex-grow flex flex-col items-center bg-[#09090B] relative p-6 pt-12 md:p-12 min-h-screen">
                <div className="w-full max-w-6xl relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 border-b border-white/[0.06] pb-6">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
                                <Trophy className="text-white" size={32} />
                                Contests
                            </h1>
                            <p className="text-zinc-500 mt-2 text-sm">Compete. Rank Up. Dominate.</p>
                        </div>
                        {user && user.role === 'Admin' && (
                            <Link to="/contests/create" className="flex items-center gap-2 bg-white hover:bg-[#00e085] text-[#09090B] font-semibold px-5 py-2.5 rounded-lg shadow-[0_0_16px_rgba(255,255,255,0.15)] transition-all duration-200 text-sm">
                                <Plus size={16} /> Create Contest
                            </Link>
                        )}
                    </div>

                    {active.length > 0 && (
                        <div className="mb-12">
                            <h2 className="text-lg font-semibold text-red-400 flex items-center gap-2 mb-6">
                                <PlayCircle size={18} /> Active Now
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {active.map(c => <ContestCard key={c.id} contest={c} status="active" />)}
                            </div>
                        </div>
                    )}

                    {upcoming.length > 0 && (
                        <div className="mb-12">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2 mb-6">
                                <Clock size={18} /> Upcoming
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                {upcoming.map(c => <ContestCard key={c.id} contest={c} status="upcoming" />)}
                            </div>
                        </div>
                    )}

                    <div className="mb-12">
                        <h2 className="text-lg font-semibold text-zinc-400 mb-6">Past Contests</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                            {past.map(c => <ContestCard key={c.id} contest={c} status="past" />)}
                            {past.length === 0 && <p className="text-zinc-600 italic">No past contests found.</p>}
                        </div>
                    </div>
                </div>
            </div>
        </Skeleton>
    );
};

export default ContestsPage;

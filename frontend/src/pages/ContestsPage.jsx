import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Trophy, Clock, PlayCircle, Plus } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
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

    if (loading) return <Loader />;

    const now = new Date();
    
    const upcoming = contests.filter(c => new Date(c.start_time) > now);
    const active = contests.filter(c => new Date(c.start_time) <= now && new Date(c.end_time) > now);
    const past = contests.filter(c => new Date(c.end_time) <= now);

    const ContestCard = ({ contest, status }) => {
        let statusColor = "text-gray-500";
        let statusBorder = "border-gray-800";
        if (status === 'active') {
             statusColor = "text-red-500 animate-pulse";
             statusBorder = "border-red-500/30";
        } else if (status === 'upcoming') {
             statusColor = "text-[#07fc03]";
             statusBorder = "border-[#07fc03]/30";
        }

        return (
            <div className={`bg-[#0a0a0a] border ${statusBorder} rounded-xl p-6 hover:shadow-[0_0_15px_rgba(7,252,3,0.1)] smooth-transition relative group`}>
                <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold text-white group-hover:text-[#07fc03] transition-colors">
                        <Link to={`/contests/${contest.id}`}>{contest.title}</Link>
                    </h3>
                    <span className={`text-xs font-mono uppercase tracking-widest px-3 py-1 bg-black rounded-full border ${statusBorder} ${statusColor}`}>
                        {status}
                    </span>
                </div>
                <p className="text-gray-400 text-sm mb-6 line-clamp-2">{contest.description}</p>
                <div className="flex items-center text-sm text-gray-500 space-x-6 font-mono">
                    <div className="flex items-center space-x-2">
                        <Clock size={16} className="text-[#07fc03]/50" />
                        <span>{new Date(contest.start_time).toLocaleString()}</span>
                    </div>
                </div>
                <div className="mt-6">
                     <Link to={`/contests/${contest.id}`} className="block w-full text-center bg-gray-900 hover:bg-[#07fc03]/10 text-[#07fc03] border border-[#07fc03]/30 uppercase tracking-widest text-xs py-2 rounded-lg smooth-transition font-bold">
                        {status === 'past' ? 'View Results' : 'Enter Arena'}
                     </Link>
                </div>
            </div>
        );
    };

    return (
        <div className="flex-grow flex flex-col items-center bg-black relative p-6 pt-12 md:p-12 font-mono min-h-screen">
            <div className="w-full max-w-6xl relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10 border-b border-[#07fc03]/30 pb-6">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-bold text-white flex items-center gap-4 uppercase tracking-tight">
                            <Trophy className="text-[#07fc03]" size={40} />
                            CodeNation Contests
                        </h1>
                        <p className="text-gray-400 mt-2 tracking-widest uppercase text-xs">Compete. Rank Up. Dominate.</p>
                    </div>
                    {user && user.role === 'Admin' && (
                        <Link to="/contests/create" className="flex items-center gap-2 bg-[#07fc03] hover:bg-[#00cc00] text-black font-bold px-6 py-2 rounded-lg shadow-[0_0_15px_rgba(7,252,3,0.3)] smooth-transition uppercase text-sm tracking-widest">
                            <Plus size={18} /> Create
                        </Link>
                    )}
                </div>

                {active.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-xl font-bold text-red-500 flex items-center gap-2 mb-6 uppercase tracking-widest">
                            <PlayCircle size={20} /> Active Now
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {active.map(c => <ContestCard key={c.id} contest={c} status="active" />)}
                        </div>
                    </div>
                )}

                {upcoming.length > 0 && (
                    <div className="mb-12">
                        <h2 className="text-xl font-bold text-[#07fc03] flex items-center gap-2 mb-6 uppercase tracking-widest">
                            <Clock size={20} /> Upcoming
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {upcoming.map(c => <ContestCard key={c.id} contest={c} status="upcoming" />)}
                        </div>
                    </div>
                )}

                <div className="mb-12">
                    <h2 className="text-xl font-bold text-gray-500 mb-6 uppercase tracking-widest">Past Contests</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {past.map(c => <ContestCard key={c.id} contest={c} status="past" />)}
                        {past.length === 0 && <p className="text-gray-600 italic">No past contests found.</p>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ContestsPage;

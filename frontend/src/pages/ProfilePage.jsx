import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Terminal, Activity, Trophy, Code2 } from 'lucide-react';

const ProfilePage = () => {
    const [editMode, setEditMode] = useState(false);
    const [editName, setEditName] = useState('');
    const [editImageFile, setEditImageFile] = useState(null);
    const [editImagePreview, setEditImagePreview] = useState('');
    const [updating, setUpdating] = useState(false);
    const { user, updateUserDetails } = useContext(AuthContext);
    const token = localStorage.getItem('token');

    // ... keeping existing state variables unmodified ...

    const [stats, setStats] = useState({
        totalSolved: 0,
        weekRank: 0,
        currentStreak: 0,
        submissions: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                // Fetch submission history to calculate stats
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/submissions/history`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                const subs = res.data;
                
                // Calculate Total Solved (Unique problems with 'Accepted' or 'Pending' status)
                const acceptedSubs = subs.filter(s => s.status === 'Accepted' || s.status === 'Pending');
                const uniqueSolvedIds = new Set(acceptedSubs.map(s => s.problem_id));
                const totalSolved = uniqueSolvedIds.size;

                // Calculate Mocked Week Rank (based on total solved * 10 multiplier for fun)
                // In a real app, this would be computed on the backend against other users
                const weekRank = totalSolved > 0 ? Math.max(1, 5000 - (totalSolved * 15)) : 'Unranked';

                // Calculate Current Streak (Consecutive days with at least one submission)
                let currentStreak = 0;
                if (subs.length > 0) {
                    const today = new Date().setHours(0,0,0,0);
                    let checkDate = today;
                    
                    // Filter unique days of submission
                    const subDays = [...new Set(subs.map(s => new Date(s.submitted_at).setHours(0,0,0,0)))];
                    subDays.sort((a,b) => b - a); // Descending

                    if (subDays[0] === today || subDays[0] === today - 86400000) {
                        currentStreak = 1;
                        checkDate = subDays[0];
                        for (let i = 1; i < subDays.length; i++) {
                            if (subDays[i] === checkDate - 86400000) {
                                currentStreak++;
                                checkDate -= 86400000;
                            } else {
                                break;
                            }
                        }
                    }
                }

                setStats({
                    totalSolved,
                    weekRank,
                    currentStreak,
                    submissions: subs
                });
                setLoading(false);
            } catch (err) {
                console.error("Error fetching profile stats", err);
                setLoading(false);
            }
        };

        if (user) {
             fetchProfileData();
             setEditName(user.name);
             setEditImagePreview(user.profile_image_url ? `${import.meta.env.VITE_API_URL}${user.profile_image_url}` : '');
        }
    }, [user, token]);

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setEditImageFile(file);
            setEditImagePreview(URL.createObjectURL(file));
        }
    };

    const handleUpdateProfile = async () => {
        if (!editName.trim()) return;
        setUpdating(true);
        try {
            const formData = new FormData();
            formData.append('name', editName);
            if (editImageFile) {
                formData.append('profile_image', editImageFile);
            }

            const res = await axios.put(`${import.meta.env.VITE_API_URL}/api/auth/profile`, 
                formData,
                { 
                    headers: { 
                        Authorization: `Bearer ${token}`
                    } 
                }
            );
            updateUserDetails(res.data.user);
            setEditMode(false);
        } catch (err) {
            console.error("Error updating profile", err);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) return (
        <div className="flex-grow flex items-center justify-center bg-black font-mono text-[#07fc03]">
            <span className="animate-pulse">Loading Profile Data...</span>
        </div>
    );

    // Generate Github-like Activity Grid data (last 30 days for simplicity)
    const generateActivityGrid = () => {
        const grid = [];
        const today = new Date().setHours(0,0,0,0);
        
        // Count submissions per day
        const subCounts = {};
        stats.submissions.forEach(s => {
            const day = new Date(s.submitted_at).setHours(0,0,0,0);
            subCounts[day] = (subCounts[day] || 0) + 1;
        });

        // Generate 52 columns x 7 rows (approx last ~1 year)
        for (let col = 0; col < 52; col++) {
            const colDays = [];
            for (let row = 0; row < 7; row++) {
                const dayOffset = ((51 - col) * 7) + (6 - row);
                const targetDay = today - (dayOffset * 86400000);
                const count = subCounts[targetDay] || 0;
                
                let intensityClass = "bg-gray-900"; // No activity
                if (count > 0 && count <= 2) intensityClass = "bg-[#07fc03]/30";
                if (count > 2 && count <= 4) intensityClass = "bg-[#07fc03]/60";
                if (count > 4) intensityClass = "bg-[#07fc03]";

                colDays.push(
                    <div 
                        key={`${col}-${row}`} 
                        className={`w-3 h-3 rounded-sm ${intensityClass} border border-[#07fc03]/10`}
                        title={`${count} submissions on ${new Date(targetDay).toLocaleDateString()}`}
                    ></div>
                );
            }
            grid.push(<div key={col} className="flex flex-col gap-1">{colDays}</div>);
        }
        return grid;
    };


    return (
        <div className="flex-grow flex flex-col items-center bg-black font-mono text-gray-300 py-12 px-6">
            <div className="w-full max-w-4xl flex flex-col gap-8">
                
                {/* Header Section */}
                <div className="border border-[#07fc03]/30 bg-[#07fc03]/5 p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[#07fc03]/10 blur-3xl rounded-full"></div>
                    
                    <div className="flex items-center gap-6 z-10 w-full">
                        <div className="w-24 h-24 bg-black border-2 border-[#07fc03] flex items-center justify-center shadow-[0_0_15px_rgba(7,252,3,0.3)] overflow-hidden shrink-0">
                            {(editMode && editImagePreview) ? (
                                <img src={editImagePreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : user?.profile_image_url ? (
                                <img 
                                    src={user.profile_image_url.startsWith('http') ? user.profile_image_url : `${import.meta.env.VITE_API_URL}${user.profile_image_url}`} 
                                    alt="Profile" 
                                    className="w-full h-full object-cover" 
                                />
                            ) : (
                                <Terminal size={40} className="text-[#07fc03]" />
                            )}
                        </div>
                        
                        <div className="flex-grow">
                            {editMode ? (
                                <div className="flex flex-col gap-3 w-full max-w-sm">
                                    <input 
                                        type="text" 
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        placeholder="Hacker Name"
                                        className="bg-black border border-[#07fc03]/50 text-[#07fc03] px-3 py-1.5 focus:outline-none focus:border-[#07fc03] text-lg font-bold"
                                    />
                                    <label className="text-xs text-gray-400 font-bold tracking-widest uppercase">
                                        Upload Avatar (Max 5MB)
                                    </label>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="bg-black border border-gray-700 text-gray-300 px-3 py-1.5 focus:outline-none focus:border-[#07fc03]/50 text-sm file:mr-4 file:py-1 file:px-3 file:border file:border-[#07fc03]/30 file:bg-[#07fc03]/10 file:text-[#07fc03] file:font-mono file:text-xs file:uppercase file:cursor-pointer hover:file:bg-[#07fc03]/20"
                                    />
                                    <div className="flex gap-2 mt-1">
                                        <button 
                                            onClick={handleUpdateProfile}
                                            disabled={updating}
                                            className="bg-[#07fc03] text-black px-4 py-1 text-xs font-bold uppercase disabled:opacity-50"
                                        >
                                            {updating ? 'SAVING...' : 'SAVE'}
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setEditMode(false);
                                                setEditName(user?.name || '');
                                                setEditImageFile(null);
                                                setEditImagePreview(user?.profile_image_url ? `${import.meta.env.VITE_API_URL}${user?.profile_image_url}` : '');
                                            }}
                                            className="bg-transparent border border-red-500 text-red-500 hover:bg-red-500/10 px-4 py-1 text-xs font-bold uppercase transition-colors"
                                        >
                                            CANCEL
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-start w-full">
                                        <div>
                                            <h1 className="text-3xl font-bold text-[#07fc03] mb-1">@{user?.name || 'hacker'}</h1>
                                            <p className="text-sm text-gray-400 mb-2">ACCESS LEVEL: {user?.role?.toUpperCase() || 'USER'}</p>
                                        </div>
                                        <button 
                                            onClick={() => setEditMode(true)}
                                            className="border border-[#07fc03]/50 text-[#07fc03] hover:bg-[#07fc03]/10 px-3 py-1 text-xs uppercase tracking-wider transition-colors"
                                        >
                                            EDIT PROFILE
                                        </button>
                                    </div>
                                    <div className="text-xs bg-black px-2 py-1 border border-gray-800 inline-block text-gray-500">
                                        STATUS: ONLINE
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="border border-gray-800 bg-black p-6 hover:border-[#07fc03]/50 smooth-transition group">
                        <div className="flex items-center gap-3 mb-4">
                            <Code2 className="text-gray-500 group-hover:text-[#07fc03] transition-colors" size={20} />
                            <h3 className="text-sm font-bold tracking-widest text-gray-400">PROBLEMS SOLVED</h3>
                        </div>
                        <div className="text-4xl font-bold text-white group-hover:text-[#07fc03] transition-colors">
                            {stats.totalSolved}
                        </div>
                    </div>

                    <div className="border border-gray-800 bg-black p-6 hover:border-[#07fc03]/50 smooth-transition group">
                        <div className="flex items-center gap-3 mb-4">
                            <Trophy className="text-gray-500 group-hover:text-[#07fc03] transition-colors" size={20} />
                            <h3 className="text-sm font-bold tracking-widest text-gray-400">WEEKLY RANK</h3>
                        </div>
                        <div className="text-4xl font-bold text-white group-hover:text-[#07fc03] transition-colors">
                            #{stats.weekRank}
                        </div>
                    </div>

                    <div className="border border-[#07fc03]/30 bg-[#07fc03]/5 p-6 shadow-[0_0_15px_rgba(7,252,3,0.05)] relative overflow-hidden">
                        <div className="absolute -bottom-4 -right-4 text-[#07fc03]/10">
                            <Activity size={100} />
                        </div>
                        <div className="flex items-center gap-3 mb-4 relative z-10">
                            <Activity className="text-[#07fc03]" size={20} />
                            <h3 className="text-sm font-bold tracking-widest text-[#07fc03]">CURRENT STREAK</h3>
                        </div>
                        <div className="text-4xl font-bold text-[#07fc03] relative z-10">
                            {stats.currentStreak} <span className="text-sm text-gray-500">DAYS</span>
                        </div>
                    </div>
                </div>

                {/* Contribution Graph (GitHub style) */}
                <div className="border border-gray-800 bg-black p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-bold tracking-widest text-gray-400">365-DAY ACTIVITY FEED</h3>
                        <div className="text-xs text-gray-600 flex items-center gap-2">
                            <span>LESS</span>
                            <div className="w-2 h-2 rounded-sm bg-gray-900 border border-[#07fc03]/10"></div>
                            <div className="w-2 h-2 rounded-sm bg-[#07fc03]/30 border border-[#07fc03]/10"></div>
                            <div className="w-2 h-2 rounded-sm bg-[#07fc03]/60 border border-[#07fc03]/10"></div>
                            <div className="w-2 h-2 rounded-sm bg-[#07fc03] border border-[#07fc03]/10"></div>
                            <span>MORE</span>
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-1 overflow-x-auto pb-2">
                        {generateActivityGrid()}
                    </div>
                </div>

                {/* Recent Submissions List */}
                <div className="border border-gray-800 bg-black overflow-hidden relative">
                     <div className="absolute top-0 left-0 w-1 rounded-bl-sm border-l-2 border-[#07fc03] h-full"></div>
                    <div className="p-4 border-b border-gray-800 bg-gray-900/50">
                        <h3 className="text-sm font-bold tracking-widest text-gray-400 px-2">RECENT EXECUTIONS</h3>
                    </div>
                    <div className="p-2">
                        {stats.submissions.slice(0, 5).map((sub) => (
                            <div key={sub.id} className="flex items-center justify-between p-3 hover:bg-gray-900/50 smooth-transition border-b border-gray-800/50 last:border-0">
                                <div className="flex flex-col">
                                    <span className="text-white mb-1 font-bold">{sub.problem_title}</span>
                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                        <span className="bg-gray-800 px-2 py-0.5 rounded-sm">{sub.language}</span>
                                        <span>{new Date(sub.submitted_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className={`text-sm font-bold ${sub.status === 'Accepted' ? 'text-[#07fc03]' : 'text-[#FFFF00]'}`}>
                                    [{sub.status === 'Accepted' ? 'PASS' : 'PENDING'}]
                                </div>
                            </div>
                        ))}
                        {stats.submissions.length === 0 && (
                            <div className="p-4 text-center text-gray-600 text-sm">NO SYSTEM EXECUTIONS LOGGED.</div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProfilePage;

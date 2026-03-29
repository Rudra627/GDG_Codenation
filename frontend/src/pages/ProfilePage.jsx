import { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { Terminal, Activity, Trophy, Code2 } from 'lucide-react';

const ProfilePage = () => {
    const { id: routeId } = useParams();
    const [editMode, setEditMode] = useState(false);
    const [editName, setEditName] = useState('');
    const [editImageFile, setEditImageFile] = useState(null);
    const [editImagePreview, setEditImagePreview] = useState('');
    const [updating, setUpdating] = useState(false);
    const { user, updateUserDetails } = useContext(AuthContext);
    const token = localStorage.getItem('token');

    const [stats, setStats] = useState({
        totalSolved: 0,
        weekRank: 0,
        currentStreak: 0,
        submissions: [],
        totalProblems: { Easy: 0, Medium: 0, Hard: 0, All: 0 },
        solvedProblems: { Easy: 0, Medium: 0, Hard: 0, All: 0 },
    });
    const [loading, setLoading] = useState(true);
    const [profileUser, setProfileUser] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');

    useEffect(() => {
        const fetchProfileData = async () => {
            try {
                setLoading(true);
                setErrorMsg('');
                
                const targetId = routeId || user.id;
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users/${targetId}/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                const fetchedUser = res.data.user;
                const subs = res.data.submissions || [];
                const backendStats = res.data.stats || {};
                
                setProfileUser(fetchedUser);

                let currentStreak = 0;
                if (subs.length > 0) {
                    const toStr = (d) => {
                        const yr = d.getFullYear();
                        const mo = String(d.getMonth() + 1).padStart(2, '0');
                        const dy = String(d.getDate()).padStart(2, '0');
                        return `${yr}-${mo}-${dy}`;
                    };

                    const todayStr = toStr(new Date());
                    const yesterdayDate = new Date(); yesterdayDate.setDate(yesterdayDate.getDate() - 1);
                    const yesterdayStr = toStr(yesterdayDate);

                    const subDaySet = [...new Set(subs.map(s => toStr(new Date(s.submitted_at))))];
                    subDaySet.sort((a, b) => b.localeCompare(a));

                    if (subDaySet[0] === todayStr || subDaySet[0] === yesterdayStr) {
                        currentStreak = 1;
                        let prevStr = subDaySet[0];
                        for (let i = 1; i < subDaySet.length; i++) {
                            const expectedDate = new Date(prevStr);
                            expectedDate.setDate(expectedDate.getDate() - 1);
                            const expectedStr = toStr(expectedDate);
                            if (subDaySet[i] === expectedStr) {
                                currentStreak++;
                                prevStr = subDaySet[i];
                            } else {
                                break;
                            }
                        }
                    }
                }

                setStats({
                    totalSolved: backendStats.solvedProblems?.All || 0,
                    weekRank: backendStats.globalRank || 'Unranked',
                    currentStreak,
                    submissions: subs,
                    totalProblems: backendStats.totalProblems || { Easy: 0, Medium: 0, Hard: 0, All: 0 },
                    solvedProblems: backendStats.solvedProblems || { Easy: 0, Medium: 0, Hard: 0, All: 0 },
                });
            } catch (err) {
                console.error("Error fetching profile stats", err);
                setErrorMsg(err.response?.data?.message || "Error loading profile data");
            } finally {
                setLoading(false);
            }
        };

        if (user) {
             fetchProfileData();
             if (!routeId) {
                 setEditName(user.name);
                 setEditImagePreview(user.profile_image_url ? `${import.meta.env.VITE_API_URL}${user.profile_image_url}` : '');
             }
        }
    }, [user, token, routeId]);

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
        <div className="flex-grow flex items-center justify-center bg-[#09090B]">
            <div className="w-8 h-8 border-2 border-zinc-700 border-t-[#ffffff] rounded-full animate-spin" />
        </div>
    );

    if (errorMsg) return (
        <div className="flex-grow flex items-center justify-center bg-[#09090B] text-red-400">
            <span>{errorMsg}</span>
        </div>
    );

    const generateActivityGrid = () => {
        const grid = [];

        const toLocalDateStr = (d) => {
            const yr  = d.getFullYear();
            const mo  = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${yr}-${mo}-${day}`;
        };

        const subCounts = {};
        stats.submissions.forEach(s => {
            const key = toLocalDateStr(new Date(s.submitted_at));
            subCounts[key] = (subCounts[key] || 0) + 1;
        });

        for (let col = 0; col < 52; col++) {
            const colDays = [];
            for (let row = 0; row < 7; row++) {
                const dayOffset = ((51 - col) * 7) + (6 - row);
                const targetDate = new Date();
                targetDate.setDate(targetDate.getDate() - dayOffset);
                const dayKey = toLocalDateStr(targetDate);
                const count = subCounts[dayKey] || 0;

                let intensityClass = "bg-zinc-800/50";
                if (count > 0 && count <= 2) intensityClass = "bg-[#00FF94]/25";
                if (count > 2 && count <= 4) intensityClass = "bg-[#00FF94]/50";
                if (count > 4) intensityClass = "bg-[#00FF94]";

                colDays.push(
                    <div
                        key={`${col}-${row}`}
                        className={`w-3 h-3 rounded-[3px] ${intensityClass} border border-white/[0.04]`}
                        title={`${count} submission${count !== 1 ? 's' : ''} on ${dayKey}`}
                    />
                );
            }
            grid.push(<div key={col} className="flex flex-col gap-[3px]">{colDays}</div>);
        }
        return grid;
    };


    return (
        <div className="flex-grow flex flex-col items-center bg-[#09090B] text-zinc-300 py-12 px-6">
            <div className="w-full max-w-4xl flex flex-col gap-6">
                
                {/* Header */}
                <div className="bg-[#111113] border border-white/[0.06] rounded-2xl p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/[0.04] blur-3xl rounded-full" />
                    
                    <div className="flex items-center gap-6 z-10 w-full">
                        <div className="w-20 h-20 bg-[#09090B] border-2 border-white/30 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.08)] overflow-hidden shrink-0">
                            {(editMode && editImagePreview) ? (
                                <img src={editImagePreview} alt="Preview" className="w-full h-full object-cover" />
                            ) : profileUser?.profile_image_url ? (
                                <img 
                                    src={profileUser.profile_image_url.startsWith('http') ? profileUser.profile_image_url : `${import.meta.env.VITE_API_URL}${profileUser.profile_image_url}`} 
                                    alt="Profile" 
                                    className="w-full h-full object-cover" 
                                />
                            ) : (
                                <Terminal size={32} className="text-white" />
                            )}
                        </div>
                        
                        <div className="flex-grow">
                            {editMode ? (
                                <div className="flex flex-col gap-3 w-full max-w-sm">
                                    <input 
                                        type="text" 
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        placeholder="Your Name"
                                        className="bg-[#09090B] border border-white/10 text-white px-3 py-2 rounded-lg focus:outline-none focus:border-white/50 text-lg font-semibold"
                                    />
                                    <label className="text-xs text-zinc-500 font-medium">
                                        Upload Avatar (Max 5MB)
                                    </label>
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        onChange={handleImageChange}
                                        className="bg-[#09090B] border border-zinc-800 text-zinc-400 px-3 py-2 rounded-lg focus:outline-none text-sm file:mr-4 file:py-1 file:px-3 file:border-0 file:bg-white/10 file:text-white file:text-xs file:font-medium file:rounded-md file:cursor-pointer hover:file:bg-white/20"
                                    />
                                    <div className="flex gap-2 mt-1">
                                        <button 
                                            onClick={handleUpdateProfile}
                                            disabled={updating}
                                            className="bg-white text-[#09090B] px-4 py-1.5 text-sm font-semibold rounded-lg disabled:opacity-50 transition-colors"
                                        >
                                            {updating ? 'Saving...' : 'Save'}
                                        </button>
                                        <button 
                                            onClick={() => {
                                                setEditMode(false);
                                                setEditName(user?.name || '');
                                                setEditImageFile(null);
                                                setEditImagePreview(user?.profile_image_url ? `${import.meta.env.VITE_API_URL}${user?.profile_image_url}` : '');
                                            }}
                                            className="bg-transparent border border-red-500/30 text-red-400 hover:bg-red-500/10 px-4 py-1.5 text-sm font-medium rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-start w-full">
                                        <div>
                                            <h1 className="text-2xl font-bold text-white mb-1">@{profileUser?.name || 'user'}</h1>
                                            <p className="text-sm text-zinc-500">{profileUser?.role || 'User'}</p>
                                        </div>
                                        {!routeId && (
                                            <button 
                                                onClick={() => setEditMode(true)}
                                                className="border border-white/10 text-zinc-400 hover:text-white hover:border-white/30 px-4 py-1.5 text-sm font-medium rounded-lg transition-all"
                                            >
                                                Edit Profile
                                            </button>
                                        )}
                                    </div>
                                    <div className="mt-2">
                                        <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-0.5 rounded-md ${routeId ? 'bg-zinc-800 text-zinc-500' : 'bg-white/10 text-white'}`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${routeId ? 'bg-zinc-500' : 'bg-white'}`} />
                                            {routeId ? 'Offline' : 'Online'}
                                        </span>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* Ring Chart + Difficulty Breakdown */}
                    <div className="bg-[#111113] border border-white/[0.06] rounded-2xl p-6 flex items-center justify-between hover:border-white/15 transition-all duration-300 group">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium w-12 text-emerald-400">Easy</span>
                                <span className="text-sm font-semibold text-zinc-300">
                                    {stats.solvedProblems.Easy}<span className="text-zinc-600 text-xs">/{stats.totalProblems.Easy}</span>
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium w-12 text-amber-400">Med</span>
                                <span className="text-sm font-semibold text-zinc-300">
                                    {stats.solvedProblems.Medium}<span className="text-zinc-600 text-xs">/{stats.totalProblems.Medium}</span>
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium w-12 text-red-400">Hard</span>
                                <span className="text-sm font-semibold text-zinc-300">
                                    {stats.solvedProblems.Hard}<span className="text-zinc-600 text-xs">/{stats.totalProblems.Hard}</span>
                                </span>
                            </div>
                        </div>

                        <div className="relative w-28 h-28 flex items-center justify-center shrink-0">
                            <svg className="absolute top-0 left-0 w-full h-full transform -rotate-90">
                                <circle cx="56" cy="56" r="48" fill="none" stroke="#1c1c1e" strokeWidth="6" />
                                <circle cx="56" cy="56" r="48" fill="none" stroke="#34d399" strokeWidth="6"
                                        strokeDasharray={`${(stats.solvedProblems.Easy / (stats.totalProblems.All || 1)) * 301} 301`}
                                        strokeLinecap="round" />
                                <circle cx="56" cy="56" r="48" fill="none" stroke="#fbbf24" strokeWidth="6"
                                        strokeDasharray={`${(stats.solvedProblems.Medium / (stats.totalProblems.All || 1)) * 301} 301`}
                                        strokeDashoffset={`-${(stats.solvedProblems.Easy / (stats.totalProblems.All || 1)) * 301}`}
                                        strokeLinecap="round" />
                                <circle cx="56" cy="56" r="48" fill="none" stroke="#f87171" strokeWidth="6"
                                        strokeDasharray={`${(stats.solvedProblems.Hard / (stats.totalProblems.All || 1)) * 301} 301`}
                                        strokeDashoffset={`-${((stats.solvedProblems.Easy + stats.solvedProblems.Medium) / (stats.totalProblems.All || 1)) * 301}`}
                                        strokeLinecap="round" />
                            </svg>
                            <div className="flex flex-col items-center justify-center z-10">
                                <span className="text-2xl font-bold text-white">{stats.totalSolved}</span>
                                <span className="text-[10px] text-zinc-500 font-medium mt-0.5">Solved</span>
                            </div>
                        </div>
                    </div>

                    {/* Global Rank */}
                    <div className="bg-[#111113] border border-white/[0.06] rounded-2xl p-6 hover:border-white/15 transition-all duration-300 group flex flex-col justify-center">
                        <div className="flex items-center gap-2.5 mb-4">
                            <Trophy className="text-zinc-600 group-hover:text-white transition-colors" size={18} />
                            <h3 className="text-sm font-medium text-zinc-500">Global Rank</h3>
                        </div>
                        <div className="text-4xl font-bold text-white group-hover:text-white transition-colors">
                            #{stats.weekRank}
                        </div>
                    </div>

                    {/* Streak */}
                    <div className="bg-[#111113] border border-[#00FF94]/10 rounded-2xl p-6 relative overflow-hidden">
                        <div className="absolute -bottom-4 -right-4 text-[#00FF94]/[0.06]">
                            <Activity size={100} />
                        </div>
                        <div className="flex items-center gap-2.5 mb-4 relative z-10">
                            <Activity className="text-[#00FF94]" size={18} />
                            <h3 className="text-sm font-medium text-[#00FF94]">Current Streak</h3>
                        </div>
                        <div className="text-4xl font-bold text-[#00FF94] relative z-10">
                            {stats.currentStreak} <span className="text-sm text-zinc-500 font-medium">days</span>
                        </div>
                    </div>
                </div>

                {/* Activity Grid */}
                <div className="bg-[#111113] border border-white/[0.06] rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-sm font-medium text-zinc-400">365-Day Activity</h3>
                        <div className="text-xs text-zinc-600 flex items-center gap-1.5">
                            <span>Less</span>
                            <div className="w-2.5 h-2.5 rounded-[2px] bg-zinc-800/50 border border-white/[0.04]" />
                            <div className="w-2.5 h-2.5 rounded-[2px] bg-[#00FF94]/25 border border-white/[0.04]" />
                            <div className="w-2.5 h-2.5 rounded-[2px] bg-[#00FF94]/50 border border-white/[0.04]" />
                            <div className="w-2.5 h-2.5 rounded-[2px] bg-[#00FF94] border border-white/[0.04]" />
                            <span>More</span>
                        </div>
                    </div>
                    
                    <div className="flex justify-end gap-[3px] overflow-x-auto pb-2">
                        {generateActivityGrid()}
                    </div>
                </div>

                {/* Recent Submissions */}
                <div className="bg-[#111113] border border-white/[0.06] rounded-2xl overflow-hidden">
                    <div className="p-5 border-b border-white/[0.06]">
                        <h3 className="text-sm font-medium text-zinc-400">Recent Submissions</h3>
                    </div>
                    <div className="p-2">
                        {stats.submissions.slice(0, 5).map((sub) => (
                            <div key={sub.id} className="flex items-center justify-between p-3 hover:bg-white/[0.02] transition-colors rounded-xl">
                                <div className="flex flex-col">
                                    <span className="text-white mb-1 font-medium">{sub.problem_title}</span>
                                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                                        <span className="bg-zinc-800/60 px-2 py-0.5 rounded-md">{sub.language}</span>
                                        <span>{new Date(sub.submitted_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                                <div className={`text-sm font-semibold ${sub.status === 'Accepted' ? 'text-white' : sub.status === 'Pending' ? 'text-amber-400' : 'text-red-400'}`}>
                                    {sub.status === 'Accepted' ? 'Accepted' : sub.status}
                                </div>
                            </div>
                        ))}
                        {stats.submissions.length === 0 && (
                            <div className="p-6 text-center text-zinc-600 text-sm">No submissions yet.</div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ProfilePage;

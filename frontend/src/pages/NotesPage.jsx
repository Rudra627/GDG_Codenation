import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Tag, BookOpen } from 'lucide-react';
import Loader from '../components/Loader';
import { Skeleton } from 'boneyard-js/react';

const NotesPage = () => {
    const [notes, setNotes] = useState([]);
    const [topics, setTopics] = useState([]);
    const [selectedTopic, setSelectedTopic] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [downloadingUrl, setDownloadingUrl] = useState(null);

    useEffect(() => {
        fetchNotes();
    }, [selectedTopic]);

    useEffect(() => {
        if (!selectedTopic && notes.length > 0) {
            const uniqueTopics = [...new Set(notes.map(n => n.topic))];
            setTopics(uniqueTopics);
        }
    }, [notes]);

    const fetchNotes = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        try {
            let url = `${import.meta.env.VITE_API_URL}/api/notes`;
            if (selectedTopic) {
                url += `?topic=${encodeURIComponent(selectedTopic)}`;
            }
            const res = await axios.get(url, { headers });
            setNotes(res.data);
        } catch (error) {
            console.error("Fetch errors", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        try {
            let url = `${import.meta.env.VITE_API_URL}/api/notes?search=${encodeURIComponent(searchQuery)}`;
            if (selectedTopic) {
                url += `&topic=${encodeURIComponent(selectedTopic)}`;
            }
            const res = await axios.get(url, { headers });
            setNotes(res.data);
        } catch (error) {
            console.error("Search error", error);
        } finally {
            setIsLoading(false);
        }
    };

    if (downloadingUrl) {
        return <Loader onComplete={() => {
            const link = document.createElement('a');
            link.href = `${import.meta.env.VITE_API_URL}${downloadingUrl}`;
            link.target = '_blank';
            link.click();
            setDownloadingUrl(null);
        }} />;
    }

    return (
        <div className="flex-grow p-8 max-w-7xl mx-auto w-full bg-[#09090B]">
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
                        <BookOpen className="text-white" size={30} />
                        Knowledge Base
                    </h1>
                    <p className="text-zinc-500 mt-2 text-sm">Browse notes and study materials shared by the community.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar */}
                <div className="lg:col-span-1 space-y-5">
                    <div className="glass p-5 rounded-xl border border-white/[0.06]">
                        <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                            <Search size={16} className="text-white" />
                            Search
                        </h2>
                        <form onSubmit={handleSearch} className="relative">
                            <input 
                                type="text"
                                placeholder="Search titles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-[#09090B] border border-white/10 text-white rounded-lg p-3 pl-10 focus:outline-none focus:border-white/50 transition-colors text-sm"
                            />
                            <Search size={14} className="absolute left-3 top-3.5 text-zinc-600" />
                            <button type="submit" className="hidden">Search</button>
                        </form>
                    </div>

                    <div className="glass p-5 rounded-xl border border-white/[0.06]">
                        <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                            <Tag size={16} className="text-white" />
                            Topics
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSelectedTopic('')}
                                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                                    selectedTopic === '' 
                                    ? 'bg-white text-[#09090B] shadow-[0_0_12px_rgba(255,255,255,0.2)]' 
                                    : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-700/60 border border-white/[0.06]'
                                }`}
                            >
                                All
                            </button>
                            {topics.map(topic => (
                                <button
                                    key={topic}
                                    onClick={() => setSelectedTopic(topic)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                                        selectedTopic === topic 
                                        ? 'bg-white text-[#09090B] shadow-[0_0_12px_rgba(255,255,255,0.2)]' 
                                        : 'bg-zinc-800/60 text-zinc-400 hover:bg-zinc-700/60 border border-white/[0.06]'
                                    }`}
                                >
                                    {topic}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3">
                    <Skeleton name="note-card" loading={isLoading}>
                        <div className="grid grid-cols-1 gap-5">
                            {notes.length === 0 ? (
                                <div className="glass p-10 rounded-xl text-center border border-dashed border-zinc-700">
                                    <BookOpen className="mx-auto text-zinc-700 mb-4" size={48} />
                                    <h3 className="text-lg text-zinc-400">No notes found</h3>
                                    <button 
                                        onClick={() => {setSearchQuery(''); setSelectedTopic('');}}
                                        className="mt-4 text-white hover:underline text-sm"
                                    >
                                        Clear filters
                                    </button>
                                </div>
                            ) : (
                                notes.map(note => (
                                    <div key={note.id} className="glass p-6 rounded-xl hover:border-white/15 transition-all duration-300 border border-white/[0.06] card-hover">
                                        <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-3">
                                            <h3 className="text-lg sm:text-xl font-semibold text-white">{note.title}</h3>
                                            <span className="bg-white/10 text-white border border-white/20 px-3 py-0.5 rounded-full text-[11px] font-medium shrink-0">
                                                {note.topic}
                                            </span>
                                        </div>
                                        {note.content && (
                                            <div className="text-zinc-400 whitespace-pre-wrap leading-relaxed mb-4 text-sm">
                                                {note.content}
                                            </div>
                                        )}
                                        {note.file_url && (
                                            <button 
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setDownloadingUrl(note.file_url);
                                                }}
                                                className="inline-flex items-center gap-2 bg-white/[0.03] hover:bg-white/10 text-white border border-white/[0.06] hover:border-white/20 px-4 py-2 rounded-lg transition-all duration-200 text-sm font-medium"
                                            >
                                                <BookOpen size={14} />
                                                <span>View Document</span>
                                            </button>
                                        )}
                                        <div className="mt-5 pt-4 border-t border-white/[0.04] flex justify-between items-center text-xs text-zinc-600">
                                            <span>Added: {new Date(note.created_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </Skeleton>
                </div>
            </div>
        </div>
    );
};

export default NotesPage;

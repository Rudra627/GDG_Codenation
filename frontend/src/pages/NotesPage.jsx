import { useState, useEffect } from 'react';
import axios from 'axios';
import { Search, Tag, BookOpen } from 'lucide-react';
import Loader from '../components/Loader';

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

    // Derived topics list computation whenever notes are fully fetched without topic filter
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
        <div className="flex-grow p-8 max-w-7xl mx-auto w-full">
            <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4 cursor-default">
                <div>
                    <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 flex items-center gap-3">
                        <BookOpen className="text-[#07fc03]" size={36} />
                        Knowledge Base
                    </h1>
                    <p className="text-gray-400 mt-2 font-mono text-sm tracking-wide">ACCESS_SYSTEM_NOTES</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Sidebar Filters */}
                <div className="lg:col-span-1 space-y-6">
                    <div className="glass p-6 rounded-xl border border-[#07fc03]/20">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Search size={18} className="text-[#07fc03]" />
                            Search Notes
                        </h2>
                        <form onSubmit={handleSearch} className="relative">
                            <input 
                                type="text"
                                placeholder="Search titles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-900 border border-gray-700 text-white rounded p-3 pl-10 focus:outline-none focus:border-[#07fc03] transition-colors"
                            />
                            <Search size={16} className="absolute left-3 top-3.5 text-gray-500" />
                            <button type="submit" className="hidden">Search</button>
                        </form>
                    </div>

                    <div className="glass p-6 rounded-xl border border-[#07fc03]/20">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Tag size={18} className="text-[#07fc03]" />
                            Topics
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => setSelectedTopic('')}
                                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                                    selectedTopic === '' 
                                    ? 'bg-[#07fc03] text-black shadow-[0_0_10px_rgba(7,252,3,0.3)]' 
                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'
                                }`}
                            >
                                All Topics
                            </button>
                            {topics.map(topic => (
                                <button
                                    key={topic}
                                    onClick={() => setSelectedTopic(topic)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                                        selectedTopic === topic 
                                        ? 'bg-[#07fc03] text-black shadow-[0_0_10px_rgba(7,252,3,0.3)]' 
                                        : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'
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
                    {isLoading ? (
                        <div className="flex justify-center py-20">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#07fc03]"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            {notes.length === 0 ? (
                                <div className="glass p-10 rounded-xl text-center border-dashed border border-gray-600">
                                    <BookOpen className="mx-auto text-gray-600 mb-4" size={48} />
                                    <h3 className="text-xl text-gray-400">No notes found matching your criteria</h3>
                                    <button 
                                        onClick={() => {setSearchQuery(''); setSelectedTopic('');}}
                                        className="mt-4 text-[#07fc03] hover:underline"
                                    >
                                        Clear filters
                                    </button>
                                </div>
                            ) : (
                                notes.map(note => (
                                    <div key={note.id} className="glass p-6 rounded-xl hover:shadow-[0_0_15px_rgba(7,252,3,0.15)] transition-shadow border border-transparent hover:border-[#07fc03]/30">
                                        <div className="flex flex-col sm:flex-row justify-between items-start mb-4 gap-3 sm:gap-4">
                                            <h3 className="text-xl sm:text-2xl font-bold text-white group-hover:text-[#07fc03] transition-colors">{note.title}</h3>
                                            <span className="bg-[#07fc03]/10 text-[#07fc03] border border-[#07fc03]/30 px-3 py-1 rounded-full text-[10px] sm:text-xs font-medium shrink-0">
                                                {note.topic}
                                            </span>
                                        </div>
                                        {note.content && (
                                            <div className="text-gray-300 whitespace-pre-wrap leading-relaxed mb-4">
                                                {note.content}
                                            </div>
                                        )}
                                        {note.file_url && (
                                            <button 
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setDownloadingUrl(note.file_url);
                                                }}
                                                className="inline-flex items-center space-x-2 bg-gray-800 hover:bg-[#07fc03]/20 text-[#07fc03] border border-[#07fc03]/40 px-4 py-2 rounded smooth-transition font-mono text-sm tracking-wide"
                                            >
                                                <BookOpen size={16} />
                                                <span>VIEW DOCUMENT</span>
                                            </button>
                                        )}
                                        <div className="mt-6 pt-4 border-t border-gray-800 flex justify-between items-center text-xs text-gray-500">
                                            <span>Added: {new Date(note.created_at).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NotesPage;

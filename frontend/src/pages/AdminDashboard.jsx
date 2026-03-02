import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('problems'); // 'problems', 'submissions', 'notes', 'users'
    const [problems, setProblems] = useState([]);
    const [submissions, setSubmissions] = useState([]);
    const [notes, setNotes] = useState([]);
    const [users, setUsers] = useState([]);
    
    // User Management State
    const [selectedUserIds, setSelectedUserIds] = useState([]);
    const [showReminderModal, setShowReminderModal] = useState(false);
    const [reminderData, setReminderData] = useState({ type: 'Contest Reminder', subject: '', message: '' });
    const [sendingReminder, setSendingReminder] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState({ title: '', description: '', difficulty: 'Easy', topics: '' });
    const [testCaseData, setTestCaseData] = useState({ problem_id: '', input: '', expected_output: '', is_hidden: false });
    const [noteData, setNoteData] = useState({ title: '', topic: '', content: '', file: null });
    const [message, setMessage] = useState('');
    const [expandedSubmission, setExpandedSubmission] = useState(null);
    const [statusUpdating, setStatusUpdating] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [editProblemId, setEditProblemId] = useState(null);
    const [isEditingNote, setIsEditingNote] = useState(false);
    const [editNoteId, setEditNoteId] = useState(null);

    useEffect(() => {
        fetchData();
    }, [activeTab]); // eslint-disable-line

    const fetchData = async () => {
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        try {
            if (activeTab === 'problems') {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/problems`, { headers });
                setProblems(res.data);
            } else if (activeTab === 'submissions') {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/submissions/all`, { headers });
                setSubmissions(res.data);
            } else if (activeTab === 'notes') {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/notes`, { headers });
                setNotes(res.data);
            } else if (activeTab === 'users') {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`, { headers });
                setUsers(res.data);
                setSelectedUserIds([]);
            }
        } catch (error) {
            console.error("Fetch error", error);
        }
    };

    const handleCreateProblem = async (e) => {
        e.preventDefault();
        setMessage('');
        const token = localStorage.getItem('token');
        const headers = { Authorization: `Bearer ${token}` };
        try {
            let problemId = editProblemId;
            if (isEditing) {
                await axios.put(`${import.meta.env.VITE_API_URL}/api/problems/${problemId}`, formData, { headers });
                setMessage('Problem updated successfully!');
                setIsEditing(false);
                setEditProblemId(null);
            } else {
                const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/problems`, formData, { headers });
                problemId = res.data.problemId;
                setMessage('Problem created successfully!');
            }
            setFormData({ title: '', description: '', difficulty: 'Easy', topics: '' });
            fetchData();
        } catch (error) {
            setMessage(isEditing ? 'Error updating problem' : 'Error creating problem');
        }
    };

    const handleEditClick = async (id) => {
        setMessage('');
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/problems/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const problem = res.data;
            setFormData({ title: problem.title, description: problem.description, difficulty: problem.difficulty, topics: problem.topics || '' });
            setIsEditing(true);
            setEditProblemId(id);
            // Scroll to top or to the form
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            setMessage('Error fetching problem details');
        }
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditProblemId(null);
        setFormData({ title: '', description: '', difficulty: 'Easy', topics: '' });
        setMessage('');
    };

    const handleDeleteProblem = async (id) => {
        if (!window.confirm('Are you sure you want to delete this problem? All associated test cases and submissions will also be affected.')) return;
        setMessage('');
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/problems/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('Problem deleted successfully!');
            if (isEditing && editProblemId === id) {
                handleCancelEdit();
            }
            fetchData();
        } catch (error) {
            setMessage('Error deleting problem');
        }
    };

    const handleAddTestCase = async (e) => {
        e.preventDefault();
        setMessage('');
        const token = localStorage.getItem('token');
        try {
            await axios.post(`${import.meta.env.VITE_API_URL}/api/problems/${testCaseData.problem_id}/testcases`, testCaseData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('Test case added successfully!');
            setTestCaseData({ problem_id: '', input: '', expected_output: '', is_hidden: false });
        } catch (error) {
            setMessage('Error adding test case');
        }
    };

    const handleCreateNote = async (e) => {
        e.preventDefault();
        setMessage('');
        const token = localStorage.getItem('token');
        
        const form = new FormData();
        form.append('title', noteData.title);
        form.append('topic', noteData.topic);
        form.append('content', noteData.content);
        if (noteData.file) {
            form.append('note_file', noteData.file);
        }

        try {
            if (isEditingNote) {
                await axios.put(`${import.meta.env.VITE_API_URL}/api/notes/${editNoteId}`, form, {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                setMessage('Note updated successfully!');
                setIsEditingNote(false);
                setEditNoteId(null);
            } else {
                await axios.post(`${import.meta.env.VITE_API_URL}/api/notes`, form, {
                    headers: { 
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                setMessage('Note created successfully!');
            }
            setNoteData({ title: '', topic: '', content: '', file: null });
            fetchData();
        } catch (error) {
            setMessage(isEditingNote ? 'Error updating note' : 'Error creating note');
        }
    };

    const handleEditNoteClick = async (id) => {
        setMessage('');
        const token = localStorage.getItem('token');
        try {
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/notes/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const note = res.data;
            setNoteData({ title: note.title, topic: note.topic, content: note.content || '', file: null });
            setIsEditingNote(true);
            setEditNoteId(id);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (error) {
            setMessage('Error fetching note details');
        }
    };

    const handleCancelEditNote = () => {
        setIsEditingNote(false);
        setEditNoteId(null);
        setNoteData({ title: '', topic: '', content: '', file: null });
        setMessage('');
    };

    const handleDeleteNote = async (id) => {
        if (!window.confirm('Are you sure you want to delete this note?')) return;
        setMessage('');
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/notes/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('Note deleted successfully!');
            if (isEditingNote && editNoteId === id) {
                handleCancelEditNote();
            }
            fetchData();
        } catch (error) {
            setMessage('Error deleting note');
        }
    };

    const handleSetDailyChallenge = async (id) => {
        setMessage('');
        const token = localStorage.getItem('token');
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/problems/${id}/daily`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('Problem set as Daily Challenge successfully!');
            fetchData();
        } catch (error) {
            setMessage('Error setting daily challenge');
        }
    };



    const handleUpdateSubmissionStatus = async (id, status) => {
        setStatusUpdating(true);
        setMessage('');
        const token = localStorage.getItem('token');
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/submissions/${id}/status`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage(`Submission #${id} marked as ${status}`);
            fetchData();
            setExpandedSubmission(null);
        } catch (error) {
            setMessage('Error updating submission status');
        } finally {
            setStatusUpdating(false);
        }
    };

    const handleClearAllSubmissions = async () => {
        if (!window.confirm('Are you ABSOLUTELY sure you want to delete ALL submissions? This action cannot be undone!')) return;
        
        setMessage('');
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/submissions/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('All submissions have been successfully cleared!');
            setExpandedSubmission(null);
            fetchData();
        } catch (error) {
            setMessage('Error clearing submissions');
        }
    };

    // --- User Management Methods ---
    const handleSelectAllUsers = (e) => {
        if (e.target.checked) {
            setSelectedUserIds(users.map(u => u.id));
        } else {
            setSelectedUserIds([]);
        }
    };

    const handleSelectUser = (id) => {
        if (selectedUserIds.includes(id)) {
            setSelectedUserIds(selectedUserIds.filter(userId => userId !== id));
        } else {
            setSelectedUserIds([...selectedUserIds, id]);
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user account? This action cannot be undone.')) return;
        setMessage('');
        const token = localStorage.getItem('token');
        try {
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('User deleted successfully!');
            fetchData();
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error deleting user');
        }
    };

    const handleBlockUser = async (id, currentStatus) => {
        if (!window.confirm(`Are you sure you want to ${currentStatus ? 'unblock' : 'block'} this user?`)) return;
        setMessage('');
        const token = localStorage.getItem('token');
        try {
            await axios.put(`${import.meta.env.VITE_API_URL}/api/users/${id}/block`, { is_blocked: !currentStatus }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage(`User ${currentStatus ? 'unblocked' : 'blocked'} successfully!`);
            fetchData();
        } catch (error) {
            setMessage(error.response?.data?.message || 'Error updating user block status');
        }
    };

    const handleReminderTypeChange = (e) => {
        const type = e.target.value;
        let defaultSubject = '';
        let defaultMessage = '';

        if (type === 'Contest Reminder') {
            defaultSubject = 'Upcoming Contest Reminder on GDG Codenation!';

            defaultMessage = 'Hello ${{name}},\n\nJust a reminder that a new contest is starting soon on GDG Codenation. Log in to check the details and register.\n\nHappy Coding,\nThe GDG Codenation Team';

        } else if (type === 'Daily Challenge') {
            defaultSubject = 'Your Daily Coding Challenge is Ready!';
            defaultMessage = 'Hello,\n\nYour new daily challenge is waiting for you on GDG Codenation. Can you solve it?\n\nKeep up the streak,\nThe GDG Codenation Team';
        }

        setReminderData({ type, subject: defaultSubject, message: defaultMessage });
    };

    const handleSendReminder = async (e) => {
        e.preventDefault();
        setSendingReminder(true);
        setMessage('');

        const token = localStorage.getItem('token');
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/users/send-reminders`, {
                userIds: selectedUserIds,
                subject: reminderData.subject,
                message: reminderData.message
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setMessage(res.data.message);
            setShowReminderModal(false);
            setReminderData({ type: 'Contest Reminder', subject: '', message: '' });
            setSelectedUserIds([]); // Clear selection after sending
        } catch (error) {
            console.error("Error sending reminder:", error);
            setMessage(error.response?.data?.message || 'Error sending reminders');
        } finally {
            setSendingReminder(false);
        }
    };

    // Helper to run once on modal open to set defaults if empty
    const openReminderModal = () => {
        if (!reminderData.subject && reminderData.type === 'Contest Reminder') {
            setReminderData(prev => ({
                ...prev,
                subject: 'Upcoming Contest Reminder on GDG Codenation!',
                message: 'Hello,\n\nJust a reminder that a new contest is starting soon on GDG Codenation. Log in to check the details and register.\n\nHappy Coding,\nThe GDG Codenation Team'
            }));
        }
        setShowReminderModal(true);
    };

    return (
        <div className="flex-grow p-8 max-w-7xl mx-auto w-full">
            <h1 className="text-3xl font-bold mb-8 text-white">Admin Dashboard</h1>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <button 
                    onClick={() => setActiveTab('problems')}
                    className={`px-4 py-2 rounded-lg font-semibold smooth-transition ${activeTab === 'problems' ? 'bg-[#07fc03] text-black' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                >
                    Manage Problems
                </button>
                <button 
                    onClick={() => setActiveTab('submissions')}
                    className={`px-4 py-2 rounded-lg font-semibold smooth-transition ${activeTab === 'submissions' ? 'bg-[#07fc03] text-black' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                >
                    View All Submissions
                </button>
                <button 
                    onClick={() => setActiveTab('notes')}
                    className={`px-4 py-2 rounded-lg font-semibold smooth-transition ${activeTab === 'notes' ? 'bg-[#07fc03] text-black' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                >
                    Manage Notes
                </button>
                <button 
                    onClick={() => setActiveTab('users')}
                    className={`px-4 py-2 rounded-lg font-semibold smooth-transition ${activeTab === 'users' ? 'bg-[#07fc03] text-black' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                >
                    Manage Users
                </button>

            </div>

            {message && <div className="mb-6 p-4 bg-[#07fc03]/10 border border-[#07fc03]/50 text-[#07fc03] rounded-lg">{message}</div>}

            {activeTab === 'problems' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Create / Edit Problem Form */}
                    <div className="glass p-6 rounded-xl relative">
                        {isEditing && (
                            <div className="absolute top-4 right-4 bg-yellow-500/20 text-yellow-500 text-xs px-2 py-1 rounded border border-yellow-500/50 uppercase tracking-wider font-bold">
                                Editing Mode
                            </div>
                        )}
                        <h2 className="text-xl font-bold mb-4 text-gray-100">{isEditing ? 'Edit Problem' : 'Create New Problem'}</h2>
                        <form onSubmit={handleCreateProblem} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Title</label>
                                <input required type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-[#07fc03] focus:outline-none transition-colors" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Topics</label>
                                <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-[#07fc03] focus:outline-none transition-colors" value={formData.topics} onChange={e => setFormData({...formData, topics: e.target.value})} placeholder="e.g. Arrays, Strings, DP" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Difficulty</label>
                                <select className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-[#07fc03] focus:outline-none transition-colors" value={formData.difficulty} onChange={e => setFormData({...formData, difficulty: e.target.value})}>
                                    <option>Easy</option>
                                    <option>Medium</option>
                                    <option>Hard</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Description</label>
                                <textarea required rows="6" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-[#07fc03] focus:outline-none transition-colors custom-scrollbar" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                            </div>
                            <div className="flex space-x-3">
                                <button type="submit" className="bg-[#07fc03] hover:bg-[#07fc03]/80 text-black px-4 py-2 rounded shadow-lg smooth-transition font-medium">
                                    {isEditing ? 'Update Problem' : 'Create Problem'}
                                </button>
                                {isEditing && (
                                    <button type="button" onClick={handleCancelEdit} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded shadow-lg smooth-transition font-medium transition-colors">
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Add Test Case Form */}
                    <div className="glass p-6 rounded-xl">
                        <h2 className="text-xl font-bold mb-4 text-gray-100">Add Test Case</h2>
                        <form onSubmit={handleAddTestCase} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Select Problem</label>
                                <select required className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" value={testCaseData.problem_id} onChange={e => setTestCaseData({...testCaseData, problem_id: e.target.value})}>
                                    <option value="">-- Select Problem --</option>
                                    {problems.map(p => <option key={p.id} value={p.id}>{p.id} - {p.title}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Input</label>
                                <textarea required rows="2" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" value={testCaseData.input} onChange={e => setTestCaseData({...testCaseData, input: e.target.value})}></textarea>
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Expected Output</label>
                                <textarea required rows="2" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white" value={testCaseData.expected_output} onChange={e => setTestCaseData({...testCaseData, expected_output: e.target.value})}></textarea>
                            </div>
                            <div className="flex items-center space-x-2">
                                <input type="checkbox" id="hidden" checked={testCaseData.is_hidden} onChange={e => setTestCaseData({...testCaseData, is_hidden: e.target.checked})} />
                                <label htmlFor="hidden" className="text-sm text-gray-400">Hidden Test Case?</label>
                            </div>
                            <button type="submit" className="bg-[#07fc03] hover:bg-[#07fc03]/80 text-black px-4 py-2 rounded shadow-lg smooth-transition">Add Test Case</button>
                        </form>
                    </div>
                    {/* Manage Problems List */}
                    <div className="glass p-6 rounded-xl overflow-hidden mt-8 lg:col-span-2">
                        <h2 className="text-xl font-bold mb-4 text-gray-100">Existing Problems</h2>
                        <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                            {problems.length === 0 ? (
                                <p className="text-gray-500">No problems found.</p>
                            ) : (
                                problems.map(prob => (
                                     <div key={prob.id} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex justify-between items-center">
                                        <div>
                                            <h3 className="text-[#07fc03] font-bold">{prob.title}</h3>
                                            <div className="flex gap-2 mt-1">
                                                <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded inline-block">{prob.difficulty}</span>
                                                {prob.topics && <span className="text-xs bg-gray-700 text-[#07fc03] px-2 py-1 rounded inline-block">{prob.topics}</span>}
                                            </div>
                                        </div>
                                        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                                            <button 
                                                onClick={() => handleSetDailyChallenge(prob.id)}
                                                className="text-yellow-400 hover:text-yellow-500 text-sm border border-yellow-500/30 px-3 py-1.5 rounded smooth-transition whitespace-nowrap"
                                            >
                                                Set as Daily Challenge
                                            </button>
                                            <button 
                                                onClick={() => handleEditClick(prob.id)}
                                                className="text-blue-400 hover:text-blue-500 text-sm border border-blue-500/30 px-3 py-1.5 rounded smooth-transition"
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteProblem(prob.id)}
                                                className="text-red-400 hover:text-red-500 text-sm border border-red-500/30 px-3 py-1.5 rounded smooth-transition"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'submissions' && (
                <div className="glass rounded-xl overflow-hidden pb-4">
                    <div className="p-4 flex justify-between items-center bg-gray-900/50 border-b border-gray-700">
                        <h2 className="text-xl font-bold text-gray-100">All Submissions ({submissions.length})</h2>
                        <button
                            onClick={handleClearAllSubmissions}
                            disabled={submissions.length === 0}
                            className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded shadow-lg smooth-transition font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <span>Clear All Submissions</span>
                        </button>
                    </div>

                    <div className="overflow-x-auto min-w-[800px]">
                        <table className="w-full text-left">
                            <thead className="bg-gray-800/80 text-gray-300 border-b border-gray-700 text-sm uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4">User</th>
                                    <th className="px-6 py-4">Problem</th>
                                    <th className="px-6 py-4">Language</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Time</th>
                                    <th className="px-6 py-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700/50 text-gray-300 font-medium">
                                {submissions.map(s => (
                                    <React.Fragment key={s.id}>
                                        <tr className="hover:bg-gray-700/30 smooth-transition">
                                            <td className="px-6 py-4 text-gray-500">#{s.id}</td>
                                            <td className="px-6 py-4">{s.user_name}</td>
                                            <td className="px-6 py-4">{s.problem_title}</td>
                                            <td className="px-6 py-4">{s.language}</td>
                                            <td className={`px-6 py-4 ${s.status === 'Accepted' ? 'text-green-400' : s.status === 'Pending' ? 'text-yellow-400' : 'text-red-400'}`}>{s.status}</td>
                                            <td className="px-6 py-4 text-gray-500 text-sm">{new Date(s.submitted_at).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                                            <td className="px-6 py-4">
                                                <button 
                                                    onClick={() => setExpandedSubmission(expandedSubmission === s.id ? null : s.id)}
                                                    className="bg-gray-800 hover:bg-gray-600 border border-gray-600 px-3 py-1 rounded text-xs uppercase"
                                                >
                                                    {expandedSubmission === s.id ? 'Close' : 'View Code'}
                                                </button>
                                            </td>
                                        </tr>
                                        {expandedSubmission === s.id && (
                                            <tr className="bg-black/30">
                                                <td colSpan="7" className="p-6 border-b border-[#07fc03]/20">
                                                    <div className="flex flex-col space-y-4">
                                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0 text-gray-300 bg-gray-900/50 p-3 rounded border border-gray-700">
                                                            <div>
                                                                <span className="text-xs text-gray-500 uppercase tracking-widest block mb-1">Submitter</span>
                                                                <span className="font-bold text-[#07fc03]">{s.user_name}</span> <span className="text-gray-500 text-sm">(ID: {s.user_id})</span>
                                                            </div>
                                                            <div className="sm:text-right">
                                                                <span className="text-xs text-gray-500 uppercase tracking-widest block mb-1">Problem</span>
                                                                <span className="font-bold text-white">{s.problem_title}</span>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className="bg-[#1e1e1e] border border-gray-700 p-4 rounded-md overflow-x-auto relative">
                                                            <div className="absolute top-0 right-0 bg-gray-800 text-xs text-gray-400 px-2 py-1 rounded-bl-md border-b border-l border-gray-700 uppercase tracking-wider">
                                                                {s.language} Code
                                                            </div>
                                                            <pre className="text-gray-300 font-mono text-sm max-h-96 overflow-y-auto w-full whitespace-pre-wrap mt-2">{s.code}</pre>
                                                        </div>
                                                        
                                                        {s.status === 'Pending' && (
                                                            <div className="flex flex-col sm:flex-row gap-4 pt-2">
                                                                <button 
                                                                    onClick={() => handleUpdateSubmissionStatus(s.id, 'Accepted')}
                                                                    disabled={statusUpdating}
                                                                    className="bg-green-600 hover:bg-green-500 text-white px-6 py-2 rounded-md font-bold uppercase transition disabled:opacity-50"
                                                                >
                                                                    Approve (Correct)
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleUpdateSubmissionStatus(s.id, 'Wrong Answer')}
                                                                    disabled={statusUpdating}
                                                                    className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-md font-bold uppercase transition disabled:opacity-50"
                                                                >
                                                                    Reject (Wrong Answer)
                                                                </button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {activeTab === 'notes' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Create / Edit Note Form */}
                    <div className="glass p-6 rounded-xl relative">
                        {isEditingNote && (
                            <div className="absolute top-4 right-4 bg-yellow-500/20 text-yellow-500 text-xs px-2 py-1 rounded border border-yellow-500/50 uppercase tracking-wider font-bold">
                                Editing Mode
                            </div>
                        )}
                        <h2 className="text-xl font-bold mb-4 text-gray-100">{isEditingNote ? 'Edit Note' : 'Upload New Note'}</h2>
                        <form onSubmit={handleCreateNote} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Title</label>
                                <input required type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-[#07fc03] focus:outline-none transition-colors" value={noteData.title} onChange={e => setNoteData({...noteData, title: e.target.value})} />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Topic</label>
                                <input required type="text" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-[#07fc03] focus:outline-none transition-colors" value={noteData.topic} onChange={e => setNoteData({...noteData, topic: e.target.value})} placeholder="e.g. Arrays, Strings, DP" />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Upload Note File (PDF etc.) {isEditingNote && <span className="text-xs text-yellow-500 ml-2">(Leave empty to keep current file)</span>}</label>
                                <input type="file" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-[#07fc03] focus:outline-none transition-colors" onChange={e => setNoteData({...noteData, file: e.target.files[0]})} />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Content (Optional Description)</label>
                                <textarea rows="3" className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-[#07fc03] focus:outline-none transition-colors custom-scrollbar" value={noteData.content} onChange={e => setNoteData({...noteData, content: e.target.value})}></textarea>
                            </div>
                            <div className="flex space-x-3">
                                <button type="submit" className="bg-[#07fc03] hover:bg-[#07fc03]/80 text-black px-4 py-2 rounded shadow-lg smooth-transition font-medium">
                                    {isEditingNote ? 'Update Note' : 'Upload Note'}
                                </button>
                                {isEditingNote && (
                                    <button type="button" onClick={handleCancelEditNote} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded shadow-lg smooth-transition font-medium transition-colors">
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </form>
                    </div>

                    {/* Manage Notes List */}
                    <div className="glass p-6 rounded-xl overflow-hidden">
                        <h2 className="text-xl font-bold mb-4 text-gray-100">Existing Notes</h2>
                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {notes.length === 0 ? (
                                <p className="text-gray-500">No notes found.</p>
                            ) : (
                                notes.map(note => (
                                    <div key={note.id} className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex justify-between items-start">
                                        <div>
                                            <h3 className="text-[#07fc03] font-bold">{note.title}</h3>
                                            <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded mt-1 inline-block">{note.topic}</span>
                                            {note.file_url && <a href={`${import.meta.env.VITE_API_URL}${note.file_url}`} target="_blank" rel="noreferrer" className="block text-xs text-blue-400 hover:text-blue-300 mt-1 uppercase tracking-wider font-mono">View File</a>}
                                        </div>
                                        <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                                            <button 
                                                onClick={() => handleEditNoteClick(note.id)}
                                                className="text-blue-400 hover:text-blue-500 text-sm border border-blue-500/30 px-3 py-1.5 rounded smooth-transition"
                                            >
                                                Edit
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteNote(note.id)}
                                                className="text-red-400 hover:text-red-500 text-sm border border-red-500/30 px-3 py-1.5 rounded smooth-transition"
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Manage Users Tab Data */}
            {activeTab === 'users' && (
                <div className="glass rounded-xl overflow-hidden pb-4">
                    <div className="p-4 flex justify-between items-center bg-gray-900/50 border-b border-gray-700">
                        <h2 className="text-xl font-bold text-gray-100">Registered Users ({users.length})</h2>
                        <button
                            onClick={openReminderModal}
                            disabled={selectedUserIds.length === 0}
                            className="bg-[#07fc03] hover:bg-[#07fc03]/80 text-black px-4 py-2 rounded shadow-lg smooth-transition font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <span>Send Email Reminder ({selectedUserIds.length})</span>
                        </button>
                    </div>

                    <div className="overflow-x-auto min-w-[800px]">
                        <table className="w-full text-left">
                            <thead className="bg-gray-800/80 text-gray-300 border-b border-gray-700 text-sm uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 w-12 text-center">
                                        <input 
                                            type="checkbox" 
                                            className="w-4 h-4 rounded bg-gray-900 border-gray-700 text-[#07fc03] focus:ring-[#07fc03]"
                                            onChange={handleSelectAllUsers}
                                            checked={users.length > 0 && selectedUserIds.length === users.length}
                                        />
                                    </th>
                                    <th className="px-6 py-4">ID</th>
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Email</th>
                                    <th className="px-6 py-4">Role</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Joined At</th>
                                    <th className="px-6 py-4">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-700/50 text-gray-300 font-medium">
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-8 text-center text-gray-500">No users found</td>
                                    </tr>
                                ) : (
                                    users.map(u => (
                                        <tr key={u.id} className="hover:bg-gray-700/30 smooth-transition">
                                            <td className="px-6 py-4 text-center">
                                                <input 
                                                    type="checkbox" 
                                                    className="w-4 h-4 rounded bg-gray-900 border-gray-700 text-[#07fc03] focus:ring-[#07fc03]"
                                                    checked={selectedUserIds.includes(u.id)}
                                                    onChange={() => handleSelectUser(u.id)}
                                                />
                                            </td>
                                            <td className="px-6 py-4 text-gray-500">#{u.id}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    {u.profile_image_url ? (
                                                        <img src={u.profile_image_url.startsWith('http') ? u.profile_image_url : `${import.meta.env.VITE_API_URL}${u.profile_image_url}`} alt="Avatar" className="w-8 h-8 rounded-full border border-gray-600" />
                                                    ) : (
                                                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold">{u.name.charAt(0).toUpperCase()}</div>
                                                    )}
                                                    <Link to={`/user/${u.id}`} className="font-bold text-white hover:text-[#07fc03] transition-colors">
                                                        {u.name}
                                                    </Link>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-gray-400">{u.email}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded text-xs uppercase tracking-wider ${u.role === 'Admin' ? 'bg-purple-900/50 text-purple-400 border border-purple-500/30' : 'bg-gray-800 text-gray-400'}`}>
                                                    {u.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                {u.is_blocked ? (
                                                    <span className="px-2 py-1 rounded text-xs uppercase tracking-wider bg-red-900/50 text-red-400 border border-red-500/30">Blocked</span>
                                                ) : (
                                                    <span className="px-2 py-1 rounded text-xs uppercase tracking-wider bg-green-900/50 text-green-400 border border-green-500/30">Active</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-gray-500 text-sm">{new Date(u.created_at).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                                            <td className="px-6 py-4">
                                                <div className="flex space-x-2">
                                                    {u.role !== 'Admin' && (
                                                        <>
                                                            <button 
                                                                onClick={() => handleBlockUser(u.id, u.is_blocked)}
                                                                className={`text-sm px-3 py-1.5 rounded smooth-transition ${u.is_blocked ? 'bg-yellow-600/20 text-yellow-500 hover:bg-yellow-600/40 border border-yellow-500/30' : 'bg-orange-600/20 text-orange-500 hover:bg-orange-600/40 border border-orange-500/30'}`}
                                                            >
                                                                {u.is_blocked ? 'Unblock' : 'Block'}
                                                            </button>
                                                            <button 
                                                                onClick={() => handleDeleteUser(u.id)}
                                                                className="text-red-400 hover:text-red-500 text-sm border border-red-500/30 px-3 py-1.5 rounded smooth-transition bg-red-600/10 hover:bg-red-600/30"
                                                            >
                                                                Delete
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}



            {/* Email Reminder Modal */}
            {showReminderModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-[#111] border border-gray-700 rounded-xl max-w-lg w-full p-6 shadow-2xl relative">
                        <button 
                            onClick={() => setShowReminderModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-white"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                        </button>
                        
                        <h2 className="text-2xl font-bold text-white mb-2">Send Reminder</h2>
                        <p className="text-gray-400 text-sm mb-6">Sending to <strong className="text-[#07fc03]">{selectedUserIds.length}</strong> selected user(s).</p>
                        
                        <form onSubmit={handleSendReminder} className="space-y-4">
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Template Type</label>
                                <select 
                                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-[#07fc03] focus:outline-none"
                                    value={reminderData.type}
                                    onChange={handleReminderTypeChange}
                                >
                                    <option>Contest Reminder</option>
                                    <option>Daily Challenge</option>
                                    <option>Custom Text</option>
                                </select>
                            </div>
                            
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Subject</label>
                                <input 
                                    required 
                                    type="text" 
                                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-[#07fc03] focus:outline-none" 
                                    value={reminderData.subject} 
                                    onChange={e => setReminderData({...reminderData, subject: e.target.value})} 
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm text-gray-400 mb-1">Message</label>
                                <textarea 
                                    required 
                                    rows="6" 
                                    className="w-full bg-gray-900 border border-gray-700 rounded p-2 text-white focus:border-[#07fc03] focus:outline-none custom-scrollbar" 
                                    value={reminderData.message} 
                                    onChange={e => setReminderData({...reminderData, message: e.target.value})}
                                ></textarea>
                            </div>
                            
                            <div className="pt-4 flex justify-end space-x-3">
                                <button type="button" onClick={() => setShowReminderModal(false)} className="text-gray-400 hover:text-white px-4 py-2">
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={sendingReminder}
                                    className="bg-[#07fc03] hover:bg-[#07fc03]/80 text-black px-6 py-2 rounded shadow-lg font-bold flex items-center justify-center disabled:opacity-50"
                                >
                                    {sendingReminder ? 'Sending...' : 'Send Emails'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;

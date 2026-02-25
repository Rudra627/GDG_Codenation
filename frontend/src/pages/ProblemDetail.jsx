import { useState, useEffect, useContext } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import Editor from '@monaco-editor/react';
import { Play, CheckCircle2, XCircle, AlertCircle, Clock } from 'lucide-react';
import Loader from '../components/Loader';

const ProblemDetail = () => {
    const { id } = useParams();
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const contestId = queryParams.get('contestId');

    const { user } = useContext(AuthContext);
    const [problem, setProblem] = useState(null);
    const [language, setLanguage] = useState('python');
    const [code, setCode] = useState('# Write your Python code here\n');
    const [output, setOutput] = useState(null); // stores submission result
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showLoader, setShowLoader] = useState(false);
    const [pendingOutput, setPendingOutput] = useState(null);

    useEffect(() => {
        const fetchProblem = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/problems/${id}`);
                setProblem(res.data);
            } catch (error) {
                console.error("Error fetching problem", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProblem();
    }, [id]);

    const handleLanguageChange = (e) => {
        const lang = e.target.value;
        setLanguage(lang);
        const templates = {
            'c': '#include <stdio.h>\n\nint main() {\n    // Write C code here\n    return 0;\n}',
            'c++': '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write C++ code here\n    return 0;\n}',
            'java': 'public class Main {\n    public static void main(String[] args) {\n        // Write Java code here\n    }\n}',
            'python': '# Write your Python code here\n'
        };
        setCode(templates[lang]);
    };

    const submitCode = async () => {
        setSubmitting(true);
        setOutput(null);
        try {
            const token = localStorage.getItem('token');
            const payload = { problemId: id, language, code };
            if (contestId) {
                payload.contestId = contestId;
            }
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/submissions`, 
                payload,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPendingOutput(res.data);
            setShowLoader(true);
        } catch (error) {
            console.error(error);
            setPendingOutput({ status: 'Error', message: error.response?.data?.message || 'Submission failed' });
            setShowLoader(true);
        } finally {
            setSubmitting(false);
        }
    };

    const renderOutputStatus = () => {
        if (!output) return null;
        
        const isAccepted = output.status === 'Accepted';
        const isPending = output.status === 'Pending';
        const isError = output.status === 'Error' || output.status.includes('Error');
        
        return (
            <div className={`mt-6 p-4 rounded-xl border ${isAccepted ? 'bg-[#07fc03]/10 border-[#07fc03]/50' : isPending ? 'bg-yellow-500/10 border-yellow-500/50' : 'bg-red-500/10 border-red-500/50'}`}>
                <div className="flex items-center space-x-2 font-bold mb-2">
                    {isAccepted ? <CheckCircle2 className="text-[#07fc03]" /> : isPending ? <Clock className="text-yellow-400" /> : <XCircle className="text-red-500" />}
                    <h3 className={isAccepted ? 'text-green-400 text-lg' : isPending ? 'text-yellow-400 text-lg' : 'text-red-400 text-lg'}>
                        {isPending ? 'Pending Admin Review' : output.status}
                    </h3>
                </div>
                {output.runtime !== undefined && output.runtime > 0 && (
                    <div className="flex items-center space-x-1 text-sm text-gray-400 mt-2">
                        <Clock size={14} />
                        <span>Runtime: {output.runtime}s</span>
                    </div>
                )}
                {output.message && <p className="text-gray-300 text-sm mt-2">{output.message}</p>}
                {output.failed_test_case_id && (
                    <p className="text-red-400 text-sm mt-2">Failed at Test Case #{output.failed_test_case_id}</p>
                )}
            </div>
        );
    };

    if (showLoader) {
        return <Loader onComplete={() => {
            setShowLoader(false);
            if (pendingOutput) {
                setOutput(pendingOutput);
                setPendingOutput(null);
            }
        }} />;
    }

    if (loading) return <div className="p-8 text-center text-gray-400">Loading problem...</div>;
    if (!problem) return <div className="p-8 text-center text-red-400">Problem not found</div>;

    return (
        <div className="flex-grow flex flex-col lg:flex-row h-full">
            {/* Left Pane: Question Description */}
            <div className="lg:w-1/2 p-4 sm:p-6 overflow-y-auto border-b lg:border-b-0 lg:border-r border-gray-700 bg-gray-900 min-h-[300px] lg:min-h-0">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-100">{problem.id}. {problem.title}</h1>
                    <span className={`self-start sm:self-auto px-3 py-1 text-xs font-semibold rounded-full border ${problem.difficulty === 'Easy' ? 'text-green-400 border-green-400/20 bg-green-400/10' : problem.difficulty === 'Medium' ? 'text-yellow-400 border-yellow-400/20 bg-yellow-400/10' : 'text-red-400 border-red-400/20 bg-red-400/10'}`}>
                        {problem.difficulty}
                    </span>
                </div>
                
                <div className="prose prose-sm sm:prose-base prose-invert max-w-none text-gray-300 whitespace-pre-wrap">
                    {problem.description}
                </div>
                
                {renderOutputStatus()}
            </div>

            {/* Right Pane: Code Editor */}
            <div className="lg:w-1/2 flex flex-col bg-[#1e1e1e] min-h-[500px] lg:min-h-0">
                {/* Editor Header */}
                <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
                    <select 
                        value={language} 
                        onChange={handleLanguageChange}
                        className="bg-gray-700 text-gray-200 text-xs sm:text-sm px-2 sm:px-3 py-1.5 rounded outline-none border border-gray-600 focus:border-[#07fc03]"
                    >
                        <option value="python">Python</option>
                        <option value="c">C</option>
                        <option value="c++">C++</option>
                        <option value="java">Java</option>
                    </select>
                    
                    <button 
                        onClick={submitCode}
                        disabled={submitting}
                        className="flex items-center space-x-1 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white px-3 sm:px-4 py-1.5 rounded-md text-xs sm:text-sm font-semibold smooth-transition shadow-lg shadow-green-500/20"
                    >
                        {submitting ? (
                            <span className="animate-pulse">Running...</span>
                        ) : (
                            <>
                                <Play size={16} fill="currentColor" />
                                <span>Submit</span>
                            </>
                        )}
                    </button>
                </div>
                
                <div className="flex-grow relative">
                    <Editor
                        height="100%"
                        language={language === 'c++' ? 'cpp' : language}
                        theme="vs-dark"
                        value={code}
                        onChange={(val) => setCode(val)}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            scrollBeyondLastLine: false,
                            padding: { top: 16 }
                        }}
                    />
                </div>
            </div>
        </div>
    );
};

export default ProblemDetail;

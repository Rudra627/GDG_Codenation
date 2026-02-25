import { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import Loader from '../components/Loader';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
    const { login, googleLogin } = useContext(AuthContext);
    const navigate = useNavigate();
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showLoader, setShowLoader] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login(credentials.email, credentials.password);
            setShowLoader(true);
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        setError('');
        try {
            await googleLogin(credentialResponse.credential);
            setShowLoader(true);
        } catch (err) {
            console.error("Google login threw an error", err);
            setError(err.response?.data?.details || err.response?.data?.message || 'Google Login failed');
            setLoading(false);
        }
    };

    if (showLoader) {
        return <Loader onComplete={() => navigate('/')} />;
    }

    return (
        <div className="flex-grow flex items-center justify-center p-4 sm:p-6">
            <div className="glass w-full max-w-md p-6 sm:p-8 rounded-2xl">
                <div className="text-center mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome Back</h2>
                    <p className="text-sm sm:text-base text-gray-400">Sign in to continue solving problems</p>
                </div>
                
                {error && <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-md mb-6 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                        <input 
                            type="email" 
                            required
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#07fc03] focus:ring-1 focus:ring-[#07fc03] smooth-transition"
                            value={credentials.email}
                            onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
                        <input 
                            type="password" 
                            required
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#07fc03] focus:ring-1 focus:ring-[#07fc03] smooth-transition"
                            value={credentials.password}
                            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-[#07fc03] hover:bg-[#07fc03]/80 text-black font-semibold py-3 rounded-lg shadow-lg shadow-[#07fc03]/30 smooth-transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="flex items-center space-x-4 mb-6">
                    <div className="flex-grow h-px bg-gray-700"></div>
                    <span className="text-gray-500 text-sm">OR</span>
                    <div className="flex-grow h-px bg-gray-700"></div>
                </div>
                
                <div className="flex justify-center flex-col items-center">
                    <GoogleLogin 
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError('Google Authentication Failed')}
                        theme="filled_black"
                        shape="pill"
                    />
                </div>

                <p className="mt-6 text-center text-gray-400 text-sm">
                    Don't have an account? <Link to="/register" className="text-[#07fc03] hover:text-[#07fc03]/80 font-medium">Register here</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;

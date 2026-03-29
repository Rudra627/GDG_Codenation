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
            <div className="glass w-full max-w-md p-7 sm:p-9 rounded-2xl border border-white/[0.06]">
                <div className="text-center mb-8">
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome Back</h2>
                    <p className="text-sm text-zinc-500">Sign in to continue solving problems</p>
                </div>
                
                {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-6 text-sm">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4 mb-6">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1.5">Email</label>
                        <input 
                            type="email" 
                            required
                            className="w-full bg-[#09090B] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-[#ffffff]/30 transition-all"
                            value={credentials.email}
                            onChange={(e) => setCredentials({...credentials, email: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-1.5">Password</label>
                        <input 
                            type="password" 
                            required
                            className="w-full bg-[#09090B] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-[#ffffff]/30 transition-all"
                            value={credentials.password}
                            onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-white hover:bg-[#00e085] text-[#09090B] font-semibold py-3 rounded-lg shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_28px_rgba(255,255,255,0.25)] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <div className="flex items-center gap-4 mb-6">
                    <div className="flex-grow h-px bg-white/[0.06]" />
                    <span className="text-zinc-600 text-sm">or</span>
                    <div className="flex-grow h-px bg-white/[0.06]" />
                </div>
                
                <div className="flex justify-center flex-col items-center">
                    <GoogleLogin 
                        onSuccess={handleGoogleSuccess}
                        onError={() => setError('Google Authentication Failed')}
                        theme="filled_black"
                        shape="pill"
                    />
                </div>

                <p className="mt-6 text-center text-zinc-500 text-sm">
                    Don't have an account? <Link to="/register" className="text-white hover:text-[#00e085] font-medium transition-colors">Register here</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;

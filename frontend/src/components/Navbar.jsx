import { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LogOut, User, Menu, X, Code2 } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsMobileMenuOpen(false);
    };

    const isActive = (path) => {
        if (path === '/') return location.pathname === '/';
        return location.pathname.startsWith(path);
    };

    const navLink = (path, label) => {
        const active = isActive(path);
        return (
            <Link
                to={path}
                className={`text-sm font-medium tracking-wide transition-all duration-200 px-4 py-1.5 rounded-full ${
                    active
                        ? 'bg-white/10 text-white'
                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
            >
                {label}
            </Link>
        );
    };

    return (
        <>
        <nav className="bg-[#0f0f11]/80 backdrop-blur-2xl border-b border-white/[0.05] sticky top-0 z-[100] px-6 md:px-10 py-4 flex items-center justify-between">
           
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity z-50 group" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.2)] group-hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-shadow">
                    <Code2 size={16} className="text-black" />
                </div>
                <span className="text-white font-semibold tracking-tight text-lg">GDG Code Nation</span>
            </Link>

           
            <div className="hidden lg:flex items-center gap-2 absolute left-1/2 -translate-x-1/2 bg-white/[0.03] p-1 rounded-full border border-white/[0.05]">
                {navLink('/', 'Home')}
                {user && (
                    <>
                        {navLink('/problems', 'Problems')}
                        {navLink('/contests', 'Contests')}
                        {navLink('/roadmap', 'Roadmap')}
                        {navLink('/notes', 'Notes')}
                    </>
                )}
                {user?.role === 'Admin' && navLink('/admin', 'Admin')}
            </div>

            
            <div className="hidden md:flex items-center gap-4">
                {user ? (
                    <>
                        <Link to="/profile" className="flex items-center gap-2 text-zinc-400 text-sm hover:text-white transition-colors bg-white/[0.03] p-1 pr-3 rounded-full border border-white/[0.05]">
                            {user.profile_image_url ? (
                                <img 
                                    src={user.profile_image_url.startsWith('http') ? user.profile_image_url : `${import.meta.env.VITE_API_URL}${user.profile_image_url}`} 
                                    alt="Avatar" 
                                    className="w-7 h-7 rounded-full object-cover border border-white/10" 
                                />
                            ) : (
                                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center">
                                    <User size={14} className="text-zinc-400" />
                                </div>
                            )}
                            <span className="text-xs font-medium">{user.username || 'Profile'}</span>
                        </Link>
                        <button 
                            onClick={handleLogout}
                            className="text-zinc-400 hover:text-white p-2 rounded-full hover:bg-white/5 transition-all flex items-center justify-center"
                            title="Logout"
                        >
                            <LogOut size={18} />
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className={`text-sm font-medium transition-colors px-4 py-2 rounded-full hover:bg-white/5 ${isActive('/login') ? 'text-white' : 'text-zinc-400 hover:text-white'}`}>Log in</Link>
                        <Link to="/register" className="bg-white hover:bg-zinc-200 text-black px-5 py-2 rounded-full text-sm font-semibold tracking-wide transition-all shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                            Sign up
                        </Link>
                    </>
                )}
            </div>

            {/* Mobile Menu Toggle */}
            <button 
                className="md:hidden text-zinc-400 hover:text-white z-[110] p-2 rounded-full hover:bg-white/5"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
        </nav>

        {/* Mobile Backdrop */}
        {isMobileMenuOpen && (
            <div 
                className="fixed inset-0 bg-[#0f0f11]/80 backdrop-blur-md z-[105] md:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
            />
        )}

        {/* Mobile Sidebar */}
        <div className={`fixed top-0 right-0 h-full w-72 bg-[#1a1a1c] border-l border-white/[0.05] z-[110] transform transition-transform duration-300 ease-out md:hidden flex flex-col pt-24 px-6 gap-2 overflow-y-auto shadow-2xl ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <button 
                className="absolute top-6 right-6 text-zinc-500 hover:text-white p-2 rounded-full hover:bg-white/5"
                onClick={() => setIsMobileMenuOpen(false)}
            >
                <X size={22} />
            </button>

            <Link to="/" className="text-sm font-medium text-zinc-400 hover:text-white py-3 px-4 rounded-xl hover:bg-white/5 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Home</Link>
            
            {user && (
                <>
                    <Link to="/problems" className="text-sm font-medium text-zinc-400 hover:text-white py-3 px-4 rounded-xl hover:bg-white/5 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Problems</Link>
                    <Link to="/contests" className="text-sm font-medium text-zinc-400 hover:text-white py-3 px-4 rounded-xl hover:bg-white/5 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Contests</Link>
                    <Link to="/roadmap" className="text-sm font-medium text-zinc-400 hover:text-white py-3 px-4 rounded-xl hover:bg-white/5 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Roadmap</Link>
                    <Link to="/notes" className="text-sm font-medium text-zinc-400 hover:text-white py-3 px-4 rounded-xl hover:bg-white/5 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Notes</Link>
                    
                    <div className="h-px bg-white/[0.05] w-full my-2"></div>

                    <Link to="/profile" className="flex items-center gap-3 text-sm font-medium text-zinc-400 hover:text-white py-3 px-4 rounded-xl hover:bg-white/5 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                        {user.profile_image_url ? (
                            <img 
                                src={user.profile_image_url.startsWith('http') ? user.profile_image_url : `${import.meta.env.VITE_API_URL}${user.profile_image_url}`} 
                                alt="Avatar" 
                                className="w-8 h-8 rounded-full object-cover border border-white/10" 
                            />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                <User size={16} />
                            </div>
                        )}
                        <span>Profile</span>
                    </Link>

                    {user?.role === 'Admin' && (
                        <Link to="/admin" className="text-sm font-medium text-white bg-white/10 py-3 px-4 rounded-xl hover:bg-white/20 transition-colors mt-2" onClick={() => setIsMobileMenuOpen(false)}>Admin Panel</Link>
                    )}
                    
                    <button onClick={handleLogout} className="text-sm font-medium text-zinc-400 hover:text-white flex items-center gap-2 py-3 px-4 rounded-xl hover:bg-white/5 transition-colors mt-2">
                        <LogOut size={16} />
                        <span>Logout</span>
                    </button>
                </>
            )}

            {!user && (
                <>
                    <div className="h-px bg-white/[0.05] w-full my-2"></div>
                    <Link to="/login" className="text-sm font-medium text-zinc-400 hover:text-white py-3 px-4 rounded-xl hover:bg-white/5 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Log in</Link>
                    <Link to="/register" className="block text-center bg-white text-black font-semibold px-6 py-3 rounded-full mt-4 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:bg-zinc-200 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Sign up</Link>
                </>
            )}
        </div>
        </>
    );
};

export default Navbar;

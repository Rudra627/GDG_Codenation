import { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Code2, LogOut, User, Trophy, Menu, X } from 'lucide-react';

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsMobileMenuOpen(false);
    };

    const navLinkClass = "text-xs font-mono tracking-[0.2em] uppercase text-gray-500 hover:text-white smooth-transition relative group";
    const activeLinkClass = "text-[#07fc03]";

    const getLinkClass = (path) => {
        return `${navLinkClass} ${location.pathname === path ? activeLinkClass : ''}`;
    };

    return (
        <>
        <nav className="bg-black/90 backdrop-blur-xl border-b border-[#07fc03]/30 sticky top-0 z-[100] px-4 md:px-8 py-4 sm:py-5 flex items-center justify-between font-mono">
            <Link to="/" className="flex items-center space-x-2 sm:space-x-3 hover:opacity-80 smooth-transition z-50" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="bg-[#07fc03] w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(7,252,3,0.4)]">
                    <span className="text-white font-bold text-sm sm:text-lg leading-none">&lt;/&gt;</span>
                </div>
                <span className="text-[#07fc03] text-xl sm:text-2xl font-bold tracking-tight">CodeNation</span>
            </Link>

            {/* Desktop Navigation Links (Middle) */}
            <div className="hidden lg:flex items-center justify-center space-x-8 xl:space-x-12 absolute left-1/2 -translate-x-1/2">
                 <Link to="/" className={getLinkClass('/')}>
                    SYSTEM
                    {location.pathname === '/' && <div className="absolute -bottom-6 left-0 right-0 h-0.5 bg-[#07fc03] shadow-[0_0_10px_#07fc03]"></div>}
                </Link>
                {user && (
                    <>
                        <Link to="/problems" className={getLinkClass('/problems')}>
                            CHALLENGES
                            {location.pathname === '/problems' && <div className="absolute -bottom-6 left-0 right-0 h-0.5 bg-[#07fc03] shadow-[0_0_10px_#07fc03]"></div>}
                        </Link>
                        <Link to="/contests" className={getLinkClass('/contests')}>
                            CONTESTS
                            {location.pathname.startsWith('/contests') && <div className="absolute -bottom-6 left-0 right-0 h-0.5 bg-[#07fc03] shadow-[0_0_10px_#07fc03]"></div>}
                        </Link>
                        <Link to="/notes" className={getLinkClass('/notes')}>
                            NOTES
                            {location.pathname === '/notes' && <div className="absolute -bottom-6 left-0 right-0 h-0.5 bg-[#07fc03] shadow-[0_0_10px_#07fc03]"></div>}
                        </Link>
                    </>
                )}
                {user?.role === 'Admin' && (
                    <Link to="/admin" className={getLinkClass('/admin')}>
                        TERMINAL
                         {location.pathname === '/admin' && <div className="absolute -bottom-6 left-0 right-0 h-0.5 bg-[#07fc03] shadow-[0_0_10px_#07fc03]"></div>}
                    </Link>
                )}
            </div>

            {/* Right side Auth Controls Desktop */}
            <div className="hidden md:flex items-center space-x-4 lg:space-x-6">
                {user ? (
                    <>
                        <Link to="/profile" className="flex items-center space-x-2 text-gray-400 font-mono text-xs tracking-widest uppercase hover:text-[#07fc03] border-b border-transparent hover:border-[#07fc03] pb-1 smooth-transition">
                            {user.profile_image_url ? (
                                <img 
                                    src={user.profile_image_url.startsWith('http') ? user.profile_image_url : `${import.meta.env.VITE_API_URL}${user.profile_image_url}`} 
                                    alt="Avatar" 
                                    className="w-5 h-5 rounded-sm object-cover border border-[#07fc03]/50" 
                                />
                            ) : (
                                <User size={14} className="text-[#07fc03]" />
                            )}
                            <span className="hidden sm:inline-block max-w-[100px] truncate">{user.name}</span>
                        </Link>
                        <button 
                            onClick={handleLogout}
                            className="text-xs font-mono tracking-widest uppercase text-gray-500 hover:text-red-500 smooth-transition flex items-center space-x-2"
                        >
                            <span>LOGOUT</span>
                            <LogOut size={14} />
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login" className={getLinkClass('/login')}>LOGIN</Link>
                        <Link to="/register" className="text-xs font-mono tracking-widest uppercase border border-[#07fc03]/40 hover:border-[#07fc03] hover:text-black hover:bg-[#07fc03] text-[#07fc03] px-4 py-2 sm:px-6 sm:py-2.5 rounded-sm smooth-transition shadow-[0_0_10px_rgba(7,252,3,0.1)] hover:shadow-[0_0_15px_rgba(7,252,3,0.4)]">
                            REGISTER
                        </Link>
                    </>
                )}
            </div>

            {/* Mobile Menu Icon */}
            <button 
                className="md:hidden text-[#07fc03] z-[110] p-2 relative"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
        </nav>

        {/* Mobile Menu Overlay */}
        {isMobileMenuOpen && (
            <div 
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[105] md:hidden"
                onClick={() => setIsMobileMenuOpen(false)}
            ></div>
        )}

        {/* Mobile Navigation Sidebar */}
        <div className={`fixed top-0 right-0 h-full w-64 bg-[#0a0a0a] border-l border-[#07fc03]/30 z-[110] transform transition-transform duration-300 ease-in-out md:hidden flex flex-col pt-24 px-6 space-y-6 overflow-y-auto ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            <button 
                className="absolute top-4 right-4 text-[#07fc03] p-2"
                onClick={() => setIsMobileMenuOpen(false)}
            >
                <X size={28} />
            </button>
            <Link to="/" className="text-lg font-mono tracking-widest uppercase text-white hover:text-[#07fc03] w-full border-b border-gray-800 pb-3" onClick={() => setIsMobileMenuOpen(false)}>SYSTEM</Link>
            
            {user && (
                <>
                    <Link to="/problems" className="text-lg font-mono tracking-widest uppercase text-white hover:text-[#07fc03] w-full border-b border-gray-800 pb-3" onClick={() => setIsMobileMenuOpen(false)}>CHALLENGES</Link>
                    <Link to="/contests" className="text-lg font-mono tracking-widest uppercase text-white hover:text-[#07fc03] w-full border-b border-gray-800 pb-3" onClick={() => setIsMobileMenuOpen(false)}>CONTESTS</Link>
                    <Link to="/notes" className="text-lg font-mono tracking-widest uppercase text-white hover:text-[#07fc03] w-full border-b border-gray-800 pb-3" onClick={() => setIsMobileMenuOpen(false)}>NOTES</Link>
                    
                    <Link to="/profile" className="flex items-center space-x-3 text-lg font-mono tracking-widest uppercase text-white hover:text-[#07fc03] w-full border-b border-gray-800 pb-3 mt-4" onClick={() => setIsMobileMenuOpen(false)}>
                          {user.profile_image_url ? (
                            <img 
                                src={user.profile_image_url.startsWith('http') ? user.profile_image_url : `${import.meta.env.VITE_API_URL}${user.profile_image_url}`} 
                                alt="Avatar" 
                                className="w-8 h-8 rounded-sm object-cover border border-[#07fc03]/50" 
                            />
                        ) : (
                            <User size={24} className="text-[#07fc03]" />
                        )}
                        <span>PROFILE</span>
                    </Link>

                    {user?.role === 'Admin' && (
                        <Link to="/admin" className="text-lg font-mono tracking-widest uppercase text-[#07fc03] hover:text-white w-full border-b border-gray-800 pb-3" onClick={() => setIsMobileMenuOpen(false)}>TERMINAL (ADMIN)</Link>
                    )}
                    
                    <button onClick={handleLogout} className="text-lg font-mono tracking-widest uppercase text-red-500 hover:text-red-400 flex items-center space-x-2 w-full pt-4">
                        <LogOut size={20} />
                        <span>LOGOUT</span>
                    </button>
                </>
            )}

            {!user && (
                <>
                    <Link to="/login" className="text-lg font-mono tracking-widest uppercase text-white hover:text-[#07fc03] w-full border-b border-gray-800 pb-3" onClick={() => setIsMobileMenuOpen(false)}>LOGIN</Link>
                    <Link to="/register" className="text-lg font-mono tracking-widest uppercase border border-[#07fc03] text-[#07fc03] px-6 py-2 rounded-sm hover:bg-[#07fc03] hover:text-black smooth-transition text-center mt-4 w-full block" onClick={() => setIsMobileMenuOpen(false)}>REGISTER</Link>
                </>
            )}
        </div>
        </>
    );
};

export default Navbar;

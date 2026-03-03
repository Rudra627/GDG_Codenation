import { Link } from 'react-router-dom';
import { Target, Users, Zap } from 'lucide-react';

const HomePage = () => {
    return (
        <div className="flex-grow flex flex-col items-center bg-black relative overflow-hidden font-mono">
            
            {/* Very faint hacker green background glow */}
            <div className="absolute inset-0 bg-black z-0" />
            <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#07fc03]/5 rounded-full blur-[100px] z-0 pointer-events-none" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#07fc03]/5 rounded-full blur-[100px] z-0 pointer-events-none" />

            {/* Central HUD Hero Section */}
            <section className="w-full max-w-6xl relative pt-4 pb-12 z-10 px-4 md:px-8 flex flex-col items-center justify-center min-h-[60vh] md:min-h-[70vh]">
                
                <div className="hud-glass w-full rounded-2xl p-8 md:p-16 flex flex-col items-center text-center relative mt-2 md:mt-4">
                    {/* HUD Decorators */}
                    <div className="hud-corner-tl"></div>
                    <div className="hud-corner-tr"></div>
                    <div className="hud-corner-bl"></div>
                    <div className="hud-corner-br"></div>
                    
                    {/* Top left pseudo-logo/reticle */}
                    <div className="absolute top-6 left-6 text-gray-500 text-xs hidden md:block">
                        <div className="flex items-center space-x-2">
                            <span className="w-4 h-4 rounded-full border border-gray-500 flex items-center justify-center text-[8px]">┼</span>
                            
                        </div>
                    </div>

                    {/* Top right pseudo-data */}
                    <div className="absolute top-6 right-8 text-gray-500 text-xs hidden md:block tracking-widest opacity-50">
                       
                    </div>

                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight uppercase mt-12 md:mt-8">
                        <span className="text-[#07fc03]">&lt;</span>
                        <span className="text-gray-100">START COOKING YOUR CODE CONFIDENTLY</span>
                        <span className="text-[#07fc03]">&gt;</span>
                    </h1>
                    
                    <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-2xl mx-auto lowercase">
                        Starcdt Building Your Logic and Improve Your Coding Skills 
                    </p>
                    
                    <div className="flex justify-center mb-8">
                        <Link 
                            to="/problems" 
                            className="bg-[#07fc03] hover:bg-[#00cc00] text-black font-bold uppercase tracking-widest text-sm px-12 py-4 shadow-[0_0_20px_rgba(0,255,0,0.3)] smooth-transition clip-path-slant relative z-20 rounded-sm"
                            style={{ clipPath: 'polygon(10% 0, 100% 0, 90% 100%, 0% 100%)' }}
                        >
                            <span className="relative z-10 px-4">TRY NOW</span>
                        </Link>
                    </div>

                    {/* Faux bottom arrow */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-[#07fc03]/50">
                        ▼
                    </div>

                    {/* Bottom Left Loader Decoration */}
                    <div className="absolute bottom-6 left-6 text-left hidden md:block">
                        <div className="flex items-center space-x-2 mb-1">
                            <div className="flex space-x-1 h-2">
                                <div className="w-8 bg-[#07fc03] h-full skew-x-[-20deg]"></div>
                                <div className="w-6 bg-[#07fc03] h-full skew-x-[-20deg]"></div>
                                <div className="w-4 bg-gray-700 h-full skew-x-[-20deg]"></div>
                            </div>
                        </div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest flex items-baseline space-x-2">
                            <span>ANALYZING YOUR WAY</span>
                            <span className="text-[#07fc03] text-sm">80%</span>
                        </div>
                    </div>

                    {/* Bottom Right Decoration */}
                    <div className="absolute bottom-6 right-6 text-right hidden md:block">
                         <div className="flex items-center justify-end space-x-2 mb-1">
                            <div className="flex space-x-1 h-2">
                                <div className="w-12 bg-[#07fc03] h-full skew-x-[-20deg]"></div>
                                <div className="w-4 bg-[#07fc03] h-full skew-x-[-20deg]"></div>
                                <div className="w-8 bg-gray-700 h-full skew-x-[-20deg]"></div>
                            </div>
                        </div>
                        <div className="text-[10px] text-gray-500 uppercase tracking-widest">
                            EXPERIENCE BOOST
                        </div>
                    </div>

                </div>
            </section>

            {/* Features remain mostly static but darkened to fit theme */}
            <section className="w-full max-w-7xl mx-auto px-6 py-12 relative z-10">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="bg-[#0a0a0a] border border-[#07fc03]/20 p-8 rounded-xl text-center group hover:border-[#07fc03]/60 smooth-transition">
                        <Target className="text-[#07fc03]/50 mx-auto mb-6 group-hover:text-[#07fc03] transition-colors" size={32} />
                        <h3 className="text-lg font-bold text-[#07fc03] mb-2 uppercase">Skills</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">Start Improve your logic and improve your coding skills</p>
                    </div>
                    <div className="bg-[#0a0a0a] border border-[#07fc03]/20 p-8 rounded-xl text-center group hover:border-[#07fc03]/60 smooth-transition">
                        <Zap className="text-[#07fc03]/50 mx-auto mb-6 group-hover:text-[#07fc03] transition-colors" size={32} />
                        <h3 className="text-lg font-bold text-[#07fc03] mb-2 uppercase">Execution</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">Integrated Judge0 engine for speed.</p>
                    </div>
                    <div className="bg-[#0a0a0a] border border-[#07fc03]/20 p-8 rounded-xl text-center group hover:border-[#07fc03]/60 smooth-transition">
                        <Users className="text-[#07fc03]/50 mx-auto mb-6 group-hover:text-[#07fc03] transition-colors" size={32} />
                        <h3 className="text-lg font-bold text-[#07fc03] mb-2 uppercase">Community</h3>
                        <p className="text-gray-500 text-sm leading-relaxed">join our gdg whatsapp group where you can interact with as</p>

<a 
    href="https://chat.whatsapp.com/IDhNDQ4qxgA26mzbxvndIo" 
    target="_blank" 
    rel="noopener noreferrer" 
    className="inline-block bg-[#07fc03] text-black px-6 py-2 rounded-full mt-4 hover:bg-[#07fc03]/80 transition-colors font-bold"
>
    Join Group
</a>

                    </div>
                </div>
            </section>

            {/* About Codenation Section */}
            <section className="w-full max-w-5xl mx-auto px-6 py-8 relative z-10 mb-8">
                <div className="bg-[#0a0a0a] border border-[#07fc03]/30 p-8 md:p-12 rounded-xl group hover:border-[#07fc03]/60 smooth-transition shadow-[0_0_15px_rgba(7,252,3,0.1)] relative overflow-hidden">
                    {/* Corner decorative borders */}
                    <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-[#07fc03]/50 rounded-tl-lg"></div>
                    <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-[#07fc03]/50 rounded-br-lg"></div>
                    
                    <h2 className="text-2xl md:text-4xl font-bold text-[#07fc03] mb-3 uppercase tracking-wider text-center flex items-center justify-center gap-4">
                        <span className="text-[#07fc03]/50 text-xl hidden md:inline">{"//"}</span>
                        About CodeNation
                        <span className="text-[#07fc03]/50 text-xl hidden md:inline">{"//"}</span>
                    </h2>
                    
                    <p className="text-[#07fc03]/80 text-center text-xs md:text-sm mb-10 uppercase tracking-[0.2em] font-bold">
                        An Initiative by Google Developer Groups on Campus GIETU
                    </p>
                    
                    <div className="space-y-8 text-gray-300 text-sm md:text-base leading-relaxed max-w-4xl mx-auto">
                        <p className="text-center md:text-left px-4">
                            This community is dedicated to fostering excellence in Competitive Programming (CP) and Data Structures & Algorithms (DSA) among students at GIETU, building a culture of consistent learning and problem-solving.
                        </p>
                        
                        <div className="relative border-l-2 border-[#07fc03]/50 pl-6 py-4 my-8 bg-[#07fc03]/[0.02] rounded-r-lg">
                            <h3 className="text-[#07fc03] font-bold text-lg mb-4 uppercase tracking-widest flex items-center gap-2">
                                <Target size={18} className="text-[#07fc03]" />
                                Mission Statement
                            </h3>
                            <p className="text-gray-400 italic">
                                "To cultivate a disciplined, collaborative, and growth-focused coding ecosystem within GDG on Campus GIETU, empowering members to develop strong problem-solving foundations and excel in competitive programming."
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* About GDG Section */}
            <section className="w-full max-w-5xl mx-auto px-6 py-8 relative z-10 mb-16">
                <div className="bg-[#0a0a0a] border border-[#07fc03]/30 p-8 md:p-12 rounded-xl group hover:border-[#07fc03]/60 smooth-transition shadow-[0_0_15px_rgba(7,252,3,0.1)] relative overflow-hidden">
                    {/* Corner decorative borders */}
                    <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-[#07fc03]/50 rounded-tr-lg"></div>
                    <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-[#07fc03]/50 rounded-bl-lg"></div>
                    
                    <h2 className="text-2xl md:text-4xl font-bold text-[#07fc03] mb-6 uppercase tracking-wider text-center flex items-center justify-center gap-4">
                        <span className="text-[#07fc03]/50 text-xl hidden md:inline">{"//"}</span>
                        About GDG
                        <span className="text-[#07fc03]/50 text-xl hidden md:inline">{"//"}</span>
                    </h2>
                    
                    <div className="space-y-6 text-gray-300 text-sm md:text-base leading-relaxed max-w-4xl mx-auto px-4">
                        <p className="font-bold text-[#07fc03] text-lg text-center border border-[#07fc03]/20 bg-[#07fc03]/10 py-3 rounded-lg">
                            Google Developer Group (GDG) is not just a community — it’s a movement.
                        </p>
                        <p>
                            In rooms filled with glowing screens and restless minds, GDG comes alive where ideas are born, failures are embraced, and innovation takes its first breath. It is where students, developers, and dreamers gather — not to follow trends, but to create what comes next.
                        </p>
                        <p>
                            From late-night debugging sessions to electrifying hackathons, from quiet moments of learning to loud celebrations of breakthroughs — GDG is the place where curiosity turns into code, and code turns into impact. Every meetup is a spark. Every collaboration is a step forward.
                        </p>
                        <p>
                            Here, leadership is forged through action, confidence is built through community, and growth is driven by passion. <span className="text-[#07fc03] font-bold">GDG empowers individuals to think bigger, build smarter, and lead fearlessly</span> — regardless of where they come from.
                        </p>
                    </div>
                </div>
            </section>
            {/* Footer Section */}
            <footer className="w-full border-t border-[#07fc03]/20 bg-[#050505] py-12 relative z-10 mt-auto">
                <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
                    {/* Brand */}
                    <div className="flex flex-col items-center md:items-start">
                        <div className="flex items-center space-x-3 mb-2">
                             <div className="bg-[#07fc03] w-8 h-8 rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(7,252,3,0.3)]">
                                <span className="text-black font-bold text-sm leading-none">&lt;/&gt;</span>
                            </div>
                            <span className="text-[#07fc03] text-xl font-bold tracking-tight">CodeNation</span>
                        </div>
                        <p className="text-gray-500 text-xs tracking-widest uppercase">Devloped by Google Devloper Group of GIET University</p>
                    </div>

                    {/* Contact Info */}
                    <div className="flex flex-col items-center md:items-end space-y-3">
                        <h4 className="text-[#07fc03] text-sm font-bold uppercase tracking-widest mb-1">Contact Terminal</h4>
                        <div className="flex items-center space-x-3 text-gray-400 hover:text-white smooth-transition text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#07fc03]"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                            <span>gdg@gietu.edu</span>
                        </div>
                        <div className="flex items-center space-x-3 text-gray-400 hover:text-white smooth-transition text-sm">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#07fc03]"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                            <span>Primary Server: GIET University Gunupur</span>
                        </div>
                    </div>
                </div>
                
                <div className="max-w-6xl mx-auto px-6 mt-10 pt-6 border-t border-gray-900 text-center flex flex-col items-center">
                    <p className="text-gray-600 text-[10px] tracking-[0.2em] uppercase">
                        &copy; {new Date().getFullYear()} CodeNation by GDG. All System Rights Reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;

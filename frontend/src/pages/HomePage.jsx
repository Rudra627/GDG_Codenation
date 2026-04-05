import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Target, Zap, Users, Mail, MapPin } from 'lucide-react';

const HomePage = () => {
    return (
        <div className="flex-grow flex flex-col items-center bg-[#000000] relative overflow-x-hidden font-sans min-h-screen">
            
            {/* Background Grid Pattern */}
            <div className="absolute inset-0 z-0 opacity-100 pointer-events-none mask-radial-fade">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDgpIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=')]"></div>
            </div>

            {/* CSS styles for local radial masking used in grid background */}
            <style dangerouslySetInnerHTML={{__html: `
                .mask-radial-fade {
                    mask-image: radial-gradient(ellipse at top center, black 30%, transparent 100%);
                    -webkit-mask-image: radial-gradient(ellipse at top center, black 30%, transparent 100%);
                }
            `}} />

            {/* Central Ambient Glow */}
            <div className="absolute top-[40%] left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-white/5 rounded-full blur-[150px] pointer-events-none z-0" />

            {/* Hero Section */}
            <section className="w-full relative pt-28 pb-16 z-10 px-6 flex flex-col items-center justify-start flex-grow">
                
                {/* Flo.AI style Welcome Pill */}
                <div className="inline-flex items-center gap-2.5 bg-[#1a1a1c] border border-white/5 pl-2 pr-4 py-1.5 rounded-full mb-8 shadow-[0_4px_15px_rgba(0,0,0,0.8)] backdrop-blur-md">
                    <div className="w-[20px] h-[20px] rounded-full bg-white flex items-center justify-center shadow-[0_0_8px_rgba(255,255,255,0.8)] relative overflow-hidden">
                        <div className="absolute top-[3px] left-[3px] w-[14px] h-[4px] bg-black rounded-[1px] -rotate-12 shadow-[0_0_2px_black]"></div>
                        <div className="absolute bottom-[4px] left-[5px] w-[12px] h-[3px] bg-black rounded-[1px] rotate-12 shadow-[0_0_2px_black]"></div>
                    </div>
                    <span className="text-[#dcdcdc] text-[13px] font-semibold tracking-wide">Welcome to GDG Code Nation</span>
                </div>

                {/* Main Headline */}
                <h1 className="text-[44px] sm:text-[60px] md:text-[80px] font-[700] text-center leading-[1.05] mb-6 tracking-tight text-[#f5f5f7]">
                    Coding is not Hard, <br className="hidden sm:block" /> You need to try Hard enough
                </h1>
                
                {/* Subtext */}
                <p className="text-[17px] sm:text-[20px] text-[#a1a1aa] mb-12 max-w-[700px] mx-auto text-center leading-[1.6] tracking-wide font-[400]">
                    Discover tools that redefine how you create and build—without <br className="hidden sm:block" /> writing a single line of code.
                </p>
                
                {/* Primary Action */}
                <div className="flex justify-center relative z-20 mb-20">
                    <Link 
                        to="/problems" 
                        className="bg-white hover:bg-zinc-200 text-black font-semibold text-[15px] px-8 py-[14px] rounded-[4px] shadow-[0_0_25px_rgba(255,255,255,0.2)] transition-all duration-300 tracking-wide flex items-center justify-center"
                    >
                        Explore Features
                    </Link>
                </div>

                {/* Centerpiece 3D Box Illustration area */}
                <div className="relative w-full max-w-4xl flex items-center justify-center pointer-events-none mt-4">
                    
                    {/* Perspective base platform */}
                    <div style={{ perspective: '800px' }} className="absolute bottom-[-20px] w-full flex justify-center">
                        <div className="w-[60%] max-w-[500px] h-[100px] bg-[#0a0a0a] border border-white/20 transform rotateX-60 shadow-[0_0_50px_rgba(255,255,255,0.1)] relative flex items-center justify-center overflow-hidden">
                            {/* Inner glowing circle on platform */}
                            <div className="w-[60%] h-[40%] bg-white/10 blur-[15px] rounded-[100%] absolute top-[30%] shadow-[inset_0_0_30px_rgba(255,255,255,0.2)] border-t border-white/20"></div>
                            {/* Tech-like grid texture */}
                            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgweiIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwyNTUsMjU1LDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3N2Zz4=')]"></div>
                        </div>
                    </div>

                    {/* Laser beams shooting up */}
                    <div className="absolute bottom-[20px] w-[220px] h-[400px] bg-gradient-to-t from-white/20 via-white/5 to-transparent blur-xl"></div>
                    <div className="absolute bottom-[10px] w-[100px] h-[500px] bg-gradient-to-t from-white/30 to-transparent blur-[30px]"></div>

                    {/* Central Glowing Cube */}
                    <div className="relative w-48 h-48 sm:w-64 sm:h-64 mb-16">
                        {/* Shadow underneath cube */}
                        <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[220px] h-[80px] bg-white/10 blur-[50px] rounded-full"></div>
                        <div className="absolute inset-0 bg-white/10 blur-[40px] rounded-full mix-blend-screen scale-125"></div>
                        
                        {/* The Box */}
                        <div className="absolute inset-0 bg-black/60 border border-white/30 rounded-2xl transform rotate-45 flex items-center justify-center p-2 shadow-[0_0_100px_rgba(255,255,255,0.2)] backdrop-blur-md z-10 box-border">
                            {/* Inner Box Face */}
                            <div className="w-full h-full bg-[#111] rounded-xl flex items-center justify-center border border-white/20 shadow-[inset_0_0_80px_rgba(0,0,0,0.9)] relative overflow-hidden">
                                {/* Glossy top highlight */}
                                <div className="absolute top-0 right-0 w-[150%] h-[50%] bg-gradient-to-b from-white/20 to-transparent transform -rotate-45 translate-x-4 -translate-y-8"></div>
                                
                                {/* Logo symbol inside perfectly matching the pill */}
                                <div className="transform -rotate-45 relative w-16 h-16 pointer-events-none">
                                    <div className="absolute top-[10px] left-[0px] w-[50px] h-[12px] bg-white rounded-sm -rotate-[15deg] shadow-[0_0_20px_white]"></div>
                                    <div className="absolute bottom-[15px] left-[5px] w-[40px] h-[10px] bg-white rounded-sm rotate-[15deg] shadow-[0_0_20px_white]"></div>
                                </div>
                            </div>
                        </div>

                        {/* Floating elements */}
                        <div className="absolute -top-4 -left-16 w-5 h-5 bg-white/80 rotate-45 blur-[2px] shadow-[0_0_15px_white]"></div>
                        <div className="absolute bottom-10 -right-20 w-8 h-8 bg-white/70 rotate-12 blur-[2px] shadow-[0_0_20px_white]"></div>
                        <div className="absolute -top-16 right-8 w-3 h-3 bg-white/90 blur-[1px] shadow-[0_0_10px_white]"></div>
                        <div className="absolute bottom-0 -left-8 w-4 h-4 bg-white/60 blur-[3px] shadow-[0_0_15px_white]"></div>
                    </div>
                </div>

            </section>

            {/* Features Grid */}
            <motion.section 
                initial={{ opacity: 0, y: 30 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.8 }} 
                viewport={{ once: true, margin: "-100px" }}
                className="w-full max-w-5xl mx-auto px-6 py-20 z-10 grid grid-cols-1 md:grid-cols-3 gap-6"
            >
                {/* Card 1 */}
                <div className="bg-[#111113] border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center hover:border-zinc-300/50 transition-colors group">
                    <Target className="text-white mb-6" size={32} />
                    <h3 className="text-zinc-200 font-bold tracking-widest uppercase mb-4 text-sm group-hover:text-white transition-colors">Skills</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">Start Improve your logic and improve your coding skills</p>
                </div>
                {/* Card 2 */}
                <div className="bg-[#111113] border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center hover:border-zinc-300/50 transition-colors group">
                    <Zap className="text-white mb-6" size={32} />
                    <h3 className="text-zinc-200 font-bold tracking-widest uppercase mb-4 text-sm group-hover:text-white transition-colors">Execution</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">Integrated Judge0 engine for speed.</p>
                </div>
                {/* Card 3 */}
                <div className="bg-[#111113] border border-white/10 rounded-2xl p-8 flex flex-col items-center text-center hover:border-zinc-300/50 transition-colors group">
                    <Users className="text-white mb-6" size={32} />
                    <h3 className="text-zinc-200 font-bold tracking-widest uppercase mb-4 text-sm group-hover:text-white transition-colors">Community</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed mb-6">Join our GDG WhatsApp group where you can interact with us</p>
                    <button className="bg-white hover:bg-zinc-200 text-black font-semibold text-xs px-6 py-2.5 rounded-full transition-all w-full" href='https://chat.whatsapp.com/IDhNDQ4qxgA26mzbxvndIo'>Join Group</button>
                </div>
            </motion.section>

            {/* About CodeNation */}
            <motion.section 
                initial={{ opacity: 0, scale: 0.95 }} 
                whileInView={{ opacity: 1, scale: 1 }} 
                transition={{ duration: 0.8 }} 
                viewport={{ once: true, margin: "-100px" }}
                className="w-full max-w-4xl mx-auto px-6 py-20 z-10 flex flex-col items-start text-left"
            >
                <div className="w-full flex justify-center items-center gap-4 mb-12">
                    <span className="text-zinc-500 font-mono">//</span>
                    <h2 className="text-3xl font-bold text-white tracking-widest text-center">ABOUT CODENATION</h2>
                    <span className="text-zinc-500 font-mono">//</span>
                </div>
                <h4 className="text-zinc-400 font-semibold tracking-[0.2em] text-xs mb-8">AN INITIATIVE BY GOOGLE DEVELOPER GROUPS ON CAMPUS GIETU</h4>
                <p className="text-zinc-300 text-base leading-relaxed mb-10 w-full">
                    This community is dedicated to fostering excellence in Competitive Programming (CP) and Data Structures & Algorithms (DSA) among students at GIETU, building a culture of consistent learning and problem-solving.
                </p>
                <div className="w-full bg-[#111113] border-l-4 border-zinc-500 p-8 rounded-r-xl">
                    <div className="flex items-center gap-2 mb-4">
                        <Target className="text-white" size={18} />
                        <span className="text-zinc-300 font-bold tracking-widest text-sm">MISSION STATEMENT</span>
                    </div>
                    <p className="text-zinc-400 italic leading-relaxed text-sm">
                        "To cultivate a disciplined, collaborative, and growth-focused coding ecosystem within GDG on Campus GIETU, empowering members to develop strong problem-solving foundations and excel in competitive programming."
                    </p>
                </div>
            </motion.section>

            {/* About GDG */}
            <motion.section 
                initial={{ opacity: 0, y: 30 }} 
                whileInView={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.8 }} 
                viewport={{ once: true, margin: "-100px" }}
                className="w-full max-w-4xl mx-auto px-6 py-20 z-10 flex flex-col items-start text-left"
            >
                <div className="w-full flex justify-center items-center gap-4 mb-12">
                    <span className="text-zinc-500 font-mono">//</span>
                    <h2 className="text-3xl font-bold text-white tracking-widest text-center">ABOUT GDG</h2>
                    <span className="text-zinc-500 font-mono">//</span>
                </div>
                <div className="w-full bg-[#111113] border border-white/10 p-6 rounded-xl mb-10 text-center">
                    <p className="text-zinc-300 font-medium tracking-wide">Google Developer Group (GDG) is not just a community — it's a movement.</p>
                </div>
                <div className="w-full space-y-6 text-zinc-300 text-sm leading-relaxed flex flex-col">
                    <p>In rooms filled with glowing screens and restless minds, GDG comes alive where ideas are born, failures are embraced, and innovation takes its first breath. It is where students, developers, and dreamers gather — not to follow trends, but to create what comes next.</p>
                    <p>From late-night debugging sessions to electrifying hackathons, from quiet moments of learning to loud celebrations of breakthroughs — GDG is the place where curiosity turns into code, and code turns into impact. Every meetup is a spark. Every collaboration is a step forward.</p>
                    <p>Here, leadership is forged through action, confidence is built through community, and growth is driven by passion. <span className="text-white font-semibold">GDG empowers individuals to think bigger, build smarter, and lead fearlessly</span> — regardless of where they come from.</p>
                </div>
            </motion.section>

            {/* Footer */}
            <motion.footer 
                initial={{ opacity: 0 }} 
                whileInView={{ opacity: 1 }} 
                transition={{ duration: 1 }} 
                viewport={{ once: true }}
                className="w-full border-t border-white/10 bg-[#09090b] py-10 px-6 z-10 mt-10 relative"
            >
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-8 relative z-10">
                    <div className="flex flex-col items-center md:items-start">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-600 flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                                <span className="text-white font-bold text-xs">&lt;/&gt;</span>
                            </div>
                            <span className="text-white font-bold tracking-wider text-lg">CodeNation</span>
                        </div>
                        <p className="text-zinc-500 text-[10px] tracking-[0.2em] font-semibold uppercase text-center md:text-left">Developed by Google Developer Group of GIET University</p>
                    </div>
                    <div className="flex flex-col items-center md:items-end gap-3">
                        <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold tracking-widest uppercase">
                            <span>Contact Terminal</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-400 text-sm hover:text-white transition-colors cursor-pointer">
                            <Mail size={14} className="text-zinc-400"/> gdg@gietu.edu
                        </div>
                        <div className="flex items-center gap-2 text-zinc-500 text-xs mt-2">
                            <MapPin size={12} className="text-zinc-500" /> Primary Server: GIET University Gunupur
                        </div>
                    </div>
                </div>
            </motion.footer>

        </div>
    );
};

export default HomePage;

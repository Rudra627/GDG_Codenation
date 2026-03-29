import { Link } from 'react-router-dom';
import { 
    BookOpen, Code2, Play, Send, Trophy, Flame, Target, Users, FileText, 
    ArrowRight, CheckCircle2, Monitor, Layers, Zap, ChevronRight, 
    LogIn, UserPlus, Search, Settings, BarChart3, Download, Award
} from 'lucide-react';

const Step = ({ number, title, description, icon: Icon, color = '#ffffff' }) => (
    <div className="flex gap-5 items-start">
        <div className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold" 
             style={{ background: `${color}15`, color, border: `1px solid ${color}30` }}>
            {number}
        </div>
        <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-white mb-1.5 flex items-center gap-2">
                {Icon && <Icon size={16} style={{ color }} />}
                {title}
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">{description}</p>
        </div>
    </div>
);

const FeatureCard = ({ icon: Icon, title, description, color = '#ffffff' }) => (
    <div className="bg-[#111113] border border-white/[0.06] p-6 rounded-2xl hover:border-white/10 transition-all duration-300 card-hover">
        <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: `${color}15` }}>
            <Icon size={20} style={{ color }} />
        </div>
        <h3 className="text-base font-semibold text-white mb-2">{title}</h3>
        <p className="text-zinc-500 text-sm leading-relaxed">{description}</p>
    </div>
);

const DocumentationPage = () => {
    return (
        <div className="flex-grow flex flex-col items-center bg-[#09090B] relative">
            
            {/* Ambient glow */}
            <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-white/[0.03] rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-1/3 left-1/4 w-[400px] h-[400px] bg-[#06B6D4]/[0.03] rounded-full blur-[100px] pointer-events-none" />

            {/* Hero */}
            <section className="w-full max-w-5xl mx-auto px-6 pt-16 pb-12 relative z-10">
                <div className="inline-flex items-center gap-2 bg-[#06B6D4]/[0.08] border border-[#06B6D4]/20 text-[#06B6D4] text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
                    <BookOpen size={14} />
                    <span>Platform Guide</span>
                </div>
                <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-4">
                    Get Started with <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-[#06B6D4]">CodeNation</span>
                </h1>
                <p className="text-lg text-zinc-400 max-w-2xl leading-relaxed mb-8">
                    Everything you need to know about using the platform — from signing up to submitting your first solution and competing in contests.
                </p>
                <div className="flex flex-wrap gap-3">
                    <a href="#getting-started" className="bg-white hover:bg-[#00e085] text-[#09090B] font-bold text-sm px-6 py-2.5 rounded-lg transition-all duration-300 flex items-center gap-2">
                        Quick Start <ArrowRight size={14} />
                    </a>
                    <Link to="/problems" className="border border-white/10 hover:border-white/20 text-white font-medium text-sm px-6 py-2.5 rounded-lg transition-all duration-300 hover:bg-white/[0.03]">
                        Browse Problems
                    </Link>
                </div>
            </section>

            {/* Table of Contents */}
            <section className="w-full max-w-5xl mx-auto px-6 pb-12 relative z-10">
                <div className="bg-[#111113] border border-white/[0.06] rounded-2xl p-6 md:p-8">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Layers size={18} className="text-white" />
                        What's Inside
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                            { label: 'Getting Started', href: '#getting-started' },
                            { label: 'Solving Problems', href: '#solving-problems' },
                            { label: 'Code Editor Guide', href: '#code-editor' },
                            { label: 'Running & Submitting', href: '#run-submit' },
                            { label: 'Contests & Competitions', href: '#contests' },
                            { label: 'Profile & Streaks', href: '#profile' },
                            { label: 'Notes & Resources', href: '#notes' },
                            { label: 'Platform Features', href: '#features' },
                        ].map(item => (
                            <a key={item.href} href={item.href} className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm py-2 px-3 rounded-lg hover:bg-white/[0.02] transition-all">
                                <ChevronRight size={14} className="text-white shrink-0" />
                                {item.label}
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Section 1: Getting Started ─── */}
            <section id="getting-started" className="w-full max-w-5xl mx-auto px-6 py-12 relative z-10">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Getting Started</h2>
                <p className="text-zinc-500 mb-8">Create your account and explore the platform in minutes.</p>
                
                <div className="space-y-8">
                    <Step number={1} title="Create Your Account" icon={UserPlus}
                        description="Click 'Sign up' in the top-right corner. Enter your name, email, and password — or use the Google Sign-In button for instant access. Registration takes less than 10 seconds." />
                    <Step number={2} title="Log In" icon={LogIn}
                        description="After registering, you'll be automatically logged in. Next time, just hit 'Log in' with your email/password or Google account. Your session persists across tabs." />
                    <Step number={3} title="Explore the Dashboard" icon={Monitor}
                        description="Once logged in, the Navbar unlocks: Problems, Contests, Roadmap, Notes, and your Profile. Start by browsing the Problems page to find your first challenge." />
                </div>
            </section>

            {/* ─── Section 2: Solving Problems ─── */}
            <section id="solving-problems" className="w-full max-w-5xl mx-auto px-6 py-12 relative z-10">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Solving Problems</h2>
                <p className="text-zinc-500 mb-8">Find, filter, and solve coding challenges across difficulty levels.</p>
                
                <div className="space-y-8">
                    <Step number={1} title="Browse the Problem List" icon={Search} color="#06B6D4"
                        description="Go to the Problems page. You'll see all available challenges listed with their title, difficulty (Easy / Medium / Hard), and topics. Use the search bar to find specific problems or filter by topic." />
                    <Step number={2} title="Open a Problem" icon={FileText} color="#06B6D4"
                        description="Click on any problem to open the Problem Detail page. The left panel shows the problem statement with title, difficulty badge, topic tags, description, and sample test cases with expected inputs and outputs." />
                    <Step number={3} title="Understand the Layout" icon={Layers} color="#06B6D4"
                        description="The page is split 50/50. Left side: problem description and examples. Right side: code editor on top (50%) and testcase/results panel on bottom (50%). You can drag the dividers to resize." />
                </div>
            </section>

            {/* ─── Section 3: Code Editor ─── */}
            <section id="code-editor" className="w-full max-w-5xl mx-auto px-6 py-12 relative z-10">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Code Editor Guide</h2>
                <p className="text-zinc-500 mb-8">A powerful Monaco-based editor with multi-language support.</p>

                <div className="bg-[#111113] border border-white/[0.06] rounded-2xl p-6 md:p-8 mb-8">
                    <h3 className="text-base font-semibold text-white mb-4">Supported Languages</h3>
                    <div className="flex flex-wrap gap-2">
                        {['Python 3', 'JavaScript', 'Java', 'C', 'C++'].map(lang => (
                            <span key={lang} className="px-3 py-1.5 text-sm rounded-lg bg-white/[0.06] text-white border border-white/20 font-medium">
                                {lang}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="space-y-8">
                    <Step number={1} title="Select Your Language" icon={Code2} color="#8B5CF6"
                        description="Use the dropdown at the top-left of the editor to switch between Python, JavaScript, Java, C, or C++. Each language loads with a starter template so you can begin immediately." />
                    <Step number={2} title="Function Mode" icon={Settings} color="#8B5CF6"
                        description="Some problems support Function Mode — you'll see a green 'ƒ Function Mode' badge. In this mode, you only write the solution function body; the input/output boilerplate is handled automatically. Just implement the logic!" />
                    <Step number={3} title="Editor Features" icon={Monitor} color="#8B5CF6"
                        description="The editor supports syntax highlighting, bracket pair colorization, ligatures (JetBrains Mono font), auto-indentation, and a tab size of 4 spaces. Use the reset button (↺) to restore the starter code, or the fullscreen button (⛶) to focus on coding." />
                </div>
            </section>

            {/* ─── Section 4: Running & Submitting ─── */}
            <section id="run-submit" className="w-full max-w-5xl mx-auto px-6 py-12 relative z-10">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Running & Submitting Code</h2>
                <p className="text-zinc-500 mb-8">Test your solution and submit for a final verdict.</p>

                <div className="bg-[#111113] border border-white/[0.06] rounded-2xl p-6 md:p-8 space-y-6 mb-8">
                    <div className="flex items-start gap-4">
                        <div className="shrink-0 w-20 h-10 rounded-lg bg-zinc-800 flex items-center justify-center gap-1.5 text-xs font-semibold text-white">
                            <Play size={12} fill="white" /> Run
                        </div>
                        <div>
                            <h3 className="text-white font-semibold text-sm mb-1">Run (Test)</h3>
                            <p className="text-zinc-500 text-sm">Runs your code against the visible sample test cases only. Use this to debug and verify your approach before submission. You can also test with custom input by clicking the "+" tab in the Testcase panel.</p>
                        </div>
                    </div>
                    <div className="border-t border-white/[0.04]" />
                    <div className="flex items-start gap-4">
                        <div className="shrink-0 w-20 h-10 rounded-lg bg-white flex items-center justify-center gap-1.5 text-xs font-semibold text-[#09090B]">
                            <Send size={12} /> Submit
                        </div>
                        <div>
                            <h3 className="text-white font-semibold text-sm mb-1">Submit (Final)</h3>
                            <p className="text-zinc-500 text-sm">Runs your code against ALL test cases, including hidden edge cases. Your submission is saved and graded. If all tests pass, you get "Accepted" and the problem is marked as solved on your profile.</p>
                        </div>
                    </div>
                </div>

                <div className="bg-[#111113] border border-white/[0.06] rounded-2xl p-6 md:p-8">
                    <h3 className="text-base font-semibold text-white mb-4">Verdict Types</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {[
                            { status: 'Accepted', desc: 'All test cases passed', color: '#22c55e' },
                            { status: 'Wrong Answer', desc: "Output doesn't match expected", color: '#f87171' },
                            { status: 'Runtime Error', desc: 'Code crashed during execution', color: '#fb923c' },
                            { status: 'Time Limit Exceeded', desc: 'Code took longer than 5 seconds', color: '#facc15' },
                            { status: 'Compile Error', desc: 'Code has syntax errors', color: '#fb923c' },
                            { status: 'System Error', desc: 'Server-side issue, try again', color: '#94a3b8' },
                        ].map(v => (
                            <div key={v.status} className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: v.color }} />
                                <div>
                                    <span className="text-sm font-semibold" style={{ color: v.color }}>{v.status}</span>
                                    <p className="text-zinc-600 text-xs">{v.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ─── Section 5: Contests ─── */}
            <section id="contests" className="w-full max-w-5xl mx-auto px-6 py-12 relative z-10">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Contests & Competitions</h2>
                <p className="text-zinc-500 mb-8">Compete with others in timed coding challenges.</p>

                <div className="space-y-8">
                    <Step number={1} title="Browse Contests" icon={Trophy} color="#facc15"
                        description="Go to the Contests page to see all upcoming, active, and past contests. Each card shows the contest name, start time, duration, and current status." />
                    <Step number={2} title="Join a Contest" icon={Award} color="#facc15"
                        description="Click on an active or upcoming contest to view its details and problem set. During the contest window, solve as many problems as possible. Each problem submission is timed and scored." />
                    <Step number={3} title="View Results" icon={BarChart3} color="#facc15"
                        description="After the contest ends, check the leaderboard to see your rank, total score, and how you compared against other participants." />
                </div>
            </section>

            {/* ─── Section 6: Profile & Streaks ─── */}
            <section id="profile" className="w-full max-w-5xl mx-auto px-6 py-12 relative z-10">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Profile & Streaks</h2>
                <p className="text-zinc-500 mb-8">Track your progress and maintain consistency.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <FeatureCard icon={Flame} title="Coding Streaks" color="#fb923c"
                        description="Every day you solve at least one problem, your streak counter increases. The activity grid on your profile shows your consistency over the past year — just like GitHub's contribution graph." />
                    <FeatureCard icon={BarChart3} title="Statistics Dashboard" color="#06B6D4"
                        description="Your profile shows total problems solved, acceptance rate, submissions count, and difficulty breakdown. Track which topics you've mastered and where you need more practice." />
                    <FeatureCard icon={CheckCircle2} title="Problem History" color="#22c55e"
                        description="All your solved problems are logged. Revisit any previous submission to review your approach, see the verdict, and check which test cases you passed or failed." />
                    <FeatureCard icon={Settings} title="Edit Your Profile" color="#8B5CF6"
                        description="Click the edit button on your profile to update your name, bio, or profile picture. Your profile is visible to other users and admins." />
                </div>
            </section>

            {/* ─── Section 7: Notes ─── */}
            <section id="notes" className="w-full max-w-5xl mx-auto px-6 py-12 relative z-10">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Notes & Resources</h2>
                <p className="text-zinc-500 mb-8">Access curated study materials shared by the community.</p>

                <div className="space-y-8">
                    <Step number={1} title="Browse Notes" icon={BookOpen} color="#ffffff"
                        description="The Notes page shows all study materials organized by topic — Arrays, DP, Graphs, and more. Each note card shows the title, topic tag, and an optional description." />
                    <Step number={2} title="Download Files" icon={Download} color="#ffffff"
                        description="Many notes come with downloadable PDF files. Click 'Download' to save the material for offline study. Files are uploaded by admins and community contributors." />
                    <Step number={3} title="Search & Filter" icon={Search} color="#ffffff"
                        description="Use the search bar to find specific notes by title, or filter by topic to narrow down the list. Great for revision before contests or interviews." />
                </div>
            </section>

            {/* ─── Section 8: All Features ─── */}
            <section id="features" className="w-full max-w-5xl mx-auto px-6 py-12 relative z-10 mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Platform Features at a Glance</h2>
                <p className="text-zinc-500 mb-8">A quick overview of everything CodeNation offers.</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <FeatureCard icon={Code2} title="Monaco Code Editor" description="Industry-standard editor with syntax highlighting, auto-completion, and multi-language support." />
                    <FeatureCard icon={Zap} title="Judge0 Execution" color="#06B6D4" description="Cloud-native code execution engine that compiles and runs your code in real-time." />
                    <FeatureCard icon={Trophy} title="Live Contests" color="#facc15" description="Timed competitions with leaderboards and scoring to test your skills under pressure." />
                    <FeatureCard icon={Flame} title="Daily Challenges" color="#fb923c" description="A new problem every day to keep you sharp and maintain your coding streak." />
                    <FeatureCard icon={Target} title="Learning Roadmap" color="#8B5CF6" description="Structured path from basics to advanced topics to guide your learning journey." />
                    <FeatureCard icon={Users} title="Community" color="#06B6D4" description="Connect with fellow coders through our WhatsApp group and collaborative features." />
                    <FeatureCard icon={BookOpen} title="Study Notes" description="Curated PDFs and resources organized by topic for systematic preparation." />
                    <FeatureCard icon={BarChart3} title="Progress Tracking" color="#8B5CF6" description="Activity grids, streak counters, and stats to visualize your growth over time." />
                    <FeatureCard icon={Monitor} title="Responsive Design" color="#fb923c" description="Works on desktop, tablet, and mobile. Code on the go with our adaptive layout." />
                </div>
            </section>

            {/* CTA */}
            <section className="w-full max-w-5xl mx-auto px-6 pb-16 relative z-10">
                <div className="bg-[#111113] border border-white/[0.06] rounded-2xl p-8 md:p-12 text-center relative overflow-hidden">
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-white/[0.04] rounded-full blur-[80px] pointer-events-none" />
                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 relative z-10">Ready to Start Coding?</h2>
                    <p className="text-zinc-500 mb-6 relative z-10">Jump into the problems list and solve your first challenge today.</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center relative z-10">
                        <Link to="/problems" className="bg-white hover:bg-[#00e085] text-[#09090B] font-bold text-sm px-8 py-3 rounded-lg shadow-[0_0_24px_rgba(255,255,255,0.2)] hover:shadow-[0_0_32px_rgba(255,255,255,0.3)] transition-all duration-300 flex items-center justify-center gap-2">
                            Start Solving <ArrowRight size={16} />
                        </Link>
                        <Link to="/contests" className="border border-white/10 hover:border-white/20 text-white font-medium text-sm px-8 py-3 rounded-lg transition-all duration-300 hover:bg-white/[0.03]">
                            View Contests
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default DocumentationPage;

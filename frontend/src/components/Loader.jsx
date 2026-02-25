import { useEffect, useState } from 'react';

const Loader = ({ onComplete }) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => onComplete(), 400); 
                }
                return prev + Math.floor(Math.random() * 8) + 2; 
            });
        }, 80); 

        return () => clearInterval(interval);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black font-mono overflow-hidden">
            <div className="w-full max-w-xl text-[#07fc03] px-8 tracking-widest text-lg flex flex-col items-center">
                <div className="mb-4">
                    Loading {progress}%
                </div>
                <div className="w-full h-1 bg-black border border-[#07fc03]/30 glow">
                    <div 
                        className="h-full bg-[#07fc03] transition-all duration-75 ease-linear shadow-[0_0_10px_#07fc03]"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>
        </div>
    );
};

export default Loader;

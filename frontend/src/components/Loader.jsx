import { useEffect, useState } from 'react';

const Loader = ({ onComplete }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setVisible(false);
            if (onComplete) {
                setTimeout(() => onComplete(), 300);
            }
        }, 1200);

        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-[#09090B] transition-opacity duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}>
            <div className="relative w-12 h-12">
                <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
                <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#ffffff] animate-spin" />
            </div>
        </div>
    );
};

export default Loader;

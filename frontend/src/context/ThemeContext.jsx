import { createContext, useState, useEffect, useContext } from 'react';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('codenation-theme');
        return saved || 'dark';
    });

    useEffect(() => {
        localStorage.setItem('codenation-theme', theme);
        const root = document.documentElement;
        if (theme === 'light') {
            root.classList.add('light-mode');
            root.classList.remove('dark-mode');
        } else {
            root.classList.add('dark-mode');
            root.classList.remove('light-mode');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => useContext(ThemeContext);

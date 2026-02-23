import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

/** Reads the correct initial theme:
 *  1. localStorage preference
 *  2. OS/system preference
 *  3. Default → light
 */
const getInitialTheme = () => {
    try {
        const stored = localStorage.getItem('theme');
        if (stored === 'dark' || stored === 'light') return stored;
    } catch (_) { /* localStorage blocked */ }

    if (window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(getInitialTheme);

    // Apply/remove 'dark' class on <html> whenever theme changes
    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
        try {
            localStorage.setItem('theme', theme);
        } catch (_) { /* localStorage blocked */ }
    }, [theme]);

    const toggleTheme = () =>
        setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, isDark: theme === 'dark' }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const ctx = useContext(ThemeContext);
    if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
    return ctx;
};

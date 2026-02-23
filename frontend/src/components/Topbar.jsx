import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Search, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import NotificationBell from './NotificationBell';
import ProfileDropdown from './ProfileDropdown';

const pageTitles = {
    '/': 'Dashboard',
    '/students': 'Student Directory',
    '/menu': 'Menu Planner',
    '/grocery': 'Grocery Calculator',
    '/expenses': 'Expense Tracker',
    '/suppliers': 'Supplier Management',
    '/complaints': 'Complaints & Suggestions',
    '/settings': 'Account Settings',
};

/** Live clock hook — updates every minute */
const useClock = () => {
    const [now, setNow] = useState(new Date());
    useEffect(() => {
        const id = setInterval(() => setNow(new Date()), 60_000);
        return () => clearInterval(id);
    }, []);
    return now;
};

const Topbar = () => {
    const location = useLocation();
    const { isDark, toggleTheme } = useTheme();
    const now = useClock();

    const title = pageTitles[location.pathname] || 'Dashboard';
    const timeStr = now.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const dateStr = now.toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <header className="glass sticky top-0 z-30 px-6 py-3.5">
            <div className="flex items-center justify-between gap-4">

                {/* Left — page title + live date */}
                <div className="min-w-0">
                    <h1 className="text-lg font-bold text-base leading-tight truncate">
                        {title}
                    </h1>
                    <p className="text-xs text-muted">
                        {dateStr} · {timeStr}
                    </p>
                </div>

                {/* Right — actions row */}
                <div className="flex items-center gap-1.5 flex-shrink-0">

                    {/* Search */}
                    <div className="hidden md:flex items-center gap-2 bg-muted rounded-xl px-3 py-2 w-52 border border-transparent focus-within:border-indigo-300 focus-within:bg-card transition-all group">
                        <Search size={14} className="text-muted flex-shrink-0 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            placeholder="Search anything..."
                            className="bg-transparent outline-none w-full text-base placeholder:text-muted text-sm"
                        />
                    </div>

                    {/* Dark mode toggle */}
                    <button
                        onClick={toggleTheme}
                        title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                        className={`p-2 rounded-xl transition-all duration-200 ${isDark
                            ? 'bg-indigo-100 text-indigo-600 hover:bg-indigo-200'
                            : 'text-sub hover:bg-muted hover:text-base'
                            }`}
                    >
                        <span className={`block transition-transform duration-300 ${isDark ? 'rotate-180' : 'rotate-0'}`}>
                            {isDark ? <Sun size={18} /> : <Moon size={18} />}
                        </span>
                    </button>

                    {/* Notification bell (self-contained with dropdown) */}
                    <NotificationBell />

                    {/* Profile / account dropdown (self-contained) */}
                    <ProfileDropdown />
                </div>
            </div>
        </header>
    );
};

export default Topbar;

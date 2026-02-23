import { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronDown, Settings, LogOut, User, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ProfileDropdown = () => {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const { admin, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    // Close when the route changes (e.g. after navigate to /settings)
    useEffect(() => {
        setOpen(false);
    }, [location.pathname]);

    // Close on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                setOpen(false);
            }
        };
        if (open) document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [open]);

    // Close on Escape
    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') setOpen(false); };
        if (open) document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [open]);

    const handleSignOut = () => {
        setOpen(false);
        logout(); // clears localStorage + resets auth state
        navigate('/login', { replace: true });
    };

    const handleSettings = () => {
        setOpen(false);
        navigate('/settings');
    };

    const initials = admin?.name
        ? admin.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
        : 'A';

    return (
        <div ref={ref} className="relative">
            {/* Trigger button */}
            <button
                onClick={() => setOpen(o => !o)}
                aria-label="Account menu"
                aria-expanded={open}
                aria-haspopup="true"
                className={`flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl transition-all duration-200 ${open ? 'bg-muted' : 'hover:bg-muted'
                    }`}
            >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-md">
                    {initials}
                </div>
                {/* Name + role (hidden on mobile) */}
                <div className="hidden md:block text-left">
                    <p className="text-sm font-semibold text-base leading-tight">{admin?.name || 'Admin'}</p>
                    <p className="text-xs text-muted leading-tight">Administrator</p>
                </div>
                {/* Chevron */}
                <ChevronDown
                    size={14}
                    className={`text-muted hidden md:block transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
                />
            </button>

            {/* Dropdown */}
            <div
                className={`absolute right-0 top-full mt-2 w-60 bg-card rounded-2xl shadow-2xl border border-base z-50 overflow-hidden
                    transition-all duration-200 origin-top-right
                    ${open ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}
            >
                {/* User info header */}
                <div className="px-4 py-3.5 border-b border-base bg-subtle">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                            {initials}
                        </div>
                        <div className="min-w-0">
                            <p className="font-bold text-base text-sm leading-tight truncate">
                                {admin?.name || 'Admin'}
                            </p>
                            <p className="text-xs text-sub truncate">{admin?.email || ''}</p>
                        </div>
                    </div>
                    <div className="mt-2 flex items-center gap-1.5">
                        <Shield size={11} className="text-emerald-500" />
                        <span className="text-xs text-emerald-600 font-semibold">Administrator</span>
                    </div>
                </div>

                {/* Menu items */}
                <div className="py-1.5">
                    <button
                        onClick={handleSettings}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-base hover:bg-subtle hover:text-indigo-600 transition-colors group"
                    >
                        <div className="p-1.5 rounded-lg bg-muted group-hover:bg-indigo-100 transition-colors">
                            <Settings size={13} className="group-hover:text-indigo-600 transition-colors" />
                        </div>
                        <span className="font-medium">Account Settings</span>
                    </button>

                    <button
                        onClick={handleSettings}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-base hover:bg-subtle transition-colors group"
                    >
                        <div className="p-1.5 rounded-lg bg-muted group-hover:bg-muted transition-colors">
                            <User size={13} />
                        </div>
                        <span className="font-medium">Edit Profile</span>
                    </button>
                </div>

                {/* Divider + Sign out */}
                <div className="border-t border-base py-1.5">
                    <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors group"
                    >
                        <div className="p-1.5 rounded-lg bg-red-50 group-hover:bg-red-100 transition-colors">
                            <LogOut size={13} className="text-red-500" />
                        </div>
                        <span className="font-semibold">Sign Out</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProfileDropdown;

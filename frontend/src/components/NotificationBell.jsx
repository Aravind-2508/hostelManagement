import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Bell, X, Check, Info, AlertTriangle, MessageSquareWarning, Lightbulb } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const typeConfig = {
    complaint: { icon: MessageSquareWarning, bg: 'bg-red-50', iconColor: 'text-red-500', dot: 'bg-red-500' },
    suggestion: { icon: Lightbulb, bg: 'bg-amber-50', iconColor: 'text-amber-500', dot: 'bg-amber-500' },
    warning: { icon: AlertTriangle, bg: 'bg-orange-50', iconColor: 'text-orange-500', dot: 'bg-orange-500' },
    info: { icon: Info, bg: 'bg-blue-50', iconColor: 'text-blue-500', dot: 'bg-blue-500' },
    success: { icon: Check, bg: 'bg-green-50', iconColor: 'text-green-500', dot: 'bg-green-500' },
};

const timeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m} min ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h} hr ago`;
    return `${Math.floor(h / 24)}d ago`;
};

const NotificationBell = () => {
    const [open, setOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const ref = useRef(null);
    const { admin } = useAuth();
    const navigate = useNavigate();

    const cfg = { headers: { Authorization: `Bearer ${admin?.token}` } };

    const fetchNotifs = useCallback(async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/admin-notifications', cfg);
            setNotifications(data);
        } catch (e) {
            console.error('Failed to fetch admin notifications', e);
        }
    }, [admin?.token]);

    // Initial load + poll every 30 seconds
    useEffect(() => {
        fetchNotifs();
        const interval = setInterval(fetchNotifs, 30000);
        return () => clearInterval(interval);
    }, [fetchNotifs]);

    // Also refresh when dropdown opens
    useEffect(() => {
        if (open) fetchNotifs();
    }, [open]);

    // Close on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
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

    const unreadCount = notifications.filter(n => !n.read).length;

    const markAllRead = async () => {
        try {
            await axios.patch('http://localhost:5000/api/admin-notifications/mark-all-read', {}, cfg);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (e) { console.error(e); }
    };

    const markRead = async (id) => {
        try {
            await axios.patch(`http://localhost:5000/api/admin-notifications/${id}/read`, {}, cfg);
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, read: true } : n));
        } catch (e) { console.error(e); }
    };

    const dismiss = async (id, e) => {
        e.stopPropagation();
        try {
            await axios.delete(`http://localhost:5000/api/admin-notifications/${id}`, cfg);
            setNotifications(prev => prev.filter(n => n._id !== id));
        } catch (e) { console.error(e); }
    };

    const handleNotifClick = async (notif) => {
        if (!notif.read) await markRead(notif._id);
        // Navigate to complaints page for complaint/suggestion types
        if (notif.type === 'complaint' || notif.type === 'suggestion') {
            setOpen(false);
            navigate('/complaints');
        }
    };

    return (
        <div ref={ref} className="relative">
            {/* Bell trigger */}
            <button
                onClick={() => setOpen(o => !o)}
                aria-label="Notifications"
                aria-expanded={open}
                className={`relative p-2 rounded-xl transition-all duration-200 ${open
                    ? 'bg-indigo-50 text-indigo-600'
                    : 'text-sub hover:bg-muted hover:text-base'
                    }`}
            >
                <Bell size={18} className={`transition-transform duration-200 ${open ? 'scale-110' : ''}`} />
                {unreadCount > 0 && (
                    <span className="notification-dot" />
                )}
            </button>

            {/* Dropdown panel */}
            <div
                className={`absolute right-0 top-full mt-2 w-80 bg-card rounded-2xl shadow-2xl border border-base z-50 overflow-hidden
                    transition-all duration-200 origin-top-right
                    ${open ? 'opacity-100 scale-100 translate-y-0 pointer-events-auto' : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'}`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-base bg-subtle">
                    <div className="flex items-center gap-2">
                        <Bell size={15} className="text-sub" />
                        <p className="font-semibold text-base text-sm">Notifications</p>
                        {unreadCount > 0 && (
                            <span className="bg-indigo-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full leading-none">
                                {unreadCount}
                            </span>
                        )}
                    </div>
                    {unreadCount > 0 && (
                        <button
                            onClick={markAllRead}
                            className="text-xs text-indigo-600 font-semibold hover:text-indigo-800 transition"
                        >
                            Mark all read
                        </button>
                    )}
                </div>

                {/* Notification list */}
                <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="py-10 text-center text-sm text-muted">
                            <Bell size={24} className="mx-auto mb-2 opacity-30" />
                            You're all caught up!
                        </div>
                    ) : notifications.map(notif => {
                        const tc = typeConfig[notif.type] || typeConfig.info;
                        const Icon = tc.icon;
                        return (
                            <div
                                key={notif._id}
                                onClick={() => handleNotifClick(notif)}
                                className={`flex items-start gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-subtle ${!notif.read ? 'bg-indigo-50/40' : ''}`}
                            >
                                <div className={`p-1.5 rounded-lg ${tc.bg} flex-shrink-0 mt-0.5`}>
                                    <Icon size={13} className={tc.iconColor} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <p className="text-sm font-semibold text-base leading-tight truncate">
                                            {notif.title}
                                        </p>
                                        {!notif.read && (
                                            <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${tc.dot}`} />
                                        )}
                                    </div>
                                    <p className="text-xs text-sub mt-0.5 leading-relaxed line-clamp-2">{notif.body}</p>
                                    <p className="text-xs text-muted mt-1">{timeAgo(notif.createdAt)}</p>
                                </div>
                                <button
                                    onClick={(e) => dismiss(notif._id, e)}
                                    className="text-muted hover:text-sub transition flex-shrink-0 mt-0.5"
                                    aria-label="Dismiss"
                                >
                                    <X size={13} />
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                    <div className="border-t border-base px-4 py-2.5">
                        <button
                            onClick={() => { setOpen(false); navigate('/complaints'); }}
                            className="w-full text-center text-xs text-indigo-600 font-semibold hover:text-indigo-800 transition"
                        >
                            View all complaints →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default NotificationBell;

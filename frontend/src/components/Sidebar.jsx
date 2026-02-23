import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Users, Utensils, ShoppingCart,
    Wallet, Truck, LogOut, ChevronLeft, ChevronRight,
    Sparkles, MessageSquareWarning
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const navGroups = [
    {
        label: 'Overview',
        items: [
            { title: 'Dashboard', path: '/', icon: LayoutDashboard },
        ]
    },
    {
        label: 'Management',
        items: [
            { title: 'Students', path: '/students', icon: Users },
            { title: 'Menu Planner', path: '/menu', icon: Utensils },
            { title: 'Grocery Stock', path: '/grocery', icon: ShoppingCart },
        ]
    },
    {
        label: 'Finance',
        items: [
            { title: 'Expenses', path: '/expenses', icon: Wallet },
            { title: 'Suppliers', path: '/suppliers', icon: Truck },
        ]
    },
    {
        label: 'Feedback',
        items: [
            { title: 'Complaints', path: '/complaints', icon: MessageSquareWarning },
        ]
    },
];

const Sidebar = () => {
    const location = useLocation();
    const { logout, admin } = useAuth();
    const [collapsed, setCollapsed] = useState(false);

    const isActive = (path) => path === '/'
        ? location.pathname === '/'
        : location.pathname.startsWith(path);

    return (
        <>
            {/* Sidebar */}
            <aside
                className={`sidebar-transition fixed left-0 top-0 h-screen bg-slate-950 flex flex-col z-40 border-r border-slate-800/50 ${collapsed ? 'w-[70px]' : 'w-64'}`}
            >
                {/* Logo */}
                <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-800/50 ${collapsed ? 'justify-center' : ''}`}>
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/30">
                        <Sparkles size={16} className="text-white" />
                    </div>
                    {!collapsed && (
                        <div className="animate-fadeIn">
                            <p className="text-white font-bold text-sm leading-tight">Hostel Food</p>
                            <p className="text-indigo-400 text-xs font-medium">Pro Dashboard</p>
                        </div>
                    )}
                </div>

                {/* Collapse toggle */}
                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="absolute -right-3 top-16 w-6 h-6 bg-slate-800 border border-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-indigo-600 hover:border-indigo-600 transition-all z-10 shadow-md"
                >
                    {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
                </button>

                {/* Navigation */}
                <nav className="flex-1 py-4 overflow-y-auto overflow-x-hidden">
                    {navGroups.map((group) => (
                        <div key={group.label} className="mb-2">
                            {!collapsed && (
                                <p className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                                    {group.label}
                                </p>
                            )}
                            {group.items.map((item) => {
                                const active = isActive(item.path);
                                return (
                                    <Link
                                        key={item.title}
                                        to={item.path}
                                        title={collapsed ? item.title : ''}
                                        className={`flex items-center gap-3 mx-2 px-3 py-2.5 rounded-xl mb-0.5 transition-all duration-150 group relative
                                            ${active
                                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25'
                                                : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                            }
                                            ${collapsed ? 'justify-center' : ''}`}
                                    >
                                        {active && (
                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-white rounded-r-full" />
                                        )}
                                        <item.icon size={18} className="flex-shrink-0" />
                                        {!collapsed && (
                                            <span className="text-sm font-medium">{item.title}</span>
                                        )}
                                        {collapsed && (
                                            <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap shadow-xl border border-slate-700 z-50">
                                                {item.title}
                                            </div>
                                        )}
                                    </Link>
                                );
                            })}
                        </div>
                    ))}
                </nav>

                {/* User + logout */}
                <div className="border-t border-slate-800/50 p-3">
                    {!collapsed && (
                        <div className="flex items-center gap-3 px-2 py-2 rounded-xl mb-1 animate-fadeIn">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                {admin?.name?.[0]?.toUpperCase() || 'A'}
                            </div>
                            <div className="min-w-0">
                                <p className="text-white text-sm font-semibold truncate">{admin?.name || 'Admin'}</p>
                                <p className="text-slate-500 text-xs truncate">{admin?.email || ''}</p>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={logout}
                        title={collapsed ? 'Logout' : ''}
                        className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all group ${collapsed ? 'justify-center' : ''}`}
                    >
                        <LogOut size={18} className="flex-shrink-0" />
                        {!collapsed && <span className="text-sm font-medium">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Spacer */}
            <div className={`sidebar-transition flex-shrink-0 ${collapsed ? 'w-[70px]' : 'w-64'}`} />
        </>
    );
};

export default Sidebar;

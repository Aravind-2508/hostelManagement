import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    Users, Utensils, ShoppingCart, Wallet,
    TrendingUp, ArrowRight, AlertTriangle, Package,
    ChefHat, Zap, Activity
} from 'lucide-react';
import { StatCard, Card, Badge, SectionHeading } from '../components/ui/Components';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const monthlyData = [
    { month: 'Sep', expenses: 42000 },
    { month: 'Oct', expenses: 58000 },
    { month: 'Nov', expenses: 51000 },
    { month: 'Dec', expenses: 67000 },
    { month: 'Jan', expenses: 53000 },
    { month: 'Feb', expenses: 71000 },
];

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

const alerts = [
    { item: 'Rice Stock', detail: 'Below 20 kg threshold', priority: 'high' },
    { item: 'Cooking Oil', detail: 'Below 10 litre threshold', priority: 'medium' },
    { item: 'Lentils (Dal)', detail: 'Running low — 3 days left', priority: 'low' },
];

const priorityConfig = {
    high: { dot: 'bg-red-500', badge: 'inactive', label: 'Critical' },
    medium: { dot: 'bg-amber-500', badge: 'warning', label: 'Warning' },
    low: { dot: 'bg-blue-500', badge: 'info', label: 'Low' },
};

const recentActivity = [
    { action: 'New student added', name: 'Ravi Kumar', time: '2 min ago', icon: Users, color: 'bg-indigo-100 text-indigo-600' },
    { action: 'Menu updated for', name: 'Wednesday Dinner', time: '38 min ago', icon: ChefHat, color: 'bg-emerald-100 text-emerald-600' },
    { action: 'Expense logged', name: '₹12,500 – Grocery', time: '1 hr ago', icon: Wallet, color: 'bg-amber-100 text-amber-600' },
    { action: 'Supplier added', name: 'Metro Groceries', time: '3 hr ago', icon: Package, color: 'bg-violet-100 text-violet-600' },
];

const Dashboard = () => {
    const { admin } = useAuth();
    const [stats, setStats] = useState({ students: 0, groceries: 0, totalExpenses: 0, activeStudents: 0 });
    const [categoryData, setCategoryData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const config = { headers: { Authorization: `Bearer ${admin.token}` } };
                const [resStudents, resGroceries, resExpenses] = await Promise.all([
                    axios.get('http://localhost:5000/api/students', config),
                    axios.get('http://localhost:5000/api/grocery', config),
                    axios.get('http://localhost:5000/api/expenses', config)
                ]);
                const totalSpent = resExpenses.data.reduce((acc, exp) => acc + exp.amount, 0);
                const activeStudents = resStudents.data.filter(s => s.status === 'Active').length;
                const catMap = {};
                resExpenses.data.forEach(exp => {
                    catMap[exp.category] = (catMap[exp.category] || 0) + exp.amount;
                });
                setCategoryData(Object.keys(catMap).map(k => ({ name: k, value: catMap[k] })));
                setStats({ students: resStudents.data.length, groceries: resGroceries.data.length, totalExpenses: totalSpent, activeStudents });
            } catch (error) {
                console.error('Error fetching stats', error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, [admin]);

    return (
        <div className="space-y-8">

            {/* ── Welcome banner ── */}
            <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-700 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl shadow-indigo-200/40">
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute -top-10 -right-10 w-64 h-64 rounded-full bg-white" />
                    <div className="absolute -bottom-16 -left-8 w-48 h-48 rounded-full bg-white" />
                </div>
                <div className="relative flex items-center justify-between flex-wrap gap-4">
                    <div>
                        <p className="text-indigo-200 text-sm font-medium">Good Morning 👋</p>
                        <h2 className="text-2xl font-bold mt-1">{admin?.name || 'Admin'}</h2>
                        <p className="text-indigo-200 text-sm mt-1">Here's what's happening at your hostel today.</p>
                    </div>
                    <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-3 border border-white/20">
                        <Activity size={18} className="text-indigo-200" />
                        <div>
                            <p className="text-xs text-indigo-200">System Status</p>
                            <p className="text-sm font-bold">All Systems Normal</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── KPI Cards ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 stagger-children">
                <StatCard icon={Users} title="Total Students" value={loading ? '—' : stats.students} trend={5} trendLabel={`${stats.activeStudents} active`} gradient="bg-gradient-to-br from-indigo-500 to-indigo-600" delay={0} />
                <StatCard icon={Utensils} title="Daily Menu Items" value="12" trend={2} trendLabel="3 meals planned today" gradient="bg-gradient-to-br from-emerald-500 to-teal-600" delay={60} />
                <StatCard icon={ShoppingCart} title="Stock Alerts" value={`${alerts.length} Items`} trend={-8} trendLabel="Needs restocking" gradient="bg-gradient-to-br from-amber-500 to-orange-500" delay={120} />
                <StatCard icon={Wallet} title="Monthly Expenses" value={loading ? '—' : `₹${stats.totalExpenses.toLocaleString()}`} trend={12} trendLabel="vs last month" gradient="bg-gradient-to-br from-violet-500 to-purple-600" delay={180} />
            </div>

            {/* ── Charts row ── */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Area chart */}
                <Card className="xl:col-span-2">
                    <SectionHeading icon={TrendingUp} title="Monthly Expense Trend" />
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthlyData}>
                                <defs>
                                    <linearGradient id="expGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                                <XAxis dataKey="month" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                                <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, 'Expenses']} contentStyle={{ borderRadius: 12, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }} />
                                <Area type="monotone" dataKey="expenses" stroke="#6366f1" strokeWidth={2.5} fill="url(#expGrad)" dot={{ fill: '#6366f1', r: 4 }} activeDot={{ r: 6 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </Card>

                {/* Pie chart */}
                <Card>
                    <SectionHeading icon={Zap} title="Expense by Category" />
                    {categoryData.length === 0 ? (
                        <div className="h-56 flex items-center justify-center text-muted text-sm">No expense data yet</div>
                    ) : (
                        <div className="h-56">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={categoryData} innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                                        {categoryData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, '']} contentStyle={{ borderRadius: 12, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center">
                                {categoryData.map((d, i) => (
                                    <div key={d.name} className="flex items-center gap-1.5 text-xs text-sub">
                                        <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                                        {d.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>
            </div>

            {/* ── Bottom row ── */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Today's Meal */}
                <Card>
                    <SectionHeading icon={ChefHat} title="Today's Special Meal" />
                    <div className="space-y-3">
                        {['Breakfast', 'Lunch', 'Dinner'].map((meal, i) => {
                            const menus = {
                                Breakfast: 'Idli, Sambar, Coconut Chutney, Tea',
                                Lunch: 'Rice, Dal Tadka, Paneer Butter Masala, Roti',
                                Dinner: 'Chapati, Mixed Veg Curry, Curd Rice'
                            };
                            const times = { Breakfast: '7:30 AM', Lunch: '12:30 PM', Dinner: '7:30 PM' };
                            const gradients = ['from-amber-50 to-orange-50 border-amber-100', 'from-emerald-50 to-teal-50 border-emerald-100', 'from-indigo-50 to-violet-50 border-indigo-100'];
                            const textColors = ['text-amber-700', 'text-emerald-700', 'text-indigo-700'];
                            return (
                                <div key={meal} className={`p-4 rounded-xl bg-gradient-to-r ${gradients[i]} border`}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`text-xs font-bold uppercase tracking-wide ${textColors[i]}`}>{meal}</span>
                                        <span className="text-xs text-slate-400">{times[meal]}</span>
                                    </div>
                                    <p className="text-sm font-semibold text-slate-800">{menus[meal]}</p>
                                </div>
                            );
                        })}
                    </div>
                </Card>

                {/* Grocery Alerts */}
                <Card>
                    <SectionHeading icon={AlertTriangle} title="Grocery Alerts" action={<Badge variant="warning">{alerts.length} Active</Badge>} />
                    <div className="space-y-3">
                        {alerts.map((alert, i) => {
                            const cfg = priorityConfig[alert.priority];
                            return (
                                <div key={i} className="flex items-center justify-between p-4 bg-subtle rounded-xl border border-base hover:bg-card hover:shadow-sm transition-all group">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-2.5 h-2.5 rounded-full ${cfg.dot} flex-shrink-0`} />
                                        <div>
                                            <p className="text-sm font-semibold text-base">{alert.item}</p>
                                            <p className="text-xs text-muted">{alert.detail}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={cfg.badge}>{cfg.label}</Badge>
                                        <button className="opacity-0 group-hover:opacity-100 transition text-indigo-600">
                                            <ArrowRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Card>
            </div>

            {/* ── Recent Activity ── */}
            <Card>
                <SectionHeading icon={Activity} title="Recent Activity" />
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                    {recentActivity.map((item, i) => (
                        <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-subtle border border-base hover:bg-card hover:shadow-sm transition-all">
                            <div className={`p-2 rounded-xl ${item.color} flex-shrink-0`}>
                                <item.icon size={16} />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-sub">{item.action}</p>
                                <p className="text-sm font-semibold text-base truncate">{item.name}</p>
                                <p className="text-xs text-muted mt-0.5">{item.time}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </Card>
        </div>
    );
};

export default Dashboard;

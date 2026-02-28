import API_URL from '../config/api';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Plus, Wallet, TrendingUp, Download, Filter, IndianRupee } from 'lucide-react';
import { Card, Badge, Button, Modal, Input, Select, Textarea, PageHeader, SectionHeading, EmptyState } from '../components/ui/Components';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
const categories = ['Grocery', 'Maintenance', 'Electricity', 'Water', 'Other'];

const categoryBadge = {
    Grocery: 'primary',
    Maintenance: 'warning',
    Electricity: 'info',
    Water: 'active',
    Other: 'default',
};

const ExpenseTracker = () => {
    const [expenses, setExpenses] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [filterCategory, setFilterCategory] = useState('All');
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({ title: '', amount: '', category: 'Grocery', description: '' });
    const { admin } = useAuth();
    const { toast } = useToast();

    const fetchExpenses = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${admin.token}` } };
            const { data } = await axios.get(`${API_URL}/api/expenses`, config);
            setExpenses(data);
        } catch {
            toast('Failed to load expenses', 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchExpenses(); }, [admin]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${admin.token}` } };
            await axios.post(`${API_URL}/api/expenses`, formData, config);
            setShowModal(false);
            setFormData({ title: '', amount: '', category: 'Grocery', description: '' });
            fetchExpenses();
            toast('Expense logged successfully!', 'success');
        } catch {
            toast('Error adding expense', 'error');
        }
    };

    const getChartData = () => {
        const data = {};
        expenses.forEach(exp => { data[exp.category] = (data[exp.category] || 0) + exp.amount; });
        return Object.keys(data).map(key => ({ name: key, value: data[key] }));
    };

    const getMonthlyTrend = () => {
        const data = {};
        expenses.forEach(exp => {
            const month = new Date(exp.date).toLocaleDateString('en-IN', { month: 'short' });
            data[month] = (data[month] || 0) + exp.amount;
        });
        return Object.keys(data).map(k => ({ month: k, amount: data[k] }));
    };

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(18);
        doc.setTextColor(99, 102, 241);
        doc.text('Monthly Expense Report', 14, 20);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Total: INR ${totalExpenses.toLocaleString()} | Hostel Food Pro`, 14, 30);
        autoTable(doc, {
            startY: 38,
            head: [['Date', 'Title', 'Category', 'Amount']],
            body: expenses.map(e => [new Date(e.date).toLocaleDateString(), e.title, e.category, `INR ${e.amount}`]),
            headStyles: { fillColor: [99, 102, 241] },
            alternateRowStyles: { fillColor: [248, 250, 252] },
        });
        doc.save('expense-report.pdf');
        toast('PDF exported!', 'success');
    };

    const filteredExpenses = filterCategory === 'All'
        ? expenses
        : expenses.filter(e => e.category === filterCategory);

    const totalExpenses = expenses.reduce((a, e) => a + e.amount, 0);
    const thisMonth = expenses.filter(e => new Date(e.date).getMonth() === new Date().getMonth());
    const thisMonthTotal = thisMonth.reduce((a, e) => a + e.amount, 0);
    const chartData = getChartData();
    const trendData = getMonthlyTrend();

    return (
        <div className="space-y-6">
            <PageHeader
                title="Expense Tracker"
                subtitle="Track and analyze all hostel expenditures"
                action={
                    <div className="flex gap-3">
                        <Button variant="outline" icon={Download} onClick={exportPDF}>Export PDF</Button>
                        <Button icon={Plus} onClick={() => setShowModal(true)}>Add Expense</Button>
                    </div>
                }
            />

            {/* KPI row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {[
                    { label: 'Total Expenses', value: `₹${totalExpenses.toLocaleString()}`, icon: Wallet, gradient: 'bg-gradient-to-br from-indigo-500 to-violet-600' },
                    { label: 'This Month', value: `₹${thisMonthTotal.toLocaleString()}`, icon: IndianRupee, gradient: 'bg-gradient-to-br from-emerald-500 to-teal-600' },
                    { label: 'Transactions', value: expenses.length, icon: TrendingUp, gradient: 'bg-gradient-to-br from-amber-500 to-orange-500' },
                ].map((kpi, i) => (
                    <Card key={i} className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl ${kpi.gradient} text-white flex-shrink-0`}>
                            <kpi.icon size={22} />
                        </div>
                        <div>
                            <p className="text-sm text-sub font-medium">{kpi.label}</p>
                            <p className="text-2xl font-black text-base">{kpi.value}</p>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <Card className="xl:col-span-2">
                    <SectionHeading icon={TrendingUp} title="Expense Trend" />
                    <div className="h-52">
                        {trendData.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-muted text-sm">No data yet</div>
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={trendData}>
                                    <defs>
                                        <linearGradient id="expGrad2" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v / 1000).toFixed(0)}k`} />
                                    <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, 'Amount']} contentStyle={{ borderRadius: 12, border: '1px solid var(--border-color)', background: 'var(--bg-card)', color: 'var(--text-primary)' }} />
                                    <Area type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={2.5} fill="url(#expGrad2)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </Card>

                <Card>
                    <SectionHeading icon={Filter} title="By Category" />
                    {chartData.length === 0 ? (
                        <div className="h-52 flex items-center justify-center text-slate-400 text-sm">No expenses yet</div>
                    ) : (
                        <div className="h-52">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={chartData} innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                                        {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip formatter={(v) => [`₹${v.toLocaleString()}`, '']} contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
                                    <Legend iconType="circle" iconSize={8} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </Card>
            </div>

            {/* Transactions table */}
            <Card padding={false}>
                <div className="p-5 border-b border-base flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                    <h2 className="font-bold text-base flex items-center gap-2">
                        <Wallet size={18} className="text-indigo-500" /> Recent Transactions
                    </h2>
                    <div className="flex gap-2 flex-wrap">
                        {['All', ...categories].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setFilterCategory(cat)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${filterCategory === cat ? 'bg-indigo-600 text-white' : 'bg-muted text-sub hover:opacity-80'}`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-base">
                                {['Date', 'Title', 'Category', 'Amount'].map(h => (
                                    <th key={h} className="px-6 py-3.5 text-xs font-semibold text-sub uppercase tracking-wider bg-subtle">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <tr key={i} className="border-t border-subtle">
                                        {[1, 2, 3, 4].map(j => <td key={j} className="px-6 py-4"><div className="skeleton h-4 w-24 rounded" /></td>)}
                                    </tr>
                                ))
                            ) : filteredExpenses.length === 0 ? (
                                <tr><td colSpan={4}><EmptyState icon={Wallet} title="No expenses found" description="Add your first expense to get started." /></td></tr>
                            ) : filteredExpenses.map((exp) => (
                                <tr key={exp._id} className="border-t border-subtle table-row-hover transition-colors">
                                    <td className="px-6 py-4 text-sm text-sub">{new Date(exp.date).toLocaleDateString('en-IN')}</td>
                                    <td className="px-6 py-4 font-semibold text-base">{exp.title}</td>
                                    <td className="px-6 py-4">
                                        <Badge variant={categoryBadge[exp.category] || 'default'}>{exp.category}</Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-lg font-black text-base">₹{exp.amount.toLocaleString()}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Add Expense Modal */}
            <Modal open={showModal} onClose={() => setShowModal(false)} title="Log New Expense">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Title *"
                        placeholder="Monthly Rice Purchase"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                    />
                    <Input
                        label="Amount (₹) *"
                        type="number"
                        placeholder="5000"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                    />
                    <Select
                        label="Category"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                        {categories.map(cat => <option key={cat}>{cat}</option>)}
                    </Select>
                    <Textarea
                        label="Notes (optional)"
                        placeholder="Additional details..."
                        rows={3}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                    <div className="flex gap-3 pt-2">
                        <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
                        <Button type="submit" className="flex-1">Save Expense</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default ExpenseTracker;

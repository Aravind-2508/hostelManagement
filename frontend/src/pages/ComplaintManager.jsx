import API_URL from '../config/api';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    ClipboardList, Filter, ChevronDown, ChevronUp,
    Send, CheckCircle, Clock, AlertCircle, MessageSquareWarning
} from 'lucide-react';
import { Card, Badge, Button, PageHeader, SectionHeading } from '../components/ui/Components';

const STATUS_CFG = {
    Pending: { variant: 'warning', icon: Clock },
    'In Progress': { variant: 'info', icon: AlertCircle },
    Resolved: { variant: 'active', icon: CheckCircle },
};

const CAT_VARIANT = {
    Food: 'warning',
    Cleanliness: 'info',
    Maintenance: 'default',
    Other: 'default',
    Suggestion: 'primary',
};

const ComplaintManager = () => {
    const [complaints, setComplaints] = useState([]);
    const [stats, setStats] = useState({});
    const [statusFilter, setFilter] = useState('');
    const [expanded, setExpanded] = useState(null);
    const [response, setResponse] = useState('');
    const [newStatus, setNewStatus] = useState('');
    const [saving, setSaving] = useState(false);
    const { admin } = useAuth();

    const cfg = { headers: { Authorization: `Bearer ${admin.token}` } };

    const fetchAll = async () => {
        try {
            const params = statusFilter ? `?status=${statusFilter}` : '';
            const [c, s] = await Promise.all([
                axios.get(`${API_URL}/api/complaints${params}`, cfg),
                axios.get(`${API_URL}/api/complaints/stats`, cfg),
            ]);
            setComplaints(c.data);
            setStats(s.data);
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchAll(); }, [statusFilter]);

    const toggleExpand = (complaint) => {
        if (expanded?._id === complaint._id) {
            setExpanded(null);
        } else {
            setExpanded(complaint);
            setResponse(complaint.adminResponse || '');
            setNewStatus(complaint.status);
        }
    };

    const handleRespond = async () => {
        setSaving(true);
        try {
            await axios.put(
                `${API_URL}/api/complaints/${expanded._id}`,
                { status: newStatus, adminResponse: response },
                cfg
            );
            fetchAll();
            setExpanded(null);
        } catch (e) {
            alert(e.response?.data?.message || 'Error saving response');
        } finally { setSaving(false); }
    };

    const kpis = [
        { label: 'Total', value: stats.total || 0, gradient: 'from-indigo-500 to-violet-600' },
        { label: 'Pending', value: stats.Pending || 0, gradient: 'from-amber-500 to-orange-500' },
        { label: 'In Progress', value: stats['In Progress'] || 0, gradient: 'from-blue-500 to-cyan-600' },
        { label: 'Resolved', value: stats.Resolved || 0, gradient: 'from-emerald-500 to-teal-600' },
    ];

    return (
        <div className="space-y-6">
            <PageHeader
                title="Complaints &amp; Suggestions"
                subtitle="Review and respond to student feedback"
            />

            {/* ── KPI row ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {kpis.map(k => (
                    <Card key={k.label} className="flex items-center gap-4">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${k.gradient} text-white flex-shrink-0`}>
                            <ClipboardList size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-base">{k.value}</p>
                            <p className="text-xs text-sub font-medium">{k.label}</p>
                        </div>
                    </Card>
                ))}
            </div>

            {/* ── Filter tabs ── */}
            <div className="flex space-x-2 overflow-x-auto pb-1">
                {['', 'Pending', 'In Progress', 'Resolved'].map(s => (
                    <button
                        key={s}
                        onClick={() => setFilter(s)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold whitespace-nowrap transition flex items-center gap-1.5 ${statusFilter === s
                                ? 'bg-indigo-600 text-white shadow'
                                : 'bg-muted text-sub border border-base hover:opacity-80'
                            }`}
                    >
                        <Filter size={12} />
                        {s || 'All'}
                    </button>
                ))}
            </div>

            {/* ── Complaints list ── */}
            <Card padding={false}>
                <div className="p-5 border-b border-base">
                    <SectionHeading icon={MessageSquareWarning} title={`${complaints.length} Submission${complaints.length !== 1 ? 's' : ''}`} />
                </div>

                {complaints.length === 0 ? (
                    <div className="text-center py-20 text-muted">
                        <ClipboardList size={48} className="mx-auto mb-3 opacity-30" />
                        <p className="font-semibold text-sub">No complaints found</p>
                        <p className="text-sm mt-1">Students haven't submitted any feedback yet</p>
                    </div>
                ) : (
                    <div className="divide-y divide-subtle">
                        {complaints.map(c => {
                            const sc = STATUS_CFG[c.status] || STATUS_CFG.Pending;
                            const StatusIcon = sc.icon;
                            const isOpen = expanded?._id === c._id;

                            return (
                                <div key={c._id}>
                                    {/* Row header */}
                                    <div
                                        className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-subtle transition"
                                        onClick={() => toggleExpand(c)}
                                    >
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${c.status === 'Resolved' ? 'bg-emerald-500' :
                                                    c.status === 'In Progress' ? 'bg-blue-500' : 'bg-amber-500'
                                                }`} />
                                            <div className="min-w-0">
                                                <div className="flex items-center flex-wrap gap-2 mb-0.5">
                                                    <span className="font-semibold text-base text-sm">
                                                        {c.student?.name}
                                                        <span className="text-muted ml-1 font-normal">({c.student?.rollNo})</span>
                                                    </span>
                                                    <Badge variant={CAT_VARIANT[c.category] || 'default'}>{c.category}</Badge>
                                                    <Badge variant="default">{c.type}</Badge>
                                                </div>
                                                <p className="text-sm text-sub truncate">{c.description}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                                            <Badge variant={sc.variant}>
                                                <StatusIcon size={11} className="mr-1 inline" />
                                                {c.status}
                                            </Badge>
                                            <span className="text-xs text-muted hidden sm:block">
                                                {new Date(c.createdAt).toLocaleDateString('en-IN')}
                                            </span>
                                            {isOpen
                                                ? <ChevronUp size={16} className="text-muted" />
                                                : <ChevronDown size={16} className="text-muted" />
                                            }
                                        </div>
                                    </div>

                                    {/* Expand panel */}
                                    {isOpen && (
                                        <div className="px-5 pb-5 bg-subtle border-t border-base">
                                            <div className="pt-4 space-y-4">
                                                <div>
                                                    <p className="text-xs font-semibold text-sub uppercase tracking-wider mb-2">Full Description</p>
                                                    <div className="bg-card rounded-xl p-4 border border-base text-sm text-base leading-relaxed">
                                                        {c.description}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-semibold text-sub uppercase tracking-wider mb-2">
                                                            Update Status
                                                        </label>
                                                        <select
                                                            value={newStatus}
                                                            onChange={e => setNewStatus(e.target.value)}
                                                            className="input-premium"
                                                        >
                                                            <option>Pending</option>
                                                            <option>In Progress</option>
                                                            <option>Resolved</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-semibold text-sub uppercase tracking-wider mb-2">
                                                        Admin Response
                                                    </label>
                                                    <textarea
                                                        rows={3}
                                                        value={response}
                                                        onChange={e => setResponse(e.target.value)}
                                                        placeholder="Write your response to the student..."
                                                        className="input-premium resize-none"
                                                    />
                                                </div>

                                                <Button
                                                    icon={Send}
                                                    onClick={handleRespond}
                                                    disabled={saving}
                                                >
                                                    {saving ? 'Saving...' : 'Save Response'}
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default ComplaintManager;

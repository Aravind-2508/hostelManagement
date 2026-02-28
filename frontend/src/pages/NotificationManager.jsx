import API_URL from '../config/api';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Bell, Plus, Pencil, Trash2, X, CheckCircle, AlertTriangle, Info, Megaphone, Zap } from 'lucide-react';

const TYPE_CONFIG = {
    Info: { icon: Info, color: 'bg-blue-50 text-blue-700 border-blue-200', badge: 'bg-blue-100 text-blue-700' },
    Alert: { icon: AlertTriangle, color: 'bg-red-50 text-red-700 border-red-200', badge: 'bg-red-100 text-red-700' },
    'Special Meal': { icon: Zap, color: 'bg-emerald-50 text-emerald-700 border-emerald-200', badge: 'bg-emerald-100 text-emerald-700' },
    Announcement: { icon: Megaphone, color: 'bg-purple-50 text-purple-700 border-purple-200', badge: 'bg-purple-100 text-purple-700' },
};

const EMPTY_FORM = { title: '', message: '', type: 'Info', expiresAt: '' };

const NotificationManager = () => {
    const [notifications, setNotifications] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(false);
    const { admin } = useAuth();

    const cfg = { headers: { Authorization: `Bearer ${admin.token}` } };

    const fetchAll = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/api/notifications/admin/all`, cfg);
            setNotifications(data);
        } catch (e) { console.error(e); }
    };

    useEffect(() => { fetchAll(); }, []);

    const openCreate = () => { setForm(EMPTY_FORM); setEditId(null); setShowModal(true); };
    const openEdit = (n) => {
        setForm({
            title: n.title,
            message: n.message,
            type: n.type,
            expiresAt: n.expiresAt ? n.expiresAt.slice(0, 16) : '',
        });
        setEditId(n._id);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = { ...form, expiresAt: form.expiresAt || null };
            if (editId) {
                await axios.put(`${API_URL}/api/notifications/${editId}`, payload, cfg);
            } else {
                await axios.post(`${API_URL}/api/notifications`, payload, cfg);
            }
            setShowModal(false);
            fetchAll();
        } catch (e) {
            alert(e.response?.data?.message || 'Error saving notification');
        } finally { setLoading(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this notification?')) return;
        await axios.delete(`${API_URL}/api/notifications/${id}`, cfg);
        fetchAll();
    };

    const total = notifications.length;
    const active = notifications.filter(n => n.isActive).length;

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">🔔 Notification Manager</h1>
                    <p className="text-gray-400 text-sm mt-1">
                        {active} active · {total - active} expired
                    </p>
                </div>
                <button
                    onClick={openCreate}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-xl flex items-center hover:bg-indigo-700 transition shadow-md"
                >
                    <Plus size={18} className="mr-2" /> New Notification
                </button>
            </div>

            {/* Notification list */}
            <div className="space-y-3">
                {notifications.length === 0 && (
                    <div className="text-center py-16 text-gray-300">
                        <Bell size={48} className="mx-auto mb-3" />
                        <p className="font-medium">No notifications yet. Create one!</p>
                    </div>
                )}
                {notifications.map(n => {
                    const tc = TYPE_CONFIG[n.type] || TYPE_CONFIG['Info'];
                    const TypeIcon = tc.icon;
                    const expired = !n.isActive;
                    return (
                        <div key={n._id}
                            className={`rounded-2xl border-2 p-5 transition ${expired ? 'opacity-50' : ''} ${tc.color}`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex items-start space-x-3 flex-1 min-w-0">
                                    <div className="mt-0.5 flex-shrink-0">
                                        <TypeIcon size={20} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                            <p className="font-bold text-gray-900">{n.title}</p>
                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tc.badge}`}>{n.type}</span>
                                            {expired && <span className="text-xs bg-gray-200 text-gray-500 px-2 py-0.5 rounded-full">Expired</span>}
                                        </div>
                                        <p className="text-sm text-gray-700 mt-1">{n.message}</p>
                                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                                            <span>By: {n.createdBy?.name || 'Admin'}</span>
                                            <span>·</span>
                                            <span>{new Date(n.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                            {n.expiresAt && (
                                                <>
                                                    <span>·</span>
                                                    <span>Expires: {new Date(n.expiresAt).toLocaleDateString('en-IN')}</span>
                                                </>
                                            )}
                                            <span>·</span>
                                            <span className="flex items-center">
                                                <CheckCircle size={11} className="mr-1" />
                                                {n.readCount} read
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex space-x-2 flex-shrink-0">
                                    <button onClick={() => openEdit(n)} className="p-2 rounded-lg hover:bg-white/50 transition" title="Edit">
                                        <Pencil size={15} />
                                    </button>
                                    <button onClick={() => handleDelete(n._id)} className="p-2 rounded-lg hover:bg-red-100 text-red-500 transition" title="Delete">
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Create / Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-5">
                            <h2 className="text-lg font-bold text-gray-800">{editId ? 'Edit Notification' : 'New Notification'}</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                                <input
                                    value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                                    required maxLength={150}
                                    placeholder="e.g. Special Dinner Tomorrow"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Message *</label>
                                <textarea
                                    value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                                    required rows={3} maxLength={1000}
                                    placeholder="Write your message here..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                    <select
                                        value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl outline-none"
                                    >
                                        {Object.keys(TYPE_CONFIG).map(t => <option key={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Expires At (optional)</label>
                                    <input
                                        type="datetime-local" value={form.expiresAt}
                                        onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-xl outline-none text-sm"
                                    />
                                </div>
                            </div>
                            <div className="flex space-x-3 pt-2">
                                <button type="button" onClick={() => setShowModal(false)}
                                    className="flex-1 border border-gray-300 rounded-xl py-2 font-medium hover:bg-gray-50 transition">
                                    Cancel
                                </button>
                                <button type="submit" disabled={loading}
                                    className="flex-1 bg-indigo-600 text-white rounded-xl py-2 font-bold hover:bg-indigo-700 disabled:opacity-60 transition">
                                    {loading ? 'Saving...' : editId ? 'Update' : 'Publish'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationManager;

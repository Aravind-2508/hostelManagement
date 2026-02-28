import API_URL from '../config/api';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { UserPlus, Search, Trash2, Edit, Eye, EyeOff, KeyRound, Users, Filter } from 'lucide-react';
import {
    Card, Badge, Button, Modal, Input, Select, PageHeader, EmptyState
} from '../components/ui/Components';

const StudentManagement = () => {
    const [students, setStudents] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [editStudent, setEditStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [formData, setFormData] = useState({
        name: '', rollNo: '', roomNo: '', phone: '', email: '', password: ''
    });
    const { admin } = useAuth();
    const { toast } = useToast();

    const fetchStudents = useCallback(async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${admin.token}` } };
            const { data } = await axios.get(`${API_URL}/api/students`, config);
            setStudents(data);
        } catch {
            toast('Failed to load students', 'error');
        } finally {
            setLoading(false);
        }
    }, [admin]);

    useEffect(() => { fetchStudents(); }, [fetchStudents]);

    const openAddModal = () => {
        setEditStudent(null);
        setFormData({ name: '', rollNo: '', roomNo: '', phone: '', email: '', password: '' });
        setShowPassword(false);
        setShowModal(true);
    };

    const openEditModal = (student) => {
        setEditStudent(student);
        setFormData({
            name: student.name, rollNo: student.rollNo,
            roomNo: student.roomNo, phone: student.phone || '',
            email: student.email || '', password: '',
        });
        setShowPassword(false);
        setShowModal(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${admin.token}` } };
            if (editStudent) {
                const updateData = { ...formData };
                if (!updateData.password) delete updateData.password;
                await axios.put(`${API_URL}/api/students/${editStudent._id}`, updateData, config);
                toast('Student updated successfully!', 'success');
            } else {
                await axios.post(`${API_URL}/api/students`, formData, config);
                toast('Student added successfully!', 'success');
            }
            setShowModal(false);
            fetchStudents();
        } catch (error) {
            toast(error.response?.data?.message || 'Error saving student', 'error');
        }
    };

    const deleteStudent = async (id, name) => {
        if (!window.confirm(`Delete student "${name}"? This cannot be undone.`)) return;
        try {
            const config = { headers: { Authorization: `Bearer ${admin.token}` } };
            await axios.delete(`${API_URL}/api/students/${id}`, config);
            toast('Student removed', 'info');
            fetchStudents();
        } catch {
            toast('Error deleting student', 'error');
        }
    };

    const filteredStudents = students.filter(s => {
        const matchSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.rollNo.includes(searchTerm);
        const matchStatus = statusFilter === 'All' || s.status === statusFilter;
        return matchSearch && matchStatus;
    });

    const activeCount = students.filter(s => s.status === 'Active').length;
    const inactiveCount = students.filter(s => s.status !== 'Active').length;

    return (
        <div className="space-y-6">
            <PageHeader
                title="Student Directory"
                subtitle={`${students.length} total students · ${activeCount} active`}
                action={
                    <Button icon={UserPlus} onClick={openAddModal}>Add New Student</Button>
                }
            />

            {/* Info Banner */}
            <div className="flex items-start gap-3 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 text-sm text-indigo-700">
                <KeyRound size={16} className="flex-shrink-0 mt-0.5" />
                <span>
                    Students log in at <strong>/student-login</strong> using their <strong>Roll Number</strong> + the password you set here.
                </span>
            </div>

            {/* Summary pills */}
            <div className="flex items-center gap-3 flex-wrap">
                {[
                    { label: 'All Students', value: students.length, filter: 'All', color: 'bg-muted text-base' },
                    { label: 'Active', value: activeCount, filter: 'Active', color: 'bg-emerald-50 text-emerald-700' },
                    { label: 'Inactive', value: inactiveCount, filter: 'Inactive', color: 'bg-red-50 text-red-700' },
                ].map((pill) => (
                    <button
                        key={pill.filter}
                        onClick={() => setStatusFilter(pill.filter)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold transition border ${statusFilter === pill.filter ? 'ring-2 ring-indigo-400 ring-offset-1' : 'border-transparent'} ${pill.color}`}
                    >
                        {pill.label} <span className="ml-1 font-bold">{pill.value}</span>
                    </button>
                ))}
            </div>

            {/* Table Card */}
            <Card padding={false}>
                {/* Table toolbar */}
                <div className="p-4 border-b border-base flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1 max-w-sm">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                        <input
                            type="text"
                            placeholder="Search by name or roll number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-premium pl-9 text-sm"
                        />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-sub">
                        <Filter size={14} />
                        <span>{filteredStudents.length} results</span>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-base">
                                {['Name', 'Roll No', 'Room', 'Phone', 'Email', 'Status', 'Login Info', 'Actions'].map(h => (
                                    <th key={h} className="px-5 py-3.5 text-xs font-semibold text-sub uppercase tracking-wider whitespace-nowrap bg-subtle">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                Array.from({ length: 4 }).map((_, i) => (
                                    <tr key={i} className="border-t border-subtle">
                                        {Array.from({ length: 8 }).map((_, j) => (
                                            <td key={j} className="px-5 py-4">
                                                <div className="skeleton h-4 w-24 rounded" />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={8}>
                                        <EmptyState icon={Users} title="No students found" description="Try a different search or add a new student." />
                                    </td>
                                </tr>
                            ) : filteredStudents.map((s) => (
                                <tr key={s._id} className="border-t border-subtle table-row-hover group transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                                                {s.name[0].toUpperCase()}
                                            </div>
                                            <span className="font-semibold text-base text-sm">{s.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 text-sm font-mono text-sub">{s.rollNo}</td>
                                    <td className="px-5 py-4 text-sm text-sub">{s.roomNo}</td>
                                    <td className="px-5 py-4 text-sm text-sub">{s.phone || '—'}</td>
                                    <td className="px-5 py-4 text-sm text-muted max-w-[160px] truncate">{s.email || '—'}</td>
                                    <td className="px-5 py-4">
                                        <Badge variant={s.status === 'Active' ? 'active' : 'inactive'}>{s.status}</Badge>
                                    </td>
                                    <td className="px-5 py-4 text-xs font-mono text-indigo-500">
                                        Roll: {s.rollNo} / ••••
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                                            <button
                                                onClick={() => openEditModal(s)}
                                                className="p-2 rounded-lg text-indigo-600 hover:bg-indigo-50 transition"
                                                title="Edit"
                                            >
                                                <Edit size={15} />
                                            </button>
                                            <button
                                                onClick={() => deleteStudent(s._id, s.name)}
                                                className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition"
                                                title="Delete"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Add / Edit Modal */}
            <Modal
                open={showModal}
                onClose={() => setShowModal(false)}
                title={editStudent ? 'Edit Student' : 'Add New Student'}
                size="lg"
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Full Name *"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <Input
                            label="Roll Number *"
                            placeholder="101"
                            value={formData.rollNo}
                            onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                            required
                            disabled={!!editStudent}
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Room Number *"
                            placeholder="A-10"
                            value={formData.roomNo}
                            onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
                            required
                        />
                        <Input
                            label="Phone"
                            placeholder="9876543210"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </div>
                    <Input
                        label="Email"
                        type="email"
                        placeholder="student@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    <div>
                        <label className="block text-sm font-medium text-sub mb-1.5">
                            {editStudent ? 'New Password (leave blank to keep)' : 'Login Password *'}
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder={editStudent ? '••••••' : 'Min 4 characters'}
                                className="input-premium pr-12"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required={!editStudent}
                                minLength={4}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>
                    {editStudent && (
                        <Select
                            label="Status"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                        </Select>
                    )}
                    <div className="flex gap-3 pt-2">
                        <Button variant="outline" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
                        <Button type="submit" className="flex-1">{editStudent ? 'Update Student' : 'Add Student'}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default StudentManagement;

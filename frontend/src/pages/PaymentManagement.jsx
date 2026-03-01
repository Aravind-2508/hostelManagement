import API_URL from '../config/api';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import {
    Wallet, Plus, Search, Filter, Download,
    Calendar, User, CreditCard, IndianRupee,
    CheckCircle, AlertCircle, Clock, FileText, Send
} from 'lucide-react';
import {
    Card, Badge, Button, Modal, Input, Select,
    PageHeader, SectionHeading, EmptyState
} from '../components/ui/Components';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const MONTHS = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
];

const PaymentManagement = () => {
    const [payments, setPayments] = useState([]);
    const [students, setStudents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [formData, setFormData] = useState({
        studentId: '', amount: '', month: MONTHS[new Date().getMonth()],
        year: new Date().getFullYear().toString(), status: 'Paid',
        method: 'Cash', notes: ''
    });

    const { admin } = useAuth();
    const { toast } = useToast();

    const fetchAll = useCallback(async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${admin.token}` } };
            const [payRes, stuRes] = await Promise.all([
                axios.get(`${API_URL}/api/payments`, config),
                axios.get(`${API_URL}/api/students`, config)
            ]);
            setPayments(payRes.data);
            setStudents(stuRes.data);
        } catch {
            toast('Failed to load payment data', 'error');
        } finally {
            setLoading(false);
        }
    }, [admin, toast]);

    useEffect(() => { fetchAll(); }, [fetchAll]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${admin.token}` } };
            await axios.post(`${API_URL}/api/payments`, formData, config);
            toast('Payment recorded successfully!', 'success');
            setShowModal(false);
            setFormData({
                studentId: '', amount: '', month: MONTHS[new Date().getMonth()],
                year: new Date().getFullYear().toString(), status: 'Paid',
                method: 'Cash', notes: ''
            });
            fetchAll();
        } catch (error) {
            toast(error.response?.data?.message || 'Error saving payment', 'error');
        }
    };

    const exportReceipt = (p) => {
        const doc = new jsPDF();

        // Receipt Header
        doc.setFillColor(79, 70, 229); // Indigo-600
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text('PAYMENT RECEIPT', 105, 25, { align: 'center' });

        // Hostel Info
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(16);
        doc.text('Hostel Food Management', 20, 55);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Receipt No: ${p._id.slice(-8).toUpperCase()}`, 150, 55);
        doc.text(`Date: ${new Date(p.paymentDate).toLocaleDateString()}`, 150, 60);

        // Student Info
        doc.setDrawColor(240);
        doc.line(20, 65, 190, 65);
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text('Student Details:', 20, 75);
        doc.setFontSize(10);
        doc.text(`Name: ${p.student.name}`, 25, 82);
        doc.text(`Roll No: ${p.student.rollNo}`, 25, 87);
        doc.text(`Room No: ${p.student.roomNo}`, 25, 92);

        // Payment Details Table
        autoTable(doc, {
            startY: 105,
            head: [['Description', 'Month/Year', 'Method', 'Amount']],
            body: [
                ['Hostel Mess Fees', `${p.month} ${p.year}`, p.method, `INR ${p.amount.toLocaleString()}`]
            ],
            headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] },
            theme: 'grid'
        });

        const finalY = doc.lastAutoTable.finalY + 15;
        doc.setFontSize(14);
        doc.text(`Total Amount: INR ${p.amount.toLocaleString()}`, 130, finalY);
        doc.setFontSize(10);
        doc.text(`Status: ${p.status}`, 130, finalY + 7);

        // Footer
        doc.setTextColor(150);
        doc.setFontSize(9);
        doc.text('Computer Generated Receipt - No Signature Required', 105, 280, { align: 'center' });

        doc.save(`Receipt_${p.student.rollNo}_${p.month}.pdf`);
        toast('Receipt generated!', 'success');
    };

    const filtered = payments.filter(p => {
        const matchSearch = p.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.student.rollNo.includes(searchTerm);
        const matchStatus = filterStatus === 'All' || p.status === filterStatus;
        return matchSearch && matchStatus;
    });

    const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);
    const thisMonth = payments.filter(p => p.month === MONTHS[new Date().getMonth()]);
    const monthTotal = thisMonth.reduce((acc, p) => acc + p.amount, 0);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Fee Management"
                subtitle="Track and manage student mess fee payments"
                action={
                    <Button icon={Plus} onClick={() => setShowModal(true)}>Record Payment</Button>
                }
            />

            {/* KPI Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                {[
                    { label: 'Total Collections', value: `₹${totalCollected.toLocaleString()}`, icon: Wallet, color: 'indigo' },
                    { label: 'This Month', value: `₹${monthTotal.toLocaleString()}`, icon: IndianRupee, color: 'emerald' },
                    { label: 'Total Receipts', value: payments.length, icon: FileText, color: 'amber' },
                ].map((kpi, i) => (
                    <Card key={i} className="flex items-center gap-4">
                        <div className={`p-4 rounded-2xl bg-${kpi.color}-50 text-${kpi.color}-600`}>
                            <kpi.icon size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-sub font-medium">{kpi.label}</p>
                            <p className="text-2xl font-black text-base">{kpi.value}</p>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Main Content */}
            <Card padding={false}>
                <div className="p-4 border-b border-base flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                    <div className="relative flex-1 max-w-sm">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                        <input
                            type="text"
                            placeholder="Search student or roll number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="input-premium pl-10 text-sm"
                        />
                    </div>
                    <div className="flex gap-2">
                        {['All', 'Paid', 'Partial', 'Unpaid'].map(s => (
                            <button
                                key={s}
                                onClick={() => setFilterStatus(s)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${filterStatus === s ? 'bg-indigo-600 text-white shadow-md' : 'bg-muted text-sub hover:opacity-80'}`}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-subtle border-b border-base">
                                {['Date', 'Student', 'Fee Period', 'Amount', 'Method', 'Status', 'Actions'].map(h => (
                                    <th key={h} className="px-6 py-4 text-xs font-bold text-sub uppercase tracking-wider">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-subtle">
                            {loading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <tr key={i}><td colSpan={7} className="px-6 py-4"><div className="skeleton h-5 w-full rounded" /></td></tr>
                                ))
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={7}><EmptyState icon={CreditCard} title="No payments found" description="Adjust your filters or record a new payment." /></td></tr>
                            ) : filtered.map((p) => (
                                <tr key={p._id} className="table-row-hover transition-colors">
                                    <td className="px-6 py-4 text-sm text-sub">{new Date(p.paymentDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-base text-sm">{p.student.name}</span>
                                            <span className="text-xs text-muted">Roll: {p.student.rollNo}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium">{p.month} {p.year}</td>
                                    <td className="px-6 py-4 font-black">₹{p.amount.toLocaleString()}</td>
                                    <td className="px-6 py-4"><Badge variant="default">{p.method}</Badge></td>
                                    <td className="px-6 py-4">
                                        <Badge variant={p.status === 'Paid' ? 'active' : p.status === 'Partial' ? 'warning' : 'inactive'}>
                                            {p.status}
                                        </Badge>
                                    </td>
                                    <td className="px-6 py-4">
                                        <Button variant="outline" size="sm" icon={Download} onClick={() => exportReceipt(p)}>Receipt</Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Record Payment Modal */}
            <Modal open={showModal} onClose={() => setShowModal(false)} title="Record Fee Payment">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Select
                        label="Student *"
                        value={formData.studentId}
                        onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
                        required
                    >
                        <option value="">Select Student</option>
                        {students.map(s => <option key={s._id} value={s._id}>{s.name} ({s.rollNo})</option>)}
                    </Select>

                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Amount (₹) *"
                            type="number"
                            value={formData.amount}
                            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                            required
                        />
                        <Select
                            label="Period Year *"
                            value={formData.year}
                            onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                        >
                            <option>2024</option>
                            <option>2025</option>
                            <option>2026</option>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Period Month *"
                            value={formData.month}
                            onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                        >
                            {MONTHS.map(m => <option key={m}>{m}</option>)}
                        </Select>
                        <Select
                            label="Status"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                            <option>Paid</option>
                            <option>Partial</option>
                            <option>Unpaid</option>
                        </Select>
                    </div>

                    <Select
                        label="Payment Method"
                        value={formData.method}
                        onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                    >
                        <option>Cash</option>
                        <option>UPI</option>
                        <option>Bank Transfer</option>
                        <option>Online</option>
                    </Select>

                    <Input
                        label="Notes"
                        placeholder="Transaction ID or remarks..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />

                    <div className="flex gap-3 pt-4">
                        <Button variant="outline" className="flex-1" onClick={() => setShowModal(false)}>Cancel</Button>
                        <Button type="submit" className="flex-1">Save Payment</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default PaymentManagement;

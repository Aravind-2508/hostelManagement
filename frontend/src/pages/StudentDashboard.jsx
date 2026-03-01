import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config/api';
import {
    GraduationCap, Utensils, LogOut, User, BedDouble,
    CalendarDays, Sun, Coffee, Moon, ChevronRight,
    Bell, Star, ThumbsUp, ThumbsDown, Send,
    ClipboardList, CheckCircle, Clock, AlertCircle,
    Info, AlertTriangle, Megaphone, Zap, X, Wallet, IndianRupee, CreditCard, Download, FileText
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Card, Badge, Button, SectionHeading } from '../components/ui/Components';

// ─── Constants ────────────────────────────────────────────────────
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEALS = ['Breakfast', 'Lunch', 'Dinner'];
const mealCfg = {
    Breakfast: { icon: Coffee, color: 'amber', time: '7:30 – 9:00 AM' },
    Lunch: { icon: Sun, color: 'emerald', time: '12:30 – 2:00 PM' },
    Dinner: { icon: Moon, color: 'indigo', time: '7:30 – 9:00 PM' },
};
const clr = {
    amber: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', icon: 'text-amber-500', badge: 'bg-amber-100 text-amber-700' },
    emerald: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', icon: 'text-emerald-500', badge: 'bg-emerald-100 text-emerald-700' },
    indigo: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', icon: 'text-indigo-500', badge: 'bg-indigo-100 text-indigo-700' },
};
const STATUS_CFG = {
    Pending: { color: 'bg-amber-100 text-amber-700', icon: Clock, dot: 'bg-amber-500' },
    'In Progress': { color: 'bg-blue-100 text-blue-700', icon: AlertCircle, dot: 'bg-blue-500' },
    Resolved: { color: 'bg-emerald-100 text-emerald-700', icon: CheckCircle, dot: 'bg-emerald-500' },
};
const NOTIF_CFG = {
    Info: { icon: Info, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-700', badge: 'bg-blue-100 text-blue-700' },
    Alert: { icon: AlertTriangle, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', badge: 'bg-red-100 text-red-700' },
    'Special Meal': { icon: Zap, bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-700', badge: 'bg-emerald-100 text-emerald-700' },
    Announcement: { icon: Megaphone, bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-700', badge: 'bg-purple-100 text-purple-700' },
    Response: { icon: CheckCircle, bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-700', badge: 'bg-indigo-100 text-indigo-700' },
};

// ─── Star Rating ──────────────────────────────────────────────────
const StarPicker = ({ value, onChange }) => (
    <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map(s => (
            <button
                key={s} type="button"
                onClick={() => onChange(s)}
                className={`text-2xl transition-transform hover:scale-125 ${s <= value ? 'text-amber-400' : 'text-gray-200'}`}
            >★</button>
        ))}
    </div>
);
const StarDisplay = ({ value }) => (
    <span className="flex">
        {[1, 2, 3, 4, 5].map(s => (
            <span key={s} className={`text-sm ${s <= Math.round(value) ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
        ))}
    </span>
);

// ─── Main Component ───────────────────────────────────────────────
const StudentDashboard = () => {
    const [student, setStudent] = useState(null);
    const [allMenu, setAllMenu] = useState([]);
    const [myFeedback, setMyFeedback] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [complaints, setComplaints] = useState([]);
    const [payments, setPayments] = useState([]);
    const [activeDay, setActiveDay] = useState('');
    const [today, setToday] = useState('');
    const [activeTab, setActiveTab] = useState('menu');
    const [loading, setLoading] = useState(true);
    // Feedback modal state
    const [feedbackModal, setFeedbackModal] = useState(null); // { day, mealType, foodItems }
    const [fbRating, setFbRating] = useState(0);
    const [fbLiked, setFbLiked] = useState(null);
    const [fbComment, setFbComment] = useState('');
    const [fbSaving, setFbSaving] = useState(false);
    // Complaint form state
    const [cmpForm, setCmpForm] = useState({ type: 'Complaint', category: 'Food', description: '' });
    const [cmpSubmitting, setCmpSubmitting] = useState(false);
    const [cmpSuccess, setCmpSuccess] = useState(false);

    const navigate = useNavigate();

    // ── Get student + token from sessionStorage ─────────────────
    const getStudentInfo = () => JSON.parse(sessionStorage.getItem('studentInfo') || 'null');

    const authHeader = () => {
        const info = getStudentInfo();
        return info ? { Authorization: `Bearer ${info.token}` } : {};
    };

    // ── Fetch data ──────────────────────────────────────────────
    const fetchMenu = useCallback(async () => {
        const { data } = await axios.get(`${API_URL}/api/menu`);
        setAllMenu(data);
    }, []);

    const fetchMyFeedback = useCallback(async () => {
        const { data } = await axios.get(`${API_URL}/api/feedback/mine`, { headers: authHeader() });
        setMyFeedback(data);
    }, []);

    const fetchNotifications = useCallback(async () => {
        const { data } = await axios.get(`${API_URL}/api/notifications`, { headers: authHeader() });
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.isRead).length);
    }, []);

    const fetchComplaints = useCallback(async () => {
        const { data } = await axios.get(`${API_URL}/api/complaints/mine`, { headers: authHeader() });
        setComplaints(data);
    }, []);

    const fetchPayments = useCallback(async () => {
        const { data } = await axios.get(`${API_URL}/api/payments/me`, { headers: authHeader() });
        setPayments(data);
    }, []);

    useEffect(() => {
        const info = getStudentInfo();
        if (!info) { navigate('/student-login'); return; }
        setStudent(info);

        const jsDay = new Date().getDay();
        const todayName = DAYS[jsDay === 0 ? 6 : jsDay - 1];
        setToday(todayName);
        setActiveDay(todayName);

        Promise.all([fetchMenu(), fetchMyFeedback(), fetchNotifications(), fetchComplaints(), fetchPayments()])
            .catch(err => {
                if (err.response?.status === 401 && err.response?.data?.message === 'Student not found') {
                    handleLogout();
                }
            })
            .finally(() => setLoading(false));
    }, [navigate]);

    // ── Helpers ─────────────────────────────────────────────────
    const getMeal = (day, mealType) => allMenu.find(m => m.day === day && m.mealType === mealType);
    const getMyFb = (day, mealType) => myFeedback.find(f => f.day === day && f.mealType === mealType);

    const handleLogout = () => { sessionStorage.removeItem('studentInfo'); navigate('/student-login'); };

    // ── PDF Receipt Export ──────────────────────────────────────
    const exportReceipt = (p) => {
        const doc = new jsPDF();
        doc.setFillColor(5, 150, 105); // emerald-600
        doc.rect(0, 0, 210, 40, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(22);
        doc.text('PAYMENT RECEIPT', 105, 25, { align: 'center' });

        doc.setTextColor(0, 0, 0);
        doc.setFontSize(16);
        doc.text('Hostel Food Management', 20, 55);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Receipt No: ${p._id.slice(-8).toUpperCase()}`, 150, 55);
        doc.text(`Date: ${new Date(p.paymentDate).toLocaleDateString()}`, 150, 60);

        doc.setDrawColor(240);
        doc.line(20, 65, 190, 65);
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.text('Student Details:', 20, 75);
        doc.setFontSize(10);
        doc.text(`Name: ${student.name}`, 25, 82);
        doc.text(`Roll No: ${student.rollNo}`, 25, 87);
        doc.text(`Room No: ${student.roomNo}`, 25, 92);

        autoTable(doc, {
            startY: 105,
            head: [['Description', 'Month/Year', 'Method', 'Amount']],
            body: [
                ['Hostel Mess Fees', `${p.month} ${p.year}`, p.method, `INR ${p.amount.toLocaleString()}`]
            ],
            headStyles: { fillColor: [5, 150, 105], textColor: [255, 255, 255] },
            theme: 'grid'
        });

        const finalY = doc.lastAutoTable.finalY + 15;
        doc.setFontSize(14);
        doc.text(`Total Amount: INR ${p.amount.toLocaleString()}`, 130, finalY);
        doc.setFontSize(10);
        doc.text(`Status: ${p.status}`, 130, finalY + 7);

        doc.setTextColor(150);
        doc.setFontSize(9);
        doc.text('Computer Generated Receipt - No Signature Required', 105, 280, { align: 'center' });

        doc.save(`Receipt_${student.rollNo}_${p.month}.pdf`);
    };

    // ── Open feedback modal ──────────────────────────────────────
    const openFeedback = (day, mealType, foodItems) => {
        const existing = getMyFb(day, mealType);
        setFeedbackModal({ day, mealType, foodItems });
        setFbRating(existing?.rating || 0);
        setFbLiked(existing?.liked ?? null);
        setFbComment(existing?.comment || '');
    };

    const submitFeedback = async () => {
        if (!fbRating) return alert('Please select a star rating');
        setFbSaving(true);
        try {
            await axios.post(`${API_URL}/api/feedback`, {
                day: feedbackModal.day,
                mealType: feedbackModal.mealType,
                rating: fbRating,
                liked: fbLiked,
                comment: fbComment,
            }, { headers: authHeader() });
            await fetchMyFeedback();
            setFeedbackModal(null);
        } catch (e) {
            const msg = e.response?.data?.message || 'Error submitting feedback';
            if (msg === 'Student not found') {
                alert('Session expired or student no longer exists. Please login again.');
                handleLogout();
            } else {
                alert(msg);
            }
        } finally { setFbSaving(false); }
    };

    // ── Mark notification as read ────────────────────────────────
    const markRead = async (id) => {
        await axios.patch(`${API_URL}/api/notifications/${id}/read`, {}, { headers: authHeader() });
        await fetchNotifications();
    };
    const markAllRead = async () => {
        await axios.patch(`${API_URL}/api/notifications/mark-all-read`, {}, { headers: authHeader() });
        await fetchNotifications();
    };

    // ── Submit complaint ─────────────────────────────────────────
    const submitComplaint = async (e) => {
        e.preventDefault();
        setCmpSubmitting(true);
        try {
            await axios.post(`${API_URL}/api/complaints`, cmpForm, { headers: authHeader() });
            setCmpSuccess(true);
            setCmpForm({ type: 'Complaint', category: 'Food', description: '' });
            await fetchComplaints();
            setTimeout(() => setCmpSuccess(false), 4000);
        } catch (err) {
            alert(err.response?.data?.message || 'Error submitting');
        } finally { setCmpSubmitting(false); }
    };

    if (!student) return null;

    return (
        <div className="min-h-screen bg-base transition-colors duration-300">

            {/* ── Header ───────────────────────────────────────── */}
            <header className="bg-gradient-to-r from-emerald-700 to-emerald-600 text-white px-6 py-4 flex items-center justify-between shadow-lg sticky top-0 z-40">
                <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
                        <GraduationCap size={20} />
                    </div>
                    <div>
                        <p className="text-emerald-200 text-xs font-medium">Hostel Food Management</p>
                        <p className="text-white text-base font-bold leading-tight">Student Portal</p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    {/* Notification Bell */}
                    <button
                        onClick={() => setActiveTab('notifications')}
                        className="relative w-9 h-9 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition"
                    >
                        <Bell size={18} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                                {unreadCount > 9 ? '9+' : unreadCount}
                            </span>
                        )}
                    </button>
                    <div className="hidden sm:block text-right">
                        <p className="text-emerald-200 text-xs">Welcome</p>
                        <p className="text-white font-semibold text-sm">{student.name}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-1.5 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl transition border border-white/20 text-sm"
                    >
                        <LogOut size={15} />
                        <span>Logout</span>
                    </button>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-5 py-6">

                {/* ── Profile Card ─────────────────────────────── */}
                <div className="bg-card rounded-2xl shadow-sm border border-base p-5 mb-6">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center">
                            <User size={22} className="text-emerald-600" />
                        </div>
                        <div>
                            <p className="font-black text-base text-lg">{student.name}</p>
                            <p className="text-sub text-sm">Roll No: <span className="font-mono font-semibold">{student.rollNo}</span></p>
                        </div>
                        <span className={`ml-auto inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${student.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${student.status === 'Active' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            {student.status}
                        </span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-sub">
                        <BedDouble size={14} className="text-emerald-500" />
                        <span>Room <strong className="text-base">{student.roomNo}</strong></span>
                    </div>
                </div>

                {/* ── Tab Navigation ────────────────────────────── */}
                <div className="flex space-x-2 mb-6 overflow-x-auto pb-1">
                    {[
                        { key: 'menu', label: '🍽️ Menu' },
                        { key: 'ratings', label: '⭐ Ratings' },
                        { key: 'notifications', label: `🔔 Notifs${unreadCount > 0 ? ` (${unreadCount})` : ''}` },
                        { key: 'payments', label: '💰 Fees' },
                        { key: 'complaints', label: '📝 Complaints' },
                    ].map(tab => (
                        <button key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`px-5 py-2.5 rounded-xl font-semibold text-sm whitespace-nowrap transition ${activeTab === tab.key
                                ? 'bg-emerald-600 text-white shadow-md'
                                : 'bg-card text-sub border border-base hover:bg-muted'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* ══════════════════════════════════════════════ */}
                {/* TAB 1 — MENU                                  */}
                {/* ══════════════════════════════════════════════ */}
                {activeTab === 'menu' && (
                    <div className="space-y-6">
                        <div className="bg-card rounded-2xl shadow-sm border border-base overflow-hidden">
                            {/* Header */}
                            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-9 h-9 bg-emerald-100 rounded-xl flex items-center justify-center">
                                        <CalendarDays size={18} className="text-emerald-600" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-base">Weekly Meal Menu</h2>
                                        <p className="text-xs text-muted">Click a meal card to rate it</p>
                                    </div>
                                </div>
                                <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">Today: {today}</span>
                            </div>

                            {/* Day tabs */}
                            <div className="flex overflow-x-auto border-b border-gray-100 bg-gray-50">
                                {DAYS.map(day => (
                                    <button key={day} onClick={() => setActiveDay(day)}
                                        className={`flex-shrink-0 px-4 py-3 text-sm font-semibold transition border-b-2 ${activeDay === day
                                            ? 'border-emerald-500 text-emerald-700 bg-card'
                                            : 'border-transparent text-muted hover:text-sub hover:bg-muted'
                                            }`}
                                    >
                                        {day}
                                        {day === today && <span className="ml-1 inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 mb-0.5" />}
                                    </button>
                                ))}
                            </div>

                            {/* Meal cards */}
                            <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-5">
                                {MEALS.map(mealType => {
                                    const meal = getMeal(activeDay, mealType);
                                    const myFb = getMyFb(activeDay, mealType);
                                    const cfg_ = mealCfg[mealType];
                                    const c_ = clr[cfg_.color];
                                    const MealIcon = cfg_.icon;
                                    return (
                                        <div key={mealType} className={`rounded-2xl border-2 ${c_.bg} ${c_.border} p-5 flex flex-col`}>
                                            {/* Meal header */}
                                            <div className="flex items-center justify-between mb-4">
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center shadow-sm">
                                                        <MealIcon size={16} className={c_.icon} />
                                                    </div>
                                                    <div>
                                                        <p className={`font-bold text-sm ${c_.text}`}>{mealType}</p>
                                                        <p className="text-xs text-muted">{cfg_.time}</p>
                                                    </div>
                                                </div>
                                                {activeDay === today && (
                                                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${c_.badge}`}>Today</span>
                                                )}
                                            </div>

                                            {/* Food items */}
                                            {meal ? (
                                                <>
                                                    <div className="flex-1 mb-3 space-y-1">
                                                        {meal.foodItems.split(',').map((item, i) => (
                                                            <div key={i} className="flex items-center space-x-2">
                                                                <ChevronRight size={12} className={`${c_.icon} flex-shrink-0`} />
                                                                <span className="text-base text-sm">{item.trim()}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {/* Feedback section */}
                                                    {myFb ? (
                                                        <div className="mt-auto pt-3 border-t border-gray-200">
                                                            <p className="text-xs text-muted mb-1">Your feedback:</p>
                                                            <div className="flex items-center justify-between">
                                                                <StarDisplay value={myFb.rating} />
                                                                <div className="flex items-center space-x-1">
                                                                    {myFb.liked === true && <span className="text-emerald-600">👍</span>}
                                                                    {myFb.liked === false && <span className="text-red-500">👎</span>}
                                                                    <button
                                                                        onClick={() => openFeedback(activeDay, mealType, meal.foodItems)}
                                                                        className="text-xs text-indigo-500 hover:underline"
                                                                    >Edit</button>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <button
                                                            onClick={() => openFeedback(activeDay, mealType, meal.foodItems)}
                                                            className={`mt-auto pt-3 border-t border-gray-200 w-full text-xs font-semibold ${c_.text} hover:opacity-70 transition text-left`}
                                                        >
                                                            ⭐ Rate this meal →
                                                        </button>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="flex-1 flex flex-col items-center justify-center py-4 opacity-40">
                                                    <Utensils size={22} className="mb-1" />
                                                    <p className="text-xs">Not set yet</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Full week table */}
                        <div className="bg-card rounded-2xl shadow-sm border border-base overflow-hidden">
                            <div className="px-5 py-4 border-b border-base">
                                <h3 className="font-bold text-base">📋 Full Week at a Glance</h3>
                                <p className="text-xs text-muted mt-0.5">Click any row to view that day in detail</p>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead><tr className="bg-subtle">
                                        <th className="px-4 py-3 text-left text-sub">Day</th>
                                        {MEALS.map(m => <th key={m} className="px-4 py-3 text-left text-sub">{m}</th>)}
                                    </tr></thead>
                                    <tbody>
                                        {DAYS.map((day, idx) => (
                                            <tr key={day} onClick={() => setActiveDay(day)}
                                                className={`border-t border-base cursor-pointer transition ${day === today ? 'bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30' :
                                                    idx % 2 === 0 ? 'hover:bg-subtle' : 'bg-subtle/50 hover:bg-subtle'
                                                    }`}
                                            >
                                                <td className="px-4 py-3 font-bold text-base whitespace-nowrap">
                                                    {day}
                                                    {day === today && <span className="ml-2 text-xs bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">Today</span>}
                                                </td>
                                                {MEALS.map(mealType => {
                                                    const meal = getMeal(day, mealType);
                                                    return (
                                                        <td key={mealType} className="px-4 py-3 text-sub max-w-xs">
                                                            {meal ? <span className="line-clamp-1">{meal.foodItems}</span> : <span className="text-muted">—</span>}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* ══════════════════════════════════════════════ */}
                {/* TAB 2 — RATINGS                               */}
                {/* ══════════════════════════════════════════════ */}
                {activeTab === 'ratings' && (
                    <div className="space-y-6">
                        <section>
                            <SectionHeading title="Today's Meal Feedback" icon={Star} />
                            <p className="text-xs text-gray-400 mb-4 ml-1">How was the food today? Share your thoughts!</p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                {MEALS.map(mealType => {
                                    const meal = allMenu.find(m => m.day === today && m.mealType === mealType);
                                    const myFb = getMyFb(today, mealType);
                                    if (!meal) return null;
                                    return (
                                        <Card key={mealType} className="border-2 border-emerald-50">
                                            <div className="flex justify-between items-start mb-3">
                                                <div>
                                                    <p className="font-bold text-base">{mealType}</p>
                                                    <p className="text-[10px] text-muted">{meal.foodItems}</p>
                                                </div>
                                                {myFb && <Badge variant="active" size="xs">Rated</Badge>}
                                            </div>
                                            {myFb ? (
                                                <div className="space-y-2">
                                                    <div className="flex items-center justify-between">
                                                        <StarDisplay value={myFb.rating} />
                                                        <span className="text-xs">{myFb.liked ? '👍' : '👎'}</span>
                                                    </div>
                                                    <Button variant="outline" size="sm" className="w-full text-xs h-8" onClick={() => openFeedback(today, mealType, meal.foodItems)}>Update Rating</Button>
                                                </div>
                                            ) : (
                                                <Button className="w-full h-8 text-xs" onClick={() => openFeedback(today, mealType, meal.foodItems)}>⭐ Rate Now</Button>
                                            )}
                                        </Card>
                                    );
                                })}
                            </div>
                        </section>

                        <section>
                            <SectionHeading title="Feedback History" icon={ClipboardList} />
                            <div className="bg-card rounded-2xl shadow-sm border border-base overflow-hidden mt-4">
                                {myFeedback.length === 0 ? (
                                    <div className="text-center py-12 text-muted">
                                        <Star size={32} className="mx-auto mb-2 opacity-30" />
                                        <p className="text-sm">No ratings given yet</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-base max-h-[400px] overflow-y-auto">
                                        {[...myFeedback].reverse().map(fb => (
                                            <div key={fb._id} className="p-4 hover:bg-subtle transition flex justify-between items-center">
                                                <div>
                                                    <p className="font-bold text-sm text-base">{fb.day} {fb.mealType}</p>
                                                    <p className="text-xs text-muted">{new Date(fb.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <div className="text-right">
                                                    <StarDisplay value={fb.rating} />
                                                    {fb.comment && <p className="text-[10px] text-gray-500 italic truncate max-w-[150px] mt-1">"{fb.comment}"</p>}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </section>
                    </div>
                )}
                {activeTab === 'notifications' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-base">
                                Notifications
                                {unreadCount > 0 && (
                                    <span className="ml-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">{unreadCount} new</span>
                                )}
                            </h2>
                            {unreadCount > 0 && (
                                <button onClick={markAllRead} className="text-sm text-emerald-600 hover:text-emerald-800 font-semibold">
                                    ✓ Mark all as read
                                </button>
                            )}
                        </div>

                        {notifications.length === 0 ? (
                            <div className="text-center py-20 text-muted">
                                <Bell size={48} className="mx-auto mb-3" />
                                <p className="font-medium">No notifications yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {notifications.map(n => {
                                    const nc = NOTIF_CFG[n.type] || NOTIF_CFG['Info'];
                                    const NIcon = nc.icon;
                                    return (
                                        <div key={n._id}
                                            className={`rounded-2xl border-2 p-4 transition ${nc.bg} ${nc.border} ${!n.isRead ? 'shadow-md' : 'opacity-70'}`}
                                        >
                                            <div className="flex items-start justify-between gap-3">
                                                <div className="flex items-start space-x-3 flex-1">
                                                    {!n.isRead && <span className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-red-500`} />}
                                                    <NIcon size={18} className={`${nc.text} mt-0.5 flex-shrink-0`} />
                                                    <div className="flex-1">
                                                        <div className="flex items-center flex-wrap gap-2">
                                                            <p className={`font-bold ${nc.text}`}>{n.title}</p>
                                                            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${nc.badge}`}>{n.type}</span>
                                                        </div>
                                                        <p className="text-sm text-base mt-1">{n.message}</p>
                                                        <p className="text-xs text-muted mt-1.5">
                                                            {new Date(n.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </p>
                                                    </div>
                                                </div>
                                                {!n.isRead && (
                                                    <button
                                                        onClick={() => markRead(n._id)}
                                                        className="flex-shrink-0 text-xs bg-card hover:bg-muted text-sub px-3 py-1.5 rounded-lg border border-base transition font-medium"
                                                    >
                                                        Mark read
                                                    </button>
                                                )}
                                                {n.isRead && <CheckCircle size={16} className="text-emerald-500 flex-shrink-0 mt-0.5" />}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* ══════════════════════════════════════════════ */}
                {/* TAB 3 — PAYMENTS                            */}
                {/* ══════════════════════════════════════════════ */}
                {activeTab === 'payments' && (
                    <div className="space-y-6">
                        <div className="bg-card rounded-2xl shadow-sm border border-base overflow-hidden">
                            <div className="px-5 py-4 border-b border-base flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center">
                                        <Wallet size={18} className="text-indigo-600" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-base">My Fee Payments</h2>
                                        <p className="text-xs text-muted">History of your mess fee payments</p>
                                    </div>
                                </div>
                            </div>

                            {payments.length === 0 ? (
                                <div className="text-center py-20 text-muted">
                                    <IndianRupee size={48} className="mx-auto mb-3" />
                                    <p className="font-medium">No payment history found</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead><tr className="bg-subtle border-b border-base">
                                            <th className="px-5 py-3 text-left font-bold text-sub">Period</th>
                                            <th className="px-5 py-3 text-left font-bold text-sub">Amount</th>
                                            <th className="px-5 py-3 text-left font-bold text-sub">Method</th>
                                            <th className="px-5 py-3 text-left font-bold text-sub">Status</th>
                                            <th className="px-5 py-3 text-left font-bold text-sub">Date</th>
                                            <th className="px-5 py-3 text-center font-bold text-sub">Action</th>
                                        </tr></thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {payments.map(p => (
                                                <tr key={p._id} className="hover:bg-subtle/50">
                                                    <td className="px-5 py-4 font-bold text-base">{p.month} {p.year}</td>
                                                    <td className="px-5 py-4 font-black">₹{p.amount.toLocaleString()}</td>
                                                    <td className="px-5 py-4 text-sub"><span className="bg-muted px-2 py-0.5 rounded text-xs">{p.method}</span></td>
                                                    <td className="px-5 py-4">
                                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${p.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' :
                                                            p.status === 'Partial' ? 'bg-amber-100 text-amber-700' :
                                                                'bg-red-100 text-red-700'
                                                            }`}>
                                                            {p.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-4 text-muted text-xs">{new Date(p.paymentDate).toLocaleDateString()}</td>
                                                    <td className="px-5 py-4 text-center">
                                                        <button
                                                            onClick={() => exportReceipt(p)}
                                                            className="inline-flex items-center space-x-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 px-3 py-1.5 rounded-lg transition text-xs font-bold"
                                                        >
                                                            <Download size={14} />
                                                            <span>Receipt</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ══════════════════════════════════════════════ */}
                {/* TAB 4 — COMPLAINTS                            */}
                {/* ══════════════════════════════════════════════ */}
                {activeTab === 'complaints' && (
                    <div className="space-y-6">
                        {/* Submit form */}
                        <div className="bg-card rounded-2xl shadow-sm border border-base p-6">
                            <h2 className="font-bold text-base mb-4">➕ Submit Complaint / Suggestion</h2>

                            {cmpSuccess && (
                                <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl p-4 flex items-center space-x-2">
                                    <CheckCircle size={18} />
                                    <span className="text-sm font-medium">Submitted successfully! Admin will respond soon.</span>
                                </div>
                            )}

                            <form onSubmit={submitComplaint} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                                        <select
                                            value={cmpForm.type} onChange={e => setCmpForm(f => ({ ...f, type: e.target.value }))}
                                            className="w-full px-3 py-2 border border-base rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 text-base"
                                        >
                                            <option>Complaint</option>
                                            <option>Suggestion</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                                        <select
                                            value={cmpForm.category} onChange={e => setCmpForm(f => ({ ...f, category: e.target.value }))}
                                            className="w-full px-3 py-2 border border-base rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 text-base"
                                        >
                                            <option>Food</option>
                                            <option>Cleanliness</option>
                                            <option>Maintenance</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-sub mb-1">Description *</label>
                                    <textarea
                                        rows={4} required minLength={10} maxLength={1000}
                                        value={cmpForm.description} onChange={e => setCmpForm(f => ({ ...f, description: e.target.value }))}
                                        placeholder="Describe your complaint or suggestion in detail (min 10 characters)..."
                                        className="w-full px-4 py-3 border border-base rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none text-base"
                                    />
                                    <p className="text-xs text-muted mt-1">{cmpForm.description.length}/1000</p>
                                </div>
                                <button type="submit" disabled={cmpSubmitting}
                                    className="flex items-center bg-emerald-600 text-white px-6 py-2.5 rounded-xl hover:bg-emerald-700 disabled:opacity-60 transition font-semibold"
                                >
                                    <Send size={15} className="mr-2" />
                                    {cmpSubmitting ? 'Submitting...' : 'Submit'}
                                </button>
                            </form>
                        </div>

                        {/* My complaints list */}
                        <div className="bg-card rounded-2xl shadow-sm border border-base overflow-hidden">
                            <div className="px-5 py-4 border-b border-base">
                                <h2 className="font-bold text-base">📋 My Complaints / Suggestions</h2>
                            </div>
                            {complaints.length === 0 ? (
                                <div className="text-center py-12 text-muted">
                                    <ClipboardList size={40} className="mx-auto mb-2" />
                                    <p>No submissions yet</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {complaints.map(c => {
                                        const sc = STATUS_CFG[c.status];
                                        const SIcon = sc.icon;
                                        return (
                                            <div key={c._id} className="px-5 py-4">
                                                <div className="flex items-start justify-between mb-2">
                                                    <div>
                                                        <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                                                            <span className="font-semibold text-sm text-base">{c.type} — {c.category}</span>
                                                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex items-center ${sc.color}`}>
                                                                <span className={`w-1.5 h-1.5 rounded-full mr-1 ${sc.dot}`} />
                                                                {c.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-muted mt-0.5">{new Date(c.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-sub">{c.description}</p>
                                                {c.adminResponse && (
                                                    <div className="mt-3 bg-indigo-50 border border-indigo-100 rounded-xl p-3">
                                                        <p className="text-xs font-bold text-indigo-600 mb-1">🛡️ Admin Response:</p>
                                                        <p className="text-sm text-indigo-800">{c.adminResponse}</p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Feedback Modal ────────────────────────────────── */}
            {feedbackModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-card rounded-2xl w-full max-w-md p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-5">
                            <div>
                                <h2 className="text-lg font-bold text-base">Rate this Meal</h2>
                                <p className="text-sm text-muted">{feedbackModal.day} — {feedbackModal.mealType}</p>
                            </div>
                            <button onClick={() => setFeedbackModal(null)} className="text-gray-400 hover:text-gray-600">
                                <X size={20} />
                            </button>
                        </div>

                        <p className="text-sm text-sub mb-4 bg-muted rounded-xl p-3">{feedbackModal.foodItems}</p>

                        {/* Star rating */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-sub mb-2">Overall Rating *</label>
                            <StarPicker value={fbRating} onChange={setFbRating} />
                        </div>

                        {/* Like / Dislike */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-sub mb-2">Reaction</label>
                            <div className="flex space-x-3">
                                <button
                                    onClick={() => setFbLiked(fbLiked === true ? null : true)}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl border-2 text-sm font-semibold transition ${fbLiked === true ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-gray-200 hover:border-emerald-300'}`}
                                >
                                    <ThumbsUp size={16} /> <span>Liked it</span>
                                </button>
                                <button
                                    onClick={() => setFbLiked(fbLiked === false ? null : false)}
                                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl border-2 text-sm font-semibold transition ${fbLiked === false ? 'border-red-400 bg-red-50 text-red-600' : 'border-base hover:border-red-300'}`}
                                >
                                    <ThumbsDown size={16} /> <span>Didn't like</span>
                                </button>
                            </div>
                        </div>

                        {/* Comment */}
                        <div className="mb-5">
                            <label className="block text-sm font-medium text-sub mb-2">Comment (optional)</label>
                            <textarea
                                rows={3} maxLength={500}
                                value={fbComment} onChange={e => setFbComment(e.target.value)}
                                placeholder="Any specific feedback about this meal?"
                                className="w-full px-4 py-2 border border-base rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 resize-none bg-card text-base"
                            />
                            <p className="text-xs text-muted mt-1">{fbComment.length}/500</p>
                        </div>

                        <div className="flex space-x-3">
                            <button onClick={() => setFeedbackModal(null)}
                                className="flex-1 border border-base rounded-xl py-2.5 font-medium hover:bg-muted transition text-sm text-sub">
                                Cancel
                            </button>
                            <button onClick={submitFeedback} disabled={fbSaving || !fbRating}
                                className="flex-1 bg-emerald-600 text-white rounded-xl py-2.5 font-bold hover:bg-emerald-700 disabled:opacity-50 transition text-sm">
                                {fbSaving ? 'Submitting...' : '⭐ Submit Feedback'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDashboard;

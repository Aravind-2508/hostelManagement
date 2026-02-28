import API_URL from '../config/api';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useToast } from '../components/ui/Toast';
import {
    User, Lock, Moon, Sun, Bell, Shield,
    Save, ArrowLeft, Eye, EyeOff
} from 'lucide-react';
import { Card, Button, Input, PageHeader, SectionHeading } from '../components/ui/Components';

const SettingsPage = () => {
    const { admin, updateAdmin } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const { toast } = useToast();
    const navigate = useNavigate();
    const [savingProfile, setSavingProfile] = useState(false);
    const [savingPw, setSavingPw] = useState(false);

    // Profile form state
    const [profileForm, setProfileForm] = useState({
        name: admin?.name || '',
        email: admin?.email || '',
    });

    // Password form state
    const [pwForm, setPwForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });

    // Notification preferences state
    const [notifPrefs, setNotifPrefs] = useState({
        stockAlerts: true,
        expenseNotifications: true,
        menuReminders: false,
        weeklyReports: true,
    });

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        if (!profileForm.name.trim()) {
            toast('Name cannot be empty', 'error');
            return;
        }
        setSavingProfile(true);
        try {
            const cfg = { headers: { Authorization: `Bearer ${admin.token}` } };
            const { data } = await axios.put(
                `${API_URL}/api/admin/profile`,
                { name: profileForm.name.trim(), email: profileForm.email.trim() },
                cfg
            );
            updateAdmin(data);          // ← updates sidebar/topbar/dropdown instantly
            toast('Profile updated successfully!', 'success');
        } catch (err) {
            toast(err.response?.data?.message || 'Failed to update profile', 'error');
        } finally {
            setSavingProfile(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (pwForm.newPassword !== pwForm.confirmPassword) {
            toast('New passwords do not match', 'error');
            return;
        }
        if (pwForm.newPassword.length < 6) {
            toast('Password must be at least 6 characters', 'error');
            return;
        }
        setSavingPw(true);
        try {
            const cfg = { headers: { Authorization: `Bearer ${admin.token}` } };
            await axios.put(
                `${API_URL}/api/admin/change-password`,
                { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword },
                cfg
            );
            toast('Password changed successfully!', 'success');
            setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            toast(err.response?.data?.message || 'Failed to change password', 'error');
        } finally {
            setSavingPw(false);
        }
    };

    const handleSaveNotifications = () => {
        toast('Notification preferences saved!', 'success');
    };

    return (
        <div className="space-y-6 max-w-2xl">
            <PageHeader
                title="Account Settings"
                subtitle="Manage your profile, security, and preferences"
                action={
                    <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate(-1)}>
                        Go Back
                    </Button>
                }
            />

            {/* ── Profile Information ── */}
            <Card>
                <SectionHeading icon={User} title="Profile Information" />
                <form onSubmit={handleSaveProfile} className="space-y-4 mt-4">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-400 to-violet-600 flex items-center justify-center text-white text-2xl font-black shadow-lg">
                            {profileForm.name?.[0]?.toUpperCase() || 'A'}
                        </div>
                        <div>
                            <p className="font-bold text-base">{profileForm.name || 'Admin'}</p>
                            <p className="text-sm text-sub">{profileForm.email}</p>
                            <div className="flex items-center gap-1 mt-1">
                                <Shield size={12} className="text-emerald-500" />
                                <span className="text-xs text-emerald-600 font-medium">Administrator</span>
                            </div>
                        </div>
                    </div>
                    <Input
                        label="Full Name"
                        value={profileForm.name}
                        onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                        placeholder="Super Admin"
                    />
                    <Input
                        label="Email Address"
                        type="email"
                        value={profileForm.email}
                        onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                        placeholder="admin@hostel.com"
                    />
                    <div className="pt-2">
                        <Button type="submit" icon={Save} disabled={savingProfile}>
                            {savingProfile ? 'Saving...' : 'Save Profile'}
                        </Button>
                    </div>
                </form>
            </Card>

            {/* ── Change Password ── */}
            <Card>
                <SectionHeading icon={Lock} title="Change Password" />
                <form onSubmit={handleChangePassword} className="space-y-4 mt-4">
                    {[
                        { key: 'current', label: 'Current Password', field: 'currentPassword' },
                        { key: 'new', label: 'New Password', field: 'newPassword' },
                        { key: 'confirm', label: 'Confirm New Password', field: 'confirmPassword' },
                    ].map(({ key, label, field }) => (
                        <div key={key}>
                            <label className="block text-sm font-medium text-sub mb-1.5">{label}</label>
                            <div className="relative">
                                <input
                                    type={showPw[key] ? 'text' : 'password'}
                                    className="input-premium pr-11"
                                    placeholder="••••••••"
                                    value={pwForm[field]}
                                    onChange={(e) => setPwForm({ ...pwForm, [field]: e.target.value })}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPw(p => ({ ...p, [key]: !p[key] }))}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-sub transition"
                                >
                                    {showPw[key] ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                    ))}
                    <div className="pt-2">
                        <Button type="submit" icon={Save} disabled={savingPw}>
                            {savingPw ? 'Updating...' : 'Update Password'}
                        </Button>
                    </div>
                </form>
            </Card>

            {/* ── Appearance ── */}
            <Card>
                <SectionHeading icon={isDark ? Moon : Sun} title="Appearance" />
                <div className="mt-4 flex items-center justify-between p-4 rounded-xl bg-subtle border border-base">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${isDark ? 'bg-indigo-100' : 'bg-amber-100'}`}>
                            {isDark ? <Moon size={18} className="text-indigo-600" /> : <Sun size={18} className="text-amber-600" />}
                        </div>
                        <div>
                            <p className="font-semibold text-base text-sm">
                                {isDark ? 'Dark Mode' : 'Light Mode'}
                            </p>
                            <p className="text-xs text-sub">Current theme preference</p>
                        </div>
                    </div>
                    <button
                        onClick={toggleTheme}
                        className={`relative w-12 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 ${isDark ? 'bg-indigo-600' : 'bg-slate-300'
                            }`}
                        role="switch"
                        aria-checked={isDark}
                        aria-label="Toggle dark mode"
                    >
                        <span
                            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${isDark ? 'translate-x-6' : 'translate-x-0'
                                }`}
                        />
                    </button>
                </div>
            </Card>

            {/* ── Notifications ── */}
            <Card>
                <SectionHeading icon={Bell} title="Notification Preferences" />
                <div className="mt-4 space-y-3">
                    {Object.entries(notifPrefs).map(([key, val]) => {
                        const labels = {
                            stockAlerts: { label: 'Stock alerts', desc: 'Get notified when grocery stock is low' },
                            expenseNotifications: { label: 'Expense notifications', desc: 'Alerts when expenses are logged' },
                            menuReminders: { label: 'Menu reminders', desc: 'Daily reminder to set upcoming meals' },
                            weeklyReports: { label: 'Weekly reports', desc: 'Summary report every Monday morning' },
                        };
                        const item = labels[key];
                        return (
                            <div key={key} className="flex items-center justify-between p-4 rounded-xl bg-subtle border border-base">
                                <div>
                                    <p className="text-sm font-semibold text-base">{item.label}</p>
                                    <p className="text-xs text-sub">{item.desc}</p>
                                </div>
                                <button
                                    onClick={() => setNotifPrefs(p => ({ ...p, [key]: !p[key] }))}
                                    className={`relative w-11 h-6 rounded-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 ${val ? 'bg-indigo-600' : 'bg-muted'
                                        }`}
                                    role="switch"
                                    aria-checked={val}
                                >
                                    <span
                                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform duration-300 ${val ? 'translate-x-5' : 'translate-x-0'
                                            }`}
                                    />
                                </button>
                            </div>
                        );
                    })}
                </div>
                <div className="mt-4">
                    <Button icon={Save} onClick={handleSaveNotifications}>Save Preferences</Button>
                </div>
            </Card>
        </div>
    );
};

export default SettingsPage;

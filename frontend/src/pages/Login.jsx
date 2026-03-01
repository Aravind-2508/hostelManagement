import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const result = await login(email, password);
            if (result.success) {
                navigate('/');
            } else {
                setError(result.message);
            }
        } catch {
            setError('Something went wrong. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-slate-950">
            {/* Left decorative panel */}
            <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative overflow-hidden flex-col justify-between p-12">
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-violet-900 to-purple-950" />
                {/* Decorative orbs */}
                <div className="absolute top-1/4 -left-20 w-72 h-72 rounded-full bg-indigo-600/30 blur-3xl" />
                <div className="absolute bottom-1/4 right-10 w-80 h-80 rounded-full bg-violet-600/20 blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-purple-700/15 blur-3xl" />

                {/* Logo */}
                <div className="relative flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 flex items-center justify-center shadow-xl">
                        <Sparkles size={20} className="text-white" />
                    </div>
                    <div>
                        <p className="text-white font-bold text-lg leading-tight">Hostel Food Pro</p>
                        <p className="text-indigo-300 text-xs">v2.0 Admin Dashboard</p>
                    </div>
                </div>

                {/* Hero copy */}
                <div className="relative">
                    <div className="mb-6">
                        <span className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
                            <ShieldCheck size={12} /> Secure Admin Access
                        </span>
                    </div>
                    <h1 className="text-5xl font-black text-white leading-tight mb-6">
                        Smart Hostel<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 to-violet-300">
                            Food Management
                        </span>
                    </h1>
                    <p className="text-indigo-200 text-lg leading-relaxed max-w-lg">
                        Streamline meal planning, track groceries, manage students, and analyze expenses — all from one powerful dashboard.
                    </p>

                    <div className="mt-10 grid grid-cols-3 gap-4">
                        {[
                            { label: 'Active Students', value: '200+' },
                            { label: 'Meals Planned', value: '21/wk' },
                            { label: 'Cost Savings', value: '18%' },
                        ].map((stat) => (
                            <div key={stat.label} className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center backdrop-blur-sm">
                                <p className="text-2xl font-black text-white">{stat.value}</p>
                                <p className="text-xs text-indigo-300 mt-1 font-medium">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <p className="relative text-slate-600 text-xs">
                    © 2026 Hostel Food Pro. All rights reserved.
                </p>
            </div>

            {/* Right login form */}
            <div className="flex-1 flex items-center justify-center p-6 bg-base">
                <div className="w-full max-w-md">
                    {/* Mobile logo */}
                    <div className="lg:hidden flex items-center gap-2 mb-10">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                            <Sparkles size={16} className="text-white" />
                        </div>
                        <p className="text-base font-bold">Hostel Food Pro</p>
                    </div>

                    <div className="mb-10">
                        <h2 className="text-3xl font-black text-base mb-2">
                            Welcome back
                        </h2>
                        <p className="text-sub">
                            Sign in to your admin dashboard
                        </p>
                    </div>

                    {error && (
                        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm flex items-center gap-2 animate-fadeInUp">
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-semibold text-sub mb-2">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-premium"
                                placeholder="admin@hostel.com"
                                required
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-semibold text-sub">Password</label>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input-premium pr-12"
                                    placeholder="••••••••"
                                    required
                                    disabled={loading}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary py-3.5 text-base font-bold flex items-center justify-center gap-2 mt-2 disabled:opacity-60"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.4 0 0 5.4 0 12h4z" /></svg>
                                    Signing in...
                                </span>
                            ) : (
                                <>Sign In <ArrowRight size={18} /></>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-base text-center">
                        <p className="text-sm text-sub">
                            Are you a student?{' '}
                            <Link
                                to="/student-login"
                                className="text-indigo-600 font-semibold hover:text-indigo-800 transition"
                            >
                                Student Login →
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;

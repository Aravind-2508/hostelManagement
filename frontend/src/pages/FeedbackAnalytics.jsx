import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Star, ThumbsUp, ThumbsDown, MessageSquare, TrendingUp, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const MEALS = ['Breakfast', 'Lunch', 'Dinner'];
const COLORS = { Breakfast: '#f59e0b', Lunch: '#10b981', Dinner: '#6366f1' };

const StarDisplay = ({ value }) => (
    <div className="flex space-x-0.5">
        {[1, 2, 3, 4, 5].map(s => (
            <span key={s} className={`text-sm ${s <= Math.round(value) ? 'text-amber-400' : 'text-gray-200'}`}>★</span>
        ))}
    </div>
);

const FeedbackAnalytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [allFeedback, setAllFeedback] = useState([]);
    const [filter, setFilter] = useState({ day: '', mealType: '' });
    const [loading, setLoading] = useState(true);
    const { admin } = useAuth();

    const cfg = { headers: { Authorization: `Bearer ${admin.token}` } };

    const fetchAnalytics = async () => {
        try {
            const { data } = await axios.get('http://localhost:5000/api/feedback/analytics', cfg);
            setAnalytics(data);
        } catch (e) { console.error(e); }
    };

    const fetchFeedback = async () => {
        try {
            const params = new URLSearchParams();
            if (filter.day) params.append('day', filter.day);
            if (filter.mealType) params.append('mealType', filter.mealType);
            const { data } = await axios.get(`http://localhost:5000/api/feedback?${params}`, cfg);
            setAllFeedback(data);
        } catch (e) { console.error(e); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAnalytics(); }, []);
    useEffect(() => { fetchFeedback(); }, [filter]);

    // Build chart data — avg rating per day
    const chartData = DAYS.map(day => {
        const meals = {};
        MEALS.forEach(meal => {
            const entry = analytics?.perMeal?.find(p => p._id.day === day && p._id.mealType === meal);
            meals[meal] = entry ? parseFloat(entry.avgRating.toFixed(2)) : 0;
        });
        return { day: day.slice(0, 3), ...meals };
    });

    const overall = analytics?.overall || {};

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">📊 Meal Feedback Analytics</h1>

            {/* ── Stats cards ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: 'Total Feedback', value: overall.totalFeedback || 0, icon: MessageSquare, color: 'indigo' },
                    { label: 'Avg Rating', value: (overall.avgRating || 0).toFixed(1), icon: Star, color: 'amber' },
                    { label: 'Total Likes', value: overall.totalLikes || 0, icon: ThumbsUp, color: 'emerald' },
                    { label: 'Total Dislikes', value: overall.totalDislikes || 0, icon: ThumbsDown, color: 'red' },
                ].map(card => {
                    const colorMap = {
                        indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
                        amber: 'bg-amber-50 text-amber-600 border-amber-100',
                        emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
                        red: 'bg-red-50 text-red-600 border-red-100',
                    };
                    return (
                        <div key={card.label} className={`rounded-2xl border p-5 ${colorMap[card.color]}`}>
                            <card.icon size={22} className="mb-3 opacity-70" />
                            <p className="text-2xl font-bold">{card.value}</p>
                            <p className="text-sm font-medium opacity-70 mt-0.5">{card.label}</p>
                        </div>
                    );
                })}
            </div>

            {/* ── Rating chart ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-8">
                <h2 className="font-bold text-gray-700 mb-4 flex items-center">
                    <TrendingUp size={18} className="mr-2 text-indigo-500" />
                    Average Rating by Day & Meal
                </h2>
                <ResponsiveContainer width="100%" height={260}>
                    <BarChart data={chartData} barGap={4}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                        <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
                        <Tooltip formatter={(v) => v ? `${v} ★` : 'No data'} />
                        {MEALS.map(m => (
                            <Bar key={m} dataKey={m} fill={COLORS[m]} radius={[4, 4, 0, 0]} name={m} />
                        ))}
                    </BarChart>
                </ResponsiveContainer>
                <div className="flex space-x-4 mt-2 justify-center">
                    {MEALS.map(m => (
                        <span key={m} className="flex items-center text-xs text-gray-500">
                            <span className="w-3 h-3 rounded-full mr-1" style={{ background: COLORS[m] }} />
                            {m}
                        </span>
                    ))}
                </div>
            </div>

            {/* ── Top / Bottom meals ── */}
            {analytics?.perMeal?.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h2 className="font-bold text-gray-700 mb-4 flex items-center">
                            <Award size={18} className="mr-2 text-amber-500" /> Top Rated Meals
                        </h2>
                        {analytics.perMeal.slice(0, 5).map((m, i) => (
                            <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                <div>
                                    <p className="font-semibold text-gray-800 text-sm">{m._id.day} — {m._id.mealType}</p>
                                    <p className="text-xs text-gray-400">{m.totalCount} ratings · {m.likeCount} 👍 {m.dislikeCount} 👎</p>
                                </div>
                                <div className="text-right">
                                    <StarDisplay value={m.avgRating} />
                                    <p className="text-xs text-gray-500 mt-0.5">{m.avgRating.toFixed(2)}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h2 className="font-bold text-gray-700 mb-4">💬 Recent Comments</h2>
                        {(analytics.recentComments || []).slice(0, 6).map((c, i) => (
                            <div key={i} className="py-2 border-b border-gray-50 last:border-0">
                                <div className="flex justify-between items-start">
                                    <p className="text-sm font-semibold text-gray-700">{c.student?.name} ({c.student?.rollNo})</p>
                                    <StarDisplay value={c.rating} />
                                </div>
                                <p className="text-xs text-gray-400 mb-1">{c.day} · {c.mealType}</p>
                                <p className="text-sm text-gray-600 italic">"{c.comment}"</p>
                            </div>
                        ))}
                        {!(analytics.recentComments?.length) && (
                            <p className="text-gray-400 text-sm text-center py-6">No comments yet</p>
                        )}
                    </div>
                </div>
            )}

            {/* ── Raw feedback table ── */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-gray-100 flex flex-wrap gap-3 items-center">
                    <h2 className="font-bold text-gray-700 flex-1">All Feedback</h2>
                    <select
                        value={filter.day}
                        onChange={e => setFilter(f => ({ ...f, day: e.target.value }))}
                        className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none"
                    >
                        <option value="">All Days</option>
                        {DAYS.map(d => <option key={d}>{d}</option>)}
                    </select>
                    <select
                        value={filter.mealType}
                        onChange={e => setFilter(f => ({ ...f, mealType: e.target.value }))}
                        className="text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none"
                    >
                        <option value="">All Meals</option>
                        {MEALS.map(m => <option key={m}>{m}</option>)}
                    </select>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="px-5 py-3 text-left">Student</th>
                                <th className="px-5 py-3 text-left">Day</th>
                                <th className="px-5 py-3 text-left">Meal</th>
                                <th className="px-5 py-3 text-left">Rating</th>
                                <th className="px-5 py-3 text-left">Like</th>
                                <th className="px-5 py-3 text-left">Comment</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allFeedback.length === 0 ? (
                                <tr><td colSpan={6} className="text-center py-10 text-gray-400">No feedback yet</td></tr>
                            ) : allFeedback.map(f => (
                                <tr key={f._id} className="border-t border-gray-50 hover:bg-gray-50">
                                    <td className="px-5 py-3 font-medium">{f.student?.name} <span className="text-gray-400 text-xs">({f.student?.rollNo})</span></td>
                                    <td className="px-5 py-3">{f.day}</td>
                                    <td className="px-5 py-3">{f.mealType}</td>
                                    <td className="px-5 py-3"><StarDisplay value={f.rating} /></td>
                                    <td className="px-5 py-3">
                                        {f.liked === true ? '👍' : f.liked === false ? '👎' : '—'}
                                    </td>
                                    <td className="px-5 py-3 text-gray-500 italic max-w-xs truncate">{f.comment || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default FeedbackAnalytics;

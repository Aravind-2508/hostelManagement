import API_URL from '../config/api';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    Star, ThumbsUp, ThumbsDown, MessageSquare,
    Calendar, TrendingUp, TrendingDown, Users,
    Coffee, Sun, Moon, Info
} from 'lucide-react';
import {
    Card, Badge, PageHeader, SectionHeading, EmptyState
} from '../components/ui/Components';

const StarDisplay = ({ value }) => (
    <span className="flex">
        {[1, 2, 3, 4, 5].map(s => (
            <Star key={s} size={14} className={s <= Math.round(value) ? 'fill-amber-400 text-amber-400' : 'text-gray-200'} />
        ))}
    </span>
);

const mealIcons = { Coffee, Sun, Moon };

const MealRatings = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const { admin } = useAuth();

    const fetchAnalytics = useCallback(async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${admin.token}` } };
            const { data } = await axios.get(`${API_URL}/api/feedback/analytics`, config);
            setData(data);
        } catch (error) {
            console.error('Error loading analytics:', error);
        } finally {
            setLoading(false);
        }
    }, [admin.token]);

    useEffect(() => { fetchAnalytics(); }, [fetchAnalytics]);

    if (loading) return <div className="p-8 text-center text-sub">Loading feedback data...</div>;
    if (!data) return <EmptyState icon={Star} title="No analytics data" description="Start collecting feedback from students." />;

    const { perMeal, overall, recentComments } = data;

    // Sort perMeal by day (order: Mon, Tue, etc.)
    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const sortedMeals = [...perMeal].sort((a, b) => {
        const d1 = dayOrder.indexOf(a._id.day);
        const d2 = dayOrder.indexOf(b._id.day);
        if (d1 !== d2) return d1 - d2;
        const mealOrders = { Breakfast: 0, Lunch: 1, Dinner: 2 };
        return mealOrders[a._id.mealType] - mealOrders[b._id.mealType];
    });

    const bestMeals = [...perMeal].filter(m => m.avgRating >= 4).sort((a, b) => b.avgRating - a.avgRating).slice(0, 3);
    const worstMeals = [...perMeal].filter(m => m.avgRating <= 3).sort((a, b) => a.avgRating - b.avgRating).slice(0, 3);

    return (
        <div className="space-y-6">
            <PageHeader
                title="Meal Feedback Analytics"
                subtitle="Analyze student satisfaction and meal ratings"
            />

            {/* Overall KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
                {[
                    { label: 'Avg Rating', value: overall.avgRating?.toFixed(1) || '0.0', icon: Star, color: 'amber' },
                    { label: 'Total Feedback', value: overall.totalFeedback, icon: MessageSquare, color: 'indigo' },
                    { label: 'Total Likes', value: overall.totalLikes, icon: ThumbsUp, color: 'emerald' },
                    { label: 'Total Dislikes', value: overall.totalDislikes, icon: ThumbsDown, color: 'red' },
                ].map((kpi, i) => (
                    <Card key={i} className="flex flex-col gap-1">
                        <div className={`w-10 h-10 rounded-xl bg-${kpi.color}-50 text-${kpi.color}-600 flex items-center justify-center mb-2`}>
                            <kpi.icon size={20} />
                        </div>
                        <p className="text-sm text-sub font-medium">{kpi.label}</p>
                        <p className="text-2xl font-black text-base">{kpi.value}</p>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Popular vs Needs Improvement */}
                <Card>
                    <SectionHeading title="Top Rated Meals" icon={TrendingUp} />
                    <div className="space-y-4 mt-4">
                        {bestMeals.length === 0 ? <p className="text-sm text-muted">No high-rated meals yet.</p> : bestMeals.map((m, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                                <div>
                                    <p className="font-bold text-emerald-900">{m._id.day} {m._id.mealType}</p>
                                    <p className="text-xs text-emerald-600">{m.totalCount} ratings · {Math.round((m.likeCount / m.totalCount) * 100)}% liked it</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-lg font-black text-emerald-700">{m.avgRating.toFixed(1)} ⭐</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8">
                        <SectionHeading title="Needs Improvement" icon={TrendingDown} color="text-red-500" />
                        <div className="space-y-4 mt-4">
                            {worstMeals.length === 0 ? <p className="text-sm text-muted">No low-rated meals yet.</p> : worstMeals.map((m, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-red-50/50 rounded-xl border border-red-100">
                                    <div>
                                        <p className="font-bold text-red-900">{m._id.day} {m._id.mealType}</p>
                                        <p className="text-xs text-red-600">{m.totalCount} ratings · {Math.round((m.dislikeCount / m.totalCount) * 100)}% disliked it</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black text-red-700">{m.avgRating.toFixed(1)} ⭐</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Card>

                {/* Recent Student Comments */}
                <Card>
                    <SectionHeading title="Student Voice" icon={MessageSquare} />
                    <div className="space-y-4 mt-4 h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {recentComments.length === 0 ? <EmptyState icon={Info} title="No comments" description="Student haven't left any remarks yet." /> :
                            recentComments.map((c, i) => (
                                <div key={i} className="p-4 bg-muted rounded-2xl border border-base">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="font-bold text-sm text-base">{c.student.name}</p>
                                            <p className="text-xs text-muted">Roll: {c.student.rollNo} · {c.day} {c.mealType}</p>
                                        </div>
                                        <StarDisplay value={c.rating} />
                                    </div>
                                    <p className="text-sm text-sub bg-white dark:bg-slate-800 p-2 rounded-lg italic">"{c.comment}"</p>
                                    <p className="text-[10px] text-muted text-right mt-1">{new Date(c.createdAt).toLocaleDateString()}</p>
                                </div>
                            ))}
                    </div>
                </Card>
            </div>

            {/* Complete Menu Analytics Table */}
            <Card padding={false}>
                <div className="px-6 py-4 border-b border-base">
                    <SectionHeading title="Complete Feedback Log" icon={Calendar} />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-subtle border-b border-base">
                                <th className="px-6 py-4 text-xs font-bold text-sub uppercase">Day / Meal</th>
                                <th className="px-6 py-4 text-xs font-bold text-sub uppercase">Avg Rating</th>
                                <th className="px-6 py-4 text-xs font-bold text-sub uppercase">Total Ratings</th>
                                <th className="px-6 py-4 text-xs font-bold text-sub uppercase">Pos / Neg</th>
                                <th className="px-6 py-4 text-xs font-bold text-sub uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-subtle">
                            {sortedMeals.map((m, i) => {
                                const MealIcon = mealIcons[m._id.mealType] || Coffee;
                                return (
                                    <tr key={i} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-base flex items-center justify-center text-indigo-500 shadow-sm border border-base">
                                                    <MealIcon size={16} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm">{m._id.day}</span>
                                                    <span className="text-xs text-muted">{m._id.mealType}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-black text-base">{m.avgRating.toFixed(1)}</span>
                                                <StarDisplay value={m.avgRating} />
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm font-medium">{m.totalCount}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1 text-emerald-600 text-xs font-bold">
                                                    <ThumbsUp size={12} /> {m.likeCount}
                                                </div>
                                                <div className="flex items-center gap-1 text-red-500 text-xs font-bold">
                                                    <ThumbsDown size={12} /> {m.dislikeCount}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <Badge variant={m.avgRating >= 4 ? 'active' : m.avgRating >= 3 ? 'warning' : 'inactive'}>
                                                {m.avgRating >= 4 ? 'Popular' : m.avgRating >= 3 ? 'Average' : 'Below Average'}
                                            </Badge>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default MealRatings;

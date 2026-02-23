const Feedback = require('../models/Feedback');

// ─── STUDENT: Submit or update feedback (upsert) ──────────────────────────────
// POST /api/feedback
const submitFeedback = async (req, res) => {
    try {
        const { day, mealType, rating, liked, comment } = req.body;

        if (!day || !mealType || !rating) {
            return res.status(400).json({ message: 'day, mealType and rating are required' });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5' });
        }

        // Upsert: update if exists (same student/day/mealType), create otherwise
        const feedback = await Feedback.findOneAndUpdate(
            { student: req.student._id, day, mealType },
            { rating, liked, comment: comment?.trim() || '' },
            { new: true, upsert: true, setDefaultsOnInsert: true }
        );

        res.status(200).json({ message: 'Feedback saved', feedback });
    } catch (error) {
        console.error('Submit feedback error:', error);
        res.status(500).json({ message: 'Error saving feedback' });
    }
};

// ─── STUDENT: Get own feedback ────────────────────────────────────────────────
// GET /api/feedback/mine
const getMyFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.find({ student: req.student._id });
        res.json(feedback);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching feedback' });
    }
};

// ─── ADMIN: Get all feedback with filter support ──────────────────────────────
// GET /api/feedback?day=Monday&mealType=Lunch
const getAllFeedback = async (req, res) => {
    try {
        const filter = {};
        if (req.query.day) filter.day = req.query.day;
        if (req.query.mealType) filter.mealType = req.query.mealType;

        const feedback = await Feedback.find(filter)
            .populate('student', 'name rollNo roomNo')
            .sort({ createdAt: -1 });

        res.json(feedback);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching feedback' });
    }
};

// ─── ADMIN: Analytics — average rating per meal, like/dislike counts ──────────
// GET /api/feedback/analytics
const getFeedbackAnalytics = async (req, res) => {
    try {
        const analytics = await Feedback.aggregate([
            {
                $group: {
                    _id: { day: '$day', mealType: '$mealType' },
                    avgRating: { $avg: '$rating' },
                    totalCount: { $sum: 1 },
                    likeCount: { $sum: { $cond: [{ $eq: ['$liked', true] }, 1, 0] } },
                    dislikeCount: { $sum: { $cond: [{ $eq: ['$liked', false] }, 1, 0] } },
                    ratings: { $push: '$rating' },
                },
            },
            { $sort: { avgRating: -1 } },
        ]);

        // Overall stats
        const overall = await Feedback.aggregate([
            {
                $group: {
                    _id: null,
                    totalFeedback: { $sum: 1 },
                    avgRating: { $avg: '$rating' },
                    totalLikes: { $sum: { $cond: [{ $eq: ['$liked', true] }, 1, 0] } },
                    totalDislikes: { $sum: { $cond: [{ $eq: ['$liked', false] }, 1, 0] } },
                },
            },
        ]);

        // Recent comments (last 20)
        const recentComments = await Feedback.find({ comment: { $ne: '' } })
            .populate('student', 'name rollNo')
            .select('student day mealType rating comment createdAt')
            .sort({ createdAt: -1 })
            .limit(20);

        res.json({
            perMeal: analytics,
            overall: overall[0] || { totalFeedback: 0, avgRating: 0 },
            recentComments,
        });
    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({ message: 'Error fetching analytics' });
    }
};

module.exports = { submitFeedback, getMyFeedback, getAllFeedback, getFeedbackAnalytics };

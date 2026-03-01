const MealRating = require('../models/MealRating');

// ─── ADMIN: Get analytics ─────────────────────────────────────────────────────
// GET /api/ratings/analytics
const getAnalytics = async (req, res) => {
    try {
        const analytics = await MealRating.aggregate([
            {
                $group: {
                    _id: { day: "$day", mealType: "$mealType" },
                    averageRating: { $avg: "$rating" },
                    totalRatings: { $sum: 1 },
                    comments: { $push: { rating: "$rating", comment: "$comment", date: "$date" } }
                }
            }
        ]).sort({ "_id.day": 1, "_id.mealType": 1 });

        res.json(analytics);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching analytics' });
    }
};

// ─── STUDENT: Submit rating ───────────────────────────────────────────────────
// POST /api/ratings
const submitRating = async (req, res) => {
    try {
        const { day, mealType, rating, comment } = req.body;
        const studentId = req.student._id;

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        // check if already rated today for this meal
        const existingRating = await MealRating.findOne({
            student: studentId,
            day,
            mealType,
            createdAt: { $gte: startOfDay }
        });

        if (existingRating) {
            existingRating.rating = rating;
            existingRating.comment = comment;
            await existingRating.save();
            return res.json(existingRating);
        }

        const newRating = await MealRating.create({
            student: studentId,
            day,
            mealType,
            rating,
            comment,
            date: new Date()
        });

        res.status(201).json(newRating);
    } catch (error) {
        res.status(500).json({ message: 'Error submitting rating' });
    }
};

// GET /api/ratings/student
const getStudentRatingsToday = async (req, res) => {
    try {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const ratings = await MealRating.find({
            student: req.student._id,
            createdAt: { $gte: startOfDay }
        });
        res.json(ratings);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching student ratings' });
    }
};

module.exports = { submitRating, getAnalytics, getStudentRatingsToday };

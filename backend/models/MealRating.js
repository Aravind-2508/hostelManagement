const mongoose = require('mongoose');

const mealRatingSchema = mongoose.Schema(
    {
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Student',
            required: true
        },
        day: {
            type: String,
            required: true,
            enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
        },
        mealType: {
            type: String,
            required: true,
            enum: ['Breakfast', 'Lunch', 'Dinner']
        },
        rating: {
            type: Number,
            required: true,
            min: 1,
            max: 5
        },
        comment: { type: String },
        date: {
            type: Date,
            default: Date.now
        }
    },
    { timestamps: true }
);

// Prevent multiple ratings from the same student for the same meal on the same day
mealRatingSchema.index({ student: 1, day: 1, mealType: 1, date: 1 }, { unique: false });

const MealRating = mongoose.model('MealRating', mealRatingSchema);
module.exports = MealRating;
